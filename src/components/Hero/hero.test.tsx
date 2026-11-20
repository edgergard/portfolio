import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import Hero from './Hero';

const scene = vi.hoisted(() => ({ fail: false }));

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ frameloop }: { frameloop?: string }) => {
    if (scene.fail) throw new Error('Error creating WebGL context.');

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

  it('links View CV to the CV route', () => {
    renderHero();
    expect(screen.getByRole('link', { name: 'View CV' })).toHaveAttribute('href', '#/cv');
  });

  it('renders a live scene by default', async () => {
    renderHero();
    expect(await screen.findByTestId('canvas')).not.toHaveAttribute('data-frameloop', 'never');
  });

  it('renders a single static frame when reduced motion is preferred', async () => {
    stubReducedMotion(true);
    renderHero();
    expect(await screen.findByTestId('canvas')).toHaveAttribute('data-frameloop', 'never');
  });

  it('falls back to a gradient without WebGL', () => {
    vi.stubGlobal('WebGLRenderingContext', undefined);
    renderHero();
    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
  });

  it('falls back to a gradient when a context cannot be created', () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    renderHero();
    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
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
