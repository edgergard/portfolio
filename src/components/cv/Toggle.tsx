'use client';

import Link from 'next/link';
import { useRef, type KeyboardEvent } from 'react';

/** With `href` the option is a link to that URL; without it, choosing it calls `onChange`. */
export type ToggleOption<T extends string> = { value: T; label: string; href?: string };

type Props<T extends string> = {
  /** Exactly two options, left then right. */
  options: readonly [ToggleOption<T>, ToggleOption<T>];
  value: T;
  onChange?: (value: T) => void;
  /** Name of the whole control (e.g. "CV view"). */
  groupLabel: string;
};

/**
 * Two-option segmented control that reads like a toggle: one capsule, a wine highlight that
 * slides under the active option. A radiogroup with roving tabindex, so Tab lands on the
 * selected option and the arrow keys (plus Home/End) move the selection.
 */
const Toggle = <T extends string>({ options, value, onChange, groupLabel }: Props<T>) => {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const active = options[1].value === value ? 1 : 0;

  const select = (index: number) => {
    const el = refs.current[index];

    if (options[index].href !== undefined) {
      el?.click();
    } else {
      onChange?.(options[index].value);
    }

    el?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const next = { ArrowLeft: 0, ArrowUp: 0, Home: 0, ArrowRight: 1, ArrowDown: 1, End: 1 }[e.key];

    if (next === undefined) {
      return;
    }

    e.preventDefault();
    select(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className="relative inline-grid grid-cols-2 rounded-full border border-chip p-[3px]"
    >
      <span
        aria-hidden
        data-testid="toggle-highlight"
        className={`pointer-events-none absolute bottom-[3px] left-[3px] top-[3px] w-[calc(50%-3px)] rounded-full border border-wine-3 bg-wine/25 transition-transform duration-300 ease-out motion-reduce:transition-none ${
          active ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {options.map((o, i) => {
        const shared = {
          ref: (el: HTMLElement | null) => {
            refs.current[i] = el;
          },
          role: 'radio',
          'aria-checked': i === active,
          tabIndex: i === active ? 0 : -1,
          onKeyDown,
          className: `relative z-[1] whitespace-nowrap rounded-full px-4 py-2 text-center font-mono text-xs uppercase tracking-[.06em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
            i === active ? 'text-ink' : 'text-muted-2 hover:text-ink-2'
          }`,
        };

        return o.href === undefined ? (
          <button key={o.value} type="button" {...shared} onClick={() => select(i)}>
            {o.label}
          </button>
        ) : (
          <Link key={o.value} href={o.href} prefetch={false} replace scroll={false} {...shared}>
            {o.label}
          </Link>
        );
      })}
    </div>
  );
};

export default Toggle;
