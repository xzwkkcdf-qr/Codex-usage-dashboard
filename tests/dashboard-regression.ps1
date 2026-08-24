$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$appJs = Get-Content -LiteralPath (Join-Path $projectDir 'wwwroot\app.js') -Raw
$indexHtml = Get-Content -LiteralPath (Join-Path $projectDir 'wwwroot\index.html') -Raw
$program = Get-Content -LiteralPath (Join-Path $projectDir 'Program.cs') -Raw
$startScript = Get-Content -LiteralPath (Join-Path $projectDir 'start-dashboard.ps1') -Raw

if ($program -match '/api/usage|OPENAI_ADMIN_API_KEY|AddHttpClient|HttpRequestMessage' -or
    $appJs -match '/api/usage|source === ''api''|Organization Usage API' -or
    $indexHtml -match 'Organization Usage API|id="source"' -or
    (Get-Content -LiteralPath (Join-Path $projectDir 'README.md') -Raw) -match 'Organization Usage API|OPENAI_ADMIN_API_KEY') {
    throw 'REGRESSION: the dashboard must be local-log-only with no Organization Usage API or API key path.'
}
if ($startScript -notmatch 'DashboardRuntime' -or $startScript -notmatch '\.Source.*build' -or $startScript -notmatch 'OutputPath') {
    throw 'REGRESSION: the launcher must build the latest dashboard into an isolated runtime directory.'
}
if ($startScript -notmatch 'existingHealth\.ok' -or
    $startScript -notmatch 'existingHealth\.localLogs' -or
    $startScript -notmatch 'Stop-Process\s+-Id\s+\$existingListener\.OwningProcess') {
    throw 'REGRESSION: the launcher must identify and replace an existing local dashboard instance.'
}

$presetListener = [Regex]::Match($appJs, "\$\('preset'\)\.addEventListener\('change',\s*\(\)\s*=>\s*\{([^}]*)\}\)")
if (-not $presetListener.Success -or $presetListener.Groups[1].Value -notmatch 'reloadFromFilter|loadUsage') {
    throw 'REGRESSION: changing the date preset must reload usage data.'
}
if ($program -notmatch 'FileShare\.ReadWrite') {
    throw 'REGRESSION: active Codex session logs must be opened with FileShare.ReadWrite.'
}
if ($indexHtml -notmatch '<option value="today"[^>]*>今天</option>' -or
    $indexHtml -notmatch '<option value="since"[^>]*>从使用以来</option>' -or
    -not $appJs.Contains("preset === 'today'") -or
    -not $appJs.Contains("preset === 'since'")) {
    throw 'REGRESSION: the date presets must include today and since-first-use options.'
}
if (-not $appJs.Contains('function formatChartDate') -or -not $appJs.Contains('duration <= 36 * 3600')) {
    throw 'REGRESSION: chart labels must adapt to short date ranges.'
}
if ($appJs -notmatch 'MODEL_PRICING_HISTORY' -or $appJs -notmatch 'calculateReferenceCost' -or $appJs -notmatch 'pricingEvents' -or $appJs -notmatch 'effectiveFrom' -or $indexHtml -match 'referenceInput|referenceCached|referenceOutput') {
    throw 'REGRESSION: pricing must use timestamped built-in official price history without manual reference inputs.'
}
foreach ($marker in @(
    "effectiveFrom: '2026-03-17T00:00:00Z'",
    "effectiveFrom: '2026-04-24T00:00:00Z'",
    "effectiveFrom: '2026-07-09T00:00:00Z'",
    "effectiveTo: '2026-07-30T00:00:00Z'",
    "effectiveFrom: '2025-09-29T10:00:00Z'",
    "effectiveFrom: '2026-08-16T16:00:00Z'",
    'confirmedReferenceCost',
    'pricedTokens',
    'coverage',
    'unknownEvents'
)) {
    if ($appJs -notmatch [regex]::Escape($marker)) { throw "REGRESSION: missing pricing history or partial coverage marker: $marker" }
}
if ($appJs -match 'const totalCost = complete \?') {
    throw 'REGRESSION: a single unknown historical event must not hide all confirmed pricing.'
}
if ($appJs -notmatch '<rect class="chart-bar"' -or $appJs -match 'chart-line|chart-area' -or $appJs -notmatch 'uncachedInputTokens') {
    throw 'REGRESSION: usage trend must render one stacked bar per time bucket.'
}
if ($appJs -notmatch 'function getChartStep' -or
    $appJs -notmatch 'rangeDuration > 36 \* 3600' -or
    $appJs -notmatch 'function buildChartBuckets' -or
    $appJs -notmatch 'shiftLocalBucket' -or
    $appJs -notmatch 'const slotWidth = plotWidth / Math\.max\(1, grouped\.length\)' -or
    $appJs -notmatch 'index \+ \.5' -or
    $appJs -notmatch '86400' -or
    $appJs -match 'item\.startTime - minTime' -or
    $appJs -match 'nearestGap - 3') {
    throw 'REGRESSION: long ranges must use evenly spaced daily slots and short ranges hourly slots.'
}
if ($appJs -notmatch 'const barTotal = ' -or
    $appJs -notmatch 'const share = barTotal' -or
    $appJs -notmatch 'formatPercent\(share \* 100\)') {
    throw 'REGRESSION: chart hover details must show each segment share of its time bucket.'
}
if ($appJs -notmatch 'Math\.min\(22, Math\.max\(1, slotWidth - 4\)\)' -or
    $appJs -notmatch 'formatChartPeriod\(item\.startTime, item\.endTime, chartStep\)') {
    throw 'REGRESSION: evenly spaced chart slots must use a capped fixed-width bar and retain period details.'
}
if ($indexHtml -notmatch 'modelDonut|donutLegend|chartHeading' -or $appJs -notmatch 'function renderModelDonut' -or $appJs -notmatch 'state\.chartModel') {
    throw 'REGRESSION: model donut selection must drive the single detail chart.'
}
if (-not $indexHtml.Contains('id="billingDetails"') -or
    -not $indexHtml.Contains('id="billingDialog"') -or
    -not $indexHtml.Contains('id="billingRows"') -or
    $appJs -notmatch 'function renderBillingDetails' -or
    $appJs -notmatch 'showModal\(\)' -or
    $appJs -notmatch 'billingRows') {
    throw 'REGRESSION: the current billing detail dialog must be available for audit.'
}
if (-not $indexHtml.Contains('id="currencyToggle"') -or
    -not $indexHtml.Contains('id="packageCurrencyLabel"') -or
    -not $indexHtml.Contains('class="price-label-text"') -or
    -not $indexHtml.Contains('id="currencyRateNote"') -or
    -not $indexHtml.Contains('id="priceUnitInput"') -or
    -not $indexHtml.Contains('id="billingUnit"') -or
    $appJs -notmatch 'CURRENCY_RATES' -or
    $appJs -notmatch 'state\.packagePriceUsd' -or
    $appJs -notmatch 'function setCurrency') {
    throw 'REGRESSION: all price-related content must support the USD/CNY display switch.'
}

$codexRoot = Join-Path $PSScriptRoot 'fixtures\luna-codex'
$encodedRoot = [Uri]::EscapeDataString($codexRoot)
$start = [DateTimeOffset]::Parse('2026-08-18T00:00:00Z').ToUnixTimeSeconds()
$end = [DateTimeOffset]::Parse('2026-08-18T00:03:00Z').ToUnixTimeSeconds()
$serverUrl = if ($env:DASHBOARD_TEST_URL) { $env:DASHBOARD_TEST_URL.TrimEnd('/') } else { 'http://127.0.0.1:5188' }
$url = "$serverUrl/api/local-usage?codexHome=$encodedRoot&start=$start&end=$end&bucketWidth=1m&includeArchived=false"
$payload = (Invoke-WebRequest -UseBasicParsing $url).Content | ConvertFrom-Json
$luna = @($payload.models | Where-Object { $_.model -eq 'gpt-5.6-luna' })
if ($luna.Count -ne 1) { throw "REGRESSION: expected gpt-5.6-luna, got $($payload.models.model -join ', ')." }
if ($luna[0].totalTokens -ne 220) { throw "REGRESSION: expected 220 total tokens, got $($luna[0].totalTokens)." }
if (-not $payload.PSObject.Properties.Name.Contains('pricingEvents')) { throw 'REGRESSION: local reports must include timestamped pricing events.' }

'REGRESSION TESTS PASSED'
