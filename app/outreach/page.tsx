'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OutreachThread } from '@/types/outreach';
import { getOutreachQueue } from '@/lib/actions/outreach';
import { OutreachToolbar } from '@/components/outreach/OutreachToolbar';
import { OutreachCard } from '@/components/outreach/OutreachCard';

const INITIAL_APPROVED_THREADS: OutreachThread[] = [
  {
    id: 'th-1',
    workspace_id: 'default-workspace',
    raw_signal_id: null,
    source_channel: 'reddit',
    external_id: 'rd-101',
    author: 'u/growth_director',
    title: 'Looking for a reliable agency to handle automated customer communication and follow-ups',
    content: 'Our team is dropping 25% of leads after business hours. Need an agency or tool to automate booking and follow-up immediately.',
    thread_url: 'https://reddit.com/r/smallbusiness/comments/sample1',
    match_score: 94,
    match_reason: 'Prospect has acute pain with dropped after-hours leads and asks for immediate agency automation assistance.',
    stage: 'approved',
    approved_at: new Date().toISOString(),
    contacted_at: null,
    contact_method: null,
    author_email: 'growth@modernscale.io',
    author_phone: '+15552345678',
    author_company: 'ModernScale SaaS',
    created_at: new Date().toISOString(),
  },
  {
    id: 'th-2',
    workspace_id: 'default-workspace',
    raw_signal_id: null,
    source_channel: 'hackernews',
    external_id: 'hn-102',
    author: 'startup_sam',
    title: 'Ask HN: Any specialized B2B outbound agencies recommended for early-stage SaaS?',
    content: 'We need predictable sales pipeline. Would rather hire a proven specialized agency than spend 3 months recruiting SDRs.',
    thread_url: 'https://news.ycombinator.com/item?id=sample2',
    match_score: 91,
    match_reason: 'Founder actively seeking agency partnership for predictable outbound pipeline.',
    stage: 'approved',
    approved_at: new Date().toISOString(),
    contacted_at: null,
    contact_method: null,
    author_email: 'sam@nexustech.co',
    author_phone: '+15559876543',
    author_company: 'NexusTech',
    created_at: new Date().toISOString(),
  },
  {
    id: 'th-3',
    workspace_id: 'default-workspace',
    raw_signal_id: null,
    source_channel: 'bluesky',
    external_id: 'bs-103',
    author: 'alex.bsky.social',
    title: 'Need an AI dev shop to build custom workflow chatbots',
    content: 'Struggling with Zapier limits, looking to hire an agency to build a custom solution for customer onboarding.',
    thread_url: 'https://bsky.app/profile/alex.bsky.social',
    match_score: 86,
    match_reason: 'Explicit buying signal for custom AI chatbots.',
    stage: 'approved',
    approved_at: new Date().toISOString(),
    contacted_at: null,
    contact_method: null,
    author_email: 'alex@onboardflow.dev',
    author_phone: '+15553456789',
    author_company: 'OnboardFlow',
    created_at: new Date().toISOString(),
  },
];

export default function OutreachPage() {
  const [threads, setThreads] = useState<OutreachThread[]>(INITIAL_APPROVED_THREADS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [contactedCount, setContactedCount] = useState<number>(1);

  useEffect(() => {
    async function loadQueue() {
      try {
        const res = await getOutreachQueue('default-workspace');
        if (res && res.success && res.threads && res.threads.length > 0) {
          setThreads(res.threads);
        }
      } catch {
        // Graceful fallback to initial approved threads for preview/unauthenticated environments
      }
    }
    loadQueue();
  }, []);

  const handleRefresh = () => {
    setThreads((prev) => prev.filter((t) => t.stage === 'approved'));
    setContactedCount((prev) => prev + 1);
  };

  const filteredThreads = threads.filter((t) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'phone') return Boolean(t.author_phone);
    return t.contact_method === activeFilter || activeFilter === 'all';
  });

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Outreach Queue &amp; Call Script Co-Pilot</h1>
          <p className="text-sm text-neutral-400 mt-1">1-click delivery with zero account ban risk. Review approved leads and execute outreach.</p>
        </div>

        {/* Toolbar with Activity Progress */}
        <OutreachToolbar
          contactedTodayCount={contactedCount}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Queue Cards */}
        {filteredThreads.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-neutral-800 bg-neutral-900/20 space-y-3">
            <p className="text-sm text-neutral-400">Outreach queue is empty for this channel filter.</p>
            <p className="text-xs text-neutral-500">Approve leads from the <Link href="/threads" className="text-emerald-400 underline">Signal Feed</Link> to stage outreach here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredThreads.map((thread) => (
              <OutreachCard
                key={thread.id}
                thread={thread}
                agencyName="Apex Flow"
                serviceName="B2B AI Automation"
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
