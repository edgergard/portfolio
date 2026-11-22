import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REDUCED_SPEED } from '../Hero/motion';
import WineSurface from './WineSurface';

/** The canvas is a lazy chunk mounted when idle; a loaded full-suite run can exceed findBy's 1s default. */
const CANVAS_WAIT = { timeout: 8000 };

const scene = vi.hoisted(() => ({ fail: false }));

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ frameloop, dpr }: { frameloop?: string; dpr?: number }) => {
    if (scene.fail) {
      throw new Error('Error creating WebGL context.');
    }

    return <div data-testid="wine-canvas" data-frameloop={frameloop} data-dpr={dpr} />;
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

// The CSS wine-flow fill on the parent is the fallback underneath the canvas.
const renderSurface = () =>
  render(
    <div data-testid="panel" className="bg-wine-flow">
      <WineSurface />
    </div>,
  );

const surface = () => screen.getByTestId('wine-surface');

describe('WineSurface', () => {
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

  it('fills its parent and stays out of the accessibility tree', () => {
    renderSurface();
    expect(surface()).toHaveClass('absolute', 'inset-0', 'pointer-events-none');
    expect(surface()).toHaveAttribute('aria-hidden', 'true');
  });

  it('mounts the shader canvas only after the page is idle', async () => {
    renderSurface();
    expect(surface()).toHaveAttribute('data-state', 'loading');
    expect(screen.queryByTestId('wine-canvas')).not.toBeInTheDocument();
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
    expect(await screen.findByTestId('wine-canvas', {}, CANVAS_WAIT)).toBeInTheDocument();
    expect(surface()).toHaveAttribute('data-state', 'live');
  });

  it('renders at the budgeted dpr and animates while on screen', async () => {
    renderSurface();
    const canvas = await screen.findByTestId('wine-canvas', {}, CANVAS_WAIT);

    expect(canvas).toHaveAttribute('data-dpr', '1');
    expect(canvas).toHaveAttribute('data-frameloop', 'always');
  });

  it('runs at the full hero pace by default', async () => {
    renderSurface();
    await screen.findByTestId('wine-canvas', {}, CANVAS_WAIT);
    expect(screen.getByTestId('wine-canvas-host')).toHaveAttribute('data-speed', '1');
  });

  it('keeps animating at the hero reduced-motion pace when reduced motion is preferred', async () => {
    stubReducedMotion(true);
    renderSurface();
    expect(await screen.findByTestId('wine-canvas', {}, CANVAS_WAIT)).toHaveAttribute('data-frameloop', 'always');
    expect(screen.getByTestId('wine-canvas-host')).toHaveAttribute('data-speed', String(REDUCED_SPEED));
  });

  it('leaves the CSS wine-flow fill without WebGL', async () => {
    vi.stubGlobal('WebGLRenderingContext', undefined);
    renderSurface();
    await waitFor(() => expect(surface()).toHaveAttribute('data-state', 'fallback'));
    expect(screen.queryByTestId('wine-canvas')).not.toBeInTheDocument();
    expect(screen.getByTestId('panel')).toHaveClass('bg-wine-flow');
  });

  it('leaves the CSS wine-flow fill when a context cannot be created', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    renderSurface();
    await waitFor(() => expect(surface()).toHaveAttribute('data-state', 'fallback'));
    expect(screen.queryByTestId('wine-canvas')).not.toBeInTheDocument();
  });

  it('keeps the page up and falls back to the CSS fill when the canvas throws', async () => {
    scene.fail = true;
    // React logs the caught error; it is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderSurface();
    await waitFor(() => expect(surface()).toHaveAttribute('data-state', 'fallback'));
    expect(screen.queryByTestId('wine-canvas')).not.toBeInTheDocument();
    expect(screen.getByTestId('panel')).toHaveClass('bg-wine-flow');
  });
});
