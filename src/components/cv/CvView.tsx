'use client';

import Button from '@/components/ui/Button';
import type { CvDoc, CvVariant } from '@/data/cv';
import { useLang, useT } from '@/lib/i18n-client';
import { localeHref } from '@/lib/locale';
import CvPdf, { pdfHref } from './CvPdf';
import CvWeb, { CV_COLUMN } from './CvWeb';
import Toggle from './Toggle';
import './print.css';

export type CvViewMode = 'web' | 'pdf';

type Props = {
  doc: CvDoc;
  view: CvViewMode;
  /** Switches the view; absent in the static fallback, which only shows the web view. */
  onViewChange?: (view: CvViewMode) => void;
};

/** The CV page body for one variant and view: the toolbar, the name header and the CV itself. */
const CvView = ({ doc, view, onViewChange }: Props) => {
  const t = useT();
  const lang = useLang();
  // The variant links keep the PDF view; the web view is the default and needs no parameter.
  const variantHref = (v: CvVariant) => localeHref(lang, `/cv/${v}`) + (view === 'pdf' ? '?view=pdf' : '');

  return (
    // Full width so the web CV's skills band can run edge to edge; content sits in CV_COLUMN.
    <div className="cv-print-root bg-bg py-20 text-ink min-[900px]:py-[120px]">
      <div className={CV_COLUMN}>
        <div className="cv-no-print mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Toggle
              groupLabel={t('cv_aria_version')}
              options={[
                { value: 'react-native', label: t('cv_switch_rn'), href: variantHref('react-native') },
                { value: 'frontend', label: t('cv_switch_fe'), href: variantHref('frontend') },
              ]}
              value={doc.variant}
            />
            <Toggle
              groupLabel={t('cv_aria_view')}
              options={[
                { value: 'pdf', label: `${t('cv_view_pdf')}${t('cv_pdf_note')}` },
                { value: 'web', label: t('cv_view_web') },
              ]}
              value={view}
              onChange={onViewChange}
            />
          </div>
          <Button href={pdfHref(doc)} download>
            {t('cv_download_pdf')}{t('cv_pdf_note')} <span aria-hidden="true">↓</span>
          </Button>
        </div>

        <header className="mb-12">
          <h1 className="text-[clamp(44px,6vw,96px)] font-medium leading-none tracking-[-0.05em]">Oleksandr Bryksin</h1>
          <p className="mt-4 text-[clamp(20px,2vw,28px)] text-ink-2">{doc.title}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[.06em] text-muted-2">{doc.location}</p>
        </header>

        {view === 'pdf' && <CvPdf doc={doc} />}
      </div>

      {view === 'web' && <CvWeb doc={doc} />}
    </div>
  );
};

export default CvView;
