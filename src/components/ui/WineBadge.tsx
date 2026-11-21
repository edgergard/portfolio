import type { ReactNode } from 'react';
import WineCanvas from './WineCanvas';

type Props = {
  children: ReactNode;
  /** Render as a list item (inside a <ul>) or as an inline span. */
  as?: 'li' | 'span';
  'data-testid'?: string;
};

/**
 * Stack badge on the live Wine shader (CSS wine-flow fill underneath), each with its own
 * moment of the animation. Not interactive, so no hover lift. Same look in both themes.
 */
const WineBadge = ({ children, as: Tag = 'span', ...rest }: Props) => (
  <Tag
    className={
      'bg-wine-flow rounded-full border border-white/[.18] px-2.5 py-[5px] font-mono text-[11px] uppercase '
      + 'leading-[normal] tracking-[.04em] text-white hover:filter-none'
    }
    {...rest}
  >
    <WineCanvas />
    {children}
  </Tag>
);

export default WineBadge;
