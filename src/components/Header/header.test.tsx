import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/lib/i18n-client';
import type { Lang } from '@/lib/locale';
import en from '@/translations/en.json';
import ua from '@/translations/ua.json';
import Header from '.';

/** Stops a followed link before jsdom tries (and fails) to load the page. */
const stopNavigation = (e: Event) => e.preventDefault();

const renderHeader = (lang: Lang, pathname: string, search = '') => {
  vi.mocked(usePathname).mockReturnValue(pathname);
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(search) as unknown as ReturnType<typeof useSearchParams>,
  );

  return render(
    <I18nProvider lang={lang} dict={lang === 'uk' ? ua : en}>
      <Header />
    </I18nProvider>,
  );
};

describe('Header links', () => {
  beforeEach(() => {
    window.addEventListener('click', stopNavigation);
    document.cookie = 'lang=; path=/; max-age=0';
  });

  afterEach(() => {
    window.removeEventListener('click', stopNavigation);
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('points section links at the English home page without a prefix', () => {
    renderHeader('en', '/');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/#about');
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv');
    expect(screen.getByTestId('brand')).toHaveAttribute('href', '/#hero');
  });

  it('points section links at the Ukrainian home page under /uk', () => {
    renderHeader('uk', '/uk');
    expect(screen.getByRole('link', { name: ua.nav_about })).toHaveAttribute('href', '/uk#about');
    expect(screen.getByRole('link', { name: ua.nav_cv })).toHaveAttribute('href', '/uk/cv');
    expect(screen.getByTestId('brand')).toHaveAttribute('href', '/uk#hero');
  });

  it('switches to UA on the same page, keeping the query, and remembers the choice', () => {
    renderHeader('en', '/cv/frontend', 'view=pdf');
    const setCookie = vi.spyOn(document, 'cookie', 'set');
    const toUa = screen.getByRole('link', { name: 'UA' });

    expect(toUa).toHaveAttribute('href', '/uk/cv/frontend?view=pdf');
    fireEvent.click(toUa);
    expect(setCookie).toHaveBeenCalledWith('lang=uk; path=/; max-age=31536000; samesite=lax');
    // A plain link: the browser loads the new page in full (the root layout is per locale).
    expect(toUa).toHaveAttribute('href', '/uk/cv/frontend?view=pdf');
  });

  it('switches back to EN without the /uk prefix', () => {
    renderHeader('uk', '/uk/cv/frontend', 'view=pdf');
    const toEn = screen.getByRole('link', { name: 'EN' });

    expect(toEn).toHaveAttribute('href', '/cv/frontend?view=pdf');
    fireEvent.click(toEn);
    expect(document.cookie).toContain('lang=en');
    expect(toEn).toHaveAttribute('href', '/cv/frontend?view=pdf');
  });

  it('links to the public URLs while English is prerendered under its internal /en path', () => {
    renderHeader('en', '/en/cv/frontend');
    expect(screen.getByRole('link', { name: 'UA' })).toHaveAttribute('href', '/uk/cv/frontend');
    expect(screen.getByRole('link', { name: 'EN' })).toHaveAttribute('href', '/cv/frontend');
  });

  it('keeps the section the visitor is on when switching', () => {
    window.location.hash = '#contact';
    renderHeader('en', '/');
    const toUa = screen.getByRole('link', { name: 'UA' });

    fireEvent.click(toUa);
    expect(toUa).toHaveAttribute('href', '/uk#contact');
  });

  it('marks the active language as pressed', () => {
    const { unmount } = renderHeader('en', '/');

    expect(screen.getByRole('link', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: 'UA' })).toHaveAttribute('aria-pressed', 'false');
    unmount();

    renderHeader('uk', '/uk');
    expect(screen.getByRole('link', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('link', { name: 'UA' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the menu toggle labels translated', () => {
    renderHeader('uk', '/uk');
    expect(screen.getByRole('button', { name: ua.nav_menu_open })).toBeInTheDocument();
  });
});
