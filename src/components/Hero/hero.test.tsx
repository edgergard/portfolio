import { screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Hero from './Hero';
import { I18nProvider } from '../../lib/i18n-client';
import type { Lang } from '../../lib/locale';
import { renderWithI18n } from '../../test/renderWithI18n';
import { EN, UA } from '../../translations';

/**
 * The scene is a lazy chunk mounted when idle; under a loaded full-suite run its import can take
 * well over findBy's 1s default, which made these tests flaky. Correctness doesn't depend on speed.
 */
const SCENE_WAIT = { timeout: 8000 };

const scene = vi.hoisted(() => ({ fail: false }));

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ frameloop }: { frameloop?: string }) => {
    if (scene.fail) {
      throw new Error('Error creating WebGL context.');
    }

    return <div data-testid="canvas" data-frameloop={frameloop} />;
  },
  useFrame: () => {},
  useThree: () => ({}),
}));

// The primary button's Wine layer has its own tests; here its renderer would only log jsdom's missing WebGL.
vi.mock('../ui/wineButtons/loop', () => ({ wineButtons: { register: () => () => {} } }));

const stubReducedMotion = (reduce: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: reduce && query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );

const renderHero = (lang: Lang = 'en') => renderWithI18n(<Hero />, lang);

describe('Hero', () => {
  beforeEach(() => {
    vi.stubGlobal('WebGLRenderingContext', class {});
    // jsdom has no WebGL; pretend a context can be created.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      { getExtension: () => null } as unknown as RenderingContext,
    );
    stubReducedMotion(false);
  });

  afterEach(() => {
    scene.fail = false;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the name as the h1', () => {
    renderHero();
    const h1 = screen.getByRole('heading', { level: 1 });

    expect(h1.textContent?.replace(/\s+/g, ' ').trim()).toBe('Oleksandr Bryksin');
  });

  it('renders the eyebrow', () => {
    renderHero();
    expect(screen.getByText('React Native & Frontend Developer — Kyiv, UA')).toBeInTheDocument();
  });

  it('links View experience to the experience section', () => {
    renderHero();
    const link = screen.getByRole('link', { name: /View experience/ });

    expect(link.getAttribute('href')).toMatch(/#experience$/);
  });

  it('links View CV to the React Native CV route', () => {
    renderHero();
    expect(screen.getByRole('link', { name: 'View CV' })).toHaveAttribute('href', '/cv/react-native');
  });

  it('links View CV to the Ukrainian CV route in UA', () => {
    renderHero('uk');
    expect(screen.getByRole('link', { name: 'Переглянути CV' })).toHaveAttribute('href', '/uk/cv/react-native');
  });

  it('renders a live scene by default', async () => {
    renderHero();
    expect(await screen.findByTestId('canvas', {}, SCENE_WAIT)).not.toHaveAttribute('data-frameloop', 'never');
  });

  it('mounts the scene only after the page is idle', async () => {
    renderHero();
    expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
    // The WebGL probe (a blocking context creation) waits for idle too.
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
    expect(await screen.findByTestId('canvas', {}, SCENE_WAIT)).toBeInTheDocument();
  });

  it('keeps the scene animating (calmly) when reduced motion is preferred', async () => {
    stubReducedMotion(true);
    renderHero();
    expect(await screen.findByTestId('canvas', {}, SCENE_WAIT)).toHaveAttribute('data-frameloop', 'always');
  });

  it('gives View experience the wine-flow fill and View CV the animated wine edge', () => {
    renderHero();
    expect(screen.getByRole('link', { name: /View experience/ })).toHaveClass('bg-wine-flow');
    const cv = screen.getByRole('link', { name: 'View CV' });

    expect(cv).not.toHaveClass('bg-wine-flow');
    expect(cv).toHaveClass('wine-edge', 'rounded-full');
    expect(cv.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(cv.querySelector('canvas')).toBeNull();
  });

  it('summarises the facts in a table (EN)', () => {
    renderHero();
    const rows = within(screen.getByTestId('hero-facts')).getAllByRole('row');

    expect(rows.map(row => row.textContent)).toEqual([
      'Experience2.5+years',
      'Apps shipped5iOS & Android',
      'Commercial projects128 mobile · 4 web',
      'EnglishC1Advanced · EF SET C2',
    ]);
    expect(within(rows[0]).getByRole('rowheader')).toHaveTextContent('Experience');
  });

  it('summarises the facts in a table (UA)', () => {
    renderHero('uk');
    const rows = within(screen.getByTestId('hero-facts')).getAllByRole('row');

    expect(rows.map(row => row.textContent)).toEqual([
      'Досвід2.5+років',
      'Випущено застосунків5iOS і Android',
      'Комерційні проєкти128 мобільних · 4 веб',
      'АнглійськаC1Просунутий · EF SET C2',
    ]);
    expect(screen.getByText('Відкритий до роботи')).toBeInTheDocument();
  });

  it('has no bottom strip: no metric pills and no scroll hint', () => {
    renderHero();
    expect(screen.queryByText(/yrs commercial/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Scroll/)).not.toBeInTheDocument();
    expect(screen.getAllByText('Open to work')).toHaveLength(1);
  });

  it('shows a green Open to work dot', () => {
    renderHero();
    expect(screen.getAllByTestId('open-dot')[0]).toHaveClass('bg-[#22C55E]');
  });

  it('does not mention Three.js in the lede', () => {
    renderHero();
    expect(screen.getByText(/I build precise mobile apps/).textContent).toBe(
      'I build precise mobile apps with React Native & Expo and fast web products with React and Next.js.',
    );
  });

  it('falls back to a gradient without WebGL', async () => {
    vi.stubGlobal('WebGLRenderingContext', undefined);
    renderHero();
    expect(await screen.findByTestId('hero-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
  });

  it('falls back to a gradient when a context cannot be created', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    renderHero();
    expect(await screen.findByTestId('hero-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
  });

  it('keeps the page up and shows the fallback when the scene throws', async () => {
    scene.fail = true;
    // React logs the caught error; it is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderHero();
    expect(await screen.findByTestId('hero-fallback')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});

describe('Hero static HTML', () => {
  const staticHtml = (lang: 'en' | 'uk') => {
    const html = renderToString(
      <I18nProvider lang={lang} dict={lang === 'uk' ? UA : EN}>
        <Hero />
      </I18nProvider>,
    );
    const doc = new DOMParser().parseFromString(html, 'text/html');

    return { html, doc };
  };

  it.each(['en', 'uk'] as const)('has the gradient, both caption materials and no 3D canvas (%s)', lang => {
    const { html, doc } = staticHtml(lang);
    const dict = lang === 'uk' ? UA : EN;

    expect(html).toContain('hero-wine-fallback');
    expect(html).toContain(`>${dict.hero_caption_material}</span>`);
    expect(html).toContain(`>${dict.hero_caption_material_light}</span>`);
    // The scene mounts on the client only; the one <canvas> is the primary button's Wine layer.
    const canvases = [...doc.querySelectorAll('canvas')];

    expect(canvases).toHaveLength(1);
    expect(canvases[0].closest('a')?.textContent).toContain(dict.btn_view_experience);
    expect(doc.querySelector('.hero-caption')?.closest('div')?.querySelector('canvas')).toBeNull();
  });
});
