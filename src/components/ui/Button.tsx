import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

export type ButtonVariant = 'primary' | 'outline';
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
  // The flowing wine fill lives in styles.css (.bg-wine-flow); hover lifts it there.
  primary: 'bg-wine-flow shadow-[0_8px_28px_-10px_rgba(184,35,63,.7)] hover:shadow-[0_10px_34px_-8px_rgba(184,35,63,.85)]',
  outline: 'border border-[#4A4A50] bg-transparent hover:border-ink hover:bg-white/[.06]',
};

/** Class list for a button-looking element; use it when you can't render <Button>. */
export const buttonClass = ({ variant = 'primary', size = 'md', className }: Style = {}) =>
  [BASE, SIZES[size], VARIANTS[variant], className].filter(Boolean).join(' ');

type NoLink = { href?: undefined; to?: undefined };
type AsButton = Style & ButtonHTMLAttributes<HTMLButtonElement> & NoLink;
type AsAnchor = Style & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined };
type AsRoute = Style & { to: string; href?: undefined; children?: ReactNode; 'aria-label'?: string };

export type ButtonProps = AsButton | AsAnchor | AsRoute;

/**
 * The site's button. Renders a router link with `to` (a smooth-scrolling hash link when
 * `to` has a #fragment), an <a> with `href`, otherwise a <button>.
 * `primary` uses the animated wine-flow fill, `outline` a hairline border.
 */
const Button = (props: ButtonProps) => {
  if (props.to !== undefined) {
    const { to, variant, size, className, children, ...rest } = props;
    const cls = buttonClass({ variant, size, className });

    return to.includes('#') ? (
      <HashLink smooth to={to} className={cls} {...rest}>
        {children}
      </HashLink>
    ) : (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  if (props.href !== undefined) {
    const { variant, size, className, children, ...rest } = props;

    return (
      <a className={buttonClass({ variant, size, className })} {...rest}>
        {children}
      </a>
    );
  }

  const { variant, size, className, children, type = 'button', ...rest } = props;

  return (
    <button type={type} className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
};

export default Button;
