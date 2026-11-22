/**
 * Best-effort, per-server-instance rate limit for the contact endpoint: a few messages per
 * client per window, enough for people, a speed bump for scripts. (Serverless instances don't
 * share it; Resend's own quota is the hard ceiling.)
 */
export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_PER_WINDOW = 5;

const recent = new Map<string, number[]>();

export const rateLimited = (key: string, now = Date.now()) => {
  const hits = (recent.get(key) ?? []).filter(t => now - t < WINDOW_MS);

  hits.push(now);
  recent.set(key, hits);

  return hits.length > MAX_PER_WINDOW;
};

/** Clears the limiter (tests). */
export const resetRateLimit = () => recent.clear();
