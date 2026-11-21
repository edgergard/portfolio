import { useRef, type KeyboardEvent } from 'react';

export type ToggleOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  /** Exactly two options, left then right. */
  options: readonly [ToggleOption<T>, ToggleOption<T>];
  value: T;
  onChange: (value: T) => void;
  /** Name of the whole control (e.g. "CV view"). */
  groupLabel: string;
};

/**
 * Two-option segmented control that reads like a toggle: one capsule, a wine highlight that
 * slides under the active option. A radiogroup with roving tabindex, so Tab lands on the
 * selected option and the arrow keys (plus Home/End) move the selection.
 */
const Toggle = <T extends string>({ options, value, onChange, groupLabel }: Props<T>) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = options[1].value === value ? 1 : 0;

  const select = (index: number) => {
    onChange(options[index].value);
    refs.current[index]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
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
      className="relative inline-grid grid-cols-2 rounded-full border border-[#2A2A2E] p-[3px]"
    >
      <span
        aria-hidden
        data-testid="toggle-highlight"
        className={`pointer-events-none absolute bottom-[3px] left-[3px] top-[3px] w-[calc(50%-3px)] rounded-full border border-wine-3 bg-wine/25 transition-transform duration-300 ease-out motion-reduce:transition-none ${
          active ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={el => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === active}
          tabIndex={i === active ? 0 : -1}
          onClick={() => select(i)}
          onKeyDown={onKeyDown}
          className={`relative z-[1] whitespace-nowrap rounded-full px-4 py-2 text-center font-mono text-xs uppercase tracking-[.06em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            i === active ? 'text-ink' : 'text-muted-2 hover:text-ink-2'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

export default Toggle;
