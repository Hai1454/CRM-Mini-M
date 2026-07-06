$ErrorActionPreference = "Stop"

function Write-Step($message) {
  Write-Host ""
  Write-Host "==> $message" -ForegroundColor Cyan
}

function Test-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Invoke-Pnpm($Arguments) {
  if ($script:PnpmMode -eq "global") {
    & pnpm @Arguments
  } else {
    & npm exec --yes pnpm@11.7.0 -- @Arguments
  }

  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

Write-Host "CRM Mini Shared Backend" -ForegroundColor Green
Write-Host "Project: $root"

if (-not (Test-Command "node")) {
  Write-Host ""
  Write-Host "Node.js is not installed or is not available in PATH." -ForegroundColor Red
  Write-Host "Install Node.js LTS from https://nodejs.org, then run start-shared-backend.bat again."
  exit 1
}

if (Test-Command "pnpm") {
  $script:PnpmMode = "global"
  Write-Host "pnpm: $(pnpm --version)"
} else {
  if (-not (Test-Command "npm")) {
    Write-Host ""
    Write-Host "npm is not installed or is not available in PATH." -ForegroundColor Red
    Write-Host "Install Node.js LTS with npm enabled, then run this launcher again."
    exit 1
  }

  $script:PnpmMode = "npm-exec"
  Write-Step "Preparing pnpm without admin permission"
  Invoke-Pnpm @("--version")
}

$needsInstall = -not (Test-Path (Join-Path $root "node_modules"))
$needsSeed = -not (Test-Path (Join-Path $root "server\prisma\dev.db"))

Write-Step "Preparing backend configuration"
node scripts/prepare-demo.js

if ($needsInstall) {
  Write-Step "Installing dependencies"
  Invoke-Pnpm @("install")
} else {
  Write-Host "Dependencies already installed."
}

if ($needsSeed) {
  Write-Step "Creating shared demo database"
  Invoke-Pnpm @("run", "seed")
} else {
  Write-Host "Shared demo database already exists."
}

Write-Step "Starting shared backend"
Write-Host "Local backend URL: http://localhost:4000/api"
Write-Host "For remote collaborators, deploy this backend online or expose it with a tunnel/domain."
Write-Host "Keep this window open while using the shared backend."

Invoke-Pnpm @("--filter", "crm-mini-server", "run", "dev")
