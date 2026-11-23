import { describe, it, expect } from 'vitest';
import { setupFormSchema } from '@/lib/validations/setup';

describe('setupFormSchema', () => {
  it('rejects an invalid URL', () => {
    const result = setupFormSchema.safeParse({
      agencyUrl: 'not-a-url',
      workspaceName: 'Acme Growth',
      services: ['Lead Gen'],
      buyerTitles: ['Founder'],
      painPoints: ['No leads'],
      buyingSignals: ['looking for agency'],
      negativeKeywords: ['job', 'internship', 'hiring'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 3 negative keywords per PRD contract', () => {
    const result = setupFormSchema.safeParse({
      agencyUrl: 'https://acmegrowth.com',
      workspaceName: 'Acme Growth',
      services: ['Lead Gen'],
      buyerTitles: ['Founder'],
      painPoints: ['No leads'],
      buyingSignals: ['looking for agency'],
      negativeKeywords: ['job', 'hiring'], // only 2!
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('At least 3 negative keywords are required');
    }
  });

  it('accepts valid setup payload with >= 3 negative keywords', () => {
    const result = setupFormSchema.safeParse({
      agencyUrl: 'https://acmegrowth.com',
      workspaceName: 'Acme Growth',
      services: ['AI Automation'],
      buyerTitles: ['Founder', 'CEO'],
      painPoints: ['Manual prospecting'],
      buyingSignals: ['need automation', 'hiring agency'],
      negativeKeywords: ['job', 'hiring', 'internship'],
    });
    expect(result.success).toBe(true);
  });
});