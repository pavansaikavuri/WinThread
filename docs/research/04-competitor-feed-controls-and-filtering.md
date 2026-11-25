# Competitor Deep-Dive: Feed Controls, Filtering & Toolbar Architecture
**Document Identifier:** RESEARCH-FEED-CONTROLS-2026-11-24  
**Primary Sources:**
- RaisedHand Production UI (`docs/reference/raisedhand-rea.md`, Screenshots 2043–2046, 2073, 2088)
- Buska Filter Architecture (`buska.io/features/smart-filtering`)
- Syften Rule & Search Architecture (`syften.com/setup/filters`)
- Octolens Mention Stream (`octolens.com`)

---

## 1. Executive Summary & Comparative Matrix

Across buyer intent and social listening engines, dashboard controls serve one primary goal: **accelerating time-to-first-response**. High-intent leads grow stale rapidly (often within 2–4 hours). The filter bar is what allows an agency operator to locate their top 5 highest-probability opportunities in under 10 seconds.

| Platform | Primary Navigation & Toolbar Layout | Filtering Capabilities | Search Model | Special Power Feature |
| :--- | :--- | :--- | :--- | :--- |
| **RaisedHand** | **Top Global Search + 5 Dropdown Selectors + Toggle** | 1. **Pipeline Stage:** `Applied` / `Call booked` / `Closed` / `Follow up later`<br>2. **Time Window:** `Today` / `Any time`<br>3. **ICP Tier:** `90%+ Perfect fit` / `80%+ Strong fit`<br>4. **Signal Type:** `Post` / `Comment` / `Like`<br>5. **Location:** `US` / `UK` / `Anywhere` | Global input: *"Search leads, companies, posts"* | **`[x] Hide leads without a company`** toggle (filters out anonymous hobbyists). |
| **Buska** | **Dual Feed Tabs + Channel Pills + Score Slicer** | 1. **Dual Feeds:** `Buying Signals` vs `Brand Mentions`<br>2. **Channel Tabs:** `All`, `Reddit`, `LinkedIn`, `X`, `HN`<br>3. **Intent Filter:** `HOT Leads (85%+)` vs `All (70%+)`<br>4. **Sentiment & Language:** Multi-lingual filtering | Free-text keyword search across snippets | **Separate Lead Feed vs Brand Mention Feed** (prevents news chatter from burying active buyers). |
| **Syften** | **Rule-Based Line Editor with Tags** | 1. **Source restriction:** `site:reddit.com/r/saas`<br>2. **Content type:** `type:post` vs `type:comment`<br>3. **Exclusion operators:** `NOT intern`<br>4. **AI filter tags:** `$accept:` qualification rules | Boolean keyword expressions | **Tag-based routing** to individual Slack channels per client niche. |
| **Octolens** | **Category Pills + Platform Tabs + Date Picker** | 1. **Intent Categories:** `Switch Intent` / `Bug Report` / `Mention`<br>2. **Platform Tabs:** Multi-source selection<br>3. **Date Range:** `Last 24h` / `7d` / `30d` | Text search with live filter matching | **Switch Intent filter** specifically isolates users leaving named competitors. |

---

## 2. In-Depth Analysis of How Top Tools Structure Their Toolbars

### A. RaisedHand's Filtering System (The B2B Agency Standard)
*Evidence: `docs/reference/raisedhand-rea.md` (Screenshots 2043 & 2044)*

RaisedHand organizes its toolbar into three distinct horizontal tiers:
1. **Tier 1 (The Global Header):**
   - Left: Search input field: `[ 🔍 Search leads, companies, posts... ]`.
   - Right: Action buttons: `[ Auto-Enrich ]`, `[ Export CSV ]`.
2. **Tier 2 (The Multi-Selector Row):**
   - **Status Dropdown:** `Found Any time ▾` | `Any ICP match ▾` | `Found anywhere ▾` | `All signals ▾`.
   - **ICP Match Thresholds:**
     * `90%+ Perfect Fit` (The daily gold)
     * `75%–89% Strong Fit`
     * `Any Match`
3. **Tier 3 (The Quality Toggle):**
   - An explicit checkbox: **`[x] Hide leads without a company`**.
   - *Why this exists:* On Reddit, many accounts are individuals asking general questions. On LinkedIn, some accounts are students or job-seekers with no company attached. Checking this box guarantees that every card on screen belongs to an operating business.

---

### B. Buska's Dual Feed & Score Slicing System
*Evidence: Buska Platform Documentation (`buska.io`)*

Buska solved the common social listening problem where PR mentions of a company buried genuine client requests:
1. **The Dual Feed Architecture:**
   - **Tab 1: "Buying Signals":** Only posts where someone explicitly asks for a solution or expresses acute operational pain.
   - **Tab 2: "Brand Mentions":** General mentions, PR articles, and social chatter.
2. **The "HOT Leads" Slicer:**
   - Instead of a complex slider, Buska provides a 1-click button: **`[ 🔥 HOT Leads Only ]`**.
   - It filters the feed to only show posts with an AI intent score of **$\ge 85\%$**. Sales reps use this when they only have 15 minutes in the morning and want to pitch the top 3 hottest prospects immediately.

---

### C. Syften's Boolean & Source Targeting
*Evidence: Syften Production Documentation (`syften.com`)*

Syften is designed for technical founders who want surgical control:
* Rather than guessing what subreddits to monitor, it allows operators to target specific subreddits directly: `site:reddit.com/r/smallbusiness`.
* It allows negative exclusions directly in the search bar: `"looking for agency" NOT job NOT hiring`.

---

## 3. Architectural Synthesis for WinThread: The "High-Velocity Operator Toolbar"

By synthesizing RaisedHand's B2B company filters, Buska's 1-click HOT leads toggle, and Octolens' clean channel pills, WinThread's `/threads` toolbar can be engineered for maximum speed:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [ 🔍 Search leads, keywords, companies... ]          [ 🔄 Scan Channels Now ]  [ 📥 Export ] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  Channels:  [ All (18) ]  [ Reddit (8) ]  [ Hacker News (6) ]  [ Bluesky (4) ]         │
│  Tiers:     [ 🔥 85%+ High Intent ]  [ All Matches (70%+) ]  [ 📦 Mode A Quotes Sent ] │
│  Filters:   [ ▾ Source Filter ]  [ ▾ Time: Today ]  [ ▾ Status: New ]                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Functional Components:
1. **Live Instant Search (`<input>`):** Filters cards on screen in real time as the user types without requiring a page reload.
2. **Channel Tabs with Live Badges:** Shows lead counts per platform: `Reddit (8)`, `Hacker News (6)`, `Bluesky (4)`.
3. **1-Click "HOT Leads" Toggle (Buska-inspired):** Instant filter for leads scoring $\ge 85\%$.
4. **Deal Status Filter (Clienter / RaisedHand-inspired):**
   - `New / Unreviewed`: Leads waiting for outreach.
   - `Mode A Quotes Sent`: Prospects who have received a proposal link.
   - `Dismissed / Archive`: Hidden leads retained for analytics.
5. **On-Demand Scan Trigger (Decision 1):** `[ 🔄 Scan Channels Now ]` button to trigger live scraping on demand.

---
*End of Feed Controls Research Document.*
