import { promises as dns } from 'dns';
import { isIP } from 'net';

/**
 * Check if an IP address is private, reserved, or otherwise unsafe for outbound requests.
 * Blocks all RFC1918, RFC6598, RFC3927, loopback, multicast, and documentation ranges.
 * Also blocks IPv6 ULA, link-local, and IPv4-mapped IPv6 addresses.
 */
export function isPrivateIP(ip: string): boolean {
  // Normalize IPv6 (handle ::ffff: prefix for IPv4-mapped)
  let normalizedIp = ip;
  const ipv4MappedMatch = ip.match(/^::ffff:(.+)$/i);
  if (ipv4MappedMatch) {
    normalizedIp = ipv4MappedMatch[1];
  }

  const version = isIP(normalizedIp);
  if (version === 4) {
    return isPrivateIPv4(normalizedIp);
  } else if (version === 6) {
    return isPrivateIPv6(normalizedIp);
  }
  // Unknown format - treat as unsafe
  return true;
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => p < 0 || p > 255)) return true;

  const [a, b, c, d] = parts;
  // Use unsigned 32-bit comparison to avoid sign issues
  const val = ((a * 256 + b) * 256 + c) * 256 + d;

  // 0.0.0.0/8 - "this" network (RFC 1122)
  if ((val >>> 24) === 0x00) return true;
  // 10.0.0.0/8 - Private (RFC 1918)
  if ((val >>> 24) === 0x0a) return true;
  // 100.64.0.0/10 - CGNAT (RFC 6598) - 100.64.0.0 to 100.127.255.255
  if ((val >>> 22) === 0x191) return true; // 100.64 = 0x6440, >> 22 = 0x191
  // 127.0.0.0/8 - Loopback (RFC 1122)
  if ((val >>> 24) === 0x7f) return true;
  // 169.254.0.0/16 - Link-local (RFC 3927) - includes AWS/GCP/Azure metadata
  if ((val >>> 16) === 0xa9fe) return true;
  // 172.16.0.0/12 - Private (RFC 1918) - 172.16.0.0 to 172.31.255.255
  if ((val >>> 20) === 0xac1) return true; // 172.16 = 0xac10, >> 20 = 0xac1
  // 192.168.0.0/16 - Private (RFC 1918)
  if ((val >>> 16) === 0xc0a8) return true;
  // 224.0.0.0/4 - Multicast (RFC 3171)
  if ((val >>> 28) === 0x0e) return true;
  // 240.0.0.0/4 - Reserved (RFC 1112)
  if ((val >>> 28) === 0x0f) return true;
  // 192.0.0.0/24 - IETF Protocol Assignments (RFC 6890)
  if ((val >>> 8) === 0xc00000) return true;
  // 192.0.2.0/24 - TEST-NET-1 (RFC 5737)
  if ((val >>> 8) === 0xc00002) return true;
  // 198.51.100.0/24 - TEST-NET-2 (RFC 5737)
  if ((val >>> 8) === 0xc63364) return true;
  // 203.0.113.0/24 - TEST-NET-3 (RFC 5737)
  if ((val >>> 8) === 0xcb0071) return true;

  return false;
}

function isPrivateIPv6(ip: string): boolean {
  // ::1/128 - Loopback
  if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') return true;
  // ::/128 - Unspecified
  if (ip === '::' || ip === '0:0:0:0:0:0:0:0') return true;
  // fc00::/7 - ULA (Unique Local Addresses, RFC 4193) - fc00:: to fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
  if (/^fc[0-9a-f]{0,3}:/i.test(ip) || /^fd[0-9a-f]{0,3}:/i.test(ip)) return true;
  // fe80::/10 - Link-local (RFC 4291) - fe80:: to febf:ffff:...
  if (/^fe[89ab][0-9a-f]{0,2}:/i.test(ip)) return true;
  // ff00::/8 - Multicast (RFC 4291)
  if (/^ff[0-9a-f]{0,2}:/i.test(ip)) return true;
  // ::ffff:0:0/96 - IPv4-mapped (handled by isPrivateIP normalization, but double-check)
  if (/^::ffff:/i.test(ip)) return true;
  // 2001:db8::/32 - Documentation (RFC 3849)
  if (/^2001:0?db8:/i.test(ip)) return true;
  // 2001:10::/28 - ORCHID (RFC 4843)
  if (/^2001:0?1[0-9a-f]{0,3}:/i.test(ip)) return true;
  // 2001:20::/28 - ORCHIDv2 (RFC 7343)
  if (/^2001:0?2[0-9a-f]{0,3}:/i.test(ip)) return true;

  return false;
}

/**
 * Validate a URL is safe for outbound HTTP requests.
 * - Enforces http/https only
 * - Blocks localhost and reserved TLDs (.local, .internal, .lan, .localhost)
 * - Resolves hostnames and checks all resolved IPs against isPrivateIP to prevent DNS rebinding
 * - Validates literal IP addresses directly
 */
export async function validateSafeUrl(rawUrl: string): Promise<{ safe: boolean; error?: string }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return { safe: false, error: 'Invalid URL format' };
  }

  // Only allow http/https
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { safe: false, error: 'Only http and https protocols are supported' };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Block reserved hostnames and TLDs
  const blockedHostnames = ['localhost'];
  const blockedTlds = ['.local', '.internal', '.lan', '.localhost'];
  if (blockedHostnames.includes(hostname) || blockedTlds.some(tld => hostname.endsWith(tld))) {
    return { safe: false, error: 'Access to private or local network hosts is prohibited' };
  }

  // If hostname is a literal IP, validate directly
  if (isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      return { safe: false, error: 'Access to private or reserved IP addresses is prohibited' };
    }
    return { safe: true };
  }

  // For domains, resolve DNS and check ALL resolved IPs to prevent DNS rebinding
  try {
    const resolved = await dns.lookup(hostname, { all: true, family: 0 });
    if (resolved.length === 0) {
      return { safe: false, error: 'Hostname could not be resolved' };
    }
    for (const entry of resolved) {
      if (isPrivateIP(entry.address)) {
        return { safe: false, error: 'Hostname resolves to private or reserved IP addresses' };
      }
    }
    return { safe: true };
  } catch {
    return { safe: false, error: 'DNS resolution failed' };
  }
}