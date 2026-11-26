// types/outreach.ts
import { SupportedChannel } from '@/lib/constants/channels';

export type CommunicationChannel = 'linkedin' | 'email' | 'whatsapp' | 'phone';

export type CallOutcomeType = 'interested' | 'send_quote' | 'callback' | 'not_interested' | 'wrong_number';

export type ThreadStage = 'discovered' | 'approved' | 'contacted' | 'qualified' | 'quote_sent' | 'won' | 'lost';

export interface OutreachThread {
  id: string;
  workspace_id: string;
  raw_signal_id: string | null;
  source_channel: SupportedChannel;
  external_id: string;
  author: string;
  title: string;
  content: string;
  thread_url: string;
  match_score: number;
  match_reason: string;
  stage: ThreadStage;
  approved_at: string | null;
  contacted_at: string | null;
  contact_method: CommunicationChannel | null;
  author_email?: string | null;
  author_phone?: string | null;
  author_company?: string | null;
  created_at: string;
}

export interface CallScriptVariables {
  prospectName: string;
  companyName: string;
  postTopic: string;
  postExcerpt: string;
  agencyName: string;
  serviceOffered: string;
}

export interface CallScriptStepData {
  stepNumber: number;
  id: 'orient' | 'qualify' | 'objections' | 'book_quote' | 'close';
  title: string;
  headline: string;
  scriptText: string;
  tips?: string[];
}

export interface ObjectionItem {
  id: string;
  category: 'pricing' | 'timing' | 'competitor' | 'not_needed';
  label: string;
  prospectSays: string;
  responseScript: string;
}

export interface CallOutcomePayload {
  threadId: string;
  workspaceId: string;
  outcome: CallOutcomeType;
  notes?: string;
  scheduledCallback?: string; // ISO timestamp
  consentGranted?: boolean;
  consentChannel?: CommunicationChannel;
  requestDnd?: boolean;
}