'use client';

import dynamic from 'next/dynamic';
import { Component, useState, type ReactNode } from 'react';
import { useT } from '@/lib/i18n-client';
import { useIdleWebGL, usePrefersReducedMotion } from './sceneSupport';

// Client-only and code-split, so three.js stays out of the main bundle and the text paints first.
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => null });

/**
 * CSS stand-in for the Wine shader, shown while loading or without WebGL. Its gradient (one per
 * theme) lives in styles.css (.hero-wine-fallback), so the static HTML is right for both.
 */
const WineFallback = (props: { 'data-testid'?: string }) => (
  <div aria-hidden className="hero-wine-fallback absolute inset-0" {...props} />
);

/**
 * Keeps a scene failure (context creation error, chunk 404 after a redeploy)
 * inside the panel: the gradient replaces the canvas and the rest of the page stays up.
 */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <WineFallback data-testid="hero-fallback" /> : this.props.children;
  }
}

/** The hero's 3D panel: the gradient, then the live scene once idle (if WebGL works), and the caption. */
const HeroVisual = () => {
  const t = useT();
  const reducedMotion = usePrefersReducedMotion();
  const [fps, setFps] = useState<number | null>(null);
  // Probed once, when idle (the gradient shows meanwhile, and in the static HTML).
  const webGL = useIdleWebGL();

  return (
    <div className="relative h-[45vh] border-t border-line min-[900px]:h-auto min-[900px]:border-l min-[900px]:border-t-0">
      {webGL === false ? (
        <WineFallback data-testid="hero-fallback" />
      ) : webGL ? (
        <>
          {/* Stays under the canvas, which is transparent until its shaders are ready. */}
          <WineFallback />
          <SceneBoundary>
            <HeroScene reducedMotion={reducedMotion} onFps={setFps} />
          </SceneBoundary>
        </>
      ) : (
        <WineFallback />
      )}

      <p className="hero-caption pointer-events-none absolute bottom-5 left-6 z-[2] hidden gap-3 font-mono text-[11px] uppercase tracking-[.06em] text-white/50 min-[900px]:flex">
        <span>{t('hero_caption_figure')}</span>
        <span aria-hidden>·</span>
        {/* Both materials are in the HTML; CSS shows the one for the current theme. */}
        <span className="[:root[data-theme=light]_&]:hidden">{t('hero_caption_material')}</span>
        <span className="hidden [:root[data-theme=light]_&]:inline">{t('hero_caption_material_light')}</span>
        <span aria-hidden>·</span>
        <span>
          <b className="font-medium text-white">{fps === null ? '—' : fps}</b> {t('hero_caption_fps')}
        </span>
      </p>
    </div>
  );
};

export default HeroVisual;
