import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { Suspense } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getOutreachQueue } from '@/lib/actions/outreach';
import { OutreachToolbar } from '@/components/outreach/OutreachToolbar';
import { OutreachCard } from '@/components/outreach/OutreachCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'WinThread — Outreach Queue',
  description: 'Zero-ban 1-click outreach queue and 5-step call script co-pilot',
};

async function OutreachContent() {
  noStore();
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If unauthenticated in dev/preview, use mock or redirect
  const workspaceId = user ? 'default-workspace' : 'default-workspace';

  const { threads } = await getOutreachQueue(workspaceId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex justify-between items-center">
          <Link href="/threads" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Signal Feed
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
            Feature 03: Outreach Queue
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Outreach Queue & Call Script Co-Pilot</h1>
          <p className="text-sm text-neutral-400 mt-1">1-click delivery with zero account ban risk. Review approved leads and execute outreach.</p>
        </div>

        {/* Toolbar with Activity Progress */}
        <OutreachToolbar
          contactedTodayCount={threads.length > 0 ? 3 : 0}
          activeFilter="all"
          onFilterChange={() => {}}
        />

        {/* Queue Cards */}
        {threads.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-neutral-800 bg-neutral-900/20 space-y-3">
            <p className="text-sm text-neutral-400">Outreach queue is empty.</p>
            <p className="text-xs text-neutral-500">Approve leads from the <Link href="/threads" className="text-emerald-400 underline">Signal Feed</Link> to stage outreach here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {threads.map((thread) => (
              <OutreachCard
                key={thread.id}
                thread={thread}
                agencyName="My Agency"
                serviceName="Workflow Automation"
                onRefresh={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function OutreachPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center">Loading...</div>}>
      <OutreachContent />
    </Suspense>
  );
}