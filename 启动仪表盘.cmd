@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-dashboard.ps1"
if errorlevel 1 (
  echo.
  echo Dashboard failed to start. See the message above.
  pause
)
