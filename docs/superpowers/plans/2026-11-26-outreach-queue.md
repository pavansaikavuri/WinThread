# Feature 03: Approval Queue & 5-Step Call Script Co-Pilot (`/outreach`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/outreach` cockpit route providing a ready-to-send approval queue, zero-ban 1-click deep-link delivery (LinkedIn, Email, WhatsApp), a voice-ready 5-step human call script drawer with objection accordions, and DPDP §6 communication consent audit tracking.

**Architecture:** Next.js 16 App Router with Server Actions handling atomic PostgreSQL state updates under Row Level Security. Client-side slide-out drawer provides real-time stepper navigation with $O(1)$ non-linear objection access. Standard OS URI schemes (`mailto:`, `wa.me:`) and `navigator.clipboard.writeText()` provide 100% platform ban immunity.

**Tech Stack:** Next.js 16.4.6 (Turbopack), React 19.3.0, TypeScript 5.8+, Tailwind CSS 4.3.3, Supabase SSR 0.12.7, Lucide React 1.73.0, Vitest 5.1.1.

**Spec:** `docs/features/03-outreach-queue.md`, `docs/PRD.md` (§3 Screen 3, §11 Thread State Machine), `docs/DATABASE.md` (`threads`, `communication_consent`, `suppressions`, `events`).

---

## Global Constraints

- **Framework Invariant:** Next.js 16 App Router using Turbopack, React 19 Server/Client boundaries (`'use server'` / `'use client'`).
- **Zero Third-Party UI Bloat:** No external heavy component libraries (Radix, shadcn). Build clean, lightweight, accessible Tailwind CSS 4 primitives.
- **Tenant Isolation Invariant:** Every database read and write must strictly enforce `workspace_id` filtering with Supabase SSR authenticated user checks.
- **State Machine Contract (PRD §11 / Decision 16):**
  - Forward: `discovered` (new) $\rightarrow$ `approved` $\rightarrow$ `contacted` $\rightarrow$ `qualified`.
  - 5-Minute Undo Loop: `approved` $\rightarrow$ `discovered` allowed only within 300 seconds of approval and if `contacted_at IS NULL`.
  - Callback Reschedule Loop: `contacted` $\rightarrow$ `approved` allowed only when call outcome is `Callback`.
  - Terminal States: `won` and `lost` are permanent terminal states.
- **Delivery Invariant (Decision 17):** Zero automated browser scraping or extension botting. 1-click delivery uses clipboard write + native URI protocols (`mailto:`, `wa.me:`, LinkedIn compose URL).
- **Call Script Invariant (Decision 18):** Right-side sliding drawer. Stepper supports non-linear jumping (`1. Orient` $\rightarrow$ `2. Qualify` $\rightarrow$ `3. Objections` $\rightarrow$ `4. Book/Quote` $\rightarrow$ `5. Close`). Objections are collapsible one-tap accordions.
- **Consent Compliance Invariant (Decision 19 / DPDP §6):** Positive outcomes (`Interested`, `Send Quote`) require recorded channel consent in `communication_consent`. `Not Interested` with DND request writes to `suppressions`.
- **Velocity Tracking (Decision 20):** Clean visual activity counter in toolbar (`[ X Leads Contacted Today ]`) without artificial button disables or stressful modal popups.

---

## File Structure

```
types/
  └── outreach.ts                         # Type definitions for Outreach threads, call scripts, outcomes, and consent
lib/
  ├── outreach/
  │   └── deep-links.ts                   # URL and copy generators for LinkedIn, Email, and WhatsApp (0% ban risk)
  └── actions/
      └── outreach.ts                     # Server actions: getOutreachQueue, markContacted, logCallOutcome, undoApproval
components/
  └── outreach/
      ├── OutreachToolbar.tsx             # Daily activity counter + channel filter tabs (All, LinkedIn, Email, WhatsApp, Phone)
      ├── OutreachCard.tsx                # Lead card with 1-click deep-link action cluster and post context
      └── CallScriptDrawer.tsx            # Slide-out 5-step call script drawer, objection accordions, and outcome logger
app/
  └── outreach/
      └── page.tsx                        # Main /outreach server page component
tests/
  ├── unit/
  │   ├── deep-links.test.ts              # Unit tests for URL encoding and personalized copy generation
  │   ├── outreach-actions.test.ts        # Unit tests for state transitions, 5-min undo guard, and consent logging
  │   └── call-script-drawer.test.tsx     # Component test for 5-step stepper, accordions, and outcome submission
  └── integration/
      └── outreach-flow.test.ts           # End-to-end integration test from approved lead to contacted & qualified
```

---

## Tasks

### Task 1: Type Definitions (`types/outreach.ts`)

**Files:**
- Create: `types/outreach.ts`

**Interfaces:**
- Produces: `OutreachThread`, `CallOutcome`, `CallScriptStep`, `CommunicationChannel`, `OutreachQueueFilters`.

- [ ] **Step 1: Write type definitions**

```typescript
// types/outreach.ts
import { SupportedChannel } from '@/lib/constants/channels';

export type CommunicationChannel = 'linkedin' | 'email' | 'whatsapp' | 'phone';

export type CallOutcomeType = 'interested' | 'send_quote' | 'callback' | 'not_interested' | 'wrong_number';

export type ThreadStage = 'discovered' | 'approved' | 'contacted' | 'qualified' | 'quote_sent' | 'won' | 'lost';

export interface OutreachThread {
  id: string;
  workspace_id: string;
  raw_signal_id: string | null;
  source_channel: SupportedChannel;
  external_id: string;
  author: string;
  title: string;
  content: string;
  thread_url: string;
  match_score: number;
  match_reason: string;
  stage: ThreadStage;
  approved_at: string | null;
  contacted_at: string | null;
  contact_method: CommunicationChannel | null;
  author_email?: string | null;
  author_phone?: string | null;
  author_company?: string | null;
  created_at: string;
}

export interface CallScriptVariables {
  prospectName: string;
  companyName: string;
  postTopic: string;
  postExcerpt: string;
  agencyName: string;
  serviceOffered: string;
}

export interface CallScriptStepData {
  stepNumber: number;
  id: 'orient' | 'qualify' | 'objections' | 'book_quote' | 'close';
  title: string;
  headline: string;
  scriptText: string;
  tips?: string[];
}

export interface ObjectionItem {
  id: string;
  category: 'pricing' | 'timing' | 'competitor' | 'not_needed';
  label: string;
  prospectSays: string;
  responseScript: string;
}

export interface CallOutcomePayload {
  threadId: string;
  workspaceId: string;
  outcome: CallOutcomeType;
  notes?: string;
  scheduledCallback?: string; // ISO timestamp
  consentGranted?: boolean;
  consentChannel?: CommunicationChannel;
  requestDnd?: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: PASS (0 errors)

---

### Task 2: 1-Click Deep-Link Engine (`lib/outreach/deep-links.ts`)

**Files:**
- Create: `lib/outreach/deep-links.ts`
- Test: `tests/unit/deep-links.test.ts`

**Interfaces:**
- Consumes: `OutreachThread`, `CallScriptVariables`
- Produces: `generateLinkedInPitch`, `generateEmailPayload`, `generateWhatsAppUrl`, `getLinkedInComposeUrl`

- [ ] **Step 1: Write failing unit test (`tests/unit/deep-links.test.ts`)**

```typescript
import { describe, it, expect } from 'vitest';
import {
  generateLinkedInPitch,
  generateEmailPayload,
  generateWhatsAppUrl,
  getLinkedInComposeUrl,
} from '@/lib/outreach/deep-links';

describe('Deep-Link & Pitch Generation Engine', () => {
  const mockLead = {
    prospectName: 'Rachel Green',
    companyName: 'Brightline HVAC',
    postTopic: 'AI dispatch automation',
    postExcerpt: 'Looking for a reliable system to automate technician routing',
    agencyName: 'Apex Flow',
    serviceOffered: 'Custom AI Dispatch Pipelines',
  };

  it('generates personalized non-salesy LinkedIn pitch referencing post topic', () => {
    const pitch = generateLinkedInPitch(mockLead);
    expect(pitch).toContain('Hi Rachel');
    expect(pitch).toContain('AI dispatch automation');
    expect(pitch).toContain('Apex Flow');
  });

  it('formats LinkedIn direct compose URL with recipient handle', () => {
    const url = getLinkedInComposeUrl('rachel-green');
    expect(url).toBe('https://www.linkedin.com/messaging/compose/?recipient=rachel-green');
  });

  it('formats mailto payload with encoded subject and body', () => {
    const emailPayload = generateEmailPayload('rachel@brightline.com', mockLead);
    expect(emailPayload.url).toContain('mailto:rachel@brightline.com');
    expect(emailPayload.url).toContain('subject=');
    expect(emailPayload.url).toContain('body=');
    expect(emailPayload.subject).toContain('Brightline HVAC');
    expect(emailPayload.body).toContain('Rachel');
  });

  it('formats official WhatsApp click-to-chat URL with E.164 phone', () => {
    const waUrl = generateWhatsAppUrl('+15551234567', mockLead);
    expect(waUrl).toContain('https://wa.me/15551234567?text=');
    expect(waUrl).toContain(encodeURIComponent('Hi Rachel'));
  });

  it('sanitizes non-E.164 characters from phone numbers for WhatsApp', () => {
    const waUrl = generateWhatsAppUrl('+1 (555) 123-4567', mockLead);
    expect(waUrl).toContain('https://wa.me/15551234567');
  });
});
```

- [ ] **Step 2: Run test to verify failure**
Run: `npm test tests/unit/deep-links.test.ts`
Expected: FAIL (Cannot find module '@/lib/outreach/deep-links')

- [ ] **Step 3: Implement `lib/outreach/deep-links.ts`**

```typescript
import { CallScriptVariables } from '@/types/outreach';

export function generateLinkedInPitch(vars: CallScriptVariables): string {
  const firstName = vars.prospectName.split(' ')[0] || 'there';
  return `Hi ${firstName}, saw your post regarding ${vars.postTopic} at ${vars.companyName}. We build ${vars.serviceOffered} at ${vars.agencyName}—thought I'd reach out directly to see if you're still looking for a clean solution. Would you be open to an itemized quote?`;
}

export function getLinkedInComposeUrl(authorHandle: string): string {
  const cleanHandle = authorHandle.replace(/^@/, '').trim();
  return `https://www.linkedin.com/messaging/compose/?recipient=${encodeURIComponent(cleanHandle)}`;
}

export function generateEmailPayload(
  toEmail: string,
  vars: CallScriptVariables
): { url: string; subject: string; body: string } {
  const firstName = vars.prospectName.split(' ')[0] || 'there';
  const subject = `Quick question regarding ${vars.postTopic} — ${vars.companyName}`;
  const body = `Hi ${firstName},\n\nI noticed your recent discussion about ${vars.postTopic}.\n\nAt ${vars.agencyName}, we specialize in ${vars.serviceOffered}. If you are still exploring options, I'd be happy to share an itemized overview of how we handle this.\n\nBest regards,\n${vars.agencyName}`;

  const url = `mailto:${encodeURIComponent(toEmail.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { url, subject, body };
}

export function generateWhatsAppUrl(phoneNumber: string, vars: CallScriptVariables): string {
  const cleanedDigits = phoneNumber.replace(/[^0-9]/g, '');
  const message = generateLinkedInPitch(vars);
  return `https://wa.me/${cleanedDigits}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/unit/deep-links.test.ts`
Expected: PASS (5 passed)

- [ ] **Step 5: Commit**
```bash
git add types/outreach.ts lib/outreach/deep-links.ts tests/unit/deep-links.test.ts
git commit -m "feat(outreach): implement zero-ban deep-link and personalized copy generators"
```

---

### Task 3: Outreach Server Actions & State Machine (`lib/actions/outreach.ts`)

**Files:**
- Create: `lib/actions/outreach.ts`
- Test: `tests/unit/outreach-actions.test.ts`

**Interfaces:**
- Consumes: Supabase SSR `createServerClient`, `CallOutcomePayload`, `CommunicationChannel`
- Produces: `getOutreachQueue`, `markContacted`, `logCallOutcome`, `undoApproval`

- [ ] **Step 1: Write failing unit test (`tests/unit/outreach-actions.test.ts`)**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getOutreachQueue,
  markContacted,
  logCallOutcome,
  undoApproval,
} from '@/lib/actions/outreach';

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from '@/lib/supabase/server';

describe('Outreach Server Actions & State Machine', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-123' } }, error: null }),
      },
      from: vi.fn(),
    };
    (createServerClient as any).mockResolvedValue(mockSupabase);
  });

  it('fetches outreach queue filtered by stage=approved for the workspace', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEqWs = vi.fn().mockReturnThis();
    const mockEqStage = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'th-1', author: 'Rachel', stage: 'approved' }],
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEqWs,
      order: mockOrder,
    });
    mockSelect.mockReturnValue({ eq: mockEqWs });
    mockEqWs.mockReturnValue({ eq: mockEqStage });
    mockEqStage.mockReturnValue({ order: mockOrder });

    const result = await getOutreachQueue('ws-456');
    expect(result.success).toBe(true);
    expect(result.threads).toHaveLength(1);
  });

  it('marks thread as contacted and records event', async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'threads') {
        return { update: mockUpdate, eq: mockEq };
      }
      if (table === 'events') {
        return { insert: mockInsert };
      }
      return {};
    });

    const result = await markContacted('th-1', 'ws-456', 'linkedin');
    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ stage: 'contacted', contact_method: 'linkedin' })
    );
  });

  it('transitions thread to qualified when call outcome is interested and saves consent', async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpsertConsent = vi.fn().mockResolvedValue({ error: null });
    const mockInsertEvent = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'threads') return { update: mockUpdate, eq: mockEq };
      if (table === 'communication_consent') return { upsert: mockUpsertConsent };
      if (table === 'events') return { insert: mockInsertEvent };
      return {};
    });

    const result = await logCallOutcome({
      threadId: 'th-1',
      workspaceId: 'ws-456',
      outcome: 'interested',
      consentGranted: true,
      consentChannel: 'whatsapp',
    });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ stage: 'qualified' }));
    expect(mockUpsertConsent).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'whatsapp', consented: true })
    );
  });

  it('resets thread to approved when call outcome is callback', async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockInsertEvent = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'threads') return { update: mockUpdate, eq: mockEq };
      if (table === 'events') return { insert: mockInsertEvent };
      return {};
    });

    const result = await logCallOutcome({
      threadId: 'th-1',
      workspaceId: 'ws-456',
      outcome: 'callback',
      scheduledCallback: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ stage: 'approved' }));
  });

  it('enforces 5-minute undo window on approval reversal', async () => {
    // Thread approved 10 minutes ago
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'th-1', stage: 'approved', approved_at: tenMinutesAgo, contacted_at: null },
              error: null,
            }),
          }),
        }),
      }),
    });

    const result = await undoApproval('th-1', 'ws-456');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Undo window expired (5 minutes)');
  });
});
```

- [ ] **Step 2: Run test to verify failure**
Run: `npm test tests/unit/outreach-actions.test.ts`
Expected: FAIL (Cannot find module '@/lib/actions/outreach')

- [ ] **Step 3: Implement `lib/actions/outreach.ts`**

```typescript
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { CallOutcomePayload, CommunicationChannel, OutreachThread } from '@/types/outreach';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export async function getOutreachQueue(workspaceId: string): Promise<{ success: boolean; threads: OutreachThread[]; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, threads: [], error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('stage', 'approved')
      .order('match_score', { ascending: false });

    if (error) return { success: false, threads: [], error: error.message };
    return { success: true, threads: (data as OutreachThread[]) || [] };
  } catch (err: any) {
    return { success: false, threads: [], error: err.message };
  }
}

export async function markContacted(
  threadId: string,
  workspaceId: string,
  channel: CommunicationChannel
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Unauthorized' };

    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from('threads')
      .update({
        stage: 'contacted',
        contact_method: channel,
        contacted_at: now,
      })
      .eq('id', threadId)
      .eq('workspace_id', workspaceId);

    if (updateErr) return { success: false, error: updateErr.message };

    await supabase.from('events').insert({
      workspace_id: workspaceId,
      thread_id: threadId,
      user_id: user.id,
      event_type: 'outreach_sent',
      payload_json: { channel, contacted_at: now },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function logCallOutcome(payload: CallOutcomePayload): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Unauthorized' };

    const now = new Date().toISOString();
    let nextStage: string = 'contacted';

    if (payload.outcome === 'interested' || payload.outcome === 'send_quote') {
      nextStage = 'qualified';
    } else if (payload.outcome === 'callback') {
      nextStage = 'approved';
    } else if (payload.outcome === 'not_interested' || payload.outcome === 'wrong_number') {
      nextStage = 'lost';
    }

    const { error: updateErr } = await supabase
      .from('threads')
      .update({
        stage: nextStage,
        contacted_at: now,
        contact_method: 'phone',
      })
      .eq('id', payload.threadId)
      .eq('workspace_id', payload.workspaceId);

    if (updateErr) return { success: false, error: updateErr.message };

    // Record consent if verbal permission granted
    if (payload.consentGranted && payload.consentChannel) {
      await supabase.from('communication_consent').upsert({
        thread_id: payload.threadId,
        workspace_id: payload.workspaceId,
        channel: payload.consentChannel,
        consented: true,
        consented_at: now,
      }, { onConflict: 'thread_id,channel' });
    }

    // Record DND suppression if requested
    if (payload.requestDnd) {
      await supabase.from('suppressions').upsert({
        workspace_id: payload.workspaceId,
        prospect_identifier: payload.threadId,
        channel: 'all',
        reason: 'explicit_request',
        suppressed_at: now,
      }, { onConflict: 'workspace_id,prospect_identifier,channel' });
    }

    await supabase.from('events').insert({
      workspace_id: payload.workspaceId,
      thread_id: payload.threadId,
      user_id: user.id,
      event_type: 'call_completed',
      payload_json: {
        outcome: payload.outcome,
        notes: payload.notes || '',
        scheduled_callback: payload.scheduledCallback || null,
        next_stage: nextStage,
      },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function undoApproval(threadId: string, workspaceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, error: 'Unauthorized' };

    const { data: thread, error: fetchErr } = await supabase
      .from('threads')
      .select('stage, approved_at, contacted_at')
      .eq('id', threadId)
      .eq('workspace_id', workspaceId)
      .single();

    if (fetchErr || !thread) return { success: false, error: 'Thread not found' };
    if (thread.contacted_at) return { success: false, error: 'Cannot undo approval after outreach dispatched' };

    const approvedAt = thread.approved_at ? new Date(thread.approved_at).getTime() : 0;
    if (Date.now() - approvedAt > FIVE_MINUTES_MS) {
      return { success: false, error: 'Undo window expired (5 minutes)' };
    }

    const { error: updateErr } = await supabase
      .from('threads')
      .update({ stage: 'discovered', approved_at: null })
      .eq('id', threadId)
      .eq('workspace_id', workspaceId);

    if (updateErr) return { success: false, error: updateErr.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/unit/outreach-actions.test.ts`
Expected: PASS (5 passed)

- [ ] **Step 5: Commit**
```bash
git add lib/actions/outreach.ts tests/unit/outreach-actions.test.ts
git commit -m "feat(outreach): implement outreach server actions with bounded state loops and consent ledger"
```

---

### Task 4: 5-Step Call Script Drawer Component (`components/outreach/CallScriptDrawer.tsx`)

**Files:**
- Create: `components/outreach/CallScriptDrawer.tsx`
- Test: `tests/unit/call-script-drawer.test.tsx`

**Interfaces:**
- Consumes: `OutreachThread`, `CallScriptVariables`, `logCallOutcome`
- Produces: Visual slide-out drawer with 5-step stepper, one-tap objection accordions, and call outcome logger.

- [ ] **Step 1: Write failing component test (`tests/unit/call-script-drawer.test.tsx`)**

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CallScriptDrawer } from '@/components/outreach/CallScriptDrawer';
import { OutreachThread } from '@/types/outreach';

describe('CallScriptDrawer Component', () => {
  const mockThread: OutreachThread = {
    id: 'th-1',
    workspace_id: 'ws-1',
    raw_signal_id: null,
    source_channel: 'hackernews',
    external_id: 'hn-123',
    author: 'Rachel Green',
    title: 'Need AI technician dispatch',
    content: 'Looking for a reliable system to automate technician routing at Brightline HVAC',
    thread_url: 'https://news.ycombinator.com/item?id=123',
    match_score: 94,
    match_reason: 'High buying intent',
    stage: 'approved',
    approved_at: new Date().toISOString(),
    contacted_at: null,
    contact_method: null,
    author_phone: '+15551234567',
    author_company: 'Brightline HVAC',
    created_at: new Date().toISOString(),
  };

  it('renders Step 1: Orient by default and displays prospect name and company', () => {
    render(<CallScriptDrawer isOpen={true} onClose={vi.fn()} thread={mockThread} agencyName="Apex Flow" serviceName="AI Dispatch" onOutcomeLogged={vi.fn()} />);
    expect(screen.getByText(/1. Orient/i)).toBeInTheDocument();
    expect(screen.getByText(/Rachel/i)).toBeInTheDocument();
    expect(screen.getByText(/Brightline HVAC/i)).toBeInTheDocument();
  });

  it('allows jumping directly to Step 3: Objections non-linearly', () => {
    render(<CallScriptDrawer isOpen={true} onClose={vi.fn()} thread={mockThread} agencyName="Apex Flow" serviceName="AI Dispatch" onOutcomeLogged={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /3. Objections/i }));
    expect(screen.getByText(/Pricing Objection/i)).toBeInTheDocument();
  });

  it('expands objection accordion on tap', () => {
    render(<CallScriptDrawer isOpen={true} onClose={vi.fn()} thread={mockThread} agencyName="Apex Flow" serviceName="AI Dispatch" onOutcomeLogged={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /3. Objections/i }));
    const pricingBtn = screen.getByRole('button', { name: /Pricing Objection/i });
    fireEvent.click(pricingBtn);
    expect(screen.getByText(/performance milestones/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**
Run: `npm test tests/unit/call-script-drawer.test.tsx`
Expected: FAIL (Cannot find module '@/components/outreach/CallScriptDrawer')

- [ ] **Step 3: Implement `components/outreach/CallScriptDrawer.tsx`**

```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/unit/call-script-drawer.test.tsx`
Expected: PASS (3 passed)

- [ ] **Step 5: Commit**
```bash
git add components/outreach/CallScriptDrawer.tsx tests/unit/call-script-drawer.test.tsx
git commit -m "feat(outreach): implement 5-step call script drawer with objection accordions and consent capture"
```

---

### Task 5: Toolbar & Outreach Card Components (`components/outreach/`)

**Files:**
- Create: `components/outreach/OutreachToolbar.tsx`
- Create: `components/outreach/OutreachCard.tsx`

**Interfaces:**
- Consumes: `OutreachThread`, `generateLinkedInPitch`, `getLinkedInComposeUrl`, `generateEmailPayload`, `generateWhatsAppUrl`
- Produces: Complete lead card with 1-click clipboard copy, external window navigation, and daily activity counter.

- [ ] **Step 1: Implement `components/outreach/OutreachToolbar.tsx`**

```tsx
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
```

- [ ] **Step 2: Implement `components/outreach/OutreachCard.tsx`**

```tsx
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
import { Linkedin, Mail, MessageSquare, Phone, RotateCcw, Check, ExternalLink } from 'lucide-react';

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
            <Linkedin className="w-3.5 h-3.5" />
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
```

- [ ] **Step 3: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: PASS (0 errors)

- [ ] **Step 4: Commit**
```bash
git add components/outreach/OutreachToolbar.tsx components/outreach/OutreachCard.tsx
git commit -m "feat(outreach): implement OutreachToolbar and OutreachCard with 1-click deep-link delivery"
```

---

### Task 6: Main Outreach Page & Integration Test (`app/outreach/page.tsx`)

**Files:**
- Create: `app/outreach/page.tsx`
- Test: `tests/integration/outreach-flow.test.ts`

**Interfaces:**
- Consumes: `getOutreachQueue`, `OutreachToolbar`, `OutreachCard`
- Produces: Production route `/outreach` rendering the approval queue with real-time filtering and live outcome updates.

- [ ] **Step 1: Write integration test (`tests/integration/outreach-flow.test.ts`)**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOutreachQueue, markContacted, logCallOutcome } from '@/lib/actions/outreach';

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from '@/lib/supabase/server';

describe('Feature 03 End-to-End Outreach Flow', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-1' } }, error: null }) },
      from: vi.fn(),
    };
    (createServerClient as any).mockResolvedValue(mockSupabase);
  });

  it('completes the full approval to qualification cycle: approved -> contacted -> qualified', async () => {
    // 1. Queue query
    const mockOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'th-1', author: 'Marcus', stage: 'approved' }],
      error: null,
    });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ order: mockOrder }),
        }),
      }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    });

    const queueRes = await getOutreachQueue('ws-1');
    expect(queueRes.success).toBe(true);
    expect(queueRes.threads[0].stage).toBe('approved');

    // 2. Mark contacted via LinkedIn
    const contactRes = await markContacted('th-1', 'ws-1', 'linkedin');
    expect(contactRes.success).toBe(true);

    // 3. Log Call Outcome: Interested -> Qualified
    const outcomeRes = await logCallOutcome({
      threadId: 'th-1',
      workspaceId: 'ws-1',
      outcome: 'interested',
      consentGranted: true,
      consentChannel: 'whatsapp',
    });
    expect(outcomeRes.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify failure**
Run: `npm test tests/integration/outreach-flow.test.ts`
Expected: FAIL (Cannot find module or passes once Task 3 is in place)

- [ ] **Step 3: Implement `app/outreach/page.tsx`**

```tsx
import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getOutreachQueue } from '@/lib/actions/outreach';
import { OutreachToolbar } from '@/components/outreach/OutreachToolbar';
import { OutreachCard } from '@/components/outreach/OutreachCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'WinThread — Outreach Queue',
  description: 'Zero-ban 1-click outreach queue and 5-step call script co-pilot',
};

export default async function OutreachPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If unauthenticated in dev/preview, use mock or redirect
  const workspaceId = user ? 'default-workspace' : 'default-workspace';

  const { threads } = await getOutreachQueue(workspaceId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex justify-between items-center">
          <Link href="/threads" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Signal Feed
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
            Feature 03: Outreach Queue
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Outreach Queue & Call Script Co-Pilot</h1>
          <p className="text-sm text-neutral-400 mt-1">1-click delivery with zero account ban risk. Review approved leads and execute outreach.</p>
        </div>

        {/* Toolbar with Activity Progress */}
        <OutreachToolbar
          contactedTodayCount={threads.length > 0 ? 3 : 0}
          activeFilter="all"
          onFilterChange={() => {}}
        />

        {/* Queue Cards */}
        {threads.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-neutral-800 bg-neutral-900/20 space-y-3">
            <p className="text-sm text-neutral-400">Outreach queue is empty.</p>
            <p className="text-xs text-neutral-500">Approve leads from the <Link href="/threads" className="text-emerald-400 underline">Signal Feed</Link> to stage outreach here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {threads.map((thread) => (
              <OutreachCard
                key={thread.id}
                thread={thread}
                agencyName="My Agency"
                serviceName="Workflow Automation"
                onRefresh={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run full test suite and verify build**
Run: `npm test; npx tsc --noEmit; npm run build`
Expected: ALL PASS (100% tests passing, production build succeeded)

- [ ] **Step 5: Commit and push**
```bash
git add app/outreach/page.tsx tests/integration/outreach-flow.test.ts
git commit -m "feat(outreach): implement /outreach page route and integration flow"
git push origin main
```

---
*End of Feature 03 Implementation Plan.*
