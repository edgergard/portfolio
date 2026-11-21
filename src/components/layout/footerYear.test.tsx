import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/lib/i18n-client';
import en from '@/translations/en.json';
import Footer from './Footer';
import FooterYear from './FooterYear';

const footer = () => (
  <I18nProvider lang="en" dict={en}>
    <Footer />
  </I18nProvider>
);

/** React separates adjacent text nodes with empty comments in server HTML. */
const text = (html: string) => html.replace(/<!-- -->/g, '');

describe('footer year', () => {
  afterEach(() => vi.useRealTimers());

  it('prerenders the build year and shows the visit year on the client', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-21T12:00:00Z'));
    const html = renderToString(footer());

    vi.setSystemTime(new Date('2027-01-02T12:00:00Z'));
    render(footer());

    expect(text(html)).toContain('© 2026');
    expect(screen.getByText(/© 2027/)).toBeInTheDocument();
  });

  it('keeps the build year it was given in server HTML, whatever the date', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2027-01-02T12:00:00Z'));

    expect(renderToString(<FooterYear buildYear={2026} />)).toBe('2026');
    render(<FooterYear buildYear={2026} />);
    expect(screen.getByText('2027')).toBeInTheDocument();
  });
});
