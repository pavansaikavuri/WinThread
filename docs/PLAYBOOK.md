# WinThread Master Engineering Playbook: End-to-End Workflow, Models & Unified Multi-Agent Cockpit

**Document Identifier:** PLAYBOOK-WINTHREAD-2026-11-20  
**Language Standard:** ASD-STE100 (Simplified Technical English)  
**Target Application:** WinThread (Next.js 16.4.6, React 19.3.0, Supabase SSR, TypeScript, Tailwind CSS 4, Windows OS)  
**Target Environments:** Unified Tri-Engine Setup (Antigravity IDE, Claude Code, OpenCode)

---

## 1. System Architecture: The Unified 3-Engine Cockpit

Your development workstation is orchestrated as a single multi-agent cockpit combining three specialized coding engines:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   WINTHREAD UNIFIED COCKPIT                                     │
├───────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│       ANTIGRAVITY IDE         │           CLAUDE CODE            │           OPENCODE            │
│   (Architect & Coordinator)   │    (Execution & TDD Engine)      │   (Fast Open-Source Worker)   │
├───────────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ • Full repo visual context    │ • Strict typecheck & deny rules  │ • FreeLLM & DeepSeek V4.1     │
│ • Long-range task planning    │ • Hard test-driven execution     │ • Fast single-file edits      │
│ • Rich diff & artifact UI     │ • Exit-code verification hooks   │ • Zero-burn exploratory code  │
│ • EGM swarm coordinator      │ • Fast terminal CLI agility      │ • Parallel test running       │
└───────────────────────────────┴──────────────────────────────────┴───────────────────────────────┘
```

### Cockpit Keystroke Controls
- **`Ctrl + Alt + C`**: Cycles through and launches the 4-quadrant layout (Antigravity IDE, Claude Ultra, Claude Lightning, and OpenCode).
- **`Ctrl + Alt + X`**: **Instant Cockpit Close** — Immediately terminates all 4 background shell terminals and snaps back to a clean single editor tab with zero confirmation prompts.

---

## 2. Shared Memory Architecture: Karpathy LLM-Wiki & Obsidian Vault

To prevent context drift and ensure that all three engines share the exact same architectural rules and learned conventions without burning prompt tokens:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            SHARED OBSIDIAN VAULT / WIKI                          │
│                (e.g., ~/.obsidian-vault/ or winthread/docs/wiki/)                │
├───────────────────────────────┬──────────────────────────────────────────────────┤
│ • Evergreen Architecture Rules│ • Learned Bug Fix Patterns & Post-Mortems        │
│ • Domain Glossary & Entities  │ • Supabase RLS & Index Optimization Directives   │
└───────────────────────────────┴──────────────────────────────────────────────────┘
       ▲                               ▲                               ▲
       │                               │                               │
[Antigravity IDE]              [Claude Code]                      [OpenCode]
(obsidian-* skills)         (obsidian-* skills)              (obsidian-* skills)
```

### Why On-Demand Reactive Access is the Superior Architecture
1. **The Eager Injection Anti-Pattern (DO NOT DO)**:
   - Forcing an agent to dump the entire knowledge base into its system prompt on every turn wastes 10,000–30,000 tokens per message, slows down TTFT (time-to-first-token), and causes "attention dilution" where the model loses focus on the actual code diff.
2. **The Reactive / Karpathy LLM-Wiki Pattern (ENFORCED)**:
   - **Active Skills**: `obsidian-bases`, `obsidian-cli`, `obsidian-markdown`.
   - **Read Protocol**: When a task involves an unfamiliar domain entity, architecture choice, or database schema, the agent queries the knowledge base on-demand via `obsidian-cli search` or reading `docs/wiki/`.
   - **Write Protocol**: When an agent completes a non-trivial fix or establishes a new architectural pattern, it appends a structured note to the wiki so all other agents immediately benefit from the lesson.

---

## 3. OmniRoute Gateway & Model Roster (`:20128`)

All engines connect through the unified local gateway at `http://localhost:20128` (or local FreeLLM pools):

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                OMNIROUTE GATEWAY (:20128)                               │
├───────────────────────────────────────────┬─────────────────────────────────────────────┤
│         TIER 1: DEDICATED NEMOTRONS       │       TIER 2: ZERO-BURN POWERHOUSE COMBOS   │
│  (Priority 1: OpenRouter 50 req/day free) │          (FreeLLMAPI 7.5B tokens/mo         │
│  (Priority 2: NVIDIA NIM 1,000 credits)   │           + OmniRoute 1.6B tokens/mo)       │
├───────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 1. model/nemotron-3-ultra (550B MoE)      │ 4. auto/coding (Qwen 2.5 Coder + Bedrock)   │
│ 2. model/nemotron-3.5-super-vl (120B VL)  │ 5. auto/reasoning (GPT-5.6 Luna + Bedrock)  │
│ 3. model/nemotron-3.5-lightning (30B Fast)│ 6. auto/free (Claude Haiku 4.5 + Bedrock)   │
│                                           │ 7. auto/1m (Gemini Flash Pool 1M Context)   │
└───────────────────────────────────────────┴─────────────────────────────────────────────┘
```

### Model Selection Matrix

| Model Identifier | Primary Engine | Engine Characteristics | Best Engineering Use Cases |
| :--- | :--- | :--- | :--- |
| **`model/nemotron-3-ultra`** | Claude / Antigravity | 550B MoE flagship. Deep architectural reasoning. | System architecture, complex refactoring, writing implementation plans, reviewing critical PRs. |
| **`model/nemotron-3.5-super-vl`**| Claude / Antigravity | 120B Vision-Language model. | Verifying visual UI output, checking mobile responsive layout screenshots, DOM-to-wireframe audits. |
| **`model/nemotron-3.5-lightning`**| Claude / OpenCode | 30B ultra-fast low-latency model. | Rapid lint fixes, single-line bug fixes, fast git commit formatting, quick script generation. |
| **`auto/coding`** | Claude / OpenCode | Zero-burn coding powered by Qwen 2.5 Coder 32B. | Daily feature coding, writing unit tests, vertical slicing, running TDD loops. |
| **`auto/reasoning`** | Claude / Antigravity | Zero-burn reasoning powered by GPT-5.6 Luna. | Bug diagnosis, systematic debugging, root-cause analysis, hypothesis testing. |
| **`auto/free`** | Claude / Antigravity | Lightweight conversational model (Claude Haiku 4.5). | Quick orientation, interactive grilling questions, short explanations, slash commands. |
| **`auto/1m`** | Antigravity / Claude | 1,000,000 token context window (Gemini Flash Pool). | Repo-wide sweeps, analyzing massive log files, full dependency graphs, cross-package refactoring. |
| **`opencode/deepseek-v4.1-flash-free`**| OpenCode | Fast zero-burn open-source model. | Rapid multi-file edits, autonomous script testing, exploratory prototyping. |

---

## 4. Unified MCP & Tooling Status

To maximize context speed and prevent token bloat, non-essential and heavy binary tools are stashed in on-demand storage:

| MCP / Tool Component | Current Status | Default State across Engines | Re-Enable Protocol |
| :--- | :--- | :--- | :--- |
| **`context7`** | 🟢 **ACTIVE** | Enabled in all 3 engines (Antigravity, Claude, OpenCode). | Always active for Upstash & library documentation queries. |
| **`headroom`** | 🟢 **ACTIVE** | Enabled in Claude Code (3 tools). | Always active for context compression, AST grep (`sg`), and token tracking. |
| **`vercel` (Plugin & MCP)** | 🟢 **ACTIVE** | Enabled in Claude Code & Antigravity. | Full platform deployments, edge config, and logs. |
| **`supabase` (Plugin & MCP)**| 🟢 **ACTIVE** | Enabled in Claude Code & Antigravity. | Database schema management and migrations. |
| **`rea` (170 tools)** | 🟡 **STASHED** | Stashed in `_disabled_mcpServers` across all engines. | Re-enable when decompiling native binary files. |
| **`craft-anything` (39 tools)**| 🟡 **STASHED** | Stashed in `_disabled_mcpServers` across all engines. | Re-enable when analyzing reverse-engineered binaries. |
| **`firecrawl` (34 tools)** | 🟡 **STASHED** | Stashed in `_disabled_mcpServers` across all engines. | Re-enable when live web crawling or bulk scraping is needed. |
| **`scrapling` (2 tools)** | 🟡 **STASHED** | Stashed in `_disabled_mcpServers`. | Re-enable when headless web fetching is required. |
| **`playwright` (25 tools)** | 🟡 **STASHED** | Stashed in `settings.json` (`playwright: false`). | Re-enable during Stage 7 E2E browser test runs. |
| **`founder-skill`** | 🟡 **STASHED** | Stashed in `settings.json` (`founder-skill: false`). | Stashed now that PRD/Brief are completed. |

---

## 5. End-to-End Engineering Workflow (The 8-Stage Pipeline)

Every feature, refactor, or bug fix follows this strict, linear discipline:

```
 [Stage 1: Intent & Brainstorming]
      │   Active Skills: grilling, brainstorming, doubt-driven-development
      ▼
 [Stage 2: Architecture & Impact]
      │   Active Skills: domain-modeling, codebase-design, blast-radius, statechart, documentation-and-adrs
      ▼
 [Stage 3: Task Breakdown & Planning]
      │   Active Skills: writing-plans, to-spec, show-me-your-work
      ▼
 [Stage 4: Implementation & TDD]
      │   Active Skills: test-driven-development, typescript-best-practices, nextjs-turbopack,
      │                  postgres-patterns, api-and-interface-design, frontend-ui-engineering, apple-design
      ▼
 [Stage 5: Autonomous Execution]
      │   Active Skills: executing-plans, subagent-driven-development, using-git-worktrees, poteto-mode
      ▼
 [Stage 6: Systematic Debugging]
      │   Active Skills: systematic-debugging, error-handling, wait-what
      ▼
 [Stage 7: Performance & Verification]
      │   Active Skills: verification-before-completion, benchmark-checklist, performance-optimization,
      │                  react-performance, browser-testing-with-devtools, create-verification-skill
      ▼
 [Stage 8: Code Health & Shipping]
          Active Skills: unslop, code-simplification, requesting-code-review, receiving-code-review,
                         conventional-commit-review, finishing-a-development-branch, bro
```

---

### Stage 1: Intent & Greenfield Brainstorming
*Goal: Stress-test requirements, surface hidden tradeoffs, and eliminate flawed assumptions before editing files.*

- **`grilling` (Canonical)**:
  - **Trigger**: Ask the agent to "grill me on this design" or `/grilling`.
  - **Behavior**: Conducts an adversarial interview using a decision tree. Attacks fuzzy requirements until decisions are locked.
- **`brainstorming` (Superpowers)**:
  - **Trigger**: "Brainstorm three approaches to implement signal feeds in WinThread".
  - **Behavior**: Explores multi-solution tradeoffs before committing to implementation.
- **`doubt-driven-development`**:
  - **Trigger**: "Red-team this feature proposal".
  - **Behavior**: Formulates failure hypotheses (concurrency bugs, race conditions, edge-case network dropouts).
- **Recommended Model**: `auto/reasoning` or `model/nemotron-3-ultra`.

---

### Stage 2: Architecture, Domain Modeling & Impact Analysis
*Goal: Define data schemas, map state machines, and check blast radiuses before modifying code.*

- **`blast-radius`**:
  - **Trigger**: "What is the blast radius of changing the organization member schema?".
  - **Behavior**: Scans all callers, API route handlers, and database foreign keys that could be impacted.
- **`statechart`**:
  - **Trigger**: Model multi-step flows (checkout, lead status, enrichment pipelines).
  - **Behavior**: Defines explicit states and transitions; makes invalid state combinations impossible.
- **`domain-modeling` & `documentation-and-adrs`**:
  - **Trigger**: "Record an ADR for our Supabase session caching strategy".
  - **Behavior**: Creates an ADR in `docs/adr/` and synchronizes terms with `docs/GLOSSARY.md`.
- **`codebase-design`**:
  - **Trigger**: Interface boundary design.
  - **Behavior**: Enforces deep module design and clean seams.
- **Recommended Model**: `model/nemotron-3-ultra`.

---

### Stage 3: Task Breakdown & Planning
*Goal: Break the design into atomic, bite-sized tasks with explicit verification commands.*

- **`writing-plans` (Superpowers)**:
  - **Trigger**: `/plan`
  - **Behavior**: Produces an implementation plan where each task takes < 15 minutes, touches < 3 files, and ends with a verifiable test command.
- **`show-me-your-work`**:
  - **Trigger**: Overnight or long-running tasks.
  - **Behavior**: Maintains an auditable decision log so you can inspect every step taken while away.
- **Recommended Model**: `model/nemotron-3-ultra`.

---

### Stage 4: Implementation & Test-Driven Development (TDD)
*Goal: Write clean, type-safe code using strict Red-Green-Refactor discipline.*

- **`test-driven-development` (Superpowers)**:
  - **Discipline**: Failing test first $\rightarrow$ Minimum implementation $\rightarrow$ Green test $\rightarrow$ Refactor.
  - **Iron Rule**: Zero production code written without a failing test first.
- **`typescript-best-practices`**:
  - **Discipline**: Strict bans on `any`, bans on unsafe `as` casts, mandatory discriminated unions, runtime Zod validation.
- **`nextjs-turbopack`**:
  - **Discipline**: Next.js 16 conventions (`proxy.ts`, Turbopack cache keys, Server/Client component boundary rules).
- **`postgres-patterns`**:
  - **Discipline**: Supabase RLS security policies, index optimization (B-tree vs GIN), transaction isolation.
- **`frontend-ui-engineering` & `apple-design`**:
  - **Discipline**: Enforces handling all 6 UI states (Loading, Empty, Error, Success, Partial, Offline) with production-grade typography, spacing, and micro-interactions.
- **Recommended Model**: `auto/coding` (Zero-Burn) or `model/nemotron-3-ultra`.

---

### Stage 5: Autonomous Execution & Worktrees
*Goal: Execute tasks independently without polluting the main branch or context window.*

- **`executing-plans` & `subagent-driven-development`**:
  - **Discipline**: Spawns isolated subagents per task. Reviews between steps. Errors in Task 1 never contaminate Task 4.
- **`using-git-worktrees`**:
  - **Discipline**: Automatically creates isolated git branches/worktrees for non-trivial features.
- **`poteto-mode`**:
  - **Discipline**: Maximizes senior autonomy by inspecting code and running commands instead of asking trivial questions.
- **Recommended Model**: Coordinator on `model/nemotron-3-ultra`; Subagents on `auto/coding` or `nemotron-3.5-lightning`.

---

### Stage 6: Systematic Debugging & Error Handling
*Goal: Find root causes before touching code. Never guess.*

- **`systematic-debugging` (Superpowers)**:
  - **Protocol**: 4-Phase discipline (Root cause $\rightarrow$ Pattern analysis $\rightarrow$ Minimal fix $\rightarrow$ Regression test).
  - **Circuit Breaker**: If 3 consecutive fixes fail, STOP and rethink the architecture.
- **`error-handling`**:
  - **Protocol**: Typed domain errors, sanitized user-facing messages, zero credential leaks.
- **`wait-what`**:
  - **Protocol**: Immediately halts when requirements contradict or ambiguity is detected.
- **Recommended Model**: `auto/reasoning` or `model/nemotron-3-ultra`.

---

### Stage 7: Performance Optimization & Verification
*Goal: Prove the feature works using real compilers, test suites, and browsers.*

- **`verification-before-completion` (Superpowers)**:
  - **The Iron Law**: Evidence before assertion. Never say "It's working" without running the test suite and checking the exit code.
- **`benchmark-checklist`**:
  - **Protocol**: 7-question scientific perf audit to eliminate placebo optimizations.
- **`performance-optimization` & `react-performance`**:
  - **Protocol**: Core Web Vitals profiling (LCP, INP, CLS) and Server Component payload minimization.
- **`create-verification-skill`**:
  - **Protocol**: Generates a single-command project verification runner (`verify-winthread`).
- **Recommended Model**: `auto/coding` or `model/nemotron-3.5-super-vl` (visual checks).

---

### Stage 8: Code Health, Simplification & Shipping
*Goal: Clean up AI slop, simplify code, review diffs, and merge safely.*

- **`unslop`**:
  - **Trigger**: `/unslop`
  - **Protocol**: Strips conversational fluff, unnecessary comments, robotic apologies, and AI filler patterns.
- **`code-simplification`**:
  - **Protocol**: Flattens nested logic, removes premature abstractions, simplifies control flow.
- **`requesting-code-review` & `receiving-code-review`**:
  - **Protocol**: Dispatches an adversarial reviewer subagent before merging into `main`.
- **`conventional-commit-review`**:
  - **Protocol**: Generates semantic Conventional Commits (`feat(auth): ...`, `fix(billing): ...`).
- **`finishing-a-development-branch`**:
  - **Protocol**: Verifies test suite, merges branch cleanly, deletes worktree.
- **`bro`**:
  - **Trigger**: `/bro`
  - **Protocol**: Restates verbose answers in direct, plain human language.
- **Recommended Model**: `model/nemotron-3-ultra` (Reviewer); `model/nemotron-3.5-lightning` (Commits).

---

## 6. Multi-Agent Swarms & Competitions

When an architectural change has high financial or security stakes:
- **`egm` (Elephant Goldfish Model)**:
  - Multi-agent swarm audit (`/egm-review`, `/egm-drift-report`, `/egm-review-loop`).
  - Spawns specialized parallel personas (Security Critic, Architecture Critic, Simplicity Auditor) and aggregates deliverable findings.
- **`arena`**:
  - Compares competing code implementations from different models side-by-side to choose the superior design.
- **`interrogate`**:
  - Forces one model to defend its proposal while another model aggressively attacks it.

---

## 7. The Universal Re-Enable Protocol (How to Reactivate Any Stashed Tool)

All disabled tools are safely stashed and can be reactivated in seconds:

### To Re-Enable Firecrawl (for live web scraping):
1. In `~/.claude.json`: Move `"firecrawl"` from `_disabled_mcpServers` back into `"mcpServers"`.
2. In `~/.config/opencode/opencode.json`: Move `"firecrawl"` from `_disabled_servers` back into `"servers"`.

### To Re-Enable Playwright (for E2E browser tests):
In `~/.claude/settings.json`, set:
```json
"playwright@claude-plugins-official": true
```

### To Re-Enable REA / Craft Anything (for native binary disassembly):
In `~/.claude.json` or `~/.config/opencode/opencode.json`, move `"rea"` and `"craft-anything"` back into active `"mcpServers"`.

### To Re-Enable Any Skill:
Move it from `~/.claudebuild/vault/skills/<skill-name>` back into `~/.claude/skills/<skill-name>` or `~/.gemini/config/skills/<skill-name>`.
