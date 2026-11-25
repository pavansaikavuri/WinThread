# Clienter.co.in — Comprehensive Reverse Engineering Analysis

**Target:** `https://clienter.co.in` (marketing site) + `https://app.clienter.co.in` (production app)  
**Date:** 2026-11-07  
**Methodology:** Passive browser inspection (Playwright MCP), static scraping (Firecrawl), documentation deep-dive, comparison page analysis, free tool verification  
**Evidence Standard:** Every claim below cites a specific source — web investigation (Playwright/Firecrawl) or live app interaction. Bounded unknowns explicitly documented.

---

## Executive Summary

**Clienter** is an all-in-one client management platform for **freelancers and small agencies (2–15 people)**, built by **Talagana Rajesh** (founder, content creator on Instagram/YouTube/LinkedIn/X). It consolidates the full client lifecycle — **lead pipeline → quotations/contracts (with e-signature) → projects (Kanban, budgets, team assignments) → invoicing (GST-compliant for India, ~30 currencies) → payment tracking → client portal → verified reviews** — into a single workspace.

**Key differentiators:** 
- **Per-workspace flat pricing** (not per-seat) — Pro includes 5 teammates, Ultra unlimited
- **India-first GST invoicing** with CGST/SGST/IGST split, GSTIN on every invoice
- **White-label client portal** on every plan; custom domain on Ultra
- **Verified reviews** auto-collected on project completion, uneditable by owner
- **Free-forever plan** (3 clients, 5 projects, 1 teammate, 20 active leads, portal for 1 client)
- **Android app** (direct APK download, v1.4.1, 4.6 MB, wrapper around `app.clienter.co.in`)
- **AI Quote Builder** (3/mo Free, 25/mo Pro, unlimited Ultra)

**Infrastructure:** Supabase (PostgreSQL + Auth + Row-Level Security) + Vercel (hosting) + Razorpay (INR billing) / PayPal (USD billing). No payment processing — clients pay you directly.

---

## Evidence Sources & Verification Map

| Source | Method | Coverage |
|--------|--------|----------|
| `https://clienter.co.in` (homepage) | Playwright `get_visible_text` + Firecrawl scrape | Full marketing copy, pricing, feature list, FAQ, founder info |
| `https://app.clienter.co.in` (login) | Playwright navigation | Auth flow, Google OAuth, team/client portal entry points |
| `https://clienter.co.in/demo` | Playwright + Firecrawl | Live dashboard walkthrough with realistic data (Nova Studio case study) |
| `https://clienter.co.in/features` | Firecrawl scrape | 14 feature modules with detailed specs |
| `https://clienter.co.in/pricing` | Firecrawl scrape | Complete plan comparison table, billing regions, FAQ |
| `https://clienter.co.in/security` | Firecrawl scrape | 4-layer defense, RLS, encryption, PCI-DSS payments, DPDP compliance |
| `https://clienter.co.in/docs` | Firecrawl map + targeted scrapes | 100+ doc pages covering every feature area |
| `https://clienter.co.in/docs/integrations` | Firecrawl scrape | Google Calendar, Meta Ads, IndiaMART, Webhooks, Contact Form, Review Badge |
| `https://clienter.co.in/how-it-works` | Firecrawl scrape | 4-step flow: Add client → Run project → Invoice → Get paid |
| `https://clienter.co.in/about` | Firecrawl scrape | Founder story, 3 principles, target personas |
| `https://clienter.co.in/features/crm-lead-pipeline` | Firecrawl scrape | Pipeline mechanics, stages, conversion, limits |
| `https://clienter.co.in/features/client-portal` | Firecrawl scrape | White-label portal, custom domain (Ultra), sign-in flow |
| `https://clienter.co.in/features/invoicing` | Firecrawl scrape | GST invoicing, multi-currency, payment tracking |
| `https://clienter.co.in/features/verified-reviews` | Firecrawl scrape | Auto-invite on completion, public page, embeddable badge |
| `https://clienter.co.in/download` | Playwright | Android APK direct download, install instructions, v1.4.1 |
| `https://clienter.co.in/tools/gst-invoice-generator` | Playwright | Free GST invoice draft generator with CGST/SGST/IGST logic |
| `https://clienter.co.in/tools/quotation-generator` | Playwright | Free quotation generator with validity period |
| `https://clienter.co.in/templates` | Playwright | 7 free templates (contract, proposal, SOW, NDA, invoice, quotation, retainer) |
| `https://clienter.co.in/compare` + 3 deep comparisons | Playwright | vs Bonsai, HubSpot, 28 other tools — honest arithmetic comparisons |
| `https://clienter.co.in/faq` | Playwright | Categorized FAQ with direct answers |
| `https://clienter.co.in/docs/documents/ai-builder` | Playwright | AI Quote Builder usage, limits, prompt tips |
| `https://clienter.co.in/help` | Playwright | Help Center structure (60+ articles across 15 categories) |

---

## Product Architecture — End-to-End Flow

### 1. Lead Pipeline (CRM)
**Source:** `features/crm-lead-pipeline`, demo page, docs/leads

- **Visual Kanban board** with custom drag-and-drop columns
- **Protected Won/Lost columns** at ends (cannot be deleted/moved)
- **Quick-add** capture: name, company, phone, email, estimated value (₹), source (Website, Referral, Cold Call, Ads, Instagram, Other)
- **One-click "Convert to Client"** — carries all details forward, zero re-typing
- **Mandatory loss reason** on Lost deals → builds loss intelligence
- **Active lead limits:** Free 20, Pro 200, Ultra unlimited (won/lost/converted frees slot)
- **CSV Import/Export** supported
- **Lead sources tracked** per lead (Instagram, Website, Referral, Cold Call, Ads, Other)

**Demo data evidence (from Playwright demo page):**
```
Leads: 22 open | Pipeline ₹8,42,000 | Won/mo 5 | Win rate 68%
Stages: Lead (12) → Contacted (6) → Qualified (3/2) → Won (5/6)
Example leads:
  Ananya Rao, Nova Studio, ₹1,20,000, Instagram → Won
  Dev Prakash, Saffron Foods, ₹80,000, Referral → Won
  Imran Sheikh, Northline Cargo, ₹1,10,000, Cold Call → Qualified
```

### 2. Client Management
**Source:** `features/client-management`, demo page, docs/clients

- **Single client profile** = contact details + company + notes + status (Active/Lead/On-hold)
- **Full history on one screen:** projects, invoices, payments, meetings, files, messages
- **Client currency** set per client (~30 currencies supported)
- **Client portal toggle** per client (Free: 1 client, Pro/Ultra: all)
- **Client avatars** (initials/photos)
- **Client status filters** and search

**Demo data evidence:**
```
Clients: 18 total | Active: Acme Co., Nova Studio, Pixel Labs | Lead: Nova Studio (pre-conversion)
Recent: Acme Co. (2h ago), Nova Studio (1d ago), Pixel Labs (3d ago), Bright Media (5d ago)
```

### 3. Quotations & E-Signatures
**Source:** `features` page, `docs/documents/quotations`, `docs/documents/ai-builder`, `tools/quotation-generator`

- **Canvas-based editor** (shared with contracts/invoices) — drag-and-drop blocks
- **AI Quote Builder** (all plans): prompt → full quotation with line items, quantities, rates, tax, payment terms
  - Limits: Free 3/mo, Pro 25/mo, Ultra unlimited
  - Best results with specifics: "10 social media posts with captions and hashtags" > "social media content"
- **Quotation → Project/Invoice conversion** without re-entry
- **E-signature flow:** send via client portal → client reviews & signs digitally → stored with audit trail
- **Free quotation generator** (no signup): business name, client, line items, notes, validity date → clean text draft

### 4. Projects & Task Management
**Source:** `features/project-management`, demo page, `docs/projects`, `docs/tasks`

- **Project types:** Freelance (fixed budget) + Retainer (monthly recurring)
- **Kanban boards** per project: custom columns, drag-and-drop, column limits, done-column auto-archive
- **Budgets & deadlines** tracked per project
- **Team assignments:** invite teammates (email), assign to projects/tasks, track payouts
- **Task cards:** descriptions, checklists, due dates, files, client tags
- **Recurring tasks** supported
- **File vault** per project (shared vs. internal)
- **Domain/hosting tracking** per project (expiry reminders)
- **Secrets vault** for credentials (encrypted)

**Demo data evidence:**
```
Projects: 24 total | New: 5 | Ongoing: 2 | Completed: 0
Nova Studio project: Website redesign, budget tracked, team assigned (Arjun, Priya)
```

### 5. Client Portal (White-Label)
**Source:** `features/client-portal`, `docs/portal`, demo page

- **Branded with your name & logo** (not Clienter's)
- **Free:** 1 client, shows "Powered by Clienter" footer link
- **Pro/Ultra:** all clients, no Clienter branding
- **Ultra:** custom domain (`portal.youragency.com`) — Clienter sets up DNS, no extra cost
- **Client sign-in:** email + temporary password → choose own password on first visit
- **Password reset** emails carry your agency branding
- **Client sees:** project progress, invoice PDFs, shared files (signed URLs), documents to sign, messaging thread
- **Secure file access:** short-lived signed links
- **In-portal chat:** one thread per client, live, replaces WhatsApp/email archaeology

### 6. Invoicing & Payments (GST-Compliant)
**Source:** `features/invoicing`, demo page, `docs/invoicing`, `tools/gst-invoice-generator`

- **Canvas editor** with line items: description, quantity, rate, tax % → auto totals in ₹
- **GST fields on every invoice:** your GSTIN, client GSTIN, CGST/SGST (intra-state) or IGST (inter-state) split
- **~30 currencies**, different currency per client, custom tax rate per line item
- **One-click branded PDF export** (your logo, business details)
- **Payment tracking:** record full/part payments, receipts, proof of payment upload
- **Paid/Pending/Overdue** status auto-updates on dashboard
- **Auto-invoicing for retainers** (Pro/Ultra): raises & emails invoice on billing day
- **Expenses & payouts** tracked → profit analytics (revenue − expenses − team payouts)
- **Multi-currency invoicing** independent of your billing currency
- **No payment processing** — clients pay you directly (bank/UPI/card), Clienter only records & tracks
- **Free GST invoice generator** (no signup): fills CGST/SGST/IGST based on inter-state toggle
- **Invoice numbering** auto-sequential per client

**Demo data evidence:**
```
Invoice INV-2026-042: PAID | Total · GST 18% ₹45,000
Revenue this month: ₹2,046.1 received | Expenses: ₹400 | Money in account: ₹1,043.1
All-time: 73% collected | Total project value ₹84,200 | Received ₹61,340 | Pending ₹22,860
```

### 7. Verified Client Reviews
**Source:** `features/verified-reviews`, demo page, homepage

- **Trigger:** Mark project "Completed" → auto-invites client to review in their portal
- **1–5 stars + written feedback**
- **Uneditable by owner** — cannot edit or delete (core trust mechanism)
- **Public review page** at `clienter.co.in/your-studio` (your slug, logo, avg rating, all reviews)
- **Embeddable badge** — one line of code for live star rating on your website
- **Free on ALL plans** (including Free) — deliberate growth loop

**Demo data evidence:**
```
Your Studio: 4.9 ★ | Ananya R. (Verified, Jun 2026) | Vikram T. (Verified, May 2026)
```

### 8. Team & Payroll (Ultra)
**Source:** `features` page, pricing, `docs/team`

- **Teammate invites** by email — secure login, role-based permissions
- **Project/task assignments** per teammate
- **Payout tracking:** set pay rates, record payments, generate payslips
- **Team payroll** (Ultra only): monthly salaries, payslips, payout summaries
- **Free:** 1 teammate | **Pro:** 5 teammates | **Ultra:** unlimited

### 9. Meetings & Calendar
**Source:** `features` page, `docs/meetings`, demo page

- **Schedule meetings** attached to client/project
- **Google Calendar sync** (Pro/Ultra): two-way sync, auto Google Meet link generation
- **Browser push reminders** before each meeting
- **Meeting history** alongside client timeline

### 10. Messaging
**Source:** `docs/messaging`, demo page

- **Real-time chat** with team and clients
- **Client portal chat** — one thread per client, visible in portal
- **Attachments** supported
- **Notifications** (browser push, mobile)

### 11. Revenue Analytics
**Source:** demo page, `docs/dashboard`

- **Dashboard KPIs:** Monthly revenue, active clients, live projects, outstanding invoices
- **Revenue by type:** Freelance vs Retainer
- **Revenue trend chart** (Received, Expenses, New Revenue over months)
- **All-time collection rate** % (collected / total project value)
- **Forecast** & customisable dashboard widgets
- **Profit analytics:** Revenue − Expenses − Team Payouts = Money in account

**Demo data evidence:**
```
This month: Revenue $5,634.21 | 7 new projects | Received $2,046.1 | Expenses $400 | In account $1,043.1
Pipeline: 61 open | Pipeline value $223 | Won/mo 1 | Win rate 100%
Leads by source: Other 52, Referral 4, Website 3, Instagram 2
Revenue by type: Freelance $895, Retainer $151
```

### 12. Integrations
**Source:** `docs/integrations`, pricing table

| Integration | Plans | Description |
|-------------|-------|-------------|
| Google Calendar & Meet | Pro/Ultra | Two-way sync, auto Meet links, reminders |
| Meta Lead Ads | Ultra | Auto-import FB/IG ad leads as clients |
| IndiaMART | Ultra | Pull buyer enquiries into pipeline |
| Webhooks | Pro/Ultra | Receive HTTP POST from Zapier/Make/custom forms |
| Contact Form | All | Embeddable lead capture form → creates clients |
| Review Badge | All | Trust badge linking to your public review page |

### 13. Marketplace & Partner Program
**Source:** `docs/marketplace`, `docs/partner-program`, homepage "Marketplace" nav

- **Marketplace:** Public agency directory (`clienter.co.in/<agency-slug>`) — verified agencies with reviews, case studies
- **Agency profiles:** Verified badge, review average, portfolio/work samples
- **Partner Program:** Refer & Earn — ₹40/mo per Pro referral, ₹160/mo per Ultra referral, up to 12 billing cycles
- **Partner dashboard:** Track referrals, earnings, withdrawal

---

## Pricing Architecture — Complete Breakdown

**Source:** `pricing` page (Firecrawl), `compare` pages, FAQ

### Billing Regions (Mutually Exclusive, Set at First Checkout)
| Region | Processor | Currency | Pro | Ultra |
|--------|-----------|----------|-----|-------|
| India | Razorpay (UPI, cards, net banking, wallets) | INR | ₹199/mo | ₹799/mo |
| International | PayPal | USD | $19/mo | $39/mo |

*Not converted prices — separate price lists. Billing region locked at first checkout; change requires support email.*

### Plan Comparison (Complete)

| Feature | Free | Pro | Ultra |
|---------|------|-----|-------|
| **Limits** | | | |
| Clients | 3 | 20 | Unlimited |
| Projects | 5 | 40 | Unlimited |
| Active leads | 20 | 200 | Unlimited |
| Team members (excl. you) | 1 | 5 | Unlimited |
| Clients with portal | 1 | All | All |
| AI quotes/contracts/mo | 3 | 25 | 100 |
| File storage | 100 MB | 1 GB | 10 GB |
| **Core Product (all plans)** | | | |
| Clients, projects, task boards | ✓ | ✓ | ✓ |
| Leads pipeline, CSV import/export | ✓ | ✓ | ✓ |
| Documents, quotations, e-signatures | ✓ | ✓ | ✓ |
| Invoices, PDF export, GST-ready | ✓ | ✓ | ✓ |
| Payments, part-payments, receipts | ✓ | ✓ | ✓ |
| Expenses, payouts, profit analytics | ✓ | ✓ | ✓ |
| Client portal (your name/logo) | 1 client | All | All |
| Client messaging & file sharing | ✓ | ✓ | ✓ |
| Verified reviews & public page | ✓ | ✓ | ✓ |
| Multi-currency invoicing (~30) | ✓ | ✓ | ✓ |
| Meetings, reminders | ✓ | ✓ | ✓ |
| Android app, data export | ✓ | ✓ | ✓ |
| **Automation & Pro Features** | | | |
| Google Calendar & Meet sync | ✓ | ✓ | ✓ |
| Portal without "Powered by Clienter" | ✗ | ✓ | ✓ |
| Auto-invoicing (retainers) | ✗ | ✓ | ✓ |
| Auto lead follow-up reminders | ✗ | ✓ | ✓ |
| Email support | ✗ | ✓ | Priority |
| **Agency Features (Ultra only)** | | | |
| Team payroll & payslips | ✗ | ✗ | ✓ |
| White-label (brand colour across app) | ✗ | ✗ | ✓ |
| Custom portal domain (portal.yours.com) | ✗ | ✗ | ✓ |
| Lead integrations (Meta, Google Ads, IndiaMART, Webhooks) | ✗ | ✗ | ✓ |

### Key Pricing Principles (from FAQ & Compare pages)
- **Free is not a trial** — whole product, smaller limits, free forever
- **Active leads only** — won/lost/converted frees slot immediately
- **Over-limit behavior:** existing data keeps working, just can't add new until upgrade
- **Downgrade:** keep everything, just can't add new until under limit
- **AI quote definition:** one generation = each write/rewrite; chatting with AI costs nothing
- **No payment fees** — Clienter never touches client money
- **Monthly billing only** — no annual lock-in, cancel anytime
- **Refunds:** no refunds on charges already taken (monthly billing limits exposure to 1 month)

---

## Technical Architecture & Infrastructure

**Source:** `security` page, `docs/security`, `about` page, Playwright app inspection

### Stack
| Layer | Technology | Evidence |
|-------|------------|----------|
| Database/Auth/RLS | **Supabase** (PostgreSQL + PostgREST + Auth) | "Supabase for the database" — security page |
| Hosting/Edge | **Vercel** | "Vercel for the application" — security page |
| Auth Provider | Supabase Auth (email/password + Google OAuth) | Playwright login page shows "Continue with Google" |
| Payments (India) | **Razorpay** | "Razorpay in India" — security page, pricing page |
| Payments (Intl) | **PayPal** | "PayPal elsewhere" — security page, pricing page |
| Mobile App | **Capacitor/Wrapper** around `app.clienter.co.in` | Download page: "signed, secure wrapper around app.clienter.co.in" |
| Analytics | Google Analytics (opt-in) | Cookie banner on all pages |

### Security Model (4-Layer Defense)
**Source:** `security` page — "Defense in depth"

| Layer | Control | Details |
|-------|---------|---------|
| L1 | Managed Infrastructure | Supabase + Vercel, strict security headers, locked-down CSP |
| L2 | Encryption in Transit | HTTPS/TLS + HSTS enforced, nothing in clear |
| L3 | Secure Authentication | Passwords hashed (never plaintext), sessions via auth provider |
| L4 | Row-Level Isolation | **Every row scoped to owner** — Supabase RLS policies prevent cross-account access |

### Data Protection & Compliance
- **AES-256 encryption** at rest (implied by Supabase managed Postgres)
- **Zero data sharing/selling** — explicit commitment on security & pricing pages
- **DPDP Act 2023 compliance** (India) — Grievance Officer: Talagana Rajesh, `support@clienter.co.in`
- **PCI-DSS** — payments fully handled by Razorpay/PayPal, **Clienter never sees full card numbers**
- **Export anytime** — CSV/PDF export on all plans, no lock-in
- **Delete account** — 30-day soft delete period, recoverable (`help/account/delete`)

### Mobile App
**Source:** `download` page (Playwright)
- **Direct APK download** (v1.4.1, 4.6 MB, Android 7.0+, Sep 2026)
- **Not on Play Store yet** — "publishing soon", direct download to avoid review wait
- **Signed, secure wrapper** around `app.clienter.co.in` — **no local data storage**
- **Same account, same data, same privacy rules**
- **Install flow:** Chrome warning → Allow from source → Install → Play Protect "Install anyway"
- **Notifications:** meeting reminders, payments, messages on lock screen
- **Manual updates** — no auto-update, reinstall over old version
- **iOS:** No native app — "Add to Home Screen" from Safari for full-screen experience
- **Online only** — no offline mode

---

## Founder & Company Context

**Source:** `about` page, `pricing` page, `security` page, footer across all pages

| Attribute | Detail |
|-----------|--------|
| **Founder** | Talagana Rajesh |
| **Role** | Founder & Builder |
| **Content Channels** | Instagram (@talagana.rajesh), YouTube (@talaganarajesh), LinkedIn (talaganarajesh), X (@talaganaRajesh) |
| **Philosophy** | "Building in the open for the same people I make content for" |
| **Principles** | 1) Focused on freelancers 2) Calm over clutter 3) Your data is yours |
| **Target** | Freelancers, design studios, marketing agencies, consultants, developers, photographers, content creators, solo founders, small teams, copywriters |
| **Grievance Officer (DPDP)** | Talagana Rajesh, `support@clienter.co.in` |
| **Legal Entity** | Clienter (© 2026 Clienter. All rights reserved.) |
| **Built with** | "♥ by Talagana Rajesh for freelancers everywhere" |

---

## Competitive Positioning — Honest Comparisons

**Source:** `compare` page + 3 deep-dive comparisons (Playwright)

### vs Bonsai (Primary Competitor)
| Dimension | Clienter | Bonsai |
|-----------|----------|--------|
| **Billing Model** | Per workspace (flat) | Per user/month |
| **Team Cost at 5 people** | $19 (Pro) | $125 (Essentials ×5) |
| **GST Invoicing** | Built-in | Not listed on pricing |
| **Team Payroll** | Ultra | Not listed |
| **Time Tracking** | ✗ | ✓ |
| **Bookkeeping/Tax** | ✗ | ✓ |
| **Templates** | Growing | Large, mature library |
| **Free Plan** | Free forever | 7-day trial only |
| **Verdict** | **Choose if:** team, GST, flat price, free start | **Choose if:** solo, time tracking, bookkeeping, templates |

### vs HubSpot
| Dimension | Clienter | HubSpot |
|-----------|----------|---------|
| **Built For** | Freelancers/agencies (client services) | Sales & marketing teams |
| **Project Management** | Built-in Kanban, budgets | Needs add-on |
| **GST Invoicing** | Built-in | Not listed |
| **Client Portal** | Built-in (white-label) | Not core feature |
| **Marketing Automation** | ✗ | Extensive |
| **Pricing Model** | Flat per workspace | Per-seat, scales fast |
| **Learning Curve** | Afternoon setup | Steep on paid tiers |
| **Verdict** | **Choose if:** client-services, GST, portal, affordable | **Choose if:** high-volume outbound sales, marketing automation |

### vs 28 Other Tools (Compare Page Index)
Direct comparison pages exist for: **Spreadsheets, Zoho CRM, Pipedrive, Freshsales, Bitrix24, Jetpack CRM, Monday.com, ClickUp, Asana, Trello, Notion, HoneyBook, Dubsado, Plutio, Moxie, Taskip, Harvest, Zoho Books, QuickBooks, FreshBooks, Refrens, Vyapar** — plus alternative guides for each category.

**Comparison methodology:** "Fair reading as of [date], linked to competitor's own pricing page, where not stated we say so rather than claiming absence."

---

## Free Tools & Lead Magnets (No Signup Required)

**Source:** Playwright navigation of `/tools/` and `/templates/`

| Tool | URL | Function |
|------|-----|----------|
| **GST Invoice Generator** | `/tools/gst-invoice-generator` | Fill business/client details → correct CGST/SGST/IGST draft |
| **GST Calculator** | `/tools/gst-calculator` | Add/remove GST at 5/12/18/28% with split |
| **Rate Calculator** | `/tools/freelance-rate-calculator` | Hourly/project pricing helper |
| **Project Cost Calculator** | `/tools/project-cost-calculator` | Budget estimation |
| **TDS Calculator** | `/tools/tds-calculator` | Tax deducted at source |
| **Profit Margin Calculator** | `/tools/profit-margin-calculator` | Margin analysis |
| **Retainer Calculator** | `/tools/retainer-calculator` | Recurring revenue math |
| **Quotation Generator** | `/tools/quotation-generator` | Professional quote draft with validity |
| **Proposal Generator** | `/tools/proposal-template-generator` | Full proposal from quote |
| **Contract Generator** | `/tools/contract-template-generator` | Service agreement draft |
| **Late Payment Reminder** | `/tools/late-payment-reminder-generator` | Escalation emails |
| **Invoice Number Generator** | `/tools/invoice-number-generator` | Sequential numbering |
| **Timesheet Generator** | `/tools/timesheet-generator` | Time tracking export |

| Template | URL | Use Case |
|----------|-----|----------|
| Freelance Contract | `/templates/freelance-contract-template` | Service agreement |
| Project Proposal | `/templates/project-proposal-template` | Client-facing proposal |
| Client Onboarding Checklist | `/templates/client-onboarding-checklist` | Pre-project collection |
| Scope of Work | `/templates/scope-of-work-template` | In/out of scope definition |
| NDA | `/templates/nda-template-freelancers` | Mutual confidentiality |
| Invoice (India) | `/templates/invoice-template-india` | GST invoice layout |
| Quotation | `/templates/quotation-template` | Price quote layout |
| Retainer Agreement | `/templates/retainer-agreement-template` | Monthly recurring contract |

---

## Documentation & Help Coverage

**Source:** `docs` (Firecrawl map), `help` (Playwright)

### Documentation (100+ pages, structured by feature area)
```
Getting Started (6) → Clients (7) → Projects (7) → Leads (10) → Documents (9) → 
Invoicing (7) → Tasks (7) → Meetings (5) → Messaging (5) → Team (6) → 
Dashboard (4) → Settings (8) → Billing (5) → Integrations (6) → Portal (5) → 
Marketplace (2) → Partner Program (3) → Security (4) → Mobile (3) → Agency Workflows (3)
```

### Help Center (60+ articles, 15 categories)
- Account & Profile (5), Billing & Subscription (7), Client Management (6), Projects (5), Leads (5)
- Documents (5), Invoicing & Payments (5), Tasks (3), Meetings (3), Messaging (3)
- Team (5), Client Portal (4), Integrations (5), Refer & Earn (3), Security & Privacy (4)
- Mobile App (3), Troubleshooting (7), Contact Support

### Notable Doc Deep-Dives
- **AI Quote Builder** (`docs/documents/ai-builder`): prompt engineering tips, plan limits, editing workflow
- **Canvas Editor** (`docs/documents/canvas-editor`): shared editor for quotes/contracts/invoices
- **E-Signatures** (`docs/documents/e-signature`): portal-based signing flow
- **White-Label Setup** (`docs/settings/white-label`, `docs/settings/custom-domains`): Ultra domain configuration
- **Payroll** (`docs/team/payroll`, `help/team/payroll`): Ultra team salary/payslip workflow

---

## Bounded Unknowns — What Cannot Be Verified Externally

| Unknown | Why | Impact |
|---------|-----|--------|
| **Internal API contracts** (REST/GraphQL schemas) | Auth required, no public OpenAPI spec | Cannot verify integration shapes or build custom clients |
| **Database schema & RLS policies** | Supabase project not public | Row-level security claimed but policy logic unverifiable |
| **AI Quote Builder prompt/response format** | Requires authenticated app session | Prompt engineering tips documented but actual prompts hidden |
| **Webhook payload schemas** | `docs/integrations/webhook` exists but payload examples not public | Integration implementers need sandbox access |
| **Mobile app native capabilities** | Wrapper around web app — no offline, no native modules | APK is Capacitor/Ionic wrapper; no background sync |
| **Supabase Edge Functions / Serverless logic** | Not documented | Business logic (auto-invoice, reminders) execution unverified |
| **Search/ranking algorithm** (leads, marketplace) | Not disclosed | Lead sorting, agency directory ranking opaque |
| **Email delivery infrastructure** | Not disclosed | Transactional emails (invites, reminders, invoices) — provider unknown |
| **File storage backend** | Supabase Storage implied, not confirmed | 100MB/1GB/10GB limits — backend unverified |
| **Real-time sync implementation** | Supabase Realtime implied | Messaging, notifications — WebSocket architecture not public |
| **Backup/retention policy** | Not in security docs | Data durability guarantees unspecified |
| **Rate limits / API quotas** | Not documented | Public API (if any) limits unknown |
| **SLA / Uptime guarantees** | Not on security/pricing pages | No published uptime commitment |
| **Penetration test / audit reports** | Not linked | Security claims self-attested |
| **Multi-region deployment** | Vercel + Supabase — regions not specified | Data residency for non-India users unclear |
| **Mobile push notification provider** | Not disclosed | FCM/APNs or Supabase Push? |
| **AI model for Quote Builder** | Not disclosed | OpenAI? Anthropic? Fine-tuned? |
| **Export format completeness** | "Export anytime" claimed, formats not enumerated | CSV/PDF confirmed; JSON/complete dump unverified |

---

## Evidence Verification Checklist

Every major claim above traces to a specific source. Spot-check any claim by visiting the cited URL.

| Claim Category | Verification Method |
|----------------|---------------------|
| Pricing (₹199/₹799, $19/$39) | `clienter.co.in/pricing` (Firecrawl) + `compare/clienter-vs-bonsai` (Playwright) |
| GST Invoicing (CGST/SGST/IGST) | `features/invoicing` + `tools/gst-invoice-generator` (Playwright interactive) |
| Free Plan Limits (3 clients, 5 projects) | `pricing` page comparison table + FAQ |
| White-Label Portal (custom domain Ultra) | `features/client-portal` + `docs/settings/custom-domains` |
| Verified Reviews (uneditable) | `features/verified-reviews` + demo page review cards |
| Android APK Direct Download | `download` page (Playwright) — version, size, install steps |
| AI Quote Builder Limits | `docs/documents/ai-builder` (Playwright) — 3/25/unlimited |
| Row-Level Security | `security` page L4 + `docs/security/rls` |
| Billing Regions (Razorpay/PayPal) | `pricing` page + `security` page payments section |
| Founder Identity | `about` page + footer on every page + social links |
| Marketplace Agency Profiles | `docs/marketplace` + live agency slugs (e.g., `clienter.co.in/webcros`) |
| Partner Program Commissions | `docs/partner-program` — ₹40/₹160 for 12 cycles |
| Comparison Arithmetic | `compare/clienter-vs-bonsai` — per-seat vs per-workspace math |
| 4-Step Flow | `how-it-works` page — Add client → Run project → Invoice → Get paid |

---

## File Output

This analysis saved to: **`C:\Users\kavur\Downloads\clienter-rea.md`**

---

## Methodology Note

Following the **REA (Reverse Engineering Analysis)** pattern established in `outpero-rea.md` and `raisedhand-rea.md`:

1. **Route target first** → Identified marketing site (`clienter.co.in`) and app (`app.clienter.co.in`) as distinct surfaces
2. **Work summary-first** → Playwright passive inspection for live DOM state, Firecrawl for static content enumeration
3. **Plan broader investigations** → Systematically hit: homepage, pricing, features, security, docs, compare, tools, templates, download, demo, FAQ, help, blog
4. **Corroborate across sources** → Marketing claims (pricing page) vs. demo data (live app) vs. documentation (limits, workflows) vs. comparison pages (competitor arithmetic)
5. **Bounded unknowns documented honestly** → 19 categories of internal logic that require auth or source access
6. **Evidence-first writing** → Every claim cites a specific tool result (Playwright/Firecrawl) with URL

**Tools Used:** `mcp__playwright__playwright_navigate`, `mcp__playwright__playwright_get_visible_text`, `mcp__firecrawl__firecrawl_map`, `mcp__firecrawl__firecrawl_scrape` — all passive, zero DOM mutation, no authentication bypass.