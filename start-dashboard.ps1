$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Join-Path $projectDir 'CodexUsageDashboard.csproj'
$dll = Join-Path $projectDir 'bin\Debug\net10.0\CodexUsageDashboard.dll'
$url = 'http://127.0.0.1:5188'
$browserUrl = "$url/?v=20260820-4"
$stdoutLog = Join-Path $projectDir 'dashboard-server.log'
$stderrLog = Join-Path $projectDir 'dashboard-server-error.log'

try {
    $dotnetCommand = Get-Command dotnet -ErrorAction SilentlyContinue
    if (-not $dotnetCommand) { throw 'dotnet was not found. Install .NET 10 first.' }
    if (-not (Test-Path -LiteralPath $project)) { throw "Project file not found: $project" }

    if (Test-Path -LiteralPath $dll) {
        $argumentList = @($dll, '--urls', $url)
    } else {
        $argumentList = @('run', '--no-restore', '--no-launch-profile', '--project', $project, '--urls', $url)
    }

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $dotnetCommand.Source
    $startInfo.WorkingDirectory = $projectDir
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.Arguments = (($argumentList | ForEach-Object { '"' + ($_ -replace '"', '\"') + '"' }) -join ' ')
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
            $health = Invoke-WebRequest -UseBasicParsing "$url/api/health" -TimeoutSec 2
            if ($health.StatusCode -eq 200) { $ready = $true; break }
        } catch { }
        if ($server.HasExited) {
            $details = if ($stderrTask.IsCompleted) { $stderrTask.Result } else { '' }
            throw "Dashboard server failed to start. Exit code: $($server.ExitCode). $details"
        }
    }
    if (-not $ready) { throw "Dashboard did not become ready at $url. See $stderrLog" }

    try { Start-Process $browserUrl -ErrorAction Stop } catch {
        Write-Host "Browser could not be opened automatically. Open $browserUrl manually." -ForegroundColor Yellow
    }
    Write-Host "Codex usage dashboard started: $url" -ForegroundColor Green
    Write-Host "Server log: $stdoutLog" -ForegroundColor DarkGray
    Write-Host 'Close this window to stop the dashboard.' -ForegroundColor DarkGray
    while (-not $server.HasExited) {
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host "Dashboard failed to start: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Project folder: $projectDir" -ForegroundColor Yellow
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
