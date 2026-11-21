import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '@/lib/i18n-client';
import type { Lang } from '@/lib/locale';
import { dictFor } from '@/test/renderWithI18n';
import HomePage from './page';

const sectionIds = (lang: Lang) => {
  const html = renderToString(
    <I18nProvider lang={lang} dict={dictFor(lang)}>
      <HomePage />
    </I18nProvider>,
  );

  return [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('section')].map(s => s.id);
};

describe('home page', () => {
  // Contact (Task 9) joins after these.
  it.each(['en', 'uk'] as const)('renders the migrated sections in the home order (%s)', lang => {
    expect(sectionIds(lang)).toEqual(['hero', 'about', 'experience', 'projects', 'certifications']);
  });
});
