import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOutreachQueue, markContacted, logCallOutcome } from '@/lib/actions/outreach';

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from '@/lib/supabase/server';

describe('Feature 03 End-to-End Outreach Flow', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-1' } }, error: null }) },
      from: vi.fn(),
    };
    (createServerClient as any).mockResolvedValue(mockSupabase);
  });

  it('completes the full approval to qualification cycle: approved -> contacted -> qualified', async () => {
    // 1. Queue query
    const mockOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'th-1', author: 'Marcus', stage: 'approved' }],
      error: null,
    });
    const mockEqWs = vi.fn().mockReturnThis();
    const mockEqStage = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEqWs });
    mockEqWs.mockReturnValue({ eq: mockEqStage });
    mockEqStage.mockReturnValue({ order: mockOrder });

    const mockEq = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'threads') {
        return { select: mockSelect, update: mockUpdate };
      }
      if (table === 'events') {
        return { insert: mockInsert };
      }
      if (table === 'communication_consent') {
        return { upsert: mockUpsert };
      }
      if (table === 'suppressions') {
        return { upsert: mockUpsert };
      }
      return {};
    });

    const queueRes = await getOutreachQueue('ws-1');
    expect(queueRes.success).toBe(true);
    expect(queueRes.threads[0].stage).toBe('approved');

    // 2. Mark contacted via LinkedIn
    const contactRes = await markContacted('th-1', 'ws-1', 'linkedin');
    expect(contactRes.success).toBe(true);

    // 3. Log Call Outcome: Interested -> Qualified
    const outcomeRes = await logCallOutcome({
      threadId: 'th-1',
      workspaceId: 'ws-1',
      outcome: 'interested',
      consentGranted: true,
      consentChannel: 'whatsapp',
    });
    expect(outcomeRes.success).toBe(true);
  });
});