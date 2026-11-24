'use client';

import React, { useState } from 'react';
import { FeedToolbar } from '@/components/threads/FeedToolbar';
import { ThreadCard, ThreadItem } from '@/components/threads/ThreadCard';
import { QuoteDrawer } from '@/components/threads/QuoteDrawer';
import { approveThread, dismissThread, scanLiveSignals } from '@/lib/actions/threads';

export default function ThreadsPage() {
  const [channel, setChannel] = useState('all');
  const [onlyHot, setOnlyHot] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedQuoteThread, setSelectedQuoteThread] = useState<ThreadItem | null>(null);

  // Initial starter leads (from Task 4 seeding)
  const [threads, setThreads] = useState<ThreadItem[]>([
    {
      id: 't-1',
      source_channel: 'reddit',
      author: 'u/growth_director',
      title: 'Looking for a reliable agency to handle automated customer communication and follow-ups',
      content: 'Our team is dropping 25% of leads after business hours. Need an agency or tool to automate booking and follow-up immediately.',
      thread_url: 'https://reddit.com/r/smallbusiness/comments/sample1',
      match_score: 94,
      match_reason: 'Prospect has acute pain with dropped after-hours leads and asks for immediate agency automation assistance.',
      status: 'new',
    },
    {
      id: 't-2',
      source_channel: 'hackernews',
      author: 'startup_sam',
      title: 'Ask HN: Any specialized B2B outbound agencies recommended for early-stage SaaS?',
      content: 'We need predictable sales pipeline. Would rather hire a proven specialized agency than spend 3 months recruiting SDRs.',
      thread_url: 'https://news.ycombinator.com/item?id=sample2',
      match_score: 91,
      match_reason: 'Founder actively seeking agency partnership for predictable outbound pipeline.',
      status: 'new',
    },
    {
      id: 't-3',
      source_channel: 'bluesky',
      author: 'alex.bsky.social',
      title: 'Need an AI dev shop to build custom workflow chatbots',
      content: 'Struggling with Zapier limits, looking to hire an agency to build a custom solution.',
      thread_url: 'https://bsky.app/profile/alex.bsky.social',
      match_score: 86,
      match_reason: 'Explicit buying signal for custom AI chatbots.',
      status: 'new',
    },
  ]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('quote') === '1' && threads.length > 0) {
        setSelectedQuoteThread(threads[0]);
      }
    }
  }, [threads]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await scanLiveSignals('mock-workspace-id');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApprove = async (id: string) => {
    await approveThread(id, 'mock-workspace-id');
    setThreads(prev => prev.map(t => (t.id === id ? { ...t, status: 'approved' } : t)));
  };

  const handleDismiss = async (id: string, reason: string) => {
    await dismissThread(id, 'mock-workspace-id', reason as any);
    setThreads(prev => prev.filter(t => t.id !== id));
  };

  const filteredThreads = threads.filter(t => {
    if (channel !== 'all' && t.source_channel !== channel) return false;
    if (onlyHot && t.match_score < 85) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q) || t.author.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: threads.length,
    reddit: threads.filter(t => t.source_channel === 'reddit').length,
    hackernews: threads.filter(t => t.source_channel === 'hackernews').length,
    bluesky: threads.filter(t => t.source_channel === 'bluesky').length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Ranked Signal Feed
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time intent signals scored against your Ideal Customer Profile.
          </p>
        </div>

        <FeedToolbar
          activeChannel={channel}
          onSelectChannel={setChannel}
          onlyHot={onlyHot}
          onToggleHot={() => setOnlyHot(p => !p)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onScanNow={handleScan}
          isScanning={isScanning}
          counts={counts}
        />

        <div className="space-y-4">
          {filteredThreads.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <p className="text-sm text-zinc-500">No leads found matching your active filters.</p>
            </div>
          ) : (
            filteredThreads.map(thread => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onApprove={handleApprove}
                onDismiss={handleDismiss}
                onGenerateQuote={t => setSelectedQuoteThread(t)}
              />
            ))
          )}
        </div>

        <QuoteDrawer
          isOpen={!!selectedQuoteThread}
          onClose={() => setSelectedQuoteThread(null)}
          thread={selectedQuoteThread}
        />
      </div>
    </div>
  );
}
