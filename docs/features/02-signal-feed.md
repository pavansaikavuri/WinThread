# Feature 02: Daily Ranked Signal Feed & Weight Badging
*Route:* `/threads`  
*Target Entity:* `winthreads`, `scoring_weights`  
*Reference:* `raisedhand-rea.md` (Leads Feed, Score Card), `clienter-rea.md` (Lead Pipeline)

## 1. Job-to-be-Done (JTBD)
> **When** high-intent prospects publicly post about a problem my agency solves,  
> **I want to** see their exact post snippet, source permalink, and an explainable 0–100% score with live weight badges,  
> **So that** I know exactly why they are a fit and can approve outreach in one click.

## 2. Core User Capabilities
1. **Ranked Thread Cards:**
   - Displays 5 to 10 scored candidate leads per day sorted by `weighted_icp_score` descending.
   - Each card displays:
     - Contact Header: Name, Title, Company Name, Industry, Location.
     - Post Evidence: Exact public snippet, publication timestamp, source platform icon, direct link to live post.
     - Explainable Score: $S_{\text{base}}$ ($0–100$) broken into Persona (30), Company (25), Urgency (30), Reachability (15).
     - Inline Bayesian Multiplier Badge: Shows $W_j$ for matched keywords (e.g., `+1.35x High Win Rate` or `0.80x Penalized`).
2. **One-Click Actions:**
   - **`Approve Outreach`:** Transitions thread state from `found` -> `ready_to_send`, generating personalized message, and moves to `/outreach`.
   - **`Not a Fit`:** Prompts with 1-click reason dropdown (`Wrong Persona`, `No Budget / Personal Post`, `Competitor / Seller`, `Not in Market`). Immediately writes an outcome event, adds $+1.0$ to $S^-_{\text{fit}, j}$, and permanently dismisses the lead.

## 3. UI States
- **Loading:** Skeleton cards with animated shimmer.
- **Empty:** "No new signals today. Your scraper runs daily at 08:00 AM. In the meantime, add keywords to your ICP profile."
- **Active:** Dense, high-contrast list of cards following Apple HIG macOS utility style.

## 4. Verification & Testing
- **Verification Command:** `npm test tests/features/signal-feed.test.ts`.
- **Criteria:** Scoring formula correctly applies weight multipliers $W_j$ to candidate scores; `Not a Fit` action immediately updates `scoring_weights`.
