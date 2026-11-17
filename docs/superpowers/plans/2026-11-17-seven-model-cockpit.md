# 7-Model Multi-Agent Ensemble & OpenCode DeepSeek Integration Plan

## Goal Description
Configure the 7-Model Multi-Agent Cockpit in Antigravity IDE by setting **DeepSeek V4.1 Flash Free** (`opencode/deepseek-v4.1-flash-free`) as the primary active default model for **OpenCode (Top-Right)**, while configuring dedicated Antigravity Terminal Profiles and switcher support for **GLM-5.3-Flash Free**, **MiMo-V2.6-Flash Free**, and the local **OmniRoute bedrock combos** (`auto/coding`, `auto/reasoning`, `auto/free`, `auto/1m`) across both Claude Code and OpenCode.

---

## The 7-Model Cognitive Map

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ANTIGRAVITY IDE (Main Window)                             │
│                  Assistant: Gemini 3.8 Flash High (Google - Orchestrator)               │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│           TOP-LEFT (Claude Code)          │            TOP-RIGHT (OpenCode)            │
│       NVIDIA Nemotron 3 Ultra (550B)      │         DeepSeek V4.1 Flash (Free)         │
│     * Flagship system & heavy coding *    │    * Cognitive diversity & code review *   │
│                                           │  (Quick switches: GLM-5.3, MiMo, Combos)   │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│         BOTTOM-LEFT (Claude Code)         │          BOTTOM-RIGHT (Claude Code)        │
│       NVIDIA Nemotron 3.5 Lightning       │        NVIDIA Nemotron 3.5 Super-VL        │
│       * Sub-second tests & syntax *       │         * 120B Vision & UI layout *        │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
         │                                                        │
         └──────────────────────────┬─────────────────────────────┘
                                    ▼
                OMNIROUTE LOCAL GATEWAY (Port 20128)
         Bedrock Fallback Combos: auto/coding · auto/reasoning
                     auto/free · auto/1m (Gemini)
```

---

## User Review Required

> [!IMPORTANT]
> **OpenCode Default Model Persistence**:
> OpenCode reads its default startup model from `~/.config/opencode/opencode.json`.
> Setting `"model": "opencode/deepseek-v4.1-flash-free"` makes DeepSeek the automatic starting model whenever OpenCode opens in the cockpit or terminal.
> All existing OmniRoute combos (`omniroute/auto/coding`, `omniroute/auto/reasoning`, etc.) remain fully registered in `opencode.json` so you can switch between them at any time using `/model` or the model picker.

> [!NOTE]
> **Terminal Profiles in Antigravity IDE**:
> In addition to the default `OpenCode` profile, we will register dedicated sub-profiles in the terminal `+` dropdown menu:
> 1. `OpenCode: DeepSeek V4.1 (Default)`
> 2. `OpenCode: GLM-5.3 Flash`
> 3. `OpenCode: MiMo-V2.6 Flash`
> This allows you to launch any of the 3 OpenCode free models directly on demand without manually navigating the selector menu.

---

## Open Questions

None. All architectural requirements, model assignments, and layout coordinates have been aligned.

---

## Proposed Changes

### Component 1: OpenCode Global Configuration
Configure `DeepSeek V4.1 Flash Free` as the primary active model in OpenCode.

#### [MODIFY] `C:\Users\kavur\.config\opencode\opencode.json`
- Update root `"model"` attribute from `"omniroute/model/nemotron-3-ultra"` to `"opencode/deepseek-v4.1-flash-free"`.
- Ensure all OmniRoute combos (`auto/coding`, `auto/reasoning`, `auto/free`, `auto/1m`) and local MCP servers (`rea`, `firecrawl`, `context7`) remain intact.

---

### Component 2: Global Cockpit Configuration
Update the global cockpit definition to reflect OpenCode's pinned DeepSeek model.

#### [MODIFY] `C:\Users\kavur\.claudebuild\config.json`
- Update pane `pane-opencode`:
  - `title`: `"OpenCode: DeepSeek V4.1"`
  - `model`: `"opencode/deepseek-v4.1-flash-free"`
  - `command`: `"opencode"`

#### [MODIFY] `c:\Users\kavur\winthread\.vscode\claudebuild.json`
- Mirror the update for workspace local override consistency.

---

### Component 3: Antigravity IDE Terminal Profiles
Add dedicated profiles for the OpenCode models to the terminal `+` dropdown.

#### [MODIFY] `C:\Users\kavur\AppData\Roaming\Antigravity IDE\User\settings.json`
- Update `"OpenCode"` profile title and window label.
- Add profiles for:
  - `"OpenCode: GLM-5.3 Flash"`
  - `"OpenCode: MiMo-V2.6 Flash"`

---

### Component 4: Global CLI `claudebuild`
Add direct subcommands to launch the alternative OpenCode models.

#### [MODIFY] `C:\Users\kavur\.claudebuild\claudebuild.ps1`
- Add support for:
  - `claudebuild glm` (launches OpenCode with GLM-5.3 Flash)
  - `claudebuild mimo` (launches OpenCode with MiMo-V2.6 Flash)
  - `claudebuild deepseek` (alias for `claudebuild opencode`)

#### [MODIFY] `c:\Users\kavur\winthread\scripts\claudebuild.ps1`
- Mirror changes for the repo's internal launcher.

---

## Verification Plan

### Automated Tests
1. **OpenCode Configuration Schema & Default Model Verification**:
   ```bash
   node tests/test_opencode_model.js
   ```
   Validates `C:\Users\kavur\.config\opencode\opencode.json` has `"model": "opencode/deepseek-v4.1-flash-free"`.

2. **Cockpit Configuration Verification**:
   ```bash
   node tests/test_global_config.js
   ```
   Validates `C:\Users\kavur\.claudebuild\config.json` reflects OpenCode DeepSeek in Top-Right quadrant.

3. **Terminal Profiles Registration Verification**:
   ```bash
   node tests/test_global_profiles.js
   ```
   Validates all terminal profiles exist in Antigravity settings.

4. **Full Cockpit Verification Suite**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File tests/verify_global_4pane_cockpit.ps1
   ```
   Executes end-to-end checks across all 4 panes, OmniRoute gateway, and keybindings.

### Manual Verification
1. Press `Ctrl + Alt + C` in Antigravity IDE:
   - Top-Left: Claude Code launches with `model/nemotron-3-ultra`.
   - Top-Right: OpenCode launches with `DeepSeek V4.1 Flash Free` active.
   - Bottom-Left: Claude Code launches with `model/nemotron-3.5-lightning`.
   - Bottom-Right: Claude Code launches with `model/nemotron-3.5-super-vl`.
2. Click `+` in Terminal dropdown:
   - Check that `OpenCode: DeepSeek V4.1`, `OpenCode: GLM-5.3 Flash`, and `OpenCode: MiMo-V2.6 Flash` appear and start independently.
