import { MAX_DT, motionSpeed } from '../../Hero/motion';

// No three.js here: this module ships in the main bundle. The renderer comes from a lazy chunk.

/** The shared offscreen Wine buffer every primary button copies from. */
export type WineBufferRenderer = {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** Draws one frame at `time` seconds of animation (already scaled for reduced motion). */
  render: (time: number) => void;
  dispose: () => void;
};

export type LoopOptions = {
  /** Creates the renderer; calls onLost if its context goes away later. */
  load: (onLost: () => void) => Promise<WineBufferRenderer>;
  raf?: (cb: FrameRequestCallback) => number;
  caf?: (id: number) => void;
  /** Runs cb once the page is idle; returns a cancel function. */
  whenIdle?: (cb: () => void) => () => void;
  reducedMotion?: () => boolean;
};

type Entry = {
  ctx: CanvasRenderingContext2D | null;
  onScreen: boolean;
  /** 0-1: which band of the shared buffer this button shows, so buttons don't look cloned. */
  offset: number;
  /** Seconds this element runs ahead of the shared clock, so each one moves on its own. */
  phase: number;
};

type Status = 'idle' | 'loading' | 'ready' | 'failed';

const MAX_DPR = 2;
const GOLDEN = 0.618034;
/** Spread of the per-element time offsets (seconds of animation): far enough apart that no two look alike. */
export const PHASE_SPREAD = 90;

export type Rect = { sx: number; sy: number; sw: number; sh: number };

/**
 * Source rectangle for drawing a (bw x bh) buffer into a (w x h) box with object-fit: cover.
 * Writes into `out` (the render loop passes one reused rect, so frames don't allocate).
 */
export const coverRect = (
  bw: number,
  bh: number,
  w: number,
  h: number,
  offset: number,
  out: Rect = { sx: 0, sy: 0, sw: 0, sh: 0 },
): Rect => {
  const box = w / h;

  if (box >= bw / bh) {
    out.sw = bw;
    out.sh = bw / box;
    out.sx = 0;
    out.sy = (bh - out.sh) * offset;
  } else {
    out.sw = bh * box;
    out.sh = bh;
    out.sx = (bw - out.sw) * offset;
    out.sy = 0;
  }

  return out;
};

const defaultWhenIdle = (cb: () => void) => {
  let idleId: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(cb, { timeout: 2000 });
    } else {
      timer = setTimeout(cb, 200);
    }
  };

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }

  return () => {
    window.removeEventListener('load', schedule);

    if (idleId !== undefined) {
      window.cancelIdleCallback(idleId);
    }

    clearTimeout(timer);
  };
};

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Reads prefers-reduced-motion from one MediaQueryList, created on first use. */
const cachedReducedMotion = () => {
  let query: MediaQueryList | null = null;

  return () => (query ??= window.matchMedia(REDUCED_MOTION)).matches;
};

/** Context losses the loop recovers from (by loading a fresh renderer) before keeping the CSS fill. */
const MAX_RESTARTS = 1;

const setState = (canvas: HTMLCanvasElement, state: 'loading' | 'live' | 'fallback') => {
  canvas.dataset.state = state;
  // Hidden until it holds a frame: the CSS wine-flow fill underneath shows meanwhile.
  canvas.style.opacity = state === 'live' ? '1' : '0';
};

/**
 * One shared WebGL renderer for every primary button. Each button registers a 2D canvas;
 * every frame the renderer draws the Wine shader into its small buffer once per on-screen
 * button, each at its own time offset (so every element animates independently), and the
 * loop copies each frame into its button (cover-fit, device pixels). The loop pauses when no
 * button is on screen or the tab is hidden, and tears the renderer down with the last button.
 * A lost context is recovered once with a fresh renderer; a second loss keeps the CSS fill.
 */
export const createWineButtonLoop = ({
  load,
  raf = (cb) => window.requestAnimationFrame(cb),
  caf = (id) => window.cancelAnimationFrame(id),
  whenIdle = defaultWhenIdle,
  reducedMotion = cachedReducedMotion(),
}: LoopOptions) => {
  const entries = new Map<HTMLCanvasElement, Entry>();
  let status: Status = 'idle';
  let renderer: WineBufferRenderer | null = null;
  let frame: number | null = null;
  let cancelIdle: (() => void) | null = null;
  let observer: IntersectionObserver | null = null;
  let generation = 0;
  let registered = 0;
  let time = 0;
  let last: number | null = null;
  let restarts = 0;
  /** Entries that are on screen and have a 2D context: the only ones a frame can draw into. */
  let drawable = 0;
  // Per-frame scratch, reused so the loop doesn't allocate.
  const rect: Rect = { sx: 0, sy: 0, sw: 0, sh: 0 };
  let dpr = 1;

  const isDrawable = (entry: Entry) => entry.onScreen && entry.ctx !== null;
  const shouldRun = () => status === 'ready' && !document.hidden && drawable > 0;

  const stop = () => {
    if (frame !== null) {
      caf(frame);
      frame = null;
    }

    last = null;
  };

  const start = () => {
    if (frame === null && shouldRun()) {
      frame = raf(tick);
    }
  };

  const onVisibility = () => (document.hidden ? stop() : start());

  /** Stops the loop and drops the renderer (and any load in flight). */
  const dropRenderer = () => {
    stop();
    cancelIdle?.();
    cancelIdle = null;

    try {
      renderer?.dispose();
    } catch {
      // A lost context can throw while releasing; there is nothing left to free.
    }

    renderer = null;
    generation++;
  };

  const teardown = () => {
    dropRenderer();
    observer?.disconnect();
    observer = null;
    document.removeEventListener('visibilitychange', onVisibility);
  };

  const fail = (error?: unknown) => {
    if (error !== undefined) {
      // eslint-disable-next-line no-console
      console.warn('Wine button renderer failed; keeping the CSS fill.', error);
    }

    teardown();
    status = 'failed';
    entries.forEach((_, canvas) => setState(canvas, 'fallback'));
  };

  const drawEntry = (entry: Entry, canvas: HTMLCanvasElement) => {
    if (!renderer || !isDrawable(entry)) {
      return;
    }

    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // Each element gets its own frame of the shader (its own moment in the animation),
    // copied out right after it is drawn, so no two tiles move in lockstep.
    renderer.render(time + entry.phase);
    coverRect(renderer.width, renderer.height, w, h, entry.offset, rect);
    entry.ctx!.drawImage(renderer.source, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, w, h);

    if (canvas.dataset.state !== 'live') {
      setState(canvas, 'live');
    }
  };

  function tick(now: number) {
    frame = null;

    if (!renderer || !shouldRun()) {
      last = null;

      return;
    }

    const dt = last === null ? 0 : Math.min((now - last) / 1000, MAX_DT);

    last = now;
    time += dt * motionSpeed(reducedMotion());

    try {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      entries.forEach(drawEntry);
    } catch (error) {
      fail(error);

      return;
    }

    start();
  }

  /** Context lost: load a fresh renderer once (the CSS fill shows meanwhile), then give up. */
  const onLost = () => {
    if (restarts >= MAX_RESTARTS) {
      fail(new Error('WebGL context lost'));

      return;
    }

    restarts++;
    dropRenderer();
    entries.forEach((_, canvas) => setState(canvas, 'loading'));
    beginLoading();
  };

  const beginLoading = () => {
    status = 'loading';
    const mine = generation;

    cancelIdle = whenIdle(() => {
      cancelIdle = null;
      load(() => mine === generation && onLost())
        .then((r) => {
          if (mine !== generation) {
            r.dispose();

            return;
          }

          renderer = r;
          status = 'ready';
          start();
        })
        .catch((error: unknown) => mine === generation && fail(error));
    });
  };

  const ensureWatchers = () => {
    if (observer || typeof IntersectionObserver === 'undefined') {
      return;
    }

    observer = new IntersectionObserver((records) => {
      records.forEach((record) => {
        const entry = entries.get(record.target as HTMLCanvasElement);

        if (entry && entry.onScreen !== record.isIntersecting) {
          drawable -= isDrawable(entry) ? 1 : 0;
          entry.onScreen = record.isIntersecting;
          drawable += isDrawable(entry) ? 1 : 0;
        }
      });

      if (drawable > 0) {
        start();
      } else {
        stop();
      }
    });
    document.addEventListener('visibilitychange', onVisibility);
  };

  const register = (canvas: HTMLCanvasElement) => {
    if (status === 'failed' || typeof window.WebGLRenderingContext === 'undefined') {
      setState(canvas, 'fallback');

      return () => {};
    }

    if (entries.has(canvas)) {
      return () => {};
    }

    const entry: Entry = {
      ctx: canvas.getContext('2d'),
      // Assume visible until the observer says otherwise (its first report is async).
      onScreen: true,
      offset: (registered * GOLDEN) % 1,
      phase: ((registered++ * GOLDEN) % 1) * PHASE_SPREAD,
    };

    // No 2D context: nothing to draw into, so this button keeps its CSS fill.
    setState(canvas, entry.ctx ? 'loading' : 'fallback');
    entries.set(canvas, entry);
    drawable += isDrawable(entry) ? 1 : 0;
    ensureWatchers();
    observer?.observe(canvas);

    if (status === 'idle') {
      beginLoading();
    } else {
      start();
    }

    return () => {
      if (entries.get(canvas) !== entry) {
        return;
      }

      entries.delete(canvas);
      drawable -= isDrawable(entry) ? 1 : 0;

      observer?.unobserve(canvas);

      if (entries.size === 0) {
        teardown();

        if (status !== 'failed') {
          status = 'idle';
        }
      }
    };
  };

  return {
    register,
    running: () => frame !== null,
    size: () => entries.size,
  };
};

/** The app-wide instance; three.js loads only when the first primary button mounts. */
export const wineButtons = createWineButtonLoop({
  load: async (onLost) => (await import('./renderer')).createWineBufferRenderer(onLost),
});
