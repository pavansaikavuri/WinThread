'use client';

import React, { useState } from 'react';
import { OutreachThread, CallOutcomeType, CommunicationChannel } from '@/types/outreach';
import { logCallOutcome } from '@/lib/actions/outreach';
import { Phone, CheckCircle, ChevronDown, ChevronUp, X, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CallScriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  thread: OutreachThread;
  agencyName: string;
  serviceName: string;
  onOutcomeLogged: () => void;
}

export function CallScriptDrawer({
  isOpen,
  onClose,
  thread,
  agencyName,
  serviceName,
  onOutcomeLogged,
}: CallScriptDrawerProps) {
  if (!isOpen) return null;

  const [activeStep, setActiveStep] = useState<number>(1);
  const [expandedObjection, setExpandedObjection] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcomeType | null>(null);
  const [consentGranted, setConsentGranted] = useState<boolean>(false);
  const [consentChannel, setConsentChannel] = useState<CommunicationChannel>('whatsapp');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const firstName = thread.author.split(' ')[0] || 'there';
  const company = thread.author_company || 'your company';

  const steps = [
    {
      num: 1,
      id: 'orient',
      title: '1. Orient',
      headline: 'The Hook & Immediate Context',
      script: `Hi ${firstName}, this is [Your Name] from ${agencyName}. I saw your post regarding "${thread.title.slice(0, 50)}..." at ${company} and wanted to reach out directly with a quick question. Do you have 60 seconds?`,
    },
    {
      num: 2,
      id: 'qualify',
      title: '2. Qualify',
      headline: 'Single Diagnostic Bottleneck Question',
      script: `I noticed you were looking for solutions around ${thread.title}. What is currently your biggest bottleneck with your current workflow—is it setup speed, team bandwidth, or reliability?`,
    },
    {
      num: 3,
      id: 'objections',
      title: '3. Objections',
      headline: 'Instant Battle-Card Counters',
      script: 'Select any customer objection below for an instant response:',
    },
    {
      num: 4,
      id: 'book_quote',
      title: '4. Book/Quote',
      headline: 'The Pivot to Fixed-Price Proposal',
      script: `We build ${serviceName} specifically to displace this friction. Would it be okay if I prepare an itemized, fixed-price quote and email or WhatsApp it over to you today for your review?`,
    },
    {
      num: 5,
      id: 'close',
      title: '5. Close',
      headline: 'Next Steps & Compliance Confirmation',
      script: `Awesome, ${firstName}. I will send over the proposal right now. What is the best WhatsApp number or email to send the sign-off link to? Thank you for your time!`,
    },
  ];

  const objections = [
    {
      id: 'pricing',
      title: 'Pricing Objection',
      label: '"How much does this cost?"',
      script: 'We operate on fixed performance milestones, so you only pay for completed deliverables. Most implementations range from $1,500 to $3,500 with zero long-term retainer locks.',
    },
    {
      id: 'timing',
      title: 'Timing Objection',
      label: '"We are too busy right now / Call me next quarter"',
      script: 'Totally understand. The reason founders use us is because we handle 100% of the build in under 48 hours without eating up any of your internal team bandwidth. Can I send a 1-page overview to review when you have time?',
    },
    {
      id: 'competitor',
      title: 'Competitor / In-House Objection',
      label: '"We are building this in-house / using another tool"',
      script: 'That makes total sense. Many of our clients started there. We provide custom integration directly on top of your existing stack so you get immediate results without hiring new staff.',
    },
  ];

  const handleSaveOutcome = async () => {
    if (!selectedOutcome) return;
    setIsSubmitting(true);
    await logCallOutcome({
      threadId: thread.id,
      workspaceId: thread.workspace_id,
      outcome: selectedOutcome,
      consentGranted,
      consentChannel,
      requestDnd: selectedOutcome === 'not_interested',
    });
    setIsSubmitting(false);
    onOutcomeLogged();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-neutral-900 border-l border-neutral-800 h-full flex flex-col text-neutral-100 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-semibold text-sm text-neutral-100">{thread.author}</h2>
              <p className="text-xs text-neutral-400">{thread.author_phone || 'No phone verified'} · {company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigation Bar */}
        <div className="grid grid-cols-5 border-b border-neutral-800 bg-neutral-950/60 p-1 text-xs">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`py-2 px-1 text-center font-medium rounded transition-colors ${
                activeStep === s.num
                  ? 'bg-neutral-800 text-white border-b-2 border-emerald-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Active Step Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(() => {
            const current = steps.find((s) => s.num === activeStep)!;
            return (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Step {current.num}</span>
                  <h3 className="text-lg font-bold text-white">{current.headline}</h3>
                </div>

                <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 text-base leading-relaxed font-mono">
                  {current.script}
                </div>

                {/* Objections Accordion inside Step 3 */}
                {current.id === 'objections' && (
                  <div className="space-y-2 pt-2">
                    {objections.map((obj) => (
                      <div key={obj.id} className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950/50">
                        <button
                          onClick={() => setExpandedObjection(expandedObjection === obj.id ? null : obj.id)}
                          className="w-full p-3 text-left flex justify-between items-center text-sm font-semibold hover:bg-neutral-800/40"
                        >
                          <span>{obj.title} <span className="text-xs text-neutral-400 font-normal">({obj.label})</span></span>
                          {expandedObjection === obj.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedObjection === obj.id && (
                          <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-sm text-emerald-300 font-mono">
                            {obj.script}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Footer: Outcome Logger & Consent */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 space-y-3">
          <div className="text-xs font-semibold text-neutral-400">Record Call Outcome:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {(['interested', 'send_quote', 'callback', 'not_interested', 'wrong_number'] as CallOutcomeType[]).map((outcome) => (
              <button
                key={outcome}
                type="button"
                onClick={() => setSelectedOutcome(outcome)}
                className={`py-2 px-2 rounded border font-medium capitalize text-center ${
                  selectedOutcome === outcome
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                {outcome.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* DPDP §6 Verbal Consent Checkbox for Positive Outcomes */}
          {(selectedOutcome === 'interested' || selectedOutcome === 'send_quote') && (
            <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/50 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-emerald-200">
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-emerald-600 focus:ring-0"
                />
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Prospect verbally consented to follow-up (DPDP §6)
                </span>
              </label>
              {consentGranted && (
                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                  <span>Channel:</span>
                  {(['whatsapp', 'email', 'linkedin'] as CommunicationChannel[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setConsentChannel(ch)}
                      className={`px-2 py-0.5 rounded capitalize ${
                        consentChannel === ch ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-1">
            <button
              onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Next Step →
            </button>
            <button
              disabled={!selectedOutcome || isSubmitting}
              onClick={handleSaveOutcome}
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Log Call & Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}