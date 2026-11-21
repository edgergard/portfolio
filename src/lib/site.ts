const FALLBACK_SITE_URL = 'https://oleksandr-bryksin.vercel.app';

/**
 * Normalises a site URL to its bare origin: empty falls back to the default, trailing slashes
 * and paths are dropped, and an invalid value fails with a message that names the variable.
 */
export function normalizeSiteUrl(raw: string | undefined): string {
  const value = raw?.trim() || FALLBACK_SITE_URL;

  try {
    return new URL(value).origin;
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL must be an absolute URL such as ${FALLBACK_SITE_URL}, got "${value}"`);
  }
}

/** The deployed site's origin; set NEXT_PUBLIC_SITE_URL per environment. */
export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
