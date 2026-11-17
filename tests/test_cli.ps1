$cmd = Get-Command claudebuild -ErrorAction SilentlyContinue
if (-not $cmd) {
    Write-Output "FAIL: claudebuild command not found in PATH"
    exit 1
}
Write-Output "PASS: claudebuild found at $($cmd.Source)"
exit 0
