import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import WineSurface from '../Wine/WineSurface';

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
  /**
   * Puts the whole section (label and content) on a full-bleed band of the live Wine shader.
   * The label turns light to read on the wine; content should bring its own glass panels.
   */
  band?: boolean;
};

/** The centred content column every section shares (width and side gutters). */
export const COLUMN = 'mx-auto max-w-[1120px] px-6 min-[900px]:px-10';

const TOP = 'pt-20 min-[900px]:pt-[112px]';
const BOTTOM = 'pb-20 min-[900px]:pb-[112px]';

/**
 * The chrome of every full-bleed Wine band. `.on-wine` (styles.css) keeps the dark theme's palette
 * inside the band in both themes, so ink-based focus rings, hover borders and dark pill surfaces
 * (the edge button) look the same on the wine whatever the page theme.
 */
export const BAND
  = 'on-wine bg-wine-flow border-y border-white/10 shadow-[0_24px_80px_-32px_rgba(139,20,38,0.55)] hover:filter-none';

/** Dark glass panel that keeps text readable over a Wine band. */
export const GLASS = 'rounded-[28px] border border-white/10 bg-[rgba(10,10,11,0.55)] backdrop-blur-[14px]';

type HeadingProps = { id: string; index: number; label: string; onWine: boolean };

const Heading = ({ id, index, label, onWine }: HeadingProps) => (
  <h2
    id={`${id}-heading`}
    data-on-wine={onWine || undefined}
    className={
      'mb-10 flex items-center justify-center gap-3 text-center font-mono text-[13px] font-normal uppercase tracking-[.08em] min-[900px]:mb-14 '
      + (onWine ? 'text-white [text-shadow:0_1px_12px_rgba(10,10,11,0.45)]' : 'text-ink-2')
    }
  >
    <b className={`font-medium ${onWine ? 'text-white' : 'text-wine-2'}`}>{String(index).padStart(2, '0')}</b>
    <i aria-hidden className={`inline-block h-px w-6 ${onWine ? 'bg-white/60' : 'bg-rule'}`} />
    <span>{label}</span>
  </h2>
);

const Section = ({ id, index, labelKey, children, bleed, band = false }: Props) => {
  const { t } = useTranslation();

  if (band) {
    return (
      <section id={id} aria-labelledby={`${id}-heading`} className="bg-bg text-white">
        <div data-testid={`${id}-band`} className={`${BAND} ${TOP} ${BOTTOM}`}>
          <WineSurface />
          <div className={`relative ${COLUMN}`}>
            <Heading id={id} index={index} label={t(labelKey)} onWine />
            <div>{children}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-line bg-bg text-ink">
      <div className={`${COLUMN} ${TOP} ${bleed ? '' : BOTTOM}`}>
        <Heading id={id} index={index} label={t(labelKey)} onWine={false} />
        <div>{children}</div>
      </div>
      {bleed}
    </section>
  );
};

export default Section;
