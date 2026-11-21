'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { useLang } from '@/lib/i18n-client';
import { localeHref } from '@/lib/locale';
import { SectionLink } from '../Header/NavLink';
import WineCanvas from './WineCanvas';

export type ButtonVariant = 'primary' | 'outline' | 'edge';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Style = { variant?: ButtonVariant; size?: ButtonSize; className?: string };

const BASE
  = 'inline-flex items-center justify-center gap-2.5 rounded-full font-medium leading-none tracking-[-0.01em] text-ink '
  + 'transition-[filter,border-color,background-color,box-shadow] duration-200 '
  + 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink '
  + 'disabled:cursor-wait disabled:opacity-70';

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-[18px] py-[11px] text-[15px]',
  md: 'px-[22px] py-3 text-[16px]',
  lg: 'px-7 py-4 text-[17px]',
};

const VARIANTS: Record<ButtonVariant, string> = {
  // .bg-wine-flow (styles.css) is the CSS fill under the live shader layer; hover lifts both.
  primary: 'bg-wine-flow text-white shadow-[0_8px_28px_-10px_rgba(184,35,63,.7)] hover:shadow-[0_10px_34px_-8px_rgba(184,35,63,.85)]',
  outline: 'border border-rule bg-transparent hover:border-ink hover:bg-ink/[.06]',
  // .wine-edge (styles.css) paints the animated 1px wine frame as the element's background;
  // the ::before inset by 1px is the dark pill surface. The size padding overrides .wine-edge's.
  edge:
    'wine-edge wine-edge--bright relative isolate rounded-full hover:brightness-[1.2] '
    + "before:pointer-events-none before:absolute before:inset-px before:-z-[1] before:rounded-full before:bg-surface before:content-['']",
};

/** Class list for a button-looking element; use it when you can't render <Button>. */
export const buttonClass = ({ variant = 'primary', size = 'md', className }: Style = {}) =>
  [BASE, SIZES[size], VARIANTS[variant], className].filter(Boolean).join(' ');

type NoLink = { href?: undefined; to?: undefined };
type AsButton = Style & ButtonHTMLAttributes<HTMLButtonElement> & NoLink;
type AsAnchor = Style & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined };
type AsRoute = Style & { to: string; href?: undefined; children?: ReactNode; 'aria-label'?: string };

export type ButtonProps = AsButton | AsAnchor | AsRoute;

const withLayer = (variant: ButtonVariant | undefined, children: ReactNode) => (
  <>
    {(variant ?? 'primary') === 'primary' && <WineCanvas />}
    {children}
  </>
);

/** A locale-free route (`/cv`, `/#experience`) as a link in the page language. */
type RouteLinkProps = { to: string; className: string; children: ReactNode; 'aria-label'?: string };

const RouteLink = ({ to, className, children, ...rest }: RouteLinkProps) => {
  const lang = useLang();
  const [path, hash] = to.split('#');

  // A home-page section smooth-scrolls when the home page is already open.
  if (hash !== undefined && (path === '' || path === '/')) {
    return (
      <SectionLink section={hash} className={className} {...rest}>
        {children}
      </SectionLink>
    );
  }

  return (
    <Link href={localeHref(lang, path) + (hash === undefined ? '' : `#${hash}`)} className={className} {...rest}>
      {children}
    </Link>
  );
};

/**
 * The site's button. Renders a link in the page language with `to` (a locale-free path; a
 * home-page #section smooth-scrolls), an <a> with `href`, otherwise a <button>.
 * `primary` shows the hero's live Wine shader (CSS wine-flow fill underneath), `outline` a hairline border,
 * `edge` a dark pill inside the animated wine frame of the cards (.wine-edge).
 */
const Button = (props: ButtonProps) => {
  if (props.to !== undefined) {
    const { to, variant, size, className, children, ...rest } = props;

    return (
      <RouteLink to={to} className={buttonClass({ variant, size, className })} {...rest}>
        {withLayer(variant, children)}
      </RouteLink>
    );
  }

  if (props.href !== undefined) {
    const { variant, size, className, children, ...rest } = props;

    return (
      <a className={buttonClass({ variant, size, className })} {...rest}>
        {withLayer(variant, children)}
      </a>
    );
  }

  const { variant, size, className, children, type = 'button', ...rest } = props;

  return (
    <button type={type} className={buttonClass({ variant, size, className })} {...rest}>
      {withLayer(variant, children)}
    </button>
  );
};

export default Button;
