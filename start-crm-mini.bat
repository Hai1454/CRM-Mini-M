@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-crm-mini.ps1"

if errorlevel 1 (
  echo.
  echo CRM Mini could not start. Please read the message above.
  pause
)
