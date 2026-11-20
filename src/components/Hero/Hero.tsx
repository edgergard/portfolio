import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useTranslation } from 'react-i18next';

// Lazy so three.js stays out of the main bundle and the text paints first.
const HeroScene = lazy(() => import('./HeroScene'));

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** CSS stand-in for the Wine shader (same palette), shown while loading or without WebGL. */
const WINE_GRADIENT
  = 'radial-gradient(circle at 50% 50%, #B8233F 0%, #8B1426 28%, #3E0712 58%, #0A0A0B 88%)';

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(() => window.matchMedia(REDUCED_MOTION).matches);

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION);
    const onChange = () => setReduced(query.matches);

    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
};

/** True only if a WebGL context can actually be created (not just when the API exists). */
const hasWebGL = () => {
  if (typeof window.WebGLRenderingContext === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');

    // Release the probe context right away; browsers cap live contexts.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();

    return gl !== null;
  } catch {
    return false;
  }
};

const WineFallback = (props: { 'data-testid'?: string }) => (
  <div aria-hidden className="absolute inset-0" style={{ background: WINE_GRADIENT }} {...props} />
);

/**
 * Keeps a scene failure (context creation error, lazy chunk 404 after a redeploy)
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

/** Registration mark centred on a corner of the panel's hairline. */
const Cross = ({ className }: { className: string }) => (
  <span
    aria-hidden
    className={`pointer-events-none absolute z-[51] hidden h-[11px] w-[11px] min-[900px]:block
      before:absolute before:left-[5px] before:top-0 before:h-[11px] before:w-px before:bg-ink before:content-['']
      after:absolute after:left-0 after:top-[5px] after:h-px after:w-[11px] after:bg-ink after:content-[''] ${className}`}
  />
);

const Hero = () => {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const [fps, setFps] = useState<number | null>(null);
  // Probe once: Hero re-renders with every fps update.
  const [webGL] = useState(hasWebGL);

  return (
    <section
      id="hero"
      className="relative flex flex-col bg-bg text-ink min-[900px]:h-[calc(100svh-72px)] min-[900px]:min-h-[608px]"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 min-[900px]:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-center px-6 py-8 min-[900px]:px-10 min-[900px]:py-0">
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[.08em] text-muted-2">
            <i aria-hidden className="inline-block h-px w-6 shrink-0 bg-wine-2" />
            {t('hero_eyebrow')}
          </p>

          <h1 className="my-7 text-[clamp(52px,7.4vw,124px)] font-medium leading-[.9] tracking-[-.05em]">
            <span className="block pb-[.06em]">Oleksandr</span>{' '}
            <span className="block pb-[.06em]">Bryksin</span>
          </h1>

          <p className="max-w-[34ch] text-lg leading-[1.5] text-ink-2">{t('hero_lede')}</p>

          <div className="mt-9 flex items-center gap-6">
            <HashLink
              smooth
              to="/#experience"
              className="inline-flex items-center gap-2.5 rounded-full bg-wine px-[22px] py-[15px] text-sm font-medium text-ink transition duration-200 hover:-translate-y-px hover:bg-[#A8182F]"
            >
              {t('btn_view_experience')}
              <span aria-hidden>→</span>
            </HashLink>
            <Link to="/cv" className="border-b border-ink pb-0.5 text-sm font-medium">
              {t('btn_view_cv')}
            </Link>
          </div>
        </div>

        <div className="relative h-[45vh] border-t border-line min-[900px]:h-auto min-[900px]:border-l min-[900px]:border-t-0">
          {webGL ? (
            <SceneBoundary>
              <Suspense fallback={<WineFallback />}>
                <HeroScene reducedMotion={reducedMotion} onFps={setFps} />
              </Suspense>
            </SceneBoundary>
          ) : (
            <WineFallback data-testid="hero-fallback" />
          )}

          <Cross className="-left-1.5 -top-1.5" />
          <Cross className="-bottom-1.5 -left-1.5" />

          <p className="pointer-events-none absolute bottom-5 left-6 z-[2] hidden gap-3 font-mono text-[11px] uppercase tracking-[.06em] text-muted min-[900px]:flex">
            <span>{t('hero_caption_figure')}</span>
            <span aria-hidden>·</span>
            <span>{t('hero_caption_material')}</span>
            <span aria-hidden>·</span>
            <span>
              <b className="font-medium text-ink">{reducedMotion || fps === null ? '—' : fps}</b> {t('hero_caption_fps')}
            </span>
          </p>
        </div>
      </div>

      <div className="grid border-t border-line font-mono text-xs uppercase tracking-[.05em] text-muted-2 min-[900px]:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-2 px-6 py-5 min-[900px]:px-10">
          <span>{t('hero_stat_years')}</span>
          <span>{t('hero_stat_apps')}</span>
        </div>
        <div className="hidden items-center justify-between border-l border-line px-10 py-5 min-[900px]:flex">
          <span className="flex items-center">
            <i
              aria-hidden
              className="mr-2.5 inline-block h-[7px] w-[7px] rounded-full bg-wine-3 shadow-[0_0_0_3px_rgba(208,33,63,.22)]"
            />
            {t('hero_open')}
          </span>
          <span>{t('hero_scroll')}</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
