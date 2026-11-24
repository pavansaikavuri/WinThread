'use server';

import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { fetchHackerNewsSignals } from '@/lib/scraper/hackernews';
import { fetchBlueskySignals } from '@/lib/scraper/bluesky';
import { calculateMDIE } from '@/lib/scoring/mdie';
import { createServerClient } from '@/lib/supabase/server';

async function getAuthenticatedClient(): Promise<{ supabase: SupabaseClient; userId: string } | { error: string }> {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  return { supabase, userId: user.id };
}

async function verifyWorkspaceAccess(supabase: SupabaseClient, userId: string, workspaceId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('workspace_id')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, owner_id')
    .eq('id', workspaceId)
    .single();

  if (!workspace) return false;

  return workspace.owner_id === userId || profile.workspace_id === workspaceId;
}

export async function approveThread(threadId: string, workspaceId: string) {
  const auth = await getAuthenticatedClient();
  if ('error' in auth) return { success: false, error: auth.error };

  const { supabase, userId } = auth;

  const hasAccess = await verifyWorkspaceAccess(supabase, userId, workspaceId);
  if (!hasAccess) {
    return { success: false, error: 'Access denied to this workspace' };
  }

  try {
    const { data: thread, error: fetchErr } = await supabase
      .from('threads')
      .select('id, match_score')
      .eq('id', threadId)
      .eq('workspace_id', workspaceId)
      .single();

    if (fetchErr || !thread) return { success: false, error: 'Thread not found' };

    await supabase.from('threads').update({ status: 'approved' }).eq('id', threadId);

    await supabase.from('events').insert({
      workspace_id: workspaceId,
      event_type: 'thread_approved',
      payload_json: { thread_id: threadId },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function dismissThread(
  threadId: string,
  workspaceId: string,
  reason: 'wrong_person' | 'no_budget' | 'competitor' | 'outdated'
) {
  const auth = await getAuthenticatedClient();
  if ('error' in auth) return { success: false, error: auth.error };

  const { supabase, userId } = auth;

  const hasAccess = await verifyWorkspaceAccess(supabase, userId, workspaceId);
  if (!hasAccess) {
    return { success: false, error: 'Access denied to this workspace' };
  }

  try {
    const { data: thread, error: fetchErr } = await supabase
      .from('threads')
      .select('id')
      .eq('id', threadId)
      .eq('workspace_id', workspaceId)
      .single();

    if (fetchErr || !thread) return { success: false, error: 'Thread not found' };

    await supabase.from('threads').update({
      status: 'dismissed',
      dismissal_reason: reason,
    }).eq('id', threadId);

    if (reason === 'wrong_person') {
      const { data: icp } = await supabase.from('icp_profiles').select('buying_signals').eq('workspace_id', workspaceId).single();
      if (icp?.buying_signals) {
        const updates = icp.buying_signals.map((kw: string) => ({
          workspace_id: workspaceId,
          keyword: kw,
          weight: 0.90,
        }));
        await supabase.from('keyword_weights').upsert(updates, { onConflict: 'workspace_id,keyword' });
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function scanLiveSignals(workspaceId: string) {
  const auth = await getAuthenticatedClient();
  if ('error' in auth) return { success: false, newCount: 0, error: auth.error };

  const { supabase, userId } = auth;

  const hasAccess = await verifyWorkspaceAccess(supabase, userId, workspaceId);
  if (!hasAccess) {
    return { success: false, newCount: 0, error: 'Access denied to this workspace' };
  }

  try {
    const { data: icp } = await supabase.from('icp_profiles').select('*').eq('workspace_id', workspaceId).single();
    if (!icp) return { success: false, newCount: 0, error: 'ICP not configured' };

    const queryTerm = icp.buying_signals?.[0] || icp.services?.[0] || 'agency';

    const [hnSignals, bskySignals] = await Promise.all([
      fetchHackerNewsSignals(queryTerm, 15),
      fetchBlueskySignals(queryTerm, 15),
    ]);
    const rawSignals = [...hnSignals, ...bskySignals];

    let newCount = 0;
    for (const signal of rawSignals) {
      const { data: rawRecord } = await supabase
        .from('raw_signals')
        .upsert({
          source: signal.source,
          external_id: signal.external_id,
          title: signal.title,
          content: signal.content,
          author: signal.author,
          thread_url: signal.thread_url,
          published_at: signal.published_at,
        }, { onConflict: 'source,external_id' })
        .select('id')
        .single();

      const score = calculateMDIE(signal, {
        services: icp.services || [],
        buyerTitles: icp.buyer_titles || [],
        painPoints: icp.pain_points || [],
        buyingSignals: icp.buying_signals || [],
        negativeKeywords: icp.negative_keywords || [],
      });

      if (score.matchScore >= 60) {
        await supabase.from('threads').upsert({
          workspace_id: workspaceId,
          raw_signal_id: rawRecord?.id || null,
          source_channel: signal.source,
          external_id: signal.external_id,
          author: signal.author,
          title: signal.title,
          content: signal.content,
          thread_url: signal.thread_url,
          match_score: score.matchScore,
          match_reason: score.matchReason,
          status: 'new',
        }, { onConflict: 'workspace_id,external_id' });
        newCount++;
      }
    }

    return { success: true, newCount };
  } catch (err: any) {
    return { success: false, newCount: 0, error: err.message };
  }
}