'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import { useLang } from '@/lib/i18n-client';
import { localeHref, switchLocaleHref } from '@/lib/locale';

type Props = {
  path: string;
  title: string;
  onClick?: () => void;
};

const CLASS = 'text-muted-2 transition-colors hover:text-ink';

/**
 * A link to a home-page section (`/#id`, `/uk#id`) that smooth-scrolls when the home page is
 * already open, like the old hash links; from any other page it navigates normally.
 */
export const SectionLink = ({
  section,
  className,
  onClick,
  children,
  ...rest
}: {
  section: string;
  className: string;
  onClick?: () => void;
  children: ReactNode;
  'data-testid'?: string;
  'aria-label'?: string;
}) => {
  const lang = useLang();
  // Typed nullable while src/pages exists (Next's pages-router compat types, until Task 12).
  const pathname = usePathname() ?? '/';
  const home = localeHref(lang, '/');
  const href = `${home}#${section}`;
  // Normalised, since English can report its internal /en path.
  const onHome = switchLocaleHref(lang, pathname, '', '') === home;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    const target = document.getElementById(section);

    if (onHome && target && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', href);
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </Link>
  );
};

/** Section links scroll on the home page; a path starting with "/" is a route. */
const NavLink = ({ path, title, onClick }: Props) => {
  const lang = useLang();

  if (path.startsWith('/')) {
    return (
      <Link href={localeHref(lang, path)} onClick={onClick} className={CLASS}>
        {title}
      </Link>
    );
  }

  return (
    <SectionLink section={path} onClick={onClick} className={CLASS}>
      {title}
    </SectionLink>
  );
};

export default NavLink;
