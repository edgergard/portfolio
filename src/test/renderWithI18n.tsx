import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { I18nProvider } from '../lib/i18n-client';
import type { Lang } from '../lib/locale';
import { EN, UA } from '../translations';

export const dictFor = (lang: Lang) => (lang === 'uk' ? UA : EN);

/** Renders a component inside the Next.js I18nProvider, in the given language. */
export const renderWithI18n = (ui: ReactElement, lang: Lang = 'en') =>
  render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <I18nProvider lang={lang} dict={dictFor(lang)}>
        {children}
      </I18nProvider>
    ),
  });
