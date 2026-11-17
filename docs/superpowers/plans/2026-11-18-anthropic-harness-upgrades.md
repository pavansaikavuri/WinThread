# Anthropic Engineering Harness Implementation Plan: Hard Deny Rules & Exit Code 2 Self-Healing Hooks

## Goal Description
Implement the production engineering best practices revealed by **Lydia Hallie** (Anthropic Claude Code Team) into your local Claude Code and `winthread` environment:
1. **Hard Deny Rules** in `~/.claude/settings.json` enforcing the *"Can I Take It Back?"* rule (blocking `.env`, credential reads, destructive deletions, and direct pushes to main).
2. **Automated Post-Edit Verification Hook with Exit Code 2** that automatically runs TypeScript compilation checks upon file edits and, on failure, exits with code `2` to trigger Claude Code's native self-healing loop.
3. **`CLAUDE.md` Routing Map Optimization** preserving Karpathy's core behavioral meta-heuristics while eliminating confusing all-caps fluff and injecting an explicit non-code routing map.

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

## Detailed Breakdown: How Actionable Upgrade 3 Works (Karpathy's `CLAUDE.md`)

You asked:
> *"How does 3 Actionable Upgrades work and what exactly is it? To edit Karpathy's claude.md file which we have set before for claude?"*

### 1. Karpathy vs. Lydia: Where They Agree and Where They Differ
* **Where They Agree 100%**:
  * **Simplicity First**: Both Andrej Karpathy and Lydia Hallie emphasize *minimal code, zero speculative features, no premature abstractions*.
  * **Surgical Changes**: Both emphasize *touching only what you must, never damaging adjacent working code*.
  * **Goal-Driven Loops**: Both insist on verifiable tests rather than blind trust.
* **Where Lydia Updates Earlier Habits**:
  * In earlier models (e.g., Opus 4.5), users filled `CLAUDE.md` with:
    ```markdown
    IMPORTANT: NEVER EVER USE ANY TYPES! ALWAYS FORMAT WITH PRETTIER! NEVER READ ENV FILES!
    ```
  * Lydia's research at Anthropic proves:
    1. On frontier models (Opus 5.5, Nemotron 3 Ultra, Gemini 3.8), **ALL CAPS and emotional words (`NEVER`, `CRITICAL`) actually degrade performance**. They distort attention weight and cause more unnecessary tool calls.
    2. **"Could Claude figure this out by reading the code?"** If a rule simply repeats standard TypeScript or Next.js behavior that is already obvious in `tsconfig.json` or `package.json`, it is dead weight that clutters context.
    3. **Prompt instructions are not security permissions**. Telling Claude "Never read `.env`" in `CLAUDE.md` is fragile. Putting `"Read(.env*)"` in the `permissions.deny` block of `settings.json` is ironclad.

### 2. What Stays vs. What Changes in `CLAUDE.md`
* **What Stays**:
  * Karpathy's core behavioral meta-rules (State assumptions explicitly, No speculative configurability, Clean up own orphans, Loop until verified).
* **What Gets Removed**:
  * Any repetitive all-caps prompt yelling.
* **What Gets Added (The "Routing Map")**:
  * The directory layout Claude *cannot* deduce without wasting 15 file-search tool calls:
    * `docs/features/`: Feature specifications and user flows.
    * `docs/reference/`: Architecture diagrams, DB schema, API contracts.
    * `scripts/`: Cockpit launchers and utility scripts.
    * `tests/`: Automated test suites.
    * Primary build & dev commands (`npm run dev`, `npm run build`, `claudebuild`).

---

## Proposed Changes

### Component 1: Hard Deny Rules in Global Claude Settings

#### [MODIFY] `C:\Users\kavur\.claude\settings.json`
Add the `permissions` block with hard-deny rules:

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

### Component 2: Exit Code 2 Self-Healing Verification Hook

#### [NEW] `C:\Users\kavur\.claude\hooks\post-edit-typecheck.ps1`
A lightweight script executed on every file edit that runs TypeScript compilation (`tsc --noEmit`). If any type errors or syntax mistakes exist:
* Prints the error diagnostics to stdout/stderr.
* **Exits with code `2`**, forcing Claude Code to immediately enter its self-healing loop and fix the error before completing the turn.
* If compilation succeeds, exits with code `0`.

```powershell
# C:\Users\kavur\.claude\hooks\post-edit-typecheck.ps1
$ErrorActionPreference = "SilentlyContinue"

# Check if current directory has a TypeScript project
if (Test-Path "tsconfig.json") {
    $out = npx --no-install tsc --noEmit 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "TypeScript compilation failed after edit:" -ForegroundColor Red
        Write-Host $out
        # Exit code 2 tells Claude Code to self-heal and fix the error
        exit 2
    }
}
exit 0
```

#### [MODIFY] `C:\Users\kavur\.claude\settings.json`
Register the hook in the global settings under `hooks`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -ExecutionPolicy Bypass -File \"C:/Users/kavur/.claude/hooks/post-edit-typecheck.ps1\""
          }
        ]
      }
    ]
  }
}
```

---

### Component 3: Optimized `CLAUDE.md` with Project Routing Map

#### [MODIFY] `C:\Users\kavur\.claude\CLAUDE.md`
Transform the file into an efficient, clean guide combining Karpathy's core behavioral tenets with Lydia's non-code routing map.

```markdown
# AI Engineering Guidelines & Project Routing Map

## 1. Project Routing Map
- `app/`: Next.js 16 App Router pages and server components.
- `docs/features/`: Feature specs (01-setup-wizard, 02-signal-feed, etc.).
- `docs/reference/`: Architecture, database schema, and design contracts.
- `scripts/`: Tooling and cockpit launchers (`claudebuild.ps1`).
- `tests/`: Automated test suites and verification scripts.
- Commands: `npm run dev` (development), `npm run build` (production build), `claudebuild` (4-pane cockpit).

## 2. Core Behavioral Tenets (Karpathy Heuristics)
- **Think Before Coding**: State assumptions explicitly. Surface tradeoffs before editing.
- **Simplicity First**: Write the minimum code that solves the immediate problem. No speculative configurability or premature abstractions.
- **Surgical Changes**: Touch only what you must. Preserve surrounding code and match repo style. Clean up your own unused imports/variables.
- **Goal-Driven Execution**: Define success criteria upfront. Verify with test commands after every step.
```

---

## Verification Plan

### Automated Tests
1. **Deny Rules Verification**:
   ```bash
   node tests/test_deny_rules.js
   ```
   Validates that `permissions.deny` in `~/.claude/settings.json` contains blocks for `.env*`, `git push --force`, and `git push origin main`.

2. **Exit Code 2 Hook Verification**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File tests/test_exit_code_2_hook.ps1
   ```
   Validates:
   - When TypeScript compiles cleanly $\rightarrow$ script exits with code `0`.
   - When TypeScript contains a deliberate syntax/type error $\rightarrow$ script exits with code `2`.

3. **CLAUDE.md Hygiene & Routing Map Verification**:
   ```bash
   node tests/test_claude_md_hygiene.js
   ```
   Validates that `~/.claude/CLAUDE.md` contains the directory routing map and no all-caps yelling.

### Manual Verification
1. Run `claude` in terminal and attempt `Read(.env)`:
   - Claude Code should immediately block the read with a permission denial without even executing.
2. Edit a TypeScript file to introduce an invalid type:
   - Claude Code's post-edit hook fires, receives exit code 2, and automatically fixes the type error before finishing.
