@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-shared-backend.ps1"

if errorlevel 1 (
  echo.
  echo CRM Mini shared backend could not start. Please read the message above.
  pause
)
