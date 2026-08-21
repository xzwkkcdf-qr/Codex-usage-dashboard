$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$indexHtml = Get-Content -LiteralPath (Join-Path $projectDir 'wwwroot\index.html') -Raw

if ($indexHtml -notmatch '<meta name="theme-color" content="#0b0d12">') {
    throw 'UI CONTRACT: browser chrome must match the Professional dark canvas.'
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

foreach ($token in @('--canvas:#0b0d12', '--surface:#12151c', '--surface-raised:#181c24', '--ink:#f3f4f6', '--primary:#fece14', '--success:#16a34a', '--warning:#d97706', '--danger:#dc2626')) {
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
if ($styles -notmatch 'Segoe UI Variable Text' -or
    $styles -notmatch 'Segoe UI Variable Display' -or
    $styles -notmatch 'font-variant-numeric:tabular-nums') {
    throw 'UI CONTRACT: premium typography must use the approved local font hierarchy and tabular numbers.'
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
    $appJs -notmatch "uncached:\s*'#60a5fa'" -or
    $appJs -notmatch "cached:\s*'#34d399'" -or
    $appJs -notmatch "output:\s*'#fb923c'") {
    throw 'UI CONTRACT: stacked bars must use the Professional dark data palette.'
}
if ($styles -notmatch 'thead th\s*\{[^}]*position:sticky' -or $styles -notmatch 'top:0') {
    throw 'UI CONTRACT: report tables require sticky headers.'
}
if ($styles -notmatch '\.pricing-panel\s*\{[^}]*height:auto') {
    throw 'UI CONTRACT: pricing content must determine panel height.'
}
if ($styles -notmatch '\.chart-layout\s*\{[^}]*grid-template-columns:196px minmax\(0,1fr\)') {
    throw 'UI CONTRACT: desktop chart must keep a compact donut beside one detail chart.'
}

'UI CONTRACT TESTS PASSED'
