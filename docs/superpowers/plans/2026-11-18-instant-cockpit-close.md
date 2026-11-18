# Implementation Plan: Instant 2x2 Cockpit Close (`Ctrl + Alt + X`) & Zero-Prompt Termination

## Goal Description
Provide a seamless, single-keystroke shortcut (**`Ctrl + Alt + X`**) right next to **`Ctrl + Alt + C`** that closes all 4 terminals in the 2×2 cockpit simultaneously, eliminates the repetitive "Terminate" confirmation prompts, returns the editor to a clean single layout (`editorLayoutSingle`), and explains/addresses the lock symbol (`[ 🔒 ]`) on terminal editor groups.

---

## 1. Deep Dive: Explaining Your Two Observations

### Why did you have to click "Terminate" 4 times with `Ctrl + W`?
In Antigravity IDE (and VS Code), there is a built-in safety setting:
`"terminal.integrated.confirmOnKill": "editor"` (default)
Whenever an active process (such as Claude Code, OpenCode, or PowerShell) is running inside an editor tab, closing that tab triggers a warning modal:
> *"The terminal has active processes. Do you want to terminate them?"* with a primary **Terminate** button.

Because you had 4 panes open, you had to press `Ctrl + W` and click **Terminate** 4 separate times.

**The Fix**:
By setting `"terminal.integrated.confirmOnKill": "never"` in `settings.json`, the IDE closes all terminals immediately without asking for confirmation.

---

### What does the Lock Symbol `[ 🔒 ]` on each pane mean?
In Antigravity IDE / VS Code, the setting `workbench.editor.autoLockGroups` has `"terminalEditor": true` enabled by default.

When an editor group displays a lock icon (`[ 🔒 ]`):
- It means the group is **locked against accidental file opening**.
- If you click a code file in the Explorer (such as `package.json` or `App.tsx`), Antigravity IDE **will not overwrite your running Claude/OpenCode terminal**. Instead, it opens the file in another group.
- It is **not** a lock preventing you from closing or typing in the terminal; it is a shield preventing files from replacing your active terminals.

We can either:
1. **Keep it as is** (recommended), because it protects your terminals from accidental replacement while still allowing `Ctrl + Alt + X` to close them instantly.
2. Or disable it by adding `"workbench.editor.autoLockGroups": { "terminalEditor": false }` if you prefer the lock icons to not appear.

---

## 2. Proposed Shortcut: `Ctrl + Alt + X`

Because `X` is physically right next to `C` on your keyboard (`Z - X - C` row):
- **`Ctrl + Alt + C`**: Builds the 2×2 Cockpit or cycles focus between quadrants.
- **`Ctrl + Alt + X`**: **Instantly closes all 4 quadrants** and collapses the editor back to a single clean window.

### Command Execution Sequence for `Ctrl + Alt + X`:
```
Step 1: Focus Fourth Editor Group (Bottom-Right: Claude Super-VL) -> Close Active Editor
Step 2: Focus Third Editor Group (Bottom-Left: Claude Lightning)  -> Close Active Editor
Step 3: Focus Second Editor Group (Top-Right: OpenCode DeepSeek)   -> Close Active Editor
Step 4: Focus First Editor Group (Top-Left: Claude Ultra)        -> Close Active Editor
Step 5: Reset Editor Layout to Single (workbench.action.editorLayoutSingle)
```

Because `"terminal.integrated.confirmOnKill": "never"` is active, all 4 terminals terminate simultaneously and disappear instantly with **zero modal prompts**.

---

## User Review Required

> [!IMPORTANT]
> **Keybinding Choice**:
> We are assigning **`Ctrl + Alt + X`** for closing all 4 terminals. If you press `Ctrl + Alt + X` while terminal tabs are active, it will terminate all 4 sessions immediately and return to a clean 1-pane editor layout.

---

## Proposed Changes

### Component 1: Antigravity IDE Settings
#### [MODIFY] `C:\Users\kavur\AppData\Roaming\Antigravity IDE\User\settings.json`
- Add `"terminal.integrated.confirmOnKill": "never"` to suppress the "Terminate" modal popups.
- Optionally add `"workbench.editor.autoLockGroups": { "terminalEditor": false }` if you do not want the lock symbol visible.

---

### Component 2: Antigravity IDE Keybindings
#### [MODIFY] `C:\Users\kavur\AppData\Roaming\Antigravity IDE\User\keybindings.json`
- Register `ctrl+alt+x` to sequentially close active editors in groups 4, 3, 2, 1 and call `workbench.action.editorLayoutSingle`.

```json
{
  "key": "ctrl+alt+x",
  "command": "runCommands",
  "args": {
    "commands": [
      { "command": "workbench.action.focusFourthEditorGroup" },
      { "command": "workbench.action.closeActiveEditor" },
      { "command": "workbench.action.focusThirdEditorGroup" },
      { "command": "workbench.action.closeActiveEditor" },
      { "command": "workbench.action.focusSecondEditorGroup" },
      { "command": "workbench.action.closeActiveEditor" },
      { "command": "workbench.action.focusFirstEditorGroup" },
      { "command": "workbench.action.closeActiveEditor" },
      { "command": "workbench.action.editorLayoutSingle" }
    ]
  }
}
```

---

### Component 3: Global CLI Banner & Documentation
#### [MODIFY] `C:\Users\kavur\.claudebuild\scripts\claudebuild.ps1`
- Update the printed banner to list both shortcuts:
  ```text
  Shortcuts     : Ctrl + Alt + C       (Open 2x2 Grid / Cycle Focus)
                  Ctrl + Alt + Shift + C (Force Clean Reset & Rebuild)
                  Ctrl + Alt + X       (Instant Close & Reset to Single Layout)
  ```

---

## Verification Plan

### Automated Tests
1. **Engine Command ID Verification**:
   ```powershell
   node tests/verify_engine_commands.js
   ```
   Asserts that `workbench.action.editorLayoutSingle` and all focus/close commands in `keybindings.json` are registered in `workbench.desktop.main.js`.
2. **Instant Close Keybinding & Settings Test**:
   ```powershell
   node tests/test_instant_close_config.js
   ```
   Validates:
   - `keybindings.json` contains `ctrl+alt+x` mapping to the 4-group close sequence and `editorLayoutSingle`.
   - `settings.json` contains `"terminal.integrated.confirmOnKill": "never"`.
3. **Full 11-Check Cockpit & Harness Verification Suite**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File tests/verify_global_4pane_cockpit.ps1
   ```
   Confirms all checks pass with exit code 0.

### Manual Verification
1. Open the 2×2 cockpit with `Ctrl + Alt + C`.
2. Press `Ctrl + Alt + X`:
   - All 4 terminals terminate instantly.
   - Zero "Terminate" dialog popups appear.
   - The editor layout smoothly returns to 1 clean single layout.
