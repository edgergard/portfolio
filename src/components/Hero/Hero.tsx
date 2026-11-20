import { Component, lazy, Suspense, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { useIdleWebGL, usePrefersReducedMotion } from './sceneSupport';

// Lazy so three.js stays out of the main bundle and the text paints first.
const HeroScene = lazy(() => import('./HeroScene'));

/** CSS stand-in for the Wine shader (same palette), shown while loading or without WebGL. */
const WINE_GRADIENT
  = 'radial-gradient(circle at 50% 50%, #B8233F 0%, #8B1426 28%, #3E0712 58%, #0A0A0B 88%)';

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
    className={`pointer-events-none absolute hidden h-[11px] w-[11px] min-[900px]:block
      before:absolute before:left-[5px] before:top-0 before:h-[11px] before:w-px before:bg-ink before:content-['']
      after:absolute after:left-0 after:top-[5px] after:h-px after:w-[11px] after:bg-ink after:content-[''] ${className}`}
  />
);

/** Green "available" dot with a soft ring. */
export const OpenDot = () => (
  <i
    aria-hidden
    data-testid="open-dot"
    className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#22C55E] shadow-[0_0_0_4px_rgba(34,197,94,.22)]"
  />
);

/** Splits "2.5+ yrs commercial" into a bold figure and the rest. */
const Metric = ({ text }: { text: string }) => {
  const [figure, ...rest] = text.split(' ');

  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full border border-[#2E2E33] bg-white/[.03] px-4 py-2 text-[15px] leading-none text-[#D4D4D8] min-[900px]:text-base">
      <b className="font-semibold text-ink">{figure}</b>
      {rest.join(' ')}
    </span>
  );
};

const OpenToWork = ({ className = '' }: { className?: string }) => {
  const { t } = useTranslation();

  return (
    <span
      className={`items-center gap-2.5 rounded-full border border-[rgba(34,197,94,.35)] bg-[rgba(34,197,94,.08)] px-4 py-2 text-[15px] font-medium leading-none text-ink min-[900px]:text-base ${className}`}
    >
      <OpenDot />
      {t('hero_open')}
    </span>
  );
};

const Hero = () => {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const [fps, setFps] = useState<number | null>(null);
  // Probed once, when idle (the gradient shows meanwhile).
  const webGL = useIdleWebGL();

  return (
    <section
      id="hero"
      className="relative flex flex-col bg-bg text-ink min-[900px]:h-[calc(100svh-72px)] min-[900px]:min-h-[608px]"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 min-[900px]:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-center px-6 py-8 min-[900px]:px-10 min-[900px]:py-0">
          <p className="flex items-center gap-3 font-mono text-sm uppercase tracking-[.06em] text-[#E4E4E7] min-[900px]:text-[15px]">
            <i aria-hidden className="inline-block h-0.5 w-8 shrink-0 bg-wine-3" />
            {t('hero_eyebrow')}
          </p>

          <h1 className="my-7 text-[clamp(52px,7.4vw,124px)] font-medium leading-[.9] tracking-[-.05em]">
            <span className="block pb-[.06em]">Oleksandr</span>{' '}
            <span className="block pb-[.06em]">Bryksin</span>
          </h1>

          <p className="max-w-[34ch] text-lg leading-[1.5] text-ink-2">{t('hero_lede')}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3.5">
            <Button to="/#experience" size="lg" className="min-[900px]:px-8 min-[900px]:py-[18px] min-[900px]:text-[18px]">
              {t('btn_view_experience')}
              <span aria-hidden>→</span>
            </Button>
            <Button to="/cv" variant="outline" size="lg" className="min-[900px]:px-8 min-[900px]:py-[18px] min-[900px]:text-[18px]">
              {t('btn_view_cv')}
            </Button>
          </div>
        </div>

        <div className="relative h-[45vh] border-t border-line min-[900px]:h-auto min-[900px]:border-l min-[900px]:border-t-0">
          {webGL === false ? (
            <WineFallback data-testid="hero-fallback" />
          ) : webGL ? (
            <>
              {/* Stays under the canvas, which is transparent until its shaders are ready. */}
              <WineFallback />
              <SceneBoundary>
                <Suspense fallback={null}>
                  <HeroScene reducedMotion={reducedMotion} onFps={setFps} />
                </Suspense>
              </SceneBoundary>
            </>
          ) : (
            <WineFallback />
          )}

          <Cross className="-left-1.5 -top-1.5 z-[51]" />
          <Cross className="-bottom-1.5 -left-1.5 z-[2]" />

          <p className="pointer-events-none absolute bottom-5 left-6 z-[2] hidden gap-3 font-mono text-[11px] uppercase tracking-[.06em] text-muted min-[900px]:flex">
            <span>{t('hero_caption_figure')}</span>
            <span aria-hidden>·</span>
            <span>{t('hero_caption_material')}</span>
            <span aria-hidden>·</span>
            <span>
              <b className="font-medium text-ink">{fps === null ? '—' : fps}</b> {t('hero_caption_fps')}
            </span>
          </p>
        </div>
      </div>

      <div className="grid border-t border-line min-[900px]:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-wrap items-center gap-2.5 px-6 py-4 min-[900px]:px-10">
          <Metric text={t('hero_stat_years')} />
          <Metric text={t('hero_stat_apps')} />
          <OpenToWork className="inline-flex min-[900px]:hidden" />
        </div>
        <div className="hidden items-center justify-between border-l border-line px-10 py-4 min-[900px]:flex">
          <OpenToWork className="inline-flex" />
          <span className="font-mono text-xs uppercase tracking-[.06em] text-ink-2">{t('hero_scroll')}</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
