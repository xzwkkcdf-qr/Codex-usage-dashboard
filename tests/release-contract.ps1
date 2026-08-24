$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if ($Content -notmatch $Pattern) {
        throw ('RELEASE CONTRACT: ' + $Message)
    }
}

$projectFile = Get-Content -LiteralPath (Join-Path $projectDir 'CodexUsageDashboard.csproj') -Raw
Assert-Contains $projectFile '<AssemblyName>CodexUsageLedger</AssemblyName>' 'the executable must be named CodexUsageLedger.'
Assert-Contains $projectFile '<OutputType>WinExe</OutputType>' 'the portable executable must not open a console window.'
Assert-Contains $projectFile '<Product>Codex Usage Ledger</Product>' 'the Windows product name must be Codex Usage Ledger.'
Assert-Contains $projectFile '<Version>1\.0\.0</Version>' 'the first portable release must be version 1.0.0.'
Assert-Contains $projectFile '<ApplicationIcon>assets\\codex-usage-ledger\.ico</ApplicationIcon>' 'the Windows executable must use the branded icon.'
Assert-Contains $projectFile '<RuntimeIdentifiers>win-x64</RuntimeIdentifiers>' 'the supported portable runtime must be win-x64.'

$ignoreFile = Get-Content -LiteralPath (Join-Path $projectDir '.gitignore') -Raw
Assert-Contains $ignoreFile '(?m)^artifacts/$' 'generated release artifacts must stay out of source control.'
Assert-Contains $ignoreFile '(?m)^\*\.zip$' 'release ZIP files must stay out of source control.'
Assert-Contains $ignoreFile '(?m)^\*\.sha256$' 'checksum files must stay out of source control.'

$requiredFiles = @(
    'assets\codex-usage-ledger.svg',
    'assets\codex-usage-ledger.ico',
    'LICENSE.txt',
    'release-assets\使用说明.txt',
    'release-assets\版本信息.txt'
)
foreach ($relativePath in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $projectDir $relativePath) -PathType Leaf)) {
        throw ('RELEASE CONTRACT: missing required release asset ' + $relativePath + '.')
    }
}

$readme = Get-Content -LiteralPath (Join-Path $projectDir 'README.md') -Raw
Assert-Contains $readme '# Codex Usage Ledger（Codex 用量账簿）' 'README must use the release product name.'
Assert-Contains $readme 'CodexUsageLedger-v1\.0\.0-win-x64\.zip' 'README must explain the portable package.'
Assert-Contains $readme 'CodexUsageLedger\.exe' 'README must tell nontechnical users which program to open.'
Assert-Contains $readme '不上传原始会话' 'README must state the local-only privacy boundary.'

$license = Get-Content -LiteralPath (Join-Path $projectDir 'LICENSE.txt') -Raw
Assert-Contains $license '可可和茶多酚' 'the author attribution must be preserved.'
Assert-Contains $license '不得用于商业用途' 'the noncommercial restriction must be explicit.'
Assert-Contains $license 'Codex 配合 GPT' 'the AI-assisted development statement must be included.'

$program = Get-Content -LiteralPath (Join-Path $projectDir 'Program.cs') -Raw
Assert-Contains $program '--no-browser' 'the portable executable must provide a no-browser option.'
Assert-Contains $program '127\.0\.0\.1:5188' 'the default server must stay on loopback port 5188.'
Assert-Contains $program 'ApplicationStarted' 'the browser must open only after the local server is ready.'
Assert-Contains $program 'explorer\.exe' 'the browser must be opened through the Windows shell automatically.'
Assert-Contains $program 'MessageBox' 'startup errors must be visible without a console window.'
if ($program -match 'Stop-Process|Process\.Kill') {
    throw 'RELEASE CONTRACT: the executable must never kill an unrelated process occupying the port.'
}

$buildScriptPath = Join-Path $projectDir 'build-release.ps1'
if (-not (Test-Path -LiteralPath $buildScriptPath -PathType Leaf)) {
    throw 'RELEASE CONTRACT: build-release.ps1 is required for nontechnical users.'
}
$buildScript = Get-Content -LiteralPath $buildScriptPath -Raw
Assert-Contains $buildScript 'NUGET_PACKAGES' 'release builds must redirect the NuGet package cache.'
Assert-Contains $buildScript 'NUGET_HTTP_CACHE_PATH' 'release builds must redirect the NuGet HTTP cache.'
Assert-Contains $buildScript 'CodexUsageLedger-v1\.0\.0-win-x64\.zip' 'release builds must use the stable portable filename.'
Assert-Contains $buildScript 'Get-FileHash' 'release builds must emit a checksum.'
Assert-Contains $buildScript 'Compress-Archive' 'release builds must create a ZIP.'
Assert-Contains $buildScript 'open-design\.json' 'release builds must exclude AI/design helper metadata.'
Assert-Contains $buildScript 'evidence' 'release builds must exclude local evidence artifacts.'
if ($buildScript -match 'C:\\Users|C:/Users') {
    throw 'RELEASE CONTRACT: the release script must not hard-code a C drive user path.'
}

$workflowPath = Join-Path $projectDir '.github\workflows\release.yml'
if (-not (Test-Path -LiteralPath $workflowPath -PathType Leaf)) {
    throw 'RELEASE CONTRACT: a tag-triggered GitHub Release workflow is required.'
}
$workflow = Get-Content -LiteralPath $workflowPath -Raw
Assert-Contains $workflow 'tags:' 'GitHub Release must be tag-triggered.'
Assert-Contains $workflow 'build-release\.ps1' 'GitHub Release must use the same local package builder.'
Assert-Contains $workflow 'CodexUsageLedger-v1\.0\.0-win-x64\.zip' 'GitHub Release must upload the portable ZIP.'

'RELEASE CONTRACT TESTS PASSED'
