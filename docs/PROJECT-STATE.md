# PROJECT-STATE.md — WinThread
Last updated: 2026-11-16
Rule: Paste this file at the start of every new Claude chat. Do not paste old chat history.

## 1. Product (one sentence)
WinThread finds public buying signals, helps a human send approved outreach, closes the deal with a quote and invoice (or syncs to the user's CRM), and learns from every outcome to improve future lead scoring.

## 1b. Company thesis (hypothesis, not fact)
- Company thesis: the outcome-data loop is the asset. Screens, scrapers and quote builders can be copied. Data on which actions become paid revenue cannot.
- The 5-stage path is a hypothesis. Each stage is a go/no-go gate.
  - Stage 0: 10 paying agencies.
  - Stage 1: 1,000 customers, about USD 1M ARR.
  - Stage 2: about USD 10M ARR. Agencies resell to their clients (white-label). Voice fits here.
  - Stage 3: about USD 100M ARR. Revenue OS for small businesses (leads, calls, WhatsApp, GST invoicing, collections, Indian languages).
  - Stage 4: platform scale (invoice payments and financing, APIs, partners).
- Edge: India depth (GST, DPDP, TRAI, languages) plus consented, anonymized outcome data across customers.
- Threat: big CRMs buy signal tools (HubSpot bought Trigify and Warmly in 2026). Protect with outcome data, local depth and distribution.
- Revenue levers in order: flat plan, usage credits, agency/white-label plans, voice minutes, take rate on collected invoices (needs payments licensing).
- Distribution: founder content (@build_together.ai), free no-signup tools for search traffic, agencies as a channel, affiliate program.
- Weekly rhythm: ship weekly, talk to 5 users weekly, track retention and paid conversion, cut unused features.
- No guarantee of any outcome. Nobody can promise USD 100B.

## 2. Target user
Founders of small B2B agencies (2 to 15 people): AI automation and marketing agencies. India first, then US/UK.

## 3. Locked decisions
- D1. Outreach in Phase 1 = human click-to-send (deep links with message copied). No background auto-sending.
- D2. Contact data = public extraction + user's own API key (BYOK). Platform pays no enrichment cost.
- D3. First niche = AI automation and B2B marketing agencies.
- D4. Voice agents (Outpero-style) = NOT in Phase 1. Keep voice-ready columns: phone_e164, consent_status, call_script_vars.
- D5. Cut from MVP: /attribution dashboard, Watchlist, public SEO tools, project Kanban, payroll, vault, APK.
- D6. Loss reasons split in two: Lead Fit Failure (lowers discovery weight) and Execution Failure (does NOT lower weight; flags quote/outreach/script).
- D7. Build Mode A first (built-in deal + quote + GST invoice). Mode B (external CRM connector) is deferred until a paying user asks.
- D8. Docs: use only PROJECT-BRIEF, MVP, PRD, ARCHITECTURE (with ADRs), DATABASE, PROJECT-STATE. Skip the other governance files until there are paying users.
- D9. Timeline: plan 4 to 6 weeks (not 14 days). Do not cut quality or tests to hit a date.
- D10. UI: shadcn/ui + Radix + Tailwind as the main layer (best AI-model accuracy). Test Astryx on one screen before adopting. Astryx is beta.

## 4. OPEN decisions (must answer before PRD is final)
- O1. SIGNAL SOURCE (highest risk). LinkedIn's User Agreement bans scraping, bots, crawlers and unauthorized automation, including public data. Do NOT scrape LinkedIn.
  Candidate sources to evaluate: user-pasted post URLs, Reddit official API, job-board APIs, Google search, public company sites, a licensed data provider later.
  Unknown: how RaisedHand gets LinkedIn data. Do not copy it without proof.
- O2. Pricing ladder (draft): Solo INR 1,999 / Agency INR 7,999 / Pro USD 199. Not validated.
- O3. Is "agencies will log outcomes in one tool and pay" true? Needs 5 customer calls and 5 paid pilots.

## 5. Verified facts (checked 2026-11-16)
- Trigify team joined HubSpot, announced 2026-09-23. Standalone access wound down. API and signal collection stopped 2026-10-22.
- HubSpot also acquired Warmly (2026-06-30). Gemini's claim that Warmly is independent is wrong.
- Meta Astryx: open source (MIT), public beta, released 2026-06-28, 150+ components.
- India DPDP Rules: notified Nov 2025. Consent and notice duties take effect 2027-05-13.
- LinkedIn User Agreement: bans scraping and bots.

## 6. NOT verified (do not rely on)
- Salesforce acquired Qualified (April 2026)?
- Zoom acquired Common Room (July 2026)?
- All competitor prices in the Gemini chat.
- The "99%/75% AI accuracy" numbers for design systems.
- The "5 qualified replies" benchmarks and Precision@10 targets are goals, not facts.

## 7. Proof tests (outside people, not us)
1. 5 strangers pay within 14 days of launch.
2. 40% of pilot users log at least 5 outcomes (quoted, won or lost).
3. Zero account bans or platform complaints.
4. Top-10 lead conversion in week 6 beats week 1 on real data.

## 8. Revenue reality check
USD 39 per month means about 213,000 paying workspaces for USD 100M ARR. Path must include higher ARPA (agency plans), usage credits, then voice and CRM connectors. Milestones: 10 -> 100 -> 1,000 customers.

## 9. Known risks (priority order)
1. Legal source risk (O1).
2. No customer proof yet.
3. Revenue math needs higher ARPA.
4. Beginner timeline. Build in small vertical slices.
5. Big CRMs absorb signal tools. Edge = India GST, small agencies, fast outcome learning.
6. Outreach law: US/UK email and privacy rules, India TRAI for calls, DPDP notice at signup.
7. Learning loop needs data. Plan pooled, consented data later.
8. Free models can change or ban. Keep a paid fallback budget.

## 10. Build workflow (no overlap)
1. Define: PROJECT-BRIEF, MVP (v2 already written). Goldfish review: /egm:egm-review.
2. Specs: PRD, ARCHITECTURE (ADR per big choice), DATABASE. Review again.
3. Tickets: /mattpocock-skills:to-tickets.
4. Build each slice: failing test first (superpowers TDD), then implement, then npm run build and npx tsc --noEmit.
5. Review: apple-design-skill for UI (desktop utility style, no glass blur), /egm:egm-drift-report for spec drift.
Model roles: strong model (Nemotron Ultra) for schema, SQL, server logic. Fast model only for CSS and boilerplate. Remove Flash-Lite from core coding.
Use craft-anything / rea only on ONE specific screen or payload at a time. The three REA files already exist in the repo.

## 11. Repo state
- Next.js app "winthread" created.
- Installed: @supabase/supabase-js, @supabase/ssr, zod, lucide-react.
- Docs saved: docs/PROJECT-BRIEF.md, docs/MVP.md (update MVP to v2 and apply D5, D7, D9).
- Not built yet: any screen, migration, or auth.

## 12. Next 7 days
1. Update MVP.md to match section 3.
2. Do 5 agency-owner calls. Record answers in docs/customer-notes.md.
3. Decide O1 (signal source) with the research above.
4. Write PRD.md. Every requirement needs ID, acceptance test, verification method.
5. Run /egm:egm-review on PRD. Fix findings.
6. Write ARCHITECTURE.md and DATABASE.md. Keep voice-ready columns tied to the Call Script screen.
7. Start Slice 1: auth + workspace + setup wizard, with RLS tests.

## 13. PRD review checklist
- Each requirement: ID, user value, priority, owner, acceptance test, verification method.
- No requirement depends on LinkedIn scraping.
- Voice columns trace to a Phase 1 user journey (Call Script screen).
- Mode B marked "later".
- Each screen has loading, empty, error and unauthorized states.
- Free-model limits and per-workspace LLM caps written down.
- DPDP notice in the signup flow.
- Kill rule and success rule written with numbers.

## 14. How to use Claude chat (free plan)
- One topic per chat. Attach only this file plus the one doc under review.
- Ask for one deliverable per message.
- Use coding agents for building. Use Claude chat for decisions, reviews and stuck bugs.

## 15. Starter message for the next chat
"Here is PROJECT-STATE.md. Current task: [one task]. I attach [one file]. Review it against the checklist in section 13 and list the top 5 problems in priority order."
