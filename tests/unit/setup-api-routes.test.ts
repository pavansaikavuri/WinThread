import { describe, it, expect } from 'vitest';
import { POST as extractHandler } from '@/app/api/setup/extract/route';

describe('/api/setup/extract route', () => {
  it('returns 400 when URL is missing', async () => {
    const req = new Request('http://localhost:3000/api/setup/extract', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await extractHandler(req);
    expect(res.status).toBe(400);
  });

  it('blocks private or SSRF addresses', async () => {
    const req = new Request('http://localhost:3000/api/setup/extract', {
      method: 'POST',
      body: JSON.stringify({ url: 'http://127.0.0.1:8080' }),
    });
    const res = await extractHandler(req);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('private or local network');
  });
});