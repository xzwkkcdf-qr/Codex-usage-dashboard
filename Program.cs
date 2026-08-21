// Project author: 可可和茶多酚
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient("openai", client =>
{
    client.BaseAddress = new Uri("https://api.openai.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
});

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context => context.Context.Response.Headers.CacheControl = "no-store, no-cache, must-revalidate"
});

app.MapGet("/api/health", () => Results.Ok(new
{
    ok = true,
    localLogs = DiscoverSessionFiles(ResolveCodexHome(), true).Count > 0,
    codexHome = ResolveCodexHome(),
    serverTime = DateTimeOffset.UtcNow
}));

app.MapGet("/api/local-usage", (HttpRequest request) =>
{
    var end = ParseUnix(request.Query["end"]) ?? DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    var start = ParseUnix(request.Query["start"]) ?? end - 24 * 60 * 60;
    if (start >= end) return Results.BadRequest(new { error = "开始时间必须早于结束时间。" });
    var bucketWidth = NormalizeBucket(request.Query["bucketWidth"]);
    var includeArchived = !string.Equals(request.Query["includeArchived"], "false", StringComparison.OrdinalIgnoreCase);
    var home = ResolveCodexHome(request.Query["codexHome"]);
    var model = request.Query["model"].ToString();
    return Results.Ok(BuildLocalReport(DateTimeOffset.FromUnixTimeSeconds(start), DateTimeOffset.FromUnixTimeSeconds(end), bucketWidth, home, includeArchived, model));
});

app.MapGet("/api/usage", async (HttpRequest request, IHttpClientFactory httpClientFactory, CancellationToken cancellationToken) =>
{
    var apiKey = Environment.GetEnvironmentVariable("OPENAI_ADMIN_API_KEY");
    if (string.IsNullOrWhiteSpace(apiKey)) return Results.Json(new { configured = false, error = "未检测到 OPENAI_ADMIN_API_KEY。" }, statusCode: StatusCodes.Status503ServiceUnavailable);
    var end = ParseUnix(request.Query["end"]) ?? DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    var start = ParseUnix(request.Query["start"]) ?? end - 24 * 60 * 60;
    var bucketWidth = NormalizeBucket(request.Query["bucketWidth"]);
    var limit = ParseLimit(request.Query["limit"], bucketWidth);
    var groupBy = NormalizeGroupBy(request.Query["groupBy"]);
    var model = request.Query["model"].ToString();
    var query = new List<string> { $"start_time={start}", $"end_time={end}", $"bucket_width={bucketWidth}", $"limit={limit}" };
    foreach (var group in groupBy) query.Add($"group_by[]={Uri.EscapeDataString(group)}");
    if (!string.IsNullOrWhiteSpace(model)) query.Add($"models[]={Uri.EscapeDataString(model)}");
    var client = httpClientFactory.CreateClient("openai");
    using var message = new HttpRequestMessage(HttpMethod.Get, $"v1/organization/usage/completions?{string.Join("&", query)}");
    message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
    using var response = await client.SendAsync(message, cancellationToken);
    var body = await response.Content.ReadAsStringAsync(cancellationToken);
    if (!response.IsSuccessStatusCode) return Results.Json(new { configured = true, error = TryGetApiError(body) ?? $"OpenAI Usage API 返回 HTTP {(int)response.StatusCode}。" }, statusCode: StatusCodes.Status502BadGateway);
    var payload = JsonSerializer.Deserialize<UsagePage>(body, JsonOptions.Default) ?? new UsagePage();
    var buckets = payload.Data.Select(bucket => new
    {
        startTime = bucket.StartTime,
        endTime = bucket.EndTime,
        results = bucket.Results.Select(result => new
        {
            model = result.Model ?? "未分组",
            inputTokens = result.InputTokens ?? 0,
            cachedInputTokens = result.InputCachedTokens ?? 0,
            cacheWriteInputTokens = result.InputCacheWriteTokens ?? 0,
            nonCachedInputTokens = result.InputUncachedTokens ?? Math.Max((result.InputTokens ?? 0) - (result.InputCachedTokens ?? 0), 0),
            outputTokens = result.OutputTokens ?? 0,
            reasoningOutputTokens = 0L,
            totalTokens = (result.InputTokens ?? 0) + (result.OutputTokens ?? 0),
            requests = result.NumModelRequests ?? 0,
            sessions = 0
        })
    });
    return Results.Ok(new { configured = true, source = "organization-usage-api", fetchedAt = DateTimeOffset.UtcNow, query = new { start, end, bucketWidth, limit, groupBy, model }, buckets });
});

app.MapFallbackToFile("index.html");
app.Run();

static object BuildLocalReport(DateTimeOffset start, DateTimeOffset end, string bucketWidth, string home, bool includeArchived, string modelFilter = "")
{
    var modelTotals = new Dictionary<string, UsageAggregate>(StringComparer.OrdinalIgnoreCase);
    var timeline = new Dictionary<long, Dictionary<string, UsageAggregate>>();
    var sessionCount = 0;
    var tokenEventCount = 0;
    var total = new UsageAggregate("全部");
    foreach (var path in DiscoverSessionFiles(home, includeArchived))
    {
        var events = ReadTokenEvents(path);
        if (events.Count == 0) continue;
        var inWindow = events.Where(item => item.Timestamp >= start && item.Timestamp <= end).ToList();
        if (inWindow.Count == 0) continue;
        var previous = events.LastOrDefault(item => item.Timestamp < start)?.Usage ?? new UsageSnapshot();
        var sessionName = Path.GetFileName(path);
        var sessionModels = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var item in inWindow)
        {
            var delta = UsageSnapshot.Delta(item.Usage, previous);
            previous = item.Usage;
            if (delta.TotalTokens <= 0) continue;
            var model = string.IsNullOrWhiteSpace(item.Model) ? "未记录模型" : item.Model!;
            if (!ModelMatches(model, modelFilter)) continue;
            Add(modelTotals, model, delta, sessionName);
            var bucketStart = FloorBucket(item.Timestamp, bucketWidth).ToUnixTimeSeconds();
            if (!timeline.TryGetValue(bucketStart, out var bucketRows)) timeline[bucketStart] = bucketRows = new Dictionary<string, UsageAggregate>(StringComparer.OrdinalIgnoreCase);
            Add(bucketRows, model, delta, sessionName);
            total.Add(delta, sessionName);
            sessionModels.Add(model);
            tokenEventCount++;
        }
        if (sessionModels.Count > 0) sessionCount++;
    }
    var modelRows = modelTotals.Values.OrderByDescending(item => item.TotalTokens).Select(ToDto).ToList();
    var buckets = timeline.OrderBy(item => item.Key).Select(item => new
    {
        startTime = item.Key,
        endTime = item.Key + BucketSeconds(bucketWidth),
        results = item.Value.Values.OrderByDescending(row => row.TotalTokens).Select(ToDto).ToList()
    }).ToList();
    return new
    {
        configured = true,
        source = "local-codex-logs",
        fetchedAt = DateTimeOffset.UtcNow,
        sourceRoot = home,
        query = new { start = start.ToUnixTimeSeconds(), end = end.ToUnixTimeSeconds(), bucketWidth, includeArchived },
        summary = new { sessionCount, tokenEventCount, inputTokens = total.InputTokens, cachedInputTokens = total.CachedInputTokens, cacheWriteInputTokens = total.CacheWriteInputTokens, nonCachedInputTokens = total.NonCachedInputTokens, outputTokens = total.OutputTokens, reasoningOutputTokens = total.ReasoningOutputTokens, totalTokens = total.TotalTokens, requests = total.Requests },
        models = modelRows,
        buckets
    };
}

static bool ModelMatches(string model, string filter)
{
    if (string.IsNullOrWhiteSpace(filter)) return true;
    if (model.Contains(filter, StringComparison.OrdinalIgnoreCase)) return true;
    static string Compact(string value) => new string(value.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
    return Compact(model).Contains(Compact(filter), StringComparison.Ordinal);
}

static List<string> DiscoverSessionFiles(string home, bool includeArchived)
{
    var candidates = new List<string>();
    var sessions = Path.Combine(home, "sessions");
    if (Directory.Exists(sessions)) candidates.AddRange(Directory.EnumerateFiles(sessions, "*.jsonl", SearchOption.AllDirectories));
    var archived = Path.Combine(home, "archived_sessions");
    if (includeArchived && Directory.Exists(archived)) candidates.AddRange(Directory.EnumerateFiles(archived, "*.jsonl", SearchOption.TopDirectoryOnly));
    var selected = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    foreach (var path in candidates)
    {
        var name = Path.GetFileName(path);
        if (!selected.TryGetValue(name, out var oldPath) || new FileInfo(path).Length > new FileInfo(oldPath).Length) selected[name] = path;
    }
    return selected.Values.ToList();
}

static List<LocalTokenEvent> ReadTokenEvents(string path)
{
    var events = new List<LocalTokenEvent>();
    string? model = null;
    try
    {
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        using var reader = new StreamReader(stream);
        while (reader.ReadLine() is { } line)
        {
            if (!line.Contains("token_count", StringComparison.Ordinal) && !line.Contains("thread_settings_applied", StringComparison.Ordinal) && !line.Contains("world_state", StringComparison.Ordinal) && !line.Contains("turn_context", StringComparison.Ordinal)) continue;
            try
            {
                using var document = JsonDocument.Parse(line);
                var root = document.RootElement;
                if (!root.TryGetProperty("payload", out var payload) || payload.ValueKind != JsonValueKind.Object) continue;
                var type = payload.TryGetProperty("type", out var typeValue) ? typeValue.GetString() : ReadString(root, "type");
                var eventModel = ReadEventModel(payload);
                if (!string.IsNullOrWhiteSpace(eventModel))
                {
                    model = eventModel;
                    foreach (var item in events.Where(item => item.Model is null)) item.Model = model;
                }
                if (type != "token_count" || !payload.TryGetProperty("info", out var info) || info.ValueKind != JsonValueKind.Object || !info.TryGetProperty("total_token_usage", out var usage) || usage.ValueKind != JsonValueKind.Object) continue;
                var totalTokens = ReadLong(usage, "total_tokens");
                if (totalTokens <= 0 || !root.TryGetProperty("timestamp", out var timestampValue) || !DateTimeOffset.TryParse(timestampValue.GetString(), out var timestamp)) continue;
                events.Add(new LocalTokenEvent(timestamp, new UsageSnapshot(ReadLong(usage, "input_tokens"), ReadLong(usage, "cached_input_tokens"), ReadLong(usage, "cache_write_input_tokens"), ReadLong(usage, "output_tokens"), ReadLong(usage, "reasoning_output_tokens"), totalTokens), model));
            }
            catch (JsonException) { }
        }
    }
    catch (IOException) { }
    foreach (var item in events.Where(item => item.Model is null)) item.Model = model;
    return events.OrderBy(item => item.Timestamp).ToList();
}

static string? ReadEventModel(JsonElement payload)
{
    if (payload.TryGetProperty("thread_settings", out var settings) && settings.ValueKind == JsonValueKind.Object)
        return ReadString(settings, "model");
    if (payload.TryGetProperty("state", out var state) && state.ValueKind == JsonValueKind.Object)
    {
        var stateModel = ReadString(state, "model");
        if (!string.IsNullOrWhiteSpace(stateModel)) return stateModel;
        if (state.TryGetProperty("collaboration_mode", out var stateCollaboration) && stateCollaboration.ValueKind == JsonValueKind.Object)
        {
            var collaborationModel = ReadString(stateCollaboration, "model");
            if (!string.IsNullOrWhiteSpace(collaborationModel)) return collaborationModel;
            if (stateCollaboration.TryGetProperty("settings", out var collaborationSettings) && collaborationSettings.ValueKind == JsonValueKind.Object)
                return ReadString(collaborationSettings, "model");
        }
    }
    var directModel = ReadString(payload, "model");
    if (!string.IsNullOrWhiteSpace(directModel)) return directModel;
    if (payload.TryGetProperty("collaboration_mode", out var collaboration) && collaboration.ValueKind == JsonValueKind.Object && collaboration.TryGetProperty("settings", out var settingsValue) && settingsValue.ValueKind == JsonValueKind.Object)
        return ReadString(settingsValue, "model");
    return null;
}

static void Add(Dictionary<string, UsageAggregate> rows, string model, UsageSnapshot delta, string session)
{
    if (!rows.TryGetValue(model, out var row)) rows[model] = row = new UsageAggregate(model);
    row.Add(delta, session);
}

static object ToDto(UsageAggregate row) => new { model = row.Model, inputTokens = row.InputTokens, cachedInputTokens = row.CachedInputTokens, cacheWriteInputTokens = row.CacheWriteInputTokens, nonCachedInputTokens = row.NonCachedInputTokens, outputTokens = row.OutputTokens, reasoningOutputTokens = row.ReasoningOutputTokens, totalTokens = row.TotalTokens, requests = row.Requests, sessions = row.Sessions.Count };
static DateTimeOffset FloorBucket(DateTimeOffset value, string bucket) { var seconds = value.ToUnixTimeSeconds(); var span = BucketSeconds(bucket); return DateTimeOffset.FromUnixTimeSeconds(seconds - seconds % span); }
static long BucketSeconds(string bucket) => bucket switch { "1m" => 60, "1d" => 86400, _ => 3600 };
static string ResolveCodexHome(string? value = null) => Path.GetFullPath(value ?? Environment.GetEnvironmentVariable("CODEX_HOME") ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".codex"));
static long? ParseUnix(string? value) => long.TryParse(value, out var parsed) ? parsed : null;
static string NormalizeBucket(string? value) => value is "1m" or "1h" or "1d" ? value : "1h";
static int ParseLimit(string? value, string bucket) => int.TryParse(value, out var parsed) ? Math.Clamp(parsed, 1, bucket switch { "1m" => 1440, "1h" => 168, _ => 31 }) : bucket switch { "1m" => 1440, "1h" => 168, _ => 31 };
static string[] NormalizeGroupBy(string? value) => (value ?? "model").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).Where(item => item is "model" or "project_id" or "user_id" or "api_key_id" or "service_tier" or "batch").Distinct().Take(3).DefaultIfEmpty("model").ToArray();
static string? ReadString(JsonElement element, string name) => element.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String ? value.GetString() : null;
static long ReadLong(JsonElement element, string name) => element.TryGetProperty(name, out var value) && value.TryGetInt64(out var result) ? result : 0;
static string? TryGetApiError(string body) { try { using var document = JsonDocument.Parse(body); return document.RootElement.TryGetProperty("error", out var error) ? ReadString(error, "message") ?? error.ToString() : body; } catch (JsonException) { return body.Length > 300 ? body[..300] : body; } }

sealed class LocalTokenEvent(DateTimeOffset timestamp, UsageSnapshot usage, string? model)
{
    public DateTimeOffset Timestamp { get; } = timestamp;
    public UsageSnapshot Usage { get; } = usage;
    public string? Model { get; set; } = model;
}

sealed class UsageAggregate(string model)
{
    public string Model { get; } = model;
    public long InputTokens { get; private set; }
    public long CachedInputTokens { get; private set; }
    public long CacheWriteInputTokens { get; private set; }
    public long NonCachedInputTokens => Math.Max(InputTokens - CachedInputTokens, 0);
    public long OutputTokens { get; private set; }
    public long ReasoningOutputTokens { get; private set; }
    public long TotalTokens { get; private set; }
    public long Requests { get; private set; }
    public HashSet<string> Sessions { get; } = new(StringComparer.OrdinalIgnoreCase);
    public void Add(UsageSnapshot value, string session) { InputTokens += value.InputTokens; CachedInputTokens += value.CachedInputTokens; CacheWriteInputTokens += value.CacheWriteInputTokens; OutputTokens += value.OutputTokens; ReasoningOutputTokens += value.ReasoningOutputTokens; TotalTokens += value.TotalTokens; Requests++; Sessions.Add(session); }
}

readonly record struct UsageSnapshot(long InputTokens = 0, long CachedInputTokens = 0, long CacheWriteInputTokens = 0, long OutputTokens = 0, long ReasoningOutputTokens = 0, long TotalTokens = 0)
{
    public static UsageSnapshot Delta(UsageSnapshot current, UsageSnapshot previous) => new(Math.Max(current.InputTokens - previous.InputTokens, 0), Math.Max(current.CachedInputTokens - previous.CachedInputTokens, 0), Math.Max(current.CacheWriteInputTokens - previous.CacheWriteInputTokens, 0), Math.Max(current.OutputTokens - previous.OutputTokens, 0), Math.Max(current.ReasoningOutputTokens - previous.ReasoningOutputTokens, 0), Math.Max(current.TotalTokens - previous.TotalTokens, 0));
}

sealed class UsagePage { [JsonPropertyName("data")] public List<UsageBucket> Data { get; init; } = []; }
sealed class UsageBucket { [JsonPropertyName("start_time")] public long StartTime { get; init; } [JsonPropertyName("end_time")] public long EndTime { get; init; } [JsonPropertyName("results")] public List<UsageResult> Results { get; init; } = []; }
sealed class UsageResult
{
    [JsonPropertyName("input_tokens")] public long? InputTokens { get; init; }
    [JsonPropertyName("input_cached_tokens")] public long? InputCachedTokens { get; init; }
    [JsonPropertyName("input_cache_write_tokens")] public long? InputCacheWriteTokens { get; init; }
    [JsonPropertyName("input_uncached_tokens")] public long? InputUncachedTokens { get; init; }
    [JsonPropertyName("output_tokens")] public long? OutputTokens { get; init; }
    [JsonPropertyName("num_model_requests")] public long? NumModelRequests { get; init; }
    [JsonPropertyName("model")] public string? Model { get; init; }
}
static class JsonOptions { public static readonly JsonSerializerOptions Default = new() { PropertyNameCaseInsensitive = true }; }
