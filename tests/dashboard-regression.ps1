$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$appJs = Get-Content -LiteralPath (Join-Path $projectDir 'wwwroot\app.js') -Raw
$indexHtml = Get-Content -LiteralPath (Join-Path $projectDir 'wwwroot\index.html') -Raw
$program = Get-Content -LiteralPath (Join-Path $projectDir 'Program.cs') -Raw

$presetListener = [Regex]::Match($appJs, "\$\('preset'\)\.addEventListener\('change',\s*\(\)\s*=>\s*\{([^}]*)\}\)")
if (-not $presetListener.Success -or $presetListener.Groups[1].Value -notmatch 'reloadFromFilter|loadUsage') {
    throw 'REGRESSION: changing the date preset must reload usage data.'
}
if ($program -notmatch 'FileShare\.ReadWrite') {
    throw 'REGRESSION: active Codex session logs must be opened with FileShare.ReadWrite.'
}
if ($indexHtml -notmatch '<option value="today">今天</option>' -or $appJs -notmatch "preset === 'today'") {
    throw 'REGRESSION: the date preset must include a today option.'
}
if ($appJs -notmatch 'formatChartDate\(item\.startTime\)' -or $appJs -notmatch 'duration <= 36 \* 3600') {
    throw 'REGRESSION: chart labels must adapt to short date ranges.'
}
if ($appJs -notmatch 'MODEL_PRICING' -or $appJs -notmatch 'calculateReferenceCost' -or $indexHtml -match 'referenceInput|referenceCached|referenceOutput') {
    throw 'REGRESSION: pricing must use the built-in model price table without manual reference inputs.'
}
if ($appJs -notmatch '<rect class="chart-bar"' -or $appJs -match 'chart-line|chart-area' -or $appJs -notmatch 'uncachedInputTokens') {
    throw 'REGRESSION: usage trend must render one stacked bar per time bucket.'
}
if ($indexHtml -notmatch 'modelDonut|donutLegend|chartHeading' -or $appJs -notmatch 'function renderModelDonut' -or $appJs -notmatch 'state\.chartModel') {
    throw 'REGRESSION: model donut selection must drive the single detail chart.'
}

$codexRoot = Join-Path $PSScriptRoot 'fixtures\luna-codex'
$encodedRoot = [Uri]::EscapeDataString($codexRoot)
$start = [DateTimeOffset]::Parse('2026-08-18T00:00:00Z').ToUnixTimeSeconds()
$end = [DateTimeOffset]::Parse('2026-08-18T00:03:00Z').ToUnixTimeSeconds()
$url = "http://127.0.0.1:5188/api/local-usage?codexHome=$encodedRoot&start=$start&end=$end&bucketWidth=1m&includeArchived=false"
$payload = (Invoke-WebRequest -UseBasicParsing $url).Content | ConvertFrom-Json
$luna = @($payload.models | Where-Object { $_.model -eq 'gpt-5.6-luna' })
if ($luna.Count -ne 1) { throw "REGRESSION: expected gpt-5.6-luna, got $($payload.models.model -join ', ')." }
if ($luna[0].totalTokens -ne 220) { throw "REGRESSION: expected 220 total tokens, got $($luna[0].totalTokens)." }

'REGRESSION TESTS PASSED'
