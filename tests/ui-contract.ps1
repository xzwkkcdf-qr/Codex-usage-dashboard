$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$indexHtml = Get-Content -LiteralPath (Join-Path $projectDir 'wwwroot\index.html') -Raw

if ($indexHtml -notmatch '<meta name="theme-color" content="#090a0d">') {
    throw 'UI CONTRACT: browser chrome must match the Night Editorial canvas.'
}
if ($indexHtml -notmatch '<body class="editorial-theme">') {
    throw 'UI CONTRACT: the page must expose the editorial theme hook.'
}
if ($indexHtml -notmatch 'id="liveStatus"[^>]*aria-live="polite"') {
    throw 'UI CONTRACT: live query status must be announced politely.'
}
if ($indexHtml -notmatch 'id="notice"[^>]*role="status"[^>]*aria-live="polite"') {
    throw 'UI CONTRACT: query notices must be announced politely.'
}

$styles = Get-Content -LiteralPath (Join-Path $projectDir 'wwwroot\styles.css') -Raw

foreach ($token in @('--canvas:#090a0d', '--surface:#121419', '--surface-raised:#191c22', '--ink:#eeeae1', '--primary:#c8a96a', '--success:#4f9d76', '--warning:#b98552', '--danger:#b96262')) {
    if ($styles -notmatch [Regex]::Escape($token)) {
        throw "UI CONTRACT: missing Professional dark token $token."
    }
}
if ($styles -notmatch 'color-scheme:\s*dark') {
    throw 'UI CONTRACT: the Professional theme must use dark native controls.'
}
if ($styles -match '#f1eee7|#fbfaf6|--olive:') {
    throw 'UI CONTRACT: warm editorial tokens must not remain in the dark theme.'
}
if ($styles -match 'linear-gradient|radial-gradient') {
    throw 'UI CONTRACT: Professional dark mode must not use decorative gradients.'
}
if ($styles -notmatch '@media\(prefers-reduced-motion:reduce\)') {
    throw 'UI CONTRACT: reduced-motion behavior is required.'
}
if ($styles -notmatch '@media\(max-width:980px\)' -or $styles -notmatch '@media\(max-width:560px\)') {
    throw 'UI CONTRACT: tablet and mobile breakpoints are required.'
}
if ($styles -match 'transition:all') {
    throw 'UI CONTRACT: transitions must name their properties.'
}
if ($styles -notmatch 'Cambria' -or
    $styles -notmatch 'Segoe UI Variable Text' -or
    $styles -notmatch 'Cascadia Mono' -or
    $styles -notmatch 'font-variant-numeric:tabular-nums') {
    throw 'UI CONTRACT: Night Editorial typography must separate display, body, and data roles.'
}
if ($styles -notmatch '\.topbar::after' -or
    $styles -notmatch '\.control-panel::before' -or
    $styles -notmatch '@keyframes signal-pulse') {
    throw 'UI CONTRACT: the Night Editorial signature rail and live signal motion are required.'
}
if ($indexHtml -notmatch '<svg[^>]+class="brand-icon"' -or
    $indexHtml -notmatch '<svg[^>]+class="metric-icon-svg"' -or
    $indexHtml -notmatch 'aria-hidden="true"' -or
    $indexHtml -match '<span class="metric-icon[^>]*>[↓↑◎#]</span>') {
    throw 'UI CONTRACT: the premium UI must use consistent inline SVG icons instead of text glyph icons.'
}
if ($indexHtml -notmatch 'aria-label="关闭计费明细"' -or
    $indexHtml -notmatch 'aria-label="刷新用量"') {
    throw 'UI CONTRACT: actionable icons must retain accessible labels.'
}
if ($styles -notmatch '@keyframes surface-enter' -or
    $styles -notmatch '@keyframes chart-rise' -or
    $styles -notmatch '@keyframes dialog-enter' -or
    $styles -notmatch 'animation-delay' -or
    $styles -match 'transition:\s*all') {
    throw 'UI CONTRACT: premium motion must be explicit, restrained, and never use transition all.'
}
if ($styles -notmatch 'prefers-reduced-motion:reduce' -or
    $styles -notmatch 'chart-layout') {
    throw 'UI CONTRACT: motion fallback and dense chart layout guards are required.'
}

$appJs = Get-Content -LiteralPath (Join-Path $projectDir 'wwwroot\app.js') -Raw

if ($appJs -notmatch 'const TOKEN_COLORS' -or
    $appJs -notmatch "uncached:\s*'#789cc6'" -or
    $appJs -notmatch "cached:\s*'#6fa28b'" -or
    $appJs -notmatch "output:\s*'#c58b5e'") {
    throw 'UI CONTRACT: stacked bars must use the Professional dark data palette.'
}
if ($styles -notmatch 'thead th\s*\{[^}]*position:sticky' -or $styles -notmatch 'top:0') {
    throw 'UI CONTRACT: report tables require sticky headers.'
}
if ($styles -notmatch '\.pricing-panel\s*\{[^}]*height:auto') {
    throw 'UI CONTRACT: pricing content must determine panel height.'
}
if ($styles -notmatch '\.chart-layout\s*\{[^}]*grid-template-columns:210px minmax\(0,1fr\)') {
    throw 'UI CONTRACT: desktop chart must keep a compact donut beside one detail chart.'
}
if ($styles -notmatch '\.donut-legend::-webkit-scrollbar[^}]*display:none' -or
    $styles -notmatch 'scrollbar-width:none' -or
    $styles -notmatch 'color-scheme:dark') {
    throw 'UI CONTRACT: model distribution scrolling must use a restrained compact scrollbar.'
}
if ($styles -notmatch '\.price-unavailable\s*\{[^}]*color:var\(--faint\)' -or
    $appJs -notmatch 'renderUnitPrice' -or
    $appJs -notmatch 'formatMoney\(actual\)') {
    throw 'UI CONTRACT: official unit prices and unavailable price states must remain explicit.'
}
if ($indexHtml -match '套餐预估成本|预估 / 官方|分配 / 官方' -or
    $appJs -match '套餐预估单价|actual \* scale') {
    throw 'UI CONTRACT: model price rows must not present estimated or allocated unit prices.'
}
if ($indexHtml -notmatch 'class="language-select"' -or
    $indexHtml -notmatch 'id="languageToggle"[^>]*aria-haspopup="listbox"' -or
    $indexHtml -notmatch 'id="languageMenu"[^>]*role="listbox"' -or
    $indexHtml -notmatch 'data-language="zh-CN"[^>]*>中文</button>' -or
    $indexHtml -notmatch 'data-language="en-US"[^>]*>English</button>' -or
    $indexHtml -notmatch 'data-i18n="' -or
    $appJs -notmatch 'TRANSLATIONS' -or
    $appJs -notmatch 'localStorage' -or
    $appJs -notmatch 'applyLanguage' -or
    $appJs -notmatch "'zh-CN'" -or
    $appJs -notmatch "'en-US'") {
    throw 'UI CONTRACT: the dashboard must provide a persistent Chinese/English language switch.'
}
if ($appJs -notmatch "classList\.add\('is-loading'\)" -or
    $appJs -notmatch "classList\.remove\('is-loading'\)") {
    throw 'UI CONTRACT: usage queries must expose a visible loading state.'
}
if ($styles -match 'font-size:9px' -or
    $styles -notmatch '\.language-option\[aria-selected="true"\]' -or
    $styles -notmatch '\.helper\s*\{[^}]*font-size:12px' -or
    $styles -notmatch 'thead th\s*\{[^}]*font-size:11px' -or
    $styles -notmatch 'td\s*\{[^}]*font-size:13px') {
    throw 'UI CONTRACT: the custom language menu must use the theme selection color and text must remain readable.'
}
if ($indexHtml -notmatch 'class="choice-select" data-select-id="preset"' -or
    $indexHtml -notmatch 'class="choice-select" data-select-id="bucket"' -or
    $styles -notmatch '\.choice-option\[aria-selected="true"\]' -or
    $appJs -notmatch 'function syncChoiceSelect' -or
    $appJs -notmatch 'dispatchEvent\(new Event\(''change''') {
    throw 'UI CONTRACT: time range and granularity must use the themed custom dropdown behavior.'
}

'UI CONTRACT TESTS PASSED'
