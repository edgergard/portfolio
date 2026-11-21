import type { ReactNode } from 'react';

/*
 * Row pieces shared by the server Contact section and its client CV row.
 * No 'use client': both sides import them.
 */

export const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
// Every row's bottom hairline has the same rounded ends, whether the row is a link or a list item.
export const ROW = 'group flex items-center gap-3 sm:gap-3.5 rounded-lg border-b border-white/10 py-3';
export const MAIN = `flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5 rounded-lg ${FOCUS}`;

/** Round action on the right of a row; brightens with a wine border when the row is hovered. */
export const CIRCLE
  = 'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25 text-white/90 '
  + 'transition-colors duration-200 group-hover:border-white group-hover:bg-white/10 group-hover:text-white';

export const Tile = ({ children }: { children: ReactNode }) => (
  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-white/[.06] text-white">
    {children}
  </span>
);
