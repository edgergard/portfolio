import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REDUCED_SPEED } from '../../Hero/motion';
import { coverRect, createWineButtonLoop, type WineBufferRenderer } from './loop';

type Observed = { callback: IntersectionObserverCallback; targets: Set<Element> };

const observers: Observed[] = [];

class FakeIntersectionObserver {
  private record: Observed;

  constructor(callback: IntersectionObserverCallback) {
    this.record = { callback, targets: new Set() };
    observers.push(this.record);
  }

  observe(el: Element) {
    this.record.targets.add(el);
  }

  unobserve(el: Element) {
    this.record.targets.delete(el);
  }

  disconnect() {
    this.record.targets.clear();
  }

  takeRecords() {
    return [];
  }
}

/** Reports `el` entering or leaving the viewport to every observer watching it. */
const setOnScreen = (el: Element, isIntersecting: boolean) =>
  observers
    .filter((o) => o.targets.has(el))
    .forEach((o) => o.callback(
      [{ target: el, isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));

const fakeRenderer = () => {
  const source = document.createElement('canvas');

  source.width = 512;
  source.height = 256;

  return {
    source,
    width: 512,
    height: 256,
    render: vi.fn(),
    dispose: vi.fn(),
  } satisfies WineBufferRenderer;
};

/** A button canvas with a stubbed 2D context and a laid-out size. */
const buttonCanvas = (width = 200, height = 50) => {
  const canvas = document.createElement('canvas');
  const ctx = { drawImage: vi.fn() };

  Object.defineProperty(canvas, 'clientWidth', { value: width });
  Object.defineProperty(canvas, 'clientHeight', { value: height });
  vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  document.body.append(canvas);

  return { canvas, ctx };
};

/** Manual frame clock: frames run only when step() is called. */
const frames = () => {
  let queue: Array<{ id: number; cb: FrameRequestCallback }> = [];
  let next = 1;
  let now = 0;

  return {
    raf: (cb: FrameRequestCallback) => {
      const id = next++;

      queue.push({ id, cb });

      return id;
    },
    caf: (id: number) => {
      queue = queue.filter((f) => f.id !== id);
    },
    pending: () => queue.length,
    step: (ms = 16) => {
      now += ms;
      const run = queue;

      queue = [];
      run.forEach((f) => f.cb(now));
    },
  };
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const setup = (overrides: Partial<Parameters<typeof createWineButtonLoop>[0]> = {}) => {
  const clock = frames();
  const renderer = fakeRenderer();
  const load = vi.fn(async () => renderer);
  const loop = createWineButtonLoop({
    load,
    raf: clock.raf,
    caf: clock.caf,
    whenIdle: (cb) => {
      cb();

      return () => {};
    },
    reducedMotion: () => false,
    ...overrides,
  });

  return { clock, renderer, load, loop };
};

describe('wine button loop', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    vi.stubGlobal('WebGLRenderingContext', class {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('loads one shared renderer for any number of buttons and copies it into each', async () => {
    const { clock, renderer, load, loop } = setup();
    const a = buttonCanvas();
    const b = buttonCanvas(160, 44);

    loop.register(a.canvas);
    loop.register(b.canvas);
    await flush();
    clock.step();

    expect(load).toHaveBeenCalledTimes(1);
    expect(renderer.render).toHaveBeenCalledTimes(1);
    const any = expect.any(Number);

    expect(a.ctx.drawImage).toHaveBeenCalledWith(
      renderer.source, any, any, any, any, 0, 0, a.canvas.width, a.canvas.height,
    );
    expect(b.ctx.drawImage).toHaveBeenCalledTimes(1);
  });

  it('sizes each button canvas to its box at device pixels (capped at 2x)', async () => {
    vi.stubGlobal('devicePixelRatio', 3);
    const { clock, loop } = setup();
    const a = buttonCanvas(201, 49);

    loop.register(a.canvas);
    await flush();
    clock.step();

    expect(a.canvas.width).toBe(402);
    expect(a.canvas.height).toBe(98);
  });

  it('shows a button canvas only once a frame has been drawn into it', async () => {
    const { clock, loop } = setup();
    const a = buttonCanvas();

    loop.register(a.canvas);
    expect(a.canvas.dataset.state).toBe('loading');
    await flush();
    expect(a.canvas.dataset.state).toBe('loading');
    clock.step();
    expect(a.canvas.dataset.state).toBe('live');
  });

  it('advances the animation clock at the hero pace, and at 0.6x under reduced motion', async () => {
    const normal = setup();
    const a = buttonCanvas();

    normal.loop.register(a.canvas);
    await flush();
    normal.clock.step(16);
    normal.clock.step(20);
    expect(normal.renderer.render).toHaveBeenLastCalledWith(expect.closeTo(0.02, 6));

    const reduced = setup({ reducedMotion: () => true });
    const b = buttonCanvas();

    reduced.loop.register(b.canvas);
    await flush();
    reduced.clock.step(16);
    reduced.clock.step(20);
    expect(reduced.renderer.render)
      .toHaveBeenLastCalledWith(expect.closeTo(0.02 * REDUCED_SPEED, 6));
  });

  it('pauses while no registered button is on screen and resumes when one returns', async () => {
    const { clock, renderer, loop } = setup();
    const a = buttonCanvas();

    loop.register(a.canvas);
    await flush();
    clock.step();
    setOnScreen(a.canvas, false);
    clock.step();
    const calls = renderer.render.mock.calls.length;

    clock.step();
    clock.step();
    expect(renderer.render).toHaveBeenCalledTimes(calls);
    expect(clock.pending()).toBe(0);

    setOnScreen(a.canvas, true);
    clock.step();
    expect(renderer.render).toHaveBeenCalledTimes(calls + 1);
  });

  it('pauses while the tab is hidden', async () => {
    const { clock, renderer, loop } = setup();
    const a = buttonCanvas();

    loop.register(a.canvas);
    await flush();
    clock.step();

    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    clock.step();
    const calls = renderer.render.mock.calls.length;

    clock.step();
    expect(renderer.render).toHaveBeenCalledTimes(calls);

    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    clock.step();
    expect(renderer.render).toHaveBeenCalledTimes(calls + 1);
  });

  it('stops the loop and disposes the renderer when the last button unregisters', async () => {
    const { clock, renderer, loop } = setup();
    const a = buttonCanvas();
    const b = buttonCanvas();
    const offA = loop.register(a.canvas);
    const offB = loop.register(b.canvas);

    await flush();
    clock.step();
    offA();
    clock.step();
    expect(renderer.dispose).not.toHaveBeenCalled();
    expect(loop.running()).toBe(true);

    offB();
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(loop.running()).toBe(false);
    expect(clock.pending()).toBe(0);
    expect(loop.size()).toBe(0);
  });

  it('never draws into an unregistered canvas', async () => {
    const { clock, loop } = setup();
    const a = buttonCanvas();
    const b = buttonCanvas();
    const offA = loop.register(a.canvas);

    loop.register(b.canvas);
    await flush();
    offA();
    clock.step();
    expect(a.ctx.drawImage).not.toHaveBeenCalled();
    expect(b.ctx.drawImage).toHaveBeenCalledTimes(1);
  });

  it('drops a renderer that finishes loading after every button has gone', async () => {
    const { clock, renderer, loop } = setup();
    const a = buttonCanvas();

    loop.register(a.canvas)();
    await flush();
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(clock.pending()).toBe(0);
  });

  it('loads again for buttons that arrive after a full teardown', async () => {
    const { clock, load, loop } = setup();

    loop.register(buttonCanvas().canvas)();
    await flush();
    const b = buttonCanvas();

    loop.register(b.canvas);
    await flush();
    clock.step();
    expect(load).toHaveBeenCalledTimes(2);
    expect(b.canvas.dataset.state).toBe('live');
  });

  it('keeps the CSS fill (never loads three.js) without WebGL', async () => {
    vi.stubGlobal('WebGLRenderingContext', undefined);
    const { clock, load, loop } = setup();
    const a = buttonCanvas();

    loop.register(a.canvas);
    await flush();
    clock.step();
    expect(load).not.toHaveBeenCalled();
    expect(a.canvas.dataset.state).toBe('fallback');
    expect(a.ctx.drawImage).not.toHaveBeenCalled();
  });

  it('falls back to the CSS fill when the renderer cannot be created', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const load = async (): Promise<WineBufferRenderer> => {
      throw new Error('Error creating WebGL context.');
    };

    const { clock, loop } = setup({ load });
    const a = buttonCanvas();

    loop.register(a.canvas);
    await flush();
    clock.step();
    expect(a.canvas.dataset.state).toBe('fallback');
    expect(clock.pending()).toBe(0);

    const late = buttonCanvas();

    loop.register(late.canvas);
    expect(late.canvas.dataset.state).toBe('fallback');
  });

  it('reloads a fresh renderer once when the context is lost, then keeps the CSS fill', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let lose = () => {};

    const made: ReturnType<typeof fakeRenderer>[] = [];
    const load = vi.fn(async (onLost: () => void) => {
      lose = onLost;
      const r = fakeRenderer();

      made.push(r);

      return r;
    });
    const { clock, loop } = setup({ load });
    const a = buttonCanvas();

    loop.register(a.canvas);
    await flush();
    clock.step();
    expect(a.canvas.dataset.state).toBe('live');

    lose();
    expect(made[0].dispose).toHaveBeenCalledTimes(1);
    expect(a.canvas.dataset.state).toBe('loading');
    expect(clock.pending()).toBe(0);
    await flush();
    clock.step();
    expect(load).toHaveBeenCalledTimes(2);
    expect(made[1].render).toHaveBeenCalledTimes(1);
    expect(a.canvas.dataset.state).toBe('live');

    lose();
    expect(made[1].dispose).toHaveBeenCalledTimes(1);
    expect(a.canvas.dataset.state).toBe('fallback');
    expect(clock.pending()).toBe(0);
    await flush();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('ignores a loss reported by a renderer it has already replaced', async () => {
    const losers: Array<() => void> = [];
    const { clock, loop } = setup({
      load: vi.fn(async (onLost: () => void) => {
        losers.push(onLost);

        return fakeRenderer();
      }),
    });
    const a = buttonCanvas();

    loop.register(a.canvas);
    await flush();
    losers[0]();
    await flush();
    losers[0]();
    clock.step();
    expect(losers).toHaveLength(2);
    expect(a.canvas.dataset.state).toBe('live');
  });

  it('hides every canvas and stops when a frame throws', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const thrower = fakeRenderer();
    const broken = setup({ load: async () => thrower });
    const b = buttonCanvas();

    thrower.render.mockImplementation(() => {
      throw new Error('boom');
    });
    broken.loop.register(b.canvas);
    await flush();
    broken.clock.step();
    expect(b.canvas.dataset.state).toBe('fallback');
    expect(broken.clock.pending()).toBe(0);
  });

  it('does not render while no on-screen button has a 2D context', async () => {
    const { clock, renderer, loop } = setup();
    const a = buttonCanvas();
    const b = buttonCanvas();

    vi.mocked(a.canvas.getContext).mockReturnValue(null);
    loop.register(a.canvas);
    expect(a.canvas.dataset.state).toBe('fallback');
    await flush();
    clock.step();
    expect(renderer.render).not.toHaveBeenCalled();
    expect(clock.pending()).toBe(0);

    loop.register(b.canvas);
    clock.step();
    expect(renderer.render).toHaveBeenCalledTimes(1);

    setOnScreen(b.canvas, false);
    clock.step();
    clock.step();
    expect(renderer.render).toHaveBeenCalledTimes(1);
  });

  it('reads prefers-reduced-motion from one cached MediaQueryList, not per frame', async () => {
    const matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);

    vi.stubGlobal('matchMedia', matchMedia);
    const clock = frames();
    const loop = createWineButtonLoop({
      load: async () => fakeRenderer(),
      raf: clock.raf,
      caf: clock.caf,
      whenIdle: (cb) => {
        cb();

        return () => {};
      },
    });

    loop.register(buttonCanvas().canvas);
    await flush();
    clock.step();
    clock.step();
    clock.step();
    expect(matchMedia).toHaveBeenCalledTimes(1);
  });
});

describe('coverRect', () => {
  it('crops the buffer height for buttons wider than 2:1, at the given offset', () => {
    expect(coverRect(512, 256, 200, 50, 0)).toEqual({ sx: 0, sy: 0, sw: 512, sh: 128 });
    expect(coverRect(512, 256, 200, 50, 1)).toEqual({ sx: 0, sy: 128, sw: 512, sh: 128 });
  });

  it('crops the buffer width for squarer boxes', () => {
    expect(coverRect(512, 256, 100, 100, 0.5)).toEqual({ sx: 128, sy: 0, sw: 256, sh: 256 });
  });

  it('writes into a given rect instead of allocating one', () => {
    const out = { sx: 9, sy: 9, sw: 9, sh: 9 };

    expect(coverRect(512, 256, 200, 50, 0, out)).toBe(out);
    expect(out).toEqual({ sx: 0, sy: 0, sw: 512, sh: 128 });
  });
});
