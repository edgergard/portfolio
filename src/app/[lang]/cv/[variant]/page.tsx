import { Suspense } from 'react';
import CvView from '@/components/cv/CvView';
import CvViewSwitch from '@/components/cv/CvViewSwitch';
import type { CvVariant } from '@/data/cv';
import { getCv } from '@/data/cvs';

const VARIANTS: CvVariant[] = ['react-native', 'frontend'];

export const dynamicParams = false;

export function generateStaticParams() {
  return VARIANTS.map(variant => ({ variant }));
}

/**
 * One CV variant, prerendered per locale. The web (text) view is the default and is what the
 * static HTML holds (the Suspense fallback); `?view=pdf` swaps to the PDF on the client.
 */
export default async function CvVariantPage({
  params,
}: {
  params: Promise<{ lang: string; variant: string }>;
}) {
  const { lang, variant } = await params;
  const doc = getCv(variant as CvVariant, lang);

  return (
    <Suspense fallback={<CvView doc={doc} view="web" />}>
      <CvViewSwitch doc={doc} />
    </Suspense>
  );
}
