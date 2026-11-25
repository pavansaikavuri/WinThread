# Feature 04: Dual-Mode Deal Board, AI Quote Builder & Invoicing
*Route:* `/deals`  
*Target Entity:* `winthreads`, `commercial_documents`, `thread_events`  
*Reference:* `clienter-rea.md` (Deal Pipeline, AI Quote Drawer, GST Invoicing, Loss Reasons)

## 1. Job-to-be-Done (JTBD)
> **When** a prospect replies with interest to my outreach,  
> **I want to** convert them into an active deal, generate a signed quote/GST invoice (or sync to my CRM), and record outcomes with split loss reasons,  
> **So that** I close deals with zero administrative friction and train the system on real revenue.

## 2. Core User Capabilities
1. **Mode A: 4-Stage Kanban Pipeline (No CRM Required):**
   - Columns: `Qualified` -> `Quoted` -> `Won` -> `Lost`.
   - Drag-and-drop or 1-click stage transitions.
   - Converts `winthreads` record into an active commercial deal.
2. **AI Quote Builder & Client E-Signature Portal:**
   - Pre-populates deliverables based on the prospect's original public pain points.
   - Generates line items: Description, Quantity, Rate, Tax %.
   - Generates a shareable client portal link (`/portal/quote/[id]`) with digital e-signature sign-off.
3. **1-Click India GST & Multi-Currency Invoicing:**
   - Converts signed quote directly into a commercial invoice.
   - Automatic GST computation:
     - Intra-state (same state code): Splits tax into `CGST (9%) + SGST (9%)`.
     - Inter-state (different state code): Computes `IGST (18%)`.
     - International: Multi-currency invoice (USD, EUR, GBP) without GST.
   - Printable / downloadable PDF.
   - Triggers an uneditable 1–5 star Verified Review upon invoice payment.
4. **Mode B: External CRM Connector (For HubSpot, Zoho, LeadSquared):**
   - When a lead reaches `Qualified`, fires an outbound signed webhook payload to the external CRM.
   - Inbound webhook (`POST /api/webhooks/outcome`) listens for external `deal.won` and `deal.lost` events.
5. **Mandatory Split Loss Reason Modal (Both Modes):**
   - Moving any deal to `Lost` forces the user to select a categorized reason:
     - **Lead Fit Failure:** `Wrong Persona`, `No Budget / Out of Business`, `Invalid Contact Data`, `Not in Market`.
     - **Execution Failure:** `Price Too High`, `Slow Follow-up / Competitor Won`, `Scope Mismatch`.

## 3. UI States
- **Empty Kanban:** "No active deals. As prospects reply to your outreach, click 'Convert to Deal' to manage proposals and invoices here."
- **Loss Modal:** Modal blocks stage transition until a categorized reason is confirmed.

## 4. Verification & Testing
- Tax math verified: `CGST + SGST === Total Tax` on intra-state; `IGST === Total Tax` on inter-state.
- Moving to `Lost` without a reason is rejected at both API and UI layers.
