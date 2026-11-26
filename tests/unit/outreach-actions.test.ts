import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getOutreachQueue,
  markContacted,
  logCallOutcome,
  undoApproval,
} from '@/lib/actions/outreach';

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from '@/lib/supabase/server';

describe('Outreach Server Actions & State Machine', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-123' } }, error: null }),
      },
      from: vi.fn(),
    };
    (createServerClient as any).mockResolvedValue(mockSupabase);
  });

  it('fetches outreach queue filtered by stage=approved for the workspace', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEqWs = vi.fn().mockReturnThis();
    const mockEqStage = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'th-1', author: 'Rachel', stage: 'approved' }],
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEqWs,
      order: mockOrder,
    });
    mockSelect.mockReturnValue({ eq: mockEqWs });
    mockEqWs.mockReturnValue({ eq: mockEqStage });
    mockEqStage.mockReturnValue({ order: mockOrder });

    const result = await getOutreachQueue('ws-456');
    expect(result.success).toBe(true);
    expect(result.threads).toHaveLength(1);
  });

  it('marks thread as contacted and records event', async () => {
    const mockEq = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'threads') {
        return { update: mockUpdate };
      }
      if (table === 'events') {
        return { insert: mockInsert };
      }
      return {};
    });

    const result = await markContacted('th-1', 'ws-456', 'linkedin');
    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ stage: 'contacted', contact_method: 'linkedin' })
    );
  });

  it('transitions thread to qualified when call outcome is interested and saves consent', async () => {
    const mockEq = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockUpsertConsent = vi.fn().mockResolvedValue({ error: null });
    const mockInsertEvent = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'threads') return { update: mockUpdate };
      if (table === 'communication_consent') return { upsert: mockUpsertConsent };
      if (table === 'events') return { insert: mockInsertEvent };
      return {};
    });

    const result = await logCallOutcome({
      threadId: 'th-1',
      workspaceId: 'ws-456',
      outcome: 'interested',
      consentGranted: true,
      consentChannel: 'whatsapp',
    });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ stage: 'qualified' }));
    expect(mockUpsertConsent).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'whatsapp', consented: true }),
      expect.objectContaining({ onConflict: 'thread_id,channel' })
    );
  });

  it('resets thread to approved when call outcome is callback', async () => {
    const mockEq = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockInsertEvent = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'threads') return { update: mockUpdate };
      if (table === 'events') return { insert: mockInsertEvent };
      return {};
    });

    const result = await logCallOutcome({
      threadId: 'th-1',
      workspaceId: 'ws-456',
      outcome: 'callback',
      scheduledCallback: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ stage: 'approved' }));
  });

  it('enforces 5-minute undo window on approval reversal', async () => {
    // Thread approved 10 minutes ago
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'th-1', stage: 'approved', approved_at: tenMinutesAgo, contacted_at: null },
              error: null,
            }),
          }),
        }),
      }),
    });

    const result = await undoApproval('th-1', 'ws-456');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Undo window expired (5 minutes)');
  });
});