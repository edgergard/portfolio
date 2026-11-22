import type { Metadata } from 'next';
import type { CvVariant } from '@/data/cv';
import type { Dictionary } from './dictionaries';
import { localeHref, type Lang } from './locale';

export const SITE_NAME = 'Oleksandr Bryksin';

/** The OB favicon and the apple touch icon from public/, shared by the [lang] layout and the global 404. */
export const SITE_ICONS: NonNullable<Metadata['icons']> = {
  icon: { url: '/favicon.svg', type: 'image/svg+xml' },
  apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
};

/** The home page keeps the <title> and description the Vite site shipped with. */
export const HOME_TITLE = 'Oleksandr Bryksin — React Native & Frontend Developer';
export const HOME_DESCRIPTION
  = 'Oleksandr Bryksin, React Native & frontend developer in Kyiv. '
  + 'Mobile apps with React Native and Expo, web products with React and Next.js.';

const OG_IMAGE = {
  url: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'Oleksandr Bryksin, React Native & Frontend Developer, next to the wine shader and 3D knot from the site',
};

const OG_LOCALE: Record<Lang, string> = { en: 'en_US', uk: 'uk_UA' };

const CV_ROLE: Record<CvVariant, string> = { 'react-native': 'React Native', 'frontend': 'Frontend' };

export type MetaPage = 'home' | 'projects' | { cv: CvVariant };

/** The page's path without a locale prefix. */
export function pagePath(page: MetaPage): string {
  if (page === 'home') {
    return '/';
  }

  return page === 'projects' ? '/projects' : `/cv/${page.cv}`;
}

const fill = (template: string, vars: Record<string, string>) =>
  template.replace(/\{\{(\w+)\}\}/g, (match, name: string) => vars[name] ?? match);

type Copy = { title: string; description: string };

function titleAndDescription(page: MetaPage, dict: Dictionary): Copy {
  if (page === 'home') {
    return { title: HOME_TITLE, description: HOME_DESCRIPTION };
  }

  if (page === 'projects') {
    return { title: dict.meta_projects_title, description: dict.meta_projects_description };
  }

  const vars = { role: CV_ROLE[page.cv] };

  return {
    title: fill(dict.meta_cv_title, vars),
    description: fill(dict.meta_cv_description, vars),
  };
}

/** hreflang alternates for a page: one URL per locale, English as x-default. */
export function languageAlternates(path: string): Record<'en' | 'uk' | 'x-default', string> {
  return { 'en': localeHref('en', path), 'uk': localeHref('uk', path), 'x-default': localeHref('en', path) };
}

/**
 * Title, description, canonical URL, hreflang alternates and link-preview tags for one page.
 * URLs are relative; the [lang] layout's metadataBase makes them absolute.
 */
export function pageMetadata(lang: Lang, page: MetaPage, dict: Dictionary): Metadata {
  const path = pagePath(page);
  const url = localeHref(lang, path);
  const { title, description } = titleAndDescription(page, dict);

  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      type: 'website',
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
  };
}

/**
 * viewportFit cover lets the page run under the phone's status bar / notch; the header pads
 * itself by the safe-area inset, so the bar and the header read as one strip.
 */
export const SITE_VIEWPORT = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
} as const;
