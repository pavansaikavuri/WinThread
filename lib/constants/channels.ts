export const ALLOWED_CHANNELS = [
  'reddit',
  'hackernews',
  'bluesky',
  'linkedin',
  'twitter',
  'email',
  'other',
] as const;

export type SupportedChannel = (typeof ALLOWED_CHANNELS)[number];

export function isValidChannel(channel: string): channel is SupportedChannel {
  return ALLOWED_CHANNELS.includes(channel as SupportedChannel);
}
