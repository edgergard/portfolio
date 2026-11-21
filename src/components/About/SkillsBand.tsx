import type { ReactNode } from 'react';
import { COLUMN } from '../layout/Section';
import WineSurface from '../Wine/WineSurface';

export type SkillGroup = { title: string; items: string[] };

type Props = {
  /** The About layout: groups with dash labels and large pills. Ignored when children are given. */
  groups?: SkillGroup[];
  /** Shell mode: the band chrome (shader, fill, column) around the caller's own layout. */
  children?: ReactNode;
  heading?: ReactNode;
  /** Classes for the inner column, so the labels and pills line up with the page's own column. */
  column?: string;
};

/**
 * Full-bleed band with the hero's live Wine shader; the CSS wine-flow fill shows underneath
 * while it loads or without WebGL. The inner column keeps labels and pills on the page's grid.
 * Used by the home About section (groups) and the web CV (children: its own dl layout).
 */
const SkillsBand = ({ groups = [], children, heading, column = COLUMN }: Props) => (
  <div
    data-testid="skills-panel"
    className="skills-band bg-wine-flow border-y border-white/10 py-10 shadow-[0_24px_80px_-32px_rgba(139,20,38,0.55)] hover:filter-none min-[900px]:py-14"
  >
    <WineSurface />
    <div data-testid="skills-column" className={`relative ${column}`}>
      {heading && (
        <h3 className="mb-7 font-mono text-[13px] font-normal uppercase tracking-[.08em] text-white/85">{heading}</h3>
      )}
      {children ?? (
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 min-[900px]:grid-cols-2">
          {groups.map(group => (
            <div key={group.title}>
              <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[.08em] text-white/75">
                <i aria-hidden className="inline-block h-px w-4 bg-white/40" />
                {group.title}
              </div>
              <ul className="mt-3.5 flex list-none flex-wrap gap-2">
                {group.items.map(item => (
                  <li
                    key={item}
                    data-testid="skill-pill"
                    className="rounded-full border border-white/15 bg-[rgba(10,10,11,0.42)] px-4 py-2 text-[15px] font-medium leading-tight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-colors duration-200 hover:border-white/35 hover:bg-[rgba(10,10,11,0.6)] min-[900px]:text-base"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default SkillsBand;
