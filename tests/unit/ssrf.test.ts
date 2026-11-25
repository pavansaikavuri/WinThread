import { describe, it, expect } from 'vitest';
import { isPrivateIP, validateSafeUrl } from '@/lib/scraper/ssrf';

describe('isPrivateIP', () => {
  // IPv4 private/reserved ranges - should all return true (blocked)
  it.each([
    // Loopback
    '127.0.0.1',
    '127.255.255.255',
    // RFC 1918 - 10.0.0.0/8
    '10.0.0.1',
    '10.255.255.255',
    // RFC 6598 - 100.64.0.0/10 (CGNAT)
    '100.64.0.1',
    '100.127.255.255',
    // RFC 3927 - 169.254.0.0/16 (Link-local + cloud metadata)
    '169.254.0.1',
    '169.254.169.254',
    '169.254.255.255',
    // RFC 1918 - 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
    '172.16.0.1',
    '172.31.255.255',
    // RFC 1918 - 192.168.0.0/16
    '192.168.0.1',
    '192.168.255.255',
    // 0.0.0.0/8 - "this" network
    '0.0.0.1',
    '0.255.255.255',
    // Multicast 224.0.0.0/4
    '224.0.0.1',
    '239.255.255.255',
    // Reserved 240.0.0.0/4
    '240.0.0.1',
    '255.255.255.255',
    // TEST-NET ranges
    '192.0.2.1',
    '198.51.100.1',
    '203.0.113.1',
    // IPv4-mapped IPv6
    '::ffff:127.0.0.1',
    '::ffff:10.0.0.1',
    '::ffff:169.254.169.254',
  ])('blocks private IPv4: %s', (ip) => {
    expect(isPrivateIP(ip)).toBe(true);
  });

  // IPv6 private/reserved ranges
  it.each([
    '::1',
    '::',
    'fc00::1',
    'fd00::1',
    'fe80::1',
    'fe80::ffff',
    'ff00::1',
    'ff02::1',
    '2001:db8::1',
    '2001:10::1',
    '2001:20::1',
  ])('blocks private IPv6: %s', (ip) => {
    expect(isPrivateIP(ip)).toBe(true);
  });

  // Public IPs - should all return false (allowed)
  it.each([
    '8.8.8.8',
    '1.1.1.1',
    '1.0.0.1',
    '9.9.9.9',
    '208.67.222.222',
    '172.15.0.1',  // Just outside 172.16/12
    '172.32.0.1',  // Just outside 172.16/12
    '192.167.0.1', // Just outside 192.168/16
    '192.169.0.1', // Just outside 192.168/16
    '100.63.255.255', // Just outside 100.64/10
    '100.128.0.1', // Just outside 100.64/10
  ])('allows public IPv4: %s', (ip) => {
    expect(isPrivateIP(ip)).toBe(false);
  });

  // Public IPv6
  it.each([
    '2001:4860:4860::8888', // Google DNS
    '2606:4700:4700::1111', // Cloudflare DNS
    '2001:4860:4860::8844', // Google DNS secondary
  ])('allows public IPv6: %s', (ip) => {
    expect(isPrivateIP(ip)).toBe(false);
  });
});

describe('validateSafeUrl', () => {
  it('rejects non-http/https protocols', async () => {
    const result = await validateSafeUrl('ftp://example.com');
    expect(result.safe).toBe(false);
    expect(result.error).toContain('http');
  });

  it('rejects localhost hostname', async () => {
    const result = await validateSafeUrl('http://localhost:3000');
    expect(result.safe).toBe(false);
    expect(result.error).toContain('private');
  });

  it('rejects .local TLD', async () => {
    const result = await validateSafeUrl('http://myhost.local');
    expect(result.safe).toBe(false);
    expect(result.error).toContain('private');
  });

  it('rejects .internal TLD', async () => {
    const result = await validateSafeUrl('http://service.internal');
    expect(result.safe).toBe(false);
    expect(result.error).toContain('private');
  });

  it('rejects .lan TLD', async () => {
    const result = await validateSafeUrl('http://printer.lan');
    expect(result.safe).toBe(false);
    expect(result.error).toContain('private');
  });

  it('rejects .localhost TLD', async () => {
    const result = await validateSafeUrl('http://test.localhost');
    expect(result.safe).toBe(false);
    expect(result.error).toContain('private');
  });

  it('rejects literal private IPv4', async () => {
    const result = await validateSafeUrl('http://127.0.0.1');
    expect(result.safe).toBe(false);
    expect(result.error).toContain('private');
  });

  it('rejects literal private IPv6', async () => {
    const result = await validateSafeUrl('http://[::1]');
    expect(result.safe).toBe(false);
    expect(result.error).toContain('private');
  });

  it('rejects cloud metadata IP', async () => {
    const result = await validateSafeUrl('http://169.254.169.254');
    expect(result.safe).toBe(false);
    expect(result.error).toContain('private');
  });

  it('allows public domain (requires DNS)', async () => {
    // This will do real DNS lookup - google.com should resolve to public IPs
    const result = await validateSafeUrl('https://google.com');
    expect(result.safe).toBe(true);
  });

  it('allows public IP', async () => {
    const result = await validateSafeUrl('http://8.8.8.8');
    expect(result.safe).toBe(true);
  });

  it('rejects invalid URL format', async () => {
    const result = await validateSafeUrl('not-a-url');
    expect(result.safe).toBe(false);
    expect(result.error).toContain('Invalid');
  });

  // Security Hardening: EGM-SYNTH-001 tests
  it('rejects non-standard destination ports', async () => {
    const r1 = await validateSafeUrl('http://google.com:6379');
    expect(r1.safe).toBe(false);
    expect(r1.error).toContain('port');

    const r2 = await validateSafeUrl('https://google.com:22');
    expect(r2.safe).toBe(false);
    expect(r2.error).toContain('port');

    const r3 = await validateSafeUrl('https://google.com:5432');
    expect(r3.safe).toBe(false);
    expect(r3.error).toContain('port');
  });

  it('allows standard destination ports 80 and 443', async () => {
    const r1 = await validateSafeUrl('http://8.8.8.8:80');
    expect(r1.safe).toBe(true);

    const r2 = await validateSafeUrl('https://1.1.1.1:443');
    expect(r2.safe).toBe(true);
  });

  it('rejects single-label internal hostnames', async () => {
    const r1 = await validateSafeUrl('http://metadata/computeMetadata/v1/');
    expect(r1.safe).toBe(false);
    expect(r1.error).toContain('Single-label');

    const r2 = await validateSafeUrl('http://redis:6379');
    expect(r2.safe).toBe(false);
  });

  it('rejects scoped IPv6 addresses with zone indices', async () => {
    const r1 = await validateSafeUrl('http://[fe80::1%eth0]/');
    expect(r1.safe).toBe(false);
    expect(r1.error).toContain('zone indices');

    const r2 = await validateSafeUrl('http://[fe80::1%25eth0]/');
    expect(r2.safe).toBe(false);
    expect(r2.error).toContain('zone indices');
  });

  it('rejects .home.arpa and .arpa apex and subdomains', async () => {
    const r1 = await validateSafeUrl('http://home.arpa/');
    expect(r1.safe).toBe(false);
    expect(r1.error).toContain('reserved TLDs');

    const r2 = await validateSafeUrl('http://router.home.arpa/');
    expect(r2.safe).toBe(false);
    expect(r2.error).toContain('reserved TLDs');

    const r3 = await validateSafeUrl('http://gateway.arpa/');
    expect(r3.safe).toBe(false);
    expect(r3.error).toContain('reserved TLDs');
  });

  it('normalizes trailing root dots in FQDNs and blocks them', async () => {
    const r1 = await validateSafeUrl('http://localhost./');
    expect(r1.safe).toBe(false);
    expect(r1.error).toContain('local network');

    const r2 = await validateSafeUrl('http://router.home.arpa./');
    expect(r2.safe).toBe(false);
    expect(r2.error).toContain('reserved TLDs');
  });
});