import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  id: string;
  index: number;
  labelKey: string;
  children: ReactNode;
  /**
   * Full-bleed content rendered after the centred column, spanning the section edge to edge.
   * Content inside it should line up with the column on its own (see COLUMN).
   * The band closes the section: no bottom padding follows it, so it ends flush with the
   * next section's top border (the band keeps its own inner padding).
   */
  bleed?: ReactNode;
};

/** The centred content column every section shares (width and side gutters). */
export const COLUMN = 'mx-auto max-w-[1120px] px-6 min-[900px]:px-10';

const BOTTOM = 'pb-20 min-[900px]:pb-[112px]';

const Section = ({ id, index, labelKey, children, bleed }: Props) => {
  const { t } = useTranslation();

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-line bg-bg text-ink">
      <div className={`${COLUMN} pt-20 min-[900px]:pt-[112px] ${bleed ? '' : BOTTOM}`}>
        <h2
          id={`${id}-heading`}
          className="mb-10 flex items-center justify-center gap-3 text-center font-mono text-[13px] font-normal uppercase tracking-[.08em] text-ink-2 min-[900px]:mb-14"
        >
          <b className="font-medium text-wine-2">{String(index).padStart(2, '0')}</b>
          <i aria-hidden className="inline-block h-px w-6 bg-[#3A3A40]" />
          <span>{t(labelKey)}</span>
        </h2>
        <div>{children}</div>
      </div>
      {bleed}
    </section>
  );
};

export default Section;
