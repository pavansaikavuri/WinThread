# The Master Landscape of AI Web Research, Scraping & Agent Intelligence

**Document Identifier:** RESEARCH-WEB-INTELLIGENCE-2026-11-27  
**Author:** Antigravity Architect & Multi-Agent Systems Researcher  
**Status:** Living Specification & Permanent Catalog  

---

## 1. Executive Taxonomy Matrix

This master matrix categorizes every major framework, tool, API, and MCP server across:
1. **License / Code Model:** Open-Source (FOSS) vs. Proprietary (Closed / SaaS).
2. **Access & Cost Model:** 
   - **Type A: 100% Free & Local** (No API keys required, runs on local CPU/Playwright/Network).
   - **Type B: Free Tier / Recurring Free Credits** (Generous monthly free tier without upfront credit card).
   - **Type C: BYOK (Bring Your Own Key)** (Requires user to supply their own LLM API key or provider token).
   - **Type D: Commercial / Enterprise Only** (Paid subscription or credit-card required).

| Tool / Platform | Category | Open Source? | Cost & Access Model | Free Tier / Credits Details | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Crawl4AI** | Scraper / Crawler | **Yes** (Apache 2.0) | **Type A & C** (Local/BYOK) | **100% Free** (Self-hosted Python/Playwright). Optional LLM extraction via your own local Ollama or OpenAI key. | High-speed LLM-ready markdown crawling, token reduction, and schema extraction. |
| **ScrapeGraphAI** | Scraper / Agent | **Yes** (MIT) | **Type A & C** (Local/BYOK) | **100% Free** library. Requires BYOK (Ollama, Gemini, Groq, OpenAI) for schema extraction. | Prompt-to-schema scraping without writing CSS/XPath selectors. |
| **last30days-skill** | Agent Skill / Search | **Yes** (MIT) | **Type A & C** (Hybrid) | **100% Free** out-of-the-box for Reddit, Hacker News, Polymarket, GitHub, YouTube transcripts. Optional BYOK for X/TikTok. | Real-time social sentiment and community discussions strictly within the last 30 days. |
| **Agent-Reach** | Agent CLI / Bridge | **Yes** (MIT) | **Type A** (100% Free) | **100% Free**. Zero API fees. Uses local scrapers + Jina Reader for YouTube, Bilibili, Reddit, V2EX, GitHub. | Command-line bridge giving AI coding agents instant access to public social platforms. |
| **Browser-Use** | Browser Agent | **Yes** (MIT) | **Type A & C** (Local/BYOK) | **100% Free** core library. Runs local Chrome via Playwright. Uses BYOK for vision LLM (Claude 3.5 Sonnet / GPT-4o / local VLM). | Autonomous visual navigation, multi-step clicking, form completion, and web workflows. |
| **Stagehand** | Browser Automation | **Yes** (MIT) | **Type A & C** (Local/BYOK) | **100% Free** TypeScript library. Runs on local Playwright. Uses BYOK for LLM calls (`page.act()`, `page.extract()`). Optional paid Browserbase cloud. | Resilient, self-healing browser automation scripts that adapt to DOM/CSS changes. |
| **Midscene.js** | Visual Automation | **Yes** (MIT) | **Type A & C** (Local/BYOK) | **100% Free** (ByteDance). Uses BYOK for multimodal LLMs. Chrome extension available. | Natural-language UI testing and element interaction via visual AI. |
| **Stanford STORM** | Deep Research Agent | **Yes** (MIT) | **Type C** (BYOK) | **100% Free** codebase. Requires BYOK for LLM (OpenAI, Anthropic, Gemini) + Search API (Brave, Bing, You.com). | Wikipedia-grade, multi-perspective cited research papers and domain outlines. |
| **GPT Researcher** | Deep Research Agent | **Yes** (Apache 2.0) | **Type C** (BYOK) | **100% Free** codebase. Requires BYOK for LLM + Search API (Tavily, DuckDuckGo, SearXNG, Google). | Fast, parallelized 2,000+ word cited research reports across web and local vector DBs. |
| **Open Deep Research** | Deep Research Agent | **Yes** (MIT) | **Type C** (BYOK) | **100% Free** (LangGraph). Requires BYOK for LLM + Search API (Tavily, Exa, Perplexity). | Open-source modular replication of OpenAI Deep Research with native MCP support. |
| **PaperQA2** | Academic Literature | **Yes** (Apache 2.0) | **Type C** (BYOK) | **100% Free** (FutureHouse). Requires BYOK for LLM embeddings and generation. | Superhuman citation accuracy over academic papers and complex technical PDFs. |
| **Vane (Perplexica)** | Search Engine | **Yes** (MIT) | **Type A & C** (Local/BYOK) | **100% Free**. Self-hosted Docker. Can run 100% free with local Ollama + SearXNG. | Self-hosted Perplexity alternative with citation graphs and local model privacy. |
| **Spider (Spider.cloud)**| Crawler / Scraper | **Yes** (Core MIT) / Cloud SaaS | **Type A (FOSS) & B (Cloud)** | Open-source core is **100% Free**. Cloud API has a **free tier** (~10,000 pages free upon signup). | World's fastest Rust crawler (20,000+ pages/sec) for RAG and mass data extraction. |
| **Steel.dev** | Cloud Browser Infra | **Yes** (Open Core) / Cloud SaaS | **Type B & D** | Open-source self-hosted Docker is free. Cloud offers **free starter credits** ($5–$10 credit) for agent browser sessions. | Managed anti-detect headless browser fleet with session recording and proxying. |
| **Skyvern** | Visual LAM Agent | **Yes** (AGPL 3.0) / Cloud SaaS | **Type A (Local) & B (Cloud)** | Open-source local execution is free. Cloud SaaS provides initial trial credits. | Automating legacy anti-bot enterprise websites lacking public APIs via computer vision. |
| **Jina Reader (`r.jina.ai`)**| Web Reader / Parser | Open API / Cloud | **Type B** (Generous Free) | **Free without API key** for reasonable rate limits (prepend `https://r.jina.ai/`). 1M free tokens/mo with free key. | Universal URL-to-clean-Markdown proxy; bypasses cookie banners and paywalls. |
| **Tavily** | Agent Search API | Proprietary SaaS | **Type B** (Recurring Free) | **1,000 free searches per month** (no credit card required). Official MCP server available. | The default search engine for AI agents (LangChain, AutoGen); removes boilerplate text. |
| **Exa (formerly Metaphor)**| Neural Search API | Proprietary SaaS | **Type B** (Free Credits) | **$10 in free credits** (approx. 1,000 searches) upon sign-up. Official MCP server available. | Semantic neural search by meaning; finds niche developer blogs, research, and company profiles. |
| **Octen (octen.ai)** | AI Search Infra | Proprietary SaaS | **Type B & D** (Free Trial) | **Free developer trial credits** on sign-up. High-throughput per-call or flat rate for scale. | Ultra-low latency (10–60ms) generative retrieval and structured entity extraction for agents. |
| **TinyFish (tinyfish.ai)**| Web Agent OS | Proprietary SaaS | **Type B & D** (Free Credits) | **Free starter tier / developer credits**. Enterprise plans for high-concurrency browser fleets. | Goal-based autonomous web agents with built-in Cloudflare bypass, credential vaults, and session persistence. |
| **Brave Search API** | Web Search API | Proprietary SaaS | **Type B** (Generous Free) | **Free Tier:** 2,000 queries per month free. Official Brave Search MCP server available. | Independent, privacy-first web index with zero tracking or Google/Bing bias. |
| **Apify** | Scraping Marketplace | Proprietary SaaS / Open Actors | **Type B** (Recurring Free) | **$5 free monthly recurring credit** on free plan. Official Apify MCP server available. | 2,000+ ready-made scraping actors (LinkedIn company scraper, Google Maps, Twitter/X, Reddit). |
| **Bright Data** | Enterprise Proxy/Scraper | Proprietary SaaS | **Type B & D** (Free Trial) | **Free trial credits** upon sign-up. Pay-as-you-go proxy and unlocking fees. MCP server available. | Enterprise scraping browser, automatic CAPTCHA solving, and Cloudflare Turnstile bypass. |
| **Diffbot** | Knowledge Graph API | Proprietary SaaS | **Type B (Trial) / D** | **14-day free trial**. High entry cost ($299/mo standard plan). | Enterprise-grade automatic webpage-to-entity knowledge graph extraction (articles, products, orgs). |
| **AgentQL** | Semantic Web Query | Proprietary SaaS / SDK | **Type B** (Free Tier) | **Free tier available** (up to a monthly quota of page queries). Python/JS SDKs. | AI-driven semantic DOM queries (`{ title, price }`) that do not break when HTML changes. |
| **PredictLeads** | B2B Signal Engine | Proprietary SaaS | **Type D** (Enterprise) | Paid enterprise API with custom demo trials. | Tracking company tech stack changes, job opening shifts, and executive hiring signals. |
| **The Org API** | Org Chart Intelligence | Proprietary SaaS | **Type B & D** | Free tier for basic lookups; developer API pricing for bulk org graph exports. | Mapping company executive hierarchies and reporting structures. |
| **Clay.com** | Waterfall Data Engine | Proprietary SaaS | **Type B & D** | **100 free credits** on sign-up. Tiered subscription for scale. | Waterfalling 50+ data providers (Apollo, Hunter, Clearbit, GitHub) with an AI web-scraping agent. |

---

## 2. Deep Profile: The 6 Highlighted Tools

### 2.1 Octen (`octen.ai`)
- **Status:** Proprietary AI Search Infrastructure (Cloud API).
- **Pricing:** Free developer trial credits upon sign-up; usage-based per-query pricing.
- **Architecture:** Octen is designed for high-concurrency AI agent search. Instead of using classical inverted indexes, it uses proprietary neural models (*Octen Pulse* and *Octen-WebGR*) that map natural language queries directly to URL identifiers with sub-60ms latencies.
- **Key Modules:**
  - `Octen Search`: Real-time web retrieval optimized for research agents.
  - `Octen Extract`: Converts web pages into LLM-ready markdown while contextually classifying sources (e.g., regulatory filings vs. blogs).
- **When to Use:** When an autonomous agent needs to execute 20–50 parallel searches in seconds without hitting rate limits or slow search engine latency.

### 2.2 TinyFish (`tinyfish.ai`)
- **Status:** Proprietary Enterprise Web Operating Layer (Cloud API / Hosted Agents).
- **Pricing:** Free starter tier / credits; paid usage-based plans.
- **Architecture:** An agentic web-automation platform built to replace brittle Playwright/Selenium scripts. Instead of coding selectors, developers pass natural language goals.
- **Key Modules:**
  - `TinyAgent`: Goal-based browser operator that handles pagination, complex multi-step forms, and dynamic SPAs.
  - `TinyBrowser`: High-scale managed cloud browser sessions with anti-detection capabilities.
  - `TinyVault` & `TinyProfiles`: Manages authenticated sessions and credentials so agents can work inside password-protected SaaS dashboards.
- **When to Use:** When you need an agent to interact with authenticated dashboards or complex checkout flows without maintaining browser infrastructure.

### 2.3 `mvanhorn/last30days-skill`
- **Status:** 100% Open-Source Agent Skill (GitHub: `mvanhorn/last30days-skill`).
- **Pricing:** **Completely Free** for core sources. Zero API keys required for Reddit, Hacker News, Polymarket, GitHub, and YouTube transcripts.
- **Architecture:** Operates on the thesis: *"Google aggregates editors. `/last30days` searches people."* It queries social platforms in parallel, filtering strictly to content posted within the last 30 days, weighting upvotes, likes, and betting stakes.
- **Supported Platforms:** Reddit, Hacker News, YouTube (via `yt-dlp`), GitHub, Polymarket, X/Twitter, TikTok, Instagram, Bluesky.
- **Installation:**
  ```bash
  npx skills add mvanhorn/last30days-skill -g
  ```
- **When to Use:** When researching user sentiment, market buzz, real complaints about competitors, or new software releases that occurred within the last month.

### 2.4 `Panniantong/Agent-Reach`
- **Status:** 100% Open-Source CLI & Capability Bridge (GitHub: `Panniantong/Agent-Reach`).
- **Pricing:** **100% Free**. Zero API fees. Operates locally using open-source scrapers and Jina Reader.
- **Architecture:** A unified bridge specifically engineered for AI coding agents (Claude Code, Cursor, Windsurf, Antigravity) to access public platforms that are normally locked behind logins or expensive APIs.
- **Channels Supported:** YouTube (transcripts), Bilibili, V2EX, GitHub, Reddit, Twitter/X, LinkedIn, Xiaohongshu, Boss Zhipin.
- **Key Command:** Standardized JSON CLI output with self-healing diagnostics (`agent-reach doctor`).
- **When to Use:** Giving terminal agents the ability to read social threads, YouTube videos, and platform profiles without paying for third-party scraping APIs.

### 2.5 Crawl4AI (`unclecode/crawl4ai`)
- **Status:** 100% Open-Source (Apache 2.0, GitHub: `unclecode/crawl4ai`).
- **Pricing:** **100% Free** (Self-hosted Python package).
- **Architecture:** The leading open-source web crawler for LLMs. Uses asynchronous Playwright, custom token fitters, cosine similarity chunking, and Pydantic schema extraction. Can be run entirely offline with local LLMs (Ollama) or wired to any commercial API.
- **Installation:**
  ```bash
  pip install crawl4ai
  crawl4ai-setup
  ```
- **When to Use:** Self-hosted documentation crawling, bulk site ingestion for RAG, and structured extraction without paying Firecrawl cloud fees.

### 2.6 ScrapeGraphAI (`ScrapeGraphAI/Scrapegraph-ai`)
- **Status:** 100% Open-Source (MIT, GitHub: `ScrapeGraphAI/Scrapegraph-ai`).
- **Pricing:** **100% Free** library. Requires BYOK for LLM calls (supports Ollama, Groq, Gemini, Anthropic, OpenAI).
- **Architecture:** Graph-based web scraping pipeline. Takes a URL and a natural language prompt, dynamically constructs a multi-node extraction graph, and returns structured JSON conforming to a Pydantic schema.
- **When to Use:** Ad-hoc extraction from diverse e-commerce, directory, or pricing pages without writing or maintaining CSS selectors.

---

## 3. Detailed Classification: Open-Source vs. Proprietary & Cost Tiers

### Group 1: 100% Free & Open-Source (Run Locally, Zero API Fees)
These tools cost nothing, run on your local machine, and do not require external API keys for core operation:
1. **Crawl4AI** (Python, Playwright-based crawler)
2. **Agent-Reach** (CLI bridge for AI agents to read social platforms)
3. **last30days-skill** (Zero-key community intelligence for Reddit, HN, GitHub, Polymarket)
4. **Spider Core** (Open-source Rust crawler)
5. **Vane / Perplexica** (Self-hosted search engine with Ollama + SearXNG)
6. **MarkItDown** (Microsoft's open-source file/web to Markdown converter)
7. **Trafilatura** (Python text & article extractor)
8. **Scrapling** (Already in your setup: anti-bot HTML parser)

### Group 2: Open-Source Frameworks with BYOK (Bring Your Own Key)
These frameworks provide open-source orchestration code, but require you to plug in your own LLM API key (or run a local model via Ollama) and an optional search provider:
1. **ScrapeGraphAI** (Requires LLM API key for graph reasoning)
2. **Browser-Use** (Requires multimodal vision LLM key: Claude 3.5 Sonnet or GPT-4o)
3. **Stagehand** (Requires LLM key for `page.act()` / `page.extract()`)
4. **Midscene.js** (Requires multimodal LLM key for visual testing)
5. **Stanford STORM** (Requires LLM key + Search API key like Brave or Bing)
6. **GPT Researcher** (Requires LLM key + Search API key like Tavily or DuckDuckGo)
7. **Open Deep Research** (Requires LLM key + LangGraph environment)
8. **PaperQA2** (Requires LLM key for citation verification)
9. **Skyvern Local** (Requires LLM/vision API key)

### Group 3: Proprietary Platforms with Generous Free Tiers / Credits
These cloud services are closed-source or SaaS, but provide recurring free credits or generous free quotas without requiring immediate payment:
1. **Jina Reader (`r.jina.ai`)**: Completely free for public URLs with no sign-up; 1,000,000 free tokens/month with free API key.
2. **Tavily Search**: **1,000 free searches/month** permanently.
3. **Brave Search API**: **2,000 free queries/month** permanently.
4. **Exa (Metaphor)**: **$10 in free credits** upon signup (~1,000 searches).
5. **Apify**: **$5 recurring monthly credit** (enough for hundreds of actor runs).
6. **Spider.cloud**: **10,000 pages free** on signup.
7. **Clay.com**: **100 free credits** on signup.
8. **AgentQL**: Free tier for individual developers.
9. **Octen.ai**: Free developer trial credits.
10. **TinyFish.ai**: Free developer starter tier.

### Group 4: Commercial / Enterprise Only (Paywall or High Entry Barrier)
These tools require paid subscriptions, custom contracts, or credit cards before use:
1. **Diffbot**: Enterprise pricing starting at $299/month.
2. **PredictLeads**: Enterprise-only sales intelligence API ($1,000+/mo).
3. **The Org API (Bulk)**: Commercial data licensing.
4. **Bright Data / Oxylabs (Heavy scale)**: Paid proxy and scraping bandwidth.
5. **Perplexity Pro / OpenAI Deep Research / Gemini Deep Research**: Consumer SaaS subscriptions ($20/mo to $200/yr).

---

## 4. Omission Audit: Why Specific Tools Were Excluded Previously

| Tool / Category | Status | Exact Technical, Legal, or Architectural Reason |
| :--- | :--- | :--- |
| **`mvanhorn/last30days-skill` & `Agent-Reach`** | Missed / Not Listed in Turn 1 | **Missed in initial synthesis.** These are community agent skills and CLI wrappers released recently in the agentic ecosystem. They are now fully indexed above. |
| **`octen.ai` & `tinyfish.ai`** | Missed / Not Listed in Turn 1 | **Missed in initial synthesis.** They are newer 2024/2025 agent-infrastructure startups that bridge cloud browsers and generative retrieval. They are now profiled above. |
| **Steel.dev** | Infrastructure Omission | Omitted because it provides cloud browser fleet hosting (remote Docker CDP sessions) rather than being a research or extraction agent. |
| **Midscene.js** | Specialized Tool Omission | Omitted previously because it is primarily focused on visual UI test automation (Playwright/Puppeteer assertions) rather than internet-scale data harvesting. |
| **Anthropic Computer Use API** | Environmental Omission | Requires a virtualized desktop OS environment (Docker container with X11 display) to send raw OS mouse/keyboard events; not a web extraction library. |
| **Perplexity / OpenAI / Gemini Deep Research** | Closed Consumer Excluded | Excluded because they are closed consumer web interfaces with no direct MCP server or open developer API. |
| **Proxycurl / Crustdata / People Data Labs** | Legal / ToS Risk Excluded | **Strictly excluded due to WinThread's legal boundary (Decision O1).** LinkedIn actively litigates scraping vendors and issues cease-and-desist orders. WinThread's PRD explicitly mandates: *"No LinkedIn scraping or automation; contact data = public extraction + user BYOK"*. Recommending scraping APIs that violate LinkedIn ToS breaches this invariant. |
| **Trafilatura & Scrapy** | Legacy Architecture Excluded | Excluded because they represent pre-LLM, rule-based extraction or manual selector maintenance (2015-era scraping). |

---

## 5. Strategic Recommendations for WinThread

To give WinThread maximum research and live-web capabilities without adding monthly subscription costs:

1. **Install `mvanhorn/last30days-skill` globally:**
   ```bash
   npx skills add mvanhorn/last30days-skill -g
   ```
   *Benefit:* Gives your Cockpit agents instant access to Reddit, Hacker News, YouTube, and Polymarket discussions strictly from the last 30 days with **zero API keys**.
2. **Add `Crawl4AI` locally for mass offline ingestion:**
   ```bash
   pip install crawl4ai
   crawl4ai-setup
   ```
   *Benefit:* Free, local, Playwright-based crawler that turns full websites into LLM-ready chunked Markdown at zero cost.
3. **Register for Tavily & Brave Search Free Tiers:**
   - Tavily (1,000 free searches/mo) + Brave (2,000 free searches/mo).
   - Plug their MCP servers (`tavily-mcp`, `brave-search-mcp`) into your Cockpit setup for instant, factual agentic search with no credit card required.
