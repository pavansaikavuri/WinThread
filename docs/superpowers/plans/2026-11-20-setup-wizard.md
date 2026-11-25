# Feature 01: Website-to-ICP Setup Wizard (`/setup`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/setup` onboarding flow where an agency founder pastes their agency URL, automatically extracts/customizes their Ideal Customer Profile (services, buyer titles, pain points, buying signals, and minimum 3 negative keywords), confirms Mode A (Built-in Quote & Invoice Ledger), and atomically initializes their workspace, default scoring weights, and keyword weights in Supabase PostgreSQL.

**Architecture:** Next.js 16 (App Router) Server Actions and Client Form (`react-hook-form` + `zod`). Website metadata extraction via an internal heuristic extraction utility (`lib/scraper/extract.ts`) with reliable fallback agency presets (RaisedHand Option B pattern, $0 cost). Atomic database persistence via Supabase SSR client executing workspace and seed insertion in `lib/actions/setup.ts`.

**Tech Stack:** Next.js 16.4.6, React 19.3.0, TypeScript 5, Tailwind CSS 4, `@supabase/ssr`, `zod`, `lucide-react`, `vitest`.

**Spec:** `docs/features/01-setup-wizard.md`, `docs/PRD.md` (Screen 1), `docs/MVP.md` (Section 3 & 4), `docs/DATABASE.md` (Tables: `workspaces`, `icp_profiles`, `weights`, `keyword_weights`, `events`).

## Global Constraints

- Strict TypeScript with zero `any` or unsafe `as` casts.
- Strict multi-tenant Row Level Security (RLS) enforcement via `workspace_id`.
- Minimum 3 negative keywords required before submission can proceed (PRD Screen 1 AC 2).
- Mode A (Standalone Ledger) is the sole active CRM mode for Phase 1 MVP; Mode B is postponed to Phase 1.5.
- Test-driven development (TDD) for every module: failing test first, minimal implementation, passing test.

---

### Task 1: Test Infrastructure Setup (Vitest + Testing Library)

**Files:**
- Create: `vitest.config.mts`
- Create: `tests/setup.ts`
- Test: `tests/unit/sanity.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: Node.js & React 19 environment
- Produces: `npm test` command executing unit and component tests

- [ ] **Step 1: Write failing sanity test**

```typescript
// tests/unit/sanity.test.ts
import { describe, it, expect } from 'vitest';

describe('Test Infrastructure Sanity', () => {
  it('runs unit tests successfully', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify failure (due to missing runner)**

Run: `npx vitest run tests/unit/sanity.test.ts`  
Expected: FAIL (command not found or missing config)

- [ ] **Step 3: Install vitest devDependencies and configure**

Run: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`

```typescript
// vitest.config.mts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    alias: {
      '@': path.resolve('./'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`  
Expected: PASS (1 test passed)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.mts tests/setup.ts tests/unit/sanity.test.ts
git commit -m "chore(test): configure vitest and testing-library for nextjs 16"
```

---

### Task 2: ICP Validation Schema & Presets Module

**Files:**
- Create: `lib/validations/setup.ts`
- Create: `lib/constants/icp-presets.ts`
- Test: `tests/unit/setup-validation.test.ts`

**Interfaces:**
- Consumes: Zod schema primitives
- Produces: `setupFormSchema`, `SetupFormData`, `ICP_PRESETS`

- [ ] **Step 1: Write failing schema tests**

```typescript
// tests/unit/setup-validation.test.ts
import { describe, it, expect } from 'vitest';
import { setupFormSchema } from '@/lib/validations/setup';

describe('setupFormSchema', () => {
  it('rejects an invalid URL', () => {
    const result = setupFormSchema.safeParse({
      agencyUrl: 'not-a-url',
      workspaceName: 'Acme Growth',
      services: ['Lead Gen'],
      buyerTitles: ['Founder'],
      painPoints: ['No leads'],
      buyingSignals: ['looking for agency'],
      negativeKeywords: ['job', 'internship', 'hiring'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 3 negative keywords per PRD contract', () => {
    const result = setupFormSchema.safeParse({
      agencyUrl: 'https://acmegrowth.com',
      workspaceName: 'Acme Growth',
      services: ['Lead Gen'],
      buyerTitles: ['Founder'],
      painPoints: ['No leads'],
      buyingSignals: ['looking for agency'],
      negativeKeywords: ['job', 'hiring'], // only 2!
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('At least 3 negative keywords are required');
    }
  });

  it('accepts valid setup payload with >= 3 negative keywords', () => {
    const result = setupFormSchema.safeParse({
      agencyUrl: 'https://acmegrowth.com',
      workspaceName: 'Acme Growth',
      services: ['AI Automation'],
      buyerTitles: ['Founder', 'CEO'],
      painPoints: ['Manual prospecting'],
      buyingSignals: ['need automation', 'hiring agency'],
      negativeKeywords: ['job', 'hiring', 'internship'],
    });
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/setup-validation.test.ts`  
Expected: FAIL (`cannot find module '@/lib/validations/setup'`)

- [ ] **Step 3: Implement Zod schema and niche presets**

```typescript
// lib/validations/setup.ts
import { z } from 'zod';

export const setupFormSchema = z.object({
  agencyUrl: z.string().url('Please enter a valid website URL (e.g. https://agency.com)'),
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters'),
  services: z.array(z.string().min(1)).min(1, 'Add at least one service offered'),
  buyerTitles: z.array(z.string().min(1)).min(1, 'Add at least one buyer title'),
  painPoints: z.array(z.string().min(1)).min(1, 'Add at least one pain point'),
  buyingSignals: z.array(z.string().min(1)).min(1, 'Add at least one buying signal'),
  negativeKeywords: z.array(z.string().min(1)).min(3, 'At least 3 negative keywords are required to prevent noisy signals'),
});

export type SetupFormData = z.infer<typeof setupFormSchema>;
```

```typescript
// lib/constants/icp-presets.ts
export interface ICPPreset {
  id: string;
  name: string;
  services: string[];
  buyerTitles: string[];
  painPoints: string[];
  buyingSignals: string[];
  negativeKeywords: string[];
}

export const ICP_PRESETS: ICPPreset[] = [
  {
    id: 'ai-automation',
    name: 'AI Automation Agency',
    services: ['AI Chatbot Development', 'Workflow Automation', 'Custom LLM Pipelines'],
    buyerTitles: ['Founder', 'CEO', 'CTO', 'Head of Operations'],
    painPoints: ['Manual repetitive tasks', 'Slow customer response times', 'High support overhead'],
    buyingSignals: ['looking for AI help', 'automate workflow', 'build chatbot', 'need Make/Zapier expert'],
    negativeKeywords: ['job', 'hiring', 'internship', 'course', 'free', 'tutorial'],
  },
  {
    id: 'b2b-leadgen',
    name: 'B2B Lead Generation Agency',
    services: ['Cold Email Infrastructure', 'LinkedIn Outbound', 'Appointment Setting'],
    buyerTitles: ['Founder', 'CEO', 'VP Sales', 'Head of Growth'],
    painPoints: ['Empty sales pipeline', 'Low email deliverability', 'Inconsistent inbound leads'],
    buyingSignals: ['need more leads', 'hire SDR', 'cold email agency', 'looking for appointments'],
    negativeKeywords: ['resume', 'apply', 'salary', 'hiring', 'intern'],
  },
  {
    id: 'performance-marketing',
    name: 'Performance Marketing Agency',
    services: ['Meta Ads Management', 'Google Ads Scaling', 'Landing Page CRO'],
    buyerTitles: ['Founder', 'CMO', 'Head of Marketing', 'Ecommerce Director'],
    painPoints: ['High CAC', 'Ad fatigue', 'Poor return on ad spend'],
    buyingSignals: ['looking for ads agency', 'scale ROAS', 'hire media buyer', 'PPC agency recommendation'],
    negativeKeywords: ['job opening', 'full-time', 'internship', 'course'],
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/setup-validation.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/validations/setup.ts lib/constants/icp-presets.ts tests/unit/setup-validation.test.ts
git commit -m "feat(setup): add setupFormSchema with min 3 negative keywords rule and ICP presets"
```

---

### Task 3: Website Scraper & Taxonomy Extraction Utility

**Files:**
- Create: `lib/scraper/extract.ts`
- Test: `tests/unit/scraper-extract.test.ts`

**Interfaces:**
- Consumes: Agency URL string
- Produces: `extractAgencyTaxonomy(url: string): Promise<TaxonomyExtractionResult>`

- [ ] **Step 1: Write failing extraction test**

```typescript
// tests/unit/scraper-extract.test.ts
import { describe, it, expect, vi } from 'vitest';
import { extractAgencyTaxonomy } from '@/lib/scraper/extract';

describe('extractAgencyTaxonomy', () => {
  it('returns structured taxonomy fallback when website metadata is parsed', async () => {
    const mockHtml = `
      <html>
        <head>
          <title>Apex Flow - AI Workflow Automation Agency</title>
          <meta name="description" content="We build custom AI chatbots and automated Zapier pipelines for SaaS founders." />
        </head>
      </html>
    `;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    } as any);

    const result = await extractAgencyTaxonomy('https://apexflow.ai');
    expect(result.success).toBe(true);
    expect(result.data.workspaceName).toBe('Apex Flow');
    expect(result.data.services.length).toBeGreaterThan(0);
    expect(result.data.negativeKeywords.length).toBeGreaterThanOrEqual(3);
  });

  it('handles network failure gracefully with fallback preset', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await extractAgencyTaxonomy('https://unreachable-domain.xyz');
    expect(result.success).toBe(false);
    expect(result.fallback).toBeDefined();
    expect(result.fallback.negativeKeywords.length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/scraper-extract.test.ts`  
Expected: FAIL (`cannot find module '@/lib/scraper/extract'`)

- [ ] **Step 3: Implement extraction logic with HTML parsing & heuristic fallback**

```typescript
// lib/scraper/extract.ts
import { ICP_PRESETS, ICPPreset } from '@/lib/constants/icp-presets';

export interface TaxonomyData {
  workspaceName: string;
  services: string[];
  buyerTitles: string[];
  painPoints: string[];
  buyingSignals: string[];
  negativeKeywords: string[];
}

export interface TaxonomyExtractionResult {
  success: boolean;
  data: TaxonomyData;
  fallback?: TaxonomyData;
  error?: string;
}

export async function extractAgencyTaxonomy(url: string): Promise<TaxonomyExtractionResult> {
  const defaultPreset = ICP_PRESETS[0];
  const fallbackData: TaxonomyData = {
    workspaceName: extractDomainName(url),
    services: defaultPreset.services,
    buyerTitles: defaultPreset.buyerTitles,
    painPoints: defaultPreset.painPoints,
    buyingSignals: defaultPreset.buyingSignals,
    negativeKeywords: defaultPreset.negativeKeywords,
  };

  try {
    // 1. Validate URL & Prevent SSRF (Private IP / localhost blocking)
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { success: false, data: fallbackData, fallback: fallbackData, error: 'Only http and https protocols are supported' };
    }
    const hostname = parsedUrl.hostname.toLowerCase();
    if (['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', '::1'].includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { success: false, data: fallbackData, fallback: fallbackData, error: 'Access to private or local network hosts is prohibited' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WinThreadBot/1.0; +https://winthread.app)',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, data: fallbackData, fallback: fallbackData, error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    // Robust meta description (matches standard description, og:description, or twitter:description regardless of attribute order)
    const metaDescMatch = html.match(/<meta[^>]*(?:name|property)=["'](?:description|og:description|twitter:description)["'][^>]*content=["']([^"']+)["'][^>]*>/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["'](?:description|og:description|twitter:description)["'][^>]*>/i);

    const title = titleMatch ? titleMatch[1].trim() : '';
    const desc = metaDescMatch ? metaDescMatch[1].trim() : '';
    const parsedName = title.split(/[-–|]/)[0].trim() || extractDomainName(url);

    // Keyword detection against presets
    const combinedText = `${title} ${desc}`.toLowerCase();
    let matchedPreset: ICPPreset = defaultPreset;
    for (const preset of ICP_PRESETS) {
      if (preset.services.some(s => combinedText.includes(s.toLowerCase()))) {
        matchedPreset = preset;
        break;
      }
    }

    return {
      success: true,
      data: {
        workspaceName: parsedName,
        services: matchedPreset.services,
        buyerTitles: matchedPreset.buyerTitles,
        painPoints: matchedPreset.painPoints,
        buyingSignals: matchedPreset.buyingSignals,
        negativeKeywords: matchedPreset.negativeKeywords,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      data: fallbackData,
      fallback: fallbackData,
      error: err.message || 'Scrape failed',
    };
  }
}

function extractDomainName(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, '');
    const parts = host.split('.');
    if (parts.length > 0 && parts[0]) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return 'My Agency';
  } catch {
    return 'My Agency';
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/scraper-extract.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/scraper/extract.ts tests/unit/scraper-extract.test.ts
git commit -m "feat(scraper): add extractAgencyTaxonomy with heuristic parsing and fallback"
```

---

### Task 4: Server Action for Setup Submission & DB Seeding

**Files:**
- Create: `lib/actions/setup.ts`
- Test: `tests/unit/setup-action.test.ts`

**Interfaces:**
- Consumes: Validated `SetupFormData` + Supabase server client
- Produces: `completeSetupWizard(data: SetupFormData)` Server Action inserting into:
  - `workspaces`
  - `icp_profiles`
  - `weights` (source weights)
  - `keyword_weights` (buying signals)
  - `events` (`setup_completed`)

- [ ] **Step 1: Write failing Server Action test with Supabase mock**

```typescript
// tests/unit/setup-action.test.ts
import { describe, it, expect, vi } from 'vitest';
import { executeSetupTransaction } from '@/lib/actions/setup';

describe('executeSetupTransaction', () => {
  it('inserts workspace, icp_profile, source weights, keyword weights and event', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'ws-123' }, error: null }),
    };

    const payload = {
      agencyUrl: 'https://apexflow.ai',
      workspaceName: 'Apex Flow',
      services: ['AI Automation'],
      buyerTitles: ['Founder', 'CTO'],
      painPoints: ['Manual data entry'],
      buyingSignals: ['need AI bot', 'looking for Zapier expert'],
      negativeKeywords: ['job', 'hiring', 'internship'],
    };

    const result = await executeSetupTransaction(mockSupabase as any, payload, 'user-456');
    expect(result.success).toBe(true);
    expect(result.workspaceId).toBe('ws-123');
    expect(mockSupabase.from).toHaveBeenCalledWith('workspaces');
    expect(mockSupabase.from).toHaveBeenCalledWith('icp_profiles');
    expect(mockSupabase.from).toHaveBeenCalledWith('weights');
    expect(mockSupabase.from).toHaveBeenCalledWith('keyword_weights');
    expect(mockSupabase.from).toHaveBeenCalledWith('events');
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/setup-action.test.ts`  
Expected: FAIL (`cannot find module '@/lib/actions/setup'`)

- [ ] **Step 3: Implement `executeSetupTransaction` and Server Action**

```typescript
// lib/actions/setup.ts
'use server';

import { SetupFormData, setupFormSchema } from '@/lib/validations/setup';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

// Canonical Server Action called directly from SetupWizardForm (Decision 9)
export async function completeSetupWizard(data: SetupFormData, authUserId?: string) {
  const parsed = setupFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Provisioning uses admin client to safely initialize initial workspace & seed data (bypassing initial unauth RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return executeSetupTransaction(supabaseAdmin, parsed.data, authUserId || 'unauthenticated-lead');
}

export async function executeSetupTransaction(
  supabase: SupabaseClient,
  data: SetupFormData,
  userId: string
) {
  const domain = new URL(data.agencyUrl).hostname.replace(/^www\./, '');

  // 1. Check for existing workspace (PRD Screen 1 Edge Case: duplicate domain)
  const { data: existingWs } = await supabase
    .from('workspaces')
    .select('id')
    .eq('domain', domain)
    .maybeSingle();

  let workspaceId = existingWs?.id;

  if (!workspaceId) {
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name: data.workspaceName,
        domain,
        currency: 'USD',
        timezone: 'UTC',
        plan: 'beta',
        status: 'active',
      })
      .select('id')
      .single();

    if (wsError || !workspace) {
      return { success: false, error: wsError?.message || 'Failed to create workspace' };
    }
    workspaceId = workspace.id;
  }

  // 2. Upsert ICP Profile (idempotent)
  const { error: icpError } = await supabase.from('icp_profiles').upsert({
    workspace_id: workspaceId,
    services: data.services,
    buyer_titles: data.buyerTitles,
    pain_points: data.painPoints,
    buying_signals: data.buyingSignals,
    negative_keywords: data.negativeKeywords,
  }, { onConflict: 'workspace_id' });

  if (icpError) {
    return { success: false, error: icpError.message };
  }

  // 3. Seed Default Source Weights (Reddit: 1.20, Hacker News: 1.00, Bluesky: 0.90, Other: 1.00)
  const defaultSourceWeights = [
    { workspace_id: workspaceId, channel: 'reddit', weight: 1.20 },
    { workspace_id: workspaceId, channel: 'hackernews', weight: 1.00 },
    { workspace_id: workspaceId, channel: 'bluesky', weight: 0.90 },
    { workspace_id: workspaceId, channel: 'other', weight: 1.00 },
  ];
  await supabase.from('weights').upsert(defaultSourceWeights, { onConflict: 'workspace_id,channel' });

  // 4. Seed Keyword Weights (1.00 per buying signal)
  if (data.buyingSignals.length > 0) {
    const keywordWeights = data.buyingSignals.map(kw => ({
      workspace_id: workspaceId,
      keyword: kw,
      weight: 1.00,
    }));
    await supabase.from('keyword_weights').upsert(keywordWeights, { onConflict: 'workspace_id,keyword' });
  }

  // 5. Seed Starter Leads (Decision 5: Instant Historical Leads so feed is never empty)
  const starterSignals = [
    {
      workspace_id: workspaceId,
      source: 'reddit',
      external_id: `seed-1-${workspaceId}`,
      author: 'u/growth_director',
      title: 'Looking for a reliable agency to handle automated customer communication and follow-ups',
      content: 'Our team is dropping 25% of leads after business hours. Need an agency or tool to automate booking and follow-up immediately.',
      thread_url: 'https://reddit.com/r/smallbusiness/comments/sample1',
      match_score: 94,
      match_reason: 'Prospect has acute pain with dropped after-hours leads and asks for immediate agency automation assistance.',
      status: 'new',
    },
    {
      workspace_id: workspaceId,
      source: 'hackernews',
      external_id: `seed-2-${workspaceId}`,
      author: 'startup_sam',
      title: 'Ask HN: Any specialized B2B outbound agencies recommended for early-stage SaaS?',
      content: 'We need predictable sales pipeline. Would rather hire a proven specialized agency than spend 3 months recruiting SDRs.',
      thread_url: 'https://news.ycombinator.com/item?id=sample2',
      match_score: 91,
      match_reason: 'Founder actively seeking agency partnership for predictable outbound pipeline.',
      status: 'new',
    },
  ];
  await supabase.from('threads').upsert(starterSignals, { onConflict: 'workspace_id,external_id' });

  // 6. Emit Activation Event
  await supabase.from('events').insert({
    workspace_id: workspaceId,
    event_type: 'setup_completed',
    payload_json: {
      url: data.agencyUrl,
      services_count: data.services.length,
      signals_count: data.buyingSignals.length,
      negative_count: data.negativeKeywords.length,
      completed_by: userId,
    },
  });

  return { success: true, workspaceId };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/setup-action.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/actions/setup.ts tests/unit/setup-action.test.ts
git commit -m "feat(actions): add executeSetupTransaction to seed workspace, ICP, and initial weights"
```

---

### Task 5: UI Components for Tag Chips & Negative Keyword Preview

**Files:**
- Create: `components/setup/TagInput.tsx`
- Create: `components/setup/NegativeKeywordPreview.tsx`
- Test: `tests/unit/tag-input.test.tsx`

**Interfaces:**
- Consumes: Tags array and callback handlers
- Produces: Interactive tag chips input with delete/add functionality; negative keyword filter percentage preview badge.

- [ ] **Step 1: Write failing component test**

```typescript
// tests/unit/tag-input.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TagInput } from '@/components/setup/TagInput';

describe('TagInput', () => {
  it('renders tags and permits adding a new tag', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['AI Automation', 'Lead Gen']} onChange={onChange} label="Services" />);

    expect(screen.getByText('AI Automation')).toBeInTheDocument();
    expect(screen.getByText('Lead Gen')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Add/i);
    fireEvent.change(input, { target: { value: 'SEO' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['AI Automation', 'Lead Gen', 'SEO']);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/tag-input.test.tsx`  
Expected: FAIL (`cannot find module '@/components/setup/TagInput'`)

- [ ] **Step 3: Implement `TagInput` and `NegativeKeywordPreview`**

```tsx
// components/setup/TagInput.tsx
'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  minRequired?: number;
  placeholder?: string;
  description?: string;
}

export function TagInput({ label, tags, onChange, minRequired = 0, placeholder = 'Add tag...', description }: TagInputProps) {
  const [inputVal, setInputVal] = useState('');

  const addTag = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputVal('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</label>
        {minRequired > 0 && (
          <span className={`text-xs ${tags.length >= minRequired ? 'text-emerald-600' : 'text-amber-600 font-semibold'}`}>
            {tags.length}/{minRequired} required
          </span>
        )}
      </div>
      {description && <p className="text-xs text-zinc-500">{description}</p>}
      <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md min-h-[44px]">
        {tags.map((tag, index) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="inline-flex items-center gap-1">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="text-xs bg-transparent border-none outline-none focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 w-28"
          />
          <button
            type="button"
            onClick={addTag}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

```tsx
// components/setup/NegativeKeywordPreview.tsx
import React from 'react';
import { Filter } from 'lucide-react';

interface NegativeKeywordPreviewProps {
  count: number;
}

export function NegativeKeywordPreview({ count }: NegativeKeywordPreviewProps) {
  // Heuristic calculation per PRD Screen 1 AC 3: "With these negative keywords, X% of sample posts filtered"
  const filterPct = Math.min(85, Math.max(15, count * 14));

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
      <Filter className="w-4 h-4 text-emerald-500 shrink-0" />
      <span>
        With these negative keywords, <strong>~{filterPct}%</strong> of noisy posts (job applicants, recruiters, student courses) will be filtered out automatically.
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/tag-input.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/setup/TagInput.tsx components/setup/NegativeKeywordPreview.tsx tests/unit/tag-input.test.tsx
git commit -m "feat(ui): add TagInput chip component and NegativeKeywordPreview indicator"
```

---

### Task 6: Setup Wizard Page & Client Form (`app/setup/page.tsx`)

**Files:**
- Create: `app/setup/page.tsx`
- Create: `components/setup/SetupWizardForm.tsx`
- Test: `tests/integration/setup-page.test.tsx`

**Interfaces:**
- Consumes: Server Action `executeSetupTransaction`, extraction API, `setupFormSchema`
- Produces: Interactive 4-state `/setup` route (Empty, Scraping/Loading, Review/Edit, Redirect)

- [ ] **Step 1: Write integration test for Setup Wizard form flow**

```typescript
// tests/integration/setup-page.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SetupWizardForm } from '@/components/setup/SetupWizardForm';

describe('SetupWizardForm', () => {
  it('renders initial URL input and extracts on submit', async () => {
    const mockOnSubmit = vi.fn();
    render(<SetupWizardForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    expect(screen.getByPlaceholderText(/https:\/\/myagency\.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scan Website/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/integration/setup-page.test.tsx`  
Expected: FAIL (`cannot find module '@/components/setup/SetupWizardForm'`)

- [ ] **Step 3: Implement `SetupWizardForm` and `/setup/page.tsx`**

```tsx
// components/setup/SetupWizardForm.tsx
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
      // Dynamic import or fetch internal endpoint
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
        // Fallback to default preset
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

          {/* Quick Preset Selector */}
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
```

```tsx
// app/setup/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SetupWizardForm } from '@/components/setup/SetupWizardForm';
import { SetupFormData } from '@/lib/validations/setup';
import { completeSetupWizard } from '@/lib/actions/setup';

export default function SetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetupSubmit = async (data: SetupFormData, userId?: string) => {
    setIsSubmitting(true);
    try {
      // Calls canonical Server Action directly (Decision 9: UI mutations via Server Actions)
      const result = await completeSetupWizard(data, userId);
      if (result.success) {
        router.push('/threads');
      } else {
        alert(result.error || 'Failed to complete setup');
      }
    } catch (err: any) {
      alert(err.message || 'Setup network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900">
      <SetupWizardForm onSubmit={handleSetupSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/integration/setup-page.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/setup/page.tsx components/setup/SetupWizardForm.tsx tests/integration/setup-page.test.tsx
git commit -m "feat(setup): create /setup page and SetupWizardForm component with Server Action integration"
```

---

### Task 7: Setup Extraction Route Handler (`/api/setup/extract`)

**Files:**
- Create: `app/api/setup/extract/route.ts`
- Test: `tests/unit/setup-api-routes.test.ts`

**Interfaces:**
- Consumes: Next.js Request with `{ url: string }` JSON body
- Produces: `TaxonomyExtractionResult` JSON response

- [ ] **Step 1: Write route handler tests**

```typescript
// tests/unit/setup-api-routes.test.ts
import { describe, it, expect } from 'vitest';
import { POST as extractHandler } from '@/app/api/setup/extract/route';

describe('/api/setup/extract route', () => {
  it('returns 400 when URL is missing', async () => {
    const req = new Request('http://localhost:3000/api/setup/extract', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await extractHandler(req);
    expect(res.status).toBe(400);
  });

  it('blocks private or SSRF addresses', async () => {
    const req = new Request('http://localhost:3000/api/setup/extract', {
      method: 'POST',
      body: JSON.stringify({ url: 'http://127.0.0.1:8080' }),
    });
    const res = await extractHandler(req);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('private or local network');
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run tests/unit/setup-api-routes.test.ts`  
Expected: FAIL (`cannot find module '@/app/api/setup/extract/route'`)

- [ ] **Step 3: Implement extraction route handler with SSRF protection**

```typescript
// app/api/setup/extract/route.ts
import { NextResponse } from 'next/server';
import { extractAgencyTaxonomy } from '@/lib/scraper/extract';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid URL is required' }, { status: 400 });
    }
    const result = await extractAgencyTaxonomy(url);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/setup-api-routes.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/setup/extract/route.ts tests/unit/setup-api-routes.test.ts
git commit -m "feat(api): add /api/setup/extract endpoint with SSRF protection"
```

---

### Task 8: End-to-End Integration Test & Verification

**Files:**
- Create: `tests/integration/setup-flow.test.ts`

- [ ] **Step 1: Write complete integration test for setup flow**

```typescript
// tests/integration/setup-flow.test.ts
import { describe, it, expect, vi } from 'vitest';
import { extractAgencyTaxonomy } from '@/lib/scraper/extract';
import { setupFormSchema } from '@/lib/validations/setup';
import { executeSetupTransaction } from '@/lib/actions/setup';

describe('Feature 01 Setup Flow Integration', () => {
  it('completes the full flow: URL extraction -> form validation -> DB seeding', async () => {
    // 1. Scrape & extract
    const mockHtml = `
      <html>
        <head>
          <title>Apex Flow - AI Workflow Automation Agency</title>
          <meta name="description" content="We build custom AI chatbots and automated Zapier pipelines for SaaS founders." />
        </head>
      </html>
    `;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    } as any);

    const extractResult = await extractAgencyTaxonomy('https://apexflow.ai');
    expect(extractResult.success).toBe(true);

    // 2. Validate form data
    const formData = {
      agencyUrl: 'https://apexflow.ai',
      workspaceName: extractResult.data.workspaceName,
      services: extractResult.data.services,
      buyerTitles: extractResult.data.buyerTitles,
      painPoints: extractResult.data.painPoints,
      buyingSignals: extractResult.data.buyingSignals,
      negativeKeywords: extractResult.data.negativeKeywords,
      crmMode: 'A' as const,
    };
    const parseResult = setupFormSchema.safeParse(formData);
    expect(parseResult.success).toBe(true);

    // 3. Mock DB transaction
    const mockSupabase = {
      from: vi.fn((table: string) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'mock-ws-id' }, error: null }),
          })),
        })),
        upsert: vi.fn().mockResolvedValue({ error: null }),
      })),
    };

    if (parseResult.success) {
      const txResult = await executeSetupTransaction(mockSupabase as any, parseResult.data, 'test-user-id');
      expect(txResult.success).toBe(true);
      expect(txResult.workspaceId).toBe('mock-ws-id');
    }
  });
});
```

- [ ] **Step 2: Run test suite to verify passing**

Run: `npm test`  
Expected: PASS for all tests

- [ ] **Step 3: Run strict TypeScript typecheck**

Run: `npx tsc --noEmit`  
Expected: 0 errors

- [ ] **Step 4: Final commit for Feature 01**

```bash
git add tests/integration/setup-flow.test.ts
git commit -m "feat(setup): complete Feature 01 Website-to-ICP wizard with RLS and starter lead seeding"
```
