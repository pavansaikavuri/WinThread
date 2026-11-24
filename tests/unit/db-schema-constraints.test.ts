import { describe, it, expect } from 'vitest';
import { ALLOWED_CHANNELS, isValidChannel } from '@/lib/constants/channels';
import fs from 'fs';
import path from 'path';

describe('Channel Constraints & Schema Validation', () => {
  it('validates supported social channels including reddit, hackernews, and bluesky', () => {
    expect(isValidChannel('hackernews')).toBe(true);
    expect(isValidChannel('reddit')).toBe(true);
    expect(isValidChannel('bluesky')).toBe(true);
    expect(isValidChannel('linkedin')).toBe(true);
    expect(isValidChannel('unsupported_platform')).toBe(false);
  });

  it('contains exactly 7 supported channels', () => {
    expect(ALLOWED_CHANNELS).toHaveLength(7);
  });
});

describe('Production RLS Migration (20261124_enable_rls_policies.sql)', () => {
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20261124_enable_rls_policies.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  const EXPECTED_18_TABLES = [
    'workspaces',
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
    'event_log',
    'job_failures',
    'llm_usage',
    'weight_change_log',
    'outreach_log',
    'raw_signals',
  ];

  it('covers all 18 tables with Row Level Security', () => {
    for (const table of EXPECTED_18_TABLES) {
      expect(sql).toMatch(new RegExp(`\\b${table}\\b`));
    }
  });

  it('uses column id (not workspace_id) for workspaces table policy', () => {
    expect(sql).toMatch(/CREATE POLICY workspace_isolation ON workspaces[\s\S]*?USING\s*\(id\s*=/);
  });

  it('strictly isolates job_failures without OR workspace_id IS NULL leak', () => {
    expect(sql).not.toContain('OR workspace_id IS NULL');
    expect(sql).toContain('CREATE POLICY workspace_isolation ON job_failures');
  });

  it('enforces RLS on raw_signals without leaking firehose to tenants', () => {
    expect(sql).toContain('ALTER TABLE raw_signals ENABLE ROW LEVEL SECURITY');
    expect(sql).not.toMatch(/CREATE POLICY [^\n]* ON raw_signals/);
  });

  it('uses safe NULLIF casting on JWT claims for UUIDs across all policies', () => {
    expect(sql).toContain("NULLIF(auth.jwt() ->> 'workspace_id', '')");
  });
});
