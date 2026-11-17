# Test Suite for Exit Code 2 Self-Healing Hook
# Location: c:\Users\kavur\winthread\tests\test_exit_code_2.ps1

$ErrorActionPreference = "Continue"

Write-Host "`n=== Test Suite: Claude Code Exit Code 2 Hook ===" -ForegroundColor Cyan

$hookScript = "C:\Users\kavur\.claude\hooks\post-edit-typecheck.ps1"
if (-not (Test-Path $hookScript)) {
    Write-Host "FAIL: Hook script not found at $hookScript" -ForegroundColor Red
    exit 1
}
Write-Host "PASS 1: Hook script exists at $hookScript" -ForegroundColor Green

# Test 1: Clean run in winthread
Write-Host "Testing Clean Run in winthread..."
$proc1 = Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$hookScript`"" -NoNewWindow -PassThru -Wait
if ($proc1.ExitCode -eq 0) {
    Write-Host "PASS 2: Clean TypeScript run exited with code 0 as expected." -ForegroundColor Green
} else {
    Write-Host "FAIL 2: Clean run exited with code $($proc1.ExitCode), expected 0." -ForegroundColor Red
    exit 1
}

# Test 2: Simulated type error in winthread
Write-Host "Testing Simulated Broken TypeScript in winthread..."
$brokenFilePath = "c:\Users\kavur\winthread\tests\temp_broken_typecheck.ts"
try {
    # Write invalid TypeScript code
    Set-Content -Path $brokenFilePath -Value 'const x: number = "this is definitely not a number";'

    # Run the hook script
    $proc2 = Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$hookScript`"" -NoNewWindow -PassThru -Wait
    if ($proc2.ExitCode -eq 2) {
        Write-Host "PASS 3: TypeScript error successfully caught and exited with code 2!" -ForegroundColor Green
    } else {
        Write-Host "FAIL 3: Type failure exited with code $($proc2.ExitCode), expected 2." -ForegroundColor Red
        exit 1
    }
} finally {
    if (Test-Path $brokenFilePath) {
        Remove-Item -Path $brokenFilePath -Force -ErrorAction SilentlyContinue
    }
}

# Test 3: Verify registration in C:\Users\kavur\.claude\settings.json
$settingsPath = "C:\Users\kavur\.claude\settings.json"
$settingsContent = Get-Content $settingsPath -Raw | ConvertFrom-Json
$hasHook = $false

if ($settingsContent.hooks -and $settingsContent.hooks.PostToolUse) {
    foreach ($entry in $settingsContent.hooks.PostToolUse) {
        if ($entry.matcher -match "Edit|Write") {
            foreach ($h in $entry.hooks) {
                if ($h.command -match "post-edit-typecheck\.ps1") {
                    $hasHook = $true
                }
            }
        }
    }
}

if ($hasHook) {
    Write-Host "PASS 4: Hook is properly registered in C:\Users\kavur\.claude\settings.json" -ForegroundColor Green
} else {
    Write-Host "FAIL 4: Hook is NOT registered in C:\Users\kavur\.claude\settings.json" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll Exit Code 2 Hook tests PASSED successfully!" -ForegroundColor Green
exit 0
