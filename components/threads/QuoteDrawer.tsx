'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Mail, DollarSign } from 'lucide-react';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  thread: { author: string; title: string; id: string } | null;
}

export function QuoteDrawer({ isOpen, onClose, thread }: QuoteDrawerProps) {
  const [email, setEmail] = useState('');
  const [service, setService] = useState('AI Automation & Workflow Integration');
  const [amount, setAmount] = useState('2500');
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  if (!isOpen || !thread) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate shareable quote link creation
    setCreatedUrl(`https://winthread.app/q/${thread.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 p-6 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Generate Mode A Quote</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Create instant proposal link for @{thread.author}</p>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {createdUrl ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                <CheckCircle className="w-4 h-4" /> Proposal Link Ready!
              </div>
              <input
                type="text"
                readOnly
                value={createdUrl}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border rounded border-emerald-300 dark:border-emerald-700 select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdUrl);
                  alert('Copied proposal link to clipboard!');
                }}
                className="w-full py-2 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700"
              >
                Copy Link to Paste in Reply
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Prospect Email (Required for E-Sign)</label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="prospect@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Proposed Deliverable</label>
                <input
                  type="text"
                  required
                  value={service}
                  onChange={e => setService(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Quote Total (USD)</label>
                <div className="relative mt-1">
                  <DollarSign className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-sm font-medium transition-colors"
              >
                Generate Proposal Link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
