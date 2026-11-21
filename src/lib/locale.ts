export const LOCALES = ['en', 'uk'] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = 'en';
export const LANG_COOKIE = 'lang';

export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

/** English lives at the site root; every other locale gets a `/<lang>` prefix. */
export function localeHref(lang: Lang, path: string): string {
  if (lang === DEFAULT_LANG) {
    return path;
  }

  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

function stripLocalePrefix(pathname: string): string {
  for (const lang of LOCALES) {
    if (lang === DEFAULT_LANG) {
      continue;
    }

    if (pathname === `/${lang}`) {
      return '/';
    }

    if (pathname.startsWith(`/${lang}/`)) {
      return pathname.slice(lang.length + 1);
    }
  }

  return pathname || '/';
}

export function switchLocaleHref(to: Lang, pathname: string, search: string, hash: string): string {
  return `${localeHref(to, stripLocalePrefix(pathname))}${search}${hash}`;
}

export type LocaleResolution = { action: 'rewrite' | 'redirect' | 'next'; url: string };

/**
 * Decides what the proxy does with a request. An explicit `/uk` prefix always wins; `/en` is
 * redirected to its prefix-less canonical URL; prefix-less paths follow the `lang` cookie
 * (English when absent): rewritten to `/en/...`, or redirected to `/uk/...`.
 */
export function resolveLocale(pathname: string, cookie: string | undefined): LocaleResolution {
  const first = pathname.split('/')[1];

  if (first === 'uk') {
    return { action: 'next', url: pathname };
  }

  if (first === 'en') {
    const rest = pathname.slice('/en'.length);

    return { action: 'redirect', url: rest === '' ? '/' : rest };
  }

  if (cookie === 'uk') {
    return { action: 'redirect', url: localeHref('uk', pathname) };
  }

  return { action: 'rewrite', url: pathname === '/' ? '/en' : `/en${pathname}` };
}
