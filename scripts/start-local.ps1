[CmdletBinding()]
param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $root 'logs'
$apiDir = Join-Path $root 'apps\api'
$adminDir = Join-Path $root 'apps\admin'

New-Item -ItemType Directory -Path $logs -Force | Out-Null

& (Join-Path $PSScriptRoot 'stop-port.ps1') -Port 4000
& (Join-Path $PSScriptRoot 'stop-port.ps1') -Port 3000

if (-not $SkipBuild) {
  Push-Location $root
  try {
    npm.cmd run build:api
    npm.cmd run build:admin
  } finally {
    Pop-Location
  }
}

$apiOut = Join-Path $logs 'api.out.log'
$apiErr = Join-Path $logs 'api.err.log'
$adminOut = Join-Path $logs 'admin.out.log'
$adminErr = Join-Path $logs 'admin.err.log'

Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', 'start:prod') -WorkingDirectory $apiDir -RedirectStandardOutput $apiOut -RedirectStandardError $apiErr -WindowStyle Hidden
Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', 'start') -WorkingDirectory $adminDir -RedirectStandardOutput $adminOut -RedirectStandardError $adminErr -WindowStyle Hidden

function Wait-ForHttp {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [int]$Seconds = 30
  )

  for ($i = 0; $i -lt $Seconds; $i++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  return $false
}

$apiReady = Wait-ForHttp -Url 'http://localhost:4000/api/health'
$adminReady = Wait-ForHttp -Url 'http://localhost:3000'

Write-Host "API:   http://localhost:4000/api/health"
Write-Host "Admin: http://localhost:3000"
Write-Host "Logs:  $logs"

if (-not $apiReady) {
  Write-Warning "API did not respond within the wait window. Check $apiErr and $apiOut."
}

if (-not $adminReady) {
  Write-Warning "Admin did not respond within the wait window. Check $adminErr and $adminOut."
}
