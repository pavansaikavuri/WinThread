'use server';

import { createServerClient } from '@/lib/supabase/server';
import { CallOutcomePayload, CommunicationChannel, OutreachThread } from '@/types/outreach';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export async function getOutreachQueue(workspaceId: string): Promise<{ success: boolean; threads: OutreachThread[]; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, threads: [], error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('stage', 'approved')
      .order('match_score', { ascending: false });

    if (error) return { success: false, threads: [], error: error.message };
    return { success: true, threads: (data as OutreachThread[]) || [] };
  } catch (err: any) {
    return { success: false, threads: [], error: err.message };
  }
}

export async function markContacted(
  threadId: string,
  workspaceId: string,
  channel: CommunicationChannel
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Unauthorized' };

    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from('threads')
      .update({
        stage: 'contacted',
        contact_method: channel,
        contacted_at: now,
      })
      .eq('id', threadId)
      .eq('workspace_id', workspaceId);

    if (updateErr) return { success: false, error: updateErr.message };

    await supabase.from('events').insert({
      workspace_id: workspaceId,
      thread_id: threadId,
      user_id: user.id,
      event_type: 'outreach_sent',
      payload_json: { channel, contacted_at: now },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function logCallOutcome(payload: CallOutcomePayload): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Unauthorized' };

    const now = new Date().toISOString();
    let nextStage: string = 'contacted';

    if (payload.outcome === 'interested' || payload.outcome === 'send_quote') {
      nextStage = 'qualified';
    } else if (payload.outcome === 'callback') {
      nextStage = 'approved';
    } else if (payload.outcome === 'not_interested' || payload.outcome === 'wrong_number') {
      nextStage = 'lost';
    }

    const { error: updateErr } = await supabase
      .from('threads')
      .update({
        stage: nextStage,
        contacted_at: now,
        contact_method: 'phone',
      })
      .eq('id', payload.threadId)
      .eq('workspace_id', payload.workspaceId);

    if (updateErr) return { success: false, error: updateErr.message };

    // Record consent if verbal permission granted
    if (payload.consentGranted && payload.consentChannel) {
      await supabase.from('communication_consent').upsert({
        thread_id: payload.threadId,
        workspace_id: payload.workspaceId,
        channel: payload.consentChannel,
        consented: true,
        consented_at: now,
      }, { onConflict: 'thread_id,channel' });
    }

    // Record DND suppression if requested
    if (payload.requestDnd) {
      await supabase.from('suppressions').upsert({
        workspace_id: payload.workspaceId,
        prospect_identifier: payload.threadId,
        channel: 'all',
        reason: 'explicit_request',
        suppressed_at: now,
      }, { onConflict: 'workspace_id,prospect_identifier,channel' });
    }

    await supabase.from('events').insert({
      workspace_id: payload.workspaceId,
      thread_id: payload.threadId,
      user_id: user.id,
      event_type: 'call_completed',
      payload_json: {
        outcome: payload.outcome,
        notes: payload.notes || '',
        scheduled_callback: payload.scheduledCallback || null,
        next_stage: nextStage,
      },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function undoApproval(threadId: string, workspaceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Unauthorized' };

    const { data: thread, error: fetchErr } = await supabase
      .from('threads')
      .select('stage, approved_at, contacted_at')
      .eq('id', threadId)
      .eq('workspace_id', workspaceId)
      .single();

    if (fetchErr || !thread) return { success: false, error: 'Thread not found' };
    if (thread.contacted_at) return { success: false, error: 'Cannot undo approval after outreach dispatched' };

    const approvedAt = thread.approved_at ? new Date(thread.approved_at).getTime() : 0;
    if (Date.now() - approvedAt > FIVE_MINUTES_MS) {
      return { success: false, error: 'Undo window expired (5 minutes)' };
    }

    const { error: updateErr } = await supabase
      .from('threads')
      .update({ stage: 'discovered', approved_at: null })
      .eq('id', threadId)
      .eq('workspace_id', workspaceId);

    if (updateErr) return { success: false, error: updateErr.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}