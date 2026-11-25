# WinThread Intent Scoring & Qualification Algorithm (Deep Reverse-Engineering & Superior Architecture)

**Document Identifier:** REA-ALGO-WINTHREAD-2026-11-23  
**Status:** Architecture Specification  
**Evidence Baseline:** Reverse-engineered from live REA captures of RaisedHand (`nevermisshq.com`), Buska (`buska.io`), and Octolens (`octolens.com`).

---

## 1. Competitor Reverse-Engineering Analysis

### A. RaisedHand's Core Logic (Ty Chen)
* **Observed Data Model:** 12-item ICP criteria (`what_you_sell`, `who_decides`, `industries`, `locations`, `company_size`, `competitors`, `pain_points`, `buying_signals`, `block_list`).
* **Scoring Logic:**
  - Evaluates on 3 axes:
    1. **Audience Match:** Is the author a decision-maker in the target industry?
    2. **Engagement Type:** Did they like or comment on a monitored competitor profile?
    3. **Buying Signal:** Does their comment express interest or frustration?
* **Bottleneck / Flaw:** Relies heavily on LinkedIn cookies and session runners. Has zero integration with pricing, quotes, or instant proposal delivery.

### B. Octolens' Core Logic (`octolens.com`)
* **Observed Data Model:** Two-stage classifier:
  1. **Deterministic Filter:** Removes homonyms and idioms (e.g., filters out *"Be the pied piper"* and *"Town festival honors Pied Piper"*).
  2. **Intent Tagging:** Classifies into discrete categories:
     - `switch_intent` (Highest priority: *"Leaving Hooli, is Pied Piper worth it?"*)
     - `bug_report` (Product support)
     - `filtered_out` (Noise / false positive)
* **Bottleneck / Flaw:** Generic across all industries; lacks agency-specific deal sizing and proposal workflows.

### C. Buska's Core Logic (`buska.io`)
* **Observed Data Model:** 
  - Intent Score (0–100).
  - 451,903 posts analyzed $\rightarrow$ 12 qualified leads surfaced (99.99% noise filtration rate).
  - Generates a "Reply Studio" non-salesy response.
* **Bottleneck / Flaw:** Overly strict keyword boundaries cause high false-negative rates (drops real buyers who phrase their problems informally).

---

## 2. WinThread's Superior 3-Tier Multi-Dimensional Intent Engine (MDIE)

To beat RaisedHand, Octolens, and Buska, WinThread introduces a **3-Tier Cascade**:

```
[Raw Social Post / Thread]
           │
           ▼
┌────────────────────────────────────────────────────────┐
│  TIER 1: Deterministic Lexical Gate (Fast & $0 Cost)   │
│  - Negative Keyword Check (intern, free, student, etc) │
│  - Keyword Density & Word Count (> 15 words)           │
│  - Discards 80% of spam in < 1ms without LLM cost      │
└────────────────────────────────────────────────────────┘
           │ (Passes Filter)
           ▼
┌────────────────────────────────────────────────────────┐
│  TIER 2: Semantic Intent Classifier                   │
│  - Intent Weight:                                      │
│    • Switch Intent (Competitor Alternative): 1.0       │
│    • Direct Recommendation Request: 0.9                │
│    • Acute Pain / Bottleneck Expression: 0.8           │
│    • General Mention: 0.2 (Discarded)                  │
│  - Authority Check: Owner / Founder / Operator         │
└────────────────────────────────────────────────────────┘
           │ (Score >= 70%)
           ▼
┌────────────────────────────────────────────────────────┐
│  TIER 3: Context & Action Synthesis (WinThread Moat)   │
│  1. Match Score Calculation (0–100%)                   │
│  2. "Why This Matches" (1 Clear Sentence)              │
│  3. Non-Spam Helpful Reply Draft (Buska style)         │
│  4. 1-Click Pre-Populated Quote Proposal               │
│     (Clienter / WinThread Decision 1 Integration)      │
└────────────────────────────────────────────────────────┘
           │
           ▼
[Qualified Lead Card on Dashboard]
```

---

## 3. Mathematical Formula for Match Score

$$\text{Final Match Score} = (0.40 \times S_{\text{intent}}) + (0.35 \times S_{\text{pain}}) + (0.25 \times S_{\text{authority}})$$

Where:
* $S_{\text{intent}}$ (0–100): Strength of declared purchasing intent (100 = asking to buy/hire; 80 = asking for tool recommendation; 0 = casual comment).
* $S_{\text{pain}}$ (0–100): Overlap with the agency's configured `pain_points` from Step 2 of the setup wizard.
* $S_{\text{authority}}$ (0–100): Probability that the author is an authorized buyer/owner vs an employee/student.

---

## 4. Competitive Differentiation Matrix

| Capability | RaisedHand | Buska | Octolens | WinThread (Ours) |
| :--- | :---: | :---: | :---: | :---: |
| **Website-to-ICP Wizard** | ✅ | ✅ | ❌ | ✅ (With 1-click fallback presets) |
| **Deterministic Fast Filter ($0)** | ❌ | ❌ | ✅ | ✅ (Instant client-side + server-side) |
| **Intent Classification (Switch/Pain)** | ❌ | ⚠️ | ✅ | ✅ (Deep semantic weights) |
| **Non-Spam Reply Draft** | ⚠️ | ✅ | ❌ | ✅ (Pre-drafted in agency voice) |
| **Built-in Quote & Invoice Ledger** | ❌ | ❌ | ❌ | 🏆 **WINTHREAD EXCLUSIVE** |
