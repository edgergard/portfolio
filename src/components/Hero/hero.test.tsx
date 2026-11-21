import { render, screen, within } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import Hero from './Hero';

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

const renderHero = () =>
  render(
    <HashRouter>
      <Hero />
    </HashRouter>,
  );

describe('Hero', () => {
  beforeEach(() => {
    vi.stubGlobal('WebGLRenderingContext', class {});
    // jsdom has no WebGL; pretend a context can be created.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      { getExtension: () => null } as unknown as RenderingContext,
    );
    stubReducedMotion(false);
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
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

  it('links View CV to the CV route', () => {
    renderHero();
    expect(screen.getByRole('link', { name: 'View CV' })).toHaveAttribute('href', '#/cv');
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

  it('summarises the facts in a table (UA)', async () => {
    await i18n.changeLanguage('ua');
    renderHero();
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
