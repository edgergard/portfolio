import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import en from '@/translations/en.json';
import { I18nProvider, useLang, useT } from './i18n-client';

function Probe() {
  const t = useT();
  const lang = useLang();

  return (
    <>
      <p data-testid="archive">{t('projects_archive_title', { count: 6 })}</p>
      <p data-testid="missing">{t('missing_key')}</p>
      <p data-testid="lang">{lang}</p>
    </>
  );
}

describe('I18nProvider', () => {
  it('substitutes placeholders, returns the key when missing and exposes the lang', () => {
    render(
      <I18nProvider lang="en" dict={en}>
        <Probe />
      </I18nProvider>,
    );
    expect(screen.getByTestId('archive')).toHaveTextContent(en.projects_archive_title.replace('{{count}}', '6'));
    expect(screen.getByTestId('missing')).toHaveTextContent('missing_key');
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
  });
});
