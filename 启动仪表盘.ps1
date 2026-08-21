& (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'start-dashboard.ps1')
exit $LASTEXITCODE
