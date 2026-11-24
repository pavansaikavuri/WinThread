import { SupportedChannel } from '@/lib/constants/channels';

export interface ICPCriteria {
  services: string[];
  buyerTitles: string[];
  painPoints: string[];
  buyingSignals: string[];
  negativeKeywords: string[];
}

export interface MDIEResult {
  baseScore: number;
  matchScore: number;
  matchReason: string;
  isFiltered: boolean;
  filterReason?: string;
  matchedKeywords: string[];
}

export function calculateMDIE(
  post: { title: string; content: string; author: string; source: SupportedChannel },
  icp: ICPCriteria,
  weights?: { sourceWeight: number; keywordWeights: Record<string, number> }
): MDIEResult {
  const fullText = `${post.title} ${post.content}`.toLowerCase();
  const words = fullText.split(/\s+/).filter(Boolean);

  // 1. TIER 1: Lexical Negative Gate
  for (const neg of icp.negativeKeywords) {
    if (fullText.includes(neg.toLowerCase())) {
      return {
        baseScore: 0,
        matchScore: 0,
        matchReason: 'Filtered out: contains exclusion keyword',
        isFiltered: true,
        filterReason: `Negative keyword: "${neg}"`,
        matchedKeywords: [],
      };
    }
  }

  // Buying signal detection
  const matchedSignals = icp.buyingSignals.filter(sig => fullText.includes(sig.toLowerCase()));
  const hasStrongIntentVerb = matchedSignals.length > 0 || /(looking for|need|hire|recommend|alternative to)/i.test(fullText);

  // Word count check: only drop <15 words if NO strong buying signal verb is present
  if (words.length < 15 && !hasStrongIntentVerb) {
    return {
      baseScore: 0,
      matchScore: 0,
      matchReason: 'Filtered out: post too brief',
      isFiltered: true,
      filterReason: 'Too short (<15 words without buying verb)',
      matchedKeywords: [],
    };
  }

  // 2. TIER 2: Multi-Dimensional Scoring
  // Intent Score (0-100)
  let intentScore = 20;
  if (/(switch from|leaving|alternative to)/i.test(fullText)) {
    intentScore = 100;
  } else if (
    matchedSignals.length > 0 ||
    /(looking for(\s+\w+)*\s+agency|hire|need(\s+\w+)*\s+agency|recommend(\s+\w+)*\s+agency)/i.test(fullText)
  ) {
    intentScore = 95;
  } else if (hasStrongIntentVerb) {
    intentScore = 80;
  }

  // Pain Match Score (0-100)
  const matchedPains = icp.painPoints.filter(p => fullText.includes(p.toLowerCase()));
  const matchedServices = icp.services.filter(s => fullText.includes(s.toLowerCase()));
  let painScore = 30;
  if (matchedPains.length > 0 || matchedServices.length > 0) {
    painScore = Math.min(100, 50 + (matchedPains.length * 25) + (matchedServices.length * 15));
  }

  // Authority Score (0-100)
  const authorAndText = `${post.author} ${fullText}`.toLowerCase();
  const matchedTitles = icp.buyerTitles.filter(t => authorAndText.includes(t.toLowerCase()));
  const hasAuthorityPhrase = /(our company|my team|we have budget|our budget|client calls|our saas|our b2b)/i.test(fullText);
  let authorityScore = 0;
  if (matchedTitles.length > 0) authorityScore = 100;
  else if (hasAuthorityPhrase) authorityScore = 80;

  // Dynamic Re-Normalization (Hostile Review Fix #3)
  // If no authority title or phrasing detected, redistribute 25% weight to Intent (0.55) & Pain (0.45)
  let baseScore: number;
  if (authorityScore > 0) {
    baseScore = Math.round((0.40 * intentScore) + (0.35 * painScore) + (0.25 * authorityScore));
  } else {
    baseScore = Math.round((0.55 * intentScore) + (0.45 * painScore));
  }

  // 3. TIER 3: Bayesian Multipliers
  const srcWeight = weights?.sourceWeight ?? 1.0;
  const kwWeights = weights?.keywordWeights ?? {};
  
  // Safe max over keyword weights with 1.0 fallback (Hostile Review Fix #4)
  const matchedKwValues = matchedSignals.map(sig => kwWeights[sig] ?? 1.0);
  const maxKwWeight = matchedKwValues.length > 0 ? Math.max(...matchedKwValues) : 1.0;

  const finalMatchScore = Math.min(99, Math.round(baseScore * srcWeight * maxKwWeight));

  // Synthesize concise 1-sentence match reason
  let matchReason = 'General prospect discussion matching service domain.';
  if (matchedSignals.length > 0) {
    matchReason = `Prospect expresses explicit buying signal for "${matchedSignals[0]}" and relates to ${matchedPains[0] || 'agency services'}.`;
  } else if (intentScore >= 80) {
    matchReason = 'Prospect actively seeking tool or agency recommendation to resolve workflow bottleneck.';
  }

  return {
    baseScore,
    matchScore: finalMatchScore,
    matchReason,
    isFiltered: finalMatchScore < 50,
    matchedKeywords: matchedSignals,
  };
}
