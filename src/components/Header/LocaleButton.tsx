'use client';

import classNames from 'classnames';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, type MouseEvent } from 'react';
import { useLang } from '@/lib/i18n-client';
import { LANG_COOKIE, switchLocaleHref, switchLocaleLinkHref, type Lang } from '@/lib/locale';
import { restoreReadingPosition, saveReadingPosition } from '@/lib/readingPosition';

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'uk', label: 'UA' },
];

/**
 * The same page in the other language. Plain links, not next/link: switching language is a full
 * page load, because the root layout (<html lang>, the theme script) belongs to the locale.
 */
const LocaleLinks = ({ search }: { search: string }) => {
  const lang = useLang();
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, to: Lang) => {
    // The proxy reads the cookie for prefix-less URLs, so it must be set before navigating.
    document.cookie = `${LANG_COOKIE}=${to}; path=/; max-age=31536000; samesite=lax`;
    // No hash: an old #contact from a nav click would jump there. Keep the place instead.
    const href = switchLocaleHref(to, pathname, search, '');

    e.currentTarget.href = href;
    saveReadingPosition(new URL(href, window.location.href).pathname);
  };

  return (
    <div className="flex w-fit items-center gap-x-2">
      {OPTIONS.map(({ value, label }, i) => (
        <span key={value} className="flex items-center gap-x-2">
          {i > 0 && <span className="text-rule">/</span>}
          {/* aria-pressed marks the active language, as on the Vite site (tests pin it). */}
          {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
          <a
            href={switchLocaleLinkHref(value, pathname, search, '')}
            onClick={e => handleClick(e, value)}
            aria-pressed={lang === value}
            // tracking-normal: the Vite site's <button>s did not inherit the nav letter-spacing.
            className={classNames('uppercase tracking-normal transition-colors hover:text-ink', {
              'text-ink': lang === value,
              'text-muted-2': lang !== value,
            })}
          >
            {label}
          </a>
        </span>
      ))}
    </div>
  );
};

const LocaleLinksWithSearch = () => {
  const params = useSearchParams().toString();

  return <LocaleLinks search={params ? `?${params}` : ''} />;
};

/**
 * The query string is only known in the browser; prerendered pages show links without it
 * (the Suspense fallback) until the client fills it in.
 */
/**
 * After a language switch, scroll back to where the visitor was (see lib/readingPosition.ts).
 * The header renders the switch twice (desktop and the mobile menu); the saved entry is read
 * and removed on the first run, so the second does nothing.
 */
const RestorePosition = () => {
  useEffect(() => {
    restoreReadingPosition(window.location.pathname);
  }, []);

  return null;
};

const LocaleButton = () => (
  <>
    <RestorePosition />
    <Suspense fallback={<LocaleLinks search="" />}>
      <LocaleLinksWithSearch />
    </Suspense>
  </>
);

export default LocaleButton;
