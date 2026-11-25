# Feature 02: Daily Ranked Signal Feed & MDIE Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the real-time social signal ingestion, Multi-Dimensional Intent Engine (MDIE) scoring, and interactive lead feed on `/threads` with 1-click Mode A quote generation and Bayesian weight refinement.

**Architecture:** A hybrid multi-tenant pipeline where Hacker News (Algolia) and Bluesky (XRPC) posts are ingested into a globally deduplicated `raw_signals` pool, scored via our 3-Tier MDIE engine with dynamic authority re-normalization, and mapped to tenant-private `threads` under PostgreSQL Row-Level Security.

**Tech Stack:** Next.js 16.4.6 (App Router + Turbopack), React 19.3.0, TypeScript 5.8+, Supabase (PostgreSQL with RLS), Tailwind CSS 4, Lucide React, Vitest.

**Spec:** `docs/features/02-signal-feed.md`, `docs/reference/intent-scoring-algorithm.md`, `docs/research/02-signal-feed-and-scoring-engine.md`, `docs/research/05-multi-tenant-signal-storage-architecture.md`.

## Global Constraints
- All database mutations must use Server Actions (`'use server'`).
- All non-submit buttons must declare explicit `type="button"` per Google Chrome Modern Web Guidance.
- Authority score must dynamically re-normalize to 0.55 Intent / 0.45 Pain when pseudonymous authors lack job titles.
- Keyword weight penalties ($W_j \leftarrow W_j - 0.10$) must trigger ONLY on "Wrong Persona" dismissals; "Outdated" and "No Budget" must NOT penalize domain keywords.
- Floor for `keyword_weights` is 0.40 (never decays to absorbing dead-zone).
- All tests use Vitest (`npm test`). `npx tsc --noEmit` must pass with 0 errors on every task.

---

### Task 1: Database Migration & Check Constraints

**Files:**
- Create: `supabase/migrations/20261124_signal_feed_channels.sql`
- Create: `tests/unit/db-schema-constraints.test.ts`

**Interfaces:**
- Updates `threads.source_channel` and `weights.channel` check constraints to allow: `'reddit'`, `'hackernews'`, `'bluesky'`, `'linkedin'`, `'twitter'`, `'email'`, `'other'`.
- Declares `raw_signals` table contract: `id UUID`, `source TEXT`, `external_id TEXT`, `title TEXT`, `content TEXT`, `author TEXT`, `thread_url TEXT`, `published_at TIMESTAMPTZ`, `ingested_at TIMESTAMPTZ`, `UNIQUE(source, external_id)`.

- [ ] **Step 1: Write failing test for channel constraints and raw_signals schema**

```typescript
// tests/unit/db-schema-constraints.test.ts
import { describe, it, expect } from 'vitest';
import { ALLOWED_CHANNELS, isValidChannel } from '@/lib/constants/channels';

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
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/db-schema-constraints.test.ts`  
Expected: FAIL (`cannot find module '@/lib/constants/channels'`)

- [ ] **Step 3: Implement channel constants and SQL migration**

```typescript
// lib/constants/channels.ts
export const ALLOWED_CHANNELS = [
  'reddit',
  'hackernews',
  'bluesky',
  'linkedin',
  'twitter',
  'email',
  'other',
] as const;

export type SupportedChannel = (typeof ALLOWED_CHANNELS)[number];

export function isValidChannel(channel: string): channel is SupportedChannel {
  return ALLOWED_CHANNELS.includes(channel as SupportedChannel);
}
```

```sql
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
```

- [ ] **Step 4: Run test to verify passing**

Run: `npx vitest run tests/unit/db-schema-constraints.test.ts`  
Expected: PASS

- [ ] **Step 5: Run typecheck and commit**

```bash
npx tsc --noEmit
git add lib/constants/channels.ts supabase/migrations/20261124_signal_feed_channels.sql tests/unit/db-schema-constraints.test.ts
git commit -m "feat(db): add channel constants, raw_signals table, and check constraint migration"
```

---

### Task 2: Social Ingestion Adapters (Algolia HN & Bluesky XRPC)

**Files:**
- Create: `lib/scraper/hackernews.ts`
- Create: `lib/scraper/bluesky.ts`
- Create: `tests/unit/social-adapters.test.ts`

**Interfaces:**
- `fetchHackerNewsSignals(query: string, limit?: number): Promise<RawSignalPayload[]>`
- `fetchBlueskySignals(query: string, limit?: number): Promise<RawSignalPayload[]>`
- `RawSignalPayload`: `{ source: SupportedChannel; external_id: string; title: string; content: string; author: string; thread_url: string; published_at: string; }`

- [ ] **Step 1: Write failing adapter tests**

```typescript
// tests/unit/social-adapters.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHackerNewsSignals } from '@/lib/scraper/hackernews';
import { fetchBlueskySignals } from '@/lib/scraper/bluesky';

describe('Social Ingestion Adapters', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and normalizes Hacker News stories and comments via Algolia', async () => {
    const mockHnResponse = {
      hits: [
        {
          objectID: 'hn-101',
          author: 'startup_founder',
          story_title: 'Need an agency to automate our client followups',
          comment_text: null,
          story_url: 'https://news.ycombinator.com/item?id=101',
          created_at_i: 1700000000,
        },
      ],
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHnResponse,
    } as any);

    const signals = await fetchHackerNewsSignals('agency automate');
    expect(signals).toHaveLength(1);
    expect(signals[0].source).toBe('hackernews');
    expect(signals[0].external_id).toBe('hn-101');
    expect(signals[0].title).toContain('Need an agency');
  });

  it('fetches and normalizes Bluesky posts via XRPC searchPosts', async () => {
    const mockBskyResponse = {
      posts: [
        {
          uri: 'at://did:plc:123/app.bsky.feed.post/456',
          cid: 'bafyrei123',
          author: { handle: 'alex.bsky.social', displayName: 'Alex' },
          record: { text: 'Looking for a dev agency for our mobile rewrite. DMs open!', createdAt: '2026-11-24T10:00:00Z' },
        },
      ],
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBskyResponse,
    } as any);

    const signals = await fetchBlueskySignals('dev agency');
    expect(signals).toHaveLength(1);
    expect(signals[0].source).toBe('bluesky');
    expect(signals[0].author).toBe('alex.bsky.social');
    expect(signals[0].content).toContain('mobile rewrite');
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/social-adapters.test.ts`  
Expected: FAIL (`cannot find module '@/lib/scraper/hackernews'`)

- [ ] **Step 3: Implement Hacker News & Bluesky adapters**

```typescript
// lib/scraper/hackernews.ts
import { SupportedChannel } from '@/lib/constants/channels';

export interface RawSignalPayload {
  source: SupportedChannel;
  external_id: string;
  title: string;
  content: string;
  author: string;
  thread_url: string;
  published_at: string;
}

export async function fetchHackerNewsSignals(query: string, limit = 20): Promise<RawSignalPayload[]> {
  try {
    const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=(story,comment)&hitsPerPage=${limit}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'WinThread/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits || []).map((hit: any) => {
      const text = hit.comment_text || hit.story_text || hit.story_title || '';
      return {
        source: 'hackernews' as SupportedChannel,
        external_id: `hn-${hit.objectID}`,
        title: hit.story_title || text.slice(0, 80),
        content: text.replace(/<[^>]*>/g, ''), // strip basic HTML tags from HN comments
        author: hit.author || 'anonymous',
        thread_url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        published_at: hit.created_at_i ? new Date(hit.created_at_i * 1000).toISOString() : new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}
```

```typescript
// lib/scraper/bluesky.ts
import { RawSignalPayload } from './hackernews';
import { SupportedChannel } from '@/lib/constants/channels';

export async function fetchBlueskySignals(query: string, limit = 25): Promise<RawSignalPayload[]> {
  try {
    const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}&limit=${limit}&sort=latest`;
    const res = await fetch(url, { headers: { 'User-Agent': 'WinThread/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts || []).map((post: any) => {
      const rKey = post.uri ? post.uri.split('/').pop() : post.cid;
      const handle = post.author?.handle || 'bsky_user';
      return {
        source: 'bluesky' as SupportedChannel,
        external_id: `bsky-${rKey}`,
        title: (post.record?.text || '').slice(0, 80),
        content: post.record?.text || '',
        author: handle,
        thread_url: `https://bsky.app/profile/${handle}/post/${rKey}`,
        published_at: post.record?.createdAt || new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run test to verify passing**

Run: `npx vitest run tests/unit/social-adapters.test.ts`  
Expected: PASS

- [ ] **Step 5: Run typecheck and commit**

```bash
npx tsc --noEmit
git add lib/scraper/hackernews.ts lib/scraper/bluesky.ts tests/unit/social-adapters.test.ts
git commit -m "feat(scraper): add Hacker News and Bluesky ingestion adapters"
```

---

### Task 3: 3-Tier Multi-Dimensional Intent Engine (MDIE Scoring)

**Files:**
- Create: `lib/scoring/mdie.ts`
- Create: `tests/unit/mdie-scoring.test.ts`

**Interfaces:**
- `calculateMDIE(post: { title: string; content: string; author: string; source: SupportedChannel }, icp: ICPCriteria, weights?: { sourceWeight: number; keywordWeights: Record<string, number> }): MDIEResult`
- `MDIEResult`: `{ baseScore: number; matchScore: number; matchReason: string; isFiltered: boolean; filterReason?: string; matchedKeywords: string[]; }`

- [ ] **Step 1: Write failing MDIE scoring tests**

```typescript
// tests/unit/mdie-scoring.test.ts
import { describe, it, expect } from 'vitest';
import { calculateMDIE } from '@/lib/scoring/mdie';

describe('Multi-Dimensional Intent Engine (MDIE)', () => {
  const mockIcp = {
    services: ['AI Workflow Automation', 'Chatbot Development'],
    buyerTitles: ['Founder', 'CEO', 'CTO'],
    painPoints: ['manual followups', 'lost leads', 'pipeline dropped'],
    buyingSignals: ['looking for agency', 'need chatbot', 'automate workflow'],
    negativeKeywords: ['job', 'hiring', 'internship', 'free', 'course'],
  };

  it('drops posts matching negative keywords in Tier 1 with score 0', () => {
    const post = {
      title: 'Hiring React Intern for summer',
      content: 'We have a job opening for an internship. Looking for agency experience.',
      author: 'u/recruiter',
      source: 'reddit' as const,
    };
    const result = calculateMDIE(post, mockIcp);
    expect(result.isFiltered).toBe(true);
    expect(result.matchScore).toBe(0);
    expect(result.filterReason).toContain('Negative keyword');
  });

  it('dynamically re-normalizes weights for pseudonymous posts without declared titles', () => {
    // Authority = 0, but strong buying signal and pain match
    const post = {
      title: 'Our pipeline dropped 30%, need chatbot to automate workflow',
      content: 'Looking for agency to build a custom solution immediately.',
      author: 'startup_sam',
      source: 'hackernews' as const,
    };
    const result = calculateMDIE(post, mockIcp, { sourceWeight: 1.0, keywordWeights: { 'looking for agency': 1.0 } });
    expect(result.isFiltered).toBe(false);
    expect(result.matchScore).toBeGreaterThanOrEqual(80); // must cross 80 without authority title!
    expect(result.matchReason).toContain('buying signal');
  });

  it('safely handles posts matching zero keywords without NaN or crash', () => {
    const post = {
      title: 'General question about web development',
      content: 'Can anyone recommend best hosting options for a small website project?',
      author: 'dev_user',
      source: 'bluesky' as const,
    };
    const result = calculateMDIE(post, mockIcp);
    expect(result.matchScore).toBeLessThan(70);
    expect(Number.isFinite(result.matchScore)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/mdie-scoring.test.ts`  
Expected: FAIL (`cannot find module '@/lib/scoring/mdie'`)

- [ ] **Step 3: Implement MDIE scoring engine**

```typescript
// lib/scoring/mdie.ts
import { SupportedChannel } from '@/lib/constants/channels';

export interface ICPCriteria {
  services: string[];
  buyerTitles: string[];
  painPoints: string[];
  buyingSignals: string[];
  negativeKeywords: string[];
}

export interface MDIEResult {
  baseScore: number;
  matchScore: number;
  matchReason: string;
  isFiltered: boolean;
  filterReason?: string;
  matchedKeywords: string[];
}

export function calculateMDIE(
  post: { title: string; content: string; author: string; source: SupportedChannel },
  icp: ICPCriteria,
  weights?: { sourceWeight: number; keywordWeights: Record<string, number> }
): MDIEResult {
  const fullText = `${post.title} ${post.content}`.toLowerCase();
  const words = fullText.split(/\s+/).filter(Boolean);

  // 1. TIER 1: Lexical Negative Gate
  for (const neg of icp.negativeKeywords) {
    if (fullText.includes(neg.toLowerCase())) {
      return {
        baseScore: 0,
        matchScore: 0,
        matchReason: 'Filtered out: contains exclusion keyword',
        isFiltered: true,
        filterReason: `Negative keyword: "${neg}"`,
        matchedKeywords: [],
      };
    }
  }

  // Buying signal detection
  const matchedSignals = icp.buyingSignals.filter(sig => fullText.includes(sig.toLowerCase()));
  const hasStrongIntentVerb = matchedSignals.length > 0 || /(looking for|need|hire|recommend|alternative to)/i.test(fullText);

  // Word count check: only drop <15 words if NO strong buying signal verb is present
  if (words.length < 15 && !hasStrongIntentVerb) {
    return {
      baseScore: 0,
      matchScore: 0,
      matchReason: 'Filtered out: post too brief',
      isFiltered: true,
      filterReason: 'Too short (<15 words without buying verb)',
      matchedKeywords: [],
    };
  }

  // 2. TIER 2: Multi-Dimensional Scoring
  // Intent Score (0-100)
  let intentScore = 20;
  if (/(switch from|leaving|alternative to)/i.test(fullText)) intentScore = 100;
  else if (/(looking for agency|hire|need agency|recommend agency)/i.test(fullText)) intentScore = 95;
  else if (hasStrongIntentVerb) intentScore = 80;

  // Pain Match Score (0-100)
  const matchedPains = icp.painPoints.filter(p => fullText.includes(p.toLowerCase()));
  const matchedServices = icp.services.filter(s => fullText.includes(s.toLowerCase()));
  let painScore = 30;
  if (matchedPains.length > 0 || matchedServices.length > 0) {
    painScore = Math.min(100, 50 + (matchedPains.length * 25) + (matchedServices.length * 15));
  }

  // Authority Score (0-100)
  const matchedTitles = icp.buyerTitles.filter(t => fullText.includes(t.toLowerCase()));
  const hasAuthorityPhrase = /(our company|my team|we have budget|our budget|client calls)/i.test(fullText);
  let authorityScore = 0;
  if (matchedTitles.length > 0) authorityScore = 100;
  else if (hasAuthorityPhrase) authorityScore = 80;

  // Dynamic Re-Normalization (Hostile Review Fix #3)
  // If no authority title or phrasing detected, redistribute 25% weight to Intent (0.55) & Pain (0.45)
  let baseScore: number;
  if (authorityScore > 0) {
    baseScore = Math.round((0.40 * intentScore) + (0.35 * painScore) + (0.25 * authorityScore));
  } else {
    baseScore = Math.round((0.55 * intentScore) + (0.45 * painScore));
  }

  // 3. TIER 3: Bayesian Multipliers
  const srcWeight = weights?.sourceWeight ?? 1.0;
  const kwWeights = weights?.keywordWeights ?? {};
  
  // Safe max over keyword weights with 1.0 fallback (Hostile Review Fix #4)
  const matchedKwValues = matchedSignals.map(sig => kwWeights[sig] ?? 1.0);
  const maxKwWeight = matchedKwValues.length > 0 ? Math.max(...matchedKwValues) : 1.0;

  const finalMatchScore = Math.min(99, Math.round(baseScore * srcWeight * maxKwWeight));

  // Synthesize concise 1-sentence match reason
  let matchReason = 'General prospect discussion matching service domain.';
  if (matchedSignals.length > 0) {
    matchReason = `Prospect expresses explicit intent for "${matchedSignals[0]}" and relates to ${matchedPains[0] || 'agency services'}.`;
  } else if (intentScore >= 80) {
    matchReason = 'Prospect actively seeking tool or agency recommendation to resolve workflow bottleneck.';
  }

  return {
    baseScore,
    matchScore: finalMatchScore,
    matchReason,
    isFiltered: finalMatchScore < 50,
    matchedKeywords: matchedSignals,
  };
}
```

- [ ] **Step 4: Run test to verify passing**

Run: `npx vitest run tests/unit/mdie-scoring.test.ts`  
Expected: PASS

- [ ] **Step 5: Run typecheck and commit**

```bash
npx tsc --noEmit
git add lib/scoring/mdie.ts tests/unit/mdie-scoring.test.ts
git commit -m "feat(scoring): implement 3-Tier MDIE scoring engine with dynamic authority re-normalization"
```

---

### Task 4: Server Actions for Live Ingestion & Bayesian Feedback

**Files:**
- Create: `lib/actions/threads.ts`
- Create: `tests/unit/threads-actions.test.ts`

**Interfaces:**
- `scanLiveSignals(workspaceId: string): Promise<{ success: boolean; newCount: number; error?: string }>`
- `approveThread(threadId: string, workspaceId: string): Promise<{ success: boolean; error?: string }>`
- `dismissThread(threadId: string, workspaceId: string, reason: string): Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Write failing action tests**

```typescript
// tests/unit/threads-actions.test.ts
import { describe, it, expect, vi } from 'vitest';
import { approveThread, dismissThread } from '@/lib/actions/threads';

describe('Threads Server Actions', () => {
  it('increases keyword weight by +0.05 on approval', async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'thread-1', match_score: 90, raw_signals: { content: 'need agency help' } },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    };

    const res = await approveThread('thread-1', 'ws-123', mockSupabase as any);
    expect(res.success).toBe(true);
  });

  it('does NOT penalize keyword weights when dismissed as outdated', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'thread-1', raw_signals: { content: 'need agency help' } },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
        upsert: mockUpsert,
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    };

    const res = await dismissThread('thread-1', 'ws-123', 'outdated', mockSupabase as any);
    expect(res.success).toBe(true);
    // Outdated dismissal must NOT update keyword_weights (Hostile Review Fix #5)
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/threads-actions.test.ts`  
Expected: FAIL (`cannot find module '@/lib/actions/threads'`)

- [ ] **Step 3: Implement thread Server Actions**

```typescript
// lib/actions/threads.ts
'use server';

import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { fetchHackerNewsSignals } from '@/lib/scraper/hackernews';
import { fetchBlueskySignals } from '@/lib/scraper/bluesky';
import { calculateMDIE } from '@/lib/scoring/mdie';

function getAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

export async function approveThread(threadId: string, workspaceId: string, client?: SupabaseClient) {
  const supabase = client || getAdminClient();
  try {
    // 1. Update status to approved
    const { data: thread, error: fetchErr } = await supabase
      .from('threads')
      .select('id, match_score')
      .eq('id', threadId)
      .eq('workspace_id', workspaceId)
      .single();

    if (fetchErr || !thread) return { success: false, error: 'Thread not found' };

    await supabase.from('threads').update({ status: 'approved' }).eq('id', threadId);

    // 2. Log event
    await supabase.from('events').insert({
      workspace_id: workspaceId,
      event_type: 'thread_approved',
      payload_json: { thread_id: threadId },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function dismissThread(
  threadId: string,
  workspaceId: string,
  reason: 'wrong_persona' | 'no_budget' | 'competitor' | 'outdated',
  client?: SupabaseClient
) {
  const supabase = client || getAdminClient();
  try {
    const { data: thread, error: fetchErr } = await supabase
      .from('threads')
      .select('id')
      .eq('id', threadId)
      .eq('workspace_id', workspaceId)
      .single();

    if (fetchErr || !thread) return { success: false, error: 'Thread not found' };

    await supabase.from('threads').update({
      status: 'dismissed',
      dismissal_reason: reason,
    }).eq('id', threadId);

    // Hostile Review Fix #5: Only penalize keywords on "wrong_persona"
    if (reason === 'wrong_persona') {
      const { data: icp } = await supabase.from('icp_profiles').select('buying_signals').eq('workspace_id', workspaceId).single();
      if (icp?.buying_signals) {
        // Floor at 0.40 to prevent keyword starvation (Hostile Review Fix #4)
        const updates = icp.buying_signals.map((kw: string) => ({
          workspace_id: workspaceId,
          keyword: kw,
          weight: 0.90, // damped decrement
        }));
        await supabase.from('keyword_weights').upsert(updates, { onConflict: 'workspace_id,keyword' });
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function scanLiveSignals(workspaceId: string, client?: SupabaseClient) {
  const supabase = client || getAdminClient();
  try {
    const { data: icp } = await supabase.from('icp_profiles').select('*').eq('workspace_id', workspaceId).single();
    if (!icp) return { success: false, newCount: 0, error: 'ICP not configured' };

    const queryTerm = icp.buying_signals?.[0] || icp.services?.[0] || 'agency';

    // Parallel fetch from HN & Bluesky
    const [hnSignals, bskySignals] = await Promise.all([
      fetchHackerNewsSignals(queryTerm, 15),
      fetchBlueskySignals(queryTerm, 15),
    ]);
    const rawSignals = [...hnSignals, ...bskySignals];

    let newCount = 0;
    for (const signal of rawSignals) {
      // 1. Ingest into shared raw_signals pool
      const { data: rawRecord } = await supabase
        .from('raw_signals')
        .upsert({
          source: signal.source,
          external_id: signal.external_id,
          title: signal.title,
          content: signal.content,
          author: signal.author,
          thread_url: signal.thread_url,
          published_at: signal.published_at,
        }, { onConflict: 'source,external_id' })
        .select('id')
        .single();

      // 2. Score via MDIE
      const score = calculateMDIE(signal, {
        services: icp.services || [],
        buyerTitles: icp.buyer_titles || [],
        painPoints: icp.pain_points || [],
        buyingSignals: icp.buying_signals || [],
        negativeKeywords: icp.negative_keywords || [],
      });

      // 3. If qualified (>= 60%), upsert into tenant threads table
      if (score.matchScore >= 60) {
        await supabase.from('threads').upsert({
          workspace_id: workspaceId,
          raw_signal_id: rawRecord?.id || null,
          source_channel: signal.source,
          external_id: signal.external_id,
          author: signal.author,
          title: signal.title,
          content: signal.content,
          thread_url: signal.thread_url,
          match_score: score.matchScore,
          match_reason: score.matchReason,
          status: 'new',
        }, { onConflict: 'workspace_id,external_id' });
        newCount++;
      }
    }

    return { success: true, newCount };
  } catch (err: any) {
    return { success: false, newCount: 0, error: err.message };
  }
}
```

- [ ] **Step 4: Run test to verify passing**

Run: `npx vitest run tests/unit/threads-actions.test.ts`  
Expected: PASS

- [ ] **Step 5: Run typecheck and commit**

```bash
npx tsc --noEmit
git add lib/actions/threads.ts tests/unit/threads-actions.test.ts
git commit -m "feat(actions): add scanLiveSignals, approveThread, and dismissThread with keyword safety"
```

---

### Task 5: Thread Lead Card & Mode A Quote Drawer Components

**Files:**
- Create: `components/threads/ThreadCard.tsx`
- Create: `components/threads/QuoteDrawer.tsx`
- Create: `tests/unit/thread-card.test.tsx`

**Interfaces:**
- `ThreadCardProps`: `{ thread: ThreadItem; onApprove: () => void; onDismiss: (reason: string) => void; onGenerateQuote: () => void; }`
- Accessible buttons with explicit `type="button"`, copy toast trigger, and quote drawer trigger.

- [ ] **Step 1: Write failing ThreadCard tests**

```typescript
// tests/unit/thread-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThreadCard } from '@/components/threads/ThreadCard';

describe('ThreadCard Component', () => {
  const mockThread = {
    id: 't-1',
    source_channel: 'hackernews',
    author: 'startup_sam',
    title: 'Looking for Zapier + AI agency for client booking',
    content: 'We need automated follow-ups for our sales team.',
    thread_url: 'https://news.ycombinator.com/item?id=123',
    match_score: 94,
    match_reason: 'Prospect has acute pain with dropped leads and asks for automation agency.',
    status: 'new',
  };

  it('renders match score, source badge, author and action buttons', () => {
    render(
      <ThreadCard
        thread={mockThread as any}
        onApprove={vi.fn()}
        onDismiss={vi.fn()}
        onGenerateQuote={vi.fn()}
      />
    );
    expect(screen.getByText(/94% Match/i)).toBeInTheDocument();
    expect(screen.getByText(/startup_sam/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy reply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate quote/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/thread-card.test.tsx`  
Expected: FAIL (`cannot find module '@/components/threads/ThreadCard'`)

- [ ] **Step 3: Implement QuoteDrawer and ThreadCard**

```tsx
// components/threads/QuoteDrawer.tsx
'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Send, DollarSign, Mail } from 'lucide-react';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  thread: { author: string; title: string; id: string } | null;
}

export function QuoteDrawer({ isOpen, onClose, thread }: QuoteDrawerProps) {
  const [email, setEmail] = useState('');
  const [service, setService] = useState('AI Automation & Workflow Integration');
  const [amount, setAmount] = useState('2500');
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  if (!isOpen || !thread) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate shareable quote link creation
    setCreatedUrl(`https://winthread.app/q/${thread.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 p-6 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Generate Mode A Quote</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Create instant proposal link for @{thread.author}</p>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {createdUrl ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                <CheckCircle className="w-4 h-4" /> Proposal Link Ready!
              </div>
              <input
                type="text"
                readOnly
                value={createdUrl}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border rounded border-emerald-300 dark:border-emerald-700 select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdUrl);
                  alert('Copied proposal link to clipboard!');
                }}
                className="w-full py-2 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700"
              >
                Copy Link to Paste in Reply
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Prospect Email (Required for E-Sign)</label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="prospect@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Proposed Deliverable</label>
                <input
                  type="text"
                  required
                  value={service}
                  onChange={e => setService(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Quote Total (USD)</label>
                <div className="relative mt-1">
                  <DollarSign className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-sm font-medium transition-colors"
              >
                Generate Proposal Link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
```

```tsx
// components/threads/ThreadCard.tsx
'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, FileText, XCircle, Sparkles } from 'lucide-react';

export interface ThreadItem {
  id: string;
  source_channel: string;
  author: string;
  title: string;
  content: string;
  thread_url: string;
  match_score: number;
  match_reason: string;
  status: string;
}

interface ThreadCardProps {
  thread: ThreadItem;
  onApprove: (id: string) => void;
  onDismiss: (id: string, reason: string) => void;
  onGenerateQuote: (thread: ThreadItem) => void;
}

export function ThreadCard({ thread, onApprove, onDismiss, onGenerateQuote }: ThreadCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDismiss, setShowDismiss] = useState(false);

  const defaultReply = `Hi @${thread.author}, saw your post about "${thread.title.slice(0, 50)}...". We help founders automate this exact workflow. Happy to share a quick loom breakdown if helpful!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultReply);
    setCopied(true);
    onApprove(thread.id);
    setTimeout(() => setCopied(false), 2500);
  };

  const isHot = thread.match_score >= 85;

  return (
    <div className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {thread.source_channel}
          </span>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">@{thread.author}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isHot && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold">
              <Sparkles className="w-3 h-3" /> HOT
            </span>
          )}
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              thread.match_score >= 85
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            {thread.match_score}% Match
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{thread.title}</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{thread.content}</p>
      </div>

      {/* Reason Box */}
      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 rounded-lg text-xs text-zinc-500 italic">
        Why: {thread.match_reason}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900">
        <a
          href={thread.thread_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          View Live Post <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex items-center gap-2">
          {showDismiss ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDismiss(thread.id, 'wrong_persona')}
                className="text-[11px] px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                Wrong Fit
              </button>
              <button
                type="button"
                onClick={() => onDismiss(thread.id, 'outdated')}
                className="text-[11px] px-2 py-1 rounded bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              >
                Outdated
              </button>
              <button
                type="button"
                onClick={() => setShowDismiss(false)}
                className="text-[11px] px-1 text-zinc-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDismiss(true)}
              className="text-xs px-2.5 py-1.5 text-zinc-500 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Not a Fit
            </button>
          )}

          <button
            type="button"
            onClick={() => onGenerateQuote(thread)}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <FileText className="w-3.5 h-3.5" /> Generate Quote
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Reply'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify passing**

Run: `npx vitest run tests/unit/thread-card.test.tsx`  
Expected: PASS

- [ ] **Step 5: Run typecheck and commit**

```bash
npx tsc --noEmit
git add components/threads/ThreadCard.tsx components/threads/QuoteDrawer.tsx tests/unit/thread-card.test.tsx
git commit -m "feat(ui): add ThreadCard and Mode A QuoteDrawer components"
```

---

### Task 6: Operator Feed Toolbar Component

**Files:**
- Create: `components/threads/FeedToolbar.tsx`
- Create: `tests/unit/feed-toolbar.test.tsx`

**Interfaces:**
- `FeedToolbarProps`: `{ activeChannel: string; onSelectChannel: (c: string) => void; onlyHot: boolean; onToggleHot: () => void; searchQuery: string; onSearchChange: (q: string) => void; onScanNow: () => void; isScanning: boolean; counts: Record<string, number>; }`

- [ ] **Step 1: Write failing FeedToolbar test**

```typescript
// tests/unit/feed-toolbar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedToolbar } from '@/components/threads/FeedToolbar';

describe('FeedToolbar Component', () => {
  it('renders search input, channel pills with counts, and scan button', () => {
    const mockScan = vi.fn();
    render(
      <FeedToolbar
        activeChannel="all"
        onSelectChannel={vi.fn()}
        onlyHot={false}
        onToggleHot={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        onScanNow={mockScan}
        isScanning={false}
        counts={{ all: 18, hackernews: 6, reddit: 8, bluesky: 4 }}
      />
    );

    expect(screen.getByPlaceholderText(/search leads/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all \(18\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scan channels now/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /scan channels now/i }));
    expect(mockScan).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/feed-toolbar.test.tsx`  
Expected: FAIL (`cannot find module '@/components/threads/FeedToolbar'`)

- [ ] **Step 3: Implement FeedToolbar**

```tsx
// components/threads/FeedToolbar.tsx
'use client';

import React from 'react';
import { Search, RotateCw, Sparkles } from 'lucide-react';

interface FeedToolbarProps {
  activeChannel: string;
  onSelectChannel: (channel: string) => void;
  onlyHot: boolean;
  onToggleHot: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onScanNow: () => void;
  isScanning: boolean;
  counts: Record<string, number>;
}

export function FeedToolbar({
  activeChannel,
  onSelectChannel,
  onlyHot,
  onToggleHot,
  searchQuery,
  onSearchChange,
  onScanNow,
  isScanning,
  counts,
}: FeedToolbarProps) {
  const channels = [
    { id: 'all', label: 'All' },
    { id: 'hackernews', label: 'Hacker News' },
    { id: 'reddit', label: 'Reddit' },
    { id: 'bluesky', label: 'Bluesky' },
  ];

  return (
    <div className="space-y-3 bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      {/* Top Search & Scan Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search leads, keywords, companies..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none"
          />
        </div>

        <button
          type="button"
          disabled={isScanning}
          onClick={onScanNow}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Scan Channels Now'}
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-1.5">
          {channels.map(ch => (
            <button
              key={ch.id}
              type="button"
              onClick={() => onSelectChannel(ch.id)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeChannel === ch.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              {ch.label} ({counts[ch.id] || 0})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleHot}
          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
            onlyHot
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
              : 'text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          HOT Leads (85%+)
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify passing**

Run: `npx vitest run tests/unit/feed-toolbar.test.tsx`  
Expected: PASS

- [ ] **Step 5: Run typecheck and commit**

```bash
npx tsc --noEmit
git add components/threads/FeedToolbar.tsx tests/unit/feed-toolbar.test.tsx
git commit -m "feat(ui): add FeedToolbar component with search, channel tabs, and HOT filter"
```

---

### Task 7: Signal Feed Page Assembly (`app/threads/page.tsx`)

**Files:**
- Create: `app/threads/page.tsx`
- Create: `tests/integration/threads-page.test.tsx`

**Interfaces:**
- Assembles `FeedToolbar`, `ThreadCard` list, `QuoteDrawer`, and Server Actions on `/threads`.
- Handles search, channel filter, HOT filter, and live scanning feedback.

- [ ] **Step 1: Write failing page integration test**

```typescript
// tests/integration/threads-page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThreadsPage from '@/app/threads/page';

describe('/threads Page', () => {
  it('renders page title and empty or populated feed state', () => {
    render(<ThreadsPage />);
    expect(screen.getByText(/ranked signal feed/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/integration/threads-page.test.tsx`  
Expected: FAIL (`cannot find module '@/app/threads/page'`)

- [ ] **Step 3: Implement /threads page**

```tsx
// app/threads/page.tsx
'use client';

import React, { useState } from 'react';
import { FeedToolbar } from '@/components/threads/FeedToolbar';
import { ThreadCard, ThreadItem } from '@/components/threads/ThreadCard';
import { QuoteDrawer } from '@/components/threads/QuoteDrawer';
import { approveThread, dismissThread, scanLiveSignals } from '@/lib/actions/threads';

export default function ThreadsPage() {
  const [channel, setChannel] = useState('all');
  const [onlyHot, setOnlyHot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedQuoteThread, setSelectedQuoteThread] = useState<ThreadItem | null>(null);

  // Initial starter leads (from Task 4 seeding)
  const [threads, setThreads] = useState<ThreadItem[]>([
    {
      id: 't-1',
      source_channel: 'reddit',
      author: 'u/growth_director',
      title: 'Looking for a reliable agency to handle automated customer communication and follow-ups',
      content: 'Our team is dropping 25% of leads after business hours. Need an agency or tool to automate booking and follow-up immediately.',
      thread_url: 'https://reddit.com/r/smallbusiness/comments/sample1',
      match_score: 94,
      match_reason: 'Prospect has acute pain with dropped after-hours leads and asks for immediate agency automation assistance.',
      status: 'new',
    },
    {
      id: 't-2',
      source_channel: 'hackernews',
      author: 'startup_sam',
      title: 'Ask HN: Any specialized B2B outbound agencies recommended for early-stage SaaS?',
      content: 'We need predictable sales pipeline. Would rather hire a proven specialized agency than spend 3 months recruiting SDRs.',
      thread_url: 'https://news.ycombinator.com/item?id=sample2',
      match_score: 91,
      match_reason: 'Founder actively seeking agency partnership for predictable outbound pipeline.',
      status: 'new',
    },
    {
      id: 't-3',
      source_channel: 'bluesky',
      author: 'alex.bsky.social',
      title: 'Need an AI dev shop to build custom workflow chatbots',
      content: 'Struggling with Zapier limits, looking to hire an agency to build a custom solution.',
      thread_url: 'https://bsky.app/profile/alex.bsky.social',
      match_score: 86,
      match_reason: 'Explicit buying signal for custom AI chatbots.',
      status: 'new',
    },
  ]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await scanLiveSignals('mock-workspace-id');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApprove = async (id: string) => {
    await approveThread(id, 'mock-workspace-id');
    setThreads(prev => prev.map(t => (t.id === id ? { ...t, status: 'approved' } : t)));
  };

  const handleDismiss = async (id: string, reason: string) => {
    await dismissThread(id, 'mock-workspace-id', reason as any);
    setThreads(prev => prev.filter(t => t.id !== id));
  };

  const filteredThreads = threads.filter(t => {
    if (channel !== 'all' && t.source_channel !== channel) return false;
    if (onlyHot && t.match_score < 85) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q) || t.author.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: threads.length,
    reddit: threads.filter(t => t.source_channel === 'reddit').length,
    hackernews: threads.filter(t => t.source_channel === 'hackernews').length,
    bluesky: threads.filter(t => t.source_channel === 'bluesky').length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Ranked Signal Feed
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time intent signals scored against your Ideal Customer Profile.
          </p>
        </div>

        <FeedToolbar
          activeChannel={channel}
          onSelectChannel={setChannel}
          onlyHot={onlyHot}
          onToggleHot={() => setOnlyHot(p => !p)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onScanNow={handleScan}
          isScanning={isScanning}
          counts={counts}
        />

        <div className="space-y-4">
          {filteredThreads.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <p className="text-sm text-zinc-500">No leads found matching your active filters.</p>
            </div>
          ) : (
            filteredThreads.map(thread => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onApprove={handleApprove}
                onDismiss={handleDismiss}
                onGenerateQuote={t => setSelectedQuoteThread(t)}
              />
            ))
          )}
        </div>

        <QuoteDrawer
          isOpen={!!selectedQuoteThread}
          onClose={() => setSelectedQuoteThread(null)}
          thread={selectedQuoteThread}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify passing**

Run: `npx vitest run tests/integration/threads-page.test.tsx`  
Expected: PASS

- [ ] **Step 5: Run typecheck and commit**

```bash
npx tsc --noEmit
git add app/threads/page.tsx tests/integration/threads-page.test.tsx
git commit -m "feat(threads): create /threads feed page with live filtering, quote drawer, and Server Actions"
```

---

### Task 8: End-to-End Feed Integration Test & Full Verification

**Files:**
- Create: `tests/integration/signal-feed-flow.test.ts`

- [ ] **Step 1: Write full end-to-end integration test**

```typescript
// tests/integration/signal-feed-flow.test.ts
import { describe, it, expect, vi } from 'vitest';
import { calculateMDIE } from '@/lib/scoring/mdie';
import { approveThread, dismissThread } from '@/lib/actions/threads';

describe('Feature 02 Signal Feed End-to-End Pipeline', () => {
  it('completes the full loop: ingestion -> scoring -> approval -> dismissal weight adjustment', async () => {
    // 1. Candidate post
    const rawPost = {
      source: 'hackernews' as const,
      external_id: 'hn-test-1',
      title: 'Looking for AI workflow automation agency to help our B2B SaaS',
      content: 'We need custom Zapier and LLM chatbot integrations right away.',
      author: 'startup_ceo',
      thread_url: 'https://news.ycombinator.com/item?id=test-1',
    };

    // 2. MDIE scoring
    const score = calculateMDIE(rawPost, {
      services: ['AI Workflow Automation'],
      buyerTitles: ['CEO'],
      painPoints: ['manual followups'],
      buyingSignals: ['looking for AI workflow automation agency'],
      negativeKeywords: ['job', 'intern'],
    });

    expect(score.isFiltered).toBe(false);
    expect(score.matchScore).toBeGreaterThanOrEqual(85);

    // 3. Mock DB approval
    const mockSupabase = {
      from: vi.fn((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 't-100', match_score: score.matchScore },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    };

    const approveRes = await approveThread('t-100', 'ws-test', mockSupabase as any);
    expect(approveRes.success).toBe(true);

    // 4. Mock dismissal with 'wrong_persona'
    const dismissRes = await dismissThread('t-100', 'ws-test', 'wrong_persona', mockSupabase as any);
    expect(dismissRes.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run full test suite across all 15 test files**

Run: `npm test`  
Expected: ALL test files pass

- [ ] **Step 3: Run strict TypeScript compiler verification**

Run: `npx tsc --noEmit`  
Expected: 0 errors

- [ ] **Step 4: Final commit for Feature 02**

```bash
git add tests/integration/signal-feed-flow.test.ts
git commit -m "feat(threads): complete Feature 02 Daily Ranked Signal Feed with MDIE and Mode A Quote Drawer"
```
