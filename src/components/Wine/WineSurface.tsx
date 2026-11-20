import { Component, lazy, Suspense, useState, type ReactNode } from 'react';
import { useIdleWebGL, usePrefersReducedMotion } from '../Hero/sceneSupport';

// Lazy so three.js stays in the 3D chunk, out of the main bundle.
const WineCanvas = lazy(() => import('./WineCanvas'));

/** Keeps a canvas failure (context error, lazy chunk 404) inside the surface. */
type BoundaryProps = { children: ReactNode; onError: () => void };

class CanvasBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The hero's live Wine shader as a layer that fills its positioned parent. The parent keeps
 * the CSS `.bg-wine-flow` fill, which shows underneath while this loads, without WebGL,
 * or if the canvas fails. Content on top needs its own stacking (e.g. `relative`).
 */
const WineSurface = () => {
  const reducedMotion = usePrefersReducedMotion();
  const webGL = useIdleWebGL();
  const [failed, setFailed] = useState(false);
  const state = failed || webGL === false ? 'fallback' : webGL ? 'live' : 'loading';

  return (
    <div aria-hidden data-testid="wine-surface" data-state={state} className="pointer-events-none absolute inset-0">
      {state === 'live' && (
        <CanvasBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <WineCanvas reducedMotion={reducedMotion} />
          </Suspense>
        </CanvasBoundary>
      )}
    </div>
  );
};

export default WineSurface;
