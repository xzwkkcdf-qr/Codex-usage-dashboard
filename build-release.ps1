$ErrorActionPreference = 'Stop'

$projectDir = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$projectFile = Join-Path $projectDir 'CodexUsageDashboard.csproj'
$cacheRoot = Join-Path $projectDir '.release-cache'
$artifactRoot = Join-Path $projectDir 'artifacts'
$packageFileName = 'CodexUsageLedger-v1.0.0-win-x64.zip'
$packageFolder = [System.IO.Path]::GetFileNameWithoutExtension($packageFileName)
$publishDir = Join-Path $cacheRoot 'publish'
$stageDir = Join-Path $cacheRoot $packageFolder
$zipPath = Join-Path $artifactRoot $packageFileName
$checksumPath = Join-Path $artifactRoot ($packageFolder + '.sha256')
$packageCache = Join-Path $cacheRoot 'packages'
$httpCache = Join-Path $cacheRoot 'http'
$tempCache = Join-Path $cacheRoot 'temp'
$dotnetHome = Join-Path $cacheRoot 'dotnet-home'

function Assert-WithinProject {
    param([Parameter(Mandatory = $true)][string]$Path)

    $resolved = [System.IO.Path]::GetFullPath($Path).TrimEnd('\')
    $root = $projectDir.TrimEnd('\')
    if (-not $resolved.StartsWith($root + '\', [System.StringComparison]::OrdinalIgnoreCase) -and $resolved -ne $root) {
        throw ('Refusing to use a path outside the project: ' + $resolved)
    }
    return $resolved
}

function Remove-GeneratedDirectory {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) { return }
    $resolved = Assert-WithinProject $Path
    Remove-Item -LiteralPath $resolved -Recurse -Force
}

function Invoke-Dotnet {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)

    & $dotnetCommand.Source @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw ('dotnet command failed with exit code ' + $LASTEXITCODE + ': ' + ($Arguments -join ' '))
    }
}

if (-not (Test-Path -LiteralPath $projectFile -PathType Leaf)) { throw ('Project file not found: ' + $projectFile) }
$projectDrive = (Get-Item -LiteralPath $projectDir).PSDrive.Name
if ([string]::Equals($projectDrive, 'C', [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Release output and caches must not run from C drive.'
}

$dotnetCommand = Get-Command dotnet -ErrorAction SilentlyContinue
if (-not $dotnetCommand) { throw 'dotnet was not found. Install .NET 10 SDK first.' }

foreach ($path in @($cacheRoot, $packageCache, $httpCache, $tempCache, $dotnetHome, $artifactRoot)) {
    New-Item -ItemType Directory -Path (Assert-WithinProject $path) -Force | Out-Null
}

# Keep every restore, HTTP cache, temporary file, and CLI state on the project drive.
$env:NUGET_PACKAGES = $packageCache
$env:NUGET_HTTP_CACHE_PATH = $httpCache
$env:TEMP = $tempCache
$env:TMP = $tempCache
$env:DOTNET_CLI_HOME = $dotnetHome
$env:DOTNET_NOLOGO = '1'

Write-Host 'Running release contract tests...' -ForegroundColor Cyan
& (Join-Path $projectDir 'tests\release-contract.ps1')
& (Join-Path $projectDir 'tests\ui-contract.ps1')

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) {
    & $nodeCommand.Source --check (Join-Path $projectDir 'wwwroot\app.js')
    if ($LASTEXITCODE -ne 0) { throw 'JavaScript syntax check failed.' }
}

Write-Host 'Restoring .NET dependencies into E-drive cache...' -ForegroundColor Cyan
$restoreArguments = @('restore', $projectFile, '--nologo', '--force-evaluate', '--ignore-failed-sources', '--packages', $packageCache)
$offlineConfig = Join-Path $cacheRoot 'offline.config'
if (Test-Path -LiteralPath $offlineConfig -PathType Leaf) {
    $restoreArguments += @('--configfile', $offlineConfig)
} else {
    $restoreArguments += @('--source', 'https://api.nuget.org/v3/index.json')
}
Invoke-Dotnet $restoreArguments

Write-Host 'Publishing self-contained Windows x64 package...' -ForegroundColor Cyan
Remove-GeneratedDirectory $publishDir
Remove-GeneratedDirectory $stageDir
$publishArguments = @(
    'publish', $projectFile,
    '--configuration', 'Release',
    '--runtime', 'win-x64',
    '--self-contained', 'true',
    '--no-restore',
    '--nologo',
    '--output', $publishDir,
    '-p:Version=1.0.0'
)
Invoke-Dotnet $publishArguments

New-Item -ItemType Directory -Path $stageDir -Force | Out-Null
foreach ($item in Get-ChildItem -LiteralPath $publishDir -Force) {
    Copy-Item -LiteralPath $item.FullName -Destination $stageDir -Recurse -Force
}
$excludedItems = @('.open-design.json', 'package.json', 'pnpm-lock.yaml', 'evidence', 'docs', 'tests', 'bin', 'obj')
foreach ($name in $excludedItems) {
    $candidate = Join-Path $stageDir $name
    if (Test-Path -LiteralPath $candidate) { Remove-Item -LiteralPath $candidate -Recurse -Force }
}
Get-ChildItem -LiteralPath $stageDir -Recurse -File | Where-Object { $_.Extension -in @('.pdb', '.log', '.jsonl') } | Remove-Item -Force
Copy-Item -LiteralPath (Join-Path $projectDir 'LICENSE.txt') -Destination $stageDir -Force
Copy-Item -LiteralPath (Join-Path $projectDir 'assets\codex-usage-ledger.svg') -Destination $stageDir -Force
Copy-Item -LiteralPath (Join-Path $projectDir 'release-assets\使用说明.txt') -Destination $stageDir -Force
Copy-Item -LiteralPath (Join-Path $projectDir 'release-assets\版本信息.txt') -Destination $stageDir -Force

Write-Host 'Scanning staged files for local paths and sensitive artifacts...' -ForegroundColor Cyan
$textExtensions = @('.txt', '.html', '.css', '.js', '.json', '.xml', '.config', '.deps.json', '.runtimeconfig.json')
$privacyPattern = '(?i)[A-Z]:\\Users\\|[A-Z]:\\[^\r\n]{0,160}(?:TPS助手|CodexUsageDashboard)|\.jsonl\b|api[ _-]?key\s*[:=]|sk-[A-Za-z0-9]{20,}'
foreach ($file in Get-ChildItem -LiteralPath $stageDir -Recurse -File) {
    if ($textExtensions -notcontains $file.Extension.ToLowerInvariant()) { continue }
    $content = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop
    if ($content -match $privacyPattern) {
        throw ('Privacy scan failed for staged file: ' + $file.FullName)
    }
}

Remove-Item -LiteralPath $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $checksumPath -Force -ErrorAction SilentlyContinue
Write-Host 'Creating portable ZIP...' -ForegroundColor Cyan
Compress-Archive -LiteralPath $stageDir -DestinationPath $zipPath -CompressionLevel Optimal -Force
$hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
($hash + '  ' + (Split-Path -Leaf $zipPath)) | Set-Content -LiteralPath $checksumPath -Encoding ascii

$zipInfo = Get-Item -LiteralPath $zipPath
Write-Host ('Release package: ' + $zipInfo.FullName) -ForegroundColor Green
Write-Host ('Size: ' + [math]::Round($zipInfo.Length / 1MB, 2) + ' MB') -ForegroundColor Green
Write-Host ('SHA-256: ' + $hash) -ForegroundColor Green
