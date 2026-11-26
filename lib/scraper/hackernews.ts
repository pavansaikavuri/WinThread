import { SupportedChannel } from '@/lib/constants/channels';

export interface RawSignalPayload {
  source: SupportedChannel;
  external_id: string;
  title: string;
  content: string;
  author: string;
  thread_url: string;
  published_at: string;
}

function stripHtml(input: string): string {
  let previous = '';
  let current = input;
  while (current !== previous) {
    previous = current;
    current = current.replace(/<[^>]*>/g, '');
  }
  return current;
}

export async function fetchHackerNewsSignals(query: string, limit = 20): Promise<RawSignalPayload[]> {
  try {
    const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=(story,comment)&hitsPerPage=${limit}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'WinThread/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits || []).map((hit: any) => {
      const text = hit.comment_text || hit.story_text || hit.story_title || '';
      const rawId = String(hit.objectID || '');
      const external_id = rawId.startsWith('hn-') ? rawId : `hn-${rawId}`;
      return {
        source: 'hackernews' as SupportedChannel,
        external_id,
        title: hit.story_title || text.slice(0, 80),
        content: stripHtml(text), // safely strip HTML tags from HN comments
        author: hit.author || 'anonymous',
        thread_url: `https://news.ycombinator.com/item?id=${rawId.replace(/^hn-/, '')}`,
        published_at: hit.created_at_i ? new Date(hit.created_at_i * 1000).toISOString() : new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}
