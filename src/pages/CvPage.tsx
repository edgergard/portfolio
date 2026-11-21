import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCv } from '../data/cvs';
import Button from '../components/ui/Button';
import CvPdf, { pdfHref } from './cv/CvPdf';
import CvWeb, { CV_COLUMN } from './cv/CvWeb';
import Toggle from './cv/Toggle';
import { useCvParams } from './cv/useCvParams';
import './cv/print.css';

const CvPage = () => {
  const { t, i18n } = useTranslation();
  const { variant, view, setVariant, setView } = useCvParams();
  const doc = getCv(variant, i18n.language);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    // Full width so the web CV's skills band can run edge to edge; content sits in CV_COLUMN.
    <div className="cv-print-root bg-bg py-20 text-ink min-[900px]:py-[120px]">
      <div className={CV_COLUMN}>
        <div className="cv-no-print mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Toggle
              groupLabel={t('cv_aria_version')}
              options={[
                { value: 'react-native', label: t('cv_switch_rn') },
                { value: 'frontend', label: t('cv_switch_fe') },
              ]}
              value={variant}
              onChange={setVariant}
            />
            <Toggle
              groupLabel={t('cv_aria_view')}
              options={[
                { value: 'web', label: t('cv_view_web') },
                { value: 'pdf', label: `${t('cv_view_pdf')}${t('cv_pdf_note')}` },
              ]}
              value={view}
              onChange={setView}
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

export default CvPage;
