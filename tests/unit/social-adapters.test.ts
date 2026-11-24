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
