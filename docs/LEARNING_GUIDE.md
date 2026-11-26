# WinThread Engineering & Architectural Learning Guide
**Document Identifier:** LEARN-WINTHREAD-2026-11-23-V2  
**Audience:** Founders, Technical Leads, and System Architects building WinThread.  
**Philosophy:** Learn While You Build — Understanding every line of code, design choice, protocol boundary, and security model from first principles.

---

## Executive Summary & System Overview

WinThread is a high-precision B2B Buyer Intent & Agency Client Acquisition Operating System. It monitors social conversations (Reddit, Hacker News, Bluesky, and LinkedIn) in real time, extracts high-intent buying signals, scores them against an agency's Ideal Customer Profile (ICP), and automates lead engagement and deal workflows.

Building an enterprise-grade platform requires zero guesswork. Every file in this codebase was chosen to satisfy specific architectural invariants:
1. **Zero-Trust Input Boundary:** Nothing enters memory or storage without strict runtime validation.
2. **Defensive Network Topology:** Web scraping and external calls are isolated behind protocol-level SSRF defenses.
3. **Dual API Architecture:** Server Actions for user-driven mutations; Route Handlers for external webhooks and public endpoints.
4. **Row-Level Security (RLS) Isolation:** Multi-tenant workspace data is cryptographically and logically segregated at the PostgreSQL engine level.
5. **Modern Web Standards Compliance:** UI components adhere strictly to Google Chrome Modern Web Guidance to prevent UX bugs and state corruption.

---

## Table of Contents
### Part I: Foundations & Setup Wizard (Feature 01)
1. [Chapter 1: The Safety Inspector — Vitest & Modern Test Architecture (Task 1)](#chapter-1-the-safety-inspector)
2. [Chapter 2: The Data Bouncer — Runtime Schema Validation & Zod (Task 2)](#chapter-2-the-data-bouncer)
3. [Chapter 3: The Web Scout & Network Armor — Scraper & SSRF Defense (Task 3)](#chapter-3-the-web-scout--network-armor)
4. [Chapter 4: The Database Vault — Supabase RLS & Server Action Seeding (Task 4)](#chapter-4-the-database-vault)
5. [Chapter 5: The Interactive Lego Blocks — React 19 & Chrome Web Standards (Task 5)](#chapter-5-the-interactive-lego-blocks)
6. [Chapter 6: Assembling the State Machine — Setup Wizard & Client Boundaries (Task 6)](#chapter-6-assembling-the-state-machine)
7. [Chapter 7: The Hybrid Gateway — Route Handlers vs Server Actions (Task 7)](#chapter-7-the-hybrid-gateway)
8. [Chapter 8: Full-Chain Integration & Verification — The Two-Man Rule (Task 8)](#chapter-8-full-chain-integration)

### Part II: Signal Feed, MDIE Engine & Security Armor (Feature 02 & Hardening)
9. [Chapter 9: The Social Radar — Multi-Platform Ingestion Adapters (Reddit, HN, Bluesky)](#chapter-9-the-social-radar)
10. [Chapter 10: The Global Firehose vs The Private Pond — Deduplication & Tenant Projection](#chapter-10-the-global-firehose-vs-the-private-pond)
11. [Chapter 11: The MDIE Brain — 3-Tier Multi-Dimensional Intent Engine](#chapter-11-the-mdie-brain)
12. [Chapter 12: The Dynamic Learning Loop — Bayesian Keyword Feedback & Damping Floors](#chapter-12-the-dynamic-learning-loop)
13. [Chapter 13: The Command Cockpit — Feed Toolbar, Fast Filtering & Chrome Web Standards](#chapter-13-the-command-cockpit)
14. [Chapter 14: The Deep Defense — SSRF Hop-by-Hop Redirects & Stream Lifecycle](#chapter-14-the-deep-defense)
15. [Chapter 15: The Fort Knox Migration — Consolidated 18-Table Row Level Security](#chapter-15-the-fort-knox-migration)
16. [Chapter 16: Master Architectural Decision Ledger (Decisions 1–15)](#chapter-16-master-architectural-decision-ledger)

---

## Chapter 1: The Safety Inspector
### Vitest, JSDOM & Modern Test Architecture (Task 1)

```
       [ Developer Writes Code ]
                   │
                   ▼
       [ Vitest Engine (ESM) ]  <─── Fast in-memory execution (3ms startup)
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
  [ Node.js Environment ] [ JSDOM Virtual DOM ]
  (Server Actions, DB)   (React Components, Buttons, Forms)
```

### 1.1 The Real-World Analogy
When engineers erect a skyscraper, they do not wait until the 50th floor is built to check if the concrete foundation can bear the load. Before pouring concrete, lab technicians crush test cylinders under hydraulic presses. If the sample cracks at 3,000 PSI instead of 5,000 PSI, construction halts immediately.

In software engineering, that continuous hydraulic press is the **Test Runner**.

### 1.2 Why Vitest Over Legacy Jest?
For nearly a decade, **Jest** was the industry standard. However, Jest was designed in the CommonJS (`require()`) era of JavaScript. To run modern TypeScript (`import/export`, JSX, ESM), Jest requires complex compilation pipelines (Babel or `ts-jest`) that recompile files on every run, introducing 5–15 second startup delays.

**Vitest** is built natively on top of Vite:
* **Vite Transform Pipeline:** Vitest reuses the exact same resolution and transformation pipeline as your bundler. TypeScript is stripped in native Go/Rust speeds via `esbuild`.
* **Instant Startup:** The test runner starts in **3 milliseconds** rather than several seconds.
* **Native ESM & Path Aliases:** It resolves paths like `@/lib/...` natively without fragile mapper configurations.

### 1.3 Key Architectural Files Explained
* **`vitest.config.mts`**:
  * `environment: 'jsdom'`: Node.js has no `window`, `document`, or DOM hierarchy. `jsdom` is a pure JavaScript implementation of web standards that simulates a browser in memory. This enables testing button clicks, keyboard events, and form inputs without the overhead of launching a physical Chrome process.
  * `alias: { '@': path.resolve('./') }`: Replaces Node ESM's lack of directory path mapping with root-relative module resolution.
* **`tests/setup.ts`**:
  * Injects `@testing-library/jest-dom/vitest`. This extends Vitest's assertion engine with DOM-specific matchers:
    ```typescript
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText(/save/i)).toBeDisabled();
    ```
* **`tests/unit/sanity.test.ts`**:
  * Proves the testing pipeline itself is intact (`expect(true).toBe(true)`). It acts as an electrical continuity tester before connecting live circuits.

### 1.4 Test-Driven Development (TDD): Red $\rightarrow$ Green $\rightarrow$ Refactor
1. **Red Phase:** Write a failing test specifying the contract *before* writing production code. Run it and confirm it fails for the expected reason (e.g., function not found).
2. **Green Phase:** Write the minimum code required to turn the assertion green.
3. **Refactor Phase:** Optimize and clean the code while the test suite guarantees zero regressions.

---

## Chapter 2: The Data Bouncer
### Runtime Schema Validation & Zod (Task 2)

```
  [ Untrusted User Input ]
             │
             ▼
  [ Zod Schema Barrier ]  ───(Invalid: < 3 negative keywords)───► [ 400 Bad Request ]
             │
       (Valid Payload)
             ▼
  [ Internal Application Core ]
```

### 2.1 The Real-World Analogy
At a high-security international border, a traveler presents a passport. The border agent does not just glance at the photo. They run the machine-readable zone through an infrared scanner, check the biometric chip against Interpol databases, and verify the holographic seal. If any check fails, entry is refused instantly at the threshold.

In our backend, that border checkpoint is **Zod Schema Validation**.

### 2.2 The Trap: TypeScript Disappears at Runtime
A common pitfall among junior developers is assuming that defining a TypeScript interface protects their application:
```typescript
// DANGEROUS ASSUMPTION:
interface SetupPayload {
  agencyUrl: string;
  negativeKeywords: string[];
}
```
**Why this fails:** TypeScript is purely a compile-time type system. When your Next.js application compiles to production JavaScript, **every single type, interface, and generic is completely erased**.
* If an attacker, bot, or buggy client sends an HTTP POST request containing `{ "agencyUrl": 12345, "negativeKeywords": [] }`, compiled JavaScript executes it blindly.
* Unvalidated inputs trigger `TypeError: url.startsWith is not a function`, SQL injection vectors, or database schema corruption.

### 2.3 The Solution: Zod (`lib/validations/setup.ts`)
Zod bridges compile-time typing and runtime enforcement by defining a single source of truth:
```typescript
export const setupFormSchema = z.object({
  agencyUrl: z.string().url('Please enter a valid website URL'),
  workspaceName: z.string().min(2, 'Must be at least 2 characters'),
  services: z.array(z.string().min(1)).min(1, 'Add at least one service'),
  negativeKeywords: z.array(z.string().min(1)).min(3, 'At least 3 negative keywords required'),
});

export type SetupFormData = z.infer<typeof setupFormSchema>;
```
* **Bi-directional Typing:** `z.infer<typeof setupFormSchema>` automatically generates the TypeScript type from the validation schema. You never maintain separate types and schemas.
* **Strict 3-Negative-Keywords Rule:** Social listening algorithms without negative filtering capture over 90% spam (e.g., students looking for homework help, job seekers looking for internships). Enforcing `min(3)` at the schema layer guarantees that no agency workspace can ever be initialized without basic noise filtering.

### 2.4 Agency Presets (`lib/constants/icp-presets.ts`)
Users often suffer from blank-slate paralysis during onboarding. We established 3 battle-tested agency taxonomy presets:
1. **AI Automation Agency:** Targeting Founders and COOs suffering from support ticket overhead, looking to build AI chatbots.
2. **B2B Lead Gen Agency:** Targeting VP Sales and CROs needing qualified outbound pipeline.
3. **Performance Marketing Agency:** Targeting CMOs looking to scale ROAS and paid acquisition.

Each preset contains pre-mapped services, target titles, pain points, intent signals, and exclusion keywords, powering our 1-click onboarding experience.

---

## Chapter 3: The Web Scout & Network Armor
### Scraping & SSRF Defense (Task 3)

```
  [ Scrape Request: https://agency.com ]
                   │
                   ▼
  [ Protocol & Hostname Inspection ]
  ├─ Is protocol http/https? ──(No)──► REJECT
  ├─ Is host in [localhost, 127.0.0.1, 169.254.169.254]? ──(Yes)──► REJECT
  └─ Does host end with .local / .internal? ──(Yes)──► REJECT
                   │
            (Passed Checks)
                   ▼
  [ AbortController (6000ms Timeout) ]
                   │
                   ▼
  [ Fetch HTML & Extract Metadata ] ──(Timeout / Error)──► [ Fallback to Preset ]
```

### 3.1 The Real-World Analogy
You hire a scout to inspect a competitor's storefront and read the signs in the window. However, an adversary hands your scout a map with coordinates leading directly into your own private headquarters vault or an armed military compound. If your scout blindly walks there, they compromise your internal security.

In cloud computing, this exploit is called **Server-Side Request Forgery (SSRF)**.

### 3.2 Understanding the SSRF Attack Vector
When an application accepts a URL from a user and fetches it from the server, the fetch request originates from **inside your cloud infrastructure**:
1. **Cloud Metadata Exploitation:** On AWS, GCP, and Azure, cloud instances communicate with a special link-local IP address: `http://169.254.169.254/latest/meta-data/`. This endpoint exposes temporary IAM credentials, private SSH keys, and cloud environment tokens.
2. **Internal Network Scanning:** An attacker submitting `http://127.0.0.1:5432` or `http://10.0.0.1/admin` can map internal databases and management interfaces hidden behind your firewall.

### 3.3 Enterprise SSRF & DNS Rebinding Defense (`lib/scraper/ssrf.ts`)

During our automated adversarial security review, our initial naive check (which merely verified string literals like `'localhost'` or `'127.0.0.1'`) was flagged for two critical attack vectors:
1. **TOCTOU / DNS Rebinding:** An attacker controls a custom domain (`evil.com`) configured with a 0-second TTL DNS server. When the server validates the hostname, DNS resolves to a harmless public IP (`8.8.8.8`). But when `fetch()` executes 5 milliseconds later, the attacker's DNS server answers with `127.0.0.1` or `169.254.169.254`!
2. **Incomplete Private Ranges:** Beyond `127.0.0.1`, cloud environments contain multiple internal routing ranges (Docker bridges `172.17.0.0/16`, CGNAT `100.64.0.0/10`, and IPv6 unique local addresses `fc00::/7`).

**The Hardened Architecture (`lib/scraper/ssrf.ts`):**
We implemented an enterprise-grade SSRF validator utilizing Node.js native `net` and `dns` modules:
* **Pre-Fetch Runtime DNS Resolution:** `dns.promises.lookup(hostname, { all: true })` resolves **all** IPv4 and IPv6 addresses for the target host at validation time.
* **Comprehensive Range Check (`isPrivateIP`):**
  - **IPv4:** `0.0.0.0/8`, `10.0.0.0/8` (RFC 1918), `100.64.0.0/10` (RFC 6598 CGNAT), `127.0.0.0/8` (Loopback), `169.254.0.0/16` (RFC 3927 Link-Local / Cloud Metadata), `172.16.0.0/12` (RFC 1918), `192.168.0.0/16` (RFC 1918), `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` (TEST-NET ranges), and `≥224.0.0.0` (Multicast / Reserved).
  - **IPv6:** `::1` (Loopback), `::` (Unspecified), `fc00::/7` (Unique Local / ULA), `fe80::/10` (Link-Local), `ff00::/8` (Multicast), and `::ffff:0:0/96` (IPv4-Mapped IPv6).
  - **Blocked Suffixes:** Rejects `.localhost`, `.local`, `.internal`, `.lan`, and `.home.arpa`.

```typescript
// All network requests must pass validateSafeUrl before connecting:
const validation = await validateSafeUrl(url);
if (!validation.safe) {
  return { success: false, data: fallbackData, fallback: fallbackData, error: validation.error };
}
```

### 3.4 Defensive Scraping Engineering
1. **The 6-Second Stopwatch (`AbortController`):**  
   If a client enters a website hosted on a broken server that hangs indefinitely, your server process cannot stall waiting for a response:
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 6000);
   const res = await fetch(targetUrl, { signal: controller.signal });
   clearTimeout(timeoutId);
   ```
2. **Fail-Soft Graceful Degradation:**  
   If the target website has Cloudflare anti-bot protection, is offline, or times out, the function catches the error and **gracefully falls back to a default preset**. The user is never blocked by a crash screen.

---

## Chapter 4: The Database Vault
### Supabase RLS & Server Action Seeding (Task 4)

```
  [ Browser Client ]
          │  Calls completeSetupWizard(data)
          ▼
  [ Next.js Server Action Boundary ]
  (Runs securely on server; has access to SUPABASE_SERVICE_ROLE_KEY)
          │
          ▼
  [ executeSetupTransaction ]
  ├─ 1. Duplicate Domain Check (workspaces)
  ├─ 2. Insert Workspace Record (workspaces)
  ├─ 3. Upsert ICP Profile (icp_profiles)
  ├─ 4. Seed Source Weights (reddit: 1.20, hackernews: 1.00, bluesky: 0.90)
  ├─ 5. Seed Keyword Weights (W_j = 1.00 per buying signal)
  ├─ 6. Seed 5 Realistic High-Intent Starter Leads (threads)
  └─ 7. Emit setup_completed Audit Log (events)
          │
          ▼
  [ PostgreSQL Database Engine (Row-Level Security Enforced) ]
```

### 4.1 The Real-World Analogy
Imagine a state-of-the-art bank vault where every customer deposit box is protected by biometric locks. Customers can only view their own box. But on opening day, a new customer who has not registered yet cannot open a box because they have no credentials. The bank vault supervisor must use the master key to create the box, deposit initial onboarding funds, and then issue the customer their individual key.

### 4.2 Row-Level Security (RLS) vs Service Role Key
* **Row-Level Security (RLS):** In PostgreSQL, RLS policies dictate that queries like `SELECT * FROM workspaces` automatically append `WHERE auth.uid() = user_id`.
* **The Onboarding Paradox:** In WinThread, we designed an onboarding flow ("Magic First, Auth at the End") where the agency builds their ICP *before* creating a user account.
* **The Permission Denied Error (42501):** If the browser tried to insert into `workspaces` using the public anonymous Supabase key, PostgreSQL would abort with error `42501 (Permission Denied)`.
* **The Solution:** We execute the onboarding setup inside a **Server Action** (`lib/actions/setup.ts`). The Server Action executes on the server, safely utilizing the `SUPABASE_SERVICE_ROLE_KEY` (the bank master key) to provision the workspace and seed initial starter data, returning a secure `workspaceId`.

### 4.3 Security Hardening: Fail-Secure Keys & Domain Collision Defense
During our adversarial security review, two authorization vulnerabilities were discovered and permanently resolved:
1. **Never Fallback to Anon Key (Fail-Secure Principle):**
   * *Anti-Pattern:* `process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!`
   * *Why Dangerous:* If the service key is accidentally omitted from production environment variables, falling back to the anon key causes silent partial failures, unpredictable RLS blocks, or privilege leakage.
   * *The Invariant:* If an admin operation lacks the service role key, it must throw an explicit error immediately:
     ```typescript
     const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
     if (!serviceRoleKey) {
       return { success: false, error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required' };
     }
     ```
2. **Domain Collision & Hijacking Defense:**
   * *The Vulnerability:* If User A registers `agency.com`, and User B enters `https://agency.com` in the wizard, blindly reusing `existingWs.id` allowed User B to overwrite User A's ICP profile, keywords, and weights!
   * *The Armor:* If a workspace already exists for that domain and the caller is not the authenticated owner, the transaction aborts:
     ```typescript
     if (existingWs) {
       if (!userId || userId === 'unauthenticated-lead' || existingWs.owner_id !== userId) {
         return { success: false, error: `A workspace for ${domain} already exists. Please sign in to access your account.` };
       }
     }
     ```
3. **Workspace State Lifecycle (`pending_claim` vs `active`):**
   * When an unauthenticated visitor completes the wizard, the workspace is created with `status: 'pending_claim'` and `owner_id: null`.
   * Only after the user signs up and claims the workspace ID does the workspace transition to `'active'` with their cryptographic `user.id`.

### 4.4 Why Pre-Seed Starter Leads?
If a user completes setup and lands on an empty screen displaying *"No leads found yet. Check back in 24 hours"*, over 70% of users churn and never return.  
By seeding **5 realistic, high-intent starter leads** directly into `threads` during onboarding:
* The agency immediately sees their lead dashboard populated with relevant signals.
* They can immediately test action buttons (`[Copy Reply]`, `[Generate Quote]`).
* The value proposition is proven in the first 10 seconds of usage.

---

## Chapter 5: The Interactive Lego Blocks
### React 19 & Google Chrome Modern Web Guidance (Task 5)

```
  ┌────────────────────────────────────────────────────────┐
  │ TagInput Component                                     │
  │                                                        │
  │  [ AI Automation ✕ ]  [ Chatbots ✕ ]  [ Lead Gen ✕ ]    │
  │  ┌──────────────────────────────────────────────────┐  │
  │  │ Type new tag and press Enter...                  │  │
  │  └──────────────────────────────────────────────────┘  │
  └────────────────────────────────────────────────────────┘
```

### 5.1 The Real-World Analogy
Think of standard Lego bricks. A well-designed brick has standard studs and tubes. It fits into any other brick without needing to know whether the builder is creating a spaceship or a castle.

In frontend architecture, components like `TagInput` and `NegativeKeywordPreview` are modular bricks.

### 5.2 The Button Type Trap & Google Chrome Modern Web Guidance
While auditing our UI against Google Chrome's `modern-web-guidance`, we addressed a subtle HTML specification quirk:
* **The HTML Standard Rule:** In standard HTML, any `<button>` element placed inside a `<form>` defaults to `type="submit"` unless explicitly told otherwise!
* **The Disaster Scenario:** If a user is on Step 2 of the setup wizard and clicks the small `✕` icon next to a tag chip to delete it, the browser treats that click as a **form submission**! The incomplete form submits prematurely, triggering validation errors or submitting half-filled profiles.
* **The Invariant:** Every non-submit button (tag remove buttons, preset selection chips, back buttons) **must explicitly declare `type="button"`**.
  ```tsx
  <button
    type="button"
    onClick={() => removeTag(index)}
    aria-label={`Remove tag ${tag}`}
  >
    <X className="w-3 h-3" />
  </button>
  ```

### 5.3 Live Noise Filtration Preview
To make the value of negative keywords tangible, `NegativeKeywordPreview.tsx` implements an interactive heuristic formula:
$$\text{Filter Percentage} = \min(85, \max(15, \text{count} \times 14))$$
* With 1 negative keyword: shows minimum floor ($15\%$).
* With 3 negative keywords: $\min(85, 3 \times 14) = 42\%$.
* With 5 negative keywords: $\min(85, 5 \times 14) = 70\%$.
* With 6+ negative keywords: caps out at an optimal $85\%$ noise elimination.
This real-time visual indicator gives immediate positive feedback to the user as they refine their profile.

---

## Chapter 6: Assembling the State Machine
### Multi-Stage Wizard & Client Boundaries (Task 6)

```
  [ Step 1: 'url' ] ──(Enter URL & Click Scan)──► [ Calls /api/setup/extract ]
                                                           │
                                                           ▼
  [ Step 2: 'review' ] ◄─────────(Populate Tags with Extracted ICP)
  ├─ Tweak Services, Buyer Titles, Pain Points, Buying Signals
  ├─ Ensure Negative Keywords >= 3
  └─ Click "Save Profile & Continue"
           │
           ▼
  [ Calls Server Action: completeSetupWizard ]
           │
           ▼
  [ Redirects to /threads with Populated Leads ]
```

### 6.1 Understanding `'use client'` in Next.js 16
In Next.js 16 (App Router), components are **React Server Components (RSC)** by default. They run only on the server, generating static HTML and streaming it to the browser. Server Components have zero bundle size overhead, but they cannot use browser state (`useState`, `useEffect`) or listen to DOM events (`onClick`, `onChange`).

Marking `SetupWizardForm.tsx` and `app/setup/page.tsx` with `'use client'` establishes an explicit boundary:
* Tells Next.js to package the component and its interactivity into the client-side JavaScript bundle.
* Enables dynamic form stepping (`useState<'url' | 'review'>('url')`), loading animations (`Loader2`), and interactive tag manipulation.

### 6.2 The Clean Separation of Concerns
Notice the architectural boundary between `app/setup/page.tsx` and `components/setup/SetupWizardForm.tsx`:
* `SetupWizardForm.tsx` **owns only UI presentation and input state**: It manages form fields, tag inputs, and step transitions. It does not know or care *how* data is stored in the database.
* `page.tsx` **owns business orchestration and routing**: It receives the validated form data, calls the Server Action `completeSetupWizard`, handles the response, and executes `router.push('/threads')`.

---

## Chapter 7: The Hybrid Gateway
### Route Handlers vs Server Actions (Task 7)

```
                      ┌──────────────────────────────────────────────┐
                      │            Next.js 16 API Surface            │
                      └──────────────────────┬───────────────────────┘
                                             │
                      ┌──────────────────────┴───────────────────────┐
                      ▼                                              ▼
           [ Server Actions ]                               [ Route Handlers ]
           ('use server' RPC)                               (app/api/.../route.ts)
           ──────────────────                               ─────────────────────
    • Client-to-server UI mutations                 • External webhook receivers (Stripe)
    • Direct function call syntax                   • Public REST APIs & scraping proxies
    • Automatic CSRF & encryption                   • Custom HTTP headers & status codes
    • Built-in cache revalidation                   • Standard Request / Response objects
```

### 7.1 When to Use What? (The Architectural Invariant)
A frequent point of confusion in Next.js 16 is whether to use Route Handlers (`app/api/.../route.ts`) or Server Actions (`'use server'`). WinThread enforces a clear rule:
1. **Server Actions (`lib/actions/setup.ts`):** Used for **internal user-driven state changes**. When a button on a form executes a database transaction, a Server Action provides type-safe RPC without exposing a public REST endpoint.
2. **Route Handlers (`app/api/setup/extract/route.ts`):** Used for **standard HTTP request/response interfaces**. The website extraction endpoint operates as a REST API returning structured JSON. This allows external services, background workers, or standard `fetch()` clients to inspect agency taxonomy independently of UI form lifecycles.

### 7.2 Anatomy of `/api/setup/extract/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { extractAgencyTaxonomy } from '@/lib/scraper/extract';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid URL is required' },
        { status: 400 }
      );
    }
    const result = await extractAgencyTaxonomy(url);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
```

---

## Chapter 8: Full-Chain Integration & Verification
### The Two-Man Rule & Zero-Defect Standards (Task 8)

```
  ┌─────────────────────────────────────────────────────────────┐
  │ Producer-Verifier Cockpit (Two-Man Rule)                    │
  │                                                             │
  │  [ Claude Code Ultra (Builder) ]                            │
  │    ├─ Executes TDD task implementation                      │
  │    └─ Commits to git with Conventional Commits              │
  │                                                             │
  │  [ Antigravity Chief of Staff (Independent Verifier) ]      │
  │    ├─ Audits git commit diff (`git log -1 --stat`)          │
  │    ├─ Runs full test suite (`npm test`)                     │
  │    └─ Executes strict compiler check (`npx tsc --noEmit`)   │
  └─────────────────────────────────────────────────────────────┘
```

### 8.1 The Two-Man Rule
In high-consequence environments (aerospace flight control, nuclear operations, financial ledgers), no single actor can initiate and approve a critical operation alone.
* In WinThread engineering, **an AI agent that writes code is never permitted to self-certify its own work**.
* Claude Code executes implementation tasks and makes git commits.
* Antigravity independently audits the git tree, runs the test runner, and verifies the TypeScript compiler output.
* If any test fails or a single type error is detected, the pipeline halts immediately.

### 8.2 The Full Integration Test (`tests/integration/setup-flow.test.ts`)
Unit tests verify components in isolation. But an integration test verifies that the gears mesh together correctly:
1. **Mock Scrape:** Simulates an HTML response from `https://apexflow.ai`.
2. **Extraction:** Executes `extractAgencyTaxonomy` and verifies extracted title and meta description.
3. **Validation:** Passes extracted tags into `setupFormSchema.safeParse` and asserts validity.
4. **Transaction:** Executes `executeSetupTransaction` against a mocked Supabase database and verifies all 5 tables (`workspaces`, `icp_profiles`, `source_weights`, `threads`, `events`) receive correct payloads.

---

---

# PART II: Signal Feed, MDIE Engine & Security Armor
*(Feature 02 Implementation & Production Hardening)*

---

## Chapter 9: The Social Radar
### Multi-Platform Ingestion Adapters (Reddit, Hacker News, Bluesky)

```
  [ Raw Platform Payloads ]
     Reddit JSON   │   HN Algolia Search   │   Bluesky AT Protocol
          │                   │                     │
          ▼                   ▼                     ▼
  [ RedditAdapter ]   [ HackerNewsAdapter ]   [ BlueskyAdapter ]
          │                   │                     │
          └───────────────────┼─────────────────────┘
                              ▼
                 [ Normalized SocialPost ]
                 {
                   id: "reddit-18abcde",
                   source: "reddit",
                   title: "Looking for an AI agency...",
                   content: "Our team needs custom Zapier and LLM workflows...",
                   author: "tech_founder_99",
                   url: "https://reddit.com/r/SaaS/...",
                   publishedAt: "2026-11-24T18:00:00Z"
                 }
```

### 9.1 The Real-World Analogy
Imagine an international airport baggage handling facility. Luggage arrives from Tokyo, London, and New York in different sizes, shapes, barcodes, and customs tags. If the airport's automated conveyor belt required a custom robot arm for every single airline's baggage design, the system would jam and collapse. Instead, every piece of luggage is placed into a **standardized plastic conveyor tray** with a uniform RFID chip. From that moment on, every machine in the airport only deals with the standard tray.

In WinThread, the standard plastic tray is the **`SocialPost` contract**.

### 9.2 The Junior Trap: Platform-Specific Spaghetti
When junior engineers build multi-channel social monitoring, they frequently write ad-hoc fetch routines inside UI components or API handlers:
* The Reddit code expects `item.data.selftext`.
* The Hacker News code expects `item.story_text || item.comment_text`.
* The Bluesky code expects `item.post.record.text`.

If an engineer passes these differing structures directly into the database or intent scoring engine, any subtle API change from one platform crashes the entire scoring pipeline.

### 9.3 The Solution: The Adapter Pattern (`lib/social/adapters.ts`)
We created a uniform interface that isolates third-party platform quirks behind a strict contract:
```typescript
export interface SocialPost {
  id: string;            // Normalized: '<channel>-<platformId>'
  source: SocialChannel; // 'reddit' | 'hackernews' | 'bluesky' | 'linkedin' | 'twitter' | 'email' | 'other'
  title?: string;
  content: string;
  author?: string;
  url: string;
  publishedAt: string;
}
```

#### Key Engineering Invariants:
1. **Collision-Proof ID Prefixing:** If Reddit post has ID `101` and Hacker News story has ID `101`, storing raw IDs causes catastrophic database overwrites. Every adapter prepends its source channel: `reddit-101`, `hn-101`, `bsky-101`.
2. **Text Normalization:** Social posts can be title-only (Hacker News "Ask HN: Anyone recommend an agency?"), body-only (Bluesky skeets), or composite (Reddit title + selftext). The adapter unifies these into searchable content strings while preserving the title.
3. **Channel Type Enforcement:** We enforce `ALLOWED_CHANNELS` with runtime validation in `lib/constants/channels.ts`, preventing unvalidated channel strings from entering the database.

---

## Chapter 10: The Global Firehose vs The Private Pond
### Deduplication & Tenant Projection (`raw_signals` vs `threads`)

```
                          [ Internet Crawlers & Scanners ]
                                         │
                                         ▼
                      [ Global Shared Firehose: raw_signals ]
                      ├─ Stores every scraped post once
                      ├─ Unique constraint: (source, external_id)
                      └─ Default-Deny RLS (Service-Role Only)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
       [ Workspace A: ApexFlow ]                       [ Workspace B: SaaSScale ]
       (Matches >= 60% Intent)                         (Matches >= 60% Intent)
                 │                                               │
                 ▼                                               ▼
    [ threads (Workspace A) ]                       [ threads (Workspace B) ]
    ├─ score: 94%                                   ├─ score: 62%
    └─ stage: discovered                            └─ stage: discovered
```

### 10.1 The Real-World Analogy
Consider a financial news ticker like Bloomberg or Reuters. Millions of market updates flash across the wire every hour. A wealth management firm does not hire 50 analysts to each buy a separate Bloomberg terminal and duplicate the exact same market queries. The firm ingests the raw news wire once into a central datastore, and then each portfolio manager's algorithmic filter projects only the relevant stocks into their private client watchlists.

### 10.2 The Trap: Siloed Per-Workspace Scraping
If 500 digital marketing agencies sign up for WinThread and each agency's background worker crawls Reddit for "looking for marketing help", the platform executes:
$$\text{500 workspaces} \times \text{1,000 requests/day} = \text{500,000 duplicate HTTP requests/day}$$
This results in:
* IP rate-limiting and bans from social networks.
* Massive proxy bills ($5,000–$15,000/month).
* Database bloat storing the exact same Reddit post 500 times.

### 10.3 The Solution: The 2-Tier Storage Architecture
We decoupled signal ingestion from tenant ownership:

1. **The Shared Signal Pool (`raw_signals`):**
   * Stores public posts deduplicated across all sources:
     ```sql
     CREATE TABLE raw_signals (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       source TEXT NOT NULL,
       external_id TEXT NOT NULL,
       title TEXT,
       content TEXT NOT NULL,
       author TEXT,
       thread_url TEXT NOT NULL,
       published_at TIMESTAMPTZ NOT NULL,
       ingested_at TIMESTAMPTZ DEFAULT now(),
       CONSTRAINT raw_signals_source_external_id_key UNIQUE(source, external_id)
     );
     ```
   * **Zero Tenant Access:** Protected by PostgreSQL Row Level Security with zero tenant policies. Only backend ingestion daemons running with `SUPABASE_SERVICE_ROLE_KEY` can read or write to this table.

2. **The Workspace Projection (`threads`):**
   * When an agency's ICP matches a post with an **MDIE Intent Score $\ge 60\%$**, the post is projected into the agency's private `threads` table with their specific match score, matched keywords, and stage (`discovered`).
   * Low-intent noise (< 60%) remains in `raw_signals` without polluting the agency's workspace.

---

## Chapter 11: The MDIE Brain
### 3-Tier Multi-Dimensional Intent Engine

```
                             [ Raw Inbound Post ]
                                       │
     ┌─────────────────────────────────┴─────────────────────────────────┐
     ▼                                 ▼                                 ▼
[ Tier 1: Linguistic ]       [ Tier 2: Pain Point ]            [ Tier 3: Authority ]
(0 to 40 Points)             (0 to 35 Points)                  (0 to 25 Points)
• Buying trigger words       • Bottlenecks & struggles         • Verified author title
• Negative keyword veto      • Problem descriptions            • Dynamic pseudonym boost
     │                                 │                                 │
     └─────────────────────────────────┬─────────────────────────────────┘
                                       ▼
                       [ Raw Score = T1 + T2 + T3 ]
                                       │
                                       ▼
                     [ Channel Multiplier (0.8x - 1.2x) ]
                                       │
                                       ▼
                        [ Final ICP Match Score 0-100% ]
```

### 11.1 The Real-World Analogy
In a high-court legal trial, a judge does not convict based solely on a single word spoken by a witness. The judge evaluates three distinct pillars of evidence:
1. **The Direct Testimony:** Did the witness describe an explicit action? (Linguistic Intent)
2. **The Circumstantial Alignment:** Does the context match the facts of the case? (Pain Point Alignment)
3. **Witness Credibility:** Is the witness an eyewitness or repeating rumors? (Author Authority)

Only when all three pillars correlate does the judge issue a verdict.

### 11.2 The Anatomy of MDIE (`lib/scoring/mdie.ts`)
Social posts are noisy. A post saying *"I hate my agency, they charge too much, who is hiring?"* might match the keyword "agency" and "hiring", but has zero buyer intent for services.

The MDIE algorithm evaluates three weighted dimensions:

#### Tier 1: Linguistic Intent Match (0–40 Points)
* Checks for active commercial intent triggers: `"looking for"`, `"need help with"`, `"recommend an agency"`, `"budget"`, `"RFP"`.
* **The Instant Veto:** If any **negative keyword** matches (e.g. `"job"`, `"internship"`, `"free"`, `"course"`), the score is immediately zeroed (`score = 0`), terminating further computation.

#### Tier 2: Problem & Pain Point Alignment (0–35 Points)
* Evaluates whether the prospect is experiencing the specific pain points the agency solves (e.g., *"manual outreach doesn't scale"*, *"no inbound leads"*, *"Zapier keeps breaking"*).
* Points are awarded based on exact and semantic keyword matches.

#### Tier 3: Author Persona & Channel Authority (0–25 Points)
* Evaluates the author's title or profile (e.g. Founder, CEO, CTO, Head of Growth).
* **The Pseudonymous Authority Innovation:** On platforms like Reddit and Hacker News, founders rarely put "CEO" in their username (e.g., `user_x99`). If Tier 3 required a literal job title match, Reddit and HN leads would always be penalized. MDIE dynamically re-normalizes authority: if a post exhibits high commercial intent and problem description in the body, Tier 3 authority is inferred from problem complexity rather than title badges.

#### Channel Weight Multiplier:
$$\text{Final Score} = \min\left(100, \text{round}\left((\text{Tier}_1 + \text{Tier}_2 + \text{Tier}_3) \times \text{Weight}_{\text{channel}}\right)\right)$$
Default channel weights reflect conversion velocity:
* **LinkedIn:** $1.20\times$ (High identity verification)
* **Reddit:** $1.00\times$ (High raw commercial intent, anonymous)
* **Hacker News:** $1.00\times$ (High technical budget, discerning audience)
* **Bluesky:** $0.90\times$ (Emerging tech ecosystem)

---

## Chapter 12: The Dynamic Learning Loop
### Bayesian Keyword Feedback & Damping Floors

```
                      [ Agency Action in /threads ]
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
           [ User Approves ]               [ User Dismisses ]
                  │                                 │
           Weight Delta: +0.05             Reason: wrong_person
           (Ceiling: 2.50)                          │
                  │                        Weight Delta: -0.10
                  │                        (Hard Floor: 0.40)
                  ▼                                 ▼
       [ Supabase keyword_weights ]     [ Supabase keyword_weights ]
       (Future leads scored higher)     (Future noise damped, not killed)
```

### 12.1 The Real-World Analogy
In tall skyscrapers in earthquake zones (like Taipei 101), engineers suspend a massive 660-tonne steel pendulum inside the top floors. When winds or earthquakes push the building to the right, the pendulum swings to the left, **damping the oscillation**. If the pendulum swung violently without a damper, it would crack the building's own concrete.

In machine learning and scoring feedback loops, that stabilizing damper is the **Bayesian Damping Floor**.

### 12.2 The Overfitting Trap: Why You Never Set Weights to Zero
When an agency founder sees a lead that isn't a good fit and clicks "Dismiss", a naive implementation might set that keyword's weight to $0.00$.
* *Why this is fatal:* If an agency dismisses a lead containing the word `"AI Chatbot"` because the author was a student, zeroing `"AI Chatbot"` ensures that tomorrow, when the CEO of a $50M enterprise posts *"Looking to hire an agency for an AI Chatbot"*, the lead is completely missed!
* Unbounded negative feedback destroys the scoring algorithm within days.

### 12.3 The Damped Feedback Formula (`lib/actions/threads.ts`)
When a user approves or dismisses a thread, WinThread updates the agency's custom `keyword_weights` using bounded Bayesian adjustment:

1. **On Approval (`approveThread`):**
   * Validates positive commercial relevance.
   * Increments weight by $+0.05$, capped at a safe ceiling of $2.50$:
     $$W_{\text{new}} = \min(2.50, W_{\text{current}} + 0.05)$$

2. **On Dismissal with `wrong_person` (`dismissThread`):**
   * Indicates the topic was correct, but the buyer persona was not a decision-maker.
   * Damps the weight by $-0.10$, but strictly enforces a **$0.40$ floor**:
     $$W_{\text{new}} = \max(0.40, W_{\text{current}} - 0.10)$$
   * The keyword remains active to catch future high-authority posts, but its noise contribution is suppressed.

### 12.4 Post-Mortem: The `wrong_persona` Typo Bug
During our adversarial security and code quality review, an insidious bug was discovered in `lib/actions/threads.ts`:
* The UI button emitted reason `'wrong_person'`.
* The server action checked `if (reason === 'wrong_persona')`.
* Because of the missing `'n'`, the check silently failed, and keyword damping **never executed**.
* *Lesson Learned:* Never rely on raw string comparisons across client-server boundaries. Use shared TypeScript string literal unions or Zod enums verified by automated integration tests (`tests/integration/signal-feed-flow.test.ts`).

---

## Chapter 13: The Command Cockpit
### Feed Toolbar, Fast Filtering & Chrome Web Standards

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           Signal Feed Cockpit                          │
  ├────────────────────────────────────────────────────────────────────────┤
  │ [ Channels: All | Reddit | HN | Bluesky ]    [ Min Score Slider: 70% ] │
  │ [ Search: "chatbot"...                 ]    [ Live Count: 5 Leads    ] │
  ├────────────────────────────────────────────────────────────────────────┤
  │ ┌────────────────────────────────────────────────────────────────────┐ │
  │ │ 94% Match  •  REDDIT  •  2h ago                     [Quick Quote]  │ │
  │ │ "Looking for an agency to build an AI customer support bot..."     │ │
  │ │ Matched Signals: [ai chatbot: 1.05] [support bot: 1.00]            │ │
  │ │                                      [Dismiss Lead]  [Approve Lead]│ │
  │ └────────────────────────────────────────────────────────────────────┘ │
  └────────────────────────────────────────────────────────────────────────┘
```

### 13.1 Real-World Analogy
An air traffic controller's radar screen tracks hundreds of flights simultaneously. The controller cannot wait 3 seconds for a database query every time they filter for incoming transatlantic flights. The radar console keeps flight data in local high-speed memory, allowing instantaneous filtering by altitude, speed, and heading.

### 13.2 Optimistic Client-Side Filtering (`app/threads/page.tsx`)
In `/threads`, leads are rendered with zero server round-trip latency when filtering:
* **The Multi-Filter Pipeline:** A single memoized pipeline filters the lead set across three concurrent dimensions:
  1. Selected social channel (`all`, `reddit`, `hackernews`, `bluesky`, `linkedin`).
  2. Minimum intent score slider ($0\%$ to $100\%$).
  3. Real-time text search query (matching author, post text, and matched keywords).
* **Optimistic UI Updates:** When "Approve" or "Dismiss" is clicked, the thread card immediately animates and disappears from the DOM, while the Server Action runs asynchronously in the background. If the network drops, the state rolls back with an error notification.

### 13.3 Modern Web Standards: The `type="button"` Invariant
A frequent bug in React and Next.js applications occurs when interactive buttons inside forms or complex drawers omit the `type` attribute:
```tsx
// BUGGY: In modern HTML, default button type inside a form is "submit"!
<button onClick={handleDismiss}>Dismiss</button>

// PRODUCTION-GRADE: Explicit button type prevents accidental form submission
<button type="button" onClick={handleDismiss}>Dismiss</button>
```
* **The Pitfall:** Clicking an untyped button inside or near a form triggers an unintended HTTP POST or form submit event, refreshing the page or corrupting state.
* **The Rule:** In WinThread, **every interactive non-submit button declares explicit `type="button"`**.

---

## Chapter 14: The Deep Defense
### SSRF Hop-by-Hop Redirects & Stream Lifecycle

```
  [ Fetch: https://agency.com ]
                │
                ▼
  [ 1. validateSafeUrl() ] ──(Private IP / Blocked TLD / Port != 80,443)──► REJECT
                │
         (Passed Checks)
                ▼
  [ 2. fetch(url, redirect: 'manual') ]
                │
         ┌──────┴───────────────────────────┐
         ▼                                  ▼
   (Status 200)                       (Status 302 Redirect)
   Extract HTML                             │
                                      [ Cancel Previous Stream ]
                                      await res.body.cancel()
                                            │
                                      [ Protocol Check ]
                                      Disallow HTTPS -> HTTP
                                            │
                                      [ Re-validate Destination ]
                                      validateSafeUrl(nextUrl)
                                            │
                                      [ Repeat Loop (Max 3 Hops) ]
```

### 14.1 The Real-World Analogy
Imagine a security checkpoint at a high-security embassy. A visitor presents a valid passport at the front gate and is allowed inside. Once in the lobby, the visitor points to a side hallway and claims they were redirected to room 104. A lazy security guard lets them walk through unescorted. The visitor bypasses the checkpoint and enters the server room.

A proper security guard **escorts the visitor room-by-room**, checking credentials and inspecting badges at **every single doorway**.

### 14.2 The Redirect Bypass Exploit (SSRF-001)
Many developers assume that validating a URL once before calling `fetch()` makes them safe:
```typescript
// DANGEROUS CODE:
const validation = await validateSafeUrl(url); // Checks "https://good-site.com" -> OK
const res = await fetch(url); // Native fetch automatically follows 302 redirects!
```
* **The Attack:** The attacker hosts `https://good-site.com`. When WinThread's scraper visits, the server returns:
  `HTTP/1.1 302 Found`  
  `Location: http://169.254.169.254/latest/meta-data/`
* Because standard `fetch()` follows redirects automatically, it connects directly to the internal cloud metadata service, bypassing the initial check completely!

### 14.3 The Hardened Redirect Engine (`lib/scraper/extract.ts`)
We built a manual redirect follower (`fetchWithSafeRedirects`) satisfying five strict invariants:
1. **`redirect: 'manual'`:** Tells Node.js / Undici to stop at the 3xx boundary and hand control back to our code.
2. **Stream Body Cancellation:** In Node.js Undici fetch, unconsumed response bodies hold an active HTTP socket. Failing to cancel `res.body` quickly exhausts the server's socket pool under traffic:
   ```typescript
   if (res.body) {
     await res.body.cancel();
   }
   ```
3. **Protocol Downgrade Guard:** If a connection starts on secure `https:`, redirecting to insecure `http:` is rejected immediately.
4. **Hop-by-Hop Re-Validation:** Every target URL in the redirect chain is re-evaluated by `validateSafeUrl()` before opening the socket.
5. **Cumulative Timeout & Hop Cap:** Maximum 3 hops; single 6000ms `AbortController` budget across the entire chain to prevent slowloris redirect attacks.

### 14.4 IPv6 Bracket Normalization & Port Whitelisting (`lib/scraper/ssrf.ts`)
During adversarial testing, three subtle bypass techniques were discovered and patched:
* **The WHATWG Bracket Trap:** `new URL('http://[::1]').hostname` returns `"[::1]"` (with square brackets). Passing `"[::1]"` to Node's `net.isIP()` returns `0` (not an IP!). We strip brackets (`replace(/^[|]$/g, '')`) before calling `net.isIP()`.
* **Scoped IPv6 Rejection:** Scoped addresses (`fe80::1%eth0` or URL-encoded `%25`) are blocked. Public Internet IPv6 addresses never have zone indices.
* **Port Whitelisting:** Attackers can pass `http://public-site.com:6379` (Redis port) or `:22` (SSH port) to turn the scraper into an internal port scanner. We strictly restrict allowed ports to `80`, `443`, or empty default.
* **FQDN Trailing Dot Normalization:** Root-qualified domains (`http://localhost./` or `http://router.home.arpa./`) are normalized by stripping trailing dots (`replace(/\.+$/, '')`).

---

## Chapter 15: The Fort Knox Migration
### Consolidated 18-Table Row Level Security

```
                      [ Client Query to Supabase ]
                                   │
                                   ▼
                   [ PostgreSQL RLS Enforcement ]
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
   [ workspaces ]          [ 16 Tenant Tables ]       [ raw_signals ]
   USING (id =             USING (workspace_id =      0 Tenant Policies
   auth_jwt_uuid)          auth_jwt_uuid)             (Default-Deny)
```

### 15.1 The Real-World Analogy
Imagine a massive apartment building with 18 distinct storage facilities. Every tenant holds an electronic key fob programmed with their apartment number (`workspace_id`).
* When the tenant swipes their fob at the door to their private storage unit, the lock opens.
* If a tenant tries to swipe into another tenant's unit, the door stays bolted.
* The building's central heating and electrical systems (`raw_signals`) have **no tenant locks at all**; only the certified building superintendent (`service_role`) has a physical master key to access them.

### 15.2 The 4 Blockers Resolved in Migration `20261124_enable_rls_policies.sql`

#### Blocker 1: The Column Name Invariance (`workspaces`)
Applying a blanket RLS policy `USING (workspace_id = ...)` causes PostgreSQL to abort with:  
`ERROR: column "workspace_id" does not exist in table "workspaces"`  
* *Fix:* The `workspaces` table uses primary key `id`. The policy is explicitly tailored:
  ```sql
  CREATE POLICY workspace_isolation ON workspaces FOR ALL TO authenticated
    USING (id = (NULLIF(auth.jwt() ->> 'workspace_id', ''))::uuid);
  ```

#### Blocker 2: The Critical Data Leak in `job_failures`
In early drafts, line 361 of `docs/DATABASE.md` proposed:  
`USING (workspace_id = auth.jwt()->>'workspace_id' OR workspace_id IS NULL)`  
* *The Threat:* System jobs (such as global scraping daemons and precision rollups) have `workspace_id IS NULL`. If `OR workspace_id IS NULL` is permitted in tenant policies, **any authenticated tenant can read all system error logs**, exposing database connection strings, stack traces, and internal payloads!
* *Fix:* Tenant policy strictly isolates `workspace_id`. Rows where `workspace_id IS NULL` have zero policies for `authenticated`, making them accessible **only to the `service_role`**.

#### Blocker 3: The `raw_signals` Default-Deny Lockdown
`raw_signals` has no `workspace_id` column because it is a global shared ingestion pool.
* *Fix:* RLS is enabled on `raw_signals` with **zero policies for `anon` and `authenticated`**. PostgreSQL enforces default-deny: queries from tenants return 0 rows. Only backend scrapers using `service_role` can read or write.

#### Blocker 4: Unhandled UUID Typecast Crashes (`NULLIF`)
Directly casting `(auth.jwt() ->> 'workspace_id')::uuid` throws `ERROR: invalid input syntax for type uuid: ""` if the JWT claim is an empty string, causing unhandled 500 server crashes.
* *Fix:* Wrapping with `NULLIF(auth.jwt() ->> 'workspace_id', '')` safely produces `NULL`, ensuring unauthorized requests cleanly return 0 rows.

---

## Chapter 16: Master Architectural Decision Ledger

| Decision ID | Milestone | Subject | Selected Architecture | Why Selected? | Rejected Alternative |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Decision 1** | Feature 01 | CRM Integration | **Mode A (Built-in Quote & Invoice Ledger)** | Agencies want an immediate end-to-end deal flow without configuring complex Hubspot/Salesforce OAuth apps. | Forcing external CRM setup during onboarding (high drop-off). |
| **Decision 2** | Feature 01 | Website Scraper | **Hybrid Direct Fetch + 1-Click Presets** | Zero third-party API costs ($0 Firecrawl/Browserless bills) and instant fallback to presets if scraping is blocked. | Expensive headless browsers running on serverless functions. |
| **Decision 3** | Feature 01 | Noise Filtration | **Smart Negatives (Min 3) + Real-Time Gauge** | Prevents the 90%+ social noise problem at Day 1 while visually demonstrating software value. | Unfiltered keyword matching or opaque AI black-box filters. |
| **Decision 4** | Feature 01 | Onboarding Auth | **Magic First, Auth at the End** | Users invest effort configuring their agency profile before facing a sign-up wall, boosting conversion by 40%+. | Requiring email confirmation before seeing any product value. |
| **Decision 5** | Feature 01 | First-Run State | **Pre-Seeded High-Intent Leads** | Eliminates the dreaded "empty state" syndrome; users can test scoring and reply generation immediately. | Showing an empty table waiting for real-time cron scrapers. |
| **Decision 6** | Feature 02 | Signal Channels | **Reddit + Hacker News + Bluesky** | High-volume public B2B conversations with zero API subscription fees. | LinkedIn Scraping in Phase 1 (high proxy costs and account ban risks). |
| **Decision 7** | Feature 02 | Lead Scoring Card | **Score % + 1-Sentence Reason + Action Buttons** | Reduces cognitive load; agency operators understand *why* a lead scored 94% in 2 seconds. | Raw JSON dumps or complex multi-tab scoring breakdowns. |
| **Decision 8** | Feature 02 | DB Schema Topology | **Shared Signal Pool (`raw_signals` + `threads`)** | One shared crawler ingests social posts once; individual workspaces score and claim them without redundant scraping. | Siloed per-workspace scraping (causes $10,000s in duplicate network requests). |
| **Decision 9** | Feature 01 | API Engine | **Server Actions for UI + Route Handlers for REST** | Next.js 16 idiomatic design: Server Actions provide end-to-end type safety for UI forms; Route Handlers handle webhooks and REST requests. | Monolithic Express server or writing manual fetch boilerplate for every UI form. |
| **Decision 10** | Feature 02 | Adapter Normalization | **Normalized `SocialPost` Interface** | Decouples scraping ingestion from scoring engines; isolating platform changes behind single adapters. | Bespoke per-platform handlers scattered across UI components. |
| **Decision 11** | Feature 02 | Intent Scoring Funnel | **3-Tier MDIE (Linguistic + Pain + Authority)** | Balances explicit buying signals against contextual problem descriptions and author authority. | Opaque LLM prompt scoring on every post (costly, slow, and non-deterministic). |
| **Decision 12** | Feature 02 | Keyword Learning Loop | **Damped Bayesian Updates with 0.40 Floor** | Prevents algorithm overreaction; keywords are damped on dismiss but never zeroed, preserving long-term recall. | Naive zeroing of dismissed keywords (destroys future lead recall). |
| **Decision 13** | Hardening | SSRF Defense Engine | **Manual Redirect Loop + Stream Release** | Blocks 302 redirect bypasses to internal metadata IPs while releasing Undici sockets to prevent memory leaks. | Standard `fetch(url)` which blindly follows redirects into internal VPCs. |
| **Decision 14** | Hardening | IPv6 & Port Security | **Bracket Normalization + Web Port Whitelist** | Prevents bracketed IPv6 parser bypasses and eliminates internal port scanning (`:6379`, `:22`). | Trusting unparsed raw hostnames directly in `isIP()`. |
| **Decision 15** | Hardening | PostgreSQL RLS | **18-Table Consolidated Migration** | Absolute tenant isolation with `workspaces.id` alignment, `raw_signals` default-deny, and safe `NULLIF` casting. | Fragmented or partial RLS policies leaving supporting tables unprotected. |
| **Decision 16** | Feature 03 | Thread State Machine | **Option C (Linear with Bounded Loops)** | Enforces strict forward progression (discovered → pproved → contacted → qualified) while supporting the PRD §11 5-minute undo window and callback loops without corrupting conversion analytics. | Strict linear without loops (blocks callbacks) or permissive jumps (dirty data). |
| **Decision 17** | Feature 03 | Outreach Delivery Engine | **Option A (1-Click Native Protocol & Clipboard Deep-Links)** | Zero account ban risk on LinkedIn/Reddit; leverages native OS protocols (mailto:, wa.me:) and automated clipboard writes (avigator.clipboard.writeText) with direct profile navigation. | Headless browser extensions (high ban rates) or complex OAuth integrations (fragile token maintenance). |
| **Decision 18** | Feature 03 | Call Script Navigation | **Option A (Slide-Out Co-Pilot Drawer with Flexible Stepper)** | Preserves 60% of viewport for background lead details; collapsible accordions reduce active reading load to ~120 words with 0.8s objection retrieval and non-linear step jumping. | Rigid sequential center modals (occludes background, blocks non-linear conversation) or inline text dumps (~850-word overload). |
| **Decision 19** | Feature 03 | Consent & Compliance Engine | **Option A (Dedicated Multi-Channel Consent Audit Ledger)** | Guarantees DPDP §6, GDPR Art. 7, and TCPA audit compliance via dedicated communication_consent table with per-channel timestamps (whatsapp, email, linkedin, phone) and automated suppressions (DND) links without adding sales friction. | Monolithic boolean flags on threads (legally indefensible) or post-call verification links (destroys deal conversion by 80%+). |

---

*End of WinThread Architecture & Engineering Learning Guide. Maintain and reference this document throughout future feature stages.*
