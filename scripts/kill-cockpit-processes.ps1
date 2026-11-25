# scripts/kill-cockpit-processes.ps1
# Terminates lingering CLI agent child processes spawned inside ConPTY terminals.
[CmdletBinding()]
param()

$targetProcesses = "claude", "opencode"
$killed = 0

foreach ($procName in $targetProcesses) {
    $processes = Get-Process -Name $procName -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($proc in $processes) {
            Write-Host "Terminating process: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            $killed++
        }
    }
}

if ($killed -eq 0) {
    Write-Host "No active cockpit agent processes found." -ForegroundColor Green
} else {
    Write-Host "Terminated $killed cockpit agent process(es)." -ForegroundColor Green
}
