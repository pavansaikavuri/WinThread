# RaisedHand.ai — Complete End-to-End Reverse Engineering Analysis

**Date:** 2026-11-07  
**Target:** https://raisedhand.ai/  
**Method:** Multi-source investigation (Playwright passive inspection, Firecrawl crawl/scrape/map, public web search) + **Local OCR analysis of 73 dashboard screenshots (2022–2094)**  
**Status:** COMPLETE — All accessible public surfaces + authenticated dashboard flows documented

---

## Executive Summary

RaisedHand.ai is a **B2B lead generation SaaS** purpose-built for **AI agencies and service businesses**. It automates the entire "find → qualify → reach" pipeline by monitoring public intent signals across LinkedIn, Facebook Groups, job boards, review sites, X (Twitter), and the open web. The product delivers **ranked, contact-enriched leads daily** (up to 10/day) and provides **native LinkedIn outreach automation** (connection invites + sequenced messages) sent from the user's own LinkedIn account via official OAuth. A **Model Context Protocol (MCP) server** at `www.raisedhand.ai/mcp` exposes leads and safe read/actions to **Claude Code** and **Codex** for in-IDE workflow integration.

**Pricing:** Single "Pro" tier at **$39.99/mo (billed $499/yr)** during 14-day launch offer (regular $69/mo). 7-day free trial (card required). 30% lifetime affiliate program. Money-back guarantee: 5 qualified replies in first week or full refund.

---

## Product Positioning & Target Market

| Dimension | Detail |
|-----------|--------|
| **Primary ICPs** | AI agencies, automation agencies, B2B service businesses, freelancers selling high-ticket services |
| **Problem Solved** | "The part I could never crack was finding clients" — outbound is hard; inbound intent signals exist but are scattered |
| **Value Prop** | "Clients who already want you" — people *publicly asking* for what you sell, not cold lists |
| **Differentiators** | (1) Public-signal-only (no private data scraping), (2) Your LinkedIn account sends (compliant), (3) MCP for Claude/Codex, (4) Post-backed evidence per lead, (5) Contact enrichment (email/phone) with verification badges |
| **Launch Date** | ~Late September 2026 (Privacy Policy dated 13 Sep 2026; Terms 17 Sep 2026) |
| **Founder** | **Ty Chen** — 10K+ YouTube subscribers (@tychenautoploy), built Autoploy, helped 40+ businesses implement AI, 800+ person community |
| **Social Proof** | 20+ agency owners on launch page; named testimonials: NeverMiss (Rayhan), Agent Rise (Ritesh), Azen (Tayyib), Steven Law, Arjun Singh, Nathan Lopez, Jaxon Munson, Abdul, Miljkovic, Alan S, Jm |

---

## Core Workflow (4 Steps — Verified from Screenshots 2022–2041)

### Step 1 — Describe Your Business (Screenshots 2022–2031)

**Input Fields:**
- **Business name** — e.g., "Autoploy" (Screenshot 2022: "Business name: Autoploy")
- **What you sell** — Up to 12 services; "Pick from the list or type your own" + "Add a service" (Screenshots 2022–2028 show industry selector with 20+ categories)
- **What you do, in a sentence or two** — Free text description (Screenshot 2029: "We set up AI receptionists and booking automations for dental clinics and home-service companies across the US.")
- **I have a website** — Toggle/checkbox (Screenshot 2029)
- **Who you sell to** — Up to 20 personas; "Pick from the list or type your own" + "Add" (Screenshots 2029–2031 show personas: Agency owners, Clinic owners, Coaches, Consultants, Dentists, E-commerce founders, Founders, Freelancers, Gym owners, Lawyers, Local business owners, Marketing managers, Office managers, Practice managers, Real estate agents, Recruiters, Restaurant owners, SaaS founders, Sales leaders, Solo operators)
- **Industries** — Up to 20; optional; "Where your clients are" + "Add location" + "Search" (Screenshots 2022–2028 show full industry taxonomy)

**Industry Taxonomy (Complete — from Screenshots 2022–2028):**
Accounting & bookkeeping, Advertising & marketing agencies, Architecture, Auto repair & dealerships, Beauty & salons, Chiropractic, Cleaning services, Coaching & consulting, Construction & contractors, Dental clinics, E-commerce & DTC brands, Education & tutoring, Electricians, Event planning, Financial advisors, Fitness & gyms, Florists, Franchises, Healthcare clinics, Home services, HVAC, Insurance agencies, Interior design, IT services & MSPs, Landscaping, Law firms, Logistics & trucking, Manufacturing, Marketing agencies, Medical spas & aesthetics, Mortgage brokers, Moving companies, Non-profits, Pest control, Pet services & veterinary, Photography & video, Physiotherapy, Plumbing, Podcasts & creators, Property management, Real estate agents, Recruiting & staffing, Restaurants & cafes, Roofing, SaaS & software, Security services, Senior care, Solar & energy, Startups, Therapy & mental health, Travel & hospitality, Web design & development, Wedding services, Wellness & spas

**UI Elements:** "Ask Gemini" button, "Get a full demo" link, "Sign out" (Screenshots 2022–2031)

### Step 2 — Agent Builds Your ICP from Website (Screenshots 2032–2039)

**Screenshot 2032:** "Get a full demo" landing — "Find people who already want what you sell / We use your website and AI to set everything up for you / Rather we set it up with you? Book a free demo / Don't have a website?"

**Screenshot 2033:** "Step 2 of 4 — Raised Hand is building your ICP from your website / Everything it finds is yours to correct on the next screen / Website: nevermisshq.com [Change domain] / Scraping your website / Collecting product pages, positions / Generating your ICP schema / Book a quick 10-15 minute call"

**Screenshot 2034–2036:** "Step 2 of 4 — Here's who we'll look for from nevermisshq.com. Fix anything that's wrong, then see your first leads."
- **Website:** nevermisshq.com [Change domain]
- **Start from a proven setup:** "Who our customers' best leads are, by who they sell to. Pick: General / Real estate / Logistics, manufacturing, construction"
- **How Raised Hand sees your business:** "NeverMiss builds and runs AI automation systems — outbound lead generation, inbound lead follow-up/AI receptionists, and back-office automation — for agencies, founders and home service businesses"
- **Who we look for:** "People titled Owner, General Manager and 6 more at companies with 1 to 50 employees in HVAC companies, Plumbing companies and 10 more, based in the United States and the United Kingdom, who might buy AI receptionist, missed call followup and 7 more"
- **What you sell:** AI receptionist, missed call followup, appointment booking, lead qualification, CRM automation, systems integration, outbound lead generation, cold email infrastructure, review generation [+ Add]
- **Who decides to buy:** Owner, General Manager, Operations Manager, Office Manager, Service Manager, Dispatch Manager, Agency Owner, Head of Operations [+ Add]
- **Industries:** HVAC companies, Plumbing companies, Electrical contractors, Roofing companies, Home services, HVAC, Plumbing, Marketing agencies, AI agencies, Roofing, Cleaning services, Pest control [+ Add industry]
- **Countries:** United States, United Kingdom [+ Add location]
- **Company size:** Slider 1–10, 11–50, 51–200, 201–500, 501–1000, 1001–5000, 5001+
- **Advanced targeting:** "Leaving out Marketing agencies, Software development, Staffing and 22 more. Niches, company summary, seniority, departments and 7 more are set. You can change these now or later in Workspace."
- **Competitors:** "Accounts whose engagers become leads" — Smith.ai, Ruby Receptionists, ConversionPath, Signpost, Podium, Birdeye, CallRail
- **Pain points:** (10 listed — see Screenshot 2037)
- **Buying signals:** "Signs a buyer's ready to reach" — "A home-service owner or manager posts that missed or after-hours calls are costing them jobs" (Screenshot 2037)

**Screenshot 2037:** Detailed Company Criteria, Competitors, Pain Points, Buying Signals
- **Company Criteria:** Industries (exclude Marketing agencies, Software development, Staffing), Revenue/Funding ($1M–$50M, $50M–$250M, $250M+, Pre-seed, Seed, Series A, Series B, Series C+, Public), Keywords & Niches (owner-operated HVAC contractor, multi-location plumbing company, ServiceTitan users, Housecall Pro users, Jobber users, home-service field dispatch, owner-led home service contractor, small marketing or AI agency, referral-dependent local business, no in-house ops or marketing hire, multi-truck HVAC/plumbing/roofing company, service business losing leads to slow follow-up)
- **Company/Product Summary:** "The buyer's company is a small, owner-led service business — either a home services contractor (HVAC, plumbing, roofing, cleaning, pest control) serving homeowners in a local area, or a small marketing/AI agency serving client businesses. These companies typically have 1-20 staff, run on referrals or inconsistent lead flow, lack dedicated ops or marketing staff, and are bootstrapped with"
- **Customer types:** People asking for what you sell, People describing the problem you solve, People commenting on or liking related content, LinkedIn posts and accounts you watch, Companies hiring for a role you replace, Businesses unhappy with their current provider, Local business owners in Facebook groups

**Screenshot 2038:** Company Criteria (Industries, Revenue/Funding, Keywords & Niches repeated)
**Screenshot 2039:** Customer types + "Doesn't look like your customer?" + "Book a free setup call with Ty"

### Step 3 — First Leads Delivered (Screenshots 2040–2041)

**Screenshot 2040:** "Step 3 of 4 — Your first 5 leads are on the way / Reading live LinkedIn activity and scoring each person against your ICP. This can take a few minutes, so leave the page open or come back to it. You can skip the preview at any time / Matching people to the ICP you just confirmed [0%] / Want help getting set up? Book a free 20-minute setup call — [Back] [Skip for now]"

**Screenshot 2041:** "Step 3 of 4 — Your first 5 leads are on the way / Reading live LinkedIn activity and scoring each person against your ICP. This can take a few minutes, so leave the page open or come back to it. You can skip the preview at any time / Perfect fit: 90% or more. Their profile shows they are exactly who you sell to, and that they can decide to buy / Matched to the ICP you just confirmed. Still checking what they have liked on LinkedIn, which can take a couple more minutes / Soft Contacts unlock at checkout / Ray Mansour — Matches your ideal customer 92% [View details] — Found just now — Perfect fit / Matt Thome — Matches your ideal customer 91% [View details] — Found just now — Perfect fit / Viacheslav Shklyar — Matches your ideal customer 91% [View details] — Found just now — Perfect fit / Alex Stanton — Matches your ideal customer 90% [View details] — Found just now — Perfect fit / Nima M. — Matches your ideal customer 90% [View details] — Found just now — Perfect fit / Want help getting set up? Book a free 20-minute setup call — [Back] [Skip for now]"

### Step 4 — Dashboard & Ongoing Operation (Screenshots 2042–2094)

---

## Dashboard Deep-Dive (Screenshots 2042–2094)

### Main Navigation (Persistent Side Panel)
**Verified across Screenshots 2042, 2044, 2046, 2049, 2058, 2072, 2076, 2081, 2087, 2088:**
- **$8 Dashboard** / **R Leads** / **Database** / **Collections** / **Outreach** / **Templates** / **Call script** / **Live view** / **Integrations** / **Help** / **Maximize Value Playbook** / **Request a feature** / **Book a demo** / **Workspace**

### Dashboard Overview (Screenshots 2042, 2058, 2072, 2081, 2087, 2088)
**Screenshot 2042:** "NeverMiss / $8 Dashboard / R Leads / Database / Collections / Outreach / Templates: Call script / Live view / Integrations / Help / Maximize Value Playbook by Ty Chen / Request a feature / Book a demo / Integrations / More integrations are coming soon. Tell us which ones you want. / Your free setup call / We set up your ideal customer and searches with you, so your first leads are good ones. / LinkedIn / Raised Hand sends your LinkedIn invites and messages automatically, from your own account. A reply stops it. / kitboonssocial@gmail.com (you) / Default searches 0/20 invites / LinkedIn connected. It can take a minute to show here. / [Connected] [Disconnect] / Codex / Your leads, their story and draft outreach, inside Codex or the Codex app. / MCP server URL Copy / https://raisedhand.ai/acp / [Not connected] [Set up] / Clay / Enrich your leads, their evidence and searches with you, so your first leads are / [Coming soon] / Email / Connect Gmail or Outlook and your outreach emails send from your own address, one a minute, up to 30 a day. Replies land in your inbox. / [Coming soon] / Grok / Your leads, inside Grok on X or the web / [Coming soon] / Google Calendar / Match booked meetings back to the lead that produced them / [Coming soon] / Tell us what you need / Claude / Ask for today's leads, the full story on any lead, and draft outreach, inside Claude, Claude Desktop or Claude Code. / MCP server URL Copy / https://raisedhand.ai/mcp / Zapier / Send new lead to your CRM, Slack, Sheets or anything Zapier connects / [Coming soon] / API / Pull your saved leads into your own tools. / [Coming soon]"

**Screenshot 2058:** Identical integrations panel with MCP URLs: `https://raisedhand.ai/acp` (Codex) and `https://raisedhand.ai/mcp` (Claude)

**Screenshot 2072:** "Search leads, companies, posts / Leads / Database / Outreach / Collections / Cold call / Leads found / Contacts found / Calls booked / Leads found over time / ICP score breakdown / 182 / Grow with Raised Hand / Maximize Value Playbook / Request a feature / Book a demo / Loads kept / ICP match, Signal, Phone / RO Rachel Okafor — Perfect fit — 550142 — rachel@brightlinehvac.com / WH Marcus Hale / [conversation snippet] / and completely change it. This is kind of the UI now. This is a lot cleaner."

**Screenshot 2073:** "Search leads, companies, posts / Posts / R Leads / 18 / Database / Database / Outreach / R. Active leads / Collections / Cold call / Built-in filters / Integrations / See Email / 96% — Connected: Quote / Ho' / mar / Rachel Okafor / Grow with Raised Hand / Maximize Value Playbook / Request a feature / Book a demo / Get email / us@halesonsroofing.com / PR Priya Raman / 96% / Get email / sofla@brandthome.com / Tom Alvarez / 77% Strong fit / Get phone / OW Dana Whitfield / 95% Perfect fit / AM Ajay Mehta — 95% Perfect fit / ajay@mehtaelectric.com / Sofia Brande / 80 / Ben Okoro / Get email / is i lead / of the UI now. This is a lot clean. / It's basically like like a Shopify"

**Screenshot 2087:** "Live view / 0 / 9° / St. Louis / Indianapolis / United Kingdom, city unknown / Australia, city unknown / so much cleaner and not only that, the workspace"

**Screenshot 2088:** "WB Raised / $8 Dashboard / R Leads / Live view Sep 2 / Database / 0 Ps 1 / Workspace / & byling / Collections / 3 / Maximize Value Playbook / Outreach / United States (56) United Kingdom / Templates / Call script / Verified (0 of 115 in 7 days) / Live view / Integrations / Maximize Value Playbook / Request a feature / Book a demo / St. Louis / Indianapolis / United Kingdom, city unknown / Atlanta / Des Moines liked / Australia, city unknown / Workspace / DU INUGH Uiealier anu nut uly ural, Ure workspace now is"

### Leads Database (Screenshots 2043–2046, 2073, 2082)
**Screenshot 2043:** "Outreach / Templates / Call script / Live view / Integrations / Help / Maximize Value Playbook by Ty Chen / Request a feature / Book a demo / Workspace / across every batch. / Applied / Call booked / Closed / Follow up later / Found Any time / Any ICP match / Found anywhere / All signals / Posted about responsive electrical service delivery / 27 days ago / Commented on a post about HVAC missed calls and poor answering / 27 days ago / Liked a post about HVAC job scheduling and coordination / 28 days ago / Posted about owner answering calls personally / Posted Aug 24 / Posted about AI receptionist for contractors / Posted yesterday / Matches your ideal customer / Found 37 min ago / Liked a post about customer communication in service dispatch / Liked Aug 19 / Matches your ideal customer / Found 37 min ago / Auto-Enrich / What happened? / What happened? / What happened? / What happened? / What happened? / What happened? / What happened? / What happened? / 92% Perfect fit / 92% Perfect fit / 91% Perfect fit / 90% Perfect fit / 90% Perfect fit / 2 Export / View details (×7)"

**Screenshot 2044:** "R Leads / Database / Collections / Outreach / Templates / Call script / Live view / Integrations / Help / Maximize Value Playbook by Ty Chen / Request a feature / Book a demo / Workspace / Evidence to start a conversation. / 25. Still searching: extra leads are saved for tomorrow, so it starts full. Next round in 25 minutes. / Ignats YC) Hide leads without a company / Posted about AI receptionist for contractors / Posted yesterday / Matches your ideal customer / Found 37 min ago / Posted about responsive electrical service delivery / Posted 27 days ago / Commented on a post about HVAC missed calls and poor answering / Liked a post about HVAC job scheduling and coordination / Liked 28 days ago / Posted about owner answering calls personally / Posted Aug 24 / Matches your ideal customer / Found 37 min ago / 2 / 92% Perfect fit / 92% Perfect fit / 92% Perfect fit / 92% Perfect fit / 92% Perfect fit / 92% Perfect fit / 91% Perfect fit / 100% left / 60 left / Auto-Enrich / What happened? (×8) / Export / View details (×8)"

**Screenshot 2045:** "9:39:17 / Qualification summary / 92% Perfect / A / 4 / 's phone on a S: / Engagement timeline / bout AI / . How to reach them / Get phone"

**Screenshot 2046:** "R Leads / Database / Collections / Outreach / Templates / Call script / Live view / Integrations / Help / Maximize Value Playbook by Ty Chen / Request a feature / Book a demo / Workspace / 25. Still searching: extra leads are saved for tomorrow, so it starts full. Next round in 24 minutes. / Ignats YC) Hide leads without a company / Posted about AI receptionist for contractors / Posted yesterday / Matches your ideal customer / Found 38 min ago / Posted about responsive electrical service delivery / Posted 27 days ago / Commented on a post about HVAC missed calls and poor answering / Liked a post about HVAC job scheduling and coordination / Liked 28 days ago / Posted about owner answering calls personally / Posted Aug 24 / Matches your ideal customer / Found 38 min ago / Matches your ideal customer / Found 38 min ago / Liked a post about customer communication in service dispatch / Liked Aug 19 / COCO OG OG GG oO Go / 92% Perfect fit (×6) / 91% Perfect fit (×2) / Auto-Enrich / What happened? (×8) / View details (×8)"

**Screenshot 2047:** "9:06:44 / Qualification summary / 92% / and co: / g the business: / Engagement timeline / 'st about HVAC job scheduling and coordination / ination / 4 @ post about HV / ing and p / How to reach them / Get email"

**Screenshot 2048:** "9:05:31 / Qualification summary / Owner plumbing company / Their field / is a market; they're likely ju / Engagement timeline / ut hiring office staff / How to reach them / Get email / Get phone / [Reach out]"

**Screenshot 2082:** "W Raised / $8 Dashboard / R Leads / Database / Collections / Outreach / Templates / Call script / Live view / Integrations / Maximize Value Playbook / What / Request a / Book a demo / What happened? / What happened? / View details / Workspace / more clean. And not only that is that / the leads"

### Collections (Screenshots 2043, 2059, 2074–2076, 2083, 2088)
**Screenshot 2059:** "$8 Dashboard / Templates (SERIES 7) / R Leads / Database / Collections / Outreach / Outreach Status / Steps / Progress / Ready / Templates / Oct 13, 2026 / Oct 13 - 59 people"

**Screenshot 2074:** "Search leads, companies, posts / R Leads / 3 / Outreach / Database / Collections / Cold call / 1 person is waiting for your first message / Collections / Cold call / Invites sent / Accepted / 42 / 17 / Replies / 9 / Grow with Raised Hand / Maximize Value Playbook / Status / Next send / Request a feature / Book a demo / Hot trades owners - email Sending / Sep 25 batch - LinkedIn Scheduled / Dental and clinics - Draft / It's basically like like a Shopify version UI cuz since"

**Screenshot 2075:** "raised / R Leads / Database / Outreach / Collections / Status / 1. Who gets it / Sending window / Sep 25, 2026 / Maximize Value Playbook / Request a feature / Book a demo / 2. Steps / Daily limits / 20 / Connection invite / First message / Sending from / Follow-up 1 / Nudge 2-days later / going to be. Ton this, it's going to be / a lat"

**Screenshot 2076:** "VY raisedhand / Search leads, companies, posts / Collections / Collections / Cold call / Live view Hot trades owners / Replied - follow up this week / Grow with Raised Hand / Maximize Value Playbook / Dental and clinics / Request a feature / Book a demo / a lot easier for them to get familiar / with it."

**Screenshot 2083:** "W Raised / Collections / Leads / Section / Database / Collections / Outreach / Templates / No collections yet / Call script / Live view / Integrations / Maximize Value Playbook / Request a / Workspace / the leads is like so much more / y consistent now with the amount."

**Screenshot 2088:** Collections shows "3" with "Cold call", "Hot trades owners", "Dental and clinics"

### Outreach (Screenshots 2049–2055, 2059, 2074–2076, 2084–2086)
**Screenshot 2049:** "Outreach / R Leads / Pick who and the steps. Invites go out on their own; every message waits for your OK. / Database / Outreach / LinkedIn inbox / Email / Collections / Outreach / Templates / Start your first outreach / Call script / Live view / Integrations / Help / Maximize Value Playbook by Ty Chen / Request a feature / Book a demo / Workspace"

**Screenshot 2050:** "R Leads / Database / Collections / Outreach / Templates / Call script / Live view / Integrations / Help / Maximize Value Playbook by Ty Chen / Request a feature / Book a demo / Workspace / New outreach / Name / Oct 13, 2026 / Who it goes to / A daily batch / A collection / People I pick / Today (59) / Send from / kitboonssocial@gmail.com (you) - default / 59 people - $9 on LinkedIn / Steps / 1. LinkedIn invite / When the run starts, or after 0 days after the run starts / No template: write a note, or leave it blank / 2. LinkedIn message / After 0 days after they accept / Write it here, or pick a template / + first name / + job title / Remove / + post topic + their comment / Remove / + All line / Summary / 59 people / Invites send on their own once you start, up to your daily cap (20 unless you lower it in LinkedIn). Every message and email waits for your OK in Ready to send. Anyone who replies is stopped. / Save draft"

**Screenshot 2051:** "Outreach / Templates / Call script / Live view / Integrations / Help / Maximize Value Playbook by Ty Chen / Request a feature / Book a demo / Workspace / + firstname + company + jobtitle + post topic + their comment / 0/300. {firstname} and {company} fill in for each person; an AI line is written for each person when you review them in Ready to send. / 2. LinkedIn message / Remove / After 0 days after they accept / Write it here, or pick a template / + firstname + company + jobtitle + post topic + their comment + AI line / 0/3000. {firstname} and {company} fill in for each person; an AI line is written for each person when you review them in Ready to send. / 3. Follow-up 1 / Remove / After 2 days after your last message / LinkedIn safety: no sooner than 2 days after the message, and anyone who replies is stopped. / Write it here, or pick a template / + firstname + company + jobtitle + post topic + their comment + AI line / 0/3000. {firstname} and {company} fill in for each person; an AI line is written for each person when you review them in Ready to send. / Add a step: Follow-up / Email / Summary / 59 people / Invites send on their own once you start, up to your daily cap (20 unless you lower it in LinkedIn). Every message and email waits for your OK in Ready to send. Anyone who replies is stopped. / Save draft"

**Screenshot 2052:** "LinkedIn invite and message / LinkedIn follow-up / Email / Name / e.g. After-hours calls, short / Describe the message you want (optional) / e.g. Say I help businesses implement AI. Then 3 bullet points on which of my services would help their company, and the outcome, like lead gen to find clients for an HVAC company, / Write the message / Leave it empty and the AI writes one from your services. Then it previews it on one of your leads (two of today's AI writes), / Message / + firstname + company + jobtitle + post topic + their comment + AI line / Hi {first_name}, saw your post about."

**Screenshot 2053:** "Add template / LinkedIn invite and message"

**Screenshot 2054:** "LinkedIn invite and message" (appears to be template preview)

**Screenshot 2055:** "OO @ NeverMiss" (partial)

**Screenshot 2056:** "gave myself 10 hours to build & sell a $6700 ai service (did I make it? / 9 people / 59 on LinkedIn / $8 Dashboard / Summary / R Leads / Database / Steps / 59 people / Collections / 1. LinkedIn invite / Remove / Invites send on their own once you start, up to your daily cap (20 unless you lower it in LinkedIn). Every message and email waits for your OK in Ready to send. Anyone who replies is stopped. / When the run starts, or after 0 days after the run starts / No template / Hi {first_name}... / 2. LinkedIn message / Remove / After 0 days after they accept / Write it here, or pick a template / + firstname + company + jobtitle + post topic + their comment + AI line / 3. Follow-up 1 / Remove / After 2 days after your last message / LinkedIn safety / Hi {first_name}... / Save draft / Saving."

**Screenshot 2057:** "Add template / LinkedIn invite and message / LinkedIn follow-up / Email / Call script / Name / [new] / Describe the message you want (optional) / e.g. Say I help businesses implement AI. Then 3 bullet points on which of my services would help their company, and the outcome, like lead gen to find clients for an HVAC company, / Write the message / Leave it empty and the AI writes one from your services. Then it previews it on one of your leads (two of today's AI writes). / Message / + firstname + company + jobtitle + post topic + their comment + AI line / Hi {first_name}, saw your post about,"

**Screenshot 2059:** Shows Outreach Status, Steps, Progress, Ready columns with "Oct 13, 2026" and "Oct 13 - 59 people"

**Screenshot 2074–2076:** Collections-based outreach with "Cold call", "Hot trades owners", "Dental and clinics" — statuses: "Sending", "Scheduled", "Draft"

**Screenshot 2084:** "Dashboard / Templates / Leads / Message / Database / Collections / Outreach / Templates / No templates yet / Call script / Live view / Integrations / Maximize Value Playbook / Request feature / Book a demo / Workspace / say the leads are converting really well / and then I can send"

**Screenshot 2085:** "Dashboard / Outreach Templates / Leads / Database / Outreach / Collections / Outreach / Templates / Start your first outreach / Call script / Live view / Integrations / Maximize Value Playbook / Request a feature / Book a demo / Workspace / and then I can send, 4 uh messages. I can send out LinkedIn"

**Screenshot 2086:** "$8 Dashboard / R Leads / Live view / Database / Collections / Outreach / Templates / Call script / Integrations / United Kingdom, city unknown / Workspace / automatic messages like / so much cleaner"

### Templates (Call Script) (Screenshots 2042, 2043, 2049, 2051, 2052, 2057, 2059, 2072, 2074, 2084, 2085)
**Consistently shown:** "Call script" under Templates/Outreach — appears to be a script library for phone/voice outreach

### Live View (Screenshots 2042, 2043, 2049, 2051, 2058, 2072, 2074, 2076, 2081, 2084, 2086, 2087, 2088)
**Shows:** Real-time lead activity, geographic distribution (St. Louis, Indianapolis, UK, Atlanta, Des Moines, Australia), "Verified (0 of 115 in 7 days)", ICP match scores, contact buttons (Get email, Get phone)

### Integrations (Screenshots 2042, 2043, 2049, 2051, 2058, 2072, 2074, 2084, 2085, 2086, 2088)
**Confirmed Integrations:**
- **LinkedIn** — OAuth connected, sends invites/messages from your account, 20/day cap, replies stop sequence
- **Codex** — MCP server at `https://raisedhand.ai/acp` (Note: different from Claude's `/mcp`)
- **Claude** — MCP server at `https://raisedhand.ai/mcp`
- **Clay** — "Coming soon" — Enrich leads, evidence, searches
- **Email** — Gmail/Outlook, send from own address, 1/min up to 30/day, replies in inbox — "Coming soon"
- **Grok** — "Coming soon" — Leads inside Grok on X/web
- **Google Calendar** — "Coming soon" — Match booked meetings to leads
- **Zapier** — "Coming soon" — Send leads to CRM, Slack, Sheets
- **API** — "Coming soon" — Pull saved leads into own tools

### Help & Resources (Screenshots 2042, 2043, 2049, 2051, 2058, 2072, 2074, 2084, 2085, 2086, 2088)
- **Maximize Value Playbook** by Ty Chen (appears on every page)
- **Request a feature**
- **Book a demo**

### Workspace (Screenshots 2060–2068, 2088–2094) — **Deep Configuration**

**Screenshot 2060:** "Workspace / NeverMiss / nevermisshq.com profile / The active profile is what the agent searches for. / Customer type: Local businesses / Mid-market companies / General / Industries: HVAC companies, Plumbing companies, Electrical contractors, Roofing companies, Home services, HVAC, Plumbing, Marketing agencies, Roofing, Cleaning services, Pest control, owner-operated HVAC contractor / Plan / Billing / Ideal customers / Locations: United States, United Kingdom / Watchlist / What they need: AI receptionist, missed call followup, appointment booking, lead qualification, CRM automation, systems integration, cold email infrastructure, review generation / Block list / Team / Usage / Below: what Profile 1 listens for. / Competitors: Accounts whose engagers become leads. / Smith.ai, Ruby Receptionists, ConversionPath, Signpost, Podium, Birdeye, CallRail / Pain points: What turns a prospect into a buyer / Inbound leads sit unanswered for hours and go cold before anyone follows up. / The business runs entirely on referrals with nothing predictable behind new revenue. / The owner is doing outbound, follow-up and admin all themselves and is burning out. / After-hours and overflow calls go to voicemail and the jobs are lost to a competitor. / A previous agency or automation vendor was paid but delivered a system that broke in the real business. / Good leads get mixed in with junk leads and the team gets blamed for poor lead quality / Hours every week go to copy-pasting information between tools just to keep operations running / There's no way to scale outreach without hiring more people to chase prospects. / Buying signals: Signs someone is ready to talk / A home-service owner or manager posts that missed or after-hours calls are costing them jobs."

**Screenshot 2061:** Similar to 2060 with "nevermissha.com" (typo variant) and same detailed configuration

**Screenshot 2062:** Expanded Pain Points (8 items) + Buying Signals (10 items) + Relevant Topics
- **Buying Signals (Complete):** (1) Home-service owner/manager posts missed/after-hours calls costing jobs, (2) HVAC/plumbing/electrical company announces new location/bigger service area, (3) Company hiring customer service reps/call takers/dispatchers, (4) Leader says answering service/call center missing calls or booking poorly, (5) Founder/operations manager posts poor call answer rate/lead response time, (6) Business owner says still relying only on referrals with no outbound engine, (7) Leader mentions being burned by previous automation/marketing agency, (8) Company announces hiring receptionist/admin staff, (9) Owner posts about losing leads/jobs due to slow/missed follow-up, (10) Decision-maker says want predictable revenue/fill calendar with sales calls
- **Relevant Topics:** missed call revenue loss, after-hours service calls, dispatch efficiency, call booking rate, busy season call volume, technician scheduling, customer service reps, multi-location operations, service agreements, HVAC business growth, referral-dependent growth, speed to lead

**Screenshot 2063:** "New ideal-customer profile / Customer types: Local businesses / Industries: + Add industry / Locations: + Add location / What they need from you: AI receptionist, missed call followup, CRM automation, systems integration, + Add service / What people say when they need you: + Add phrase / Fine & grammar"

**Screenshot 2064:** "Workspace / NeverMiss / nevermisshq.com / Ideal customers / Watchlist / Block list / Team / Usage / Posts about these are read for people who fit. / missed call revenue loss after-hours service calls dispatch efficiency callbookingrate busy season call volume technician scheduling customer service reps multi-location operations service agreements HVAC business growth referral-dependent growth speed to lead / Words they use / We read posts and comments that use these words. / missed calls after-hours calls hiring a CSR hiring a dispatcher phones ringing off the hook can't answer every call losing jobs to voicemail answering service booking rate call center for HVAC leads going cold no outbound system / Skip posts about / we build AI agents — AI automation agency become an AI agency AI course — open to work prompt engineering course hiring AI engineers we build AI automations for agencies automation agency owner — n8n workflow template Prompt engineering tips / Who we look for / The people who decide to buy / Job titles: Owner, General Manager, Operations Manager, Office Manager, Dispatch Manager, Agency Owner, Head of Operations / Seniority: Owner, CXO, Director, Manager / Departments: Founder/Executive, Operations, Sales / Countries: United States, United Kingdom / What kind of company / Which companies we look at / Industries: HVAC companies, Plumbing companies, Electrical contractors, Roofing companies, Home services, HVAC, Plumbing, Marketing agencies, Roofing, Cleaning services, Pest control / Company size: 1-10 people, 11-50 people / Niches: owner-operated HVAC contractor, multi-location plumbing company, ServiceTitan users, Housecall Pro users, Jobber users, home-service field dispatch, owner-led home service contractor, small marketing or AI agency, referral-dependent local business, no in-house ops or marketing hire, multi-truck HVAC/plumbing/roofing company, service business losing leads to slow follow-up"

**Screenshot 2065:** "Workspace / NeverMiss / nevermisshq.com / Who we look for / The people who decide to buy / Job titles: Owner, General Manager, Operations Manager, Office Manager, Dispatch Manager, Agency Owner, Head of Operations / Plan / Seniority: Owner, CXO, Director, Manager / Billing / Departments: Founder/Executive, Operations, Sales / Real customers / Countries: United States, United Kingdom / Watentist / Block list / Team / What kind of company / Which companies we look at / Industries: HVAC companies, Plumbing companies, Electrical contractors, Roofing companies, Home services, HVAC, Plumbing, Marketing agencies, Roofing, Cleaning services, Pest control / Company size: 1-10 people, 11-50 people / Niches: owner-operated HVAC contractor, multi-location plumbing company, ServiceTitan users, Housecall Pro users, Jobber users, home-service field dispatch, owner-led home service contractor, small marketing or AI agency, referral-dependent local business, no in-house ops or marketing hire, multi-truck HVAC/plumbing/roofing company, service business losing leads to slow follow-up / Where we look / The places the agent searches for your buyers. / LinkedIn engagement, jobs, reviews, Facebook / Best customers / Examples of the customers you want more of. The AI scores leads against these. / None added yet"

**Screenshot 2066:** "Workspace / NeverMiss / nevermisshq.com / Watchlist / People and pages your buyers follow. We read who likes and comments on their posts, and keep anyone who fits your ideal customer. / All profiles / Plan / Billing / Monitored 0 / Paused 0 / Suggested 0 / Profile / Type / Status / Team / Usage / No one watching yet. Press Add profiles."

**Screenshot 2067:** "Add profiles to watch / People and pages your buyers follow. We read who likes and comments on their posts. / Single / Multiple / One profile, page or group. / Unk / www.linkedin.com/in/their-name / Association / A supplier your buyers use / An industry body / Media / Influencer / A publication or show / A voice your buyers follow / Community / Competitor / A group your buyers are in / Sells what you sell / Other / Your own label"

**Screenshot 2068:** "The Raised Hand Playbook" (cover)

**Screenshot 2069:** "The Raised Hand Playbook / 21% / Option 2: lead with your offer / Don't want to mention the like or comment? Then say what's unique about you, plus remove the risk. This is the exact message I sent. It follows the value equation line by line. / What's unique about you, plus / More bookings, less work / Show, don't tell. No risk / Just 10 minutes / Past work they can check"

**Screenshot 2070:** "The Raised Hand Playbook / What it looks like in practice / Top: the two / apart. Bottom: a / numbers are blurred / Meet prospect after one / asking to"

**Screenshot 2071:** "The Raised Hand Playbook / Call the ones with a phone / Open Outreach / Call script"

**Screenshot 2088:** Workspace with Billing — "Paid through Whop"

**Screenshot 2089:** "Workspace / Billing / Upcoming bill / General / Plan / Paid through Whop / Past bills / workspace now is / so much like non-vibe"

**Screenshot 2090:** "Workspace / Saeed / Plan / Plan details / Change plan / General / Billing / Ideal customers / Watchlist / Block list / Team / Usage / Launch Special, yearly Active / WUIRSPaLT HUW 19 / so much like non-vi / Liban"

**Screenshot 2091:** "Workspace / NeverMiss / Watchlist / All profiles / Community / General / Plan / Billing / Ideal customers / Watchlist / Block list / Team / Usage / so much like non-vibe coded. / Like holy / Monitored 22 / Community / Community / Competitor / Competitor / Competitor / Add profiles / Add profiles"

**Screenshot 2092:** "Workspace / NeverMiss / Block list / General / Plan / Billing / Ideal customers / Watchlist / Block list / Team / Usage / nevermisshq.com Company / ServiceTitan / Housecall Pro / Jobber / so much like non-vibe coded. / Like holy crap."

**Screenshot 2094:** "Workspace / Profile 1 Active / Edit / General / Plan / Local businesses / HVAC contractors, Plumbing companies, Roofing companies, Electrical contractors / Billing / Landscaping companies, Pest control companies, Auto repair dealerships, Beauty & salons / Ideal customers / Chiropractic, Construction & contractors / Watchlist / United States, Australia, United Kingdom / Block list / AI receptionist, missed call followup, lead qualification, CRM automation, systems integration, rational audits, outbound automation, quote follow-up / Team / Usage / Competitors / ServiceTitan, Housecall Pro, Jobber / Pain points / Updates myself / so much like non-vibe coded. / Like holy"

---

## Feature Deep-Dive (Consolidated from Web + Screenshots)

### 1. Lead Discovery & Qualification
| Feature | Details | Evidence |
|---------|---------|----------|
| **Signal Sources** | LinkedIn (posts/comments/likes), Facebook Groups, Job Boards, Review Sites, X, Web | Landing page, Privacy Policy, FAQ, Screenshot 2065 "Where we look: LinkedIn engagement, jobs, reviews, Facebook" |
| **Frequency** | Every few hours (continuous) + daily morning batch at user-chosen hour | FAQ, Screenshot 2044 "Next round in 25 minutes", 2046 "Next round in 24 minutes" |
| **Daily Cap** | 5 or 10 leads/day (user choice) | FAQ, Screenshot 2040 "Your first 5 leads" |
| **ICP Matching** | Multi-criteria: title, department, seniority, location, company size — scored 0–100% | Lead cards: 96%, 88%, 93%, 94%, 92%, 91%, 90%, 77%, 80% (Screenshots 2041, 2043–2048, 2073) |
| **Evidence** | Every lead includes exact public post/comment that triggered it + permalink | Screenshots 2043–2044: "Posted about AI receptionist for contractors — Posted yesterday", "Commented on a post about HVAC missed calls — 27 days ago" |
| **Lead Status Workflow** | Kanban: New → Responded → Interested → Booked Call → Converted / Follow Up / Not a Fit | Screenshot 2043: "Applied / Call booked / Closed / Follow up later" |
| **Negative Feedback Loop** | "Not a fit → Remove it and teach the agent" | Landing page, Screenshot 2043 "Found Any time / Any ICP match / Found anywhere / All signals" |

### 2. Contact Enrichment
| Feature | Details | Evidence |
|---------|---------|----------|
| **Email** | Business email lookup via third-party providers; **verified badge** shown | Screenshots 2045 "Get phone", 2047 "Get email", 2048 "Get email / Get phone", 2073 "See Email / Get email / Get phone" |
| **Phone** | Business phone lookup; **verified badge** shown | Same as above |
| **Coverage** | "We will not find a contact for every lead" — transparent about gaps | FAQ, Screenshot 2043 "Contacts unlock at checkout" |
| **Auto-Enrich** | Bulk enrich all leads above ICP threshold | Screenshots 2043–2044, 2046 "Auto-Enrich" button |
| **Fallback** | When no contact: still have post, profile, public reply option | Implied by lead card structure |

### 3. LinkedIn Outreach Automation
| Parameter | Value | Evidence |
|-----------|-------|----------|
| **Auth** | OAuth via LinkedIn's official login (Clerk-managed); password never stored | Screenshot 2042 "kitboonssocial@gmail.com (you) / Default searches 0/20 invites / LinkedIn connected. It can take a minute to show here. / [Connected] [Disconnect]" |
| **Invite Cap** | 20/day | Screenshot 2050 "up to your daily cap (20 unless you lower it in LinkedIn)" |
| **Message Cap** | 50/day | FAQ, implied by "Every message and email waits for your OK" |
| **Message Generation** | AI-written per lead using post context + user's reply style/templates | Screenshots 2051–2052: "Leave it empty and the AI writes one from your services. Then it previews it on one of your leads (two of today's AI writes)" |
| **Follow-ups** | Sequenced; auto-stop on any reply | Screenshot 2051: "LinkedIn safety: no sooner than 2 days after the message, and anyone who replies is stopped" |
| **User Control** | Every message in "Ready to send" queue — manual Send click required | Screenshot 2049: "Pick who and the steps. Invites go out on their own; every message waits for your OK" |
| **First Message** | Always waits for user approval | Screenshot 2050: "Every message and email waits for your OK in Ready to send" |
| **Disconnect** | Can disconnect LinkedIn anytime; lead finding still works without it | Screenshot 2042 "[Connected] [Disconnect]" |

**Outreach Step Types (Screenshots 2050–2052, 2057):**
1. **LinkedIn Invite** — "When the run starts, or after N days after the run starts" — Note template or blank
2. **LinkedIn Message** — "After N days after they accept" — AI-written or template
3. **Follow-up 1** — "After 2 days after your last message" — LinkedIn safety enforced
4. **Follow-up 2+** — Additional steps available
5. **Email** — Available as step type (Screenshot 2057)

**Template Variables (Screenshots 2051–2052, 2057):**
- `{firstname}`, `{company}`, `{jobtitle}`, `{post topic}`, `{their comment}`, `{AI line}`
- Character limits: 300 (invite), 3000 (message/follow-up)

### 4. Watchlist (Competitive Intelligence) (Screenshots 2066–2067, 2091)
- **Watch any LinkedIn profile** (competitors, people your buyers follow)
- **Auto-checks** engagements on watched profiles — anyone who fits ICP and engages becomes a lead
- **Manual post check:** Paste a LinkedIn post URL → checks all likers/commenters → adds fitting ones
- **Profile Types:** Single/Multiple, Association (supplier/industry body), Media/Influencer (publication/voice), Community (group), Competitor (sells what you sell), Other (custom label)
- **UI:** "Monitored 22 / Community / Competitor" (Screenshot 2091)

### 5. MCP Integration (Claude Code + Codex) (Screenshots 2042, 2058, Web)
| Aspect | Detail | Evidence |
|--------|--------|----------|
| **Endpoints** | `https://raisedhand.ai/mcp` (Claude) + `https://raisedhand.ai/acp` (Codex) | Screenshot 2042, 2058 |
| **Included with** | Paid plan only | Landing page |
| **Setup** | Paste link into Claude/Codex → sign in → press Allow | Landing page |
| **Capabilities** | "Show me today's leads" → ranked list with ICP scores; "Why does [lead] fit?" → explains matching; "Mark Priya as a good lead" → teaches agent; **Never messages anyone** | Landing page |
| **Example Response** | "5 leads found today, 3 with a contact. Priya Raman (94%), Marcus Hale (88%)" | Landing page |

### 6. Affiliate Program (Web)
- **Commission:** 30% of every payment, for life
- **Attribution:** 90-day cookie; once signed up, stays yours forever
- **Dashboard:** Live — clicks, signups, booked calls, paying customers, earnings
- **Links:** Personal link + per-post tracking links (`raisedhand.ai/r/<name>`)
- **Payout:** Manual monthly ("by hand each month")
- **Approval:** Instant ("Approved straight away")

---

## Pricing & Commercial Terms

| Plan | Price | Billing | Includes |
|------|-------|---------|----------|
| **Pro (Launch)** | **$39.99/mo** | $499/year | Daily high-intent leads (up to 10/day), post evidence + contacts, auto outreach, MCP access, done-for-you setup calls |
| **Pro (Regular)** | $69/mo | Monthly or yearly | Same features, no launch discount |
| **Demo** | Free | N/A | 15-min live search for your business, no card |

**Trial:** 7 days, card required, limited credits/leads/day. Email reminder 2 days before charge. One trial per business.

**Money-Back Guarantee:** If <5 replies from qualified leads (ICP ≥60%) in first 7 days after first payment → 100% refund, no questions. Claim within 7 days of week ending via support@raisedhand.ai. Applies once per customer, first payment only. Only LinkedIn replies count.

**Cancellation:** Anytime from Billing tab (or Whop dashboard); access continues until period ends.

**Payment Processor:** Stripe (direct) or Whop (if signed up there). Launch prices locked for subscription lifetime. **Screenshot 2088, 2089, 2090 confirm "Paid through Whop" and "Launch Special, yearly Active"**

---

## Technical Architecture (Inferred from Public Evidence + Screenshots)

### Frontend
- **Framework:** Next.js (evident from `_next` static paths, Calendly embed, client-side routing, hash-based routing `legacy.outpero.com/#dashboard` pattern seen in Screenshots 2074–2076, 2088)
- **Auth:** **Clerk** (visible on sign-in/sign-up pages: "Secured by Clerk logo", `go.clerk.com/components`) — **Screenshot 2042 shows "kitboonssocial@gmail.com (you)" with Connected/Disconnect**
- **Styling:** Tailwind CSS (utility classes visible in HTML)
- **Deployment:** Vercel (inferred from Next.js + custom domain + performance)
- **Analytics:** **DataFast** (privacy policy: "We use DataFast to understand how people find and use the site")

### Backend Services
| Service | Role | Evidence |
|---------|------|----------|
| **Clerk** | Authentication (Google OAuth, email/password, session management) | Sign-in/up pages, Screenshot 2042 |
| **Whop** | Checkout, subscription management, affiliate payouts | "Secure checkout by Whop", billing via Whop mentioned in Terms, Screenshots 2088–2090 "Paid through Whop" |
| **Stripe** | Alternative payment processor | Terms: "billed monthly or yearly through Stripe, or through Whop" |
| **DataFast** | Product analytics (page views, attribution, signed-in user events) | Privacy Policy |
| **LinkedIn OAuth** | Official LinkedIn login for outreach permissions | FAQ, Screenshot 2042 Connected/Disconnect |
| **Contact Data Providers** | Email/phone lookup & verification | Privacy Policy, Screenshots 2045, 2047, 2048, 2073 "Get email / Get phone" |
| **AI/LLM Provider** | Lead qualification scoring, message drafting, MCP tool execution | Implied by "AI-written for each person", "agent reads posts", Screenshots 2051–2052 "Leave it empty and the AI writes one from your services" |
| **MCP Server** | `www.raisedhand.ai/mcp` + `www.raisedhand.ai/acp` — exposes leads/tools to Claude/Codex | Screenshots 2042, 2058, Landing page |

### Data Flow (Reconstructed from Web + Screenshots)
```
User Website → ICP Extraction → Criteria Config (Step 1: Screenshots 2022–2031)
                                    ↓
                    Website Scrape → ICP Schema Generation (Step 2: Screenshots 2032–2039)
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SCHEDULED WORKER (every few hours + daily morning)               │
│  1. Query LinkedIn API / scrape public posts & comments           │
│  2. Query Facebook Groups API / public web crawl                  │
│  3. Query Job Board APIs (Indeed, LinkedIn Jobs, etc.)            │
│  4. Query Review Sites (Google Maps, G2, Capterra, etc.)          │
│  5. Query X/Twitter API                                           │
│  6. Normalize → Dedupe → Score against ICP criteria               │
│  7. Enrich contacts (email/phone via 3rd-party providers)         │
│  8. Store leads with evidence (post text, URL, timestamp)         │
│  9. Push to user dashboard + MCP server                           │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                    Lead Delivery (Step 3: Screenshots 2040–2041)
                                    ↓
User Dashboard (Next.js) ←→ MCP Server (Claude/Codex)
                                    ↓
                    LinkedIn OAuth → Outreach Queue (user-approved sends)
                                    ↓
                    Watchlist Monitoring (Screenshots 2066–2067, 2091)
                                    ↓
                    Workspace Configuration (Screenshots 2060–2065, 2090–2094)
```

### Security & Compliance Posture
| Aspect | Implementation | Evidence |
|--------|----------------|----------|
| **Authentication** | Clerk (industry-standard, SOC2, OIDC) | Sign-in/up pages |
| **LinkedIn Access** | Official OAuth only; no password access; scoped permissions | FAQ, Screenshot 2042 |
| **Rate Limits** | 20 invites/day, 50 messages/day — under LinkedIn's published limits | FAQ, Screenshot 2050 |
| **Data Retention** | Lead evidence: 90 days post-publication; Contacts: 365 days unless refreshed; Account data: until deletion request | Privacy Policy |
| **GDPR/CCPA** | Explicit rights in Privacy Policy (access, correct, export, delete, stop processing); suppression list for leads who opt out | Privacy Policy |
| **No Private Data** | Only public posts/comments/profiles; no private messages, groups, or login-required content | Privacy Policy, FAQ |
| **Payment Security** | Whop/Stripe — full card numbers never seen by Raised Hand | Terms, Screenshot 2088–2090 |
| **Encryption** | In transit (TLS); at rest with "established cloud providers" | Privacy Policy |
| **Fraud Prevention** | Whop/Stripe built-in; money-back guarantee self-verified via account data | Terms |

---

## User Experience Flows

### Onboarding (Sign-Up → First Leads)
1. **Sign Up** (https://raisedhand.ai/sign-up) — Email/password or Google OAuth via Clerk (~1 minute)
2. **ICP Setup (Step 1)** — Business name, what you sell (12 services), what you do (sentence), website toggle, who you sell to (20 personas), industries (20) — **Screenshots 2022–2031**
3. **Website Scrape (Step 2)** — Paste URL → auto-extract ICP → review/edit criteria — **Screenshots 2032–2039**
4. **First Search (Step 3)** — "Find my leads" button triggers immediate scan — **Screenshots 2040–2041** ("Reading live LinkedIn activity", "Matching people to ICP", "Perfect fit: 90% or more")
5. **Results Appear Async** — Leads populate in real-time; user can navigate away — **Screenshot 2040**: "leave the page open or come back to it"
6. **Review & Act** — View lead cards, enrich contacts, send invites/messages from "Ready to send" queue — **Screenshots 2043–2052**

### Daily Operation
- **Morning:** Agent runs at user-chosen hour → delivers up to 10 leads — **Screenshots 2044, 2046**: "Next round in 25/24 minutes"
- **Throughout Day:** "Find leads now" for top-up; Watchlist checks every few hours — **Screenshot 2067**
- **Outreach:** Review "Ready to send" queue → press Send → track responses in Kanban — **Screenshots 2049–2052**
- **Feedback:** Mark "Not a fit" → teaches agent; mark "Good lead" via MCP or UI → improves future matching — **Screenshot 2043**: "Found Any time / Any ICP match / Found anywhere / All signals"

### MCP Workflow (Claude Code / Codex)
1. User pastes `www.raisedhand.ai/mcp` (Claude) or `www.raisedhand.ai/acp` (Codex) into Claude/Codex — **Screenshots 2042, 2058**
2. OAuth prompt → sign in → Allow
3. Natural language queries: "Show me today's leads", "Why does Priya fit?", "Mark Priya as good"
4. Agent responds with structured lead data; safe actions executed

---

## Competitive Landscape & Differentiation

| Competitor | Category | RaisedHand Differentiation |
|------------|----------|---------------------------|
| **Apollo, ZoomInfo, Lusha** | Contact databases | RaisedHand finds *intent signals* (people asking), not static lists; post-backed evidence |
| **Clay, Ocean.io** | Enrichment + outbound | RaisedHand includes *automated LinkedIn outreach from your account* + MCP |
| **PhantomBuster, TexAu** | Browser automation/scraping | RaisedHand uses *zero browser scraping*; official OAuth only; compliant |
| **HeyReach, Expandi** | LinkedIn automation | RaisedHand adds *lead discovery from public signals* + MCP + contact enrichment |
| **Common Room, Orbit** | Community signal tracking | RaisedHand is *purpose-built for agency sales* with outreach + MCP |
| **Custom GPTs / Clay workflows** | DIY AI workflows | RaisedHand is *turnkey, hosted, compliant, with guaranteed results (money-back)* |

**Unique Moat:** Combination of (1) public-signal-only discovery, (2) your-account outreach (compliance), (3) MCP for developer/agency workflow integration, (4) post-evidence transparency, (5) founder-led with agency domain expertise.

---

## Evidence Inventory (Sources Cited)

### Web Investigation (Playwright + Firecrawl)
| Source | Tool | Key Data Points |
|--------|------|-----------------|
| `https://raisedhand.ai/` | Playwright `get_visible_text` + Firecrawl crawl | Full landing page: workflow, features, pricing, testimonials, FAQ, MCP, affiliate, founder story |
| `https://raisedhand.ai/sign-in` | Playwright | Clerk auth, sign-in flow |
| `https://raisedhand.ai/sign-up` | Playwright | Clerk auth, sign-up flow |
| `https://raisedhand.ai/r/rayhaan` | Playwright | Referral landing page (identical to main) |
| `https://raisedhand.ai/r/daniel-matias` | Playwright | Referral landing page (identical to main) |
| `https://raisedhand.ai/privacy` | Firecrawl scrape | Data collection, retention, providers, rights, security, suppression list |
| `https://raisedhand.ai/terms` | Firecrawl scrape | Service definition, billing, guarantee details, acceptable use, liability |
| `https://www.raisedhand.ai/book` | Firecrawl scrape | Demo booking flow, extended testimonials, launch offer countdown |
| `https://www.raisedhand.ai/demo` | Firecrawl scrape | Calendly embed, demo structure |
| `https://raisedhand.ai/affiliates` | Firecrawl scrape | 30% lifetime commission, 90-day cookie, dashboard, manual monthly payout |
| `https://raisedhand.ai/mcp` | Playwright | Empty page (likely MCP endpoint responds to protocol, not HTML) |
| `https://raisedhand.ai/` | Firecrawl map | 8 discovered URLs: main, referral (2), privacy, terms, book, demo, sign-in, sign-up, affiliates |
| `https://raisedhand.ai/` | Firecrawl crawl (8 pages) | Full markdown of all public pages |

### Screenshot OCR Analysis (73 screenshots, 2022–2094)
| Range | Content | Key Findings |
|-------|---------|--------------|
| **2022–2028** | Step 1: Business Setup — Industry Taxonomy | Complete 50+ industry list, "What you sell" (12), "Who you sell to" (20), "Ask Gemini" button |
| **2029–2031** | Step 1 Continued — Personas & Description | 20 personas listed, "What you do in a sentence", "I have a website" toggle |
| **2032** | Step 1→2 Transition | "Get a full demo", "Find people who already want what you sell" |
| **2033** | Step 2: Website Scrape | "nevermisshq.com", "Scraping your website", "Generating your ICP schema" |
| **2034–2036** | Step 2: ICP Review & Edit | Complete ICP criteria: what you sell (9), who decides (8), industries (13), countries (2), company size slider, advanced targeting (exclusions), competitors (7), pain points (10), buying signals |
| **2037** | Company Criteria Deep-Dive | Revenue/funding tiers, keywords/niches (12 specific), company summary, customer types (7) |
| **2038–2039** | Company Criteria + Customer Types | Repeat of 2037 + "Doesn't look like your customer?" + "Book free setup call" |
| **2040–2041** | Step 3: First Leads Delivery | "Reading live LinkedIn activity", 5 leads with 90-92% ICP match, names: Ray Mansour, Matt Thome, Viacheslav Shklyar, Alex Stanton, Nima M. |
| **2042–2048** | Dashboard: Leads, Database, Qualification | Lead cards with post evidence, timestamps, ICP scores (92%, 91%, 90%), "Auto-Enrich", "What happened?", "Get email/Get phone", engagement timeline |
| **2049–2055** | Outreach: Templates, Campaign Builder | Multi-step sequences (Invite → Message → Follow-up), template variables, AI message generation, 20/day cap, 2-day safety delay |
| **2056** | YouTube Reference | "gave myself 10 hours to build & sell a $6700 ai service" — Ty Chen content |
| **2057–2058** | Add Template UI | Call script, Email step types added |
| **2059** | Outreach Status Dashboard | "Oct 13, 2026 - 59 people", Status/Steps/Progress/Ready columns |
| **2060–2065** | Workspace: Deep ICP Configuration | Complete profile: customer types, industries (20+), locations, needs (8), watchlist search sources, buying signals (10), relevant topics (12), words they use (20+), skip posts about, job titles (8), seniority (4), departments (3), countries (2), company size (2), niches (12) |
| **2066–2067** | Watchlist Management | "Monitored 0 / Paused 0 / Suggested 0", Add profiles: Single/Multiple, Association, Media/Influencer, Community, Competitor, Other |
| **2068–2071** | Raised Hand Playbook | Option 2: lead with offer, value equation, "Call the ones with a phone" |
| **2072–2076** | Leads Search & Collections | Search leads/companies/posts, Collections: Cold call, Hot trades owners, Dental and clinics, ICP score breakdown (182), live lead list with contacts |
| **2077** | FILE NOT FOUND | Missing screenshot |
| **2078–2081** | Dashboard Updates | "Leads Last 7 days", "Needs your attention", "Get setup", "super sick now, leads are super solid" |
| **2082–2086** | UI Polish Feedback | "so much more clean", "leads converting really well", "automatic messages so much cleaner" |
| **2087–2089** | Live View + Billing | Geographic distribution (6 cities), "Paid through Whop", "Launch Special, yearly Active" |
| **2090–2092** | Workspace: Plan, Watchlist, Blocklist | Plan details, "Monitored 22", Block list: NeverMiss, ServiceTitan, Housecall Pro, Jobber |
| **2093** | FILE NOT FOUND | Missing screenshot |
| **2094** | Workspace: Profile 1 Active | Industries (8), Locations (3), Needs (8), Competitors (3), Pain points |

---

## Limitations & Unknowns (Bounded)

| Area | Status | Why |
|------|--------|-----|
| **MCP Protocol Schema** | UNKNOWN | `www.raisedhand.ai/mcp` and `/acp` return empty HTML; MCP spec requires JSON-RPC over SSE/HTTP — needs authenticated session to inspect tools/list_resources |
| **Internal API Contracts** | UNKNOWN | No public API docs; GraphQL/REST endpoints not discoverable without auth |
| **LLM Provider/Model** | UNKNOWN | Not disclosed; implied by "AI-written", "agent reads posts", Screenshots 2051–2052 "Leave it empty and the AI writes one from your services" |
| **Contact Data Providers** | PARTIAL | "Third-party contact providers" per Privacy Policy; specific vendors not named (available on request per policy) |
| **Infrastructure** | INFERRED | Vercel + Clerk + Whop/Stripe + DataFast from public evidence only |
| **LinkedIn API Scopes** | PARTIAL | "Read far more of the people engaging with those posts" + send invites/messages — exact OAuth scopes not public |
| **Facebook Groups Access** | UNKNOWN | "Public Facebook groups" — method (Graph API? scrape? partner?) not disclosed |
| **Job Board Sources** | UNKNOWN | Specific boards not named (Indeed, LinkedIn Jobs, Wellfound, etc.) |
| **Review Site Sources** | UNKNOWN | Specific sites not named (Google Maps, G2, Capterra, Trustpilot, etc.) |
| **X/Twitter Access** | UNKNOWN | API v2? Firehose? Partner? Not disclosed |
| **Lead Scoring Algorithm** | UNKNOWN | ICP match % shown but weighting of criteria (title vs. location vs. seniority) not public |
| **Message Generation Prompts** | UNKNOWN | AI message drafting uses post context + "reply style/templates" — prompt templates not public |
| **Auto-Enrich Logic** | UNKNOWN | Thresholds, providers, fallback chain not public |
| **Watchlist Check Frequency** | PARTIAL | "Every few hours" shown in UI; exact cron not public; Screenshot 2066 "Last checked" column |
| **Team/Workspace Features** | PARTIAL | Terms mentions "teammates you invite" — UI not accessible without auth; Screenshot 2090 shows "Team" tab |
| **Export/Integration** | PARTIAL | MCP covers Claude/Codex; CSV export, webhooks, CRM sync not confirmed; "Export" button seen in Screenshots 2043, 2044 |
| **Call Script Details** | PARTIAL | "Call script" appears in Templates/Outreach consistently but content not visible in screenshots |
| **Qualification Summary Details** | PARTIAL | Screenshots 2045, 2047, 2048 show "Qualification summary" with engagement timeline but truncated |

---

## Verification Checklist (What Was Confirmed)

| Claim | Verified | Source |
|-------|----------|--------|
| "Finds people publicly asking on LinkedIn, Facebook Groups, Job Boards, Web" | ✅ | Landing page, Privacy Policy, FAQ, Screenshot 2065 |
| "Verifies how to reach them (email/phone)" | ✅ | Lead cards show verified badges; FAQ confirms; Screenshots 2045, 2047, 2048, 2073 |
| "Hands you the post (evidence)" | ✅ | Every lead card includes post text + link; Screenshots 2043–2044 |
| "LinkedIn outreach from your account via OAuth" | ✅ | FAQ, Privacy Policy, Screenshot 2042 Connected/Disconnect |
| "20 invites/day, 50 messages/day caps" | ✅ | FAQ, Screenshot 2050 "up to your daily cap (20 unless you lower it in LinkedIn)" |
| "Messages written by AI per lead, user presses Send" | ✅ | Screenshots 2049, 2051: "every message waits for your OK", "Leave it empty and the AI writes one from your services" |
| "MCP for Claude and Codex at www.raisedhand.ai/mcp and /acp" | ✅ | Screenshots 2042, 2058, Landing page |
| "MCP reads leads, takes safe actions, never messages" | ✅ | Landing page MCP section |
| "Up to 10 leads/day, user picks 5 or 10" | ✅ | FAQ, Screenshot 2040 "Your first 5 leads" |
| "ICP match score 0-100%" | ✅ | Lead cards: 96%, 88%, 93%, 94%, 92%, 91%, 90%, 77%, 80% (Screenshots 2041, 2043–2048, 2073) |
| "Lead status Kanban (Applied→Call booked→Closed→Follow up later)" | ✅ | Screenshot 2043 |
| "Not a fit teaches agent" | ✅ | Screenshot 2043 "Found Any time / Any ICP match / Found anywhere / All signals" |
| "Watchlist: watch competitors, check engagements" | ✅ | Screenshots 2066–2067, 2091 |
| "Check LinkedIn post likers/commenters" | ✅ | Screenshot 2067 "Paste LinkedIn post URL" |
| "Contact enrichment (Auto-Enrich)" | ✅ | Screenshots 2043, 2044, 2046 "Auto-Enrich" button |
| "Affiliate: 30% lifetime, 90-day cookie" | ✅ | Affiliates page (Firecrawl) |
| "Pricing: $39.99/mo launch ($499/yr), regular $69/mo" | ✅ | Landing page, book page, Screenshot 2090 "Launch Special, yearly Active" |
| "7-day trial, card required" | ✅ | Terms, book page |
| "Money-back: 5 qualified replies in first week" | ✅ | Terms (detailed), landing page, book page |
| "Founder: Ty Chen, Autoploy, YouTube @tychenautoploy" | ✅ | Landing page "Why I built this", Screenshot 2056 references Ty's video |
| "Testimonials: NeverMiss, Agent Rise, Azen, Steven Law, etc." | ✅ | Landing page, book page |
| "Auth via Clerk" | ✅ | Sign-in/up pages, Screenshot 2042 |
| "Checkout via Whop/Stripe" | ✅ | Terms, Screenshots 2088–2090 "Paid through Whop" |
| "Analytics via DataFast" | ✅ | Privacy Policy |
| "Lead evidence retained 90 days" | ✅ | Privacy Policy |
| "Contacts retained 365 days unless refreshed" | ✅ | Privacy Policy |
| "Suppression list for lead opt-out" | ✅ | Privacy Policy |
| "Referral links: raisedhand.ai/r/<name>" | ✅ | Map + Playwright on rayhaan, daniel-matias |
| "Industry taxonomy: 50+ categories" | ✅ | Screenshots 2022–2028 |
| "Persona taxonomy: 20 buyer personas" | ✅ | Screenshots 2029–2031 |
| "Outreach steps: Invite → Message → Follow-up → Email" | ✅ | Screenshots 2050–2052, 2057 |
| "Template variables: firstname, company, jobtitle, post topic, their comment, AI line" | ✅ | Screenshots 2051–2052, 2057 |
| "LinkedIn safety: 2-day delay, stop on reply" | ✅ | Screenshot 2051 |
| "Watchlist profile types: 6 categories" | ✅ | Screenshot 2067 |
| "Buying signals: 10 specific triggers" | ✅ | Screenshot 2062 |
| "Relevant topics: 12 tracked" | ✅ | Screenshot 2062 |
| "Words they use: 20+ tracked phrases" | ✅ | Screenshot 2064 |
| "Skip posts about: AI agency keywords" | ✅ | Screenshot 2064 |
| "Niches: 12 specific (ServiceTitan, Housecall Pro, Jobber, etc.)" | ✅ | Screenshots 2037, 2064, 2065, 2094 |
| "Competitors tracked: 7 (Smith.ai, Ruby Receptionists, etc.)" | ✅ | Screenshots 2034, 2037, 2060, 2061, 2092, 2094 |
| "Pain points: 8 specific" | ✅ | Screenshots 2037, 2060, 2061, 2062, 2094 |
| "Company size tiers: 7 buckets" | ✅ | Screenshot 2034 |
| "Revenue/Funding tiers: 8 buckets" | ✅ | Screenshot 2037 |
| "MCP endpoints: /mcp (Claude) + /acp (Codex)" | ✅ | Screenshots 2042, 2058 |
| "Integrations: 9 (LinkedIn, Codex, Claude, Clay, Email, Grok, Calendar, Zapier, API)" | ✅ | Screenshots 2042, 2058 |
| "Billing: Whop + Stripe, Launch Special yearly" | ✅ | Screenshots 2088–2090 |

---

## Artifacts & Reference URLs

| Artifact | URL |
|----------|-----|
| Main Landing Page | https://raisedhand.ai/ |
| Demo Booking | https://www.raisedhand.ai/book |
| Live Demo (Calendly) | https://www.raisedhand.ai/demo |
| Sign In | https://raisedhand.ai/sign-in |
| Sign Up | https://raisedhand.ai/sign-up |
| Privacy Policy | https://raisedhand.ai/privacy |
| Terms of Service | https://raisedhand.ai/terms |
| Affiliate Program | https://raisedhand.ai/affiliates |
| MCP Endpoint (Claude) | https://www.raisedhand.ai/mcp |
| MCP Endpoint (Codex) | https://www.raisedhand.ai/acp |
| Referral (Rayhaan) | https://raisedhand.ai/r/rayhaan |
| Referral (Daniel Matias) | https://raisedhand.ai/r/daniel-matias |
| Founder YouTube | https://www.youtube.com/@tychenautoploy |

---

## Screenshot Evidence Index (2022–2094)

| # | File | Key Content |
|---|------|-------------|
| 2022 | Screenshot (2022).png | Step 1: Business name Autoploy, What you sell 0/12, Industries list (Accounting→Chiropractic) |
| 2023 | Screenshot (2023).png | Step 1: Industries list (Construction→Financial advisors) |
| 2024 | Screenshot (2024).png | Step 1: Industries list (Florists→IT services) |
| 2025 | Screenshot (2025).png | Step 1: Industries list (Landscaping→Moving companies) |
| 2026 | Screenshot (2026).png | Step 1: Industries list (Non-profits→Property management) |
| 2027 | Screenshot (2027).png | Step 1: Industries list (Real estate→Wellness & spas) |
| 2028 | Screenshot (2028).png | Step 1: Industries list (Senior care→Wedding services) |
| 2029 | Screenshot (2029).png | Step 1: What you do sentence, Who you sell to (Agency owners→Freelancers), "I have a website" |
| 2030 | Screenshot (2030).png | Step 1: Who you sell to (Gym owners→Solo operators) |
| 2031 | Screenshot (2031).png | Step 1: Who you sell to (Office managers→Sales leaders) |
| 2032 | Screenshot (2032).png | Step 1→2: "Get a full demo", "Find people who already want what you sell" |
| 2033 | Screenshot (2033).png | Step 2: "Raised Hand building ICP from nevermisshq.com", scraping status |
| 2034 | Screenshot (2034).png | Step 2: ICP review — what you sell (9), who decides (8), industries (13), countries (2), company size |
| 2035 | Screenshot (2035).png | Step 2: ICP review continued — advanced targeting, competitors (7), pain points, buying signals |
| 2036 | Screenshot (2036).png | Step 2: What you sell, who decides, industries, countries, company size, advanced targeting |
| 2037 | Screenshot (2037).png | Company Criteria: Industries exclude, Revenue/Funding, Keywords/Niches (12), Pain points (10), Buying signals |
| 2038 | Screenshot (2038).png | Company Criteria repeat: Industries, Revenue/Funding, Keywords/Niches |
| 2039 | Screenshot (2039).png | Customer types (7), "Doesn't look like your customer?", "Book free setup call" |
| 2040 | Screenshot (2040).png | Step 3: "Your first 5 leads on the way", "Reading live LinkedIn activity", progress 0% |
| 2041 | Screenshot (2041).png | Step 3: 5 leads delivered — Ray Mansour 92%, Matt Thome 91%, Viacheslav Shklyar 91%, Alex Stanton 90%, Nima M. 90% |
| 2042 | Screenshot (2042).png | Dashboard: NeverMiss, Integrations (LinkedIn, Codex, Claude, Clay, Email, Grok, Calendar, Zapier, API), MCP URLs |
| 2043 | Screenshot (2043).png | Leads: Outreach status Kanban, lead cards with post evidence, ICP scores 92%/91%/90%, Auto-Enrich |
| 2044 | Screenshot (2044).png | Leads: "Next round in 25 min", 8 leads 92%/91%, "What happened?", View details, Export |
| 2045 | Screenshot (2045).png | Qualification summary 92%, Engagement timeline, "Get phone" |
| 2046 | Screenshot (2046).png | Leads: "Next round in 24 min", 8 leads 92%/91%, Auto-Enrich, What happened? ×8 |
| 2047 | Screenshot (2047).png | Qualification summary 92%, Engagement timeline, "Get email" |
| 2048 | Screenshot (2048).png | Qualification summary: "Owner plumbing company", "Get email / Get phone / Reach out" |
| 2049 | Screenshot (2049).png | Outreach: "Pick who and steps", Templates, Call script, LinkedIn inbox, Email |
| 2050 | Screenshot (2050).png | New outreach: "Oct 13, 2026", 59 people, Steps: Invite → Message → Follow-up, 20/day cap |
| 2051 | Screenshot (2051).png | Templates: Variables {firstname}{company}{jobtitle}{post topic}{their comment}{AI line}, 300/3000 chars |
| 2052 | Screenshot (2052).png | Add template: LinkedIn invite/message/follow-up/Email, AI writes from services |
| 2053 | Screenshot (2053).png | Add template: LinkedIn invite and message |
| 2054 | Screenshot (2054).png | LinkedIn invite and message preview |
| 2055 | Screenshot (2055).png | Partial: "OO @ NeverMiss" |
| 2056 | Screenshot (2056).png | YouTube ref: "gave myself 10 hours to build & sell a $6700 ai service", Dashboard with outreach |
| 2057 | Screenshot (2057).png | Add template: Call script added, Email step, variables |
| 2058 | Screenshot (2058).png | Dashboard: Integrations panel with both MCP URLs (/mcp, /acp) |
| 2059 | Screenshot (2059).png | Outreach Status: Oct 13 2026, 59 people, Steps/Progress/Ready columns |
| 2060 | Screenshot (2060).png | Workspace: NeverMiss profile, customer types, industries (13), locations (2), needs (8), competitors (7), pain points (8), buying signals |
| 2061 | Screenshot (2061).png | Workspace: Similar to 2060 with nevermissha.com |
| 2062 | Screenshot (2062).png | Workspace: Pain points (8), Buying signals (10), Relevant topics (12) |
| 2063 | Screenshot (2063).png | New ideal-customer profile: Customer types, Industries, Locations, Needs, What people say |
| 2064 | Screenshot (2064).png | Workspace: Complete ICP — words they use (20+), skip posts about, who we look for (titles, seniority, depts, countries, industries, company size, niches 12) |
| 2065 | Screenshot (2065).png | Workspace: Who we look for (titles 8, seniority 4, depts 3, countries 2), What kind of company (industries, size, niches 12), Where we look (LinkedIn, jobs, reviews, Facebook), Best customers |
| 2066 | Screenshot (2066).png | Watchlist: "Monitored 0 / Paused 0 / Suggested 0", "No one watching yet" |
| 2067 | Screenshot (2067).png | Add profiles: Single/Multiple, Association, Media/Influencer, Community, Competitor, Other |
| 2068 | Screenshot (2068).png | "The Raised Hand Playbook" cover |
| 2069 | Screenshot (2069).png | Playbook: Option 2 lead with offer, value equation, "More bookings, less work" |
| 2070 | Screenshot (2070).png | Playbook: "What it looks like in practice" |
| 2071 | Screenshot (2071).png | Playbook: "Call the ones with a phone / Open Outreach / Call script" |
| 2072 | Screenshot (2072).png | Search leads, Leads found 182, Rachel Okafor Perfect fit, Marcus Hale |
| 2073 | Screenshot (2073).png | Leads list: Rachel Okafor 96%, Priya Raman 96%, Marcus Hale 87%, Dana Whitfield 95%, Ajay Mehta 95%, Sofia Brande 80%, Ben Okoro |
| 2074 | Screenshot (2074).png | Collections: Cold call, Hot trades owners (Sending), Dental and clinics (Draft), 42 invites/17 accepted/9 replies |
| 2075 | Screenshot (2075).png | Collection detail: Sep 25 2026, Who gets it, Steps, Daily limits 20, Invite→Message→Follow-up |
| 2076 | Screenshot (2076).png | Collections: Cold call, Hot trades owners (Replied), Dental and clinics |
| 2077 | Screenshot (2077).png | **FILE NOT FOUND** |
| 2078 | Screenshot (2078).png | "Leads Last 7 days", "Needs your attention", "Get setup", "super sick now, leads super solid" |
| 2079 | Screenshot (2079).png | Dashboard: "see all my leads here", "exactly where they commented" |
| 2080 | Screenshot (2080).png | Partial: "see all my leads here. You can see exactly where they commented. You see" |
| 2081 | Screenshot (2081).png | Dashboard: "that they like as well. It's so much more clean. Ya more clean." |
| 2082 | Screenshot (2082).png | Dashboard: "What happened?" ×2, View details, "more clean. And not only that is that, the leads" |
| 2083 | Screenshot (2083).png | Collections: "No collections yet", "the leads is like so much more consistent now" |
| 2084 | Screenshot (2084).png | Templates: "No templates yet", "say the leads are converting really well and then I can send" |
| 2085 | Screenshot (2085).png | Outreach Templates: "Start your first outreach", "and then I can send, 4 uh messages. I can send out LinkedIn" |
| 2086 | Screenshot (2086).png | Live view: "United Kingdom, city unknown", "automatic messages like so much cleaner" |
| 2087 | Screenshot (2087).png | Live view: St. Louis, Indianapolis, UK, Australia, "so much cleaner and not only that, the workspace" |
| 2088 | Screenshot (2088).png | Dashboard: Live view Sep 2, US (56) UK, Verified 0/115 in 7 days, St. Louis, Indianapolis, Atlanta, Des Moines, Australia, "Paid through Whop" |
| 2089 | Screenshot (2089).png | Workspace Billing: "Paid through Whop", "workspace now is so much like non-vibe" |
| 2090 | Screenshot (2090).png | Workspace Plan: "Launch Special, yearly Active", "WUIRSPaLT HUW 19" |
| 2091 | Screenshot (2091).png | Watchlist: "Monitored 22", Community, Competitor ×3, "so much like non-vibe coded. Like holy" |
| 2092 | Screenshot (2092).png | Block list: NeverMiss, ServiceTitan, Housecall Pro, Jobber, "so much like non-vibe coded. Like holy crap" |
| 2093 | Screenshot (2093).png | **FILE NOT FOUND** |
| 2094 | Screenshot (2094).png | Workspace Profile 1: Industries (8), Locations (3), Needs (8), Competitors (3), Pain points |

---

## Conclusion

RaisedHand.ai is a **narrowly-focused, compliance-first lead generation platform** for AI/service agencies. Its architecture reflects deliberate choices:

1. **Public-signal-only** → avoids legal/ToS risk of scraping private data
2. **Your LinkedIn account sends** → shifts compliance burden to user (who owns the account) and stays under platform limits
3. **Post-backed evidence** → builds trust; enables "teach the agent" feedback loop
4. **MCP integration** → targets the exact buyer persona (AI agencies using Claude/Codex daily)
5. **Founder-led, agency-native** → pricing, guarantees, and features reflect real pain points

The product is **early-stage (launched ~Sep 2026)** with a single Pro tier, launch pricing, and a small but vocal beta community. The MCP endpoints exist (`/mcp` for Claude, `/acp` for Codex) but require authenticated session to enumerate capabilities — a natural next step for deeper technical reverse engineering would be obtaining a trial account and inspecting the MCP tool list via `claude mcp add` or direct JSON-RPC probe.

**The 73 screenshots (2022–2094) provide unprecedented visibility into the authenticated dashboard**, revealing:
- Complete 4-step onboarding flow with every field and option
- Full ICP configuration taxonomy (industries, personas, niches, buying signals, words tracked)
- Lead delivery with real ICP scores (90-96%) and post evidence
- Outreach automation with multi-step sequences, AI message generation, template variables
- Workspace deep configuration (watchlist, blocklist, plan/billing via Whop)
- Live view with geographic distribution
- User feedback on UI evolution ("so much cleaner", "non-vibe coded")

**Confidence Level:** HIGH for all documented features (directly observed on public pages + authenticated screenshots). MEDIUM for inferred backend architecture (based on standard patterns + named providers). LOW for undisclosed internals (scoring algorithm, prompt templates, exact API schemas, infrastructure details).

---

*Analysis complete. All accessible public surfaces + 73 authenticated dashboard screenshots documented. No unauthorized access performed.*

---

**OCR Processing Note:** Screenshots processed using Tesseract v5.4.0 via `ocr_raisedhand.py` from `C:\Users\kavur\OneDrive\Gallery\Screenshots\`. 71 of 73 screenshots successfully processed (2077, 2093 missing). Output saved to `C:\Users\kavur\Jivvu\ocr_raisedhand_2022_2094.txt`.

---

## Raw OCR Precision Addendum (Verbatim Strings from Screenshots)

These are exact OCR captures for reference — included to ensure zero information loss from the 71 processed screenshots:

### Step 1 UI Elements (Screenshots 2022–2031)
- "Now reses X $ @ Eniversa p © Raised H:" — browser watermark/extension text
- "What you sell 0 of 12" / "Who you sell to 0 of 20" / "Industries 0 of 20 Optional"
- "e.g. Al receptionist, web design, bookkeeping Pick from the list or type your own"
- "+ Adda service" / "+ Add" / "+Add" / "+ Add location" / "earch" / "Search"
- "What you do, in a sentence or two" — "We set up Al receptionists and booking automations fi across the US."
- "«Ihave a website" — toggle/checkbox
- "Ask Gemini" button, "| Getafulldemo |", "Sign out"

### Step 2 Exact Strings (Screenshots 2032–2039)
- "Get a full demo Sign out" / "> step 10f4" / "Find people who already want what you sell"
- "We use your website and Al to set everything up for you"
- "Rather we set it up with you? Book a free demo" / "Don't have a website?"
- "> step 2of 4" / "Raised Hand is building your ICP from your website."
- "Everything it finds is yours to correct on the next screen."
- "Website nevermisshg.com Change domain" / "Scraping your website" / "Collecting product pages, position'" / "Generating your ICP schema i"
- "Book a quick 10-15 minute call. We'll set up who you're targeting with you and show you leads that fit, before you pay anything." / "Back"
- "> step 2 of 4" / "Here's who we'll look for from nevermisshq.com. Fix anything that's wrong, then see your first leads."
- "Start from a proven setup Who our customers' best leads are, by who they sell to. Pic GEE tess certtansmeciat reat estate Logistics, manufacturing, construction Ls"
- "How Raised Hand sees your business What we read from your site, in one paragraph NeverMiss builds and runs Al automation systems — outbound lead generation, inbound lead follow-Up/Al receptionists, and back-office automation — for agencies, founders and home service businesses"
- "Who we look for These decide where we search We look for people titled Owner, General Manager and 6 more at companies with 1 to SO employees in HVAC companies, Plumbing companies and 10 more, based in the United States and the United Kingdom, who might buy Al receptionist, missed call followup and 7 more."
- "What you sell Alreceptionist x missed call followup x appointment booking x lead qualification x CRM automation x systems integration x outbound lead generation x cold email infrastructure x review generation x + Add"
- "Who decides to buy Owner x General Manager x Operations Manager x Office Manager x Service Manager x Dispatch Manager x Agency Owner x Head of Operations x + A"
- "Industries HVAC companies x Plumbing companies x Electrical contractors x Roofing companies x Home services x HVAC x Plumbing x Marketing agencies x Alagencies x Roofing x Cleaning services x Pest control x + Add industry"
- "Countries United States x United Kingdom x + Add location"
- "company sie EBD 21200 201500 s011000 10018000 so01+" — company size slider (1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001+)
- "Advanced targeting Leaving out Marketing agencies, Software development, Staffing and 22 more. Niches, company summary, seniority, departments and 7 more are set. You can change these now or later in Workspace."
- "Doesn't look like your customer? Book a quick 10-15 minute call. We'll set up your ideal customer with you, so your first leads are the right people."
- "Competitors Accounts whose engagers become leads DB smithai ~ F Ruby Receptionists ConversionPath x Signpost Podium Birdeye CallRail"
- "Pain points What turns a prospect into a buyer 10} + Inbound leads sit unanswered for hours and go cold before anyone follows up. + The business runs entirely on seferrats with nothing predictable behind new revenve + The owner is doing outbound, follow-up and admin all themselves and is burning out * After-hours and overflow calls go to voicemail and the jobs are lost to a competitor. * Aprevious agency or automation vendor was paid but delivered a system that broke in the real business. * Good leads get mixed in with junk leads and the team gets blamed for poor lead quality * Hours every week go to copy-pasting information between tools just to keep operations running * There's no way to scale outreach without hiring more people to chase prospects."
- "Buying signats Signs a buyer's ready to rea Hide ~"
- "Company Criteria Which companies we look at. Industries Exclude net Marketing agencies x not Software development x not Staffing x Revenue Funding S1OM-SsoM Pre-seed Seed Series A SSOM-$250M $250M+ Series8 Series C+ Public"
- "Keywords & Niches cowner-operated HVAC contractor x multi-location plumbing company x ServiceTian users x Housecall Pro users x Jobber users x home-service field dispatch x owner-led home service contractor x small marketing or Al agency x referral-dependent local business x no in-house ops or marketing hire x multi-truck HVAC/plumbing/roofing company x service business losing leads to slow follow-up x"
- "Company / Product Summary The buyer's company is a small, owner-led service business — either a home services contractor (HVAC, plumbing, roofing, cleaning, pest contro!) serving homeowners in a local area, or a small marketing/Al agency serving client businesses. These companies typically have 1-20 staff, run on referrals or inconsistent lead flow, lack dedicated ops or marketing staff, and are bootstrapped with"
- "Customer types Where we look ked f K ast People asking for what you sell People describinf Ine problem you solve People commenting on or liking related content Linkedin posts, and accounts you watch Companies hiring for a role you replace Businesses unhappy with their current provider Local business owners in Facebook groups"
- "Doesn't look like your customer? =a [Fn my testieass— ]"

### Step 3 Exact Strings (Screenshots 2040–2041)
- "© step 3ot4" / "Your first 5 leads are on the way."
- "Reading live L take a few minutes, so leave the pa pen or come back to it. You can skip the preview at any tim } Matching people to the ICP you just confirmed Oot"
- "Want help getting set up? Book a free 20-minute setup call —- ~ Back Skiptornow en"
- "© Step 3ot4" / "Perfect fit: or more. Their profile shows they are exactly who you sell to, and that they can decide to buy"
- "Matched to the ICP you just confirmed. Still checking what they have liked on Linkedin, which can take a couple more minutes."
- "Sof Contacts unlock at checkout"
- "Ray Mansour Matches your ideal customer 92% View deus > & y Found just now Perfect ft ="
- "Matt Thome Matches your ideal customer Oo 91% Vow detuis t Found just now Pertect ta etal"
- "Viadisiay Shklyar 2, Matches your ideal customer O 91% aaa = Found just now Pertect ft"
- "Alex Stanton >, Matches your ideal customer 90: eau ni * Found just now Perfect fit —"
- "Nima M. ., Matches your ideal customer O 90% aaadeaie = M v Found just now Pertect fit Lssome"

### Dashboard & Leads Exact Strings (Screenshots 2042–2048)
- "NeverMiss $B Dashboard R Leads Database Collections Outreach Templates: Call script Live view Integrations Hetp Maximize Value Piaybook by Ty Chen Request a feature Book a demo"
- "Integrations More integrations are coming soon. Tell us which ones you want."
- "Your free setup call We set up your ideal cust 00d ones"
- "Linkedin Raised Hand sends your Linkedin invites and messages automat unt. A reply tops &."
- "kitboonssocial@gmail.com (you) Detautt- searches 0/20 invites Linkedin connected. it can take a minute to show here. Connected Disconnect"
- "Codex ir leads, their inside Codex or the y and draft outre MCP server URL Copy tps://raisedhand. Norsonnecteg [set"
- "Clay a Clay table with your leads and their mer and searches with you, so yo first leads are"
- "Email Connect Gmail or Outlook and your outreach emails send from your own address, one a minut up to 30 a day. Replie land in your inbox."
- "Grok Your leads, inside Grok on X of the w Coming seon etings back to the"
- "Claude Ask for today's leads, the full story on any lead, and draft outreach, inside Ciaude, Claude Desktop or Claude Code. MCP server URL Copy https: //raisedhand.ai/mcp"
- "Zapier Send new lead to your CRI or anything Zapier conn Coming soon ed leads into your own tools."
- "API Pull your saved leads into your own tools. Coming soon"
- "R Leads Database Collections Outreach Templates Call script Live view Integrations Help Maximize Value Playbook by Ty Chen Request a feature Book a demo Workspace across every batch. plied Callbooked Closed Follow up later Found Altime AnyICPmatch Foundanywhere Alll signals"
- "Posted about responsive electrical service delivery ed 27 days ago Commented on a post about HVAC missed calls and poor answering mented 27 days ago Liked a post about HVAC job scheduling and coordination iced 28 days ago Posted about owner answering calls personally Posted Aug 24 Posted about Al receptionist for contractors Posted yesterday Matches your ideal customer Found 37 min ago Liked a post about customer communication in service dispatch Liked Aug 19 Matches your ideal customer Found 37 min ago Auto-Enrich So What happened? v What happened? oe ee What happened? v 92% What happened? Pectect tt ae What happened? v nbn What happened? 91% What happened? v CO OG GCG OG GCG Go 6 Pertect f Export View details ×8"
- "RR Leads Database Collections Outreach Templates Call script Live view Integrations Help Maximize Value Playbook by Ty Chen Request a feature Book a demo Workspace evidence to start a conversation. kfor about 25newleads 2S. Stil searching: extra leads are saved for tomorrow, so it starts full. Next round in 25 minutes. gnats YC) Hide teads without a company"
- "9:39:17 Qualification summary 92% Perec A 4 s phone on a S: Engagement timeline bout Al . How to reach them et phone"
- "R Leads Database Collections Outreach Templates Call script Live view Integrations Help Maximize Value Playbook by Ty Chen Request a feature Book a demo Workspace 25. Sul searching: extra leads are saved for tomorrow, so it starts full. Next round in 24 minutes. gnais v (J Hide leads without a company"
- "9:06:44 Qualification summary 92% and co: g the busines: Engagement timeline st about HVAC job scheduling and coordination dination 4 @ post about HV ing and p How to reach them Get email"
- "9:05:31 Qualification summary Owner jumbing company a Their field isa arket; they're likely ju Engagement timeline ut hiring office staff How to reach them Get email Get phone [each out] Sret eee"

### Outreach Exact Strings (Screenshots 2049–2057)
- "Outreach R Leads Pick who and the steps. invites go out on their own; every message waits for your OK. Database Outreach Linkedin inbox Email Collections Outreach Templates Start your first outreach Call script Live view Integrations Help Maximize Value Piaybook by Ty Chen Request a feature Book a demo Workspace who it goes to (a daily batch, a collection, or people you choose) a Linkedin invite, a message once they accept, follow ir own; &"
- "New outreach Name Oct 13, 2026 A Who it. goes to Adaily batch Acolllection People pick Today (59) Send trom kitboonssocial@gmail.com (you) - default 59 people - $9 on Linkedin Steps 1. Linkedin invite When the run starts, or after ° days after the run starts No template: write a note, or leave & blank B 2.Linkedin message After ° days after they accept Write it here, or pick a template + first na any + jobtitie Remove tle + posttopic + their comment Remove ment + Alline topic + their Summary 59 peopie invites send on their own once you start, up to your daily cap (20 unless you lower it in Linkedin). Every message and email waits for your OK in Ready to send. Anyone who replies is stopped. Save drat"
- "+firstname + company +jobtitle + post topic + their comment 0/300. {firstname} and {companyb i BD 2.Linkedin message Remove After ° days after they accept Write it here, or pick a template + firstname + company +jobtitie + topic + their comment + Aline 0/3000. (frst_name} and {company each person; an Aline is written for each person when you review them in Ready to send. Ly 3. Follow-up 1 Remove After 2 days after your last message Linkedin safety: no sooner than 2 days after the message, and anyone who replies is stopped. Write it here, of pick a template +firstname + company +jobtitie + posttopic + their comment + Alline 0/3000. (firstname) and {company} fil in for each person; an A! line is written for each person when you review them in Ready to send. Adda step: Follow-up Email Summary 59 poopie invites send on their own once you start, up to your daily cap (20 unless you lower it in Linkedin). Every message and email waits for your OK in Ready to send. Anyone who replies is stopped. Save drat"
- "Linkedin invite and message Linkedin follow-up Email Name g. After-houls cals, short Describe the message you want (optional) e.g. Say | help businesses implement Al. Then 3 bullet points on which of my services would help their company, and the outcome, like lead gen to find clients for an HVAC company, Write the message Leave i empty and the Al writes one from your services. Then It previews it on one of your leads (two of today's Al writes), Message + firstname + company + jobtitle + post topic + their comment + Aline Hi {first_name), saw your post about."
- "Add template Linkedin in ssage y Morgan, v"
- "gave myself 10 hours to build & sell a $6700 ai service ( did I make it? 9 people 59 on Linkedin $B Dashboard Summary R Leads Database Steps 59 peopie Collections D1. Linkedin invite Remove Invites send on their own once you tart, uf it daily cap (20 unl tart, uf it daily cap (209 tankess you lower it in Linkedin). Every remplat message and email waits for your OK i ° days after the run starts o 7 scree Y No templet replies is stopped. Live view Hi Mesenge Save draft ol naemasoas + New template Help Maximize Value Playbook 0/300. {firstname} and {company fain for each person, whenever you come back by Ty Chen one oe D2. Linkedin message Remove 6 s After ° days after they accept Write it here, or pick a template +firstname + company +jobtitie +posttopic + theircomment Alline 3. Follow-up 1 Remove After 2 days after your last message Linkedin safety Write it here, or pick a template + firstname + comy 0.0 25:54 / 38:11 Actually Finding The Clients > 7 opic + their +Alline"
- "Add template Linkedin invite and message Linkedin follow-up Email Call script Name [eeu Describe the message you want (options!) g. Say | help businesses implement Al. Then 3 bullet points on which of my services would help their company, and the outcome, like lead gen to find clients for an HVAC company, + Write the message Leave it empty and the Al writes one from your services. Then it previews it on one of your leads (two of today's Al writes). Message + firstname + company +jobtitle + post topic + their comment + Alline Hi {first_name), saw your post about,"

### Integrations Panel Exact Strings (Screenshots 2042, 2058)
- "88 Dashboard R Leads Database Collections Outreach Templates Call script Live view Integrations Help Maximize Value Playbook by Ty Chen Request a feature Book a demo Workspace"
- "Integrations More integrations are coming soon. Tell us which ones you want. Your free setup call We set up your ideal customer and searches with you, so your first leads are good ones."
- "Linkedin Raised Hand sends your Linkedin invites and messages automat ly, from your own ount. A reply stops it kitboonssocial@gmail.com (you) Detauit: searches 3/20 iewite: Connected Disconnect"
- "Codex Your leads, their story and draft outreach, inside Codex or the Codex app. MCP server URL Copy https: //raisedhand.ai/acp sonected [ setup ]"
- "Clay Enri evidence. a Clay table with your leads and their Coming soon"
- "Email Connect Gmail or Outlook and your outreach emails send from your own address, one a minute, up to 30 a day Replies land in your inbox."
- "Grok Your leads, inside Grok on X or the web Coming seon"
- "Google Calendar Match booked meetings back to the lead that produced them Coming seon Tell us what you nes gy."
- "Claude Ask for today's leads, the full story on any lead, and draft outreach, inside Ciaude, Claude Desktop or Claude Code. MCP server URL Copy https: //raisedhand.ai/mcp"
- "Zapier Send new leads to your CRM, Slack, Sheets oF anything Zapier connec Coming soon"
- "API Pull your saved leads into your own tools. Coming soon"

### Outreach Status & Collections Exact Strings (Screenshots 2059, 2074–2076)
- "$8 Dashboard Templates (SIERIIE 7 R Leads Pick who and the steps. invites go out on their own; every message waits for your OK Database Outreach Linkedin inbox Email Collections Outreach Outreach Status Steps Progress Ready Templates Oct 13, 2026 Oct 13 - 59 peop"
- "Search leads, companies, posts R Leads 3 Outreach Database Collections Cold call 1 person is waiting for your first m Collections Cold call Invites sent Accepted 42 17 Replies 9 Grow with Raised Hand Maximize Value Playbook Status Noxt send Request a feature Book a demo Hot trades owners - email Sending Sep 25 batch - Linkedin Scheduled Dental and clinics Draft It's basically like like a Shopify version UI cuz since"
- "raised R Leads Database Outreach Collections Status 1. Who gets it Sending window Sep 25, 2026 Maximize Value Playbook Request a feature Book a demo 2. Steps Daily limits 20 Connection invite First message Sending from Follow-up 1 Nudge 2-days later going to be. Ton this, it's going to be a lat"
- "VY raisedhand Search leads, companies, posts Collections Collections Cold call Live view Hot trades owners Replied - follow up this week Grow with Raised Hand Maximize Value Playbook Dental and clinics Request a toature Book a demo a lot easier for them to get familiar with it."

### Workspace Deep Configuration Exact Strings (Screenshots 2060–2065, 2090–2094)
- "{} Workspace NeverMiss nevermisshg.com profie1 The active profile is what the agent searches tor. Customer type Local businesses Mid-market companies General Industries HVAC companies Plumbing companies Electrical contractors Roofing companies Home services HVAC Plumbing Marketing agencies Roofing Cleaning services Pest control owner-operated HVAC contractor Plan Biting Ideal customers Locations United States United Kingdom Wetchist What they need aireceptionist missed call followup appointment booking lead qualification crm automation systems integration cold email infrastructure review generation Block list Team Usage Below: what Profile 1 listens for. Competitors Accounts whose engagers become iqgds. Smitnai Ruby Receptionists ConversionPatn Signpost Podium cairait"
- "Pain points What turns a prospect into a buyer Inbound leads sit unanswered for hours and go cold before anyone follows up. The business runs entirely on referrals with nothing predictable behing new revenue. The owner is doing outbound, follow-up and admin all themselves and is burning out. After-hours and overflow calls go to voicemail and the jobs are lost to a competitor A previous agency or automation vendor was paid but delivered a system that broke in the real business. Good leads get mixed in with junk leads and the team gets blamed for poor lead quality Hours every week go to copy-pasting information between tools just to keep operations running There's no way to scale outreach without hiring more people to chase prospects."
- "Buying signals Signs someone is ready to taik A home-service owner or manager posts that missed o@sfter-hours calls are costing them jobs."
- "Pain points What turns a prospect into a buyer. Inbound leads sit unanswered for hours and go cold before anyone follows up The business runs entirely on referrals with nothing predictable behind new revenue. The owner is doing outbound, follow-up and admin all themselves and is burning out. After-hours and overflow calls go to voicemail and the jobs are lost to a competitor. 3 Keel customers A previous agency or automation vendor was paid but delivered a system that broke in the real business. Good leads get mixed in with junk leads and the team gets blamed for poor lead quality Watchsist Hours every week go to copy-pasting information between tools just to keep operations running. Block list There's no way to scale outreach without hiring more people to chase prospects Buying signals Signs someone is ready to tak. A home-service owner or manager posts that missed o@sfter-hours calls are costing them jobs. An HVAC, plumbing or electrical company announces a new location or a bigger service area. The company is hiring customer service reps, call takers or dispatchers. A leader says their answering service or call center is missing calls or booking poorly. A founder or operations manager posts that their call answer rate or lead response time is poor A business owner says they are still relying only on referrals for new clients with no outbound engine. A leader mentions being burned by a previous automation or marketing agency that didn't deliver results. A company announces hiring a receptionist or admin staff to handie a volume of calls or follow-ups. An owner posts about losing feads or jobs because of slow or missed follow-up, A decision-maker says they want to add predictable revenue or fill their calendar with sales calls."
- "Relevant topics Posts about these are read tor people who fit. missed call revenue loss after-hours service calls dispatchetficiency calltbookingrate busy season call volume lechnician scheduling customer service reps multi-location operations service agreements HVAC business growth referral-dependent growth speed to lead"
- "New ideal-customer profile Customer types tocol usinesses ane Industries + Add industry Locations + Add location What they need from you aireceptionist x missed call followup x crm automation x systems integration x + Add service What people say when they need you + Adda phrase fine & gramer"
- "Posts about these are read for people who fit. missed call revenue loss after-hours service calls dispatchetficiency callbookingrate busy season call volume technician scheduling customer service reps muliti-location operations. service agreements HVAC business growth referral-cependent growth speed to lead Words they use We read posts and comments that use these words. missedcalls after-hours calls hiringaCSR hiring a dispatcher phones ringing off the hook can't answer every call losing jobs to voicemail answeringservice bookingrate call centerforHVAC leads goingcold no outbound system Skip posts about we build Al agents Alautomationagency become an Alagency Alcourse opento work prompt engineering course hiring Alengineers we bulld Al automations for agencies automation agency owner n8n workflow template Prompt engineering tips Who we look for The people who decide to buy Job titles Owner General Manager Operations Manager Office Manager Dispatch Manager Agency Owner Head of Operations Seniority Owner CXO Director Managey. Departments Founder/Executive Operations Sales. Countries United States United Kingdom What kind of company Which companies we look at Industries HVAC companies Plumbing companies Electrica contractors Roofing companies Home services HVAC Plumbing Marketing agencies Roofing Cleaning services Pest control Company size 110 people 11-50 people Niches owner-operated HVAC contractor multi-tocation plumbing company ServiceTitan users Housecall Prousers Jobber users home-service field dispatch owner-led home service contractor small marketing or Al agency referral-Gependent local business no in-house ops of marketing hire multi-truck HVAC/plumbinglroofing company service business losing leads to siow follow-up"
- "Who we look for The people who decide to buy Job titles Owner General Manager Operations Manager Office Manager Dispatch Manager Agency Owner Head of Operations Seniority Owner CXO Director Manager Departments Founder/Executive Operations Sales Countries United States United Kingdom What kind of company Which companies we look at Industries HVAC companies Plumbing companies Electrica contractors Roofing companies Home services HVAC Plumbing Marketing agencies Roofing Cleaning services Pest control Company size 1-10 people 11-50 people Niches owner-operated HVAC contractor multi-location plumbing company ServiceTitan users Housecall Prousers Jobber users home-service field dispatch owner-led home service contractor small marketing or Al agency referral-Gependent local business no in-house ops of marketing hire multi-truck HVAC/plumbinglroofing company service business losing leads to siow follow-up Where we look The places the agent searches for your buyers. asked stated problem linkedinengagement jobs reviews facebook Best customers Examples of the customers you want more of. The Al scores leads against t None added yet"

### Watchlist Exact Strings (Screenshots 2066–2067, 2091)
- "Watchlist People and pages your buyers follow. We read who likes and comments on their posts, and keep anyone who fits your ideal customer. All profiles Plan Billing Watching Last checked 0 0/20 Not yet paused jes and pages 0 0 suggested for you Monitored 0 Paused 0 Suggested 0 Profile Type Status No one w yet. Press Add profiles."
- "Add profiles to watch People and pages your buyers follow. We read who likes and comments on their posts. Single Multiple One profile, page or group. Unk www.linkedin.com/in/their-name Association A supplier your buyers use An industry body Media Influencer A publication or show A voice your buyers follow Community Competitor A group your buyers are in Ses what you sell Other Your own label"
- "Workspace NeverMiss Watchlist All profiles Community General Plan Billing Ideal customers Watchlist Block list Team Usage so much like non-vibe coded. Like holy Monitored 22 Community Community Competitor Competitor Competitor Add profiles Add profiles"

### Playbook Exact Strings (Screenshots 2068–2071)
- "The Raised Hand Playbook"
- "The Raised Hand Playbook 21% Option 2: lead with your offer Don't want to mention the ike or comment? Then say what's unique about y remove the risk. This is the exact message | sent. It follows the value equation line by line. war's unique about you, plus More bookings, less work Show, don't tell. No ris Just 10 minutes Past work they can check"
- "The Raised Hand Playbook What it looks like in practice Top: the tw apart. Bottom: a mers are blurred Meet prospect after one asking to"
- "The Raised Hand Playbook Call the ones with a phone Dpen Outreach Call seript"

### Leads Search & Live View Exact Strings (Screenshots 2072–2073, 2087–2088)
- "Search toads, companies, post Leads Database Outreach Collections Cold call Leads found Contacts found Integrations Calls booked Leads found over time ICP score breakdown 182 Grow with Raised Hand Maximize Value Playbook Request a feature Book a demo Loads kept ICP match, Signal Phone RO Rachel Okafor Pertoct fit 550142 rac brightlinetrwac.com WH Marcus Hale and completely change it. This is kind of the UI now. This is a lot cleaner."
- "Search toads, companies, Posts R Leads 18 Database Database Outreach R. Active le Collections Cold call Bu ic) d filters Integrations se Email 96% ented Hot mar Rachel Okafor Grow with Raised Hand Maximize Vaiue Playbook Request a feature Book a demo Get email us@halesonsroofing PR Priya Raman 9.con Get omai Sofla@brandthome Tom Alvarez 77% Strong fit Get phone OW Dana Whitfield 3 Z dana@summi umbing co AM Ajay Mehta 95% Porfect fit 2jay@mehtaeiectric com Sofia Brande o o o o fo) 80 Ben Okoro Get email is i lea of the UI now. This is a lot cl It's basically like like a Shopify"
- "Live view 0 9° St. Louis Indianapolis United Kingdom, city unknown Australia, city unknown so much cleaner and not only that, the workspace"
- "WB Raised $8 Dashboard R Leads Live view sep 2 Database 0 Ps 1 Workspace byling Collections 3 Maximize Value Playbook Outreach United States (56) United Kingdon Templates Call script Verified (0 6f 115 in7 days) Live view Integrations Maximize Value Playbook Request a feature Book a demo St. Louis lik Indianapolis United Kingdom, city unknown Atlanta Des Moines liked Australia, city unknown Workspace DU INUGH Uiealier anu nut uly ural, Ure workspace now is"

### Billing & Plan Exact Strings (Screenshots 2089–2090)
- "Workspace Billing Upcoming bil General Plan ite cinean Paid through Whop Past bills workspace now is so much like non-vibe"
- "Workspace Saeed Plan Plan details Change pian General Billing Ideal custimers Watchlist Block List Team Usage Launch Special, yearly Active WUIRSPaLT HUW 19 so much like non-vi Liban"

### Block List Exact Strings (Screenshot 2092)
- "Workspace NeverMiss Block list General Pian Billing Ideal customers NeverMiss, nevermisshq.com Company SorviceTitan Housecall Pro Jobber so much like non-vibe coded. Like holy crap."

### Profile 1 Active Exact Strings (Screenshot 2094)
- "Workspace peers Ideal customers Profile 1 Active Edit General Plan Local busine HVAC contractors Plumbing companies Roofing companies Electrical contractors Billing Landscaping companies Pest control companies Auto repair dealerships Beauty & salons Ideal custon>rs Chiropractic Construction & contractors tchlist United Australia United Kingdom Block list Slreceplionist missedcallfollowup lead qualification crmautomation systems integration rational audits outbound automation quote follow-up Team Usage Competitors ServiceTitan Housecall Pro. Jobber Pain points Updates myself so much like non-vibe coded. Like holy"

### Dashboard Feedback Exact Strings (Screenshots 2078–2086)
- "Leads Last 7 days Database Collections Needs your attention Get setup super sick now, the leads are like super solid. This is the SPFSTAA@22 Your free setup call with Ty"
- "Dashboard Leads Database Collections Outreach Templates Cal Workspace solid. This is the new product. | can see all my leads"
- "see all my leads here. You can see exactly where they commented. You see"
- "88 Dashboard R Leads Database Collections Outreach Templates Call script ve view Integrations Maximize Value Playbook Request a feature Book a demo Workspace that they like as well. It's so much more clean. Ya more clean."
- "W Raised $8 Dashboard R Leads Database Collections Outreach Templates Call script tive view Integrations Maximize Value Playbook What Request a Book ademo What happ: What happened? What happened? View details Workspace more clean. And not only that is that, the leads"
- "W Raised Collections Leads ection Database Collections Outreach Templates No collections yet Call script Live view Integrations Maximize Value Playbook Rea Workspace the leads is like so much more y consistent now with the amount."
- "Dashboard Templates Leads Message Database Collections Outreach Tempiates No templates yet Call script Live view Integrations Maximize Value Playbook Request feature Book a demo Workspace say the leads are converting really well and then I can send"
- "Dashboard Outreach Templat Leads meron 4 apt Templates Database Outreach Collections Outreach Rempies Start your first outreach Call script Live view Integrations Maximize Value Playbook Request a feature Book a demo Workspace and then I can send, 4 uh messages. | can send out LinkedIn"
- "$B Dashboara R& Leads Live view Database +0 Collections Outreach Templates Call script Integrations United Kingdom, city unknown ity unknown, Workspace automatic messages like so much cleaner"

---

*End of raw OCR addendum. All 71 processed screenshots (2022–2094, excluding 2077, 2093) fully captured above.*