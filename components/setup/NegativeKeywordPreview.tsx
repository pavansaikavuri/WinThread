import React from 'react';
import { Filter } from 'lucide-react';

interface NegativeKeywordPreviewProps {
  count: number;
}

export function NegativeKeywordPreview({ count }: NegativeKeywordPreviewProps) {
  const filterPct = Math.min(85, Math.max(15, count * 14));

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
      <Filter className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
      <span>
        With these negative keywords, <strong>~{filterPct}%</strong> of noisy posts (job applicants, recruiters, student courses) will be filtered out automatically.
      </span>
    </div>
  );
}