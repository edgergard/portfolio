import type { Metadata } from 'next';
import { Suspense } from 'react';
import CvView from '@/components/cv/CvView';
import CvViewSwitch from '@/components/cv/CvViewSwitch';
import type { CvVariant } from '@/data/cv';
import { getCv } from '@/data/cvs';
import { getDictionary } from '@/lib/dictionaries';
import { DEFAULT_LANG, isLang } from '@/lib/locale';
import { pageMetadata } from '@/lib/metadata';

const VARIANTS: CvVariant[] = ['react-native', 'frontend'];

export const dynamicParams = false;

export function generateStaticParams() {
  return VARIANTS.map(variant => ({ variant }));
}

type Params = Promise<{ lang: string; variant: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw, variant } = await params;
  const lang = isLang(raw) ? raw : DEFAULT_LANG;

  return pageMetadata(lang, { cv: variant as CvVariant }, await getDictionary(lang));
}

/**
 * One CV variant, prerendered per locale. The web (text) view is the default and is what the
 * static HTML holds (the Suspense fallback); `?view=pdf` swaps to the PDF on the client.
 */
export default async function CvVariantPage({
  params,
}: {
  params: Params;
}) {
  const { lang, variant } = await params;
  const doc = getCv(variant as CvVariant, lang);

  return (
    <Suspense fallback={<CvView doc={doc} view="web" />}>
      <CvViewSwitch doc={doc} />
    </Suspense>
  );
}
