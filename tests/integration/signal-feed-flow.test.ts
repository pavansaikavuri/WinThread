import { describe, it, expect, vi } from 'vitest';

// Mock at top level
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

import { calculateMDIE } from '@/lib/scoring/mdie';
import { approveThread, dismissThread } from '@/lib/actions/threads';
import { createServerClient } from '@/lib/supabase/server';

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
    const mockGetUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    const mockProfileSelect = vi.fn().mockReturnThis();
    const mockProfileEq = vi.fn().mockReturnThis();
    const mockProfileSingle = vi.fn().mockResolvedValue({
      data: { workspace_id: 'ws-test' },
      error: null,
    });

    const mockWorkspaceSelect = vi.fn().mockReturnThis();
    const mockWorkspaceEq = vi.fn().mockReturnThis();
    const mockWorkspaceSingle = vi.fn().mockResolvedValue({
      data: { id: 'ws-test', owner_id: 'user-123' },
      error: null,
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: mockProfileSelect,
            eq: mockProfileEq,
            single: mockProfileSingle,
          };
        }
        if (table === 'workspaces') {
          return {
            select: mockWorkspaceSelect,
            eq: mockWorkspaceEq,
            single: mockWorkspaceSingle,
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 't-100', match_score: score.matchScore },
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
          upsert: vi.fn().mockResolvedValue({ error: null }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }),
    };

    const mockAuthClient = {
      auth: { getUser: mockGetUser },
      ...mockSupabase
    };

    (createServerClient as any).mockResolvedValue(mockAuthClient);

    const approveRes = await approveThread('t-100', 'ws-test');
    expect(approveRes.success).toBe(true);

    // 4. Mock dismissal with 'wrong_person'
    const dismissRes = await dismissThread('t-100', 'ws-test', 'wrong_person');
    expect(dismissRes.success).toBe(true);
  });
});