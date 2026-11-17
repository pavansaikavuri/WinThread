# tests/verify_global_4pane_cockpit.ps1
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    VERIFYING GLOBAL 4-PANE MULTI-AGENT COCKPIT           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "1. Testing Global Master Config..." -ForegroundColor Yellow
node tests/test_global_config.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n2. Testing Antigravity Terminal Profiles..." -ForegroundColor Yellow
node tests/test_global_profiles.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n3. Testing Idempotent Keybindings..." -ForegroundColor Yellow
node tests/test_idempotent_keybindings.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n4. Testing OpenCode CLI..." -ForegroundColor Yellow
$oc = Get-Command opencode -ErrorAction SilentlyContinue
if (-not $oc) { Write-Error "opencode command missing!"; exit 1 }
Write-Host "PASS: opencode found at $($oc.Source)" -ForegroundColor Green

Write-Host "`n5. Testing OmniRoute Gateway on 127.0.0.1:20128..." -ForegroundColor Yellow
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:20128/v1/models" -Headers @{ Authorization = "Bearer sk-omniroute-master" } -TimeoutSec 5 -ErrorAction Stop
    Write-Host "PASS: Gateway responding on 127.0.0.1:20128 with $($resp.data.Count) models" -ForegroundColor Green
} catch {
    Write-Error "FAIL: OmniRoute Gateway offline: $_"
    exit 1
}

Write-Host "`n6. Testing Global claudebuild CLI..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File tests/test_global_cli.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "ALL 6 GLOBAL COCKPIT VERIFICATION TESTS PASSED!            " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
exit 0
