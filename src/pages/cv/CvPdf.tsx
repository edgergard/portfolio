import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
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

export const pdfHref = (doc: CvDoc) => `${import.meta.env.BASE_URL}cv/${doc.pdf}`;

const CvPdf = ({ doc }: { doc: CvDoc }) => {
  const { t } = useTranslation();
  const narrow = useNarrow();
  const href = pdfHref(doc);

  if (narrow) {
    return (
      <div className="flex flex-wrap gap-3">
        <Button href={href} target="_blank" rel="noopener noreferrer" variant="outline">
          {t('cv_open_pdf')}
        </Button>
        <Button href={href} download>
          {t('cv_download')}
        </Button>
      </div>
    );
  }

  return (
    <object data={href} type="application/pdf" aria-label={doc.title} title={doc.title} className="h-[85vh] w-full rounded-2xl border border-line">
      <Button href={href} target="_blank" rel="noopener noreferrer" variant="outline">
        {t('cv_open_pdf')}
      </Button>
    </object>
  );
};

export default CvPdf;
