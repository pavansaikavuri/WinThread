import { describe, it, expect } from 'vitest';
import { ALLOWED_CHANNELS, isValidChannel } from '@/lib/constants/channels';

describe('Channel Constraints & Schema Validation', () => {
  it('validates supported social channels including reddit, hackernews, and bluesky', () => {
    expect(isValidChannel('hackernews')).toBe(true);
    expect(isValidChannel('reddit')).toBe(true);
    expect(isValidChannel('bluesky')).toBe(true);
    expect(isValidChannel('linkedin')).toBe(true);
    expect(isValidChannel('unsupported_platform')).toBe(false);
  });

  it('contains exactly 7 supported channels', () => {
    expect(ALLOWED_CHANNELS).toHaveLength(7);
  });
});
