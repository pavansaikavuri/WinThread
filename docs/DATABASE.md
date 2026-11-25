# DATABASE.md — WinThread Database Schema & Migrations (Phase 1 MVP)

**Version:** 1.0 | **Source:** MVP.md v2.2 Appendix A | **Status:** Implementation-Ready

---

## 1. SCHEMA OVERVIEW

**Total Tables:** 18 (7 core + 11 supporting)
**All tables** have RLS enabled with policy: `USING (workspace_id = auth.jwt()->>'workspace_id')`
**Naming Convention:** snake_case tables, snake_case columns, UUID primary keys (except `weight_change_log`, `llm_usage`, `job_failures`, `event_log` use BIGSERIAL)

---

## 2. COMPLETE TABLE DEFINITIONS

### 2.1 Core Tables (7)

#### `workspaces`
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,                    -- Agency website domain
  gstin TEXT,                            -- Agency GSTIN (validated format)
  state_code TEXT,                       -- Indian state code for place_of_supply
  currency TEXT DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  timezone TEXT DEFAULT 'Asia/Kolkata',
  plan TEXT DEFAULT 'beta' CHECK (plan IN ('beta', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workspaces_domain ON workspaces(domain);
CREATE INDEX idx_workspaces_status ON workspaces(status);

-- RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON workspaces
  USING (id = auth.jwt()->>'workspace_id');
```

#### `icp_profiles`
```sql
CREATE TABLE icp_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  services TEXT[] NOT NULL DEFAULT '{}',           -- ["AI Chatbot Development", "LinkedIn Lead Gen"]
  buyer_titles TEXT[] NOT NULL DEFAULT '{}',       -- ["Founder", "CEO", "Marketing Head", "Growth Head", "CTO", "VP Marketing"]
  pain_points TEXT[] NOT NULL DEFAULT '{}',        -- ["No inbound leads", "Manual outreach doesn't scale"]
  buying_signals TEXT[] NOT NULL DEFAULT '{}',     -- ["looking for", "need help with", "hiring agency", "RFP"]
  negative_keywords TEXT[] NOT NULL DEFAULT '{}',  -- ["job", "hiring", "internship", "free", "course"] -- MIN 3 REQUIRED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id)
);

-- RLS
ALTER TABLE icp_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON icp_profiles
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `threads`
```sql
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_thread_id TEXT NOT NULL,                  -- External platform ID (TEXT, not UUID)
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_channel TEXT NOT NULL CHECK (source_channel IN ('linkedin', 'twitter', 'email', 'other')),
  post_text TEXT NOT NULL,
  url TEXT NOT NULL,
  author_handle TEXT,
  author_name TEXT,
  company_name TEXT,
  posted_at TIMESTAMPTZ NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),  -- ICP Match Score 0-100
  weight_json JSONB NOT NULL DEFAULT '{}',         -- {source_weight, keyword_weights: {keyword: weight}}
  stage TEXT NOT NULL DEFAULT 'discovered' CHECK (stage IN ('discovered', 'approved', 'contacted', 'qualified', 'quote_sent', 'won', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_thread_id, workspace_id)
);

-- Indexes
CREATE INDEX idx_threads_workspace_stage ON threads(workspace_id, stage);
CREATE INDEX idx_threads_workspace_created ON threads(workspace_id, created_at DESC);
CREATE INDEX idx_threads_workspace_score ON threads(workspace_id, score DESC);
CREATE INDEX idx_threads_source_thread_id ON threads(source_thread_id, workspace_id);

-- RLS
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON threads
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `outcomes`
```sql
CREATE TABLE outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('won', 'lost')),
  loss_category TEXT CHECK (loss_category IN ('lead_fit_failure', 'execution_failure')),  -- Required when type='lost'
  weight_delta JSONB NOT NULL DEFAULT '{}',        -- {source_weight_delta, keyword_weight_deltas: [{keyword, delta}]}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (thread_id, type)                         -- One terminal outcome per thread
);

-- Indexes
CREATE INDEX idx_outcomes_workspace_created ON outcomes(workspace_id, created_at DESC);
CREATE INDEX idx_outcomes_thread ON outcomes(thread_id);

-- RLS
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON outcomes
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `quotes`
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,  -- NULL for manual_import
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  pdf_url TEXT,
  signoff_hash CHAR(64) UNIQUE NOT NULL,           -- BLAKE3 hash for sign-off verification
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired')),
  source TEXT NOT NULL DEFAULT 'winthread_signal' CHECK (source IN ('winthread_signal', 'manual_import', 'crm_sync')),
  client_gstin TEXT,                               -- Validated: ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
  place_of_supply TEXT NOT NULL,                   -- Indian state code or country
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  total_cents INTEGER NOT NULL DEFAULT 0,
  tax_breakdown JSONB NOT NULL DEFAULT '{}',       -- {cgst_cents, sgst_cents, igst_cents, total_tax_cents}
  line_items JSONB NOT NULL DEFAULT '[]',          -- [{description, qty, unit_price_cents, hsn_sac, gst_rate}]
  sent_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quotes_workspace_status ON quotes(workspace_id, status);
CREATE INDEX idx_quotes_thread ON quotes(thread_id);
CREATE INDEX idx_quotes_signoff_hash ON quotes(signoff_hash);

-- RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON quotes
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `invoices`
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,                    -- Format: INV-YYYY-XXXX (sequential per workspace)
  gst_json JSONB NOT NULL DEFAULT '{}',            -- {cgst, sgst, igst, cess, hsn_sac_per_item: [{hsn_sac, taxable_value, cgst, sgst, igst}]}
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')),
  irn TEXT,                                        -- Invoice Reference Number (e-invoicing Phase 1.5)
  ack_no TEXT,                                     -- Acknowledgement Number (e-invoicing Phase 1.5)
  issued_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, invoice_number)
);

-- Indexes
CREATE INDEX idx_invoices_workspace_status ON invoices(workspace_id, status);
CREATE INDEX idx_invoices_quote ON invoices(quote_id);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON invoices
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `verified_reviews`
```sql
CREATE TABLE verified_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL,                           -- References quotes.id or future deals table
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  hash CHAR(64) UNIQUE NOT NULL,                   -- BLAKE3(deal_id||amount_cents||outcome||timestamp||nonce)
  algorithm TEXT DEFAULT 'BLAKE3',
  nonce BYTEA NOT NULL,                            -- 16 bytes (32 hex chars)
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE,
  token TEXT,                                      -- JWT 7-day expiry for verification page
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_verified_reviews_workspace ON verified_reviews(workspace_id);
CREATE INDEX idx_verified_reviews_hash ON verified_reviews(hash);

-- RLS
ALTER TABLE verified_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON verified_reviews
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

---

### 2.2 Supporting Tables (11)

#### `keyword_weights`
```sql
CREATE TABLE keyword_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  weight NUMERIC(4,2) NOT NULL DEFAULT 1.00 CHECK (weight >= 0.25 AND weight <= 2.50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, keyword)
);

-- Indexes
CREATE INDEX idx_keyword_weights_workspace ON keyword_weights(workspace_id);

-- RLS
ALTER TABLE keyword_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON keyword_weights
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `weights` (source_weights)
```sql
CREATE TABLE weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('linkedin', 'twitter', 'email', 'other')),
  weight NUMERIC(4,2) NOT NULL DEFAULT 1.00 CHECK (weight >= 0.25 AND weight <= 2.50),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, channel)
);

-- Default seed data (inserted on workspace creation):
-- ('linkedin', 1.20), ('twitter', 0.80), ('email', 1.00), ('other', 1.00)

-- RLS
ALTER TABLE weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON weights
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `communication_consent`
```sql
CREATE TABLE communication_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'linkedin', 'phone')),
  consented BOOLEAN NOT NULL DEFAULT FALSE,
  consented_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (thread_id, channel)
);

-- Indexes
CREATE INDEX idx_communication_consent_thread ON communication_consent(thread_id);

-- RLS
ALTER TABLE communication_consent ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON communication_consent
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `suppressions` (Do Not Contact)
```sql
CREATE TABLE suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  prospect_identifier TEXT NOT NULL,               -- Email, phone, LinkedIn handle, etc.
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'linkedin', 'phone', 'all')),
  reason TEXT NOT NULL,                            -- 'withdrawn_consent', 'explicit_request', 'bounced', 'spam_complaint'
  suppressed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, prospect_identifier, channel)
);

-- Indexes
CREATE INDEX idx_suppressions_workspace_prospect ON suppressions(workspace_id, prospect_identifier);

-- RLS
ALTER TABLE suppressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON suppressions
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `events` (Unified Analytics Event Log)
```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,                        -- 'setup_completed', 'outreach_approved', 'call_logged', 'quote_generated', 'quote_signed', 'outcome_logged', etc.
  payload_json JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_workspace_timestamp ON events(workspace_id, timestamp DESC);
CREATE INDEX idx_events_thread ON events(thread_id);
CREATE INDEX idx_events_type ON events(event_type);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON events
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `event_log` (Execution Failure Flags)
```sql
CREATE TABLE event_log (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,                        -- 'execution_failure'
  flagged_fields TEXT[] NOT NULL DEFAULT '{}',     -- ['pricing', 'copy', 'both']
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_log_workspace_timestamp ON event_log(workspace_id, timestamp DESC);
CREATE INDEX idx_event_log_thread ON event_log(thread_id);

-- RLS
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON event_log
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `job_failures`
```sql
CREATE TABLE job_failures (
  id BIGSERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,                          -- 'weight_update', 'scoring', 'precision_refresh', 'llm_rollup'
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  payload_json JSONB NOT NULL DEFAULT '{}',
  error TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_job_failures_job_retry ON job_failures(job_name, next_retry_at) WHERE resolved_at IS NULL;

-- RLS (workspace_id can be NULL for system jobs)
ALTER TABLE job_failures ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON job_failures
  USING (workspace_id = auth.jwt()->>'workspace_id' OR workspace_id IS NULL);
```

#### `llm_usage`
```sql
CREATE TABLE llm_usage (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('icp_extraction', 'scoring', 'quote_gen', 'call_script')),
  provider TEXT NOT NULL CHECK (provider IN ('groq', 'together', 'openrouter')),
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (workspace_id, date, call_type, provider)
);

-- Indexes
CREATE INDEX idx_llm_usage_workspace_date ON llm_usage(workspace_id, date DESC);

-- RLS
ALTER TABLE llm_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON llm_usage
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `weight_change_log`
```sql
CREATE TABLE weight_change_log (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel TEXT,                                    -- NULL for keyword changes
  keyword TEXT,                                    -- NULL for source weight changes
  old_weight NUMERIC(4,2) NOT NULL,
  new_weight NUMERIC(4,2) NOT NULL,
  outcome_count INTEGER NOT NULL,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('won', 'lead_fit_failure', 'execution_failure')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_weight_change_log_workspace_timestamp ON weight_change_log(workspace_id, timestamp DESC);
CREATE INDEX idx_weight_change_log_channel_keyword ON weight_change_log(workspace_id, channel, keyword);

-- RLS
ALTER TABLE weight_change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON weight_change_log
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

#### `outreach_log`
```sql
CREATE TABLE outreach_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('linkedin', 'email', 'whatsapp', 'phone')),
  message_text TEXT NOT NULL,                      -- The AI-drafted message that was copied
  sent_at TIMESTAMPTZ,                             -- NULL until deep-link click or Mark Contacted
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,            -- Client-generated for deduplication
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_outreach_log_thread ON outreach_log(thread_id);
CREATE INDEX idx_outreach_log_idempotency ON outreach_log(idempotency_key);

-- RLS
ALTER TABLE outreach_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_isolation ON outreach_log
  USING (workspace_id = auth.jwt()->>'workspace_id');
```

---

## 3. VIEWS & MATERIALIZED VIEWS

### 3.1 `mv_precision_at_10` (Materialized View)
```sql
CREATE MATERIALIZED VIEW mv_precision_at_10 AS
SELECT
  t.workspace_id,
  date_trunc('week', t.created_at) AS week_start,
  COUNT(*) FILTER (WHERE t.stage IN ('approved', 'contacted', 'qualified', 'quote_sent', 'won')) AS approved_count,
  10 AS total_scored,
  (COUNT(*) FILTER (WHERE t.stage IN ('approved', 'contacted', 'qualified', 'quote_sent', 'won'))::numeric / 10) AS precision_at_10
FROM threads t
WHERE t.created_at >= NOW() - INTERVAL '8 weeks'
GROUP BY t.workspace_id, date_trunc('week', t.created_at);

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX idx_mv_precision_at_10_unique ON mv_precision_at_10 (workspace_id, week_start);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_mv_precision_at_10()
RETURNS void LANGUAGE sql AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_precision_at_10;
$$;

-- pg_cron schedule: Daily 03:00 UTC
-- SELECT cron.schedule('refresh-precision-at-10', '0 3 * * *', 'SELECT refresh_mv_precision_at_10();');
```

### 3.2 `v_execution_failures` (View)
```sql
CREATE VIEW v_execution_failures AS
SELECT
  el.workspace_id,
  el.thread_id,
  el.flagged_fields,
  el.timestamp
FROM event_log el
WHERE el.event_type = 'execution_failure'
  AND el.timestamp > NOW() - INTERVAL '7 days';
```

### 3.3 `v_activation_funnel` (View — Founder Weekly Query)
```sql
CREATE VIEW v_activation_funnel AS
SELECT
  w.id AS workspace_id,
  w.name AS workspace_name,
  w.created_at AS workspace_created,
  COUNT(DISTINCT e_setup.workspace_id) FILTER (WHERE e_setup.event_type = 'setup_completed') AS setup_completed,
  COUNT(DISTINCT e_outreach.workspace_id) FILTER (WHERE e_outreach.event_type = 'outreach_approved') AS outreach_approved,
  COUNT(DISTINCT e_call.workspace_id) FILTER (WHERE e_call.event_type = 'call_logged') AS call_logged,
  COUNT(DISTINCT e_qualified.workspace_id) FILTER (WHERE e_qualified.event_type = 'thread_qualified') AS qualified,
  COUNT(DISTINCT e_won.workspace_id) FILTER (WHERE e_won.event_type = 'outcome_logged' AND e_won.payload_json->>'type' = 'won') AS won,
  COUNT(DISTINCT e_lost.workspace_id) FILTER (WHERE e_lost.event_type = 'outcome_logged' AND e_lost.payload_json->>'type' = 'lost') AS lost
FROM workspaces w
LEFT JOIN events e_setup ON e_setup.workspace_id = w.id AND e_setup.event_type = 'setup_completed'
LEFT JOIN events e_outreach ON e_outreach.workspace_id = w.id AND e_outreach.event_type = 'outreach_approved'
LEFT JOIN events e_call ON e_call.workspace_id = w.id AND e_call.event_type = 'call_logged'
LEFT JOIN events e_qualified ON e_qualified.workspace_id = w.id AND e_qualified.event_type = 'thread_qualified'
LEFT JOIN events e_won ON e_won.workspace_id = w.id AND e_won.event_type = 'outcome_logged' AND e_won.payload_json->>'type' = 'won'
LEFT JOIN events e_lost ON e_lost.workspace_id = w.id AND e_lost.event_type = 'outcome_logged' AND e_lost.payload_json->>'type' = 'lost'
GROUP BY w.id, w.name, w.created_at;
```

---

## 4. MIGRATION ORDER (DEPENDENCIES FIRST)

```bash
# Migration files in supabase/migrations/ (run in order)

001_create_workspaces.sql              -- No dependencies
002_create_icp_profiles.sql            -- Depends on workspaces
003_create_threads.sql                 -- Depends on workspaces
004_create_outcomes.sql                -- Depends on threads, workspaces
005_create_quotes.sql                  -- Depends on threads, workspaces
006_create_invoices.sql                -- Depends on quotes, workspaces
007_create_verified_reviews.sql        -- Depends on workspaces
008_create_keyword_weights.sql         -- Depends on workspaces
009_create_weights.sql                 -- Depends on workspaces
010_create_communication_consent.sql   -- Depends on threads, workspaces
011_create_suppressions.sql            -- Depends on workspaces
012_create_events.sql                  -- Depends on workspaces, threads
013_create_event_log.sql               -- Depends on workspaces, threads
014_create_job_failures.sql            -- Depends on workspaces (nullable)
015_create_llm_usage.sql               -- Depends on workspaces
016_create_weight_change_log.sql       -- Depends on workspaces
017_create_outreach_log.sql            -- Depends on threads, workspaces
018_create_views.sql                   -- Depends on all tables
019_create_rls_policies.sql            -- Depends on all tables (RLS enable)
020_seed_global_defaults.sql           -- No dependencies (global weights)
021_create_pg_cron_jobs.sql            -- Depends on views/functions
```

### 4.1 Key Migration Details

#### `019_create_rls_policies.sql`
```sql
-- Run AFTER all tables created
-- Applies RLS policy template to ALL tables:
-- ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY workspace_isolation ON <table> USING (workspace_id = auth.jwt()->>'workspace_id');

-- Tables with workspace_id: workspaces, icp_profiles, threads, outcomes, quotes, invoices,
-- verified_reviews, keyword_weights, weights, communication_consent, suppressions,
-- events, event_log, job_failures, llm_usage, weight_change_log, outreach_log

-- job_failures has nullable workspace_id — policy allows NULL (system jobs)
```

#### `020_seed_global_defaults.sql`
```sql
-- Global default source weights (used for cold-start blending)
-- These are NOT workspace-specific — used as fallback in weight blending formula
-- Stored in a separate config table or as application constants

-- Application constants (in lib/scoring.ts):
-- const GLOBAL_SOURCE_WEIGHTS = { linkedin: 1.2, twitter: 0.8, email: 1.0, other: 1.0 };
-- const WEIGHT_CLAMP_MIN = 0.25;
-- const WEIGHT_CLAMP_MAX = 2.50;
-- const DAMPING_ALPHA = 5;
-- const MIN_OUTCOMES_FOR_INFLUENCE = 25;

-- Per-workspace defaults inserted on workspace creation (trigger or application code):
INSERT INTO weights (workspace_id, channel, weight) VALUES
  (NEW.id, 'linkedin', 1.20),
  (NEW.id, 'twitter', 0.80),
  (NEW.id, 'email', 1.00),
  (NEW.id, 'other', 1.00)
ON CONFLICT (workspace_id, channel) DO NOTHING;

INSERT INTO keyword_weights (workspace_id, keyword, weight)
SELECT NEW.id, unnest(buying_signals), 1.00
FROM icp_profiles WHERE workspace_id = NEW.id
ON CONFLICT (workspace_id, keyword) DO NOTHING;
```

#### `021_create_pg_cron_jobs.sql`
```sql
-- Requires pg_cron extension (enabled in Supabase)
-- SELECT cron.schedule('weight-update-job', '0 2 * * *', 'SELECT run_weight_update_job();');
-- SELECT cron.schedule('refresh-precision-at-10', '0 3 * * *', 'SELECT refresh_mv_precision_at_10();');
-- SELECT cron.schedule('llm-usage-rollup', '0 1 * * *', 'SELECT rollup_llm_usage();');
-- SELECT cron.schedule('check-free-tier-limits', '0 * * * *', 'SELECT check_free_tier_limits();');
```

---

## 5. SEED DATA FOR COLD-START

### 5.1 Workspace Creation Trigger (Application-Level)
```typescript
// lib/db/triggers.ts - Called after workspace insert
export async function seedWorkspaceDefaults(workspaceId: string, icpBuyingSignals: string[]) {
  // 1. Seed source weights
  await supabase.from('weights').upsert([
    { workspace_id: workspaceId, channel: 'linkedin', weight: 1.20 },
    { workspace_id: workspaceId, channel: 'twitter', weight: 0.80 },
    { workspace_id: workspaceId, channel: 'email', weight: 1.00 },
    { workspace_id: workspaceId, channel: 'other', weight: 1.00 },
  ], { onConflict: 'workspace_id,channel' });

  // 2. Seed keyword weights from ICP buying_signals
  if (icpBuyingSignals.length > 0) {
    await supabase.from('keyword_weights').upsert(
      icpBuyingSignals.map(kw => ({ workspace_id: workspaceId, keyword: kw, weight: 1.00 })),
      { onConflict: 'workspace_id,keyword', ignoreDuplicates: true }
    );
  }

  // 3. Create default negative keywords if empty (enforced in UI: min 3)
  // Negative keywords stored in icp_profiles.negative_keywords array
}
```

### 5.2 New Keyword Observation (During Scoring)
```typescript
// lib/scoring.ts - After scoring batch, for each matched keyword not in keyword_weights
async function upsertNewKeywords(workspaceId: string, newKeywords: string[]) {
  await supabase.from('keyword_weights').upsert(
    newKeywords.map(kw => ({ workspace_id: workspaceId, keyword: kw, weight: 1.00 })),
    { onConflict: 'workspace_id,keyword', ignoreDuplicates: true }
  );
}
```

### 5.3 Demo Signal Pack (20 Pre-Scored Posts)
```sql
-- Inserted via migration 022_demo_signal_pack.sql (optional, for Tier 4 fallback)
-- Source: 'concierge' or 'demo'
-- Used when Cloudflare scraper unavailable
```

---

## 6. FOUNDER QUERY LIBRARY (`founder_queries.sql`)

```sql
-- ============================================================
-- WEEKLY FOUNDER AUDIT QUERIES (Run manually or via cron)
-- ============================================================

-- 1. Weight shifts for mature workspaces (≥25 terminal outcomes)
-- Purpose: Verify closed-loop learning is working
SELECT
  wcl.workspace_id,
  w.name AS workspace_name,
  wcl.channel,
  wcl.keyword,
  wcl.old_weight,
  wcl.new_weight,
  wcl.outcome_count,
  wcl.outcome_type,
  wcl.timestamp
FROM weight_change_log wcl
JOIN workspaces w ON w.id = wcl.workspace_id
WHERE wcl.timestamp > NOW() - INTERVAL '7 days'
  AND wcl.workspace_id IN (
    SELECT workspace_id FROM outcomes
    WHERE type IN ('won', 'lost')
    GROUP BY workspace_id
    HAVING COUNT(*) >= 25
  )
ORDER BY wcl.workspace_id, wcl.timestamp DESC;

-- 2. Stuck threads: Contacted >7 days without Quote_Sent
-- Purpose: Identify Iterate Criteria bottleneck (Contacted >7 days without Quote Sent)
SELECT
  t.id AS thread_id,
  t.workspace_id,
  w.name AS workspace_name,
  t.author_name,
  t.company_name,
  t.source_channel,
  t.stage,
  t.updated_at AS last_contacted,
  NOW() - t.updated_at AS days_stuck,
  t.post_text
FROM threads t
JOIN workspaces w ON t.workspace_id = w.id
WHERE t.stage = 'contacted'
  AND t.updated_at < NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM threads t2
    WHERE t2.workspace_id = t.workspace_id
      AND t2.stage IN ('qualified', 'quote_sent', 'won')
      AND t2.created_at > t.created_at
  )
ORDER BY t.updated_at ASC;

-- 3. Precision@10 trend per workspace
-- Purpose: Track Primary Success Metric (Precision@10 Lift)
SELECT
  workspace_id,
  week_start,
  approved_count,
  total_scored,
  precision_at_10,
  LAG(precision_at_10) OVER (PARTITION BY workspace_id ORDER BY week_start) AS prev_week_precision,
  CASE
    WHEN LAG(precision_at_10) OVER (PARTITION BY workspace_id ORDER BY week_start) > 0
    THEN ROUND(((precision_at_10 - LAG(precision_at_10) OVER (PARTITION BY workspace_id ORDER BY week_start))
         / LAG(precision_at_10) OVER (PARTITION BY workspace_id ORDER BY week_start)) * 100, 1)
    ELSE NULL
  END AS week_over_week_lift_pct
FROM mv_precision_at_10
WHERE workspace_id IN (
  SELECT workspace_id FROM workspaces WHERE created_at < NOW() - INTERVAL '14 days'
)
ORDER BY workspace_id, week_start;

-- 4. LLM cost per workspace (alert if >$0.50/30 days)
-- Purpose: Guardrail Metric #2
SELECT
  workspace_id,
  SUM(cost_usd) AS total_cost_30d,
  COUNT(*) AS total_calls,
  SUM(tokens_in) AS total_tokens_in,
  SUM(tokens_out) AS total_tokens_out
FROM llm_usage
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY workspace_id
HAVING SUM(cost_usd) > 0.50
ORDER BY total_cost_30d DESC;

-- 5. Activation funnel (setup → outreach → qualified → won)
-- Purpose: Track Activation Metric & Persevere Criteria
SELECT * FROM v_activation_funnel
WHERE workspace_created > NOW() - INTERVAL '14 days'
ORDER BY workspace_created DESC;

-- 6. Execution Failure flags (weekly review)
-- Purpose: Identify pricing/copy issues (Iterate Criteria)
SELECT
  el.workspace_id,
  w.name AS workspace_name,
  el.thread_id,
  t.author_name,
  t.company_name,
  el.flagged_fields,
  el.timestamp
FROM event_log el
JOIN workspaces w ON el.workspace_id = w.id
JOIN threads t ON el.thread_id = t.id
WHERE el.event_type = 'execution_failure'
  AND el.timestamp > NOW() - INTERVAL '7 days'
ORDER BY el.timestamp DESC;

-- 7. Loss reason distribution
-- Purpose: Validate Split-Attribution formula inputs
SELECT
  workspace_id,
  loss_category,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY workspace_id), 1) AS pct
FROM outcomes
WHERE type = 'lost'
  AND created_at > NOW() - INTERVAL '14 days'
GROUP BY workspace_id, loss_category
ORDER BY workspace_id, count DESC;

-- 8. Source channel performance
-- Purpose: Verify Source Weight updates
SELECT
  t.workspace_id,
  t.source_channel,
  COUNT(*) FILTER (WHERE t.stage IN ('approved','contacted','qualified','quote_sent','won')) AS positive_count,
  COUNT(*) AS total_scored,
  ROUND(COUNT(*) FILTER (WHERE t.stage IN ('approved','contacted','qualified','quote_sent','won'))::numeric / COUNT(*) * 100, 1) AS approval_rate_pct
FROM threads t
WHERE t.created_at > NOW() - INTERVAL '14 days'
GROUP BY t.workspace_id, t.source_channel
ORDER BY t.workspace_id, approval_rate_pct DESC;
```

---

## 7. BACKUP & RESTORE STRATEGY

### 7.1 Automated (Supabase Managed)
- **Point-in-Time Recovery (PITR):** 7 days retention (Free Tier)
- **Daily Backups:** Automatic, stored in Supabase managed storage
- **Manual Backup:** `supabase db dump --data-only > backup.sql` (run before major migrations)

### 7.2 Restore Procedures
| Scenario | Procedure |
|----------|-----------|
| **Accidental data deletion** | Supabase Dashboard → Backups → Restore to specific timestamp (within 7 days) |
| **Schema migration failure** | Run down migration (`supabase migration down`) OR PITR to pre-migration timestamp |
| **Cross-workspace contamination** | PITR to before contamination + pgTAP `test_rls.sql` verification |
| **Complete disaster** | New Supabase project → Apply migrations in order → Restore data from latest dump |

### 7.3 Backup Verification
- **Weekly:** Founder runs `SELECT COUNT(*) FROM workspaces;` on restored staging to verify data integrity
- **Monthly:** Full restore test on staging environment (documented in runbook)

---

## 8. RLS POLICY VERIFICATION (pgTAP)

### `test_rls.sql` (Runs in CI Before Deploy)
```sql
-- pgTAP test for Row Level Security isolation
-- Run: psql -d postgres -f test_rls.sql

BEGIN;

-- Setup: Create 2 test workspaces
INSERT INTO workspaces (id, name, domain) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Workspace A', 'workspace-a.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Workspace B', 'workspace-b.com');

-- Insert test data in each workspace
INSERT INTO threads (id, source_thread_id, workspace_id, source_channel, post_text, url, posted_at, score, stage)
VALUES
  (gen_random_uuid(), 'thread-1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'linkedin', 'Test post A', 'https://linkedin.com/1', NOW(), 80, 'discovered'),
  (gen_random_uuid(), 'thread-2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'twitter', 'Test post B', 'https://twitter.com/2', NOW(), 70, 'discovered');

-- Test 1: Workspace A cannot see Workspace B threads
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"workspace_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';
SELECT * FROM threads;  -- Should return 1 row (Workspace A only)

-- Test 2: Workspace B cannot see Workspace A threads
SET LOCAL request.jwt.claims = '{"workspace_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}';
SELECT * FROM threads;  -- Should return 1 row (Workspace B only)

-- Test 3: Cross-workspace JOIN returns 0 rows
SET LOCAL request.jwt.claims = '{"workspace_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';
SELECT t.*, o.* FROM threads t JOIN outcomes o ON t.id = o.thread_id;  -- Should return 0 rows (no outcomes yet)

-- Test 4: Insert with wrong workspace_id fails
SET LOCAL request.jwt.claims = '{"workspace_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';
INSERT INTO threads (source_thread_id, workspace_id, source_channel, post_text, url, posted_at, score, stage)
VALUES ('thread-3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'linkedin', 'Hack attempt', 'https://x.com', NOW(), 50, 'discovered');
-- Should fail: ERROR: new row violates row-level security policy

ROLLBACK;  -- Clean up test data
```

---

## 9. CROSS-REFERENCE CONSISTENCY CHECKLIST

| Table | PRD.md | ARCHITECTURE.md | PROMPTS.md | MVP.md Appendix A |
|-------|--------|-----------------|------------|-------------------|
| workspaces | ✅ | ✅ | ✅ | ✅ |
| icp_profiles | ✅ | ✅ | ✅ | ✅ |
| threads | ✅ | ✅ | ✅ | ✅ |
| outcomes | ✅ | ✅ | ✅ | ✅ |
| quotes | ✅ | ✅ | ✅ | ✅ |
| invoices | ✅ | ✅ | ✅ | ✅ |
| verified_reviews | ✅ | ✅ | ✅ | ✅ |
| keyword_weights | ✅ | ✅ | ✅ | ✅ |
| weights | ✅ | ✅ | ✅ | ✅ |
| communication_consent | ✅ | ✅ | ✅ | ✅ |
| suppressions | ✅ | ✅ | ✅ | ✅ |
| events | ✅ | ✅ | ✅ | ✅ |
| event_log | ✅ | ✅ | ✅ | ✅ |
| job_failures | ✅ | ✅ | ✅ | ✅ |
| llm_usage | ✅ | ✅ | ✅ | ✅ |
| weight_change_log | ✅ | ✅ | ✅ | ✅ |
| outreach_log | ✅ | ✅ | ✅ | ✅ |
| mv_precision_at_10 | ✅ | ✅ | ✅ | ✅ |
| v_execution_failures | ✅ | ✅ | ✅ | ✅ |

**Key Column Name Consistency:**
- `source_thread_id` (TEXT, not UUID) — external IDs vary by platform
- `communication_consent` — not "consent" (DPDP §6 verifiable consent)
- `Quote Sent` stage → `quote_sent` in DB (snake_case)
- `loss_category` values: `lead_fit_failure` | `execution_failure`
- `source` values: `winthread_signal` | `manual_import` | `crm_sync`
- `weight_delta` JSONB: `{source_weight_delta, keyword_weight_deltas: [{keyword, delta}]}`

---

*End of DATABASE.md — Cross-referenced with PRD.md, ARCHITECTURE.md, PROMPTS.md for implementation consistency.*