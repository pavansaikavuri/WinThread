'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, FileText, Sparkles } from 'lucide-react';

export interface ThreadItem {
  id: string;
  source_channel: string;
  author: string;
  title: string;
  content: string;
  thread_url: string;
  match_score: number;
  match_reason: string;
  status: string;
}

interface ThreadCardProps {
  thread: ThreadItem;
  onApprove: (id: string) => void;
  onDismiss: (id: string, reason: string) => void;
  onGenerateQuote: (thread: ThreadItem) => void;
}

export function ThreadCard({ thread, onApprove, onDismiss, onGenerateQuote }: ThreadCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDismiss, setShowDismiss] = useState(false);

  const defaultReply = `Hi @${thread.author}, saw your post about "${thread.title.slice(0, 50)}...". We help founders automate this exact workflow. Happy to share a quick loom breakdown if helpful!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultReply);
    setCopied(true);
    onApprove(thread.id);
    setTimeout(() => setCopied(false), 2500);
  };

  const isHot = thread.match_score >= 85;

  return (
    <div className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {thread.source_channel}
          </span>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">@{thread.author}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isHot && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold">
              <Sparkles className="w-3 h-3" /> HOT
            </span>
          )}
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              thread.match_score >= 85
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            {thread.match_score}% Match
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{thread.title}</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{thread.content}</p>
      </div>

      {/* Reason Box */}
      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 rounded-lg text-xs text-zinc-500 italic">
        Why: {thread.match_reason}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900">
        <a
          href={thread.thread_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          View Live Post <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex items-center gap-2">
          {showDismiss ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDismiss(thread.id, 'wrong_person')}
                className="text-[11px] px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                Wrong Fit
              </button>
              <button
                type="button"
                onClick={() => onDismiss(thread.id, 'outdated')}
                className="text-[11px] px-2 py-1 rounded bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              >
                Outdated
              </button>
              <button
                type="button"
                onClick={() => setShowDismiss(false)}
                className="text-[11px] px-1 text-zinc-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDismiss(true)}
              className="text-xs px-2.5 py-1.5 text-zinc-500 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Not a Fit
            </button>
          )}

          <button
            type="button"
            onClick={() => onGenerateQuote(thread)}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <FileText className="w-3.5 h-3.5" /> Generate Quote
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Reply'}
          </button>
        </div>
      </div>
    </div>
  );
}
