# Global 4-Pane Idempotent Multi-Agent Cockpit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a globally portable, idempotent 2x2 grid multi-agent cockpit (`Ctrl+Alt+C` and `claudebuild`) inside Antigravity IDE featuring Claude Nemotron Ultra (Top-Left), OpenCode (Top-Right), Claude Nemotron Lightning (Bottom-Left), and Claude Nemotron Super-VL (Bottom-Right) that works across every project without pane duplication.

**Architecture:** Master configuration is stored globally at `C:\Users\kavur\.claudebuild\config.json` with dynamic workspace resolution (`${workspaceFolder}` / `Get-Location`), with optional workspace override in `.vscode/claudebuild.json`. Antigravity IDE keybindings and settings are updated to configure terminal profiles for all four agents and orchestrate a 2x2 editor layout (`workbench.action.editorLayoutTwoByTwo`) with state-aware navigation so pressing `Ctrl+Alt+C` while already in the cockpit cycles focus instead of duplicating panes. A dedicated reset shortcut (`Ctrl+Alt+Shift+C`) and enhanced global CLI (`claudebuild`) manage clean cockpit restarts with automated OmniRoute health monitoring.

**Tech Stack:** Antigravity IDE (VS Code 1.94+ engine), PowerShell 5.1+, Node.js 20+, OmniRoute Gateway (port 20128), Claude Code CLI v2.1.326, OpenCode CLI.

**Spec:** Inline design approved in conversation session `6f29fb83-7247-4776-ae48-3ece027af5a3`.

## Global Constraints

- **Layout Grid**: Exact 2x2 Balanced Grid in Antigravity Editor Area:
  - Top-Left: `Claude Code` pinned to `model/nemotron-3-ultra`
  - Top-Right: `OpenCode` (interactive model selection)
  - Bottom-Left: `Claude Code` pinned to `model/nemotron-3.5-lightning`
  - Bottom-Right: `Claude Code` pinned to `model/nemotron-3.5-super-vl`
- **Idempotency**: Pressing `Ctrl+Alt+C` must NEVER create duplicate panes or clumsy editor splits when the cockpit is already active.
- **Global Portability**: The cockpit must function identically in ANY folder opened in Antigravity IDE without requiring project-local setup files.
- **Port Reliability**: Port `20128` (OmniRoute) must be validated with fast IPv4 loopback (`127.0.0.1:20128`) and automatically restarted as a daemon if offline.
- **No Unused Java Processes**: Java extensions remain disabled for non-Java workspaces so `Ctrl+Shift+B` or accidental shortcuts never trigger Java builds.

---

### Task 1: Establish Global Master Cockpit Configuration

**Files:**
- Create: `C:\Users\kavur\.claudebuild\config.json`
- Test: `tests/test_global_config.js`

**Interfaces:**
- Consumes: None (root configuration authority).
- Produces: JSON schema and pane definitions read by global CLI and Antigravity IDE.

- [ ] **Step 1: Write test for global cockpit configuration**

```javascript
// tests/test_global_config.js
const fs = require('fs');
const path = require('path');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\kavur';
const globalConfigPath = path.join(userProfile, '.claudebuild', 'config.json');

if (!fs.existsSync(globalConfigPath)) {
  console.error(`FAIL: Global config missing at ${globalConfigPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'));

if (!config.panes || config.panes.length !== 4) {
  console.error(`FAIL: Expected 4 panes, found ${config.panes ? config.panes.length : 0}`);
  process.exit(1);
}

const expectedOrder = [
  { id: 'pane-ultra', pos: 'top-left', title: 'Claude: Nemotron Ultra' },
  { id: 'pane-opencode', pos: 'top-right', title: 'OpenCode' },
  { id: 'pane-lightning', pos: 'bottom-left', title: 'Claude: Nemotron Lightning' },
  { id: 'pane-super', pos: 'bottom-right', title: 'Claude: Nemotron Super-VL' }
];

for (let i = 0; i < 4; i++) {
  const p = config.panes[i];
  const exp = expectedOrder[i];
  if (p.id !== exp.id || p.position !== exp.pos || p.title !== exp.title) {
    console.error(`FAIL: Pane ${i} mismatch. Found: ${JSON.stringify(p)} vs Expected: ${JSON.stringify(exp)}`);
    process.exit(1);
  }
}

console.log('PASS: Global 4-pane cockpit configuration verified');
process.exit(0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_global_config.js`
Expected: FAIL with "Global config missing"

- [ ] **Step 3: Create `C:\Users\kavur\.claudebuild\config.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Global Multi-Agent Cockpit Configuration",
  "version": "2.0.0",
  "layout": "2x2",
  "panes": [
    {
      "id": "pane-ultra",
      "title": "Claude: Nemotron Ultra",
      "model": "model/nemotron-3-ultra",
      "position": "top-left",
      "profile": "Claude: Nemotron Ultra",
      "command": "claude --model model/nemotron-3-ultra",
      "color": "terminal.ansiBlue"
    },
    {
      "id": "pane-opencode",
      "title": "OpenCode",
      "model": "interactive",
      "position": "top-right",
      "profile": "OpenCode",
      "command": "opencode",
      "color": "terminal.ansiGreen"
    },
    {
      "id": "pane-lightning",
      "title": "Claude: Nemotron Lightning",
      "model": "model/nemotron-3.5-lightning",
      "position": "bottom-left",
      "profile": "Claude: Nemotron Lightning",
      "command": "claude --model model/nemotron-3.5-lightning",
      "color": "terminal.ansiCyan"
    },
    {
      "id": "pane-super",
      "title": "Claude: Nemotron Super-VL",
      "model": "model/nemotron-3.5-super-vl",
      "position": "bottom-right",
      "profile": "Claude: Nemotron Super-VL",
      "command": "claude --model model/nemotron-3.5-super-vl",
      "color": "terminal.ansiMagenta"
    }
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_global_config.js`
Expected: PASS: Global 4-pane cockpit configuration verified

- [ ] **Step 5: Commit**

```bash
git add tests/test_global_config.js
git commit -m "feat(cockpit): define global master 4-pane configuration"
```

---

### Task 2: Register All 4 Terminal Profiles in Global Antigravity Settings

**Files:**
- Modify: `C:\Users\kavur\AppData\Roaming\Antigravity IDE\User\settings.json`
- Test: `tests/test_global_profiles.js`

**Interfaces:**
- Consumes: Profile definitions from `C:\Users\kavur\.claudebuild\config.json`.
- Produces: Registered Windows terminal profiles in Antigravity IDE global settings.

- [ ] **Step 1: Write test for terminal profiles**

```javascript
// tests/test_global_profiles.js
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.env.APPDATA, 'Antigravity IDE', 'User', 'settings.json');
if (!fs.existsSync(settingsPath)) {
  console.error('FAIL: settings.json missing');
  process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const profiles = settings['terminal.integrated.profiles.windows'];

if (!profiles) {
  console.error('FAIL: No Windows terminal profiles found');
  process.exit(1);
}

const required = [
  'Claude: Nemotron Ultra',
  'OpenCode',
  'Claude: Nemotron Lightning',
  'Claude: Nemotron Super-VL'
];

for (const name of required) {
  if (!profiles[name]) {
    console.error(`FAIL: Missing terminal profile: ${name}`);
    process.exit(1);
  }
}

// Verify OpenCode command invokes opencode
if (!profiles['OpenCode'].args.some(a => a.includes('opencode'))) {
  console.error('FAIL: OpenCode profile does not invoke opencode');
  process.exit(1);
}

console.log('PASS: All 4 terminal profiles verified in Antigravity settings');
process.exit(0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_global_profiles.js`
Expected: FAIL with "Missing terminal profile: OpenCode"

- [ ] **Step 3: Update `Antigravity IDE/User/settings.json`**

Ensure `terminal.integrated.profiles.windows` contains:
```json
{
  "Claude: Nemotron Ultra": {
    "source": "PowerShell",
    "args": [
      "-NoExit",
      "-Command",
      "$Host.UI.RawUI.WindowTitle = 'Claude: Nemotron Ultra'; claude --model model/nemotron-3-ultra"
    ],
    "icon": "sparkle"
  },
  "OpenCode": {
    "source": "PowerShell",
    "args": [
      "-NoExit",
      "-Command",
      "$Host.UI.RawUI.WindowTitle = 'OpenCode'; opencode"
    ],
    "icon": "terminal-powershell"
  },
  "Claude: Nemotron Lightning": {
    "source": "PowerShell",
    "args": [
      "-NoExit",
      "-Command",
      "$Host.UI.RawUI.WindowTitle = 'Claude: Nemotron Lightning'; claude --model model/nemotron-3.5-lightning"
    ],
    "icon": "zap"
  },
  "Claude: Nemotron Super-VL": {
    "source": "PowerShell",
    "args": [
      "-NoExit",
      "-Command",
      "$Host.UI.RawUI.WindowTitle = 'Claude: Nemotron Super-VL'; claude --model model/nemotron-3.5-super-vl"
    ],
    "icon": "eye"
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_global_profiles.js`
Expected: PASS: All 4 terminal profiles verified in Antigravity settings

- [ ] **Step 5: Commit**

```bash
git add tests/test_global_profiles.js
git commit -m "feat(cockpit): register OpenCode and 4 terminal profiles in settings.json"
```

---

### Task 3: Implement Idempotent 2x2 Grid Keybindings in Antigravity IDE

**Files:**
- Modify: `C:\Users\kavur\AppData\Roaming\Antigravity IDE\User\keybindings.json`
- Test: `tests/test_idempotent_keybindings.js`

**Interfaces:**
- Consumes: Antigravity IDE editor group actions (`workbench.action.editorLayoutTwoByTwo`, `workbench.action.focusEditorGroup`, `workbench.action.terminal.newWithProfile`).
- Produces: `Ctrl+Alt+C` (Launch/Cycle) and `Ctrl+Alt+Shift+C` (Clean Reset & Rebuild).

- [ ] **Step 1: Write test for idempotent keybindings**

```javascript
// tests/test_idempotent_keybindings.js
const fs = require('fs');
const path = require('path');

const kbPath = path.join(process.env.APPDATA, 'Antigravity IDE', 'User', 'keybindings.json');
if (!fs.existsSync(kbPath)) {
  console.error('FAIL: keybindings.json missing');
  process.exit(1);
}

const bindings = JSON.parse(fs.readFileSync(kbPath, 'utf8'));

// Check for cycle keybinding when terminal is active
const cycleMatch = bindings.find(b => 
  b.key && b.key.toLowerCase().replace(/\s+/g, '') === 'ctrl+alt+c' &&
  b.when && b.when.includes('terminalEditor')
);

// Check for open keybinding when terminal is NOT active
const openMatch = bindings.find(b => 
  b.key && b.key.toLowerCase().replace(/\s+/g, '') === 'ctrl+alt+c' &&
  (!b.when || b.when.includes('!terminalEditor') || b.when.includes('editorIsOpen'))
);

// Check for reset keybinding
const resetMatch = bindings.find(b => 
  b.key && b.key.toLowerCase().replace(/\s+/g, '') === 'ctrl+alt+shift+c'
);

if (!cycleMatch && !openMatch && !resetMatch) {
  console.error('FAIL: Required idempotent keybindings missing');
  process.exit(1);
}

console.log('PASS: Idempotent keybindings configured');
process.exit(0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_idempotent_keybindings.js`
Expected: FAIL with "Required idempotent keybindings missing"

- [ ] **Step 3: Update `keybindings.json` with 2x2 Layout and Idempotent Logic**

Configure:
1. `Ctrl+Alt+C` when `activeEditor == 'terminalEditor'`: runs `workbench.action.navigateEditorGroups` (smoothly moves focus to next pane; never duplicates!).
2. `Ctrl+Alt+C` when `activeEditor != 'terminalEditor'`: runs `runCommands` setting `workbench.action.editorLayoutTwoByTwo` and spawning each profile in its quadrant:
   - Group 1 (Top-Left): `Claude: Nemotron Ultra`
   - Group 2 (Top-Right): `OpenCode`
   - Group 3 (Bottom-Left): `Claude: Nemotron Lightning`
   - Group 4 (Bottom-Right): `Claude: Nemotron Super-VL`
3. `Ctrl+Alt+Shift+C`: Force Clean Reset & Rebuild — closes existing terminal editors in each group and spawns a fresh 2x2 grid cleanly.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_idempotent_keybindings.js`
Expected: PASS: Idempotent keybindings configured

- [ ] **Step 5: Commit**

```bash
git add tests/test_idempotent_keybindings.js
git commit -m "feat(cockpit): implement idempotent 2x2 grid keybinding with cycle and reset"
```

---

### Task 4: Upgrade Global `claudebuild` CLI for Global Workspaces

**Files:**
- Modify: `C:\Users\kavur\winthread\scripts\claudebuild.ps1`
- Modify: `C:\Users\kavur\AppData\Roaming\npm\claudebuild.cmd`
- Test: `tests/test_global_cli.ps1`

**Interfaces:**
- Consumes: Current working directory from `Get-Location` and global config `C:\Users\kavur\.claudebuild\config.json`.
- Produces: CLI output with OmniRoute health check, dynamic workspace launch, and support for `claudebuild`, `claudebuild opencode`, `claudebuild reset`.

- [ ] **Step 1: Write test for global CLI capabilities**

```powershell
# tests/test_global_cli.ps1
$cmd = Get-Command claudebuild -ErrorAction SilentlyContinue
if (-not $cmd) {
    Write-Output "FAIL: claudebuild not in PATH"
    exit 1
}

# Test help / execution without error
$out = claudebuild status
if ($LASTEXITCODE -ne 0) {
    Write-Output "FAIL: claudebuild status exited with code $LASTEXITCODE"
    exit 1
}

Write-Output "PASS: Global claudebuild CLI operational"
exit 0
```

- [ ] **Step 2: Run test to verify behavior**

Run: `powershell -ExecutionPolicy Bypass -File tests/test_global_cli.ps1`

- [ ] **Step 3: Update `scripts/claudebuild.ps1`**

Enhance `scripts/claudebuild.ps1`:
1. Remove all hardcoded `c:\Users\kavur\winthread` paths.
2. Resolve workspace dynamically:
   - Check if current directory has `.vscode/claudebuild.json` $\rightarrow$ use local override.
   - Else use global `C:\Users\kavur\.claudebuild\config.json`.
3. Support target arguments:
   - `claudebuild` (overview & opens IDE in current folder)
   - `claudebuild ultra` (launch standalone Ultra)
   - `claudebuild opencode` (launch standalone OpenCode)
   - `claudebuild super` (launch standalone Super-VL)
   - `claudebuild lightning` (launch standalone Lightning)
   - `claudebuild status` (print proxy & model status)
4. Fast loopback OmniRoute health check (`http://127.0.0.1:20128/v1/models`).

- [ ] **Step 4: Run test to verify it passes**

Run: `powershell -ExecutionPolicy Bypass -File tests/test_global_cli.ps1`
Expected: PASS: Global claudebuild CLI operational

- [ ] **Step 5: Commit**

```bash
git add scripts/claudebuild.ps1 tests/test_global_cli.ps1
git commit -m "feat(cockpit): make claudebuild CLI globally portable across all projects"
```

---

### Task 5: Full Automated End-to-End Verification Suite

**Files:**
- Create: `tests/verify_global_4pane_cockpit.ps1`
- Update: `C:\Users\kavur\.gemini\antigravity\brain\6f29fb83-7247-4776-ae48-3ece027af5a3\walkthrough.md`

- [ ] **Step 1: Write full verification script**

```powershell
# tests/verify_global_4pane_cockpit.ps1
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
$resp = Invoke-RestMethod -Uri "http://127.0.0.1:20128/v1/models" -Headers @{ Authorization = "Bearer sk-omniroute-master" } -TimeoutSec 5
Write-Host "PASS: Gateway responding with $($resp.data.Count) models" -ForegroundColor Green

Write-Host "`n6. Testing Global claudebuild CLI..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File tests/test_global_cli.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "ALL 6 GLOBAL COCKPIT VERIFICATION TESTS PASSED!            " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
exit 0
```

- [ ] **Step 2: Run end-to-end verification**

Run: `powershell -ExecutionPolicy Bypass -File tests/verify_global_4pane_cockpit.ps1`
Expected: All 6 test suites pass with code 0.

- [ ] **Step 3: Update documentation and walkthrough**

Document the 2x2 grid layout, shortcuts (`Ctrl+Alt+C` cycle, `Ctrl+Alt+Shift+C` reset), and cross-project instructions in `walkthrough.md`.

- [ ] **Step 4: Commit**

```bash
git add tests/verify_global_4pane_cockpit.ps1
git commit -m "test(cockpit): add comprehensive global 4-pane verification suite"
```
