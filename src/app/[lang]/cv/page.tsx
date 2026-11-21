import { redirect } from 'next/navigation';
import { DEFAULT_LANG, isLang, localeHref } from '@/lib/locale';

/** `/cv` (and `/uk/cv`) has no CV of its own: it opens the React Native variant. */
export default async function CvIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  redirect(localeHref(isLang(lang) ? lang : DEFAULT_LANG, '/cv/react-native'));
}
