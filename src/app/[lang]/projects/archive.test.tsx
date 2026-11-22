import archiveCss from '../../../../styles.css?raw';
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import en from '@/translations/en.json';
import ua from '@/translations/ua.json';
import { PROJECT_LIST } from '@/data/projects';
import type { Lang } from '@/lib/locale';
import { renderWithI18n } from '@/test/renderWithI18n';
import ArchivePage, { generateMetadata } from './page';
import { generateStaticParams } from '../layout';

// The [lang] layout (imported for its static params) imports the global stylesheet, which jsdom
// cannot parse; the ?raw import above still reads it as text.
vi.mock('../../../../styles.css', () => ({}));

const renderPage = (lang: Lang = 'en') => renderWithI18n(<ArchivePage />, lang);

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});
afterEach(cleanup);

describe('ArchivePage', () => {
  it('renders breadcrumb, heading and a row per project', () => {
    renderPage();
    const crumbs = screen.getByRole('navigation', { name: /breadcrumb/i });

    expect(crumbs).toHaveTextContent('Home / Archive');
    expect(within(crumbs).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('heading', { level: 1, name: 'All projects' })).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByTestId('archive-row')).toHaveLength(PROJECT_LIST.length);
    expect(PROJECT_LIST).toHaveLength(6);
  });

  it('shows counted filter buttons with aria-pressed and no Commercial filter', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'All · 6' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Mobile · 0' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Web · 6' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('button', { name: /commercial/i })).toBeNull();
  });

  it('Web keeps 6 rows; Mobile shows the empty state instead of a blank table', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Web · 6' }));
    expect(screen.getByRole('button', { name: 'Web · 6' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByTestId('archive-row')).toHaveLength(6);

    fireEvent.click(screen.getByRole('button', { name: 'Mobile · 0' }));
    expect(screen.queryAllByTestId('archive-row')).toHaveLength(0);
    expect(screen.getByText(en.archive_empty)).toBeInTheDocument();
  });

  it('each row has thumbnail, year, name, description, type, chips and labelled links', () => {
    renderPage();
    const rows = screen.getAllByTestId('archive-row');

    PROJECT_LIST.forEach((p, i) => {
      const row = within(rows[i]);
      const img = rows[i].querySelector('img')!;

      expect(img).toHaveAttribute('loading', 'lazy');
      // next/image (mocked as a plain <img>); static imports are plain URLs under vitest.
      expect(img).toHaveAttribute('src', typeof p.poster === 'string' ? p.poster : p.poster.src);
      expect(row.getByText(String(p.year))).toBeInTheDocument();
      expect(row.getByText(p.name)).toBeInTheDocument();
      expect(row.getByText((en as Record<string, string>)[p.description])).toBeInTheDocument();
      expect(row.getByText('Web')).toBeInTheDocument();
      p.stack.forEach(s => expect(row.getByText(s)).toBeInTheDocument());
      expect(row.getByRole('link', { name: `Live demo — ${p.name}` })).toHaveAttribute('href', p.demolink);
      expect(row.getByRole('link', { name: `Code — ${p.name}` })).toHaveAttribute('href', p.codelink);
    });
  });

  it('shows stack badges on the live wine fill, like the Experience badges', () => {
    renderPage();
    const badges = screen.getAllByTestId('archive-badge');

    expect(badges.length).toBeGreaterThan(6);
    badges.forEach(b => {
      expect(b).toHaveClass('bg-wine-flow');
      expect(b.querySelector('canvas')).not.toBeNull();
    });
  });

  it('sits on the live wine shader with the list in a glass panel', () => {
    renderPage();
    const wine = screen.getByTestId('archive-wine');

    // Sized by the largest viewport (100lvh), so a phone's sliding browser bars never resize the canvas.
    expect(wine).toHaveClass('bg-wine-flow', 'fixed', 'inset-x-0', 'top-0', 'h-[100lvh]');
    expect(wine).not.toHaveClass('inset-0');
    expect(within(wine).getByTestId('wine-surface')).toBeInTheDocument();
    expect(screen.getByTestId('archive-page')).toHaveClass('on-wine', 'isolate');
    expect(within(screen.getByTestId('archive-glass')).getByRole('table')).toBeInTheDocument();
  });

  it('hovers only on desktop; on phones a tap shows a rounded highlight with side room', () => {
    renderPage();
    const row = screen.getAllByTestId('archive-row')[0];

    expect(row.className).toContain('min-[900px]:hover:bg-');
    expect(row.className).not.toMatch(/(^|s)hover:bg-/);
    expect(row).toHaveClass(
      '[-webkit-tap-highlight-color:transparent]',
      'max-[899px]:before:rounded-2xl',
      'max-[899px]:before:-inset-x-3',
      'max-[899px]:active:before:opacity-100',
    );
  });

  it('shows the type pill in white text with a white border', () => {
    renderPage();
    screen.getAllByTestId('archive-type').forEach(pill => {
      expect(pill).toHaveClass('text-white', 'border-white');
    });
  });

  it('scrolls to top on mount', () => {
    renderPage();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('has EN and UA strings for every archive key', () => {
    const keys = Object.keys(en).filter(k => k.startsWith('archive_'));

    expect(keys.length).toBeGreaterThan(8);
    keys.forEach(k => expect(ua).toHaveProperty(k));
  });

  it('renders in Ukrainian', () => {
    renderPage('uk');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(ua.archive_title);
    expect(screen.getByRole('link', { name: ua.archive_crumb_home })).toHaveAttribute('href', '/uk');
  });
});

describe('route', () => {
  it('is prerendered for en and uk (static params from [lang]) with per-locale metadata', async () => {
    expect(generateStaticParams()).toEqual([{ lang: 'en' }, { lang: 'uk' }]);
    const meta = await generateMetadata({ params: Promise.resolve({ lang: 'uk' }) });

    expect(meta.title).toBe(ua.meta_projects_title);
    expect(meta.alternates?.canonical).toBe('/uk/projects');
  });
});

describe('archive row dividers', () => {
  it('turns the row and header dividers white on the wine glass in the light theme', () => {
    expect(archiveCss).toMatch(/:root\[data-theme='light'\] \[data-testid='archive-row'\],\s*:root\[data-theme='light'\] \[data-testid='archive-head'\] \{\s*border-color: rgba\(255, 255, 255/);
  });
});
