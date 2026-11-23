import { describe, it, expect, vi } from 'vitest';
import { extractAgencyTaxonomy } from '@/lib/scraper/extract';
import { setupFormSchema } from '@/lib/validations/setup';
import { executeSetupTransaction } from '@/lib/actions/setup';

describe('Feature 01 Setup Flow Integration', () => {
  it('completes the full flow: URL extraction -> form validation -> DB seeding', async () => {
    // 1. Mock HTML fetch for 'https://apexflow.ai' containing title and meta description
    const mockHtml = `
      <html>
        <head>
          <title>Apex Flow - AI Workflow Automation Agency</title>
          <meta name="description" content="We build custom AI chatbots and automated Zapier pipelines for SaaS founders." />
        </head>
      </html>
    `;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    } as any);

    // 2. Call extractAgencyTaxonomy('https://apexflow.ai') and assert success === true
    const extractResult = await extractAgencyTaxonomy('https://apexflow.ai');
    expect(extractResult.success).toBe(true);

    // 3. Assemble SetupFormData using extracted data, validating it with setupFormSchema.safeParse()
    const formData = {
      agencyUrl: 'https://apexflow.ai',
      workspaceName: extractResult.data.workspaceName,
      services: extractResult.data.services,
      buyerTitles: extractResult.data.buyerTitles,
      painPoints: extractResult.data.painPoints,
      buyingSignals: extractResult.data.buyingSignals,
      negativeKeywords: extractResult.data.negativeKeywords,
    };
    const parseResult = setupFormSchema.safeParse(formData);
    expect(parseResult.success).toBe(true);

    // 4. Mock Supabase client chaining for from('workspaces'), from('icp_profiles'), from('weights'), from('threads'), and from('events')
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockInsert = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'mock-ws-id' }, error: null });
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });

    const mockFrom = vi.fn((table: string) => ({
      select: mockSelect,
      insert: mockInsert,
      upsert: mockUpsert,
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
      single: mockSingle,
    }));

    const mockSupabase = {
      from: mockFrom,
    };

    // 5. Call executeSetupTransaction(mockSupabase, validatedData, 'test-user-id') and assert success === true and workspaceId === 'mock-ws-id'
    if (parseResult.success) {
      const txResult = await executeSetupTransaction(mockSupabase as any, parseResult.data, 'test-user-id');
      expect(txResult.success).toBe(true);
      expect(txResult.workspaceId).toBe('mock-ws-id');

      // Verify all required tables were called
      expect(mockFrom).toHaveBeenCalledWith('workspaces');
      expect(mockFrom).toHaveBeenCalledWith('icp_profiles');
      expect(mockFrom).toHaveBeenCalledWith('weights');
      expect(mockFrom).toHaveBeenCalledWith('keyword_weights');
      expect(mockFrom).toHaveBeenCalledWith('threads');
      expect(mockFrom).toHaveBeenCalledWith('events');
    }
  });
});