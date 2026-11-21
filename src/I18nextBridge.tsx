import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nProvider } from './lib/i18n-client';
import { EN, UA } from './translations';

/**
 * Vite-era bridge, removed in Task 12: feeds the Next.js I18nProvider from the active i18next
 * language, so components migrated to useT keep working in the old app and its tests.
 */
const I18nextBridge = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const uk = i18n.language === 'ua';

  return (
    <I18nProvider lang={uk ? 'uk' : 'en'} dict={uk ? UA : EN}>
      {children}
    </I18nProvider>
  );
};

export default I18nextBridge;
