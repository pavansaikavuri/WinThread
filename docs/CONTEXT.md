# context.md — WinThread Master Project & System Context
*Last updated: 2026-11-16*
*Status: Locked Source of Truth*
*Rule: Permanent context repository. Every technical decision, architectural constraint, mathematical formula, reference insight, and execution rule is recorded here so no detail is ever lost.*

---

## 1. Product Vision & Company Thesis
- **One-Sentence Product Definition:** WinThread is a closed-loop B2B revenue conversion application that discovers public buying signals, drafts human-approved outreach, closes deals via built-in quotations and GST/multi-currency invoices (or external CRM webhooks), and mathematically updates lead-scoring weights from every verified deal outcome.
- **The Core Value Promise:** *"From public buyer post to signed quote in one thread — and every outcome makes tomorrow's leads smarter."*
- **Primary User:** Founders and sales operators at B2B service agencies (AI automation, performance marketing, web development, and consulting agencies with 2 to 15 team members) in India and global English-speaking markets selling $1,000–$5,000/month (₹50,000–₹4,00,000/month) retainers.
- **The Core Job-to-be-Done (JTBD):** *"When potential clients publicly post about a problem my agency solves, help me find them immediately, contact them safely with proof, send a quote or invoice (or sync to my existing CRM) in one click, and automatically learn which signals turn into paying clients so I stop wasting time on bad leads."*
- **The Outcome-Data Moat:** Screens, scrapers, and quote builders can be copied. Proprietary, consented outcome data linking specific upstream public problem signals to paid GST/multi-currency revenue cannot.
- **5-Stage Company Horizon:**
  - *Stage 0:* 10 paying agencies ($39/mo or ₹1,999/mo).
  - *Stage 1:* 1,000 agency customers (~$1M ARR).
  - *Stage 2:* ~$10M ARR. Agencies resell the engine to their local business clients (white-label). Multi-language voice agents slot in here.
  - *Stage 3:* ~$100M ARR. Full Revenue OS for Indian & Global SMBs (leads, calls, WhatsApp, GST invoicing, collections, vernacular languages).
  - *Stage 4:* Multi-billion platform scale (invoice financing, payments take-rate, developer APIs, partner ecosystem).

---

## 2. Reference Product Analysis (What Was Stolen, Upgraded, and Cut)

### A. RaisedHand.ai (Intent Discovery & Outreach Layer)
- **What it does:** Scrapes public posts across LinkedIn, Facebook Groups, job boards, and review sites; scores 0–100 against an ICP; enriches emails/phones; sends connection invites (capped at 20/day) and messages via LinkedIn OAuth.
- **Key Limitations:** Caps discovery at 10 leads/day, stops at "Call booked/Closed", and never tracks invoice revenue or loss reasons. Its daily lead feed is static and non-learning.
- **What WinThread Kept & Upgraded:**
  1. Website-to-ICP extraction (services, titles, pain points, signals, negative skip-words).
  2. Scored Post Evidence Cards (exact post snippet + live permalink + matched keywords).
  3. "Ready to Send" human approval queue.
  4. 20 invites/day safety ceiling.
  5. MCP server integration (`/mcp` and `/acp`).
- **What WinThread Cut:** The static, non-learning lead feed. Every win/loss in WinThread updates discovery weights.

### B. Clienter.co.in (Closing, Quotation & GST Invoicing Layer)
- **What it does:** Client management for Indian freelancers and small agencies (₹199–₹799/month). Has a 4-stage pipeline, AI Quote Builder, e-signature portal, India GST invoicing (CGST/SGST/IGST splits across ~30 currencies), and uneditable verified client reviews.
- **Key Limitations:** Top-of-funnel is 100% passive (manual entry or incoming forms). Half the product is post-sale ERP bloat.
- **What WinThread Kept & Upgraded:**
  1. 1-click lead-to-deal conversion into a 4-stage Kanban (`Qualified` -> `Quoted` -> `Won` -> `Lost`).
  2. AI Quote Builder pre-populated with pain points from the buyer's public post.
  3. Digital client e-signature sign-off portal.
  4. India GST invoice generator (`CGST + SGST` intra-state or `IGST` inter-state + 30-currency international PDF generation).
  5. Mandatory Loss Reason capture modal.
  6. Uneditable Verified Reviews published upon payment.
- **What WinThread Ruthlessly Cut:** All post-sale ERP bloat: project task Kanban boards, recurring tasks, team payroll/payslips, domain/hosting expiry reminders, encrypted secrets vault, and native Android APK wrappers.

### C. Outpero.com (Voice Telephony Layer — Deferred to Phase 2)
- **What it does:** AI voice telecalling for Indian businesses across 7 languages (Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, English) with sub-second streaming latency, automated CRM webhooks, and calendar booking.
- **Why Live Telephony is Excluded from Phase 1:**
  1. *The B2B2C Unknown Customer Problem:* Voice agents talk to the end-customers of the agency's clients across dozens of unknown verticals and dialects.
  2. *Telecom & Regulatory Delays:* Requires TRAI TCCCPR compliance, DLT commercial registration, business KYC for phone lines, and NCPR DND scrubbing.
  3. *Streaming Complexity:* Requires ASR/LLM/TTS multi-provider mid-call failovers and ambient noise synthesis.
- **What WinThread Kept for Phase 1 (Voice Slot-In Data Contract):**
  1. Built-in interactive 5-step human Call Script Drawer (`Orient` -> `Qualify` -> `Overcome Objections` -> `Book/Quote` -> `Close Warmly`).
  2. Database columns locked on Day 1: `phone_e164`, `consent_status`, `call_script_vars`, `last_call_outcome`.
  3. Polymorphic `thread_events` ledger supporting `call.completed` event payloads with HMAC-SHA256 signature verification.
  4. Human call outcomes in Phase 1 harvest real objection data to train Phase 2 voice bots.

---

## 3. The 3 Locked Architectural Decisions (Phase 1 MVP)

| Decision | Option Selected | Operational Mechanism | Strategic Rationale |
| :--- | :--- | :--- | :--- |
| **D1: Outreach Delivery** | **Option 1A: 1-Click Deep-Links + Clipboard Auto-Copy** | Clicking "Approve Outreach" auto-copies the AI-personalized message and opens the prospect's LinkedIn profile, `mailto:` link, or WhatsApp `wa.me` in a new tab. | **0% account ban risk**, $0 third-party API costs (no proxy rentals), and ships in hours rather than weeks of cookie session debugging. |
| **D2: Contact Enrichment** | **Option 2A: Public Website Extraction + Bring-Your-Own-Key (BYOK)** | Scrapling/Playwright extracts public emails/phones from company websites and posts. For private cell numbers, users paste their own API key (Apollo, Hunter, Prospeo) in settings. | **$0.00 platform COGS**. Prevents wholesale enrichment bills ($0.10–$0.80/lookup) from bankrupting the free beta. |
| **D3: Target Niche** | **Option 3A: AI Automation & B2B Marketing Agencies (2–15 staff)** | Targeted exclusively at agencies selling $1,000–$5,000/mo retainers in India, US, and UK. | High willingness to pay (₹1,999/mo or $39/mo is trivial against a ₹50k+ retainer). Founder speaks their language via `@build_together.ai`. |

---

## 4. The Dual-Mode CRM Architecture

Controlled by a single database column: `workspaces.crm_mode` (`standalone` vs. `connector`).

```
                              ┌──────────────────────────────────┐
                              │  WinThread Lead Intake & Scoring │
                              │    (Public Intent Post Scored)   │
                              └─────────────────┬────────────────┘
                                                │
                                    Prospect Replies / Qualifies
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
          [Mode A: Standalone Ledger]                       [Mode B: External Connector]
          (Agencies WITHOUT a CRM)                          (Agencies WITH Zoho/HubSpot)
                       │                                                 │
      ┌────────────────┴────────────────┐                                │
      │ 4-Stage Kanban Board            │               ┌────────────────┴────────────────┐
      │ (Qualified -> Quoted -> Won/Lost)│              │ Outbound HMAC-SHA256 Webhook    │
      └────────────────┬────────────────┘               │ Pushes Lead, Evidence & ICP     │
                       │                                └────────────────┬────────────────┘
      ┌────────────────┴────────────────┐                                │
      │ AI Quote Builder (e-Sign Portal)│                                │
      └────────────────┬────────────────┘               ┌────────────────┴────────────────┐
                       │                                │ Inbound Webhook Listener        │
      ┌────────────────┴────────────────┐               │ POST /api/webhooks/outcome      │
      │ 1-Click GST/Currency Invoice    │               │ (Receives deal.won / deal.lost) │
      └────────────────┬────────────────┘               └────────────────┬────────────────┘
                       │                                                 │
                       └────────────────────────┬────────────────────────┘
                                                ▼
                             ┌──────────────────────────────────────┐
                             │ Closed-Loop Split-Attribution Engine │
                             │   (Updates Scoring Weight Ledger)    │
                             └──────────────────────────────────────┘
```

---

## 5. The Closed-Loop Split-Attribution Mathematics

### Explainable Base ICP Score ($0 \le S_{\text{base}} \le 100$)
$$S_{\text{base}} = B_{\text{persona}} + B_{\text{company}} + B_{\text{urgency}} + B_{\text{contact}}$$
- $B_{\text{persona}} \in [0, 30]$: Job title seniority and direct decision-making power.
- $B_{\text{company}} \in [0, 25]$: Target industry, company employee size match.
- $B_{\text{urgency}} \in [0, 30]$: Direct problem statement severity and recency in public post.
- $B_{\text{contact}} \in [0, 15]$: Verified work email and E.164 phone reachability.

### Damped Bayesian Weight Formula
For every tracked keyword, signal source, industry, or competitor profile $j$, WinThread maintains a weight multiplier $W_j \in [0.25, 2.50]$ initialized at $1.000$:

$$W_j = \text{clamp}\left( \frac{\alpha + S^+_j}{\alpha + S^+_j + S^-_{\text{fit}, j}} \times 2.0, \; 0.25, \; 2.50 \right)$$
*where smoothing prior $\alpha = 5$.*

### The Multi-Speed Feedback Rules (Anti-Poisoning Protection):
1. **Positive Revenue Signal ($S^+_j$):**
   - Prospect replies positively to LinkedIn outreach / call: adds $+0.5$ to $S^+_j$.
   - Deal won with paid invoice (Mode A) or `deal.won` (Mode B): adds $+2.0 \times \log_{10}(\text{Invoice Paid Value})$ to $S^+_j$.
2. **Lead Fit Failure ($S^-_{\text{fit}, j}$):**
   - User clicks `Not a Fit` in daily queue, or marks a deal `Lost` with reason `wrong_persona`, `no_budget`, `bad_contact_data`, or `not_in_market`.
   - Adds $+1.0$ to $S^-_{\text{fit}, j}$.
   - **Result:** Lowers $W_j$ so WinThread stops surfacing bad-fit leads.
3. **Execution Failure Protection (Zero Discovery Penalty):**
   - Deal marked `Lost` due to `price_too_high`, `slow_followup`, `competitor_chosen`, or `scope_mismatch`.
   - Adds **$0.0$** to $S^-_{\text{fit}, j}$. Discovery weights remain untouched because the lead was a real buyer.
   - Instead, increments `execution_fail_count` to flag quotation pricing, outreach templates, or script objections for review.

---

## 6. The 4-Screen MVP Boundary (Post-Audit v2)

```
Screen 1: /setup ────────► Screen 2: /threads ────────► Screen 3: /outreach ────────► Screen 4: /deals
(Website-to-ICP &        (Daily Ranked Signal          (Ready Queue & 5-Step         (Dual-Mode Deal Board &
 CRM Mode Wizard)         Feed + Inline Badge)          Call Script Drawer)           AI Quote/GST Invoice)
```

1. **Screen 1 (`/setup`):** Website URL scraper extracting ICP taxonomy (services, titles, pain points, signals, skip-words); selects Mode A (Standalone Ledger) or Mode B (Connector).
2. **Screen 2 (`/threads`):** Daily feed of 5 to 10 scored leads with post evidence snippet, permalink, matched keywords, inline Bayesian Weight Badge, and `Not a Fit` vs. `Approve Outreach` actions.
3. **Screen 3 (`/outreach`):** Ready-to-send outreach queue with 1-click clipboard auto-copy + deep-link launch (LinkedIn, Email, WhatsApp) and interactive 5-step Call Script drawer for logging phone outcomes.
4. **Screen 4 (`/deals`):** 4-stage Kanban (`Qualified` -> `Quoted` -> `Won` -> `Lost`), AI Quote Builder, e-signature link, GST/multi-currency invoice PDF, and mandatory Split Loss Reason modal.
5. **API Route (`/api/webhooks/outcome`):** Ingests outcome events (`invoice.paid`, `deal.won`, `deal.lost`) to update the Bayesian scoring ledger.

---

## 7. Engineering Stack & Design System Rules
- **Framework:** Next.js 15+ (App Router), React 19, TypeScript strict mode (`npx tsc --noEmit`).
- **Database:** Supabase PostgreSQL with strict multi-tenant Row-Level Security (RLS) on every table.
- **UI Layer:** shadcn/ui + Radix UI + Tailwind CSS (Zinc monochrome).
- **Design System Guidelines:**
  - *Meta Astryx (`@astryxdesign/core`):* Use for core accessible primitives where verified. Always verify props via `npm run astryx -- docs <component>`.
  - *Apple Design Skill (`apple-design-skill`):* Enforces macOS Desktop Utility restraint (crisp 1px borders, compact high-density data tables, clear typography hierarchy). **Strictly no consumer liquid glass or blur effects.**

---

## 8. Multi-Model Tool Allocation & Workflow Protocol

### OmniRoute Model Allocation:
- **Architect Heavy (`nemotron-3-ultra-550b` / Antigravity Gemini Pro):** Database schemas, RLS policies, Next.js Server Actions, Bayesian mathematical formulas.
- **Worker Fast (`gemini-3.5-flash` / `nemotron-3.5-lightning`):** React UI components, Tailwind styling, unit tests, Zod schemas.
- **Visual Extractor (`nemotron-3.5-super-vl`):** Inspects reference product screenshots (`docs/reference/screenshots/`) for layout dimensions and spacing.

### The Non-Overlapping Skill Loop:
1. `/mattpocock-skills:to-spec` -> Lock specification against reference REA reports.
2. `/mattpocock-skills:to-tickets` -> Slice spec into file-level tickets.
3. `/superpowers:test-driven-development` -> Write failing tests first.
4. `/superpowers:executing-plans` -> Implement code and verify build.
5. `/egm:egm-review` -> Goldfish subagent reviews architecture and code.
6. `/egm:egm-drift-report` -> Audits code against checked-in documentation.

---

## 9. Antigravity & OmniRoute Connection Clarification
- **Antigravity IDE Native Agent:** Connected directly to Google DeepMind language server using your Gemini Pro / Gemini 3.8 Flash accounts. Has full native tools (file system, multi-file edits, subagent orchestration, background tasks).
- **Claude Code & OpenCode inside Antigravity Terminal:** Connected to your local OmniRoute instance (`http://localhost:20128`) via `ANTHROPIC_BASE_URL` in `~/.claude/settings.json`.
- **Synergy:** Use Antigravity native agent for repository-wide orchestration and Claude Code / OpenCode in the terminal for Nemotron 3 Ultra 550B deep reasoning.

---

## 10. M&A Landscape & Legal Signal Sourcing Protocol (Decision O1)
- **Market Vacuum Created by 2026 M&A:**
  - *HubSpot acquired Trigify* (announced Sep 23, 2026, standalone API shut down Oct 22, 2026) and *Warmly* (June 30, 2026).
  - *Zoom acquired Common Room* (July 2026).
  - *Salesforce acquired Qualified* (April 2026).
  - *Venture Implication:* Enterprise CRM giants are buying signal tools to power their high-end AI SDRs ($15,000–$100,000/year). Independent agencies are left without an affordable signal-to-deal engine.
- **The Legal Signal Sourcing Guardrail:**
  - LinkedIn's User Agreement strictly bans scraping, crawlers, and unauthorized automation. WinThread must never rely on brittle, ban-prone scraping that can be shut down overnight.
  - Safe Phase 1 Signal Sourcing Options:
    1. *User-Pasted Post URLs:* User spots a high-intent post, pastes the URL into WinThread, and the system runs the entire ICP scoring, outreach drafting, AI quoting, and outcome-learning loop.
    2. *Official Reddit API / Community Search:* Scanning subreddits where founders ask for agency recommendations.
    3. *Job Board Postings:* Tracking companies posting job openings for roles an agency service replaces.
    4. *Google Search Indexing of Public Problem Queries.*
- **Collaborative Agent Hierarchy (How to Use Free Claude Chat vs. Local Builders):**
  - **Claude Web Chat (Free Plan):** Use as your external Strategic Advisor / Board Member. Start each chat with `PROJECT-STATE.md`, focus on one specific decision or review, and ask for one deliverable per turn.
  - **Antigravity Native Agent (You & Me Here):** Your Principal GTM Architect & Workspace Orchestrator. Keeps all documentation in sync, edits files, manages subagents, and enforces EGM reviews.
  - **Claude Code / OpenCode (in Antigravity Terminal):** Your Lead Engineer powered by OmniRoute (`nemotron-3-ultra-550b`, `gemini-3.5-flash`), running tests (`npx tsc --noEmit`), writing Next.js code, and executing file tickets.

