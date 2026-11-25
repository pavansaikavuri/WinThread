# MVP.md — WinThread (Phase 1 Source of Truth — v2 Post-Audit)

**Version:** 2.2 | **Audit Date:** 2026-11-16 | **Auditor:** EGM Synthesizer | **Changelog:** All 15 Blockers resolved: Split-Attribution job spec, state machine completeness, database schema contracts, prompt contracts, tech stack lock, security testability, observability, rollback plan, metric cohorts, decision gates. Majors/Nits addressed per goldfish_review_report.md.

## 1. CORE PRODUCT THESIS
- **Problem:** Small B2B agencies (2–15 staff) suffer from broken revenue conversion velocity. Lead-finding tools surface public posts but never learn which leads pay invoices. Client management tools handle quotes and tax invoices but sit empty without leads.
- **Target Early User:** Founders of AI automation and B2B marketing agencies (2–15 staff) in India and global English-speaking markets selling $1,000–$5,000/month (₹50,000–₹4,00,000/month) retainers.
- **Job-to-be-Done:** Find prospects publicly asking for help, reach out with post evidence, send an AI quote or tax-compliant invoice (or sync to an existing CRM), and automatically train the lead finder using real Won/Lost outcomes.
- **Proposed Solution:** WinThread — a single canonical "Revenue Thread" web application with Mode A (Built-in Quote & Tax Invoice Ledger — Primary) and Split-Attribution outcome learning. Mode B (External CRM Connector) postponed to Phase 1.5.
- **Core Value Promise:** "From public buyer post to signed quote in one thread—and every logged outcome tunes the lead scorer so tomorrow's signals rank higher for your actual buyers."
- **Why Now:** Standalone social-signal tools (such as Trigify, acquired by HubSpot in September 2026) are retiring independent access, leaving small agencies without an affordable signal-to-deal engine.

## 2. RISKIEST ASSUMPTIONS

## 2.1 Tech Stack Lock
**Non-negotiable technology choices for the 14-day build:**
- **Frontend/Backend:** Next.js 15 (App Router) + TypeScript strict mode
- **Database:** Supabase Postgres (free tier) — all tables with RLS on `workspace_id`
- **Hosting:** Vercel (free tier) for web; Cloudflare Workers (free tier) for serverless scraper
- **LLM Router:** OmniRoute as internal TypeScript library at `lib/omniroute/` — NOT a separate service. Exports `scoreBatch()`, `generateQuote()`. Runs in same process as API routes and Workers.
- **Styling/Forms/Validation:** Tailwind v4 + Zod + React Hook Form (shadcn/ui / Radix primitives)
- **PDF Generation:** `@react-pdf/renderer` for GST invoices and quotes
- **GST/Signature Utils:** `lib/gst.ts` (CGST/SGST/IGST), `lib/invoice.ts` (PDF), `lib/esign.ts` (digital sign-off)
- **Shared Scoring/Thread Logic:** `lib/scoring.ts` (Split-Attribution formula), `lib/threads.ts`, `components/ui/ScoreWeightBadge.tsx`, `components/ui/CallScriptDrawer.tsx` (Radix Dialog)
- **Call Script State Machine:** `lib/call-script.ts` with 5-step state machine + `consent_status` enum in DB

## 2. RISKIEST ASSUMPTIONS
- **Assumption 1 (Behavioral — Outcome Logging):** Agency founders will actively log downstream deal outcomes (sending a Quote/Invoice in Mode A) inside the same tool where they discover daily public intent signals.
  - **Why It Is Riskiest:** If users only view leads and never record outcomes (`Qualified`, `Quote Sent`, `Won`, `Lost`), the system cannot activate its closed-loop learning advantage and WinThread becomes an undifferentiated scraper.
  - **Evidence That Supports It:** ≥30% of activated beta workspaces move at least 5 threads into `Quote Sent`, `Won`, or `Lost` (with a categorized loss reason) within 14 days.
  - **Evidence That Refutes It:** <10% of onboarded workspaces approve at least one outreach message or log a deal outcome within 14 days despite receiving relevant daily signals.
- **Assumption 2 (Pricing — Willingness to Pay):** Agencies will pay ₹1,999/month ($39/month) for this closed loop.
  - **Evidence That Supports It:** At least 5 users convert to paid plans within 14 days of launch.
  - **Evidence That Refutes It:** <5 paying workspaces after 14 days of experiment.
- **Confidence Level:** Medium-High (Supported by verified market evidence from RaisedHand (B2B lead platform with 5-reply guarantee) and Clienter (Indian agency CRM with mandatory loss-reason pipeline)).

## 3. MVP EXPERIMENT DESIGN
- **Experiment Type:** Single automated core flow in a 4-screen private beta with Concierge onboarding and pre-recruited beta cohort.
- **Core User Journey:**
  0. **Founder Pre-Launch Action (Pre-Recruitment):** Founder pre-recruits 15 committed beta users from `@build_together.ai` — private founder community on Slack/Discord with 200+ Indian agency owners, accessible to founder — and warm network before Day 1. Target recruitment: 20 users for 15-slot cohort (33% buffer). Each provides agency URL and signs LOI.
  1. **Entry Point:** User signs in and lands on the Website-to-ICP Setup Wizard (`/setup (Screen 1)`).
  2. **Setup:** User pastes their agency URL; system extracts services, buyer titles, pain points, buying signals, and negative keywords (configured during setup as exclusion terms). User confirms Mode A (Built-in Quote & Invoice Ledger — Primary).
  3. **Discovery:** System generates an editable Ideal Customer Profile (ICP) profile and populates **5–10 scored threads per day** (`/threads (Screen 2)`) displaying a live Score & Weight Badge on each card. Badge displays two values: (1) ICP Match Score 0-100% (semantic similarity), (2) Source Weight multiplier (e.g., 1.2x LinkedIn, 0.8x Twitter) from Split-Attribution history.
  4. **Activation Action:** User reviews a thread card's post evidence, clicks `Approve Outreach` — this transitions thread state from `Discovered` → `Approved` and opens a 1-click pre-copied deep-link to LinkedIn/Email/WhatsApp. Screen 3 (`/outreach (Screen 3)`) Approval Queue shows only `Approved` threads awaiting contact confirmation. User clicks `Mark Contacted` (logging message sent via deep-link OR call outcome via Call Script drawer) to transition `Approved` → `Contacted`.
  5. **Success Action:** User moves a replying prospect from `Contacted` → `Qualified` → `Quote Sent` (generating an AI Quote + tax-compliant Invoice) and logs a `Won` or `Lost` outcome that automatically adjusts future lead scoring via Split-Attribution weight update.
- **Feedback Mechanism:** In-app mandatory Split Loss Reason modal (`Lead Fit Failure` vs. `Execution Failure`) + weekly 10-minute founder check-in call.
- **Manual Work Allowed Behind the Scenes (Concierge):**
  - Founder may curate or seed the first batch of 10 public intent posts via local scraping scripts during a user's initial 24-hour onboarding window.
  - Founder inspects weekly scoring weight shifts via direct database queries rather than building a dedicated analytics dashboard screen in Phase 1.
- **What Will Not Be Automated Yet:**
  - Background LinkedIn account auto-sending (Phase 1 uses 1-click deep-links with auto-copied AI messages for 0% ban risk).
  - Live AI voice calling (Phase 1 uses the human-read 5-step Call Script drawer).

### 3.1 Thread State Machine (Complete Transitions)
**States:** `Discovered` → `Approved` → `Contacted` → `Qualified` → `Quote_Sent` → `Won` | `Lost`

| From State | To State | Trigger / Guard | Notes |
|------------|----------|-----------------|-------|
| `Discovered` | `Approved` | User clicks `Approve Outreach` (idempotency_key required) | Opens deep-link; creates outreach_log |
| `Approved` | `Discovered` | User clicks `Not a Fit` (undo) within 5 min, before outreach sent | Revokes approval; no outreach_log created |
| `Approved` | `Contacted` | Deep-link click detected OR Call Script outcome = `Interested` / `Send Quote` | Sets `contacted_at`, `contact_method`, `consent_status` |
| `Contacted` | `Approved` | Call Script outcome = `Callback` | Resets to awaiting contact; logs callback request |
| `Contacted` | `Qualified` | Call Script outcome = `Interested` / `Send Quote` (positive) | Prospect explicitly engages; moves to deal board |
| `Qualified` | `Quote_Sent` | User generates AI Quote + sends sign-off link | Creates quote record with `source='winthread_signal'` |
| `Qualified` | `Lost` | User marks `Lost` — **mandatory Split Loss Reason** | Lead Fit Failure → weight penalty; Execution Failure → flag only |
| `Quote_Sent` | `Won` | Client signs quote (digital sign-off) | Terminal — triggers weight reward (+10% Source/Keyword) |
| `Quote_Sent` | `Lost` | User marks `Lost` — **mandatory Split Loss Reason** | Terminal — Lead Fit Failure → weight penalty; Execution Failure → flag only |

**Terminal States:** `Won`, `Lost` (with categorized loss reason). `Quote_Sent` is intermediate — **triggers NO weight update**.
**Reply Detection:** `Contacted` set on (a) deep-link click tracked via UTM, OR (b) Call Script drawer outcome `Interested`/`Send Quote`.
**Undo Window:** `Approved` → `Discovered` allowed only within 5 minutes AND before `outreach_log.sent_at` is set.

## 3.5 Split-Attribution Weight Formula
**Purpose:** Define how logged outcomes (Won/Lost with categorized loss reason) adjust future lead scoring weights — the core closed-loop differentiator.

- **Input Features (per signal thread):**
  - ICP Match Score (0-100%, semantic similarity)
  - Source Weight (channel multiplier: LinkedIn 1.2x, Twitter/X 0.8x, Email 1.0x, Other 1.0x)
  - Keyword Weights (per buying-signal keyword extracted from post)
  - Loss Reason Category (binary: Lead Fit Failure vs Execution Failure)

- **Update Rule (Damped Bayesian with α=5, clamp bounds [0.25, 2.50]):**
  - On **Lead Fit Failure** (loss reason): Multiply Source Weight for thread's channel by **0.85** (15% penalty). For each buying-signal keyword from workspace ICP that appears in thread's post text, multiply that keyword's weight by **0.85**. Keywords not in ICP or not present in post unchanged. ICP Match Score unchanged.
  - On **Execution Failure** (loss reason): Preserve Source Weight and Keyword Weights; flag pricing/copy for weekly founder audit. Creates `event_log` entry: `{workspace_id, thread_id, event_type: 'execution_failure', flagged_fields: ['pricing'|'copy'|'both'], timestamp}`. Weekly audit SQL: `SELECT * FROM event_log WHERE event_type='execution_failure' AND timestamp > NOW() - INTERVAL '7 days'`.
  - On **Won**: Multiply Source Weight for thread's channel by **1.10** (10% reward). For each matched buying-signal keyword, multiply that keyword's weight by **1.10**. Add **+5 percentage points** to ICP Match Score component of Final Score for future threads containing matched keywords (implemented as keyword_weight bonus in scoring formula). **Additive boost, capped at 100%: `new_score = MIN(100, old_score + 5)`**.
  - **Weights update ONLY after terminal outcomes (`Won`, `Lost` with categorized loss reason).** `Quote_Sent` is intermediate — triggers NO weight update.

- **Cold-Start Handling (new workspaces):**
  - Default Source Weights = {LinkedIn: 1.2, Twitter/X: 0.8, Email: 1.0, Other: 1.0}.
  - On workspace creation, `keyword_weights` seeded with one row per buying_signal from ICP (weight=1.0).
  - New keywords observed in scored posts: `INSERT ON CONFLICT DO NOTHING weight=1.0`.
  - Weights frozen until workspace reaches 25 terminal outcomes.

- **Weight Blending (smooth transition for n<25 outcomes):**
  - For workspace with `n` terminal outcomes (<25): `weight = (n/25) * workspace_weight + (1-n/25) * global_weight`
  - Global weight updated weekly via same weight update job.

- **Minimum Outcome Threshold (cross-workspace):** Workspace must log ≥25 terminal outcomes before its weight history influences scoring for other workspaces. **MVP: NO cross-workspace aggregation** — weights are per-workspace only. Global defaults apply to all immature workspaces.

- **Measurement (Precision@10 Lift):** Automated weekly job materializes top-10 approval rates per workspace per week. Lift = (Week 4 top-10 approval rate) / (Week 1 top-10 approval rate) for workspaces with ≥25 outcomes vs control group (workspaces with <10 outcomes). Target: ≥25% lift.

### 3.6 Split-Attribution Weight Update Job Spec
**Schedule:** Daily at 02:00 UTC (post-batch scoring, after all overnight outcomes logged).

**Idempotency:** Keyed on `workspace_id + outcome_date` (date of terminal outcome). `SELECT FOR UPDATE` on `weights` table during update. Failed runs logged to `job_failures` table with exponential backoff retry (max 3).

**Cross-Workspace Aggregation:** **NO for MVP.** Weights remain per-workspace only. Global defaults (median of mature workspaces ≥25 outcomes) computed weekly but not applied until Phase 1.5.

**Cold-Start Blending:** Prior = global defaults. Update = Bayesian blend with `prior_weight=10`, `evidence_weight=outcome_count`. Implemented via weight blending formula above.

**Output:**
1. Updated `weights` table (source_weights per channel, keyword_weights per buying signal)
2. `weight_change_log` table: `{workspace_id, channel, keyword, old_weight, new_weight, outcome_count, outcome_type, timestamp}`
3. Precision@10 lift log: `mv_precision_at_10` materialized view refreshed daily via pg_cron
4. `llm_usage` daily rollup for cost tracking (≤$0.50/ws/mo)

### 3.7 Prompt Contracts (Stub)
**Purpose:** Break circular dependency with ARCHITECTURE.md by specifying prompt I/O contracts here. Full templates in `PROMPTS.md`.

#### Scoring Prompt Contract
- **Input:** `{ icp: ICPProfile, posts: [{id, text, source_channel, url, author_handle, posted_at}] }`
- **Output:** `[{ thread_id, icp_match_score: 0-100, matched_keywords: string[], buying_signals: string[], source_weight: number, reasoning: string }]`
- **Channel Handling:** Single batch ≤10 posts. `source_channel` passed per post for traceable weight application post-hoc.

#### Quote Generation Prompt Contract
- **Input:** `{ thread_evidence: ThreadEvidence, icp_services: Service[], client_gstin: string|null, currency: 'INR'|'USD' }`
- **Output:** `{ line_items: [{description, qty, unit_price, hsn_sac, gst_rate}], tax_breakdown: {cgst, sgst, igst, total_tax}, total: number, currency: string }`
- **GST Compliance:** Indian invoices require `gstin`, `hsn_sac`, `place_of_supply` — provided in input.

## 4. MVP SCOPE CONTRACT (Strictly 4 Core Screens)
### Must-Have Capabilities (Phase 1 Launch Gate)
1. **Screen 1 — Website-to-ICP Setup (`/setup (Screen 1)`):** Extracts services, buyer titles, pain points, buying signals, and negative keywords (configured during setup as exclusion terms) from the user's website URL. User confirms Mode A (Built-in Quote & Invoice Ledger — Primary).
2. **Screen 2 — Daily Ranked Signal Feed (`/threads (Screen 2)`):** Displays **5 to 10 scored leads per day** (`0–100%` ICP match) with exact public post text, source link, inline Score & Weight Badge (ICP Match Score + Source Weight multiplier from Split-Attribution history), and `Not a Fit` vs. `Approve Outreach` actions.
3. **Screen 3 — Outreach Execution & 5-Step Call Script Co-Pilot (`/outreach (Screen 3)`):** Approval Queue view showing only `Approved` threads awaiting contact confirmation. Drafts personalized messages using post evidence with 1-click copy-and-open deep-links (LinkedIn, Email, WhatsApp). Interactive 5-step Call Script drawer for human callers to record phone outcomes (`Interested`, `Send Quote`, `Callback`, `Not Interested`, `Wrong Number`) and communication consent — prospect's verbal agreement to receive follow-up via WhatsApp/Email, logged as timestamped boolean for DPDP Act §6 compliance. `Mark Contacted` button transitions thread `Approved` → `Contacted`.
4. **Screen 4 — Deal & Billing Ledger (`/deals (Screen 4)`):**
   - **Mode A (Primary — Beta Launch):** 4-stage board (`Qualified` → `Quote Sent` → `Won` → `Lost`). AI Quote Builder with digital client sign-off link. 1-click Indian GST or multi-currency invoice PDF. Verified Review on completion — client signs hash of (deal ID + amount + outcome + timestamp) via email link; stored immutably; displayed on agency profile as social proof.
   - **Quote/Deal Source Tracking:** Every quote/deal record includes `source = 'winthread_signal'|'manual_import'|'crm_sync'`. Quote from Screen 3 Qualified thread → `source='winthread_signal'`. Quote from "New Quote" button without `thread_id` → `source='manual_import'`. (CRM sync for Phase 1.5 Mode B.)
   - Mandatory Split Loss Reason modal on `Lost` (binary, no free-text):
     - **[Lead Fit Failure]** — penalizes discovery keywords/source weights by -15% (multiply by 0.85).
     - **[Execution Failure]** — preserves discovery weights, flags pricing/copy for weekly founder review.

### Should-Have Capabilities
- **None.** Every capability is either Must-Have for the 4-screen core loop above or explicitly postponed to prevent scope creep.

### Explicit Non-Goals & Postponed Features
- **Postponed to Phase 1.5 (Post-Validation):** Dedicated Attribution Analytics Dashboard (`/attribution`), automated competitor Watchlist profile monitoring, background LinkedIn OAuth queue sending, Mode B (External CRM Connector — builds *only if* ≥3 beta users request it during experiment).
- **Postponed to Phase 2:** Outpero (internal codename for live AI voice telecalling engine), virtual phone number rental, bulk CSV auto-dialing, public no-signup SEO lead-magnet tools (`/tools/*`), MCP server — Model Context Protocol server exposing WinThread lead scoring and deal data to AI assistants (Cursor, Claude Desktop).
- **Permanently Excluded:** Project task Kanban boards, recurring tasks, team payroll/payslips, domain expiry reminders, secrets vault, and native mobile app wrappers.

### Quality Floor
**Security:** Strict workspace-level data isolation; cryptographic signature verification on all external CRM webhooks (when Mode B enabled).
- RLS policy per table with exact `USING (workspace_id = auth.jwt()->>'workspace_id')` clause on ALL tables (including join tables).
- Webhook HMAC middleware: timestamp skew ≤5min, signature verification, idempotency key in header (duplicate returns 200 with existing record).
- POST `/api/consent/withdraw` `{thread_id, channel}` → sets `consent=false`, `withdrawn_at=now()`.
- Data erasure job: `DELETE CASCADE` with `erasure_audit` log (DPDP §12).
- pgTAP `test_rls.sql`: 2 workspaces, assert cross-workspace `SELECT` returns 0 rows.

**Privacy:** Compliance with India DPDP Act 2023; immediate permanent suppression when a prospect is marked `Do Not Contact`.
- Verifiable consent: `communication_consent` table with `consented_at` timestamp per channel.
- Consent withdrawal endpoint implemented from Day 1.

**Accessibility:** WCAG 2.2 Level AA compliance across all 4 screens.

**Reliability:** Zero build/type errors.
- Webhook ingestion p95 ≤ 500ms for payloads ≤10KB. Cold-start p99 ≤ 2s (Vercel/Cloudflare).
- Idempotency key required in header; duplicate returns 200 with existing record.

## 5. USER EVIDENCE PLAN
- **Target First-User Segment (Beta Segment):** AI Automation & B2B Marketing Agencies (2–15 staff) headquartered in **India**. Target buyers: **Indian SMBs (primary)** + **US/UK SMBs (secondary)**. ICP tuned for Indian titles (Founder, CEO, Marketing Head, Growth Head) + US/UK equivalents.
- **Initial Cohort Size:** 15 private beta workspaces.
- **Recruitment Channels:** Pre-recruited 15 committed beta users from `@build_together.ai` community and warm network (each provides agency URL and signs LOI before Day 1).
- **Discovery & Feedback Questions:**
  1. "Which of today's 5 surfaced signal posts would you actually message right now, and why?"
  2. "When a prospect replies, do you track the quote in a spreadsheet, an invoice tool, or a CRM?"
  3. "Would you pay ₹1,999/month ($39/month) tomorrow if this saved you 5 hours a week of prospecting and quoting?"
- **Valid Learning Signal:** Observed user behavior inside the app (approving outreach, generating a quote, or firing a CRM webhook) and actual payment—never verbal compliments.
- **Feedback Recording:** Logged automatically in the workspace event ledger and summarized weekly in founder's Notion/Linear workspace.

## 6. MEASUREMENT PLAN
**Funnel Definitions (consistent denominators):**
- **Signed-up** = completed `/setup (Screen 1)` wizard: (1) pasted agency URL, (2) reviewed/confirmed all 5 ICP fields, (3) clicked 'Continue to Signals'. Mode selection removed — only Mode A.
- **Activation_event** = `{workspace_id, user_id, type: 'outreach_approved'|'call_logged', thread_id, timestamp}`. Unified event for analytics.
- **Activated** = generated ≥1 `activation_event` within 24h of setup completion.
- **Active** = completed `/setup` AND reviewed ≥1 signal thread in last 7 days.

- **Primary Success Metric (aligned with Persevere Criteria):** ≥5 paying workspaces (at ₹1,999/mo or $39/mo) **OR** ≥30% of workspaces that completed `/setup` within first 7 days of launch log ≥25 **terminal outcomes (Won, Lost with categorized loss reason)** by Day 14 post-launch.
  - *Terminal outcomes = `Won`, `Lost` (with categorized loss reason) ONLY. `Quote Sent` is progression milestone, not terminal outcome.*
- **Activation Metric:** ≥60% of **signed-up** workspaces generate ≥1 `activation_event` (outreach_approved or call_logged) within 24 hours.
- **Retention Expectation:** ≥40% of **activated** workspaces return at least 3 days per week in Week 2 to review daily signal threads.
- **Closed-Loop Learning Metric (Precision@10 Lift):** Workspaces with ≥25 logged outcomes show at least a 25% higher positive qualification rate on their top-10 scored leads in Week 4 compared to Week 1 (measured via automated weekly SQL job).
  - *Positive qualification rate = % of top-10 leads where user clicks `Approve Outreach` vs `Not a Fit`.*
  - *Precision@10 = of the top 10 scored leads each week, % where user clicks `Approve Outreach` vs `Not a Fit`. Evaluated via SQL: `COUNT(approved) / 10` per workspace per week.*
  - *Materialized view `mv_precision_at_10` (workspace_id, week_start, approved_count) refreshed daily via pg_cron.*
  - *Execution Failure flags surfaced in weekly founder DB review via `event_log` query (no dedicated UI in MVP).*
- **Guardrail Metrics:**
  1. LinkedIn account restriction rate: **0%**.
  2. Platform LLM/Hosting cost per **active** workspace: **≤$0.50/month** during beta (tracked via `llm_usage` daily rollup).
  3. Webhook processing failure rate: **<1%**.
  4. Quote-to-Invoice tax calculation accuracy: **100%**.

## 7. DECISION RULES
- **Persevere Criteria:** ≥5 paying customers **OR** ≥30% of workspaces that completed `/setup` within first 7 days of launch log ≥25 terminal outcomes (Won/Lost with loss reason) by Day 14 post-launch -> Proceed to Phase 1.5 (Dedicated Attribution Analytics Dashboard (`/attribution`), Watchlist, and MCP server).
- **Iterate Criteria:** High signal approval rate (≥60% of onboarded workspaces approve outreach), but **of threads transitioned to `Approved` within first 14 days of launch, <15% reach terminal outcome (Won/Lost) within 14 days of their `Approved` timestamp** -> Run qualitative audit on 10 stuck threads (Contacted >7 days without Quote Sent) to identify root cause: lead fit, outreach copy, pricing, or UI friction. Fix the identified bottleneck.
- **Pivot Criteria:** ≥60% of **activated** workspaces generate ≥3 Quotes/Invoices per week **BUT** <20% of those Quotes have `source='winthread_signal'` (i.e., users import deals manually via `source='manual_import'`) -> Pivot positioning to: AI-powered deal closing workspace with integrated VoIP (Twilio/WebRTC) for Indian agencies — featuring auto-dialer, call transcription, and quote-to-close automation.
- **Stop / Kill Criteria:** <10% of **signed-up** workspaces (completed `/setup`) generate ≥1 `activation_event` (outreach_approved or call_logged) within 14 days.
- **Review Date:** Build timebox: 14 calendar days from kickoff. Experiment: 14 days post-launch. Review: Day 35 from kickoff. Kickoff date: [INSERT_DATE]. Launch target: [INSERT_DATE+14]. Review date: [INSERT_DATE+35].
- **Decision Owner:** Jaswanth Sai (Founder).

## 8. COST AND TIME BUDGET
- **Build Timebox:** 14 calendar days (~120 focused engineering hours across 4 core screens — Mode A primary).
  - **Hour Breakdown:** Screen 1 (Setup/ICP): 20h. Screen 2 (Feed+Scoring): 30h. Screen 3 (Outreach+Call Script): 25h. Screen 4 (Deal+Quote+Invoice+Review): 35h. Integration/RLS/Testing: 10h. Total: 120h. 20% buffer = 24h.
- **Maximum Monthly Operating Cost:** **$0.00/month fixed infrastructure** (Supabase Postgres free tier + Vercel hosting free tier + Cloudflare Workers serverless scraper free tier) + **variable LLM routing via OmniRoute** — internal LLM router distributing requests across confirmed free-tier providers: Groq (Llama-3.1-70B), Together AI (Mixtral), OpenRouter (free tier).
  - **OmniRoute Contracts:** `POST /score-batch`, `POST /generate-quote`. Fallback chain with exponential backoff 1s/2s/4s (max 3). Timeout 30s. Circuit breaker: 5 failures/60s → skip provider 5min.
  - **LLM Budget per workspace/day:** ICP extraction: 1/setup. Scoring: ceil(signals/10) calls/day (max 2). Quote gen: 1/quote. Call script: 1/call. Total: 100/day. Middleware counter per workspace_id; 429 on excess with retry-after.
- **AI / API / Database Limits:** Max 100 LLM requests per workspace per day; daily signal scoring uses single consolidated batch prompt (≤10 posts per call). If >10 posts pending scoring, process in multiple sequential batches of ≤10. Store unscored posts in queue with timestamp. Prioritize by recency.
- **Manual Concierge Hours:** Up to 10 hours/week by founder curating initial signal feeds for the first 15 beta users.
  - **Concierge Definition:** Founder runs local scraper, selects ≤10 posts/user/day, inserts with `source='concierge'`. Quality bar: each post contains ≥1 buying_signal from user's ICP. **Handoff:** When Cloudflare scraper achieves ≥80% precision@10 vs concierge seeds for 3 consecutive days, disable concierge inserts.
- **Contingency:** If founder unavailable >48 hrs, Demo Signal Pack (20 pre-scored posts) activates automatically; users self-serve via 'Refresh Signals' button (Serverless scraper function on Cloudflare Workers).
- **Cost Kill Criteria:** Any third-party dependency requiring >$25/month upfront before securing the first 5 paying customers is automatically rejected.

### 8.1 Rollback & Scope-Cut Plan
**Daily Monitors (alert at 70% threshold):**
1. DB size (Supabase 500MB free tier)
2. Function invocations (Vercel/Cloudflare free tier limits)
3. Bandwidth egress

**Scope-Cut Tiers (decision matrix: >2 free-tier limits hit by Day 10 → auto-cut to Tier 2):**
- **Tier 1 (Full):** 4 screens (Setup, Feed, Outreach, Deals) — target
- **Tier 2 (Cut Screen 4 PDF):** Replace AI Quote Builder + GST Invoice PDF with Stripe Payment Link + manual invoice. Keep Quote data model, sign-off, Verified Review.
- **Tier 3 (Cut Screen 3 Call Script):** Remove 5-step Call Script drawer. Keep 1-click deep-links + `Mark Contacted` button. Outreach logging only.
- **Tier 4 (Demo Signal Pack Only):** Static 20 pre-scored posts. No live scraper. Users self-serve via 'Refresh Signals' (Cloudflare Worker).

**Fallback:** Cloudflare Workers scraper → Supabase pg_cron + pg_net for scheduled scraping if Workers limit hit.

## 9. RISKS AND OPEN QUESTIONS
- **Demand Risk:** Agencies may find public posts noisy if negative keywords are not tuned during setup.
  - **Mitigation:** Setup wizard requires **≥3 negative_keywords** before proceeding. UI shows real-time preview: "With these, 47% of sample posts filtered." Weekly job alerts founder if workspace has <5 negative_keywords AND >50% Not a Fit rate.
- **Technical Risk:** Free-tier LLM rate limits could slow down scoring; mitigated via consolidated 10-post batch scoring prompts.
- **Distribution Risk:** Relying on passive social posts is too slow; mitigated by pre-recruited 15 committed beta users before Day 1.
- **Cost Risk:** Paid contact enrichment APIs break the $0 budget; mitigated via public website extraction only for Phase 1. BYOK postponed to Phase 1.5.
- **Privacy/Security Risk:** Cross-workspace data leaks; mitigated via mandatory automated row-level isolation tests (pgTAP `test_rls.sql`) before launch.
- **Operational Risk:** Scope creep into Phase 2 voice agents; mitigated by hard 4-screen boundary (Mode B postponed).
- **Founder Contingency Risk:** Concierge dependency — mitigated by Demo Signal Pack (20 pre-scored posts) + self-serve 'Refresh Signals' button (Serverless scraper function on Cloudflare Workers). Canonical contingency spec.

- **Open Questions Requiring Founder Approval (RESOLVED — Gate to PRD Generation):**
  1. **Outreach Delivery:** **APPROVED** — 1-click deep-links: LinkedIn (messaging/compose), Email (mailto), WhatsApp (wa.me) — all pre-copied to clipboard. Zero ban risk, zero API cost.
  2. **Contact Enrichment:** **APPROVED** — Public website extraction only for Phase 1. Prospect enrichment not in MVP. BYOK postponed to Phase 1.5.
  3. **Beta Niche:** **APPROVED** — AI Automation & B2B Marketing Agencies (2–15 staff) headquartered in India. Target buyers: Indian SMBs (primary) + US/UK SMBs (secondary).

## 10. NEXT-STEP GATE
- **Gate to Create `PRD.md`, `ARCHITECTURE.md`, and `DATABASE.md`:** Founder approves this **Mode A-primary** `MVP.md` boundary, the $0 fixed infrastructure ceiling, and the 3 resolved open questions above.
- **Gate to Scale Beyond MVP (Phase 1.5):** At least 5 paying workspaces **OR** verified Precision@10 lift from the closed-loop weight formula.
- **Gate to Add Phase 2 Outpero Voice Engine:** At least 20 paying workspaces concentrated in 1–2 repeatable niches with ≥500 human-logged call outcomes.

## 10.1 Artifact Contracts (Required for Next-Step Gate)
**PRD.md must include:**
- Requirements with user stories and acceptance criteria for all 4 screens
- Split-Attribution weight formula specification (input features, update rules, cold-start, weight blending)
- Thread state machine: `Discovered → Approved → Contacted → Qualified → Quote_Sent → Won/Lost` (complete transitions per Section 3.1)
- Mode A Quote/Invoice flows with Indian GST compliance (GSTIN, HSN/SAC, place_of_supply)
- Measurement plan with automated SQL job definitions (mv_precision_at_10, v_execution_failures, weight_change_log, llm_usage)

**ARCHITECTURE.md must include:**
- Component diagram: 4-screen frontend, API layer, Supabase database, OmniRoute LLM router (lib/omniroute/), Cloudflare Workers scraper
- Data flows: signal ingestion → scoring → thread state transitions → outcome logging → weight update job
- API contracts: OmniRoute request/response for scoring prompt and quote generation prompt (per Section 3.7)
- State transition diagram for thread lifecycle (per Section 3.1)
- Security: workspace-level RLS policies (exact USING clauses), DPDP Act compliance (consent withdrawal, erasure), webhook HMAC signature verification (Mode B)
- Observability: materialized views, event logs, weekly founder query definitions

**DATABASE.md must include:**
- Schema: workspaces, icp_profiles, threads, signals, keyword_weights, suppressions, outcomes, events, quotes, quote_line_items, invoices, verified_reviews, weights, communication_consent, event_log, job_failures
- RLS policies per table (exact USING clause)
- Indexes for scoring queries and `mv_precision_at_10` materialized view
- Migration strategy for weight updates (weight_change_log)
- Seed data: global default source_weights, keyword_weights per ICP

### Appendix A: Database Schema Contracts (MVP Scope)
**RLS Policy Template (applies to ALL tables):**
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON <table>
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

| Table | Key Columns | Constraints | Notes |
|-------|-------------|-------------|-------|
| **threads** | `id` (PK), `source_thread_id` (TEXT), `workspace_id` (FK), `source_channel` (ENUM: 'linkedin'\|'twitter'\|'email'\|'other'), `post_text`, `url`, `author_handle`, `posted_at`, `score` (0-100), `weight_json` (JSONB), `stage` (ENUM: 'discovered'\|'approved'\|'contacted'\|'qualified'\|'quote_sent'\|'won'\|'lost'), `created_at` | `source_thread_id` + `workspace_id` UNIQUE. `stage` default 'discovered'. RLS. | `source_thread_id` TEXT (not UUID) — external IDs vary by platform. |
| **outcomes** | `id` (PK), `thread_id` (FK), `workspace_id` (FK), `type` (ENUM: 'won'\|'lost'), `loss_category` (ENUM: 'lead_fit_failure'\|'execution_failure'\|NULL), `weight_delta` (JSONB), `created_at` | `thread_id` + `type` UNIQUE (one terminal outcome per thread). RLS. | `loss_category` required when type='lost'. `weight_delta` stores {source_weight_delta, keyword_weight_deltas[]}. |
| **quotes** | `id` (PK), `thread_id` (FK), `workspace_id` (FK), `pdf_url`, `signoff_hash`, `status` (ENUM: 'draft'\|'sent'\|'signed'\|'expired'), `source` (ENUM: 'winthread_signal'\|'manual_import'\|'crm_sync'), `client_gstin`, `place_of_supply`, `currency`, `total_cents`, `tax_breakdown` (JSONB), `created_at` | `signoff_hash` UNIQUE. `source` default 'winthread_signal' when thread_id present else 'manual_import'. RLS. | Indian GST requires `gstin`, `hsn_sac` (on line_items), `place_of_supply`. |
| **invoices** | `id` (PK), `quote_id` (FK), `workspace_id` (FK), `invoice_number` (UNIQUE), `gst_json` (JSONB), `pdf_url`, `status` (ENUM: 'draft'\|'issued'\|'paid'\|'cancelled'), `irn`, `ack_no`, `created_at` | `invoice_number` UNIQUE per workspace. RLS. | `gst_json` = {cgst, sgst, igst, cess, hsn_sac_per_item}. |
| **communication_consent** | `id` (PK), `thread_id` (FK), `workspace_id` (FK), `channel` (ENUM: 'whatsapp'\|'email'\|'linkedin'\|'phone'), `consented` (BOOLEAN), `consented_at` (TIMESTAMPTZ), `withdrawn_at` (TIMESTAMPTZ NULL) | `thread_id` + `channel` UNIQUE. RLS. | DPDP §6: verifiable consent with timestamp. Withdrawal via POST /api/consent/withdraw. |
| **verified_reviews** | `id` (PK), `deal_id` (FK), `workspace_id` (FK), `hash` (CHAR(64) UNIQUE), `algorithm` (TEXT DEFAULT 'BLAKE3'), `nonce` (BYTEA, 16 bytes), `signed_at`, `revoked` (BOOLEAN DEFAULT false), `token` (TEXT — JWT 7-day expiry) | `hash` UNIQUE. RLS. | Input: `deal_id\|\|amount_cents\|\|outcome\|\|timestamp\|\|nonce`. Display: QR code → `/verify/:review_id`. |
| **keyword_weights** | `id` (PK), `workspace_id` (FK), `keyword` (TEXT), `weight` (NUMERIC DEFAULT 1.0), `created_at`, `updated_at` | `workspace_id` + `keyword` UNIQUE. RLS. | Seeded on workspace creation from ICP buying_signals. New keywords: INSERT ON CONFLICT DO NOTHING weight=1.0. |

**Additional Tables (referenced above):**
- `icp_profiles`: workspace_id, services[], buyer_titles[], pain_points[], buying_signals[], negative_keywords[], created_at
- `suppressions`: workspace_id, prospect_identifier, channel, reason, suppressed_at (Do Not Contact — immediate permanent)
- `weights` (source_weights): workspace_id, channel, weight, updated_at
- `events`: workspace_id, thread_id, event_type, payload_json, timestamp (unified event log for analytics)
- `event_log`: workspace_id, thread_id, event_type (e.g., 'execution_failure'), flagged_fields[], timestamp
- `job_failures`: job_name, workspace_id, payload_json, error, retry_count, next_retry_at, resolved_at
- `llm_usage`: workspace_id, date, call_type (icp_extraction\|scoring\|quote_gen\|call_script), provider, tokens_in, tokens_out, cost_usd, created_at
- `weight_change_log`: workspace_id, channel, keyword, old_weight, new_weight, outcome_count, outcome_type, timestamp
- `mv_precision_at_10` (materialized view): workspace_id, week_start, approved_count, total_scored, precision_at_10
- `v_execution_failures` (view): workspace_id, thread_id, flagged_fields, timestamp (from event_log)

---
- **Primary experiment:** 4-screen private beta (Mode A primary) testing whether 15 pre-recruited B2B agencies execute the **Signal → 1-Click Outreach/Call Script → Qualified → Quote Sent → Won/Lost (with loss reason) → Closed-Loop Weight Update (Source Weight + Keyword Weights only)** flow.
- **Riskiest assumptions:** (1) Agency founders will log downstream Quote/Won/Lost outcomes in the same system that discovers public intent signals. (2) Agencies will pay ₹1,999/month ($39/month) for this closed loop.
- **Success evidence:** ≥5 paying agency workspaces **OR** ≥30% of workspaces that completed `/setup` within first 7 days of launch log ≥25 **terminal deal outcomes (`Won`, `Lost` with categorized loss reason)** and ≥60% activation within 14 days of launch.
- **Kill evidence:** <10% of **signed-up** workspaces (completed `/setup`) generate ≥1 `activation_event` (outreach_approved or call_logged) within 14 days.
- **Launch deadline:** Build timebox: 14 calendar days from kickoff. Experiment: 14 days post-launch. Review: Day 35 from kickoff. Kickoff date: [INSERT_DATE]. Launch target: [INSERT_DATE+14]. Review date: [INSERT_DATE+35].
- **First action after approval:** Generate and lock `docs/PRD.md`, `docs/ARCHITECTURE.md`, and `docs/DATABASE.md`.