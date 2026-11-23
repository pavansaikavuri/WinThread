import { describe, it, expect, vi } from 'vitest';
import { executeSetupTransaction } from '@/lib/actions/setup';

describe('executeSetupTransaction', () => {
  it('inserts workspace, icp_profile, source weights, keyword weights and event', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockInsert = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'ws-123' }, error: null });
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });

    const mockFrom = vi.fn((table: string) => {
      const chain = {
        select: mockSelect,
        insert: mockInsert,
        upsert: mockUpsert,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
        single: mockSingle,
      };
      return chain;
    });

    const mockSupabase = {
      from: mockFrom,
    };

    const payload = {
      agencyUrl: 'https://apexflow.ai',
      workspaceName: 'Apex Flow',
      services: ['AI Automation'],
      buyerTitles: ['Founder', 'CTO'],
      painPoints: ['Manual data entry'],
      buyingSignals: ['need AI bot', 'looking for Zapier expert'],
      negativeKeywords: ['job', 'hiring', 'internship'],
    };

    const result = await executeSetupTransaction(mockSupabase as any, payload, 'user-456');
    expect(result.success).toBe(true);
    expect(result.workspaceId).toBe('ws-123');
    expect(mockFrom).toHaveBeenCalledWith('workspaces');
    expect(mockFrom).toHaveBeenCalledWith('icp_profiles');
    expect(mockFrom).toHaveBeenCalledWith('weights');
    expect(mockFrom).toHaveBeenCalledWith('keyword_weights');
    expect(mockFrom).toHaveBeenCalledWith('events');
  });
});