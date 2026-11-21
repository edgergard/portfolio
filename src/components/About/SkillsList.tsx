import type { ReactNode } from 'react';

export type SkillRow = { group: string; items: string[] };

const LABEL = 'font-mono text-xs uppercase tracking-[.06em]';

type HeadingProps = { as?: 'h2' | 'h3'; children: ReactNode };

/** Mono label with a short wine dash: the CV's block heading, also above the home skills band. */
export const SkillsHeading = ({ as: Tag = 'h2', children }: HeadingProps) => (
  <Tag
    className={
      `${LABEL} mb-5 flex items-center gap-2.5 font-normal text-muted `
      + "before:h-px before:w-4 before:bg-wine-3 before:content-['']"
    }
  >
    {children}
  </Tag>
);

type Props = {
  rows: SkillRow[];
  'data-testid'?: string;
  /** Test id on every skill chip (the home page counts them). */
  itemTestId?: string;
};

/**
 * The skills layout for a Wine band: one row per group, its label in a fixed column on the left
 * and small glass chips on the right. Shared by the web CV and the home About section.
 */
const SkillsList = ({ rows, itemTestId, ...rest }: Props) => (
  <dl className="grid gap-4" {...rest}>
    {rows.map(s => (
      <div key={s.group} className="grid grid-cols-1 gap-1.5 min-[900px]:grid-cols-[200px_1fr] min-[900px]:gap-8">
        <dt className={`${LABEL} pt-1 text-white/75`}>{s.group}</dt>
        <dd className="flex flex-wrap gap-1.5">
          {s.items.map(i => (
            <span
              key={i}
              data-testid={itemTestId}
              className={
                'rounded-full border border-white/20 bg-[rgba(10,10,11,.4)] px-2.5 py-[5px] '
                + 'font-mono text-[11px] tracking-[.02em] text-white/90'
              }
            >
              {i}
            </span>
          ))}
        </dd>
      </div>
    ))}
  </dl>
);

export default SkillsList;
