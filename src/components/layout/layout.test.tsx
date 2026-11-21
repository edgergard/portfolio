import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '@/lib/i18n-client';
import en from '@/translations/en.json';
import ua from '@/translations/ua.json';
import Header from '../Header';
import Section from './Section';
import Footer from './Footer';

afterEach(() => {
  localStorage.clear();
  document.cookie = 'lang=; path=/; max-age=0';
});

const inEnglish = (ui: ReactNode) => <I18nProvider lang="en" dict={en}>{ui}</I18nProvider>;

const renderHeader = () => render(inEnglish(<Header />));
const renderInEnglish = (ui: ReactNode) => render(inEnglish(ui));

describe('Header', () => {
  it('renders the nav links and CV points at the /cv route', () => {
    renderHeader();
    for (const name of ['Work', 'Experience', 'About', 'Contact', 'CV']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }

    expect(screen.getByRole('link', { name: 'CV' }).getAttribute('href')).toMatch(/\/cv$/);
  });

  it('switches language to UA', () => {
    renderHeader();
    const toUa = screen.getByRole('link', { name: 'UA' });

    expect(toUa).toHaveAttribute('href', '/uk');
    // Stop the followed link before jsdom tries (and fails) to load the page.
    const stop = (e: Event) => e.preventDefault();

    window.addEventListener('click', stop);
    fireEvent.click(toUa);
    window.removeEventListener('click', stop);
    expect(document.cookie).toContain('lang=uk');
  });
});

describe('Section', () => {
  it('renders the padded index and translated label', () => {
    renderInEnglish(
      <Section id="experience" index={2} labelKey="section_experience">
        <p>body</p>
      </Section>,
    );
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Experience/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Experience/ })).toBe(document.getElementById('experience'));
    expect(document.getElementById('experience')).toBeInTheDocument();
  });

  it('puts the label above the content instead of in a sticky side column', () => {
    renderInEnglish(
      <Section id="about" index={1} labelKey="section_about">
        <p>body</p>
      </Section>,
    );
    const heading = screen.getByRole('heading', { level: 2 });

    expect(heading.className).not.toMatch(/sticky/);
    expect(heading.parentElement?.className).not.toMatch(/280px/);
    expect(heading.compareDocumentPosition(screen.getByText('body')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('centres the label horizontally above the content', () => {
    renderInEnglish(
      <Section id="about" index={1} labelKey="section_about">
        <p>body</p>
      </Section>,
    );
    const heading = screen.getByRole('heading', { level: 2 });

    expect(heading).toHaveClass('justify-center', 'text-center');
  });

  it('renders a bleed slot outside the centred column', () => {
    renderInEnglish(
      <Section id="about" index={1} labelKey="section_about" bleed={<div data-testid="band" />}>
        <p>body</p>
      </Section>,
    );
    const band = screen.getByTestId('band');

    expect(band.closest('[class*="max-w-[1120px]"]')).toBeNull();
    expect(screen.getByText('body').closest('[class*="max-w-[1120px]"]')).not.toBeNull();
    expect(screen.getByText('body').compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('ends flush with a bleed band: no bottom padding after it', () => {
    renderInEnglish(
      <Section id="about" index={1} labelKey="section_about" bleed={<div data-testid="band" />}>
        <p>body</p>
      </Section>,
    );
    const section = document.getElementById('about')!;
    const padded = [section, ...section.querySelectorAll('*')].filter(el => /(^|\s)(min-\[900px\]:)?pb-/.test(el.className));

    expect(padded).toEqual([]);
    expect(section.lastElementChild).toBe(screen.getByTestId('band'));
  });

  it('keeps the bottom padding when there is no bleed band', () => {
    renderInEnglish(
      <Section id="experience" index={2} labelKey="section_experience">
        <p>body</p>
      </Section>,
    );
    expect(screen.getByText('body').closest('[class*="max-w-[1120px]"]')).toHaveClass('pb-20');
  });

  it('renders the translated label on the server, in the page language', () => {
    const section = <Section id="experience" index={2} labelKey="section_experience"><p>body</p></Section>;

    expect(renderToString(inEnglish(section))).toMatch(/<span>Experience<\/span>/);
    expect(renderToString(<I18nProvider lang="uk" dict={ua}>{section}</I18nProvider>)).toMatch(/<span>Досвід<\/span>/);
  });
});

describe('Footer', () => {
  it('shows the current year', () => {
    render(inEnglish(<Footer />));
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });

  it('no longer credits React & Three.js', () => {
    render(inEnglish(<Footer />));
    expect(screen.queryByText(/Three.js/)).not.toBeInTheDocument();
  });

  it('contains Back to top', () => {
    render(inEnglish(<Footer />));
    expect(screen.getByText(/Back to top/)).toBeInTheDocument();
  });
});
