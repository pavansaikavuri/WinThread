-- Migration: 20261124_enable_rls_policies.sql
-- Description: Consolidated, production-grade Row Level Security across all 18 tables.
-- Follows strict tenant isolation, safe UUID casting with NULLIF, and firehose protection.

-- ============================================================================
-- 1. Table 1: workspaces (Primary Key: id)
-- ============================================================================
ALTER TABLE IF EXISTS workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workspace_isolation ON workspaces;
CREATE POLICY workspace_isolation ON workspaces
  FOR ALL
  TO authenticated
  USING (id = (NULLIF(auth.jwt() ->> 'workspace_id', ''))::uuid)
  WITH CHECK (id = (NULLIF(auth.jwt() ->> 'workspace_id', ''))::uuid);

-- ============================================================================
-- 2. Tables 2-13: Standard Tenant Tables (workspace_id)
-- ============================================================================
DO $$
DECLARE
  t TEXT;
  tenant_tables TEXT[] := ARRAY[
    'icp_profiles',
    'threads',
    'outcomes',
    'quotes',
    'invoices',
    'verified_reviews',
    'keyword_weights',
    'weights',
    'communication_consent',
    'suppressions',
    'events',
    'event_log'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
      EXECUTE format('DROP POLICY IF EXISTS workspace_isolation ON %I;', t);
      EXECUTE format('
        CREATE POLICY workspace_isolation ON %I
          FOR ALL
          TO authenticated
          USING (workspace_id = (NULLIF(auth.jwt() ->> ''workspace_id'', ''''))::uuid)
          WITH CHECK (workspace_id = (NULLIF(auth.jwt() ->> ''workspace_id'', ''''))::uuid);
      ', t);
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 3. Table 14: job_failures (Nullable workspace_id -> Strict Tenant Isolation)
-- ============================================================================
-- SYSTEM JOBS (workspace_id IS NULL) contain internal stack traces and secrets.
-- Tenants can ONLY see and manage failures belonging to their workspace.
-- System logs remain accessible only to service_role (which bypasses RLS).
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'job_failures') THEN
    ALTER TABLE job_failures ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS workspace_isolation ON job_failures;
    CREATE POLICY workspace_isolation ON job_failures
      FOR ALL
      TO authenticated
      USING (workspace_id = (NULLIF(auth.jwt() ->> 'workspace_id', ''))::uuid)
      WITH CHECK (workspace_id = (NULLIF(auth.jwt() ->> 'workspace_id', ''))::uuid);
  END IF;
END $$;

-- ============================================================================
-- 4. Tables 15-17: Additional Supporting Tenant Tables (workspace_id)
-- ============================================================================
DO $$
DECLARE
  t TEXT;
  supporting_tables TEXT[] := ARRAY[
    'llm_usage',
    'weight_change_log',
    'outreach_log'
  ];
BEGIN
  FOREACH t IN ARRAY supporting_tables LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
      EXECUTE format('DROP POLICY IF EXISTS workspace_isolation ON %I;', t);
      EXECUTE format('
        CREATE POLICY workspace_isolation ON %I
          FOR ALL
          TO authenticated
          USING (workspace_id = (NULLIF(auth.jwt() ->> ''workspace_id'', ''''))::uuid)
          WITH CHECK (workspace_id = (NULLIF(auth.jwt() ->> ''workspace_id'', ''''))::uuid);
      ', t);
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 5. Table 18: raw_signals (Global Shared Ingestion Pool)
-- ============================================================================
-- Dedicated deduplication firehose. Has NO workspace_id.
-- Enabling RLS with 0 tenant policies blocks direct anon/authenticated access.
-- Exclusively written/read by backend pipeline workers using service_role key.
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'raw_signals') THEN
    ALTER TABLE raw_signals ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS workspace_isolation ON raw_signals;
    DROP POLICY IF EXISTS raw_signals_tenant_deny ON raw_signals;
    -- Zero tenant policies created. Default-deny strictly enforced for authenticated/anon.
  END IF;
END $$;
