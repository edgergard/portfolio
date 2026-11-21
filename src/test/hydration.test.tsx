import { act, type ReactElement } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Header from '@/components/Header';
import Footer from '@/components/layout/Footer';
import MotionRoot from '@/components/layout/MotionRoot';
import { I18nProvider } from '@/lib/i18n-client';
import type { Lang } from '@/lib/locale';
import { dictFor } from '@/test/renderWithI18n';
import CvVariantPage from '@/app/[lang]/cv/[variant]/page';
import HomePage from '@/app/[lang]/page';
import ProjectsPage from '@/app/[lang]/projects/page';

// The [lang] layout imports the global stylesheet, which jsdom cannot parse.
vi.mock('../../styles.css', () => ({}));

/** The page inside the same providers and chrome as the [lang] layout. */
const inLayout = (lang: Lang, page: ReactElement) => (
  <I18nProvider lang={lang} dict={dictFor(lang)}>
    <MotionRoot>
      <Header />
      <main className="min-h-screen bg-bg">{page}</main>
      <Footer />
    </MotionRoot>
  </I18nProvider>
);

const PAGES: Record<string, (lang: Lang) => Promise<ReactElement>> = {
  home: async () => <HomePage />,
  projects: async () => <ProjectsPage />,
  'cv/frontend': lang => CvVariantPage({ params: Promise.resolve({ lang, variant: 'frontend' }) }),
};

const HYDRATION_ERROR = /did not match|hydrat/i;

// Tell React this is a test environment, so act() flushes the hydration work.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  document.body.innerHTML = '';
  delete document.documentElement.dataset.theme;
  vi.restoreAllMocks();
});

describe('hydration of the server render', () => {
  const cases = (['en', 'uk'] as const).flatMap(lang =>
    Object.keys(PAGES).flatMap(page => (['dark', 'light'] as const).map(theme => [lang, page, theme] as const)),
  );

  it.each(cases)('%s %s hydrates without mismatches in the %s theme', async (lang, page, theme) => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    // jsdom has no media playback; the project videos pause and play as they scroll.
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const ui = inLayout(lang, await PAGES[page](lang));
    const html = renderToString(ui);

    // What the pre-paint theme script does before React hydrates.
    document.documentElement.dataset.theme = theme;
    const container = document.createElement('div');

    container.innerHTML = html;
    document.body.appendChild(container);

    const consoleError = vi.spyOn(console, 'error');
    const recoverable: unknown[] = [];

    await act(async () => {
      root = hydrateRoot(container, ui, { onRecoverableError: error => recoverable.push(error) });
    });

    const hydrationErrors = consoleError.mock.calls
      .map(args => args.map(String).join(' '))
      .filter(message => HYDRATION_ERROR.test(message));

    expect(hydrationErrors).toEqual([]);
    expect(recoverable).toEqual([]);
    expect(container.textContent).not.toBe('');
  });
});
