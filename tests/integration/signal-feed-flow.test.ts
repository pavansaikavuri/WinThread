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
