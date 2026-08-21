$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Join-Path $projectDir 'CodexUsageDashboard.csproj'
$runtimeRoot = Join-Path $projectDir 'bin\DashboardRuntime'
$url = 'http://127.0.0.1:5188'
$browserUrl = $url + '/?v=20260821-05'
$stdoutLog = Join-Path $projectDir 'dashboard-server.log'
$stderrLog = Join-Path $projectDir 'dashboard-server-error.log'

try {
    $dotnetCommand = Get-Command dotnet -ErrorAction SilentlyContinue
    if (-not $dotnetCommand) { throw 'dotnet was not found. Install .NET 10 first.' }
    if (-not (Test-Path -LiteralPath $project)) { throw ('Project file not found: ' + $project) }

    $existingListener = Get-NetTCPConnection -LocalPort 5188 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($existingListener) {
        $owner = Get-Process -Id $existingListener.OwningProcess -ErrorAction SilentlyContinue
        $ownerName = if ($owner) { $owner.ProcessName + ' (PID ' + $owner.Id + ')' } else { 'PID ' + $existingListener.OwningProcess }
        $existingHealth = $null
        try {
            $existingHealth = Invoke-RestMethod -Uri ($url + '/api/health') -TimeoutSec 2
        } catch { }

        if ($existingHealth -and $existingHealth.ok -eq $true -and $existingHealth.localLogs -eq $true) {
            Write-Host ('Replacing the old dashboard instance: ' + $ownerName) -ForegroundColor Cyan
            Stop-Process -Id $existingListener.OwningProcess -Force -ErrorAction Stop
            for ($attempt = 0; $attempt -lt 30; $attempt++) {
                Start-Sleep -Milliseconds 100
                $remainingListener = Get-NetTCPConnection -LocalPort 5188 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
                if (-not $remainingListener) { break }
            }
            if ($remainingListener) {
                throw ('The old dashboard did not release port 5188: ' + $ownerName)
            }
        } else {
            throw ('Port 5188 is used by another application: ' + $ownerName)
        }
    }

    # Build into a fresh folder so an older dotnet host cannot lock the DLL we need to replace.
    $runtimeId = Get-Date -Format 'yyyyMMdd-HHmmssfff'
    $runtimeDir = Join-Path $runtimeRoot ('run-' + $runtimeId)
    $dll = Join-Path $runtimeDir 'CodexUsageDashboard.dll'
    New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
    Write-Host 'Building the latest dashboard...' -ForegroundColor Cyan
    $outputPathArgument = '-p:OutputPath=' + $runtimeDir
    & $dotnetCommand.Source build '--no-restore' '--nologo' $project $outputPathArgument
    if ($LASTEXITCODE -ne 0) { throw ('Dashboard build failed with exit code ' + $LASTEXITCODE + '.') }
    $argumentList = @($dll, '--urls', $url)

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $dotnetCommand.Source
    $startInfo.WorkingDirectory = $projectDir
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $quote = [char]34
    $startInfo.Arguments = $quote + $dll + $quote + ' --urls ' + $quote + $url + $quote
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $server = [System.Diagnostics.Process]::new()
    $server.StartInfo = $startInfo
    [void]$server.Start()
    $stdoutTask = $server.StandardOutput.ReadToEndAsync()
    $stderrTask = $server.StandardError.ReadToEndAsync()

    Register-ObjectEvent -InputObject $server -EventName Exited -Action {
        try { $stdoutTask.Result | Set-Content -LiteralPath $stdoutLog -Encoding utf8 } catch { }
        try { $stderrTask.Result | Set-Content -LiteralPath $stderrLog -Encoding utf8 } catch { }
    } | Out-Null

    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        Start-Sleep -Milliseconds 250
        try {
            $health = Invoke-WebRequest -UseBasicParsing ($url + '/api/health') -TimeoutSec 2
            if ($health.StatusCode -eq 200) { $ready = $true; break }
        } catch { }
        if ($server.HasExited) {
            $details = if ($stderrTask.IsCompleted) { $stderrTask.Result } else { '' }
            throw ('Dashboard server failed to start. Exit code: ' + $server.ExitCode + '. ' + $details)
        }
    }
    if (-not $ready) { throw ('Dashboard did not become ready at ' + $url + '. See ' + $stderrLog) }

    try { Start-Process $browserUrl -ErrorAction Stop } catch {
        Write-Host ('Browser could not be opened automatically. Open ' + $browserUrl + ' manually.') -ForegroundColor Yellow
    }
    Write-Host ('Codex usage dashboard started: ' + $url) -ForegroundColor Green
    Write-Host ('Server log: ' + $stdoutLog) -ForegroundColor DarkGray
    Write-Host 'Close this window to stop the dashboard.' -ForegroundColor DarkGray
    while (-not $server.HasExited) {
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host ('Dashboard failed to start: ' + $_.Exception.Message) -ForegroundColor Red
    Write-Host ('Project folder: ' + $projectDir) -ForegroundColor Yellow
    Write-Host 'Press Enter to close this window.' -ForegroundColor Yellow
    [void](Read-Host)
    exit 1
}
finally {
    if ($server -and -not $server.HasExited) {
        Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    }
    if ($server) {
        try { $stdoutTask.Result | Set-Content -LiteralPath $stdoutLog -Encoding utf8 } catch { }
        try { $stderrTask.Result | Set-Content -LiteralPath $stderrLog -Encoding utf8 } catch { }
    }
}
