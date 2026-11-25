# PRD.md — WinThread Product Requirements Document (Phase 1 MVP)

**Version:** 1.0 | **Source:** MVP.md v2.2 | **Status:** Implementation-Ready

---

## 1. EXECUTIVE SUMMARY

**Product:** WinThread — a single canonical "Revenue Thread" web application for small B2B agencies (2–15 staff).

**Core Value Promise:** "From public buyer post to signed quote in one thread—and every logged outcome tunes the lead scorer so tomorrow's signals rank higher for your actual buyers."

**Problem:** Small B2B agencies suffer from broken revenue conversion velocity. Lead-finding tools surface public posts but never learn which leads pay invoices. Client management tools handle quotes and tax invoices but sit empty without leads.

**Target Early User:** Founders of AI automation and B2B marketing agencies (2–15 staff) in India and global English-speaking markets selling $1,000–$5,000/month (₹50,000–₹4,00,000/month) retainers.

**Job-to-be-Done:** Find prospects publicly asking for help, reach out with post evidence, send an AI quote or tax-compliant invoice (or sync to an existing CRM), and automatically train the lead finder using real Won/Lost outcomes.

**Mode A (Primary — MVP):** Built-in Quote & Tax Invoice Ledger with Split-Attribution outcome learning.
**Mode B (Postponed to Phase 1.5):** External CRM Connector — builds only if ≥3 beta users request it.

---

## 2. USER PERSONAS & JOBS-TO-BE-DONE

### 2.1 Primary Persona: Agency Founder (India)
- **Role:** Founder/CEO of 2–15 person AI automation or B2B marketing agency
- **Revenue:** ₹50,000–₹4,00,000/month retainers
- **Pain Points:**
  - Spends 10+ hours/week manually searching LinkedIn/Twitter for buyer intent
  - No systematic way to track which outreach converts to paid deals
  - Quotes/invoices managed in separate tools (spreadsheets, Zoho, Razorpay)
  - Loses context between signal discovery and deal closing
- **JTBD:** "When I see a prospect asking for help publicly, I want to reach out with their exact post as evidence, send a professional GST-compliant quote, and have the system learn from whether we won or lost so future signals are better ranked."

### 2.2 Secondary Persona: Growth Marketer / Sales Lead
- **Role:** First sales hire at agency (2–5 person team)
- **Pain Points:**
  - Needs structured call script for phone outreach
  - Must log call outcomes for founder visibility
  - Needs quick way to send WhatsApp/Email follow-ups with consent tracking
- **JTBD:** "When a prospect replies, I want a 5-step call script that guides me, logs the outcome automatically, and captures communication consent for compliance."

---

## 3. FUNCTIONAL REQUIREMENTS (4 CORE SCREENS)

### Screen 1: Website-to-ICP Setup Wizard (`/setup`)
**User Story:** As an agency founder, I want to paste my agency URL and have the system extract my ICP so I can start receiving relevant signals immediately.

**Acceptance Criteria:**
1. Input: Single text field for agency website URL
2. LLM extracts and presents 5 editable ICP fields:
   - Services offered (array of strings)
   - Buyer titles (array: "Founder", "CEO", "Marketing Head", "Growth Head", "CTO", "VP Marketing")
   - Pain points (array of strings)
   - Buying signals (array of strings — becomes `keyword_weights` seed)
   - Negative keywords (array of strings — **minimum 3 required** to proceed)
3. Real-time preview shows: "With these negative keywords, X% of sample posts filtered"
4. Mode selection: **Mode A only** (Built-in Quote & Invoice Ledger — Primary). Mode B removed from MVP.
5. On submit: Creates `workspace`, `icp_profile`, seeds `keyword_weights` (weight=1.0 per buying signal), seeds `weights` (source_weights: LinkedIn=1.2, Twitter=0.8, Email=1.0, Other=1.0)
6. Redirects to `/threads` (Screen 2)

**Edge Cases:**
- Website unreachable → manual entry fallback for all 5 fields
- Extraction confidence <70% → shows warning, allows manual override
- Duplicate workspace (same domain) → returns existing workspace

---

### Screen 2: Daily Ranked Signal Feed (`/threads`)
**User Story:** As an agency founder, I want to see 5–10 scored leads per day with their exact public post text so I can quickly decide which to pursue.

**Acceptance Criteria:**
1. Displays **5–10 threads per day** (batch scored via OmniRoute)
2. Each thread card shows:
   - **Score & Weight Badge** (inline component):
     - ICP Match Score: 0–100% (semantic similarity from scoring prompt)
     - Source Weight multiplier: e.g., "1.2x LinkedIn", "0.8x Twitter" (from `weights` table)
   - Full post text (truncated at 300 chars, expandable)
   - Source channel badge (LinkedIn/Twitter/Email/Other)
   - Author handle + profile link
   - Posted timestamp (relative: "2h ago")
   - Source URL (opens in new tab)
   - **Actions:** `Not a Fit` | `Approve Outreach`
3. `Approve Outreach` click:
   - Requires `idempotency_key` (generated client-side)
   - Transitions thread `stage: 'discovered' → 'approved'`
   - Creates `outreach_log` record (pending)
   - Opens 1-click deep-link (LinkedIn/Email/WhatsApp) with pre-copied AI message
   - Adds thread to Screen 3 Approval Queue
4. `Not a Fit` click:
   - Transitions `approved → discovered` **only within 5 minutes AND before `outreach_log.sent_at` is set**
   - No weight penalty (not a terminal outcome)
5. Empty state: "No signals today. Check tomorrow or click 'Refresh Signals' (Cloudflare Worker)"
6. Pagination: Infinite scroll, loads older days

**Data Source:** `threads` table joined with `weights` for source_weight display.

---

### Screen 3: Outreach Execution & 5-Step Call Script Co-Pilot (`/outreach`)
**User Story:** As a growth marketer, I want a queue of approved threads awaiting contact confirmation, with deep-links and a call script so I can execute outreach efficiently.

**Acceptance Criteria:**

#### 3.1 Approval Queue View
- Shows only threads with `stage = 'approved'` (awaiting contact confirmation)
- Each row: Prospect name, company, source channel, `Approve Outreach` timestamp, `Mark Contacted` button

#### 3.2 1-Click Deep-Links (Zero Ban Risk)
- **LinkedIn:** `https://www.linkedin.com/messaging/compose/?recipient={author_handle}&message={encoded_ai_message}`
- **Email:** `mailto:{extracted_email}?subject={subject}&body={encoded_ai_message}`
- **WhatsApp:** `https://wa.me/{phone}?text={encoded_ai_message}`
- Click copies AI-drafted message to clipboard, opens deep-link in new tab
- Message personalized using `post_text`, `icp_services`, prospect name

#### 3.3 5-Step Call Script Drawer (Radix Dialog)
**State Machine:** `step_1_opener → step_2_discovery → step_3_pitch → step_4_objection → step_5_close`
- Each step: Script text + variable injection (prospect_name, company, post_excerpt, icp_service)
- User records outcome via radio buttons:
  - `Interested` → transitions thread `approved → contacted → qualified`
  - `Send Quote` → transitions thread `approved → contacted → qualified`
  - `Callback` → transitions thread `contacted → approved` (resets to awaiting contact)
  - `Not Interested` → transitions thread `approved → lost` (opens Loss Reason modal)
  - `Wrong Number` → transitions thread `approved → lost` (Execution Failure, no weight penalty)
- **Communication Consent Capture (DPDP §6):**
  - Checkbox per channel: "Prospect verbally agreed to follow-up via WhatsApp/Email/LinkedIn"
  - On check: Creates `communication_consent` record with `consented=true`, `consented_at=now()`
  - Mandatory for `Interested`/`Send Quote` outcomes

#### 3.4 Mark Contacted Button
- Alternative to deep-link click for logging contact
- Sets `contacted_at`, `contact_method` (linkedin|email|whatsapp|phone), `consent_status`
- Transitions `approved → contacted`

---

### Screen 4: Deal & Billing Ledger (`/deals`) — Mode A Primary
**User Story:** As an agency founder, I want a 4-stage deal board where I can generate AI quotes, send GST-compliant invoices, and log Won/Lost outcomes that automatically improve my lead scoring.

**Acceptance Criteria:**

#### 4.1 4-Stage Kanban Board
Columns: `Qualified` → `Quote_Sent` → `Won` → `Lost`
- Drag-and-drop between stages (except `Won`/`Lost` are terminal)
- Each card: Client name, deal value, source badge (`winthread_signal` | `manual_import`), actions

#### 4.2 AI Quote Builder
- Triggered when moving `Qualified → Quote_Sent`
- Inputs: `thread_evidence` (post text, author, company), `icp_services` (from ICP), `client_gstin` (optional), `currency` (INR/USD)
- Output: Structured quote with line items, tax breakdown, total
- Generates PDF via `@react-pdf/renderer`
- Creates `quotes` record with `source='winthread_signal'` (if `thread_id` present) or `manual_import`
- Creates digital sign-off link: `/sign/{signoff_hash}` (JWT 7-day expiry)

#### 4.3 GST-Compliant Invoice Generation
- 1-click from signed quote (`status='signed'`)
- Indian GST fields: `gstin`, `hsn_sac` (per line item), `place_of_supply`, `cgst`, `sgst`, `igst`, `cess`
- Multi-currency: INR (GST) / USD (no GST)
- PDF generation with `@react-pdf/renderer`
- Creates `invoices` record with unique `invoice_number` per workspace
- IRN/ACK fields for future e-invoicing integration (stored null in MVP)

#### 4.4 Verified Review (Social Proof)
- On `Won` outcome: Client receives email with sign-off link
- Client signs hash of: `deal_id||amount_cents||outcome||timestamp||nonce` (BLAKE3)
- Stored immutably in `verified_reviews` table
- Displayable on agency profile as QR code → `/verify/{review_id}`

#### 4.5 Mandatory Split Loss Reason Modal
- Triggered on any transition to `Lost` (from `Qualified` or `Quote_Sent`)
- **Binary choice, no free-text:**
  1. **[Lead Fit Failure]** — Prospect wasn't a good fit for our services
     - Effect: Source Weight ×0.85, Keyword Weights ×0.85 for matched keywords
  2. **[Execution Failure]** — We lost due to pricing, copy, or our process
     - Effect: Preserves weights, creates `event_log` entry `{event_type: 'execution_failure', flagged_fields: ['pricing'|'copy'|'both']}`
- Required before `Lost` state persists
- Creates `outcomes` record with `loss_category` and `weight_delta`

#### 4.6 Quote/Deal Source Tracking
- Every `quotes` record: `source` ENUM ('winthread_signal' | 'manual_import' | 'crm_sync')
- `thread_id` present → `source='winthread_signal'`
- "New Quote" button without thread → `source='manual_import'`
- CRM sync: Phase 1.5

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Quality Floor (from MVP.md Section 4)

**Security:**
- Strict workspace-level data isolation via RLS on ALL tables
- RLS policy template: `USING (workspace_id = auth.jwt()->>'workspace_id')`
- Webhook HMAC middleware (Mode B): timestamp skew ≤5min, signature verification, idempotency key in header
- POST `/api/consent/withdraw` `{thread_id, channel}` → sets `consent=false`, `withdrawn_at=now()`
- Data erasure job: `DELETE CASCADE` with `erasure_audit` log (DPDP §12)
- pgTAP `test_rls.sql`: 2 workspaces, assert cross-workspace `SELECT` returns 0 rows

**Privacy (DPDP Act 2023):**
- Verifiable consent: `communication_consent` table with `consented_at` timestamp per channel
- Consent withdrawal endpoint implemented from Day 1
- Immediate permanent suppression when prospect marked `Do Not Contact` (`suppressions` table)

**Accessibility:**
- WCAG 2.2 Level AA compliance across all 4 screens

**Reliability:**
- Zero build/type errors (TypeScript strict mode)
- Webhook ingestion p95 ≤ 500ms for payloads ≤10KB
- Cold-start p99 ≤ 2s (Vercel/Cloudflare)
- Idempotency key required in header; duplicate returns 200 with existing record

### 4.2 Performance Budgets
- LLM Budget: ≤100 requests/workspace/day (enforced by middleware counter)
- Scoring: Single batch ≤10 posts per call, multiple sequential batches if >10
- Hosting cost: $0 fixed (Supabase/Vercel/Cloudflare free tiers)
- Variable LLM cost: ≤$0.50/workspace/month (tracked via `llm_usage` daily rollup)

---

## 5. USER JOURNEY MAPS

### 5.1 Primary Happy Path (Signal → Won)
```
Day 0: Founder completes /setup (pastes URL, confirms ICP, min 3 negative keywords)
       │
Day 1: Views /threads → sees 5-10 scored cards with Score & Weight Badge
       │
       ├── Clicks "Approve Outreach" on Thread A
       │      │
       │      ├── Deep-link opens LinkedIn with pre-copied message
       │      │
       │      └── Thread A: discovered → approved (added to /outreach queue)
       │
Day 2: Opens /outreach → sees Thread A in Approval Queue
       │
       ├── Clicks "Mark Contacted" (or deep-link click detected via UTM)
       │      │
       │      └── Thread A: approved → contacted
       │
       ├── Opens Call Script Drawer for phone follow-up
       │      │
       │      ├── Records "Interested" outcome
       │      │      │
       │      │      └── Thread A: contacted → qualified
       │      │
       │      └── Captures WhatsApp consent (communication_consent record)
       │
Day 3: Opens /deals → Thread A in Qualified column
       │
       ├── Drags to Quote_Sent → AI Quote Builder opens
       │      │
       │      ├── Generates quote with GST breakdown
       │      ├── Sends sign-off link to client
       │      └── Creates quote record (source='winthread_signal')
       │
Day 5: Client signs quote (digital sign-off)
       │      │
       │      └── Thread A: quote_sent → won
       │            │
       │            ├── Creates outcome (type='won', weight_delta={source:+10%, keywords:+10%})
       │            ├── Triggers weight update job (next 02:00 UTC)
       │            └── Sends Verified Review request to client
       │
Day 7: Weight update job runs → Source Weight ×1.10, Keyword Weights ×1.10 for matched keywords
       └── Precision@10 improves for future signals
```

### 5.2 Loss Paths

**Path A: Lead Fit Failure (Not Interested from Call Script)**
```
Thread A: approved → contacted → qualified → lost (loss_category='lead_fit_failure')
         │
         └── Weight penalty: Source Weight ×0.85, matched Keyword Weights ×0.85
```

**Path B: Execution Failure (Lost at Quote_Sent)**
```
Thread A: qualified → quote_sent → lost (loss_category='execution_failure')
         │
         └── No weight penalty. Creates event_log {flagged_fields: ['pricing']}
             → Weekly founder audit via SQL
```

**Path C: Early Rejection (Not a Fit on Feed)**
```
Thread A: discovered → approved → discovered (undo within 5 min)
         │
         └── No outcome logged, no weight change
```

---

## 6. SUCCESS METRICS & GUARDRAILS

### 6.1 Primary Success Metric (Persevere Criteria)
**≥5 paying workspaces (₹1,999/mo or $39/mo) OR ≥30% of workspaces that completed `/setup` within first 7 days log ≥25 terminal outcomes (Won/Lost with loss reason) by Day 14 post-launch.**

- Terminal outcomes = `Won`, `Lost` (with categorized loss reason) ONLY
- `Quote_Sent` is progression milestone, NOT terminal outcome

### 6.2 Activation Metric
**≥60% of signed-up workspaces generate ≥1 `activation_event` (outreach_approved or call_logged) within 24 hours.**

- `activation_event` = `{workspace_id, user_id, type: 'outreach_approved'|'call_logged', thread_id, timestamp}`

### 6.3 Retention Expectation
**≥40% of activated workspaces return at least 3 days per week in Week 2 to review daily signal threads.**

### 6.4 Closed-Loop Learning Metric (Precision@10 Lift)
**Workspaces with ≥25 logged outcomes show ≥25% higher positive qualification rate on top-10 scored leads in Week 4 vs Week 1.**

- Positive qualification rate = % of top-10 leads where user clicks `Approve Outreach` vs `Not a Fit`
- Precision@10 = `COUNT(approved) / 10` per workspace per week
- Measured via materialized view `mv_precision_at_10` (workspace_id, week_start, approved_count, total_scored, precision_at_10) refreshed daily via pg_cron
- Execution Failure flags surfaced via `v_execution_failures` view (workspace_id, thread_id, flagged_fields, timestamp)

### 6.5 Guardrail Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| LinkedIn account restriction rate | 0% | Zero automated sending |
| LLM/Hosting cost per active workspace | ≤$0.50/month | `llm_usage` daily rollup |
| Webhook processing failure rate | <1% | `job_failures` table |
| Quote-to-Invoice tax calculation accuracy | 100% | Unit tests + manual verification |

---

## 7. DECISION RULES & GATES

### 7.1 Experiment Decision Rules (Day 35 Review)

| Criteria | Condition | Action |
|----------|-----------|--------|
| **Persevere** | ≥5 paying customers **OR** ≥30% of workspaces (completed `/setup` in first 7 days) log ≥25 terminal outcomes by Day 14 | Proceed to Phase 1.5 (Attribution Dashboard, Watchlist, MCP server) |
| **Iterate** | High signal approval (≥60% approve outreach) **BUT** <15% of `Approved` threads reach terminal outcome within 14 days of `Approved` timestamp | Qualitative audit on 10 stuck threads (Contacted >7 days without Quote Sent). Fix bottleneck: lead fit, outreach copy, pricing, or UI friction |
| **Pivot** | ≥60% activated workspaces generate ≥3 Quotes/week **BUT** <20% have `source='winthread_signal'` | Pivot to: AI-powered deal closing workspace with integrated VoIP (auto-dialer, transcription, quote-to-close) |
| **Stop/Kill** | <10% of signed-up workspaces generate ≥1 `activation_event` within 14 days | Shut down experiment |

### 7.2 Build Gates
- **Gate to PRD/ARCHITECTURE/DATABASE generation:** Founder approves Mode A-primary MVP.md boundary, $0 fixed infrastructure, 3 resolved open questions
- **Gate to Phase 1.5:** ≥5 paying workspaces OR verified Precision@10 lift
- **Gate to Phase 2 (Outpero Voice):** ≥20 paying workspaces in 1–2 niches with ≥500 human-logged call outcomes

### 7.3 Rollback & Scope-Cut Plan (Daily Monitors at 70% Threshold)
1. DB size (Supabase 500MB free tier)
2. Function invocations (Vercel/Cloudflare free tier limits)
3. Bandwidth egress

**Scope-Cut Tiers (>2 free-tier limits hit by Day 10 → auto-cut to Tier 2):**
- **Tier 1 (Target):** 4 screens full
- **Tier 2:** Replace AI Quote Builder + GST Invoice PDF with Stripe Payment Link + manual invoice. Keep Quote data model, sign-off, Verified Review.
- **Tier 3:** Remove 5-step Call Script drawer. Keep 1-click deep-links + `Mark Contacted`.
- **Tier 4:** Demo Signal Pack only (20 pre-scored posts). No live scraper.

---

## 8. RISKS & MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Agencies find public posts noisy | High | High | Setup wizard requires ≥3 negative_keywords. Real-time preview. Weekly job alerts if <5 negative_keywords AND >50% Not a Fit rate |
| Free-tier LLM rate limits slow scoring | Medium | Medium | Consolidated 10-post batch prompts. Queue with timestamp priority |
| Passive social posts too slow | Medium | High | Pre-recruited 15 committed beta users before Day 1 |
| Paid contact enrichment breaks $0 budget | Low | High | Public website extraction only. BYOK postponed to Phase 1.5 |
| Cross-workspace data leaks | Low | Critical | Mandatory pgTAP `test_rls.sql` before launch |
| Scope creep into voice agents | Medium | Medium | Hard 4-screen boundary. Mode B postponed |
| Founder concierge dependency | Medium | High | Demo Signal Pack (20 pre-scored posts) + self-serve 'Refresh Signals' button |

---

## 9. OUT OF SCOPE (EXPLICIT NON-GOALS)

**Postponed to Phase 1.5:**
- Dedicated Attribution Analytics Dashboard (`/attribution`)
- Automated competitor Watchlist profile monitoring
- Background LinkedIn OAuth queue sending
- Mode B (External CRM Connector) — builds only if ≥3 beta users request it

**Postponed to Phase 2:**
- Outpero (live AI voice telecalling engine)
- Virtual phone number rental
- Bulk CSV auto-dialing
- Public no-signup SEO lead-magnet tools (`/tools/*`)
- MCP server exposing WinThread data to AI assistants

**Permanently Excluded:**
- Project task Kanban boards
- Recurring tasks
- Team payroll/payslips
- Domain expiry reminders
- Secrets vault
- Native mobile app wrappers

---

## 10. SPLIT-ATTRIBUTION WEIGHT FORMULA SPECIFICATION

### 10.1 Input Features (per signal thread)
1. **ICP Match Score** (0–100%, semantic similarity from scoring prompt)
2. **Source Weight** (channel multiplier from `weights` table):
   - LinkedIn: 1.2x (default)
   - Twitter/X: 0.8x (default)
   - Email: 1.0x (default)
   - Other: 1.0x (default)
3. **Keyword Weights** (per buying-signal keyword from `keyword_weights` table, default 1.0)
4. **Loss Reason Category** (binary): Lead Fit Failure vs Execution Failure

### 10.2 Final Score Formula
```
Final Score = ICP_Match_Score × Source_Weight × (∏ Keyword_Weights_for_matched_keywords)
```

### 10.3 Update Rules (Damped Bayesian, α=5, clamp bounds [0.25, 2.50])

| Outcome | Source Weight | Keyword Weights (matched) | ICP Match Score |
|---------|---------------|---------------------------|-----------------|
| **Lead Fit Failure** (Lost) | ×0.85 (15% penalty) | ×0.85 per matched keyword | Unchanged |
| **Execution Failure** (Lost) | Preserved | Preserved | Unchanged. Creates `event_log` flag |
| **Won** | ×1.10 (10% reward) | ×1.10 per matched keyword | +5pp additive boost (capped at 100%) |

**Weights update ONLY after terminal outcomes (`Won`, `Lost` with loss_category).** `Quote_Sent` triggers NO weight update.

### 10.4 Cold-Start Handling (New Workspaces)
- Default Source Weights = {LinkedIn: 1.2, Twitter: 0.8, Email: 1.0, Other: 1.0}
- On workspace creation: `keyword_weights` seeded with one row per ICP buying_signal (weight=1.0)
- New keywords observed in scored posts: `INSERT ON CONFLICT DO NOTHING weight=1.0`
- Weights frozen until workspace reaches 25 terminal outcomes

### 10.5 Weight Blending (Smooth Transition for n<25 Outcomes)
```
For workspace with n terminal outcomes (<25):
weight = (n/25) * workspace_weight + (1 - n/25) * global_weight
```
- Global weight updated weekly via same weight update job
- **MVP: NO cross-workspace aggregation** — weights are per-workspace only

### 10.6 Minimum Outcome Threshold
- Workspace must log ≥25 terminal outcomes before its weight history influences scoring for other workspaces
- MVP: No cross-workspace influence. Global defaults apply to all immature workspaces.

### 10.7 Measurement (Precision@10 Lift)
- Automated weekly job materializes top-10 approval rates per workspace per week
- Lift = (Week 4 top-10 approval rate) / (Week 1 top-10 approval rate) for workspaces with ≥25 outcomes vs control group (<10 outcomes)
- Target: ≥25% lift
- Implemented via `mv_precision_at_10` materialized view + pg_cron daily refresh

### 10.8 Weight Update Job Spec
- **Schedule:** Daily at 02:00 UTC (post-batch scoring)
- **Idempotency:** Keyed on `workspace_id + outcome_date`. `SELECT FOR UPDATE` on `weights` table.
- **Failed runs:** Logged to `job_failures` with exponential backoff retry (max 3)
- **Outputs:**
  1. Updated `weights` table (source_weights per channel, keyword_weights per buying signal)
  2. `weight_change_log` table: `{workspace_id, channel, keyword, old_weight, new_weight, outcome_count, outcome_type, timestamp}`
  3. `mv_precision_at_10` materialized view refreshed
  4. `llm_usage` daily rollup for cost tracking (≤$0.50/ws/mo)

---

## 11. THREAD STATE MACHINE (COMPLETE TRANSITIONS)

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

**Terminal States:** `Won`, `Lost` (with categorized loss reason). `Quote_Sent` is intermediate — triggers NO weight update.

**Reply Detection:** `Contacted` set on (a) deep-link click tracked via UTM, OR (b) Call Script drawer outcome `Interested`/`Send Quote`.

**Undo Window:** `Approved` → `Discovered` allowed only within 5 minutes AND before `outreach_log.sent_at` is set.

---

## 12. MODE A QUOTE/INVOICE FLOWS (INDIAN GST COMPLIANCE)

### 12.1 Quote Generation Flow
1. User drags thread from `Qualified` → `Quote_Sent` column
2. AI Quote Builder modal opens with:
   - Thread evidence (post text, author, company)
   - ICP services (pre-filled line items)
   - Client GSTIN field (optional, validated format: 22AAAAA0000A1Z5)
   - Place of supply (state dropdown, defaults to agency state)
   - Currency selector (INR/USD)
3. OmniRoute `generateQuote` prompt returns:
   - Line items: `[{description, qty, unit_price_cents, hsn_sac, gst_rate}]`
   - Tax breakdown: `{cgst_cents, sgst_cents, igst_cents, total_tax_cents}`
   - Total: `total_cents`
4. PDF generated via `@react-pdf/renderer` with agency branding
5. Creates `quotes` record: `signoff_hash` (BLAKE3), `status='draft'`
6. User clicks "Send for Sign-off" → email with `/sign/{signoff_hash}` link (JWT 7-day expiry)
7. On send: `status='sent'`, `sent_at=now()`

### 12.2 Digital Sign-Off & Won Transition
1. Client opens `/sign/{signoff_hash}` → reviews quote → clicks "Accept"
2. Server verifies JWT, checks expiry, validates hash
3. Creates `verified_reviews` record:
   - `hash` = BLAKE3(`deal_id||amount_cents||outcome||timestamp||nonce`)
   - `token` = JWT (7-day expiry for verification page)
4. Updates `quotes`: `status='signed'`, `signed_at=now()`
5. Thread transitions: `Quote_Sent` → `Won`
6. Creates `outcomes` record: `type='won'`, `weight_delta={source_weight_delta: +10%, keyword_weight_deltas: [...]}`

### 12.3 Invoice Generation (1-Click from Signed Quote)
1. User clicks "Generate Invoice" on signed quote
2. Creates `invoices` record:
   - `invoice_number`: Sequential per workspace (format: `INV-YYYY-XXXX`)
   - `gst_json`: `{cgst, sgst, igst, cess, hsn_sac_per_item}` from quote
   - `pdf_url`: Generated via `@react-pdf/renderer`
   - `status='issued'`
   - `irn`, `ack_no`: Null (e-invoicing Phase 1.5)
3. PDF includes: Agency GSTIN, Client GSTIN, HSN/SAC per line, Place of Supply, CGST/SGST/IGST breakdown

### 12.4 GST Rules (Indian Compliance)
- **Intra-state (same state):** CGST + SGST (e.g., 9% + 9% = 18%)
- **Inter-state (different state):** IGST (e.g., 18%)
- **Export (USD):** Zero-rated (0% GST), `place_of_supply` = client country
- **HSN/SAC:** Required per line item (services typically 998314)
- **GSTIN Validation:** Regex `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`

---

## 13. MEASUREMENT PLAN — AUTOMATED SQL JOB DEFINITIONS

### 13.1 `mv_precision_at_10` (Materialized View)
```sql
CREATE MATERIALIZED VIEW mv_precision_at_10 AS
SELECT
  workspace_id,
  date_trunc('week', created_at) AS week_start,
  COUNT(*) FILTER (WHERE stage IN ('approved','contacted','qualified','quote_sent','won')) AS approved_count,
  10 AS total_scored,
  (COUNT(*) FILTER (WHERE stage IN ('approved','contacted','qualified','quote_sent','won'))::numeric / 10) AS precision_at_10
FROM threads
WHERE created_at >= NOW() - INTERVAL '8 weeks'
GROUP BY workspace_id, date_trunc('week', created_at);
-- Refreshed daily at 03:00 UTC via pg_cron
```

### 13.2 `v_execution_failures` (View)
```sql
CREATE VIEW v_execution_failures AS
SELECT
  workspace_id,
  thread_id,
  flagged_fields,
  timestamp
FROM event_log
WHERE event_type = 'execution_failure'
  AND timestamp > NOW() - INTERVAL '7 days';
-- Weekly founder audit: SELECT * FROM v_execution_failures;
```

### 13.3 `weight_change_log` (Table)
```sql
CREATE TABLE weight_change_log (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  channel TEXT,           -- NULL for keyword changes
  keyword TEXT,           -- NULL for source weight changes
  old_weight NUMERIC NOT NULL,
  new_weight NUMERIC NOT NULL,
  outcome_count INT NOT NULL,
  outcome_type TEXT NOT NULL,  -- 'won' | 'lead_fit_failure' | 'execution_failure'
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
-- Index: (workspace_id, timestamp DESC)
```

### 13.4 `llm_usage` (Daily Rollup Table)
```sql
CREATE TABLE llm_usage (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  date DATE NOT NULL,
  call_type TEXT NOT NULL,  -- 'icp_extraction' | 'scoring' | 'quote_gen' | 'call_script'
  provider TEXT NOT NULL,   -- 'groq' | 'together' | 'openrouter'
  tokens_in INT NOT NULL,
  tokens_out INT NOT NULL,
  cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, date, call_type, provider)
);
-- Daily rollup job at 01:00 UTC
-- Alert if SUM(cost_usd) > 0.50 for any workspace in rolling 30 days
```

### 13.5 Founder Query Library (`founder_queries.sql`)
```sql
-- Weekly weight shifts for mature workspaces (≥25 outcomes)
SELECT workspace_id, channel, keyword, old_weight, new_weight, outcome_type, timestamp
FROM weight_change_log
WHERE timestamp > NOW() - INTERVAL '7 days'
  AND workspace_id IN (
    SELECT workspace_id FROM outcomes
    WHERE type IN ('won','lost')
    GROUP BY workspace_id
    HAVING COUNT(*) >= 25
  )
ORDER BY workspace_id, timestamp DESC;

-- Stuck threads: Contacted >7 days without Quote_Sent
SELECT t.*, w.name as workspace_name
FROM threads t
JOIN workspaces w ON t.workspace_id = w.id
WHERE t.stage = 'contacted'
  AND t.updated_at < NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM threads t2
    WHERE t2.workspace_id = t.workspace_id
      AND t2.stage IN ('qualified','quote_sent','won')
      AND t2.created_at > t.created_at
  );

-- Precision@10 trend per workspace
SELECT workspace_id, week_start, precision_at_10
FROM mv_precision_at_10
WHERE workspace_id IN (SELECT workspace_id FROM workspaces WHERE created_at < NOW() - INTERVAL '14 days')
ORDER BY workspace_id, week_start;
```

---

## 14. APPENDIX: TERMINOLOGY GLOSSARY (MVP.MD EXACT MATCH)

| Term | Definition |
|------|------------|
| `source_thread_id` | External platform ID (TEXT, not UUID) — varies by platform |
| `communication_consent` | Prospect's verbal agreement to receive follow-up via WhatsApp/Email/LinkedIn, logged as timestamped boolean for DPDP Act §6 compliance |
| `Quote Sent` | Stage name (not "Quoted") — used in UI, state machine, and `quotes.status` |
| `Lead Fit Failure` | Loss reason category — penalizes discovery keywords/source weights by -15% (multiply by 0.85) |
| `Execution Failure` | Loss reason category — preserves discovery weights, flags pricing/copy for weekly founder review |
| `winthread_signal` | Quote/deal source value when originating from Screen 3 Qualified thread |
| `manual_import` | Quote/deal source value when created via "New Quote" button without `thread_id` |
| `crm_sync` | Quote/deal source value (Phase 1.5 Mode B) |
| `activation_event` | Unified analytics event: `{workspace_id, user_id, type: 'outreach_approved'|'call_logged', thread_id, timestamp}` |
| `terminal outcome` | `Won` or `Lost` (with categorized loss reason) ONLY. `Quote_Sent` is NOT terminal. |
| `weight_delta` | JSONB in `outcomes` table: `{source_weight_delta, keyword_weight_deltas[]}` |

---

*End of PRD.md — Cross-referenced with ARCHITECTURE.md, DATABASE.md, PROMPTS.md for implementation consistency.*