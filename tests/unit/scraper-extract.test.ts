import { describe, it, expect, vi } from 'vitest';
import { extractAgencyTaxonomy } from '@/lib/scraper/extract';

describe('extractAgencyTaxonomy', () => {
  it('returns structured taxonomy fallback when website metadata is parsed', async () => {
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

    const result = await extractAgencyTaxonomy('https://apexflow.ai');
    expect(result.success).toBe(true);
    expect(result.data.workspaceName).toBe('Apex Flow');
    expect(result.data.services.length).toBeGreaterThan(0);
    expect(result.data.negativeKeywords.length).toBeGreaterThanOrEqual(3);
  });

  it('handles network failure gracefully with fallback preset', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await extractAgencyTaxonomy('https://unreachable-domain.xyz');
    expect(result.success).toBe(false);
    expect(result.fallback).toBeDefined();
    if (result.fallback) {
      expect(result.fallback.negativeKeywords.length).toBeGreaterThanOrEqual(3);
    }
  });
});