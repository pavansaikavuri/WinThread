'use server';

import { SetupFormData, setupFormSchema } from '@/lib/validations/setup';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

export async function completeSetupWizard(data: SetupFormData, authUserId?: string) {
  const parsed = setupFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return executeSetupTransaction(supabaseAdmin, parsed.data, authUserId || 'unauthenticated-lead');
}

export async function executeSetupTransaction(
  supabase: SupabaseClient,
  data: SetupFormData,
  userId: string
) {
  const domain = new URL(data.agencyUrl).hostname.replace(/^www\./, '');

  const { data: existingWs } = await supabase
    .from('workspaces')
    .select('id')
    .eq('domain', domain)
    .maybeSingle();

  let workspaceId = existingWs?.id;

  if (!workspaceId) {
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name: data.workspaceName,
        domain,
        currency: 'USD',
        timezone: 'UTC',
        plan: 'beta',
        status: 'active',
      })
      .select('id')
      .single();

    if (wsError || !workspace) {
      return { success: false, error: wsError?.message || 'Failed to create workspace' };
    }
    workspaceId = workspace.id;
  }

  const { error: icpError } = await supabase.from('icp_profiles').upsert({
    workspace_id: workspaceId,
    services: data.services,
    buyer_titles: data.buyerTitles,
    pain_points: data.painPoints,
    buying_signals: data.buyingSignals,
    negative_keywords: data.negativeKeywords,
  }, { onConflict: 'workspace_id' });

  if (icpError) {
    return { success: false, error: icpError.message };
  }

  const defaultSourceWeights = [
    { workspace_id: workspaceId, channel: 'reddit', weight: 1.20 },
    { workspace_id: workspaceId, channel: 'hackernews', weight: 1.00 },
    { workspace_id: workspaceId, channel: 'bluesky', weight: 0.90 },
    { workspace_id: workspaceId, channel: 'other', weight: 1.00 },
  ];
  await supabase.from('weights').upsert(defaultSourceWeights, { onConflict: 'workspace_id,channel' });

  if (data.buyingSignals.length > 0) {
    const keywordWeights = data.buyingSignals.map(kw => ({
      workspace_id: workspaceId,
      keyword: kw,
      weight: 1.00,
    }));
    await supabase.from('keyword_weights').upsert(keywordWeights, { onConflict: 'workspace_id,keyword' });
  }

  const starterSignals = [
    {
      workspace_id: workspaceId,
      source: 'reddit',
      external_id: `seed-1-${workspaceId}`,
      author: 'u/growth_director',
      title: 'Looking for a reliable agency to handle automated customer communication and follow-ups',
      content: 'Our team is dropping 25% of leads after business hours. Need an agency or tool to automate booking and follow-up immediately.',
      thread_url: 'https://reddit.com/r/smallbusiness/comments/sample1',
      match_score: 94,
      match_reason: 'Prospect has acute pain with dropped after-hours leads and asks for immediate agency automation assistance.',
      status: 'new',
    },
    {
      workspace_id: workspaceId,
      source: 'hackernews',
      external_id: `seed-2-${workspaceId}`,
      author: 'startup_sam',
      title: 'Ask HN: Any specialized B2B outbound agencies recommended for early-stage SaaS?',
      content: 'We need predictable sales pipeline. Would rather hire a proven specialized agency than spend 3 months recruiting SDRs.',
      thread_url: 'https://news.ycombinator.com/item?id=sample2',
      match_score: 91,
      match_reason: 'Founder actively seeking agency partnership for predictable outbound pipeline.',
      status: 'new',
    },
  ];
  await supabase.from('threads').upsert(starterSignals, { onConflict: 'workspace_id,external_id' });

  await supabase.from('events').insert({
    workspace_id: workspaceId,
    event_type: 'setup_completed',
    payload_json: {
      url: data.agencyUrl,
      services_count: data.services.length,
      signals_count: data.buyingSignals.length,
      negative_count: data.negativeKeywords.length,
      completed_by: userId,
    },
  });

  return { success: true, workspaceId };
}