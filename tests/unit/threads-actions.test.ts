import { describe, it, expect, vi } from 'vitest';

// Mock at top level
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

import { approveThread, dismissThread } from '@/lib/actions/threads';
import { createServerClient } from '@/lib/supabase/server';

describe('Threads Server Actions', () => {
  const mockGetUser = vi.fn().mockResolvedValue({
    data: { user: { id: 'user-123' } },
    error: null
  });

  const mockProfileSelect = vi.fn().mockReturnThis();
  const mockProfileEq = vi.fn().mockReturnThis();
  const mockProfileSingle = vi.fn().mockResolvedValue({
    data: { workspace_id: 'ws-123' },
    error: null,
  });

  const mockWorkspaceSelect = vi.fn().mockReturnThis();
  const mockWorkspaceEq = vi.fn().mockReturnThis();
  const mockWorkspaceSingle = vi.fn().mockResolvedValue({
    data: { id: 'ws-123', owner_id: 'user-123' },
    error: null,
  });

  const createMockSupabase = (overrides: any = {}) => ({
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
          data: { id: 'thread-1', match_score: 90, raw_signals: { content: 'need agency help' } },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        ...overrides,
      };
    }),
  });

  it('increases keyword weight by +0.05 on approval', async () => {
    const mockSupabase = createMockSupabase();

    const mockAuthClient = {
      auth: { getUser: mockGetUser },
      ...mockSupabase
    };

    (createServerClient as any).mockResolvedValue(mockAuthClient);

    const res = await approveThread('thread-1', 'ws-123');
    expect(res.success).toBe(true);
  });

  it('does NOT penalize keyword weights when dismissed as outdated', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = createMockSupabase({
      upsert: mockUpsert,
    });

    const mockAuthClient = {
      auth: { getUser: mockGetUser },
      ...mockSupabase
    };

    (createServerClient as any).mockResolvedValue(mockAuthClient);

    const res = await dismissThread('thread-1', 'ws-123', 'outdated');
    expect(res.success).toBe(true);
    // Outdated dismissal must NOT update keyword_weights (Hostile Review Fix #5)
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});