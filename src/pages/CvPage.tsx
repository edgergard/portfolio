import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { CvVariant } from '../data/cv';
import { getCv } from '../data/cvs';
import Button from '../components/ui/Button';
import CvPdf, { pdfHref } from './cv/CvPdf';
import CvWeb from './cv/CvWeb';
import { useCvParams, type CvView } from './cv/useCvParams';
import './cv/print.css';

const pillClass = (on: boolean) =>
  `rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[.06em] transition-colors ${
    on ? 'border-wine-3 bg-wine/25 text-ink' : 'border-chip text-muted-2 hover:text-ink'
  }`;

type Option<T> = { value: T; label: string };

const Switch = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) => (
  <div role="group" aria-label={ariaLabel} className="flex gap-1.5">
    {options.map(o => (
      <button
        key={o.value}
        type="button"
        aria-pressed={o.value === value}
        onClick={() => onChange(o.value)}
        className={pillClass(o.value === value)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const CvPage = () => {
  const { t, i18n } = useTranslation();
  const { variant, view, setVariant, setView } = useCvParams();
  const doc = getCv(variant, i18n.language);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const variants: Option<CvVariant>[] = [
    { value: 'react-native', label: t('cv_switch_rn') },
    { value: 'frontend', label: t('cv_switch_fe') },
  ];
  const views: Option<CvView>[] = [
    { value: 'web', label: t('cv_view_web') },
    { value: 'pdf', label: `${t('cv_view_pdf')}${t('cv_pdf_note')}` },
  ];

  return (
    <div className="cv-print-root mx-auto max-w-[1280px] bg-bg px-6 py-20 text-ink min-[900px]:px-10 min-[900px]:py-[120px]">
      <div className="cv-no-print mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Switch options={variants} value={variant} onChange={setVariant} ariaLabel={t('cv_aria_version')} />
          <Switch options={views} value={view} onChange={setView} ariaLabel={t('cv_aria_view')} />
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

      {view === 'pdf' ? <CvPdf doc={doc} /> : <CvWeb doc={doc} />}
    </div>
  );
};

export default CvPage;
