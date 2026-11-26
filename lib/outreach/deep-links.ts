import { CallScriptVariables } from '@/types/outreach';

export function generateLinkedInPitch(vars: CallScriptVariables): string {
  const firstName = vars.prospectName.split(' ')[0] || 'there';
  return `Hi ${firstName}, saw your post regarding ${vars.postTopic} at ${vars.companyName}. We build ${vars.serviceOffered} at ${vars.agencyName}—thought I'd reach out directly to see if you're still looking for a clean solution. Would you be open to an itemized quote?`;
}

export function getLinkedInComposeUrl(authorHandle: string): string {
  const cleanHandle = authorHandle.replace(/^@/, '').trim();
  return `https://www.linkedin.com/messaging/compose/?recipient=${encodeURIComponent(cleanHandle)}`;
}

export function generateEmailPayload(
  toEmail: string,
  vars: CallScriptVariables
): { url: string; subject: string; body: string } {
  const firstName = vars.prospectName.split(' ')[0] || 'there';
  const subject = `Quick question regarding ${vars.postTopic} — ${vars.companyName}`;
  const body = `Hi ${firstName},\n\nI noticed your recent discussion about ${vars.postTopic}.\n\nAt ${vars.agencyName}, we specialize in ${vars.serviceOffered}. If you are still exploring options, I'd be happy to share an itemized overview of how we handle this.\n\nBest regards,\n${vars.agencyName}`;

  const url = `mailto:${encodeURIComponent(toEmail.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { url, subject, body };
}

export function generateWhatsAppUrl(phoneNumber: string, vars: CallScriptVariables): string {
  const cleanedDigits = phoneNumber.replace(/[^0-9]/g, '');
  const message = generateLinkedInPitch(vars);
  return `https://wa.me/${cleanedDigits}?text=${encodeURIComponent(message)}`;
}