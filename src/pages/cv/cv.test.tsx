import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { act } from '@testing-library/react';
import i18n from '../../i18n';
import { CVS } from '../../data/cv';
import { CVS_UA } from '../../data/cv.ua';
import { getCv } from '../../data/cvs';
import Footer from '../../components/layout/Footer';
import Header from '../../components/Header';
import CvPage from '../CvPage';

const Probe = () => <span data-testid="loc">{useLocation().search}</span>;

const renderAt = (search = '') =>
  render(
    <MemoryRouter initialEntries={[`/cv${search}`]}>
      <CvPage />
      <Probe />
    </MemoryRouter>,
  );

const mockNarrow = (matches: boolean) =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: matches && query === '(max-width: 899px)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );

const scrollTo = vi.fn();

beforeEach(() => {
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  scrollTo.mockClear();
});
afterEach(() => vi.restoreAllMocks());

describe('CvPage', () => {
  const sw = (name: string) => screen.getByRole('switch', { name });

  it('defaults to React Native and the PDF view', () => {
    mockNarrow(false);
    const { container } = renderAt();

    expect(sw('React Native')).toHaveAttribute('aria-checked', 'true');
    expect(sw('PDF')).toHaveAttribute('aria-checked', 'true');
    expect(container.querySelector('object[type="application/pdf"]')).not.toBeNull();
    expect(screen.getByText(CVS['react-native'].title)).toBeInTheDocument();
  });

  it('reads ?v=frontend&view=web', () => {
    renderAt('?v=frontend&view=web');
    expect(sw('React Native')).toHaveAttribute('aria-checked', 'false');
    expect(sw('PDF')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText(CVS.frontend.summary)).toBeInTheDocument();
  });

  it('falls back to React Native and PDF for invalid params', () => {
    renderAt('?v=bogus&view=x');
    expect(sw('React Native')).toHaveAttribute('aria-checked', 'true');
    expect(sw('PDF')).toHaveAttribute('aria-checked', 'true');
  });

  it('renders the switches as labelled toggles: Frontend / React Native and Web / PDF', () => {
    renderAt();
    const version = screen.getByRole('group', { name: 'CV version' });
    const view = screen.getByRole('group', { name: 'CV view' });

    expect(version.textContent).toMatch(/Frontend.*React Native/);
    expect(view.textContent).toMatch(/Web.*PDF/);
    expect(within(version).getByRole('switch')).toBe(sw('React Native'));
    expect(within(view).getByRole('switch')).toBe(sw('PDF'));
  });

  it('toggling the version switch writes v=frontend to the URL and back', () => {
    renderAt('?view=web');
    fireEvent.click(sw('React Native'));
    expect(screen.getByTestId('loc').textContent).toContain('v=frontend');
    expect(sw('React Native')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText(CVS.frontend.title)).toBeInTheDocument();
    fireEvent.click(sw('React Native'));
    expect(screen.getByTestId('loc').textContent).toContain('v=react-native');
  });

  it('toggling the view switch writes view=web and shows the web CV', () => {
    renderAt();
    fireEvent.click(sw('PDF'));
    expect(screen.getByTestId('loc').textContent).toContain('view=web');
    expect(screen.getByText(CVS['react-native'].summary)).toBeInTheDocument();
  });

  it('clicking a side label selects that side', () => {
    renderAt();
    const view = screen.getByRole('group', { name: 'CV view' });

    fireEvent.click(within(view).getByText('Web'));
    expect(sw('PDF')).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(within(view).getByText('Web'));
    expect(sw('PDF')).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(within(view).getByText('PDF'));
    expect(sw('PDF')).toHaveAttribute('aria-checked', 'true');
  });

  it('switches are native buttons (Space/Enter) with a visible focus ring', () => {
    renderAt();
    const s = sw('PDF');

    expect(s.tagName).toBe('BUTTON');
    expect(s).toHaveAttribute('type', 'button');
    expect(s.className).toMatch(/focus-visible:outline/);
  });

  it('Download PDF links to the selected PDF with the download attribute', () => {
    renderAt('?v=frontend');
    const link = screen.getByRole('link', { name: /Download PDF/ });

    expect(link.getAttribute('href')).toMatch(/oleksandr-bryksin-frontend-cv\.pdf$/);
    expect(link).toHaveAttribute('download');
  });

  it('PDF view renders an <object type="application/pdf"> on desktop', () => {
    mockNarrow(false);
    const { container } = renderAt('?view=pdf');
    const obj = container.querySelector('object[type="application/pdf"]');

    expect(obj).not.toBeNull();
    expect(obj?.getAttribute('data')).toMatch(/oleksandr-bryksin-react-native-cv\.pdf/);
  });

  it('PDF view on mobile shows Open PDF and Download links, no <object>', () => {
    mockNarrow(true);
    const { container } = renderAt('?view=pdf');

    expect(container.querySelector('object')).toBeNull();
    expect(screen.getByRole('link', { name: 'Open PDF' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('download');
  });

  it('shows the location and the grouped Pecode projects with titles', () => {
    renderAt('?view=web');
    expect(screen.getByText(CVS['react-native'].location)).toBeInTheDocument();
    const titles = CVS['react-native'].experience[0].projects!.map(p => p.title);

    expect(titles.length).toBeGreaterThanOrEqual(3);
    for (const title of titles) {
      expect(screen.getByRole('heading', { level: 4, name: new RegExp(title) })).toBeInTheDocument();
    }

    expect(screen.getAllByTestId('cv-project')).toHaveLength(titles.length);
  });

  it('project titles in experience are white, company keeps the coral tint', () => {
    renderAt('?view=web');
    const h4 = screen.getAllByTestId('cv-project')[0].querySelector('h4')!;

    expect(h4.className).not.toMatch(/FFC2CC/i);
    expect(h4).toHaveClass('text-ink');
    expect(screen.getAllByText(/· Pecode/)[0].className).toMatch(/FF8A9B/);
  });

  it('runs the skills as a full-bleed Wine band with the CV groups and pills', () => {
    renderAt('?view=web');
    const panel = screen.getByTestId('skills-panel');
    const doc = CVS['react-native'];

    expect(panel).toHaveClass('bg-wine-flow');
    expect(within(panel).getByTestId('wine-surface')).toBeInTheDocument();
    expect(panel.closest('[class*="max-w-"]')).toBeNull();
    for (const g of doc.skills) {
      expect(within(panel).getByText(g.group)).toBeInTheDocument();
    }

    expect(within(panel).getAllByTestId('skill-pill')).toHaveLength(doc.skills.flatMap(g => g.items).length);
    expect(within(panel).getByTestId('skills-column')).toHaveClass('relative', 'mx-auto');
  });

  it('shows the education as wine-edge cards with kind, period, institution and programme', () => {
    renderAt('?view=web');
    const cards = screen.getAllByTestId('edu-card');
    const doc = CVS['react-native'];

    expect(cards).toHaveLength(doc.education.length);
    cards.forEach(c => expect(c).toHaveClass('wine-edge'));
    const nuft = cards[0];

    expect(within(nuft).getByText('University')).toBeInTheDocument();
    expect(within(nuft).getByText('2026 – present')).toBeInTheDocument();
    expect(within(nuft).getByRole('heading', { level: 4 })).toHaveTextContent('National University of Food Technologies');
    expect(within(nuft).getByText(/B\.Sc\. in Software Engineering/)).toBeInTheDocument();
    const mate = cards.find(c => within(c).queryByText('Mate Academy'))!;

    expect(within(mate).getByText('Course')).toBeInTheDocument();
  });

  it('shows the languages as wine-edge cards with a large level and sublabel', () => {
    renderAt('?view=web');
    const cards = screen.getAllByTestId('lang-card');

    expect(cards).toHaveLength(2);
    cards.forEach(c => expect(c).toHaveClass('wine-edge'));
    expect(within(cards[0]).getByText('Ukrainian')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Native')).toBeInTheDocument();
    expect(within(cards[1]).getByText('English')).toBeInTheDocument();
    expect(within(cards[1]).getByText('C1')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Advanced · EF SET C2')).toBeInTheDocument();
  });

  it('localises the education kind and languages in UA', async () => {
    await act(async () => {
      await i18n.changeLanguage('ua');
    });
    renderAt('?view=web');
    const edu = screen.getAllByTestId('edu-card');
    const langs = screen.getAllByTestId('lang-card');

    expect(within(edu[0]).getByText('Університет')).toBeInTheDocument();
    expect(within(langs[0]).getByText('Українська')).toBeInTheDocument();
    expect(within(langs[0]).getByText('Рідна')).toBeInTheDocument();
    expect(within(langs[1]).getByText('Просунутий · EF SET C2')).toBeInTheDocument();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('keeps the CV name outside elements the print rule hides', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/cv']}>
        <Header />
        <CvPage />
        <Footer />
      </MemoryRouter>,
    );
    const hidden = Array.from(container.querySelectorAll('.site-chrome, .cv-no-print'));

    expect(container.querySelector('header.site-chrome')).not.toBeNull();
    expect(container.querySelector('footer.site-chrome')).not.toBeNull();
    const h1 = screen.getByRole('heading', { level: 1, name: 'Oleksandr Bryksin' });

    expect(hidden.some(el => el.contains(h1))).toBe(false);
  });

  it('scrolls to top on mount', () => {
    renderAt();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('does not show a phone number', () => {
    renderAt('?view=web');
    expect(document.body.textContent).not.toMatch(/\+380|tel:/);
  });
});

describe('CVS data', () => {
  for (const doc of Object.values(CVS)) {
    it(`${doc.variant} has summary and experience`, () => {
      expect(doc.summary.length).toBeGreaterThan(0);
      expect(doc.experience.length).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('CvPage localisation', () => {
  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('shows the Ukrainian title and summary in UA, and English again after switching back', async () => {
    renderAt('?view=web');
    expect(screen.getByText(CVS['react-native'].title)).toBeInTheDocument();
    expect(screen.getByText(CVS['react-native'].summary)).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('ua');
    });
    expect(screen.getByText(CVS_UA['react-native'].title)).toBeInTheDocument();
    expect(screen.getByText(CVS_UA['react-native'].summary)).toBeInTheDocument();
    expect(screen.queryByText(CVS['react-native'].title)).toBeNull();

    await act(async () => {
      await i18n.changeLanguage('en');
    });
    expect(screen.getByText(CVS['react-native'].title)).toBeInTheDocument();
    expect(screen.getByText(CVS['react-native'].summary)).toBeInTheDocument();
  });

  it('UA translation mirrors the EN structure for both variants', () => {
    for (const v of ['react-native', 'frontend'] as const) {
      const en = CVS[v];
      const ua = CVS_UA[v];

      const projCount = (d: typeof en) => d.experience.map(j => j.projects?.length ?? 0);

      expect(projCount(ua)).toEqual(projCount(en));
      expect(ua.experience.map(j => j.bullets.length)).toEqual(
        en.experience.map(j => j.bullets.length),
      );
      expect(ua.skills.map(s => s.items.length)).toEqual(en.skills.map(s => s.items.length));
      expect(ua.education).toHaveLength(en.education.length);
      expect(ua.summary).not.toBe(en.summary);
      expect(ua.pdf).toBe(en.pdf);
      expect(ua.experience.map(j => j.company)).toEqual(en.experience.map(j => j.company));
    }
  });

  it('getCv picks UA for ua/uk codes and EN otherwise', () => {
    expect(getCv('frontend', 'ua')).toBe(CVS_UA.frontend);
    expect(getCv('frontend', 'uk-UA')).toBe(CVS_UA.frontend);
    expect(getCv('frontend', 'en')).toBe(CVS.frontend);
  });

  it('shows the HYS role in Ukrainian UA', async () => {
    await act(async () => {
      await i18n.changeLanguage('ua');
    });
    renderAt('?view=web');
    const hys = CVS_UA['react-native'].experience.find(j => j.company === 'HYS Enterprise');

    expect(hys?.role).toBe('Frontend-розробник');
    expect(CVS_UA.frontend.experience.find(j => j.company === 'HYS Enterprise')?.role).toBe(hys?.role);
    expect(screen.getAllByText(hys!.role).length).toBeGreaterThan(0);
  });
});
