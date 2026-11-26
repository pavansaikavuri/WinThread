import { ICP_PRESETS, ICPPreset } from '@/lib/constants/icp-presets';
import { validateSafeUrl } from './ssrf';

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

const MAX_REDIRECTS = 3;
const CUMULATIVE_TIMEOUT_MS = 6000;
const USER_AGENT = 'Mozilla/5.0 (compatible; WinThreadBot/1.0; +https://winthread.app)';

/**
 * Perform safe HTTP GET requests with manual redirect handling and hop-by-hop SSRF validation.
 * - Enforces max 3 redirects.
 * - Re-validates every intermediate and final URL with validateSafeUrl().
 * - Rejects insecure protocol downgrades (HTTPS -> HTTP).
 * - Immediately cancels response body streams on 3xx redirects to prevent socket leaks.
 * - Enforces a single cumulative timeout budget across all hops.
 */
export async function fetchWithSafeRedirects(
  initialUrl: string,
  maxRedirects = MAX_REDIRECTS,
  timeoutMs = CUMULATIVE_TIMEOUT_MS
): Promise<{ text: string; finalUrl: string }> {
  let currentUrl = initialUrl;
  let hops = 0;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    while (true) {
      // 1. Re-validate every intermediate and final URL with deep DNS rebinding checks
      const validation = await validateSafeUrl(currentUrl);
      if (!validation.safe) {
        throw new Error(validation.error || 'Blocked by SSRF protection');
      }

      // Outbound request is strictly validated against private IPs, DNS rebinding, and standard web ports.
      // codeql[js/request-forgery]
      const res = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      // 2. Handle HTTP Redirects (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        // Critical: Release socket connection immediately
        if (res.body) {
          await res.body.cancel();
        }

        const location = res.headers.get('location');
        if (!location) {
          throw new Error(`Redirect ${res.status} missing Location header`);
        }

        hops++;
        if (hops > maxRedirects) {
          throw new Error(`Exceeded maximum redirect limit of ${maxRedirects}`);
        }

        // Resolve relative redirects against current hop URL
        const nextParsed = new URL(location, currentUrl);
        const currentParsed = new URL(currentUrl);

        // Disallow HTTPS -> HTTP protocol downgrade
        if (currentParsed.protocol === 'https:' && nextParsed.protocol === 'http:') {
          throw new Error('Insecure protocol downgrade (HTTPS to HTTP) prohibited');
        }

        currentUrl = nextParsed.href;
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const text = await res.text();
      return { text, finalUrl: currentUrl };
    }
  } finally {
    clearTimeout(timeoutId);
  }
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
    const { text: html, finalUrl } = await fetchWithSafeRedirects(url);

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    // Robust meta description (matches standard description, og:description, or twitter:description regardless of attribute order)
    const metaDescMatch = html.match(/<meta[^>]*(?:name|property)=["'](?:description|og:description|twitter:description)["'][^>]*content=["']([^"']+)["'][^>]*>/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["'](?:description|og:description|twitter:description)["'][^>]*>/i);

    const title = titleMatch ? titleMatch[1].trim() : '';
    const desc = metaDescMatch ? metaDescMatch[1].trim() : '';
    const parsedName = title.split(/[-–|]/)[0].trim() || extractDomainName(finalUrl);

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