import type { ReactNode } from 'react';

/** The .wine-edge frame classes for an education card wrapper (the frame paints the 1px edge). */
export const EDU_CARD_FRAME = 'wine-edge flex';

type Props = {
  kind: ReactNode;
  period: ReactNode;
  institution: ReactNode;
  programme: ReactNode;
  programmeLabel: ReactNode;
};

/**
 * The inner surface of an education card: kind label, big period, institution, programme.
 * Wrap it in an element with EDU_CARD_FRAME. Used by the home Experience section and the web CV.
 */
const EducationCard = ({ kind, period, institution, programme, programmeLabel }: Props) => (
  <div className="flex flex-1 flex-col gap-6 rounded-[19px] bg-[linear-gradient(200deg,rgb(var(--c-surface-2))_0%,rgb(var(--c-bg))_65%)] p-7">
    <span className="font-mono text-xs uppercase tracking-[.08em] text-soft-3">{kind}</span>
    <div className="text-[34px] font-medium leading-none tracking-[-0.04em] text-ink min-[860px]:text-[30px] min-[1100px]:text-[36px]">
      {period}
    </div>
    <h4 className="text-[19px] font-medium leading-[1.3] tracking-[-0.015em] text-ink">{institution}</h4>
    <div className="mt-auto border-t border-line pt-5">
      <div className="font-mono text-[11px] uppercase tracking-[.08em] text-muted-2">{programmeLabel}</div>
      <p className="mt-2 text-[15px] leading-[1.45] text-soft-2 min-[860px]:min-h-[2.9em]">{programme}</p>
    </div>
  </div>
);

export default EducationCard;
