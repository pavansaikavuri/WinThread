# Feature 01: Website-to-ICP & CRM Mode Setup Wizard
*Route:* `/setup`  
*Target Entity:* `workspaces`, `icp_profiles`  
*Reference:* `raisedhand-rea.md` (Screens 1–4), `clienter-rea.md` (Workspace Settings)

## 1. Job-to-be-Done (JTBD)
> **When** I onboard onto WinThread as an agency founder,  
> **I want to** paste my agency URL, automatically extract my Ideal Customer Profile, and choose my CRM mode,  
> **So that** I receive tailored, high-intent lead signals within 60 seconds without manual data entry.

## 2. Core User Capabilities
1. **URL Scraper & Extraction Engine:**
   - User inputs agency URL (e.g., `https://myagency.com`).
   - Server extracts: `services_sold`, `buyer_titles`, `industries`, `pain_points`, `buying_signals`, and `skip_words`.
   - Displays an editable form allowing the user to tweak keywords or select a proven preset (e.g., AI Automation Agency, Performance Marketing).
2. **Dual-Mode CRM Selection:**
   - **Mode A (Standalone Ledger):** Default for agencies without a CRM. Enables internal 4-stage Kanban, AI Quote Builder, e-signature portal, and GST invoicing.
   - **Mode B (External Connector):** For agencies using HubSpot, Zoho CRM, or LeadSquared. Prompts for webhook destination URL and displays the workspace webhook secret.
3. **Workspace Profile Initialization:**
   - Saves settings to `workspaces` table and initializes default `icp_profiles` row.
   - Populates initial `scoring_weights` with $W_j = 1.000$ for all extracted keywords.

## 3. UI States
- **Loading:** Scanning website and extracting taxonomy (progress bar with live extraction status).
- **Empty:** Clean input field with example agency URL and quick-select niche presets.
- **Error:** URL unreachable or extraction failure with clear fallback to manual entry.
- **Success:** Redirects to `/threads` with the first batch of 5–10 scored leads.

## 4. Verification & Testing
- **TypeScript:** Strict validation via Zod schema (`setupFormSchema`).
- **Test:** Verify `icp_profiles` row creation with RLS enforcement (`workspace_id` matching authenticated user).
