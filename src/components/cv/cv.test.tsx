import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CvIndexPage from '@/app/[lang]/cv/page';
import CvVariantPage, { dynamicParams, generateStaticParams } from '@/app/[lang]/cv/[variant]/page';
import Header from '@/components/Header';
import Footer from '@/components/layout/Footer';
import { CVS, type CvVariant } from '@/data/cv';
import { CVS_UA } from '@/data/cv.ua';
import { getCv } from '@/data/cvs';
import { I18nProvider } from '@/lib/i18n-client';
import type { Lang } from '@/lib/locale';
import { dictFor, renderWithI18n } from '@/test/renderWithI18n';
import CvViewSwitch from './CvViewSwitch';

const replace = vi.fn();

const mockSearch = (search: string) =>
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(search) as unknown as ReturnType<typeof useSearchParams>,
  );

const renderCv = ({ variant = 'react-native', lang = 'en', search = '' }: { variant?: CvVariant; lang?: Lang; search?: string } = {}) => {
  mockSearch(search);

  return renderWithI18n(<CvViewSwitch doc={getCv(variant, lang)} />, lang);
};

beforeEach(() => {
  replace.mockClear();
  vi.mocked(useRouter).mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
  vi.mocked(usePathname).mockReturnValue('/cv/react-native');
});
afterEach(() => {
  mockSearch('');
});

describe('CV routes', () => {
  it('prerenders both variants and nothing else', () => {
    expect(generateStaticParams()).toEqual([{ variant: 'react-native' }, { variant: 'frontend' }]);
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams().map(p => p.variant)).not.toContain('bogus');
  });

  it('server-renders the web CV by default', async () => {
    const page = await CvVariantPage({ params: Promise.resolve({ lang: 'en', variant: 'frontend' }) });
    const html = renderToString(
      <I18nProvider lang="en" dict={dictFor('en')}>
        {page}
      </I18nProvider>,
    );

    expect(html).toContain(CVS.frontend.title);
    expect(html).toContain(CVS.frontend.summary);
    expect(html).not.toContain('application/pdf');
  });

  it('server-renders the Ukrainian CV under /uk', async () => {
    const page = await CvVariantPage({ params: Promise.resolve({ lang: 'uk', variant: 'react-native' }) });
    const html = renderToString(
      <I18nProvider lang="uk" dict={dictFor('uk')}>
        {page}
      </I18nProvider>,
    );

    expect(html).toContain(CVS_UA['react-native'].summary);
  });

  it.each([
    ['en', '/cv/react-native'],
    ['uk', '/uk/cv/react-native'],
  ])('/cv redirects to the React Native variant (%s)', async (lang, to) => {
    await expect(CvIndexPage({ params: Promise.resolve({ lang }) })).rejects.toThrow(`NEXT_REDIRECT ${to}`);
  });
});

describe('CvViewSwitch', () => {
  const radio = (name: string) => screen.getByRole('radio', { name });

  it('defaults to the web view', () => {
    const { container } = renderCv();

    expect(radio('React Native')).toHaveAttribute('aria-checked', 'true');
    expect(radio('Web')).toHaveAttribute('aria-checked', 'true');
    expect(radio('Frontend')).toHaveAttribute('aria-checked', 'false');
    expect(radio('PDF')).toHaveAttribute('aria-checked', 'false');
    expect(container.querySelector('object')).toBeNull();
    expect(screen.getByText(CVS['react-native'].title)).toBeInTheDocument();
    expect(screen.getByText(CVS['react-native'].summary)).toBeInTheDocument();
  });

  it('?view=pdf shows the PDF <object> and the open-PDF link', () => {
    const { container } = renderCv({ variant: 'frontend', search: '?view=pdf' });
    const obj = container.querySelector('object[type="application/pdf"]');

    expect(radio('PDF')).toHaveAttribute('aria-checked', 'true');
    expect(obj?.getAttribute('data')).toBe('/cv/oleksandr-bryksin-frontend-cv.pdf');
    expect(screen.getAllByRole('link', { name: 'Open PDF' })[0]).toHaveAttribute('target', '_blank');
    expect(screen.queryByText(CVS.frontend.summary)).toBeNull();
  });

  it('the PDF layout is picked by CSS: buttons below 900px, the <object> above', () => {
    const { container } = renderCv({ search: '?view=pdf' });
    const narrow = screen.getByTestId('cv-pdf-narrow');

    expect(narrow).toHaveClass('flex', 'min-[900px]:hidden');
    expect(within(narrow).getByRole('link', { name: 'Open PDF' })).toHaveAttribute('target', '_blank');
    expect(within(narrow).getByRole('link', { name: 'Download' })).toHaveAttribute('download');
    expect(container.querySelector('object')).toHaveClass('hidden', 'min-[900px]:block');
  });

  it('the variant toggle links to each variant path', () => {
    renderCv();
    expect(radio('React Native')).toHaveAttribute('href', '/cv/react-native');
    expect(radio('Frontend')).toHaveAttribute('href', '/cv/frontend');
  });

  it('the variant links keep ?view=pdf', () => {
    renderCv({ search: '?view=pdf' });
    expect(radio('React Native')).toHaveAttribute('href', '/cv/react-native?view=pdf');
    expect(radio('Frontend')).toHaveAttribute('href', '/cv/frontend?view=pdf');
  });

  it('the variant links carry the /uk prefix in Ukrainian', () => {
    renderCv({ lang: 'uk' });
    expect(within(screen.getByRole('radiogroup', { name: 'Версія CV' })).getAllByRole('radio').map(r => r.getAttribute('href')))
      .toEqual(['/uk/cv/react-native', '/uk/cv/frontend']);
  });

  it('renders two segmented radiogroups: [React Native | Frontend] and [Web | PDF]', () => {
    renderCv();
    const version = screen.getByRole('radiogroup', { name: 'CV version' });
    const view = screen.getByRole('radiogroup', { name: 'CV view' });

    expect(within(version).getAllByRole('radio').map(r => r.textContent)).toEqual(['React Native', 'Frontend']);
    expect(within(view).getAllByRole('radio').map(r => r.textContent)).toEqual(['Web', 'PDF']);
    expect(version).toHaveClass('rounded-full', 'border-chip', 'p-[3px]');
  });

  it('the wine highlight sits under the active option (instant under reduced motion)', () => {
    renderCv();
    const view = screen.getByRole('radiogroup', { name: 'CV view' });
    const hl = within(view).getByTestId('toggle-highlight');

    expect(hl).toHaveClass('border-wine-3', 'bg-wine/25', 'translate-x-0', 'transition-transform', 'motion-reduce:transition-none');
    expect(radio('Web')).toHaveClass('text-ink');
    expect(radio('PDF')).toHaveClass('text-muted-2');
  });

  it('clicking PDF writes view=pdf, clicking Web drops it', () => {
    renderCv();
    fireEvent.click(radio('PDF'));
    expect(replace).toHaveBeenLastCalledWith('/cv/react-native?view=pdf', { scroll: false });
    fireEvent.click(radio('Web'));
    expect(replace).toHaveBeenLastCalledWith('/cv/react-native', { scroll: false });
  });

  it('only the selected option is in the tab order, with a visible focus ring', () => {
    renderCv();
    expect(radio('Web')).toHaveAttribute('tabindex', '0');
    expect(radio('PDF')).toHaveAttribute('tabindex', '-1');
    expect(radio('Web').tagName).toBe('BUTTON');
    expect(radio('React Native').tagName).toBe('A');
    expect(radio('PDF').className).toMatch(/focus-visible:outline/);
    expect(radio('Frontend').className).toMatch(/focus-visible:outline/);
  });

  it('arrow keys, Home and End move the view selection and focus', async () => {
    const user = userEvent.setup();

    renderCv();
    radio('Web').focus();
    await user.keyboard('{End}');
    expect(radio('PDF')).toHaveFocus();
    expect(replace).toHaveBeenLastCalledWith('/cv/react-native?view=pdf', { scroll: false });
    await user.keyboard('{Home}');
    expect(radio('Web')).toHaveFocus();
    expect(replace).toHaveBeenLastCalledWith('/cv/react-native', { scroll: false });
  });

  it('arrow keys on the variant toggle follow the other variant link', async () => {
    const user = userEvent.setup();

    renderCv();
    const frontend = radio('Frontend');
    const click = vi.fn((e: MouseEvent) => e.preventDefault());

    frontend.addEventListener('click', click);
    await user.tab();
    expect(radio('React Native')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(click).toHaveBeenCalled();
    expect(frontend).toHaveFocus();
  });

  it('Download PDF links to the selected PDF with the download attribute', () => {
    renderCv({ variant: 'frontend' });
    const link = screen.getByRole('link', { name: /Download PDF/ });

    expect(link).toHaveAttribute('href', '/cv/oleksandr-bryksin-frontend-cv.pdf');
    expect(link).toHaveAttribute('download');
  });

  it('web view shows the four contact mini cards with platform in the accessible name', () => {
    renderCv();
    for (const name of [/^Email: oleksandrbryksin@gmail.com/, /^Telegram: @oleksandrbryksin/, /^LinkedIn: oleksandr-bryksin/, /^GitHub: edgergard/]) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
  });

  it('each contact tile holds a hidden live Wine canvas over its wine-flow fill', () => {
    renderCv();
    const link = screen.getByRole('link', { name: /^GitHub: edgergard/ });
    const tile = link.querySelector('.bg-wine-flow')!;
    const canvas = tile.querySelector('canvas')!;

    expect(tile).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toHaveClass('absolute', 'inset-0', '-z-[1]', 'opacity-0');
    expect(canvas.dataset.state).toBeDefined();
  });

  it('shows the location and the grouped Pecode projects with titles', () => {
    renderCv();
    expect(screen.getByText(CVS['react-native'].location)).toBeInTheDocument();
    const titles = CVS['react-native'].experience[0].projects!.map(p => p.title);

    expect(titles.length).toBeGreaterThanOrEqual(3);
    for (const title of titles) {
      expect(screen.getByRole('heading', { level: 4, name: new RegExp(title) })).toBeInTheDocument();
    }

    expect(screen.getAllByTestId('cv-project')).toHaveLength(titles.length);
  });

  it('project titles in experience are white, company keeps the coral tint', () => {
    renderCv();
    const h4 = screen.getAllByTestId('cv-project')[0].querySelector('h4')!;

    expect(h4.className).not.toMatch(/FFC2CC/i);
    expect(h4).toHaveClass('text-ink');
    expect(screen.getAllByText(/· Pecode/)[0].className).toMatch(/text-rose/);
  });

  it('keeps the CV skills dl layout (label left, mono chips right) on a full-bleed Wine band', () => {
    renderCv();
    const panel = screen.getByTestId('skills-panel');
    const doc = CVS['react-native'];

    expect(panel).toHaveClass('bg-wine-flow');
    expect(within(panel).getByTestId('wine-surface')).toBeInTheDocument();
    expect(panel.closest('[class*="max-w-"]')).toBeNull();
    expect(within(panel).getByTestId('skills-column')).toHaveClass('relative', 'mx-auto');

    const dl = within(panel).getByTestId('cv-skills');

    expect(dl.tagName).toBe('DL');
    const dts = dl.querySelectorAll('dt');
    const dds = dl.querySelectorAll('dd');

    expect([...dts].map(d => d.textContent)).toEqual(doc.skills.map(g => g.group));
    expect(dts[0]).toHaveClass('font-mono', 'uppercase');
    expect(dts[0].parentElement).toHaveClass('min-[900px]:grid-cols-[200px_1fr]');
    doc.skills.forEach((g, i) => {
      const chips = [...dds[i].children];

      expect(chips.map(c => c.textContent)).toEqual(g.items);
      expect(chips[0]).toHaveClass('rounded-full', 'font-mono', 'text-[11px]', 'border-white/20', 'bg-[rgba(10,10,11,.4)]');
    });
    expect(within(panel).queryByTestId('skill-pill')).toBeNull();
  });

  it('shows the education as wine-edge cards with kind, period, institution and programme', () => {
    renderCv();
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
    renderCv();
    const cards = screen.getAllByTestId('lang-card');

    expect(cards).toHaveLength(2);
    cards.forEach(c => expect(c).toHaveClass('wine-edge'));
    expect(within(cards[0]).getByText('Ukrainian')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Native')).toBeInTheDocument();
    expect(within(cards[1]).getByText('English')).toBeInTheDocument();
    expect(within(cards[1]).getByText('C1')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Advanced · EF SET C2')).toBeInTheDocument();
  });

  it('localises the CV, education kind and languages in UA', () => {
    renderCv({ lang: 'uk' });
    const edu = screen.getAllByTestId('edu-card');
    const langs = screen.getAllByTestId('lang-card');

    expect(screen.getByText(CVS_UA['react-native'].title)).toBeInTheDocument();
    expect(screen.getByText(CVS_UA['react-native'].summary)).toBeInTheDocument();
    expect(within(edu[0]).getByText('Університет')).toBeInTheDocument();
    expect(within(langs[0]).getByText('Українська')).toBeInTheDocument();
    expect(within(langs[0]).getByText('Рідна')).toBeInTheDocument();
    expect(within(langs[1]).getByText('Просунутий · EF SET C2')).toBeInTheDocument();
  });

  it('shows the HYS role in Ukrainian UA', () => {
    renderCv({ lang: 'uk' });
    const hys = CVS_UA['react-native'].experience.find(j => j.company === 'HYS Enterprise');

    expect(hys?.role).toBe('Frontend-розробник');
    expect(CVS_UA.frontend.experience.find(j => j.company === 'HYS Enterprise')?.role).toBe(hys?.role);
    expect(screen.getAllByText(hys!.role).length).toBeGreaterThan(0);
  });

  it('keeps the CV name outside elements the print rule hides', () => {
    mockSearch('');
    const { container } = renderWithI18n(
      <>
        <Header />
        <CvViewSwitch doc={getCv('react-native', 'en')} />
        <Footer />
      </>,
    );
    const hidden = Array.from(container.querySelectorAll('.site-chrome, .cv-no-print'));

    expect(container.querySelector('header.site-chrome')).not.toBeNull();
    expect(container.querySelector('footer.site-chrome')).not.toBeNull();
    const h1 = screen.getByRole('heading', { level: 1, name: 'Oleksandr Bryksin' });

    expect(hidden.some(el => el.contains(h1))).toBe(false);
  });

  it('does not show a phone number', () => {
    renderCv();
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
    expect(getCv('frontend', 'uk')).toBe(CVS_UA.frontend);
    expect(getCv('frontend', 'uk-UA')).toBe(CVS_UA.frontend);
    expect(getCv('frontend', 'en')).toBe(CVS.frontend);
  });
});
