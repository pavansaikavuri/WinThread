export interface ICPPreset {
  id: string;
  name: string;
  services: string[];
  buyerTitles: string[];
  painPoints: string[];
  buyingSignals: string[];
  negativeKeywords: string[];
}

export const ICP_PRESETS: ICPPreset[] = [
  {
    id: 'ai-automation',
    name: 'AI Automation Agency',
    services: ['AI Chatbot Development', 'Workflow Automation', 'Custom LLM Pipelines'],
    buyerTitles: ['Founder', 'CEO', 'CTO', 'Head of Operations'],
    painPoints: ['Manual repetitive tasks', 'Slow customer response times', 'High support overhead'],
    buyingSignals: ['looking for AI help', 'automate workflow', 'build chatbot', 'need Make/Zapier expert'],
    negativeKeywords: ['job', 'hiring', 'internship', 'course', 'free', 'tutorial'],
  },
  {
    id: 'b2b-leadgen',
    name: 'B2B Lead Generation Agency',
    services: ['Cold Email Infrastructure', 'LinkedIn Outbound', 'Appointment Setting'],
    buyerTitles: ['Founder', 'CEO', 'VP Sales', 'Head of Growth'],
    painPoints: ['Empty sales pipeline', 'Low email deliverability', 'Inconsistent inbound leads'],
    buyingSignals: ['need more leads', 'hire SDR', 'cold email agency', 'looking for appointments'],
    negativeKeywords: ['resume', 'apply', 'salary', 'hiring', 'intern'],
  },
  {
    id: 'performance-marketing',
    name: 'Performance Marketing Agency',
    services: ['Meta Ads Management', 'Google Ads Scaling', 'Landing Page CRO'],
    buyerTitles: ['Founder', 'CMO', 'Head of Marketing', 'Ecommerce Director'],
    painPoints: ['High CAC', 'Ad fatigue', 'Poor return on ad spend'],
    buyingSignals: ['looking for ads agency', 'scale ROAS', 'hire media buyer', 'PPC agency recommendation'],
    negativeKeywords: ['job opening', 'full-time', 'internship', 'course'],
  },
];