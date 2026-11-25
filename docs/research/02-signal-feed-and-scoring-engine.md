# Deep Research & Technical Specification: Feature 02 Signal Ingestion & Scoring Engine
**Document Identifier:** RESEARCH-FEATURE-02-MDIE-2026-11-24  
**Status:** Approved Architectural Research  
**Author:** Chief of Staff & System Architect  
**Primary Sources:** Algolia HN API (`hn.algolia.com`), Bluesky XRPC (`public.api.bsky.app`), Reddit API Guidelines (`reddit.com/dev/api`), Supabase PostgreSQL Schema.

---

## 1. Executive Summary

Feature 02 transforms WinThread from a static setup wizard into an **active, real-time B2B Client Acquisition Operating System**. It continuously ingests social conversations across **Hacker News**, **Bluesky**, and **Reddit**, filters out the 90%+ noise in Tier 1 ($0 compute), scores candidate intent in Tier 2 via our Multi-Dimensional Intent Engine (MDIE), and renders explainable lead cards on `/threads` with 1-click proposal generation and Bayesian weight refinement.

To prevent explosive network costs and account bans, WinThread implements **Decision 8 (Shared Ingestion Pool)**: one unified background ingestion loop writes to `raw_signals`, and per-agency scoring evaluates candidate signals against tenant `icp_profiles` without redundant external queries.

---

## 2. Channel Ingestion Protocols & Rate Limit Matrix

Our research into first-party endpoints established the following operational boundaries:

### 2.1 Hacker News (Algolia Search API)
* **Endpoint:** `GET https://hn.algolia.com/api/v1/search_by_date`
* **Authentication:** None required (Public read).
* **Rate Limits:** **10,000 requests per hour per IP** (effectively unlimited for our polling cadence).
* **Target Tags:** `tags=story,comment` with query terms (e.g. `"looking for agency"`, `"recommend cold email"`, `"build chatbot"`).
* **Delta Ingestion:** Uses `numericFilters=created_at_i>${last_poll_timestamp}` to retrieve only new items.
* **Payload Reliability:** 100% structured JSON returning `author`, `comment_text`, `story_title`, `story_url`, `created_at_i`, and `objectID`.

### 2.2 Bluesky (AT Protocol XRPC)
* **Endpoint:** `GET https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts`
* **Authentication:** None strictly required for public read queries via AppView.
* **Rate Limits:** **3,000 requests per 5 minutes per IP** shared across read operations.
* **Query Format:** `?q=${encodeURIComponent(signalKeyword)}&limit=50&sort=latest`
* **Defensive Practice:** Apply 1.5-second request jitter and exponential backoff on HTTP 429.
* **Payload Reliability:** Returns `uri`, `cid`, `author.handle`, `author.displayName`, `record.text`, `record.createdAt`, and engagement counts (`replyCount`, `likeCount`).

### 2.3 Reddit (JSON & RSS Endpoints)
* **Endpoint:** `GET https://www.reddit.com/r/${subreddit}/new.json?limit=25`
* **Authentication:** Unauthenticated `.json` scraping (or authorized OAuth app).
* **Rate Limits:** **10 requests per minute (RPM) per IP**; strict IP block if violated.
* **User-Agent Requirement:** Must declare standard format: `<platform>:<app_id>:<version> (by /u/<username>)`. Default scrapers (`curl`, `requests`) receive immediate HTTP 403 Forbidden.
* **Target Subreddits:** `/r/smallbusiness`, `/r/startups`, `/r/SaaS`, `/r/entrepreneur`.
* **Architectural Invariant:** Polled on a 120-second cadence across subreddits; never polled ad-hoc per user.

---

## 3. Database Topology: The Shared Signal Pool

To eliminate redundant scraping, the database topology separates global raw signals from tenant-specific scored leads:

```
                  ┌────────────────────────────────────────┐
                  │    External Social Firehose / Poller   │
                  │   (Hacker News, Bluesky, Reddit RSS)   │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │         raw_signals (Global Pool)      │
                  │  • external_id (Unique per platform)   │
                  │  • source ('reddit'|'hackernews'|...)  │
                  │  • title, content, author, url         │
                  │  • created_at, ingested_at             │
                  └───────────────────┬────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 │                                         │
                 ▼ (Evaluate against Workspace A)          ▼ (Evaluate against Workspace B)
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │ threads (Workspace A)     │             │ threads (Workspace B)     │
   │ • match_score: 94%        │             │ • match_score: 42% (Drop) │
   │ • match_reason: "..."     │             │                           │
   │ • status: 'new'           │             │                           │
   └───────────────────────────┘             └───────────────────────────┘
```

### Table Contracts:
1. **`raw_signals`:**
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `source TEXT NOT NULL` (`'reddit'`, `'hackernews'`, `'bluesky'`)
   - `external_id TEXT NOT NULL` (e.g. `hn-42318890`, `bsky-at://...`)
   - `title TEXT`, `content TEXT NOT NULL`, `author TEXT`, `thread_url TEXT NOT NULL`
   - `published_at TIMESTAMPTZ NOT NULL`, `ingested_at TIMESTAMPTZ DEFAULT now()`
   - `UNIQUE(source, external_id)`
2. **`threads` (Workspace Tenant Leads):**
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE`
   - `raw_signal_id UUID REFERENCES raw_signals(id) ON DELETE SET NULL`
   - `source TEXT NOT NULL`, `external_id TEXT NOT NULL`
   - `author TEXT`, `title TEXT`, `content TEXT`, `thread_url TEXT`
   - `match_score INTEGER NOT NULL` (0–100)
   - `match_reason TEXT NOT NULL`
   - `status TEXT NOT NULL DEFAULT 'new'` (`'new'`, `'approved'`, `'dismissed'`)
   - `dismissal_reason TEXT` (`'wrong_persona'`, `'no_budget'`, `'competitor'`, `'not_in_market'`)
   - `proposal_id UUID REFERENCES quotes(id)`
   - `UNIQUE(workspace_id, external_id)`

---

## 4. The 3-Tier Multi-Dimensional Intent Engine (MDIE)

### Tier 1: Fast Lexical & Negatives Gate ($0 Compute)
Before any heavy scoring or LLM inference:
1. **Negative Keyword Exclusion:** If `content` or `title` contains any of the agency's `negative_keywords` (e.g. `job`, `intern`, `hiring`, `free`, `course`), the post is immediately discarded ($S_{\text{match}} = 0$).
2. **Length & Quality Gate:** Discards posts with $< 15$ words or containing spam link patterns.
*Performance:* Drops 80–90% of raw social chatter in $< 1\text{ms}$ per post.

### Tier 2: Multi-Dimensional Scoring Formula
$$\text{Base Score} = \Big(0.40 \times S_{\text{intent}}\Big) + \Big(0.35 \times S_{\text{pain}}\Big) + \Big(0.25 \times S_{\text{authority}}\Big)$$

Where:
* **$S_{\text{intent}}$ (0–100):** Declared purchasing intent.
  - Switch intent (*"Leaving competitor X, need alternative"*): 100
  - Direct agency/tool recommendation (*"Looking for agency to build..."*): 90
  - Acute bottleneck / frustration (*"Our pipeline is broken, need help"*): 80
  - General discussion: 20
* **$S_{\text{pain}}$ (0–100):** Semantic and keyword overlap with agency's configured `pain_points` and `buying_signals`.
* **$S_{\text{authority}}$ (0–100):** Probability of author being a decision-maker (Founder, CEO, VP, Owner) vs an employee.

### Tier 3: Bayesian Source & Keyword Multipliers
$$\text{Final Weighted Score} = \min\Big(99, \text{Round}\big(\text{Base Score} \times W_{\text{source}} \times \max_{j} W_{j}\big)\Big)$$

Where:
* $W_{\text{source}}$: Channel weight from `weights` table (`reddit: 1.20`, `hackernews: 1.00`, `bluesky: 0.90`).
* $W_j$: Keyword weight from `keyword_weights` table (initialized to $1.00$).

---

## 5. Bayesian Weight Feedback & Dismissal Loop

When an agency operator acts on a lead card in `/threads`:

### A. "Approve Outreach" / "Copy Reply"
* Lead status transitions: `'new'` $\rightarrow$ `'approved'`.
* Reinforces positive weights: for all matched buying signals $j$:
  $$W_j \leftarrow \min(2.00, W_j + 0.05)$$
* Emits `lead_approved` event to `events`.

### B. "Not a Fit" (Dismissal with Reason)
* Prompts user with 1-click modal:
  1. `Wrong Persona / Decision-Maker`
  2. `No Budget / Low Intent / Personal Post`
  3. `Competitor / Seller Pitching`
  4. `Outdated / Not in Market`
* Lead status transitions: `'new'` $\rightarrow$ `'dismissed'` with `dismissal_reason`.
* Penalizes keyword weights for matched keywords:
  $$W_j \leftarrow \max(0.20, W_j - 0.10)$$
* If dismissed for `Competitor / Seller`, automatically suggests adding author or company to `negative_keywords`!

---

## 6. Mode A: Instant Quote & Proposal Integration

Unlike legacy social listeners (Buska, Octolens) which leave the user stranded with a raw social link:
* **Action Button:** `[Generate Quote]` directly on the lead card.
* **Seamless Deal Handoff:**
  1. Extracts prospect pain points and desired service from the thread snippet.
  2. Opens a pre-populated proposal drawer (Mode A Built-in Quote & Invoicing Ledger).
  3. Auto-fills Line Item: e.g. *"AI Chatbot Development & Workflow Integration"* with default pricing.
  4. Generates an instant, shareable quote link to paste directly in the outreach response!

---

## 7. UI/UX Specifications for `/threads`

Following Apple HIG & Chrome Modern Web Guidance:
* **Route:** `/threads`
* **Card Anatomy:**
  - **Header:** Source badge (Reddit orange, HN amber, Bluesky cyan) + Author handle + Time ago (`"2 hours ago"`) + Match Score Pill (e.g. `94% Match` in emerald).
  - **Title & Snippet:** Bold post title + highlighted search terms in snippet text.
  - **"Why This Matches":** 1 clear, italicized explanation sentence (e.g. *"Founder explicitly requests an agency to build Zapier automated follow-up pipelines."*).
  - **Source Multiplier Tag:** Small pill indicating weight impact (e.g. `+1.20x Reddit Multiplier`).
  - **Action Footer:**
    - `[Copy Reply Draft]` (Copies pre-drafted non-salesy message to clipboard with toast notification).
    - `[Generate Quote]` (Opens Mode A proposal drawer).
    - `[Not a Fit ▾]` (Dropdown for instant dismissal).
* **Empty State:** High-contrast illustration with *"No leads under current filters. Scraper polling runs continuously. Add more buying signals in Setup to expand your reach."*
* **Loading State:** Shimmering skeleton cards.

---

*End of Deep Research Document for Feature 02.*
