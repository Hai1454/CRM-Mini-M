param(
  [switch]$RequireShared
)

$ErrorActionPreference = "Stop"
$DefaultSharedApiUrl = "https://profound-elegance-production-2d5e.up.railway.app/api"

function Write-Step($message) {
  Write-Host ""
  Write-Host "==> $message" -ForegroundColor Cyan
}

function Test-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Normalize-ApiUrl($value) {
  $url = ([string]$value).Trim().TrimEnd("/")
  if (-not $url) {
    return ""
  }
  if ($url -notmatch "/api$") {
    $url = "$url/api"
  }
  return $url
}

function Test-ApiUrl($apiUrl) {
  $healthUrl = "$($apiUrl.TrimEnd('/'))/health"
  for ($attempt = 1; $attempt -le 3; $attempt++) {
    try {
      $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 20
      return $response.status -eq "ok"
    } catch {
      if ($attempt -lt 3) {
        Write-Host "Waiting for shared API to wake up... ($attempt/3)"
        Start-Sleep -Seconds 5
      }
    }
  }
  return $false
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

Write-Host "CRM Mini Launcher" -ForegroundColor Green
Write-Host "Project: $root"

if (-not (Test-Command "node")) {
  Write-Host ""
  Write-Host "Node.js is not installed or is not available in PATH." -ForegroundColor Red
  Write-Host "Install Node.js LTS from https://nodejs.org, then run start-crm-mini.bat again."
  exit 1
}

$nodeVersion = node --version
Write-Host "Node.js: $nodeVersion"

if (-not (Test-Command "pnpm")) {
  Write-Step "Preparing pnpm"
  if (Test-Command "corepack") {
    corepack enable
    corepack prepare pnpm@latest --activate
  } else {
    npm install -g pnpm
  }
}

Write-Host "pnpm: $(pnpm --version)"

$configPath = Join-Path $root "crm-mini.config.json"
$clientEnvPath = Join-Path $root "client\.env.local"
$sharedApiUrl = ""

if (Test-Path $configPath) {
  $config = Get-Content -Raw $configPath | ConvertFrom-Json
  if ($config.apiUrl) {
    $sharedApiUrl = Normalize-ApiUrl $config.apiUrl
  }
}

if ($RequireShared -and -not $sharedApiUrl) {
  $sharedApiUrl = Normalize-ApiUrl $DefaultSharedApiUrl
  @{ apiUrl = $sharedApiUrl } | ConvertTo-Json | Set-Content -Path $configPath -Encoding UTF8
  Write-Host "Saved shared API config to crm-mini.config.json."
}

if ($sharedApiUrl) {
  Write-Step "Using shared API"
  if (-not (Test-ApiUrl $sharedApiUrl)) {
    Write-Host "Could not reach shared API: $sharedApiUrl" -ForegroundColor Red
    Write-Host "Please check that the backend is online and the URL ends with /api."
    exit 1
  }
  "VITE_API_URL=$sharedApiUrl" | Set-Content -Path $clientEnvPath -Encoding UTF8
  Write-Host "Frontend will use: $sharedApiUrl"
} else {
  "VITE_API_URL=http://localhost:4000/api" | Set-Content -Path $clientEnvPath -Encoding UTF8
  Write-Host "Frontend will use local API: http://localhost:4000/api"
}

$needsInstall = -not (Test-Path (Join-Path $root "node_modules"))
$needsSeed = -not (Test-Path (Join-Path $root "server\prisma\dev.db"))

Write-Step "Preparing local configuration"
node scripts/prepare-demo.js

if ($needsInstall) {
  Write-Step "Installing dependencies"
  pnpm install
} else {
  Write-Host "Dependencies already installed."
}

if ($sharedApiUrl) {
  Write-Host "Shared API mode: skipping local database setup."
} elseif ($needsSeed) {
  Write-Step "Creating local demo database"
  pnpm run seed
} else {
  Write-Host "Local demo database already exists."
}

Write-Step "Starting CRM Mini"
Write-Host "The app will open at http://localhost:5173"
Write-Host "Keep this window open while using the app."
Start-Process "http://localhost:5173"

if ($sharedApiUrl) {
  pnpm --filter crm-mini-client run dev
} else {
  pnpm run dev
}
