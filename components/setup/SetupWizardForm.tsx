'use client';

import React, { useState } from 'react';
import { ArrowRight, Globe, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { SetupFormData, setupFormSchema } from '@/lib/validations/setup';
import { TagInput } from './TagInput';
import { NegativeKeywordPreview } from './NegativeKeywordPreview';
import { ICP_PRESETS } from '@/lib/constants/icp-presets';

interface SetupWizardFormProps {
  onSubmit: (data: SetupFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function SetupWizardForm({ onSubmit, isSubmitting }: SetupWizardFormProps) {
  const [step, setStep] = useState<'url' | 'review'>('url');
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<SetupFormData>({
    agencyUrl: '',
    workspaceName: '',
    services: [],
    buyerTitles: [],
    painPoints: [],
    buyingSignals: [],
    negativeKeywords: ['job', 'hiring', 'internship', 'course', 'free'],
  });

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agencyUrl) return;

    setIsExtracting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/setup/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.agencyUrl }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          workspaceName: data.data.workspaceName,
          services: data.data.services,
          buyerTitles: data.data.buyerTitles,
          painPoints: data.data.painPoints,
          buyingSignals: data.data.buyingSignals,
          negativeKeywords: data.data.negativeKeywords,
        }));
      } else {
        const defaultPreset = ICP_PRESETS[0];
        setFormData(prev => ({
          ...prev,
          workspaceName: 'My Agency',
          services: defaultPreset.services,
          buyerTitles: defaultPreset.buyerTitles,
          painPoints: defaultPreset.painPoints,
          buyingSignals: defaultPreset.buyingSignals,
        }));
      }
      setStep('review');
    } catch {
      setStep('review');
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = ICP_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setFormData(prev => ({
      ...prev,
      services: preset.services,
      buyerTitles: preset.buyerTitles,
      painPoints: preset.painPoints,
      buyingSignals: preset.buyingSignals,
      negativeKeywords: preset.negativeKeywords,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = setupFormSchema.safeParse(formData);
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }
    setErrorMsg(null);
    await onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs">
      {step === 'url' ? (
        <form onSubmit={handleScan} className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Welcome to WinThread
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Paste your agency URL. We will extract your services, buyer personas, and intent signals to tune your daily lead feed.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Agency Website URL</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
              <input
                type="url"
                required
                value={formData.agencyUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, agencyUrl: e.target.value }))}
                placeholder="https://myagency.com"
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isExtracting || !formData.agencyUrl}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning website & extracting ICP...
              </>
            ) : (
              <>
                Scan Website & Build ICP
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Confirm Your Ideal Customer Profile</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Review and tweak extracted signals before we score your first lead batch.</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mode A: Quote & Invoicing
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Or choose a proven agency template:
            </span>
            <div className="flex flex-wrap gap-2">
              {ICP_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className="text-xs px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Workspace / Agency Name</label>
              <input
                type="text"
                required
                value={formData.workspaceName}
                onChange={(e) => setFormData(prev => ({ ...prev, workspaceName: e.target.value }))}
                className="mt-1 w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>

            <TagInput
              label="Services Offered"
              tags={formData.services}
              onChange={(services) => setFormData(prev => ({ ...prev, services }))}
              placeholder="e.g. AI Workflow Automation"
            />

            <TagInput
              label="Target Buyer Titles"
              tags={formData.buyerTitles}
              onChange={(buyerTitles) => setFormData(prev => ({ ...prev, buyerTitles }))}
              placeholder="e.g. Founder, CEO, CTO"
            />

            <TagInput
              label="Prospect Pain Points"
              tags={formData.painPoints}
              onChange={(painPoints) => setFormData(prev => ({ ...prev, painPoints }))}
              placeholder="e.g. High customer support overhead"
            />

            <TagInput
              label="Buying Signals & Keywords"
              description="These seed your initial scoring weights (W_j = 1.00)"
              tags={formData.buyingSignals}
              onChange={(buyingSignals) => setFormData(prev => ({ ...prev, buyingSignals }))}
              placeholder="e.g. looking for agency, build chatbot"
            />

            <div className="space-y-2">
              <TagInput
                label="Negative / Exclusion Keywords"
                description="Must have at least 3 keywords to filter job-seekers, internships, and noisy posts."
                tags={formData.negativeKeywords}
                minRequired={3}
                onChange={(negativeKeywords) => setFormData(prev => ({ ...prev, negativeKeywords }))}
                placeholder="e.g. job, hiring, intern"
              />
              <NegativeKeywordPreview count={formData.negativeKeywords.length} />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMsg}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('url')}
              className="px-4 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.negativeKeywords.length < 3}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing Workspace...
                </>
              ) : (
                'Save Profile & Continue to Signal Feed'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}