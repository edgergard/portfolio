import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import en from '../../translations/en.json';
import ua from '../../translations/ua.json';
import { PROJECT_LIST } from '../../data/projects';
import { Root } from '../../Root';
import ArchivePage from '../ArchivePage';

// Header/Footer pull in the shader and router internals; the page is tested on its own.
vi.mock('../../App', async () => {
  const { Outlet } = await import('react-router');

  return { default: () => <Outlet /> };
});
vi.mock('../Home', () => ({ default: () => <div>home</div> }));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/projects']}>
      <ArchivePage />
    </MemoryRouter>,
  );

beforeEach(async () => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  await act(async () => {
    await i18n.changeLanguage('en');
  });
});
afterEach(cleanup);

describe('ArchivePage', () => {
  it('renders breadcrumb, heading and a row per project', () => {
    renderPage();
    const crumbs = screen.getByRole('navigation', { name: /breadcrumb/i });

    expect(crumbs).toHaveTextContent('Home / Archive');
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
      expect(img).toHaveAttribute('src', p.poster);
      expect(row.getByText(String(p.year))).toBeInTheDocument();
      expect(row.getByText(p.name)).toBeInTheDocument();
      expect(row.getByText((en as Record<string, string>)[p.description])).toBeInTheDocument();
      expect(row.getByText('Web')).toBeInTheDocument();
      p.stack.forEach(s => expect(row.getByText(s)).toBeInTheDocument());
      expect(row.getByRole('link', { name: `Live demo — ${p.name}` })).toHaveAttribute('href', p.demolink);
      expect(row.getByRole('link', { name: `Code — ${p.name}` })).toHaveAttribute('href', p.codelink);
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

  it('renders in Ukrainian', async () => {
    await act(async () => {
      await i18n.changeLanguage('ua');
    });
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(ua.archive_title);
  });
});

describe('route', () => {
  it('Root registers /projects', () => {
    window.location.hash = '#/projects';
    render(<Root />);
    expect(screen.getByRole('heading', { level: 1, name: 'All projects' })).toBeInTheDocument();
    window.location.hash = '';
  });

  it('a MemoryRouter /projects route renders the page', () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route path="/projects" element={<ArchivePage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
