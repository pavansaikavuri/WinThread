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
    // 1. Validate URL & Prevent SSRF (DNS rebinding protection + comprehensive private IP blocking)
    const validation = await validateSafeUrl(url);
    if (!validation.safe) {
      return { success: false, data: fallbackData, fallback: fallbackData, error: validation.error };
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