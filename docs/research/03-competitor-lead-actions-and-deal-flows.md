# Competitor Deep-Dive: Lead Card Actions, Status Lifecycles & Deal Flow Mechanics
**Document Identifier:** RESEARCH-LEAD-ACTIONS-2026-11-24  
**Primary Sources:** 
- RaisedHand REA (`docs/reference/raisedhand-rea.md`, screenshots 2042–2094)
- Clienter REA (`docs/reference/clienter-rea.md`)
- Buska Production Analysis (`buska.io/reply-studio`)
- Octolens Architecture Analysis (`octolens.com`)
- Common Room & Unify GTM Workflows

---

## 1. Executive Summary & Comparative Matrix

Across the leading B2B buyer intent and signal discovery platforms, lead cards follow three distinct operational philosophies:

| Product | Philosophy | Primary In-Card Actions | Downstream Handoff | Fatal Bottleneck |
| :--- | :--- | :--- | :--- | :--- |
| **RaisedHand** | **Direct Outreach Engine** | 1. `[Approve Outreach]`<br>2. `[View Details / Breakdown]`<br>3. `[Get Email / Phone]`<br>4. `[Add to Collection]` | Queues connection invite & message sequence in user's LinkedIn account (capped at 20/day). | Has **zero pricing or invoicing capability**. Leaves agency stranded when prospect asks *"How much?"* |
| **Buska** | **The Reply Studio** | 1. `[Open Reply Studio]`<br>2. `[Sync to CRM (HubSpot/Lemlist)]`<br>3. `[Bookmark / Pipeline]`<br>4. `[Dismiss]` | Side drawer drafts tone-aware response (casual for Reddit, formal for LinkedIn); webhook pushes to CRM. | Fragmented stack: requires paid subscriptions to HubSpot ($50+/mo) or Lemlist ($59+/mo) to close deals. |
| **Octolens** | **Pure Intelligence Router** | 1. `[Open Live Post (Deep Link)]`<br>2. `[Push to Slack / Webhook]`<br>3. `[Mark as Lead / Ignore]` | Routes signals to Slack, Attio CRM, or AI Agents via MCP tools for Claude/Cursor. | No native engagement interface; pure listener/alerting dashboard. |
| **Clienter** | **Deal & Invoice Ledger** | 1. `[Convert to Client]`<br>2. `[Create Quotation / AI Builder]`<br>3. `[Send Contract (E-Sign)]`<br>4. `[Generate Invoice]` | Converts pipeline lead into active project with deliverables, milestones, and payment tracking. | Lacks automated social signal discovery; requires leads to be added manually or via webhooks. |

---

## 2. Deep Breakdown of Each Product's Exact Workflow

### A. RaisedHand.ai (The Outreach Sequencer)
*Evidence: `docs/reference/raisedhand-rea.md` (Screenshots 2042, 2050, 2072, 2073)*

1. **Card Display Anatomy:**
   - **Header:** Lead Name + Job Title + Company Name + Avatar.
   - **ICP Score Badge:** `96% Perfect Fit` (emerald) or `77% Strong Fit` (amber).
   - **Post Evidence Box:** Exact public quote/snippet, publication timestamp, source platform icon.
   - **Contact Badges:** `[Get Email]` (unlocks verified email address like `rachel@brightlinehvac.com`) and `[Get Phone]`.
2. **Action Workflow:**
   - **`[Approve]`:** Moves the lead into the **`Ready to Send`** queue (Screenshot 2050).
   - **Automated Sequence:**
     - Step 1: LinkedIn connection invite (with or without personalized note).
     - Step 2: Automated message after they accept (`Hi {first_name}, saw your post about...`).
     - Step 3: Follow-up message 2 days later.
     - **Safety Invariant:** Anyone who replies is automatically stopped so the human operator can take over.

---

### B. Buska.io (The Reply Studio Model)
*Evidence: Buska Platform & GTM Documentation*

1. **Card Display Anatomy:**
   - Platform badge (Reddit, LinkedIn, X, HN) + Author handle + Post timestamp.
   - 0–100 Intent Score with highlighted matching keywords.
   - Post text with context preview.
2. **Action Workflow:**
   - **`[Reply Studio]` Drawer:**
     - Instead of sending messages in the dark, Buska opens a side drawer.
     - Generates 2–3 alternative reply variations:
       * *Angle A: Helpful advice / Peer perspective* (Best for Reddit).
       * *Angle B: Direct agency offering* (Best for LinkedIn/Twitter).
     - Allows the human operator to edit the response directly before copying or posting.
   - **`[Push to CRM]`:** Exports contact to HubSpot, Lemlist, or Notion via 1-click webhook.
   - **`[Dismiss]`:** Removes lead and feeds negative signal into the noise filter.

---

### C. Octolens (The Unbundled Router)
*Evidence: Octolens Official Documentation & Pricing Architecture*

1. **Philosophy:** Octolens explicitly refuses to build an in-app messaging client or CRM. They argue that agency operators already have their preferred email and social tools.
2. **Action Workflow:**
   - Mentions are tagged with intent categories: `switch_intent` (prospect leaving competitor), `bug_report`, or `general_mention`.
   - Operators click **`[Open Live Post]`** to jump directly to Reddit or X and reply manually.
   - Operators use **MCP Server integrations** (`www.octolens.com/mcp`) so AI coding agents (Claude Code, Cursor) can programmatically pull leads.

---

### D. Clienter (The Quote & Contract Engine)
*Evidence: `docs/reference/clienter-rea.md`*

1. **How Clienter Closes Deals:**
   - In Clienter's Lead Pipeline (`clienter.co.in/features/crm-lead-pipeline`), leads progress through stages:
     `New Lead` $\rightarrow$ `Contacted` $\rightarrow$ `Proposal Sent` $\rightarrow$ `Negotiation` $\rightarrow$ `Won` / `Lost`.
   - **`[AI Quote Builder]`:** Allows the user to type a prompt (e.g. *"Build an AI chatbot for an HVAC contractor"*) $\rightarrow$ generates formatted line items, payment terms, and validity dates.
   - **`[Send Quotation with E-Sign]`:** Generates a public URL (`app.clienter.co.in/q/xyz`) where the prospect clicks *"Accept & Sign"*.

---

## 3. The Grand Architectural Synthesis for WinThread

By synthesizing RaisedHand, Buska, Octolens, and Clienter, we discover the **exact competitive gap in the market**:

```
[ Social Signal Found ] ──(Octolens / Buska)──► Copies text to clipboard
                                                        │
                                                        ▼ (User stranded!)
                                                Opens PandaDoc / DocuSign ($49/mo)
                                                        │
                                                        ▼
                                                Opens QuickBooks / Stripe Invoicing
```

### WinThread's Unified 3-Action Architecture (The "Find-to-Cash" Bridge)
WinThread combines the best parts of each competitor while eliminating the disconnected tool hopping:

1. **Action 1: `[ 📋 Reply Studio / Copy Draft ]` (Adopted from Buska):**
   - Click to copy platform-tailored, non-salesy response.
   - Human-in-the-loop: allows 1-click copy or editing.
2. **Action 2: `[ 📄 Generate Quote ]` (Adopted from Clienter — WinThread Exclusive):**
   - Replaces the disconnected CRM/PandaDoc headache.
   - 1 click opens our slide-out Quote Drawer, pre-populating the prospect's handle and services from the thread, generating a live proposal link.
3. **Action 3: `[ ✕ Not a Fit ▾ ]` with Reason Dropdown (Adopted from RaisedHand & Bayesian ML):**
   - Dismisses with 1 click (`Wrong Persona`, `No Budget`, `Competitor`).
   - Dynamically penalizes keyword weights ($W_j$) in the database so the engine gets smarter every week.
4. **Action 4: `[ 🔗 View Live Post ]` (Adopted from Octolens):**
   - External link directly to the authentic thread on Reddit, Hacker News, or Bluesky.

---
*End of Competitor Action Research Document.*
