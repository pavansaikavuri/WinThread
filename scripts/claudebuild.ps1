# Multi-Agent Build Cockpit Launcher (claudebuild)
[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"

# 1. Sanitize Environment
$env:ANTHROPIC_MODEL = $null

# 2. Determine Workspace and Configuration
$currentDir = (Get-Location).Path
$localConfig = Join-Path $currentDir ".vscode\claudebuild.json"
$globalConfig = Join-Path $env:USERPROFILE ".claudebuild\config.json"

if (Test-Path $localConfig) {
    $configPath = $localConfig
    $configSource = "Workspace Local (.vscode/claudebuild.json)"
} elseif (Test-Path $globalConfig) {
    $configPath = $globalConfig
    $configSource = "Global Master (~/.claudebuild/config.json)"
} else {
    Write-Error "No cockpit configuration found at $localConfig or $globalConfig"
    exit 1
}

$config = Get-Content $configPath -Raw | ConvertFrom-Json
$idePath = "C:\Users\kavur\AppData\Local\Programs\Antigravity IDE\bin\antigravity-ide.cmd"

# 3. Check OmniRoute Proxy
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:20128/v1/models" -Headers @{ Authorization = "Bearer sk-omniroute-master" } -TimeoutSec 5 -ErrorAction Stop
    $proxyStatus = "ONLINE (Port 20128 - $($resp.data.Count) models available)"
} catch {
    $proxyStatus = "OFFLINE - Please start OmniRoute proxy (omniroute serve)!"
}

Clear-Host
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "               GLOBAL 7-MODEL MULTI-AGENT BUILD COCKPIT                   " -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " Active Folder : $currentDir" -ForegroundColor White
Write-Host " Config Source : $configSource" -ForegroundColor DarkGray
Write-Host " Proxy Gateway : $proxyStatus" -ForegroundColor $(if ($proxyStatus -like "ONLINE*") { "Green" } else { "Red" })
Write-Host " Shortcuts     : Ctrl + Alt + C       (Open 2x2 Grid / Cycle Focus)" -ForegroundColor Yellow
Write-Host "                 Ctrl + Alt + Shift + C (Force Clean Reset & Rebuild)" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------------" -ForegroundColor DarkGray

foreach ($pane in $config.panes) {
    $posStr = "[$($pane.position.PadRight(12))]"
    $titleStr = $pane.title.PadRight(28)
    Write-Host " $posStr $titleStr -> $($pane.model)" -ForegroundColor Green
}
Write-Host "--------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host " Alternative OpenCode Models: 'claudebuild glm', 'claudebuild mimo'" -ForegroundColor Gray
Write-Host " OmniRoute Fallback Combos  : auto/coding, auto/reasoning, auto/free, auto/1m" -ForegroundColor Gray
Write-Host "==========================================================================" -ForegroundColor Cyan

# Helper to set OpenCode model
function Set-OpenCodeModel([string]$modelId) {
    $p = Join-Path $env:USERPROFILE ".config\opencode\opencode.json"
    if (Test-Path $p) {
        $cfg = Get-Content $p -Raw | ConvertFrom-Json
        $cfg.model = $modelId
        $cfg | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
    }
}

# 4. Action based on argument
switch ($Target.ToLower()) {
    "status" {
        exit 0
    }
    "ultra" {
        Write-Host "Starting Claude Code (Nemotron Ultra) in $currentDir..." -ForegroundColor Cyan
        & claude --model model/nemotron-3-ultra
    }
    "opencode" {
        Write-Host "Starting OpenCode (DeepSeek V4.1 Flash Free) in $currentDir..." -ForegroundColor Cyan
        Set-OpenCodeModel "opencode/deepseek-v4.1-flash-free"
        & opencode
    }
    "deepseek" {
        Write-Host "Starting OpenCode (DeepSeek V4.1 Flash Free) in $currentDir..." -ForegroundColor Cyan
        Set-OpenCodeModel "opencode/deepseek-v4.1-flash-free"
        & opencode
    }
    "glm" {
        Write-Host "Starting OpenCode (GLM-5.3-Flash Free) in $currentDir..." -ForegroundColor Cyan
        Set-OpenCodeModel "opencode/glm-5.3-flash-free"
        & opencode
    }
    "mimo" {
        Write-Host "Starting OpenCode (MiMo-V2.6-Flash Free) in $currentDir..." -ForegroundColor Cyan
        Set-OpenCodeModel "opencode/mimo-v2.6-flash-free"
        & opencode
    }
    "lightning" {
        Write-Host "Starting Claude Code (Nemotron Lightning) in $currentDir..." -ForegroundColor Cyan
        & claude --model model/nemotron-3.5-lightning
    }
    "super" {
        Write-Host "Starting Claude Code (Nemotron Super-VL) in $currentDir..." -ForegroundColor Cyan
        & claude --model model/nemotron-3.5-super-vl
    }
    "reset" {
        Write-Host "To reset the cockpit inside Antigravity IDE, press Ctrl + Alt + Shift + C." -ForegroundColor Yellow
    }
    default {
        Write-Host "`nEnsuring Antigravity IDE workspace is open at: $currentDir" -ForegroundColor Yellow
        if (Test-Path $idePath) {
            Start-Process -FilePath $idePath -ArgumentList "`"$currentDir`""
        }
        Write-Host "`nReady! Inside Antigravity IDE:" -ForegroundColor Green
        Write-Host "  1. Press Ctrl+Alt+C to open or cycle through the 4 panes (Top-Left Ultra, Top-Right OpenCode/DeepSeek, Bottom-Left Lightning, Bottom-Right Super-VL)."
        Write-Host "  2. Press Ctrl+Alt+Shift+C to perform a clean reset of the 2x2 cockpit."
        Write-Host "  3. Or click '+' in Terminal dropdown to launch any agent independently."
    }
}
