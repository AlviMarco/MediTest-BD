[CmdletBinding()]
param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$mobileDir = Join-Path $root 'apps\mobile'
$buildDir = Join-Path $mobileDir 'build\web'
$logs = Join-Path $root 'logs'

New-Item -ItemType Directory -Path $logs -Force | Out-Null

& (Join-Path $PSScriptRoot 'stop-port.ps1') -Port 8081

if (-not $SkipBuild) {
  Push-Location $mobileDir
  try {
    & 'D:\flutter\flutter\bin\flutter.bat' build web --dart-define=API_BASE_URL=http://localhost:4000/api
  } finally {
    Pop-Location
  }
}

if (-not (Test-Path -LiteralPath (Join-Path $buildDir 'index.html'))) {
  throw "Mobile web build was not found at $buildDir. Run without -SkipBuild first."
}

$out = Join-Path $logs 'mobile-web.out.log'
$err = Join-Path $logs 'mobile-web.err.log'

$serverScript = Join-Path $PSScriptRoot 'serve-static.mjs'
$argumentList = "`"$serverScript`" `"$buildDir`" 8081 127.0.0.1"

Start-Process -FilePath 'node.exe' -ArgumentList $argumentList -WorkingDirectory $root -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden

for ($i = 0; $i -lt 20; $i++) {
  try {
    $response = Invoke-WebRequest -Uri 'http://127.0.0.1:8081' -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
      Write-Host 'Mobile web is running at http://127.0.0.1:8081'
      exit 0
    }
  } catch {
    Start-Sleep -Seconds 1
  }
}

Write-Warning "Mobile web did not respond. Check $out and $err."
