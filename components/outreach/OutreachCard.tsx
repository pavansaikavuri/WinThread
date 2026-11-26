'use client';

import React, { useState } from 'react';
import { OutreachThread } from '@/types/outreach';
import { markContacted, undoApproval } from '@/lib/actions/outreach';
import {
  generateLinkedInPitch,
  getLinkedInComposeUrl,
  generateEmailPayload,
  generateWhatsAppUrl,
} from '@/lib/outreach/deep-links';
import { CallScriptDrawer } from '@/components/outreach/CallScriptDrawer';
import { Mail, MessageSquare, Phone, RotateCcw, Check, ExternalLink } from 'lucide-react';

interface OutreachCardProps {
  thread: OutreachThread;
  agencyName: string;
  serviceName: string;
  onRefresh: () => void;
}

export function OutreachCard({ thread, agencyName, serviceName, onRefresh }: OutreachCardProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isActionPending, setIsActionPending] = useState<boolean>(false);

  const scriptVars = {
    prospectName: thread.author,
    companyName: thread.author_company || 'Company',
    postTopic: thread.title,
    postExcerpt: thread.content,
    agencyName,
    serviceOffered: serviceName,
  };

  const handleLinkedInSend = async () => {
    setIsActionPending(true);
    const pitch = generateLinkedInPitch(scriptVars);
    await navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    const composeUrl = getLinkedInComposeUrl(thread.author);
    window.open(composeUrl, '_blank');
    await markContacted(thread.id, thread.workspace_id, 'linkedin');
    setIsActionPending(false);
    onRefresh();
  };

  const handleEmailSend = async () => {
    setIsActionPending(true);
    const email = thread.author_email || 'contact@example.com';
    const emailPayload = generateEmailPayload(email, scriptVars);
    window.location.href = emailPayload.url;
    await markContacted(thread.id, thread.workspace_id, 'email');
    setIsActionPending(false);
    onRefresh();
  };

  const handleWhatsAppSend = async () => {
    setIsActionPending(true);
    const phone = thread.author_phone || '+15551234567';
    const waUrl = generateWhatsAppUrl(phone, scriptVars);
    window.open(waUrl, '_blank');
    await markContacted(thread.id, thread.workspace_id, 'whatsapp');
    setIsActionPending(false);
    onRefresh();
  };

  const handleUndo = async () => {
    setIsActionPending(true);
    await undoApproval(thread.id, thread.workspace_id);
    setIsActionPending(false);
    onRefresh();
  };

  return (
    <>
      <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-all space-y-4">
        {/* Card Header */}
        <div className="flex justify-between items-start gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-100 text-sm">{thread.author}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 capitalize">
                {thread.source_channel}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{thread.author_company || 'Independent'} · Match: {thread.match_score}%</p>
          </div>

          <button
            onClick={handleUndo}
            disabled={isActionPending}
            className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-300 py-1 px-2 rounded hover:bg-neutral-800"
          >
            <RotateCcw className="w-3 h-3" />
            Undo
          </button>
        </div>

        {/* Post Quote Context */}
        <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/60 text-xs text-neutral-300 italic">
          "{thread.content.slice(0, 180)}..."
        </div>

        {/* Action Cluster (1-Click Deep Links) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleLinkedInSend}
            disabled={isActionPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0077B5]/20 hover:bg-[#0077B5]/30 text-[#0077B5] border border-[#0077B5]/40 text-xs font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 'Copy & Open LinkedIn'}
          </button>

          <button
            onClick={handleEmailSend}
            disabled={isActionPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium"
          >
            <Mail className="w-3.5 h-3.5" />
            Send Email
          </button>

          <button
            onClick={handleWhatsAppSend}
            disabled={isActionPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-medium"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-medium"
          >
            <Phone className="w-3.5 h-3.5" />
            Call Script Co-Pilot
          </button>
        </div>
      </div>

      <CallScriptDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        thread={thread}
        agencyName={agencyName}
        serviceName={serviceName}
        onOutcomeLogged={onRefresh}
      />
    </>
  );
}