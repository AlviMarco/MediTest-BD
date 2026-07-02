[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateRange(1, 65535)]
  [int]$Port
)

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if (-not $connections) {
  Write-Host "Port $Port is free."
  exit 0
}

$processIds = $connections |
  Select-Object -ExpandProperty OwningProcess -Unique |
  Where-Object { $_ -gt 0 }

foreach ($processId in $processIds) {
  try {
    $process = Get-Process -Id $processId -ErrorAction Stop
    $details = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
    $commandLine = if ($details.CommandLine) { $details.CommandLine } else { $process.ProcessName }

    $allowedProcessNames = @('node', 'dart', 'dartvm', 'dartaotruntime')
    if ($allowedProcessNames -notcontains $process.ProcessName) {
      Write-Error "Port $Port is used by $($process.ProcessName) (PID $processId). Close it manually before starting the server."
      exit 1
    }

    Write-Host "Stopping $($process.ProcessName) (PID $processId) on port $Port..."
    Write-Host "Command: $commandLine"
    Stop-Process -Id $processId -Force -ErrorAction Stop
  } catch {
    Write-Error "Could not stop PID ${processId}: $($_.Exception.Message)"
    exit 1
  }
}

Start-Sleep -Milliseconds 800

$stillBusy = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($stillBusy) {
  Write-Error "Port $Port is still busy. Close the running server manually, then try again."
  exit 1
}

Write-Host "Port $Port is free."
