import type { MetadataRoute } from 'next';
import { languageAlternates, pagePath, type MetaPage } from '@/lib/metadata';
import { LOCALES, localeHref } from '@/lib/locale';
import { SITE_URL } from '@/lib/site';

/** Every prerendered page; the /cv redirects are left out. */
const PAGES: MetaPage[] = ['home', 'projects', { cv: 'react-native' }, { cv: 'frontend' }];

const absolute = (path: string) => (path === '/' ? SITE_URL : `${SITE_URL}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) => {
    const path = pagePath(page);
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([lang, href]) => [lang, absolute(href)]),
    );

    return LOCALES.map(lang => ({
      url: absolute(localeHref(lang, path)),
      alternates: { languages },
    }));
  });
}
