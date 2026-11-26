'use client';

import React from 'react';
import { CommunicationChannel } from '@/types/outreach';
import { Send, CheckCircle2, Shield } from 'lucide-react';

interface OutreachToolbarProps {
  contactedTodayCount: number;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function OutreachToolbar({
  contactedTodayCount,
  activeFilter,
  onFilterChange,
}: OutreachToolbarProps) {
  const filters = [
    { id: 'all', label: 'All Approved' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'email', label: 'Email' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'phone', label: 'Phone Ready' },
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
      {/* Daily Progress Gauge (Tension-Free) */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <span>{contactedTodayCount} Leads Contacted Today</span>
            <Shield className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <p className="text-xs text-neutral-400">Zero platform ban risk with 1-click direct delivery</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeFilter === f.id
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}