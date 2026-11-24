'use client';

import React from 'react';
import { Search, RotateCw, Sparkles } from 'lucide-react';

interface FeedToolbarProps {
  activeChannel: string;
  onSelectChannel: (channel: string) => void;
  onlyHot: boolean;
  onToggleHot: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onScanNow: () => void;
  isScanning: boolean;
  counts: Record<string, number>;
}

export function FeedToolbar({
  activeChannel,
  onSelectChannel,
  onlyHot,
  onToggleHot,
  searchQuery,
  onSearchChange,
  onScanNow,
  isScanning,
  counts,
}: FeedToolbarProps) {
  const channels = [
    { id: 'all', label: 'All' },
    { id: 'hackernews', label: 'Hacker News' },
    { id: 'reddit', label: 'Reddit' },
    { id: 'bluesky', label: 'Bluesky' },
  ];

  return (
    <div className="space-y-3 bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      {/* Top Search & Scan Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search leads, keywords, companies..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none"
          />
        </div>

        <button
          type="button"
          disabled={isScanning}
          onClick={onScanNow}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Scan Channels Now'}
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-1.5">
          {channels.map(ch => (
            <button
              key={ch.id}
              type="button"
              onClick={() => onSelectChannel(ch.id)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeChannel === ch.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              {ch.label} ({counts[ch.id] || 0})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleHot}
          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
            onlyHot
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
              : 'text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          HOT Leads (85%+)
        </button>
      </div>
    </div>
  );
}
