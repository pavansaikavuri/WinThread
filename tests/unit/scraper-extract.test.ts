import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractAgencyTaxonomy, fetchWithSafeRedirects } from '@/lib/scraper/extract';

describe('extractAgencyTaxonomy', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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
      status: 200,
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

describe('fetchWithSafeRedirects', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('follows safe relative redirect and cancels stream body', async () => {
    const cancelSpy = vi.fn().mockResolvedValue(undefined);
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        status: 302,
        ok: false,
        headers: new Headers({ location: '/landing' }),
        body: { cancel: cancelSpy },
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
        text: async () => '<html><title>Apex</title></html>',
      } as any);

    const { text, finalUrl } = await fetchWithSafeRedirects('https://apexflow.ai');
    expect(cancelSpy).toHaveBeenCalled();
    expect(finalUrl).toBe('https://apexflow.ai/landing');
    expect(text).toContain('Apex');
  });

  it('blocks redirect to cloud metadata IP (SSRF protection)', async () => {
    const cancelSpy = vi.fn().mockResolvedValue(undefined);
    global.fetch = vi.fn().mockResolvedValueOnce({
      status: 302,
      ok: false,
      headers: new Headers({ location: 'http://169.254.169.254/latest/meta-data/' }),
      body: { cancel: cancelSpy },
    } as any);

    await expect(fetchWithSafeRedirects('http://apexflow.ai')).rejects.toThrow(/private|reserved/i);
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('blocks insecure protocol downgrade (HTTPS to HTTP)', async () => {
    const cancelSpy = vi.fn().mockResolvedValue(undefined);
    global.fetch = vi.fn().mockResolvedValueOnce({
      status: 301,
      ok: false,
      headers: new Headers({ location: 'http://apexflow.ai/insecure' }),
      body: { cancel: cancelSpy },
    } as any);

    await expect(fetchWithSafeRedirects('https://apexflow.ai')).rejects.toThrow(/downgrade/i);
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('blocks redirect loops exceeding maximum hops', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 302,
      ok: false,
      headers: new Headers({ location: 'https://apexflow.ai/loop' }),
      body: { cancel: vi.fn().mockResolvedValue(undefined) },
    } as any);

    await expect(fetchWithSafeRedirects('https://apexflow.ai', 3)).rejects.toThrow(/maximum redirect limit/i);
  });
});