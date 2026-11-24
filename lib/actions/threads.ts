'use server';

import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { fetchHackerNewsSignals } from '@/lib/scraper/hackernews';
import { fetchBlueskySignals } from '@/lib/scraper/bluesky';
import { calculateMDIE } from '@/lib/scoring/mdie';

function getAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

export async function approveThread(threadId: string, workspaceId: string, client?: SupabaseClient) {
  const supabase = client || getAdminClient();
  try {
    // 1. Update status to approved
    const { data: thread, error: fetchErr } = await supabase
      .from('threads')
      .select('id, match_score')
      .eq('id', threadId)
      .eq('workspace_id', workspaceId)
      .single();

    if (fetchErr || !thread) return { success: false, error: 'Thread not found' };

    await supabase.from('threads').update({ status: 'approved' }).eq('id', threadId);

    // 2. Log event
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
  reason: 'wrong_persona' | 'no_budget' | 'competitor' | 'outdated',
  client?: SupabaseClient
) {
  const supabase = client || getAdminClient();
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

    // Hostile Review Fix #5: Only penalize keywords on "wrong_persona"
    if (reason === 'wrong_persona') {
      const { data: icp } = await supabase.from('icp_profiles').select('buying_signals').eq('workspace_id', workspaceId).single();
      if (icp?.buying_signals) {
        // Floor at 0.40 to prevent keyword starvation (Hostile Review Fix #4)
        const updates = icp.buying_signals.map((kw: string) => ({
          workspace_id: workspaceId,
          keyword: kw,
          weight: 0.90, // damped decrement
        }));
        await supabase.from('keyword_weights').upsert(updates, { onConflict: 'workspace_id,keyword' });
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function scanLiveSignals(workspaceId: string, client?: SupabaseClient) {
  const supabase = client || getAdminClient();
  try {
    const { data: icp } = await supabase.from('icp_profiles').select('*').eq('workspace_id', workspaceId).single();
    if (!icp) return { success: false, newCount: 0, error: 'ICP not configured' };

    const queryTerm = icp.buying_signals?.[0] || icp.services?.[0] || 'agency';

    // Parallel fetch from HN & Bluesky
    const [hnSignals, bskySignals] = await Promise.all([
      fetchHackerNewsSignals(queryTerm, 15),
      fetchBlueskySignals(queryTerm, 15),
    ]);
    const rawSignals = [...hnSignals, ...bskySignals];

    let newCount = 0;
    for (const signal of rawSignals) {
      // 1. Ingest into shared raw_signals pool
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

      // 2. Score via MDIE
      const score = calculateMDIE(signal, {
        services: icp.services || [],
        buyerTitles: icp.buyer_titles || [],
        painPoints: icp.pain_points || [],
        buyingSignals: icp.buying_signals || [],
        negativeKeywords: icp.negative_keywords || [],
      });

      // 3. If qualified (>= 60%), upsert into tenant threads table
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
