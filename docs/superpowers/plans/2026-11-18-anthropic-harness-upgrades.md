# Master Plan: Antigravity IDE 2x2 Grid Fix & Global Anthropic Harness Upgrades

## Goal Description
1. **Resolve `command 'workbench.action.editorLayoutTwoByTwo' not found`**: Fix the Antigravity IDE keybinding by replacing the invalid command name with verified engine commands (`workbench.action.editorLayoutTwoByTwoGrid` and the 4-quadrant split sequence) so `Ctrl+Alt+C` builds the exact 2x2 layout without errors.
2. **Global Implementation of Anthropic Harness Upgrades**:
   - Apply **Hard Deny Rules** globally in `C:\Users\kavur\.claude\settings.json` so that `.env` reads, credential exfiltration, and destructive git commands are blocked in **every project** on your system.
   - Install **Exit Code 2 Self-Healing Hooks** globally in `C:\Users\kavur\.claude\hooks\post-edit-typecheck.ps1` and register them in global `settings.json` so every TypeScript/JavaScript project automatically forces Claude to self-correct compilation errors.
   - Optimize `C:\Users\kavur\.claude\CLAUDE.md` globally with Karpathy's core behavioral tenets and clean non-code routing maps.

---

## Why the Error Occurred & The Test Gap

> [!WARNING]
> **Root Cause**:
> In VS Code / Antigravity IDE, the internal command ID for 2x2 grid layout is:
> `workbench.action.editorLayoutTwoByTwoGrid` (with the word **`Grid`** at the end).
> Our previous keybinding called `workbench.action.editorLayoutTwoByTwo` (missing `Grid`), which triggered the red popup:
> `command 'workbench.action.editorLayoutTwoByTwo' not found`.
>
> **The Test Gap**:
> The automated test `test_idempotent_keybindings.js` verified that `keybindings.json` had valid JSON syntax, but it did not query the Antigravity IDE binary (`workbench.desktop.main.js`) to confirm the command ID was registered in the engine.
>
> **The Verified Fix**:
> We inspected `workbench.desktop.main.js` and confirmed the exact registered commands:
> - `workbench.action.terminal.newWithProfile` $\rightarrow$ **`true`**
> - `workbench.action.splitEditorRight` $\rightarrow$ **`true`**
> - `workbench.action.splitEditorDown` $\rightarrow$ **`true`**
> - `workbench.action.focusFirstEditorGroup` $\rightarrow$ **`true`**
> - `workbench.action.navigateEditorGroups` $\rightarrow$ **`true`**
> - `workbench.action.editorLayoutTwoByTwoGrid` $\rightarrow$ **`true`**

---

## The 4-Quadrant Split Sequence for 100% Reliable 2x2 Grid

To guarantee that the 2x2 grid never closes empty groups or fails, the sequence runs:

```
Step 1: Open Top-Left (Claude: Nemotron Ultra) in Editor
Step 2: Split Right -> creates Top-Right
Step 3: Open Top-Right (OpenCode: DeepSeek V4.1) in Editor
Step 4: Split Down on Top-Right -> creates Bottom-Right
Step 5: Open Bottom-Right (Claude: Nemotron Super-VL) in Editor
Step 6: Focus First Group (Top-Left)
Step 7: Split Down on Top-Left -> creates Bottom-Left
Step 8: Open Bottom-Left (Claude: Nemotron Lightning) in Editor
Step 9: Focus First Group (Top-Left)
```

**Grid Result**:
```text
┌─────────────────────────────────┬─────────────────────────────────┐
│           TOP-LEFT              │           TOP-RIGHT             │
│    Claude: Nemotron Ultra       │    OpenCode: DeepSeek V4.1      │
│   (model/nemotron-3-ultra)      │(opencode/deepseek-v4.1-flash)   │
├─────────────────────────────────┼─────────────────────────────────┤
│          BOTTOM-LEFT            │          BOTTOM-RIGHT           │
│   Claude: Nemotron Lightning    │    Claude: Nemotron Super-VL    │
│ (model/nemotron-3.5-lightning)  │  (model/nemotron-3.5-super-vl)  │
└─────────────────────────────────┴─────────────────────────────────┘
```

When inside any cockpit terminal (`activeEditor == 'terminalEditor'`), pressing `Ctrl+Alt+C` executes `workbench.action.navigateEditorGroups`, smoothly moving focus to the next quadrant without duplicating.

---

## Deep Dive: Video Transcript Analysis & All Actionable Upgrades

From analyzing every timestamp of Lydia Hallie's talk, here is the complete taxonomy of upgrades:

| # | Pillar from Talk | What It Is | Why It Matters | Status in Our Workspace |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Hard Deny Rules** | Permission deny-list in `settings.json` evaluated *before* the model or Auto Mode runs. | If Claude reads an API key or pushes bad code to main, you *cannot take it back*. Prompt rules fail; settings deny-rules never fail. | **To Implement Now (Upgrade 1)** |
| **2** | **Exit Code 2 Hooks** | Post-edit scripts that run compiler/linter checks and exit with code `2` on failure. | Exit code `1` marks a task complete. Exit code `2` forces Claude back to self-heal and fix the code before handing it to you. | **To Implement Now (Upgrade 2)** |
| **3** | **CLAUDE.md Routing Map** | Replace all-caps prompt yelling with a file/feature routing map. | Modern frontier models (Opus 5.5, Nemotron Ultra, Gemini 3.8) get confused by redundant all-caps rules. They need the non-code directory map. | **To Implement Now (Upgrade 3)** |
| **4** | **Auto Mode Trust Boundaries** | Run `/auto mode setup` or declare trusted directories in `settings.json`. | Eliminates prompt approval fatigue while catching 89% of dangerous commands via the dedicated classifier. | **To Implement in Settings** |
| **5** | **Local OS Sandboxing** | Using `/sandbox` to bound filesystem & network egress. | Protects secrets if an external `npm` dependency or test script is compromised. | Available on demand (`/sandbox`) |
| **6** | **Session Orchestrator** | 1 coordinator session plans and delegates to worker threads. | Frees you from being a typist; turns you into a manager of sessions. | **Already Built! (Our 2x2 Cockpit)** |
| **7** | **Fresh-Context PR Review** | A fresh Claude session reviews PRs before humans do. | Catches 90% of bugs with zero context bias. | Available via `superpowers:requesting-code-review` |

---

## Proposed Changes

### Component 1: Fix Keybindings in Antigravity IDE
#### [MODIFY] `C:\Users\kavur\AppData\Roaming\Antigravity IDE\User\keybindings.json`
- Replace invalid command name with the tested 4-quadrant split sequence.
- Keep `Ctrl+Alt+C` cycle on `activeEditor == 'terminalEditor'`.
- Configure `Ctrl+Alt+Shift+C` clean reset.

#### [MODIFY] `C:\Users\kavur\AppData\Roaming\Antigravity IDE\User\settings.json`
- Add `"workbench.editor.closeEmptyGroups": false` to prevent editor groups from collapsing when switching editors.

---

### Component 2: Global Hard Deny Rules
#### [MODIFY] `C:\Users\kavur\.claude\settings.json`
Add the global `permissions.deny` block:

```json
{
  "permissions": {
    "deny": [
      "Read(.env*)",
      "Read(**/.env*)",
      "Read(*id_rsa*)",
      "Read(*id_ed25519*)",
      "Read(**/credentials.json)",
      "Bash(git push*--force*)",
      "Bash(git push*origin main*)",
      "Bash(git push*origin master*)",
      "Bash(rm -rf /*)",
      "Bash(rmdir /s /q C:\\*)"
    ]
  }
}
```

---

### Component 3: Global Exit Code 2 Self-Healing Hook
#### [NEW] `C:\Users\kavur\.claude\hooks\post-edit-typecheck.ps1`
Global hook script that checks if `tsconfig.json` exists in the active folder, runs `npx --no-install tsc --noEmit`, and on failure **exits with code 2** to force Claude into its self-healing loop.

#### [MODIFY] `C:\Users\kavur\.claude\settings.json`
Register the hook globally in `hooks.PostToolUse`.

---

### Component 4: Global `CLAUDE.md` Hygiene & Routing Map
#### [MODIFY] `C:\Users\kavur\.claude\CLAUDE.md`
Combine Karpathy's core heuristics (Simplicity First, Surgical Changes, Think Before Coding) with clean non-code routing maps.

---

## Verification Plan

### Automated Tests
1. **Engine Command ID Verification**:
   ```bash
   node tests/verify_engine_commands.js
   ```
   Directly scans `workbench.desktop.main.js` and asserts that every command in `keybindings.json` is a real, registered command in Antigravity IDE.

2. **Global Deny Rules Test**:
   ```bash
   node tests/test_global_deny_rules.js
   ```
   Asserts `C:\Users\kavur\.claude\settings.json` has `permissions.deny` with all irreversible targets.

3. **Exit Code 2 Hook Test**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File tests/test_exit_code_2.ps1
   ```
   Verifies:
   - Clean compilation exits with `0`.
   - Syntax or type errors exit with `2`.

4. **Global Portability Test**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File tests/verify_global_4pane_cockpit.ps1
   ```
   Verifies all 7 checks pass across arbitrary folders.

### Manual Verification
1. Press `Ctrl + Alt + C` in Antigravity IDE:
   - No red popup!
   - Opens the clean 2x2 grid immediately.
   - Pressing `Ctrl + Alt + C` again cycles focus between quadrants.
2. In Claude Code:
   - Attempting `Read(.env)` is blocked instantly by hard deny rules.
   - Introducing an invalid type triggers Exit Code 2 and causes Claude to auto-fix the code.
