import type { Material, WebGLRenderer } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildStudioEnvironment, compileWithoutDrawing, whenProgramsReady } from './warmup';

const fakes = vi.hoisted(() => ({
  generators: [] as { disposed: boolean }[],
  rooms: [] as { disposed: boolean }[],
}));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();

  class FakePMREMGenerator {
    disposed = false;

    constructor(private gl: WebGLRenderer) {
      fakes.generators.push(this);
    }

    fromScene() {
      // PMREM draws the room and its prefilter passes through renderer.render.
      this.gl.render(new actual.Scene(), new actual.PerspectiveCamera());

      return { texture: { isFakeEnvMap: true }, dispose: () => {} };
    }

    dispose() {
      this.disposed = true;
    }
  }

  return { ...actual, PMREMGenerator: FakePMREMGenerator };
});

vi.mock('three/examples/jsm/environments/RoomEnvironment.js', () => ({
  RoomEnvironment: class {
    disposed = false;

    constructor() {
      fakes.rooms.push(this);
    }

    dispose() {
      this.disposed = true;
    }
  },
}));

/** A renderer whose programs report "linked" only once `linked` is set. */
const fakeRenderer = () => {
  const state = { linked: false };
  const material = {} as Material;
  const render = vi.fn();
  const gl = {
    render,
    compile: vi.fn(() => new Set([material])),
    properties: { get: () => ({ currentProgram: { isReady: () => state.linked } }) },
  } as unknown as WebGLRenderer;

  return { gl, state, material, render };
};

describe('hero scene warm-up', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fakes.generators.length = 0;
    fakes.rooms.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('compiles instead of drawing, then restores render', () => {
    const { gl, render, material } = fakeRenderer();

    const materials = compileWithoutDrawing(gl, () => gl.render({} as never, {} as never));

    expect([...materials]).toEqual([material]);
    expect(render).not.toHaveBeenCalled();
    expect(gl.render).toBe(render);
  });

  it('resolves true once the programs have linked', async () => {
    const { gl, state, material } = fakeRenderer();
    const ready = whenProgramsReady(gl, new Set([material]), () => true);

    await vi.advanceTimersByTimeAsync(50);
    state.linked = true;
    await vi.advanceTimersByTimeAsync(10);

    await expect(ready).resolves.toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops polling and resolves false after unmount, even if programs never link', async () => {
    const { gl, material } = fakeRenderer();
    let alive = true;
    const ready = whenProgramsReady(gl, new Set([material]), () => alive);

    await vi.advanceTimersByTimeAsync(30);
    alive = false;
    await vi.advanceTimersByTimeAsync(10);

    await expect(ready).resolves.toBe(false);
    await vi.advanceTimersByTimeAsync(1000);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('builds the env map after a dry pass that only compiles', async () => {
    const { gl, state, render } = fakeRenderer();
    const built = buildStudioEnvironment(gl, () => true);

    state.linked = true;
    await vi.advanceTimersByTimeAsync(10);

    await expect(built).resolves.toEqual({ isFakeEnvMap: true });
    // Dry pass compiled; the real pass drew once.
    expect(gl.compile).toHaveBeenCalled();
    expect(render).toHaveBeenCalledTimes(1);
    expect(fakes.generators).toHaveLength(2);
    expect(fakes.generators.every((g) => g.disposed)).toBe(true);
    expect(fakes.rooms.every((r) => r.disposed)).toBe(true);
  });

  it('cleans up the room and the dry generator when unmounted mid-wait', async () => {
    const { gl, render } = fakeRenderer();
    let alive = true;
    const built = buildStudioEnvironment(gl, () => alive);

    await vi.advanceTimersByTimeAsync(30);
    alive = false;
    await vi.advanceTimersByTimeAsync(10);

    await expect(built).resolves.toBeNull();
    expect(render).not.toHaveBeenCalled();
    expect(fakes.generators).toHaveLength(1);
    expect(fakes.generators[0].disposed).toBe(true);
    expect(fakes.rooms[0].disposed).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
