import { describe, it, expect } from 'vitest';
import {
  generateLinkedInPitch,
  generateEmailPayload,
  generateWhatsAppUrl,
  getLinkedInComposeUrl,
} from '@/lib/outreach/deep-links';

describe('Deep-Link & Pitch Generation Engine', () => {
  const mockLead = {
    prospectName: 'Rachel Green',
    companyName: 'Brightline HVAC',
    postTopic: 'AI dispatch automation',
    postExcerpt: 'Looking for a reliable system to automate technician routing',
    agencyName: 'Apex Flow',
    serviceOffered: 'Custom AI Dispatch Pipelines',
  };

  it('generates personalized non-salesy LinkedIn pitch referencing post topic', () => {
    const pitch = generateLinkedInPitch(mockLead);
    expect(pitch).toContain('Hi Rachel');
    expect(pitch).toContain('AI dispatch automation');
    expect(pitch).toContain('Apex Flow');
  });

  it('formats LinkedIn direct compose URL with recipient handle', () => {
    const url = getLinkedInComposeUrl('rachel-green');
    expect(url).toBe('https://www.linkedin.com/messaging/compose/?recipient=rachel-green');
  });

  it('formats mailto payload with encoded subject and body', () => {
    const emailPayload = generateEmailPayload('rachel@brightline.com', mockLead);
    expect(emailPayload.url).toContain('mailto:rachel%40brightline.com');
    expect(emailPayload.url).toContain('subject=');
    expect(emailPayload.url).toContain('body=');
    expect(emailPayload.subject).toContain('Brightline HVAC');
    expect(emailPayload.body).toContain('Rachel');
  });

  it('formats official WhatsApp click-to-chat URL with E.164 phone', () => {
    const waUrl = generateWhatsAppUrl('+15551234567', mockLead);
    expect(waUrl).toContain('https://wa.me/15551234567?text=');
    expect(waUrl).toContain(encodeURIComponent('Hi Rachel'));
  });

  it('sanitizes non-E.164 characters from phone numbers for WhatsApp', () => {
    const waUrl = generateWhatsAppUrl('+1 (555) 123-4567', mockLead);
    expect(waUrl).toContain('https://wa.me/15551234567');
  });
});