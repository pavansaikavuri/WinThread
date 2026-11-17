# tests/test_global_cli.ps1
$cmd = Get-Command claudebuild -ErrorAction SilentlyContinue
if (-not $cmd) {
    Write-Output "FAIL: claudebuild not in PATH"
    exit 1
}

# Test execution with 'status' parameter
$out = & claudebuild status
if ($LASTEXITCODE -ne 0) {
    Write-Output "FAIL: claudebuild status exited with code $LASTEXITCODE"
    exit 1
}

Write-Output "PASS: Global claudebuild CLI operational"
exit 0
