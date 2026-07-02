[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ApiBaseUrl
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$mobileDir = Join-Path $root 'apps\mobile'

$flutter = Get-Command flutter -ErrorAction SilentlyContinue
if ($flutter) {
  $flutterPath = $flutter.Source
} elseif (Test-Path -LiteralPath 'D:\flutter\flutter\bin\flutter.bat') {
  $flutterPath = 'D:\flutter\flutter\bin\flutter.bat'
} else {
  throw 'Flutter was not found. Add Flutter to PATH or install it at D:\flutter\flutter.'
}

Push-Location $mobileDir
try {
  & $flutterPath build apk --release --dart-define=API_BASE_URL=$ApiBaseUrl
} finally {
  Pop-Location
}
