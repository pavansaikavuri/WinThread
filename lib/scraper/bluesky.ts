import { RawSignalPayload } from './hackernews';
import { SupportedChannel } from '@/lib/constants/channels';

export async function fetchBlueskySignals(query: string, limit = 25): Promise<RawSignalPayload[]> {
  try {
    const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}&limit=${limit}&sort=latest`;
    const res = await fetch(url, { headers: { 'User-Agent': 'WinThread/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts || []).map((post: any) => {
      const rKey = post.uri ? post.uri.split('/').pop() : post.cid;
      const handle = post.author?.handle || 'bsky_user';
      return {
        source: 'bluesky' as SupportedChannel,
        external_id: `bsky-${rKey}`,
        title: (post.record?.text || '').slice(0, 80),
        content: post.record?.text || '',
        author: handle,
        thread_url: `https://bsky.app/profile/${handle}/post/${rKey}`,
        published_at: post.record?.createdAt || new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}
