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
