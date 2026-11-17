# Multi-Claude Build Cockpit Launcher (claudebuild)
[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"

# 1. Sanitize Environment
$env:ANTHROPIC_MODEL = $null

# 2. Paths
$workspace = "c:\Users\kavur\winthread"
$configPath = Join-Path $workspace ".vscode\claudebuild.json"
$idePath = "C:\Users\kavur\AppData\Local\Programs\Antigravity IDE\bin\antigravity-ide.cmd"

if (-not (Test-Path $configPath)) {
    Write-Error "Cockpit configuration missing at $configPath"
    exit 1
}

$config = Get-Content $configPath -Raw | ConvertFrom-Json

# 3. Check OmniRoute Proxy
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:20128/v1/models" -Headers @{ Authorization = "Bearer sk-omniroute-master" } -TimeoutSec 5 -ErrorAction Stop
    $proxyStatus = "ONLINE (Port 20128)"
} catch {
    $proxyStatus = "OFFLINE - Please start OmniRoute proxy!"
}

Clear-Host
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "                    CLAUDE BUILD MULTI-MODEL COCKPIT                      " -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " Proxy Gateway : $proxyStatus" -ForegroundColor $(if ($proxyStatus -like "ONLINE*") { "Green" } else { "Red" })
Write-Host " Shortcut      : Ctrl + Alt + C (arranges all 3 editor panes in Antigravity)" -ForegroundColor Yellow
Write-Host " Config File   : .vscode/claudebuild.json" -ForegroundColor DarkGray
Write-Host "--------------------------------------------------------------------------" -ForegroundColor DarkGray

foreach ($pane in $config.panes) {
    Write-Host " [$($pane.position.PadRight(12))] $($pane.title.PadRight(28)) -> $($pane.model)" -ForegroundColor Green
}
Write-Host "==========================================================================" -ForegroundColor Cyan

# 4. Action based on argument
switch ($Target.ToLower()) {
    "ultra" {
        Write-Host "Starting Claude Code (Nemotron Ultra)..." -ForegroundColor Cyan
        & claude --model "model/nemotron-3-ultra"
    }
    "super" {
        Write-Host "Starting Claude Code (Nemotron Super-VL)..." -ForegroundColor Magenta
        & claude --model "model/nemotron-3.5-super-vl"
    }
    "lightning" {
        Write-Host "Starting Claude Code (Nemotron Lightning)..." -ForegroundColor Yellow
        & claude --model "model/nemotron-3.5-lightning"
    }
    default {
        if (Test-Path $idePath) {
            Write-Host "`nEnsuring Antigravity IDE workspace is open..." -ForegroundColor Cyan
            & $idePath $workspace
        }
        Write-Host "`nReady! Inside Antigravity IDE:" -ForegroundColor Green
        Write-Host "  1. Press Ctrl+Alt+C to open the 3 split panes instantly." -ForegroundColor Yellow
        Write-Host "  2. Or click '+' dropdown in Terminal to launch any model independently." -ForegroundColor Yellow
        Write-Host "  3. Run 'claudebuild ultra', 'claudebuild super', or 'claudebuild lightning' for standalone.`n" -ForegroundColor DarkGray
    }
}
