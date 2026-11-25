# Feature 05: Closed-Loop Attribution & Bayesian Learning
*Route:* Internal Engine & `/api/webhooks/outcome`  
*Target Entity:* `scoring_weights`, `thread_events`, `winthreads`  
*Reference:* Damped Bayesian Formula, Split-Attribution Engine

## 1. Job-to-be-Done (JTBD)
> **When** any deal outcome occurs (invoice paid, deal lost, or signal rejected),  
> **I want to** automatically update discovery weights and attribute revenue to signal sources,  
> **So that** tomorrow's daily lead feed gets smarter and stops surfacing bad leads.

## 2. Core Capabilities & Mathematical Specification
1. **Event Ingestion:**
   - Listens to internal and external events from `thread_events`:
     - `signal.rejected` (Not a Fit clicked in feed)
     - `outreach.replied` (Prospect replied positively)
     - `call.completed` (Phone outcome logged)
     - `invoice.paid` / `deal.won` (Commercial revenue secured)
     - `deal.lost` (Deal closed lost with categorized reason)
2. **The Damped Bayesian Weight Formula:**
   $$W_j = \text{clamp}\left( \frac{\alpha + S^+_j}{\alpha + S^+_j + S^-_{\text{fit}, j}} \times 2.0, \; 0.25, \; 2.50 \right)$$
   - Smoothing prior $\alpha = 5$.
   - Initial state for every attribute $j$: $W_j = 1.000$.
3. **Multi-Speed Outcome Splitting:**
   - **Positive Signals ($S^+_j$):**
     - Positive reply or calendar booking: $+0.5$.
     - Paid invoice: $+2.0 \times \log_{10}(\text{Invoice Paid Value})$.
   - **Lead Fit Failures ($S^-_{\text{fit}, j}$):**
     - `signal.rejected` or `loss_category = 'lead_fit_failure'`: $+1.0$.
     - **Direct Effect:** Reduces $W_j$, directly lowering the ranking of that keyword or source in future runs.
   - **Execution Failures (Zero Weight Penalty):**
     - `loss_category = 'execution_failure'`: $+0.0$ to $S^-_{\text{fit}, j}$.
     - Increments `execution_fail_count`.
     - Preserves signal discovery weights while alerting user to review pricing or script objections.
4. **Inline Weight Badges on Signal Feed:**
   - When leads are surfaced on Screen 2 (`/threads`), any lead matching a boosted attribute shows:
     `🟢 1.45x High Win Rate` or `🔴 0.70x Penalized Keyword`.

## 3. Verification & Testing
- Automated unit test suite (`tests/unit/attribution.test.ts`) verifies:
  1. High price loss does not lower keyword weight.
  2. "Wrong persona" loss immediately lowers keyword weight.
  3. Single large won deal cannot inflate weight beyond 2.50.
