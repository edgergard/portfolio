import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_PER_WINDOW, resetRateLimit } from '@/lib/rateLimit';
import { POST } from './route';

const VALID = { email: 'visitor@example.com', subject: 'Hello', message: 'Let us talk', company: '' };
const resend = vi.fn();

const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(new Request('https://site.test/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.4', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }));

describe('POST /api/contact', () => {
  beforeEach(() => {
    resetRateLimit();
    resend.mockReset();
    resend.mockResolvedValue(new Response('{"id":"x"}', { status: 200 }));
    vi.stubGlobal('fetch', resend);
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('CONTACT_TO_EMAIL', 'owner@example.com');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('mails a valid message through Resend with the visitor in Reply-To', async () => {
    const res = await post(VALID);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(resend).toHaveBeenCalledTimes(1);
    const [url, init] = resend.mock.calls[0];

    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer re_test' });
    expect(JSON.parse(init.body)).toEqual({
      from: 'Portfolio contact <onboarding@resend.dev>',
      to: ['owner@example.com'],
      reply_to: 'visitor@example.com',
      subject: 'Portfolio: Hello',
      text: 'From: visitor@example.com\n\nLet us talk',
    });
  });

  it('uses CONTACT_FROM when set and keeps the subject on one line', async () => {
    vi.stubEnv('CONTACT_FROM', 'Me <hi@me.dev>');
    await post({ ...VALID, subject: 'Two\r\nlines' });
    const body = JSON.parse(resend.mock.calls[0][1].body);

    expect(body.from).toBe('Me <hi@me.dev>');
    expect(body.subject).toBe('Portfolio: Two lines');
  });

  it('silently accepts and drops a filled honeypot', async () => {
    const res = await post({ ...VALID, company: 'ACME' });

    expect(res.status).toBe(200);
    expect(resend).not.toHaveBeenCalled();
  });

  it.each([
    ['a bad email', { ...VALID, email: 'nope' }],
    ['an empty subject', { ...VALID, subject: '   ' }],
    ['an empty message', { ...VALID, message: '' }],
    ['an over-long message', { ...VALID, message: 'x'.repeat(5001) }],
  ])('rejects %s with 400 and sends nothing', async (_, body) => {
    expect((await post(body)).status).toBe(400);
    expect(resend).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON and huge bodies', async () => {
    expect((await post('{oops')).status).toBe(400);
    expect((await post('x'.repeat(30000))).status).toBe(413);
    expect(resend).not.toHaveBeenCalled();
  });

  it('refuses posts from another site', async () => {
    expect((await post(VALID, { origin: 'https://evil.test' })).status).toBe(403);
    expect((await post(VALID, { origin: 'https://site.test' })).status).toBe(200);
  });

  it('rate-limits one client after a few messages', async () => {
    for (let i = 0; i < MAX_PER_WINDOW; i++) {
      expect((await post(VALID)).status).toBe(200);
    }

    expect((await post(VALID)).status).toBe(429);
    expect((await post(VALID, { 'x-forwarded-for': '5.6.7.8' })).status).toBe(200);
  });

  it('answers 500 without sending when the env is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    expect((await post(VALID)).status).toBe(500);
    expect(resend).not.toHaveBeenCalled();
  });

  it('answers 502 when Resend fails or is unreachable', async () => {
    resend.mockResolvedValueOnce(new Response('{"message":"bad"}', { status: 422 }));
    expect((await post(VALID)).status).toBe(502);
    resend.mockRejectedValueOnce(new TypeError('network'));
    expect((await post(VALID)).status).toBe(502);
  });
});
