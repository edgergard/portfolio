import { useEffect, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { wineButtons } from './wineButtons/loop';

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
  primary: 'bg-wine-flow shadow-[0_8px_28px_-10px_rgba(184,35,63,.7)] hover:shadow-[0_10px_34px_-8px_rgba(184,35,63,.85)]',
  outline: 'border border-[#4A4A50] bg-transparent hover:border-ink hover:bg-white/[.06]',
  // .wine-edge (styles.css) paints the animated 1px wine frame as the element's background;
  // the ::before inset by 1px is the dark pill surface. The size padding overrides .wine-edge's.
  edge:
    'wine-edge relative isolate rounded-full hover:brightness-[1.2] '
    + "before:pointer-events-none before:absolute before:inset-px before:-z-[1] before:rounded-full before:bg-[#0C0C0E] before:content-['']",
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
 * The hero's live Wine shader behind a primary button's label: a 2D canvas the shared
 * renderer (wineButtons) copies into every frame. It stays transparent until it holds a
 * frame, so the CSS fill shows while loading, without WebGL, or after an error.
 */
const WineLayer = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => wineButtons.register(canvas.current!), []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[1] h-full w-full opacity-0 transition-opacity duration-300"
    />
  );
};

const withLayer = (variant: ButtonVariant | undefined, children: ReactNode) => (
  <>
    {(variant ?? 'primary') === 'primary' && <WineLayer />}
    {children}
  </>
);

/**
 * The site's button. Renders a router link with `to` (a smooth-scrolling hash link when
 * `to` has a #fragment), an <a> with `href`, otherwise a <button>.
 * `primary` shows the hero's live Wine shader (CSS wine-flow fill underneath), `outline` a hairline border,
 * `edge` a dark pill inside the animated wine frame of the cards (.wine-edge).
 */
const Button = (props: ButtonProps) => {
  if (props.to !== undefined) {
    const { to, variant, size, className, children, ...rest } = props;
    const cls = buttonClass({ variant, size, className });

    return to.includes('#') ? (
      <HashLink smooth to={to} className={cls} {...rest}>
        {withLayer(variant, children)}
      </HashLink>
    ) : (
      <Link to={to} className={cls} {...rest}>
        {withLayer(variant, children)}
      </Link>
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
