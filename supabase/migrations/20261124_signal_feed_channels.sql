-- supabase/migrations/20261124_signal_feed_channels.sql
-- 1. Update source_channel check constraints
ALTER TABLE IF EXISTS threads DROP CONSTRAINT IF EXISTS threads_source_channel_check;
ALTER TABLE IF EXISTS threads ADD CONSTRAINT threads_source_channel_check 
  CHECK (source_channel IN ('reddit', 'hackernews', 'bluesky', 'linkedin', 'twitter', 'email', 'other'));

ALTER TABLE IF EXISTS weights DROP CONSTRAINT IF EXISTS weights_channel_check;
ALTER TABLE IF EXISTS weights ADD CONSTRAINT weights_channel_check 
  CHECK (channel IN ('reddit', 'hackernews', 'bluesky', 'linkedin', 'twitter', 'email', 'other'));

-- 2. Create raw_signals table
CREATE TABLE IF NOT EXISTS raw_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  author TEXT,
  thread_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT raw_signals_source_external_id_key UNIQUE(source, external_id)
);

-- Service-role access only for raw_signals
REVOKE ALL ON raw_signals FROM anon, authenticated;
GRANT ALL ON raw_signals TO service_role;
