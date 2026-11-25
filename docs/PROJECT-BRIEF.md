# PROJECT-BRIEF.md — WinThread

## 1. One-Sentence Product Definition
WinThread is a closed-loop B2B revenue conversion application that discovers public buying signals, drafts human-approved outreach, closes deals via built-in quotations and GST/multi-currency invoices (or external CRM webhooks), and mathematically updates lead-scoring weights from every verified deal outcome.

## 2. Primary User and Job-to-be-Done
- **Primary User:** Founders and sales operators at B2B service agencies (marketing, AI automation, software development, and consulting agencies with 2 to 15 team members) in India and global English-speaking markets.
- **Core Job-to-be-Done (JTBD):** "When potential clients publicly post about a problem my agency solves, help me find them immediately, contact them safely with proof, send a quote or invoice (or sync to my existing CRM) in one click, and automatically learn which signals turn into paying clients so I stop wasting time on bad leads."

## 3. Problem Evidence and Assumptions
### Verified Evidence from Reference Products
- **Evidence 1 (RaisedHand.ai):** Service agencies pay $39.99/month ($499/year) to $69/month for up to 10 daily leads sourced from public intent posts on LinkedIn, Facebook Groups, job boards, and review sites, paired with human-approved LinkedIn OAuth outreach capped at 20 invites/day. However, RaisedHand stops at "Call booked / Closed" and never tracks actual invoice value or loss reasons to retrain discovery.
- **Evidence 2 (Clienter.co.in):** Freelancers and small agencies (2–15 people) pay ₹199–₹799/month ($19–$39/month) per workspace for a Kanban lead pipeline, AI Quote Builder, e-signature portal, and India GST (CGST/SGST/IGST) + 30-currency invoicing with mandatory loss reasons. However, Clienter has zero outbound signal discovery and relies on manual lead entry.
- **Evidence 3 (Outpero.com):** Indian businesses use structured 5-step call scripts and webhook outcomes (`call.completed`, `Interested`, `Callback`, `Not interested`) to qualify leads rapidly, proving the need for structured call outcome capture.

### Explicit Assumptions
- **ASSUMPTION 1 (Willingness to Pay):** Small agencies (2–15 staff) will pay ₹1,999/month ($39/month) for a unified signal-to-quote-to-cash loop rather than stitching separate tools together.
- **ASSUMPTION 2 (Dual-Mode Adoption):** Agencies without a CRM will use WinThread's built-in 4-stage deal, quote, and GST invoice ledger (Mode A), while agencies with an existing CRM (Zoho, HubSpot, LeadSquared) will connect via webhook (Mode B).
- **ASSUMPTION 3 (Closed-Loop Lift):** Separating "Lead Fit Failures" from "Execution Failures" on lost deals will measurably improve the relevance of daily surfaced leads within 25 logged outcomes.
- **ASSUMPTION 4 (Zero-Cost Signal Scraping):** Public intent posts can be reliably collected at $0 API cost during the MVP phase using headless browser automation and public search queries without paid social firehose APIs.

## 4. Target Outcome and Success Metric
- **Target Outcome:** Validate commercial demand and closed-loop learning velocity within 21 days of launch.
- **Primary Success Metric:** At least 5 paying agency workspaces (at ₹1,999/mo or $39/mo) OR 15 active beta workspaces logging at least 25 complete thread outcomes (`Qualified`, `Quoted`, `Won`, `Lost`, or `Not a Fit`) within 14 days of onboarding.

## 5. MVP Boundary (In-Scope for Phase 1)
1. **Website-to-ICP & CRM Mode Setup Wizard:** Scrapes user's agency URL to extract services, buyer titles, industries, pain points, and buying signals; lets user select Mode A (Standalone Deal/Quote/GST Ledger) or Mode B (External CRM Webhook Connector).
2. **Daily Ranked Signal Feed ("Threads"):** Delivers 5 to 10 daily scored leads (`0–100%` ICP match) with exact public post text, permalink evidence, matched keywords, and `Not a Fit` vs. `Approve Outreach` actions.
3. **Human-Approved Outreach Queue & 5-Step Call Script Co-Pilot:** Holds AI-drafted outreach messages in a `Ready to send` queue (requiring human click to send) and provides an interactive 5-step text Call Script drawer where human callers log phone outcomes (`Interested`, `Send Quote`, `Callback`, `Not Interested`, `Wrong Number`) and consent status.
4. **Dual-Mode Outcome Layer:**
   - **Mode A (No CRM):** 4-stage Kanban (`Qualified` -> `Quoted` -> `Won` -> `Lost`), AI Quote Builder with digital e-signature link, 1-click GST (`CGST`/`SGST`/`IGST`) or multi-currency invoice PDF, and uneditable Verified Review request on completion.
   - **Mode B (Has CRM):** Outbound signed webhook pushing qualified threads to external CRMs and inbound webhook (`POST /api/webhooks/outcome`) receiving `deal.won` and `deal.lost` events.
5. **Split-Attribution Closed Loop:** Mandatory Loss Reason modal splitting losses into `Lead Fit Failure` (down-weights discovery keywords/sources) vs. `Execution Failure` (leaves discovery weights intact; flags quote pricing or outreach copy).

## 6. Explicit Non-Goals (Out of Scope for Phase 1)
1. **NO Live AI Voice Telephony (Outpero Engine):** No streaming ASR/LLM/TTS calls, no ₹649/month virtual phone number provisioning, and no automated bulk CSV dialing in Phase 1.
2. **NO Post-Sale Agency ERP Bloat:** No project task management Kanban boards, no recurring task trackers, no team payroll/payslip generators, no domain/hosting expiry trackers, and no encrypted credentials vaults.
3. **NO Native Mobile Wrapper:** No Android APK or iOS wrapper in Phase 1.
4. **NO Unsupervised Autopilot Sending:** WinThread never sends cold messages or calls without explicit human approval in Phase 1.

## 7. Users, Roles, and Sensitive Data Categories
- **Roles:**
  1. `Workspace Owner` (Agency founder: full access to ICP setup, threads, outreach, billing, and CRM mode settings).
  2. `Workspace Member` (Agency sales rep: access to threads, outreach approval, call script logging, and deal/quote board; capped at 5 in Pro).
  3. `End Client / Prospect` (External buyer: unauthenticated signed-token access to view/sign quotes, view GST invoices, and submit a 1–5 star verified review).
- **Sensitive Data Categories:**
  - Public business contact PII (Prospect name, job title, company, public post URL, business email, E.164 phone number).
  - Tax and commercial identifiers (Agency and Client GSTIN, state code, quotation line items, invoice amounts).
  - External integration credentials (CRM webhook secrets, OAuth tokens).
  - Communication consent state (`cold_public`, `opted_in`, `dnd_blocked`).

## 8. Major Constraints and Risks
- **Budget Constraint:** $0/month fixed infrastructure ceiling during build and initial beta (must run on free hosting, free database tier, and free LLM inference via OmniRoute).
- **Builder Capacity & Timeline:** Solo founder working 18 hours/day; beginner developer relying on AI coding agents; 21-day target to ship Phase 1 MVP.
- **Technical Risk 1 (Scraper Fragility):** Public signal scraping can hit rate limits or CAPTCHAs if not rate-capped and cached.
- **Technical Risk 2 (LinkedIn Account Safety):** Automated outreach risks user account restrictions if daily invite caps (max 20/day) or human-in-the-loop gates are bypassed.

## 9. Regulatory, Privacy, Security, Accessibility, and Cost Considerations
- **Privacy (India DPDP Act 2023 & GDPR):** Store only publicly posted business signals; provide a suppression/blocklist table (`dnd_blocked`) to permanently exclude any prospect who opts out; designate a Grievance Officer contact.
- **Telecom Readiness (TRAI TCCCPR):** Track `consent_status` from Day 1 so Phase 2 voice calling only dials `opted_in` leads.
- **Security:** Enforce strict multi-tenant workspace isolation at the database row level; sign all outbound/inbound CRM webhooks with HMAC-SHA256; never store payment card numbers directly.
- **Accessibility:** Target WCAG 2.2 Level AA across all 5 core screens (keyboard navigation, ARIA labels, contrast ratios).
- **Cost Governance:** Hard cap on daily LLM calls and signal lookups per workspace to prevent runaway token or enrichment costs.

## 10. Open Questions Before PRD Creation
- **OPEN QUESTION 1:** For Phase 1 outreach delivery, will the user click a deep-link ("Open LinkedIn Profile & Copy Message" / `mailto:` / `wa.me` link) for 100% zero-ban safety, or do we require live LinkedIn OAuth background sending in Week 1?
- **OPEN QUESTION 2:** Which single agency niche will we recruit the first 15 beta users from (e.g., AI automation agencies vs. performance marketing agencies)?
- **OPEN QUESTION 3:** For contact enrichment (email/phone) at a $0 budget ceiling, will Phase 1 rely on public post/website extraction + manual entry, or a Bring-Your-Own-Key (BYOK) enrichment API?

## 11. Recommended Next Decision
Approve the MVP Boundary, Non-Goals, and answers to the 3 Open Questions below (choosing deep-link click-to-send + BYOK enrichment for $0 cost and 0% ban risk in Phase 1), then lock `MVP.md`.

---
**Blocked until answered:**
1. Do you approve using 1-click deep-links (LinkedIn profile + auto-copied message, `mailto:`, and WhatsApp `wa.me` click-to-chat) for Phase 1 outreach so we ship in 21 days with $0 API cost and 0% LinkedIn ban risk?
2. Do you approve Bring-Your-Own-Key (BYOK) or public website contact extraction for email/phone lookup so your platform COGS stays at $0.00?
3. Do you approve targeting **AI Automation & B2B Marketing Agencies (2–15 people)** as the single initial beta niche?

