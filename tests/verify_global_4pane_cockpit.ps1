# tests/verify_global_4pane_cockpit.ps1
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    VERIFYING GLOBAL 7-MODEL COCKPIT & ANTHROPIC HARNESS  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "1. Testing OpenCode Default Model (DeepSeek V4.1 Flash)..." -ForegroundColor Yellow
node tests/test_opencode_model.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n2. Testing Global Master Config..." -ForegroundColor Yellow
node tests/test_global_config.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n3. Testing Antigravity Terminal Profiles..." -ForegroundColor Yellow
node tests/test_global_profiles.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n4. Testing Idempotent Keybindings & Exact Engine Commands..." -ForegroundColor Yellow
node tests/test_idempotent_keybindings.js
if ($LASTEXITCODE -ne 0) { exit 1 }
node tests/verify_engine_commands.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n5. Testing OpenCode CLI..." -ForegroundColor Yellow
$oc = Get-Command opencode -ErrorAction SilentlyContinue
if (-not $oc) { Write-Error "opencode command missing!"; exit 1 }
Write-Host "PASS: opencode found at $($oc.Source)" -ForegroundColor Green

Write-Host "`n6. Testing OmniRoute Gateway on 127.0.0.1:20128..." -ForegroundColor Yellow
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:20128/v1/models" -Headers @{ Authorization = "Bearer sk-omniroute-master" } -TimeoutSec 10 -ErrorAction Stop
    Write-Host "PASS: Gateway responding on 127.0.0.1:20128 with $($resp.data.Count) models" -ForegroundColor Green
} catch {
    Write-Error "FAIL: OmniRoute Gateway offline: $_"
    exit 1
}

Write-Host "`n7. Testing Global claudebuild CLI..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File tests/test_global_cli.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n8. Testing Global Hard Deny Rules..." -ForegroundColor Yellow
node tests/test_global_deny_rules.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n9. Testing Global Exit Code 2 Self-Healing Hook..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File tests/test_exit_code_2.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n10. Testing Global CLAUDE.md Hygiene & Routing Map..." -ForegroundColor Yellow
node tests/test_claude_md_hygiene.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n11. Testing Instant Close Config (Ctrl+Alt+X & Zero Prompt)..." -ForegroundColor Yellow
node tests/test_instant_close_config.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "ALL 11 MULTI-AGENT & HARNESS VERIFICATION CHECKS PASSED!   " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
exit 0
