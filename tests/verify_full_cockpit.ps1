Write-Host "Checking Environment..." -ForegroundColor Cyan
$val = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_MODEL", "User")
if ($val) { Write-Error "ANTHROPIC_MODEL is still set in User registry: $val"; exit 1 }
Write-Host "PASS: ANTHROPIC_MODEL is clean in User environment" -ForegroundColor Green

Write-Host "`nChecking Cockpit Configuration..." -ForegroundColor Cyan
node tests/test_config.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`nChecking Terminal Profiles..." -ForegroundColor Cyan
node tests/test_profiles.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`nChecking Keybindings..." -ForegroundColor Cyan
node tests/test_keybindings.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`nChecking Global CLI..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File tests/test_cli.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`nChecking OmniRoute Proxy Gateway..." -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:20128/v1/models" -Headers @{ Authorization = "Bearer sk-omniroute-master" } -TimeoutSec 5 -ErrorAction Stop
    Write-Host "PASS: OmniRoute Proxy responding on port 20128 with $($resp.data.Count) models" -ForegroundColor Green
} catch {
    Write-Error "FAIL: OmniRoute Proxy not reachable on port 20128: $_"
    exit 1
}

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "ALL 6 VERIFICATION CHECKS PASSED WITH ZERO MISTAKES!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
exit 0
