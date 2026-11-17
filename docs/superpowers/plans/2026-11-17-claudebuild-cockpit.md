# Multi-Claude Build Cockpit (`claudebuild` & `Ctrl+Alt+C`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate the 3-Claude cockpit setup in Antigravity IDE with the `claudebuild` command, the `Ctrl+Alt+C` keyboard shortcut, dedicated terminal profiles in the `+` menu, and dynamic model configuration via `.vscode/claudebuild.json`.

**Architecture:** Remove the stale global `ANTHROPIC_MODEL=auto/massive` environment variable. Configure native VS Code terminal profiles in Antigravity IDE User settings. Configure native `runCommands` keybinding in `keybindings.json` for `Ctrl+Alt+C` to build the 3-pane split layout. Deploy a global `claudebuild` CLI wrapper in `AppData\Roaming\npm`.

**Tech Stack:** Antigravity IDE (VS Code 1.94+ core), PowerShell 5.1/7, Claude Code CLI v2.1, Windows Environment APIs.

**Spec:** User request: 3-pane editor terminal layout (Left: Nemotron Ultra, Top-Right: Nemotron Super-VL, Bottom-Right: Nemotron Lightning), triggered by `claudebuild` CLI command and `Ctrl+Alt+C` shortcut, supporting dynamic model additions and edits.

## Global Constraints
- Target environment is Windows 11 with Antigravity IDE (VS Code v1.94+ compatible).
- Stale `ANTHROPIC_MODEL=auto/massive` must be cleared from Windows User environment.
- Profiles and shortcuts must be defined in Antigravity IDE User configuration (`%APPDATA%\Antigravity IDE\User\`).
- CLI command must be accessible globally via `claudebuild` in any shell.

---

### Task 1: Sanitize Windows Environment Variable

**Files:**
- Modify: Windows User Environment (Registry / .NET Environment API)
- Test: PowerShell verification script

**Interfaces:**
- Consumes: `[System.Environment]::GetEnvironmentVariable("ANTHROPIC_MODEL", "User")`
- Produces: `ANTHROPIC_MODEL` unset at User level, allowing `--model` flag to control sessions.

- [ ] **Step 1: Write verification test for environment state**

```powershell
# tests/test_env.ps1
$val = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_MODEL", "User")
if ($val -ne $null -and $val -ne "") {
    Write-Output "FAIL: ANTHROPIC_MODEL is still set to $val"
    exit 1
} else {
    Write-Output "PASS: ANTHROPIC_MODEL is clean"
    exit 0
}
```

- [ ] **Step 2: Run test to verify current state**

Run: `powershell -ExecutionPolicy Bypass -File tests/test_env.ps1`
Expected: FAIL with "ANTHROPIC_MODEL is still set to auto/massive"

- [ ] **Step 3: Clear `ANTHROPIC_MODEL` from User Environment**

```powershell
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_MODEL", $null, "User")
$env:ANTHROPIC_MODEL = $null
```

- [ ] **Step 4: Run test to verify it passes**

Run: `powershell -ExecutionPolicy Bypass -File tests/test_env.ps1`
Expected: PASS: ANTHROPIC_MODEL is clean

- [ ] **Step 5: Commit**

```bash
git add tests/test_env.ps1
git commit -m "chore: sanitize ANTHROPIC_MODEL environment variable"
```

---

### Task 2: Create Dynamic Cockpit Configuration File

**Files:**
- Create: `c:\Users\kavur\winthread\.vscode\claudebuild.json`
- Test: `tests/test_config.js`

**Interfaces:**
- Consumes: JSON schema defining pane layouts and model identifiers.
- Produces: Single source of truth for models, layout positions, and display names.

- [ ] **Step 1: Write test for configuration schema**

```javascript
// tests/test_config.js
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '.vscode', 'claudebuild.json');
if (!fs.existsSync(configPath)) {
  console.error('FAIL: claudebuild.json missing');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (!Array.isArray(config.panes) || config.panes.length !== 3) {
  console.error('FAIL: Expected 3 panes defined');
  process.exit(1);
}

const expectedModels = [
  'model/nemotron-3-ultra',
  'model/nemotron-3.5-super-vl',
  'model/nemotron-3.5-lightning'
];

for (let i = 0; i < 3; i++) {
  if (config.panes[i].model !== expectedModels[i]) {
    console.error(`FAIL: Pane ${i} model mismatch: ${config.panes[i].model}`);
    process.exit(1);
  }
}

console.log('PASS: claudebuild.json schema valid');
process.exit(0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_config.js`
Expected: FAIL with "claudebuild.json missing"

- [ ] **Step 3: Create `.vscode/claudebuild.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ClaudeBuild Cockpit Configuration",
  "description": "Defines the multi-Claude split terminal layout in Antigravity IDE",
  "panes": [
    {
      "id": "pane-ultra",
      "title": "Claude: Nemotron Ultra",
      "model": "model/nemotron-3-ultra",
      "position": "left",
      "command": "claude --model model/nemotron-3-ultra",
      "color": "terminal.ansiBlue"
    },
    {
      "id": "pane-super",
      "title": "Claude: Nemotron Super-VL",
      "model": "model/nemotron-3.5-super-vl",
      "position": "top-right",
      "command": "claude --model model/nemotron-3.5-super-vl",
      "color": "terminal.ansiMagenta"
    },
    {
      "id": "pane-lightning",
      "title": "Claude: Nemotron Lightning",
      "model": "model/nemotron-3.5-lightning",
      "position": "bottom-right",
      "command": "claude --model model/nemotron-3.5-lightning",
      "color": "terminal.ansiCyan"
    }
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_config.js`
Expected: PASS: claudebuild.json schema valid

- [ ] **Step 5: Commit**

```bash
git add .vscode/claudebuild.json tests/test_config.js
git commit -m "feat(cockpit): add dynamic claudebuild.json configuration"
```

---

### Task 3: Configure Antigravity IDE Terminal Profiles

**Files:**
- Modify: `C:\Users\kavur\AppData\Roaming\Antigravity IDE\User\settings.json`
- Test: `tests/test_profiles.js`

**Interfaces:**
- Consumes: `.vscode/claudebuild.json` pane definitions.
- Produces: Native terminal profiles registered in Antigravity IDE terminal `+` dropdown.

- [ ] **Step 1: Write test for terminal profiles in Antigravity settings**

```javascript
// tests/test_profiles.js
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.env.APPDATA, 'Antigravity IDE', 'User', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

const profiles = settings['terminal.integrated.profiles.windows'];
if (!profiles) {
  console.error('FAIL: terminal.integrated.profiles.windows missing');
  process.exit(1);
}

const required = [
  'Claude: Nemotron Ultra',
  'Claude: Nemotron Super-VL',
  'Claude: Nemotron Lightning'
];

for (const req of required) {
  if (!profiles[req]) {
    console.error(`FAIL: Missing profile: ${req}`);
    process.exit(1);
  }
}

console.log('PASS: All terminal profiles registered in Antigravity IDE');
process.exit(0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_profiles.js`
Expected: FAIL with "terminal.integrated.profiles.windows missing"

- [ ] **Step 3: Update `Antigravity IDE/User/settings.json` with terminal profiles**

```json
{
    "python.languageServer": "Default",
    "dart.flutterSdkPath": "C:\\Flutter\\flutter",
    "explorer.confirmDelete": false,
    "terminal.integrated.env.windows": {
        "PATH": "${env:PATH};C:\\Users\\kavur\\AppData\\Roaming\\npm"
    },
    "claudeCode.preferredLocation": "panel",
    "claudeCode.hideOnboarding": true,
    "terminal.integrated.profiles.windows": {
        "Claude: Nemotron Ultra": {
            "source": "PowerShell",
            "args": [
                "-NoExit",
                "-Command",
                "$Host.UI.RawUI.WindowTitle = 'Claude: Nemotron Ultra'; claude --model model/nemotron-3-ultra"
            ],
            "icon": "robot"
        },
        "Claude: Nemotron Super-VL": {
            "source": "PowerShell",
            "args": [
                "-NoExit",
                "-Command",
                "$Host.UI.RawUI.WindowTitle = 'Claude: Nemotron Super-VL'; claude --model model/nemotron-3.5-super-vl"
            ],
            "icon": "eye"
        },
        "Claude: Nemotron Lightning": {
            "source": "PowerShell",
            "args": [
                "-NoExit",
                "-Command",
                "$Host.UI.RawUI.WindowTitle = 'Claude: Nemotron Lightning'; claude --model model/nemotron-3.5-lightning"
            ],
            "icon": "zap"
        }
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_profiles.js`
Expected: PASS: All terminal profiles registered in Antigravity IDE

- [ ] **Step 5: Commit**

```bash
git add tests/test_profiles.js
git commit -m "feat(cockpit): register Claude terminal profiles in Antigravity settings"
```

---

### Task 4: Configure `Ctrl+Alt+C` Shortcut in Antigravity Keybindings

**Files:**
- Create/Modify: `C:\Users\kavur\AppData\Roaming\Antigravity IDE\User\keybindings.json`
- Test: `tests/test_keybindings.js`

**Interfaces:**
- Consumes: VS Code `runCommands` sequential command runner.
- Produces: `Ctrl+Alt+C` global keybinding executing the 3-pane split editor sequence.

- [ ] **Step 1: Write test for keybindings configuration**

```javascript
// tests/test_keybindings.js
const fs = require('fs');
const path = require('path');

const keybindingsPath = path.join(process.env.APPDATA, 'Antigravity IDE', 'User', 'keybindings.json');
if (!fs.existsSync(keybindingsPath)) {
  console.error('FAIL: keybindings.json missing');
  process.exit(1);
}

const bindings = JSON.parse(fs.readFileSync(keybindingsPath, 'utf8'));
const match = bindings.find(b => b.key && b.key.toLowerCase().replace(/\s+/g, '') === 'ctrl+alt+c');

if (!match) {
  console.error('FAIL: Ctrl+Alt+C keybinding missing');
  process.exit(1);
}

console.log('PASS: Ctrl+Alt+C bound to cockpit launch');
process.exit(0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_keybindings.js`
Expected: FAIL with "keybindings.json missing" or "Ctrl+Alt+C keybinding missing"

- [ ] **Step 3: Create/Update `Antigravity IDE/User/keybindings.json`**

```json
[
    {
        "key": "ctrl+alt+c",
        "command": "runCommands",
        "args": {
            "commands": [
                {
                    "command": "workbench.action.terminal.newWithProfile",
                    "args": {
                        "profileName": "Claude: Nemotron Ultra",
                        "location": "editor"
                    }
                },
                {
                    "command": "workbench.action.splitEditorRight"
                },
                {
                    "command": "workbench.action.terminal.newWithProfile",
                    "args": {
                        "profileName": "Claude: Nemotron Super-VL",
                        "location": "editor"
                    }
                },
                {
                    "command": "workbench.action.splitEditorDown"
                },
                {
                    "command": "workbench.action.terminal.newWithProfile",
                    "args": {
                        "profileName": "Claude: Nemotron Lightning",
                        "location": "editor"
                    }
                }
            ]
        }
    }
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_keybindings.js`
Expected: PASS: Ctrl+Alt+C bound to cockpit launch

- [ ] **Step 5: Commit**

```bash
git add tests/test_keybindings.js
git commit -m "feat(cockpit): bind Ctrl+Alt+C to 3-pane Claude layout"
```

---

### Task 5: Build Global `claudebuild` CLI Command

**Files:**
- Create: `C:\Users\kavur\winthread\scripts\claudebuild.ps1`
- Create: `C:\Users\kavur\AppData\Roaming\npm\claudebuild.cmd`
- Test: `tests/test_cli.ps1`

**Interfaces:**
- Consumes: `.vscode/claudebuild.json` configuration.
- Produces: Globally runnable CLI command `claudebuild` in any shell.

- [ ] **Step 1: Write test for `claudebuild` CLI availability**

```powershell
# tests/test_cli.ps1
$cmd = Get-Command claudebuild -ErrorAction SilentlyContinue
if (-not $cmd) {
    Write-Output "FAIL: claudebuild command not found in PATH"
    exit 1
}
Write-Output "PASS: claudebuild found at $($cmd.Source)"
exit 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File tests/test_cli.ps1`
Expected: FAIL with "claudebuild command not found in PATH"

- [ ] **Step 3: Implement `scripts/claudebuild.ps1` and `claudebuild.cmd`**

```powershell
# c:\Users\kavur\winthread\scripts\claudebuild.ps1
# Multi-Claude Build Cockpit Launcher
$ErrorActionPreference = "Stop"

$idePath = "C:\Users\kavur\AppData\Local\Programs\Antigravity IDE\bin\antigravity-ide.cmd"
$configPath = "c:\Users\kavur\winthread\.vscode\claudebuild.json"

if (-not (Test-Path $configPath)) {
    Write-Error "Configuration missing: $configPath"
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "           LAUNCHING CLAUDE BUILD COCKPIT                " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [Pane 1 - Left]        Claude Code: model/nemotron-3-ultra" -ForegroundColor Green
Write-Host " [Pane 2 - Top Right]   Claude Code: model/nemotron-3.5-super-vl" -ForegroundColor Magenta
Write-Host " [Pane 3 - Bottom Right] Claude Code: model/nemotron-3.5-lightning" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Launch using Antigravity IDE terminal profile commands or native processes
& $idePath "c:\Users\kavur\winthread"
Write-Host "Tip: Press Ctrl+Alt+C inside Antigravity IDE to arrange all 3 panes instantly." -ForegroundColor Green
```

Create `C:\Users\kavur\AppData\Roaming\npm\claudebuild.cmd`:
```cmd
@ECHO off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\kavur\winthread\scripts\claudebuild.ps1" %*
```

- [ ] **Step 4: Run test to verify it passes**

Run: `powershell -ExecutionPolicy Bypass -File tests/test_cli.ps1`
Expected: PASS: claudebuild found at C:\Users\kavur\AppData\Roaming\npm\claudebuild.cmd

- [ ] **Step 5: Commit**

```bash
git add scripts/claudebuild.ps1 tests/test_cli.ps1
git commit -m "feat(cockpit): add global claudebuild CLI launcher"
```

---

### Task 6: End-to-End Verification

**Files:**
- Test: `tests/verify_full_cockpit.ps1`

- [ ] **Step 1: Write full end-to-end verification script**

```powershell
# tests/verify_full_cockpit.ps1
Write-Host "Checking Environment..." -ForegroundColor Cyan
$val = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_MODEL", "User")
if ($val) { Write-Error "ANTHROPIC_MODEL is still set!"; exit 1 }

Write-Host "Checking Cockpit Configuration..." -ForegroundColor Cyan
node tests/test_config.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Checking Terminal Profiles..." -ForegroundColor Cyan
node tests/test_profiles.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Checking Keybindings..." -ForegroundColor Cyan
node tests/test_keybindings.js
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Checking Global CLI..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File tests/test_cli.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "ALL VERIFICATION CHECKS PASSED!" -ForegroundColor Green
```

- [ ] **Step 2: Run end-to-end verification**

Run: `powershell -ExecutionPolicy Bypass -File tests/verify_full_cockpit.ps1`
Expected: All 5 checks pass with exit code 0.

- [ ] **Step 3: Commit and clean temporary test files**

```bash
git add tests/verify_full_cockpit.ps1
git commit -m "test(cockpit): add full automated verification suite"
```
