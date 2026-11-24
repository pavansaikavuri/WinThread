import { describe, it, expect } from 'vitest';
import { calculateMDIE } from '@/lib/scoring/mdie';

describe('Multi-Dimensional Intent Engine (MDIE)', () => {
  const mockIcp = {
    services: ['AI Workflow Automation', 'Chatbot Development'],
    buyerTitles: ['Founder', 'CEO', 'CTO'],
    painPoints: ['manual followups', 'lost leads', 'pipeline dropped'],
    buyingSignals: ['looking for agency', 'need chatbot', 'automate workflow'],
    negativeKeywords: ['job', 'hiring', 'internship', 'free', 'course'],
  };

  it('drops posts matching negative keywords in Tier 1 with score 0', () => {
    const post = {
      title: 'Hiring React Intern for summer',
      content: 'We have a job opening for an internship. Looking for agency experience.',
      author: 'u/recruiter',
      source: 'reddit' as const,
    };
    const result = calculateMDIE(post, mockIcp);
    expect(result.isFiltered).toBe(true);
    expect(result.matchScore).toBe(0);
    expect(result.filterReason).toContain('Negative keyword');
  });

  it('dynamically re-normalizes weights for pseudonymous posts without declared titles', () => {
    // Authority = 0, but strong buying signal and pain match
    const post = {
      title: 'Our pipeline dropped 30%, need chatbot to automate workflow',
      content: 'Looking for agency to build a custom solution immediately.',
      author: 'startup_sam',
      source: 'hackernews' as const,
    };
    const result = calculateMDIE(post, mockIcp, { sourceWeight: 1.0, keywordWeights: { 'looking for agency': 1.0 } });
    expect(result.isFiltered).toBe(false);
    expect(result.matchScore).toBeGreaterThanOrEqual(80); // must cross 80 without authority title!
    expect(result.matchReason).toContain('buying signal');
  });

  it('safely handles posts matching zero keywords without NaN or crash', () => {
    const post = {
      title: 'General question about web development',
      content: 'Can anyone recommend best hosting options for a small website project?',
      author: 'dev_user',
      source: 'bluesky' as const,
    };
    const result = calculateMDIE(post, mockIcp);
    expect(result.matchScore).toBeLessThan(70);
    expect(Number.isFinite(result.matchScore)).toBe(true);
  });
});
