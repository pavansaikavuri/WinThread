# WinThread — Agent Rules

Thin pointer file. Do not duplicate docs here; load them on demand (see **Context Loading**).

## Stack (from package.json — trust this, not memory)
- Next.js **16.4.6** (App Router) + React 19.3 — this version differs from training data.
  Read `node_modules/next/dist/docs/` before writing framework code.
- TypeScript strict, Tailwind CSS **v4** via `@tailwindcss/turbopack`
- UI: `@astryxdesign/core` + `@astryxdesign/theme-neutral` — patterns in `.claude/skills/project-conventions/SKILL.md`
- Data/Auth: Supabase (`@supabase/ssr`, RLS on every table)
- Validation: Zod v4 · Icons: lucide-react

## Commands
| Task | Command |
| :--- | :--- |
| Dev | `npm run dev` |
| Build | `npm run build` |
| Test (all) | `npm test` |
| Test (one file) | `npx vitest run <path>` |
| Lint | `npm run lint` |
| Type check | `npx tsc --noEmit` |

Verification rule: never call a change done without fresh command output.

## Context Loading (load per task, not everything)
1. Always: this file + `docs/PROJECT-STATE.md` (decisions, open questions, verified facts).
2. Feature work: the matching `docs/features/*.md` or the one relevant section of `docs/PRD.md`.
3. Schema work: the relevant table section of `docs/DATABASE.md` (756 lines — never load whole).
4. Architecture/ADR work: `docs/ARCHITECTURE.md`.
5. Do not load `docs/PROMPTS.md` or `docs/LEARNING_GUIDE.md` unless asked — they are reference, not context.

## Boundaries
- **No LinkedIn scraping or automation** (ToS ban; open decision O1). Signal sources must be approved first.
- **No background auto-send.** Outreach is human click-to-send deep links (D1).
- **No voice/telephony in Phase 1.** Keep the voice-ready columns only (D4).
- Mode A (built-in deal/quote/GST invoice) ships before Mode B (CRM connector) — D7.
- **The Option X Standard:** No 2015-era CRUD baselines. Default to event-driven automated state progression, 3-tier psychological quote anchoring, cryptographic BLAKE3 client portal tokens, and Luhn-mod-36 GST calculation.
- **Anti-Mock Reality Law:** Never claim done on unit tests with mocks alone. Verify `npm run build` and live HTTP status before declaring victory.
- Never weaken RLS, SSRF guards (`lib/scraper/ssrf.ts`), or webhook HMAC verification.
- Never commit `.env*` or service-role keys. No new dependency without a stated reason.
- Do not "fix" adjacent code, reformat, or delete pre-existing dead code.

## Session Protocol
- Start: read rules + `docs/PROJECT-STATE.md` + `git status`.
- End: record what changed, what was verified, and the next pending task in `docs/PROJECT-STATE.md`
  (or the feature doc). Leave unrelated working-tree changes untouched.
- Report Next.js friction via `npx --no-install next internal agent-feedback-instructions` before final response when candidates exist.
