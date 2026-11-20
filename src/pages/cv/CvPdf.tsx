import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CvDoc } from '../../data/cv';

const NARROW_QUERY = '(max-width: 899px)';

const useNarrow = () => {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return narrow;
};

const btn =
  'inline-flex rounded-full border border-chip px-6 py-3.5 text-sm font-medium transition-colors hover:border-wine-2';

export const pdfHref = (doc: CvDoc) => `${import.meta.env.BASE_URL}cv/${doc.pdf}`;

const CvPdf = ({ doc }: { doc: CvDoc }) => {
  const { t } = useTranslation();
  const narrow = useNarrow();
  const href = pdfHref(doc);

  if (narrow) {
    return (
      <div className="flex flex-wrap gap-3">
        <a href={href} target="_blank" rel="noopener noreferrer" className={btn}>
          {t('cv_open_pdf')}
        </a>
        <a href={href} download className={btn}>
          {t('cv_download')}
        </a>
      </div>
    );
  }

  return (
    <object data={href} type="application/pdf" className="h-[85vh] w-full rounded-2xl border border-line">
      <a href={href} target="_blank" rel="noopener noreferrer" className={btn}>
        {t('cv_open_pdf')}
      </a>
    </object>
  );
};

export default CvPdf;
