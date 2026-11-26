# Feature 04: Dual-Mode Deal Board, AI Quote Builder & Invoicing (`/deals`)
## Primary-Source Competitor Research & Architecture Decisions

**Document Identifier:** RESEARCH-FEATURE-04-2026-11-26  
**Language Standard:** ASD-STE100 (Simplified Technical English)  
**Target System:** WinThread (Next.js 16.4.6, React 19, Supabase SSR, TypeScript, Tailwind CSS 4)  
**Primary Sources:**
- Clienter REA (`docs/reference/clienter-rea.md`, production app `app.clienter.co.in`, GST tool `clienter.co.in/tools/gst-invoice-generator`)
- RaisedHand REA (`docs/reference/raisedhand-rea.md`, screenshots 2042–2094)
- Buska Production Analysis (`buska.io/reply-studio`)
- Octolens Architecture Analysis (`octolens.com`)
- WinThread Specs: `docs/features/04-deal-ledger.md`, `docs/PRD.md` (§3 Screen 4, §11 State Machine), `docs/DATABASE.md` (`threads`, `quotes`, `invoices`, `outcomes`, `verified_reviews`)
- Claude Code CLI Architecture (`anthropic/claude-code`, headless `-p`, `--output-format stream-json`, background agents)

---

## 1. Executive Summary & Market Gap

Between signal discovery and actual paid revenue, agency founders experience a fatal tooling drop-off:

```
[ Lead Discovered ] ──(Octolens / Buska)──► Copies post text to clipboard
                                                   │
                                                   ▼ (Founder stranded!)
                                           Opens PandaDoc / DocuSign ($49/mo)
                                                   │
                                                   ▼
                                           Opens Zoho / QuickBooks ($30/mo)
                                                   │
                                                   ▼
                                           Manual Razorpay / Stripe Link
```

| Product | Lead Discovery | Deal Kanban | AI Quote Builder | E-Sign Portal | India GST Split | Closed-Loop Outcome Tuning |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RaisedHand** | Yes | No (Outreach only) | No | No | No | No |
| **Buska** | Yes | External (HubSpot) | No | No | No | Negative signal only |
| **Octolens** | Yes | External (Attio/Slack) | No | No | No | No |
| **Clienter** | No (Manual/Webhook) | Yes (5-stage) | Yes (prompt-based) | Yes (White-label) | Yes (CGST/SGST/IGST) | No (Manual loss text) |
| **WinThread** | **Yes (3-tier MDIE)** | **Yes (4-stage)** | **Yes (Pain-point seed)** | **Yes (BLAKE3 link)** | **Yes (Automatic)** | **Yes (Split-Attribution)** |

WinThread's unique value is the **"Find-to-Cash" Bridge**: converting an approved buyer post into an itemized quote, securing client digital signature, issuing a GST invoice, and feeding the exact Won/Lost outcome back into tomorrow's lead scoring weights.

---

## 2. Deep Competitor Reverse-Engineering: Deal & Invoicing Mechanics

### 2.1 Clienter.co.in (`app.clienter.co.in`)
*Source: `docs/reference/clienter-rea.md`*

1. **Kanban Pipeline:**
   - Visual board with customizable columns and protected end columns (`Won` / `Lost`) that cannot be deleted.
   - Quick-add capture: client name, company, phone, email, estimated value (₹), lead source.
   - 1-click "Convert to Client" button copies all lead data into active project deliverables with zero re-typing.
2. **AI Quote Builder:**
   - Takes a prompt describing project scope (e.g. *"Build an AI chatbot for an HVAC contractor"*) and auto-populates line items: description, quantity, rate, and tax %.
   - Generates a shareable quotation link (`app.clienter.co.in/q/xyz`) with digital e-signature acceptance.
3. **GST Invoicing:**
   - Dedicated tax engine compares agency GSTIN with client GSTIN:
     - **Intra-state (same 2-digit state code):** Splits tax equally into `CGST (9%) + SGST (9%)`.
     - **Inter-state (different state code):** Computes single `IGST (18%)`.
     - **International:** Issues in foreign currency (USD, EUR, GBP) without Indian GST (Export of Services under LUT).
4. **Verified Reviews Trust Loop:**
   - Marking a project "Completed" / paid generates an uneditable 1–5 star review invitation, generating a public verified rating.

---

## 3. The 5 Architectural Decisions for Feature 04

### Decision 21: Kanban Deal Pipeline Architecture
**Context:** When a lead is qualified in Feature 03 (`/outreach`), how should it enter and move through the `/deals` pipeline?
- **Option A (Recommended): 4-Stage Strict Kanban (`Qualified` $\rightarrow$ `Quoted` $\rightarrow$ `Won` $\rightarrow$ `Lost`).**
  - Columns map 1:1 to the canonical `threads.stage` enum.
  - Supports 1-click stage advancement buttons as well as keyboard-accessible moves.
  - Moving to `Quoted` triggers the AI Quote Drawer. Moving to `Won` triggers Invoice Generation. Moving to `Lost` triggers the Split Loss Modal.
- **Option B: Freeform Custom Columns.**
  - Allows users to add arbitrary columns (e.g. `Demo Booked`, `Negotiating`).
  - *Trade-off:* Breaks strict database stage enums and requires a complex metadata mapping layer.
- **Option C: Pure Table/List View.**
  - Renders deals in a spreadsheet-like grid with stage dropdowns (similar to Linear table view).
  - *Trade-off:* Lacks the spatial visual progression that agency sales teams rely on.

---

### Decision 22: AI Quote Generation Engine & Deliverable Extraction
**Context:** How should WinThread generate itemized quote line items from the prospect's original post?
- **Option A (Recommended): 1-Click Context-Injected Scope Generator.**
  - Automatically extracts deliverables from the prospect's public pain points (`threads.content`) and matches them with the agency's configured services (`icp_profiles.services`).
  - Pre-populates 2–4 clean line items (e.g., Deliverable, Qty, Unit Rate in ₹, HSN/SAC code `998314` for IT/Automation services).
  - Founder can edit any rate or description inline before sending.
- **Option B: Static Rate Card Template.**
  - Founder picks from a hardcoded list of fixed service packages without AI generation.
  - *Trade-off:* Does not reference the prospect's exact post evidence.
- **Option C: Blank Canvas.**
  - Founder manually enters all deliverables, quantities, and rates from scratch.
  - *Trade-off:* High friction; defeats the core value proposition of AI automation.

---

### Decision 23: Client E-Signature Portal Architecture
**Context:** How does the prospective client view, review, and legally sign the quotation?
- **Option A (Recommended): Lightweight Signed Token Route (`/portal/quote/[id]?token=...`).**
  - Generates a shareable, responsive public link protected by a secure URL token (`signoff_hash`).
  - Client reviews itemized deliverables, agency details, and clicks "Accept & Sign" (with typed name + optional canvas signature).
  - Automatically captures signer IP, timestamp, user agent, and records a BLAKE3 verification hash in `quotes.signoff_hash`.
  - Zero login friction: client does not need to register or remember a password.
- **Option B: Password-Protected Client Portal (Clienter Model).**
  - Requires the client to create an account with email and password before viewing the quote.
  - *Trade-off:* Severe drop-off in deal conversion velocity; clients resist creating accounts just to view a quote.
- **Option C: Static PDF Email Attachment.**
  - Generates a PDF attachment requiring manual print-sign-scan or DocuSign upload.
  - *Trade-off:* High abandonment rate; breaks automated deal stage transitions.

---

### Decision 24: India GST & Multi-Currency Tax Computation Engine
**Context:** How does WinThread calculate taxes across Indian domestic clients and international exports?
- **Option A (Recommended): Deterministic State-Code Matching Engine.**
  - Agency enters GSTIN during onboarding (e.g. `36AAAAA0000A1Z5` $\rightarrow$ State code `36` Telangana).
  - Client GSTIN or Place of Supply is checked:
    - **Intra-state (same 2-digit code):** Automatically calculates `CGST (9%) + SGST (9%) = 18%`.
    - **Inter-state (different 2-digit code):** Automatically calculates `IGST (18%)`.
    - **International Currency (`USD`, `EUR`, `GBP`):** Sets GST to `0%` with standard export declaration (*"Export of Services under Letter of Undertaking (LUT) without payment of IGST"*).
- **Option B: Flat 18% Tax.**
  - Applies a flat 18% tax without distinguishing between CGST/SGST and IGST.
  - *Trade-off:* Non-compliant with Indian GST filing requirements (GSTR-1).
- **Option C: Manual Tax Percentage Entry.**
  - Operator types tax rate on every line item manually.
  - *Trade-off:* High risk of operator math errors.

---

### Decision 25: Mandatory Split-Attribution Loss Reason Engine
**Context:** When a deal fails to close, how does the system distinguish lead quality from sales execution?
- **Option A (Recommended): Two-Tier Split Modal (PRD §5 / MVP Core).**
  - Dragging or marking a deal as `Lost` opens a mandatory modal with two distinct category pathways:
    1. **`Lead Fit Failure` (Algorithm Error):**
       - Sub-reasons: `Wrong Persona`, `No Budget / Out of Business`, `Invalid Contact Data`, `Not in Market`.
       - *System Action:* Triggers Bayesian downweighting of source channel and matching keywords in the MDIE engine (`outcomes.loss_category = 'lead_fit_failure'`).
    2. **`Execution Failure` (Sales/Agency Error):**
       - Sub-reasons: `Price Too High`, `Slow Follow-up / Competitor Won`, `Scope Mismatch`.
       - *System Action:* Leaves lead weights unchanged because the lead was high quality, but internal agency sales execution failed (`outcomes.loss_category = 'execution_failure'`).
- **Option B: Single Uncategorized Dropdown.**
  - Presents a single flat list of reasons without separating Lead Fit from Execution.
  - *Trade-off:* Causes the MDIE engine to erroneously downweight valid keyword signals when sales execution was at fault.
- **Option C: Optional Free-Text Notes.**
  - Operator can type free-form notes or leave blank.
  - *Trade-off:* Impossible to compute structured algorithmic feedback.

---

## 4. Live Cockpit Terminal Orchestration Research

### 4.1 The Technical Challenge
The user operates a 4-quadrant development layout inside their IDE:
- Top-left: Interactive Claude Code session (`ultracode`).
- Top-right: OpenCode worker.
- Bottom-left: Claude Code (Lightning).
- Bottom-right: Claude Code (Super-VL).

**User Goal:** Have Antigravity orchestrate Claude Code so that the user can visually watch Claude think and write code in real-time in their visible terminal pane, instead of manually copy-pasting prompts.

### 4.2 How Claude Code Interacts with Terminals
1. **Interactive TTY Mode (What is running in the Cockpit):**
   - Claude Code requires a live TTY/PTY input stream (`stdin`) to render its interactive UI (the animated progress indicator, thinking timers, interactive permission prompts).
2. **Headless / Print Mode (`claude -p "<prompt>"`):**
   - Claude Code executes in batch mode without spawning an interactive terminal GUI.
   - Supports `--output-format stream-json` to stream raw execution events over stdout.
   - *Limitation:* Running `claude -p` from Antigravity runs in a hidden subshell background process; it does not automatically inject text into the user's GUI terminal quadrant.

### 4.3 Three Solutions for Live Orchestration

| Solution | Mechanism | User Experience | Implementation Complexity |
| :--- | :--- | :--- | :--- |
| **Solution 1: Guided Cockpit Relay (Current Proven Method)** | Antigravity generates exact, copy-pasteable execution prompts. User pastes into top-left pane (`ultracode`). | **100% Live Visuals:** User watches Claude think, stream code, and show color diffs in their active layout. | Zero setup; 100% reliable. |
| **Solution 2: Named Pipe / Socket Command Injection** | Claude Code or terminal wrapper listens on a local FIFO / named pipe or cmux socket (`~/.claude/socket` or PowerShell NamedPipe). | **100% Autonomous + Live Visuals:** Antigravity writes prompt to pipe; Claude executes inside the visible terminal pane. | Medium: Requires terminal wrapper or cmux multiplexer. |
| **Solution 3: Pop-Out Spawn (`wt.exe` / `powershell -NoExit`)** | Antigravity uses `Start-Process wt.exe` or `powershell` with `claude "..."` to launch a visible window that animates live on screen. | **Autonomous & Live:** A visible terminal window opens on screen and runs Claude interactively. | Low-Medium: Spawns an external window on Windows. |
