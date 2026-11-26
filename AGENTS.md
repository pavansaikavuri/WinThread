<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# WinThread Master AI Agent Guidelines & Shared Knowledge Map

Behavioral guidelines derived from **Andrej Karpathy's principles**, unified with the **OmniRoute Gateway (:20128)** and the **Obsidian Concept Wiki memory architecture**.

## 1. Universal Shared Knowledge Base (Karpathy LLM-Wiki / Obsidian)
Your shared permanent memory across Antigravity IDE, Claude Code, and OpenCode is located at:
- **`C:\Users\kavur\Brain`**: Universal Obsidian Concept Wiki:
  - `raw/`: Read-only source documents.
  - `wiki/`: Atomic concept notes linked with `[[wiki-links]]`.
  - `index.md`: Catalog of all concepts with one-line descriptions.
  - `log.md`: Append-only history of updates (`## [YYYY-MM-DD] ingest | Title`).
  - `.scripts/wiki-lint.js`: Health linter (`node C:\Users\kavur\Brain\.scripts\wiki-lint.js`).

### Step 0: Mandatory Knowledge & Memory Check (Automated Invariant)
Before answering architectural questions, designing features, or implementing changes:
1. Read `C:\Users\kavur\Brain\index.md` to check existing architectural patterns, post-mortems, and entity schemas.
2. If the task relates to an existing concept, read its `wiki/<concept>.md` note before writing any code.
3. If introducing a permanent architectural decision or solving a non-trivial bug, append a concept note to `C:\Users\kavur\Brain\wiki/` and run `node C:\Users\kavur\Brain\.scripts\wiki-lint.js`.

### How to Use the Shared Memory:
- **On Complex Decisions / Architecture:** Check `C:\Users\kavur\Brain\index.md` to review established patterns, entity definitions, and historical post-mortems before proposing new designs.
- **On Establishing New Patterns / Solved Bugs:** When establishing a permanent rule or solving a hard bug in WinThread, append a concept note to `C:\Users\kavur\Brain\wiki/` and record an entry in `index.md` & `log.md`.

## 2. Project Specs Map
- `docs/PLAYBOOK.md`: The 8-Stage Engineering Pipeline, models, and cockpit controls.
- `docs/features/`: Feature specifications (`01-setup-wizard.md`, `02-signal-feed.md`, etc.).
- `docs/PRD.md` & `docs/DATABASE.md`: Core requirements and Supabase schema contracts.
- `docs/research/`: Competitive reverse-engineering & deep architectural research.

## 3. The Option X Invariant & Anti-Blindspot Rules (Automated Defense Harness)
To prevent statistical regression to the mean (2015-era CRUD mediocrity) and the 6 AI blind spots:

### Rule 1: Banned Legacy Defaults (The Option X Mandate)
- **NO Manual Drag-and-Drop Kanban** where event-triggered automated state transitions are possible.
- **NO Single-Tier Flat Pricing** where 3-tier psychological anchoring (Core / Recommended / Retainer) applies.
- **NO Password-Walled Portals** for client quote approvals. Always use cryptographic, tokenized micro-portals (BLAKE3 signature + expiration).
- **NO Manual Tax Inputs.** Statutory compliance (GST Luhn-mod-36 checksum, CGST/SGST/IGST split, Indian LUT export disclaimers) must be deterministically calculated in code.
- **NO Dead-End Loss Logging.** Loss attribution must be split (Lead Fit vs. Execution) with auto-generated downsell resuscitation triggers.

### Rule 2: The Reality Grounding Invariant (Anti-Mock Law)
- Passing mocked tests (`vi.mock`) is **necessary but never sufficient**.
- An implementation is NOT complete until:
  1. `npx tsc --noEmit` compiles with 0 errors.
  2. `npm test` passes all unit and integration suites without mock drift.
  3. `npm run build` succeeds with Turbopack.
  4. Live routes are verified via HTTP inspection (`curl -I`) and browser rendering without SSR crashes (`ERROR 108BS75701`).

### Rule 3: Adversarial Gatekeeping (Separation of Powers)
- Never allow builder agents to grade their own architecture.
- All non-trivial plans must undergo adversarial review (`egm-design` / `doubt-driven-development`) to expose hidden failure modes, edge cases, and sycophantic assumptions before code is written.

### Rule 4: Externalized Memory Invariant
- Any solved bug, architectural decision, or statutory formula must be recorded as an atomic concept note in `C:\Users\kavur\Brain\wiki/` and validated with `wiki-lint.js` to survive context truncation across sessions.


<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
