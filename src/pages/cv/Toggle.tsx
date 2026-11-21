type Props = {
  /** Label shown left of the track; selected when the switch is off. */
  left: string;
  /** Label shown right of the track; selected when the switch is on. Also the switch's name. */
  right: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Name of the whole control (e.g. "CV view"), given to the surrounding group. */
  groupLabel: string;
};

const side = (active: boolean) =>
  `cursor-pointer select-none font-mono text-xs uppercase tracking-[.06em] transition-colors duration-200 ${
    active ? 'text-white' : 'text-muted-2 hover:text-ink-2'
  }`;

/**
 * Two-option toggle: "Left ◯— Right". A native <button role="switch">, so Space and Enter
 * flip it; the side labels are mouse shortcuts that select their own side.
 */
const Toggle = ({ left, right, checked, onChange, groupLabel }: Props) => (
  <div role="group" aria-label={groupLabel} className="flex items-center gap-3">
    <span aria-hidden className={side(!checked)} onClick={() => onChange(false)}>
      {left}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={right}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 shrink-0 rounded-full bg-[linear-gradient(90deg,#8B1426,#D0213F)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.35),0_4px_14px_-6px_rgba(208,33,63,0.7)] transition-[filter] duration-200 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
    >
      <span
        aria-hidden
        className={`absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-transform duration-200 ease-out motion-reduce:transition-none ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
    <span aria-hidden className={side(checked)} onClick={() => onChange(true)}>
      {right}
    </span>
  </div>
);

export default Toggle;
