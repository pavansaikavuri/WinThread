# Architectural Deep-Dive: Multi-Tenant Signal Storage & Database Topology
**Document Identifier:** RESEARCH-STORAGE-TOPOLOGY-2026-11-24  
**Primary Sources:**
- Common Room Data Architecture (`commonroom.io/blog/unified-buyer-intelligence`)
- Social Listening Multi-Tenant Schema Engineering Patterns
- PostgreSQL Row-Level Security & GIN Index Scaling Guidelines
- Buska & Octolens Ingestion Pipeline Specifications

---

## 1. Executive Summary & The Core Architectural Dilemma

When designing a B2B signal discovery platform that scans public platforms (Reddit, Hacker News, Bluesky) for hundreds of tenant agencies, the database architect faces a foundational fork in the road:

* **Architecture A (The Shared Signal Pool / Medallion Topology):** Ingest public posts **once globally** into an immutable `raw_signals` table; score and map them into tenant-private `threads` rows under Row-Level Security.
* **Architecture B (Siloed Per-Tenant Storage):** Every tenant agency maintains an isolated, independent table that stores duplicate raw text, metadata, and scores.

---

## 2. How the World's Leading Platforms Solve This

In researching enterprise signal and social listening architectures (Common Room, Buska, Octolens, Brandwatch):

### A. Common Room's "Raw Events vs Account Signals"
Common Room explicitly divides its database into two layers:
1. **The Ingestion/Stream Layer (`Raw Events`):** Collects public GitHub, Slack, Discord, and Webhook events once. These are high-velocity, semi-structured, append-only records.
2. **The Intelligence Layer (`Account Signals`):** An identity resolution and scoring layer that maps raw events to specific customer workspaces. Multiple enterprise customers can track the same engineer or public post without duplicating the underlying event payload.

### B. Buska's Shared Ingestion Stream
Buska analyzes **451,000+ posts** to surface high-intent leads. They do not run 451,000 scrapes per customer. A centralized crawler ingests public social feeds into a normalized raw pool. Tenant-specific vector embeddings and ICP keyword filters query this central lake, keeping infrastructure costs flat even as user counts scale 100x.

---

## 3. The 5 Strong Criteria Proving Why Architecture A is Strictly Superior

### Criterion 1: The Cold-Start Velocity (Instant Time-To-Value)
* **The Problem:** When an agency signs up, they judge the product in the first 60 seconds.
* **Under Siloed Storage (Option B):** The newly registered agency has an empty table. They have to wait hours or days for their isolated scraper to find posts matching their keywords. Drop-off rate exceeds 70%.
* **Under Shared Pool (Option A):** When a new agency confirms their ICP in the setup wizard, WinThread executes:
  ```sql
  SELECT * FROM raw_signals WHERE published_at > now() - interval '7 days';
  ```
  It instantly scores the last 7 days of pre-scraped signals against their ICP in **300 milliseconds**. The agency sees a dashboard full of qualified, scored leads on Day 1, Minute 1!

### Criterion 2: Network Survival & API Rate Limit Survival
* **The Reality:** Reddit limits unauthenticated requests to **10 requests per minute (RPM) per IP**. Bluesky limits searches to **3,000 per 5 minutes**.
* **Under Siloed Storage (Option B):** If 50 agencies are searching for automation leads, 50 scrapers make 50 requests every minute ($50 > 10$). Reddit's anti-bot infrastructure immediately blocks your cloud server's IP address with HTTP 429 / 403.
* **Under Shared Pool (Option A):** One central poller queries Reddit once every 120 seconds ($0.5\text{ RPM} \ll 10\text{ RPM}$). It satisfies all 50 agencies simultaneously with zero ban risk and zero duplicate network egress.

### Criterion 3: Database Storage & Index Memory Economics
* **The Math:** A rich social post with metadata is ~2 KB. At 5,000 posts ingested per day across 100 agencies:
  - **Siloed (Option B):** $5,000 \times 100 = 500,000\text{ rows/day} = 1.0\text{ GB/day}$. In 1 year = **365 GB** of duplicate text and duplicate GIN full-text search indexes! Database maintenance halts.
  - **Shared Pool (Option A):** Stores $5,000\text{ raw rows/day} = 10\text{ MB/day}$. In 1 year = **3.6 GB total**. Individual `threads` rows are lightweight pointers (UUIDs + an integer score), saving over **98% of database storage costs**.

### Criterion 4: Cryptographic Multi-Tenant Isolation (RLS Security)
* Public social media posts (a tweet or a Reddit question) are public by definition—there is zero privacy violation in sharing the underlying raw text.
* However, **an agency's deal data is strictly confidential**:
  - What score did they assign?
  - What custom reply did they draft?
  - What quote did they generate?
  - Which leads did they dismiss as "Not a Fit"?
* Under Architecture A, the `threads` table holds these private columns and enforces **PostgreSQL Row-Level Security**:
  ```sql
  CREATE POLICY "Agencies can only access their own threads"
  ON threads FOR ALL
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));
  ```
  Competitors can never inspect which leads another agency is pitching or quoting.

### Criterion 5: Collective Network Intelligence (The Anti-Noise Moat)
* When Agency A marks a post as `"Competitor / Spammer Pitching"`, our engine can tag that author or domain in `raw_signals`.
* Every other agency on WinThread automatically benefits from that spam suppression. The platform becomes progressively smarter with every user action.

---
*End of Multi-Tenant Signal Storage Architecture Document.*
