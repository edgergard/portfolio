import { CONTACT_LIMITS, ContactSchema, HONEYPOT_FIELD } from '@/lib/contact';
import { rateLimited } from '@/lib/rateLimit';

/**
 * Contact form → email via Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Env (server only, set in Vercel):
 *   RESEND_API_KEY    the Resend API key
 *   CONTACT_TO_EMAIL  where messages go (with the default sender, the Resend account's email)
 *   CONTACT_FROM      optional sender; defaults to Resend's shared test sender
 * The visitor's address goes in Reply-To, so "Reply" in the mail client answers them.
 */
export const runtime = 'nodejs';

const RESEND_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'Portfolio contact <onboarding@resend.dev>';

const json = (body: object, status: number) => Response.json(body, { status });

/** A browser POST from another site carries its Origin; only our own pages may send. */
const sameOrigin = (request: Request) => {
  const origin = request.headers.get('origin');

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host === new URL(request.url).host
      || new URL(origin).host === request.headers.get('x-forwarded-host');
  } catch {
    return false;
  }
};

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json({ ok: false, error: 'forbidden' }, 403);
  }

  const raw = await request.text();

  if (raw.length > CONTACT_LIMITS.message * 4) {
    return json({ ok: false, error: 'too_large' }, 413);
  }

  let body: unknown;

  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  if (body && typeof body === 'object' && (body as Record<string, unknown>)[HONEYPOT_FIELD]) {
    return json({ ok: true }, 200);
  }

  const parsed = ContactSchema.safeParse(body);

  if (!parsed.success) {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (rateLimited(ip)) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    // eslint-disable-next-line no-console
    console.error('Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL is not set.');

    return json({ ok: false, error: 'not_configured' }, 500);
  }

  const { email, subject, message } = parsed.data;
  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || DEFAULT_FROM,
      to: [to],
      reply_to: email,
      // One line: a pasted newline must not break the subject.
      subject: `Portfolio: ${subject.replace(/\s+/g, ' ')}`,
      text: `From: ${email}\n\n${message}`,
    }),
  }).catch(() => null);

  if (!response?.ok) {
    // eslint-disable-next-line no-console
    console.error('Contact form: Resend rejected the message.', response?.status, await response?.text().catch(() => ''));

    return json({ ok: false, error: 'send_failed' }, 502);
  }

  return json({ ok: true }, 200);
}
