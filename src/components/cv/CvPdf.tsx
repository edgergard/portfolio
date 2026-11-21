'use client';

import Button from '@/components/ui/Button';
import type { CvDoc } from '@/data/cv';
import { useT } from '@/lib/i18n-client';

export const pdfHref = (doc: CvDoc) => `/cv/${doc.pdf}`;

/**
 * The PDF view. Both layouts are rendered and CSS picks one: narrow screens get Open/Download
 * buttons (mobile browsers can't embed PDFs well), wider ones the embedded <object>.
 */
const CvPdf = ({ doc }: { doc: CvDoc }) => {
  const t = useT();
  const href = pdfHref(doc);

  return (
    <>
      <div data-testid="cv-pdf-narrow" className="flex flex-wrap gap-3 min-[900px]:hidden">
        <Button href={href} target="_blank" rel="noopener noreferrer" variant="outline">
          {t('cv_open_pdf')}
        </Button>
        <Button href={href} download>
          {t('cv_download')}
        </Button>
      </div>
      <object
        data={href}
        type="application/pdf"
        aria-label={doc.title}
        title={doc.title}
        className="hidden h-[85vh] w-full rounded-2xl border border-line min-[900px]:block"
      >
        <Button href={href} target="_blank" rel="noopener noreferrer" variant="outline">
          {t('cv_open_pdf')}
        </Button>
      </object>
    </>
  );
};

export default CvPdf;
