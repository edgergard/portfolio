import { describe, expect, it } from 'vitest';
import { damp, motionSpeed, REDUCED_SPEED, stageScale, tiltTarget } from './motion';
import { createWineUniforms } from './wineShader';

describe('damp', () => {
  it('moves a fraction of the way at 60 fps', () => {
    expect(damp(0, 1, 3, 1 / 60)).toBeCloseTo(0.0488, 3);
  });

  it('converges after a long step', () => {
    expect(damp(0, 1, 3, 10)).toBeGreaterThan(0.999);
  });
});

describe('stageScale', () => {
  it('shrinks the stage on narrow panels', () => {
    expect(stageScale(0.73)).toBeCloseTo(0.653, 3);
  });

  it('caps at 0.85 on wide panels', () => {
    expect(stageScale(2)).toBe(0.85);
  });
});

describe('tiltTarget', () => {
  it('clamps the pointer to ±1.5 and maps it to rotation', () => {
    const { x, y } = tiltTarget(2, -2);

    expect(x).toBeCloseTo(0.675, 6);
    expect(y).toBeCloseTo(0.9, 6);
  });
});

describe('createWineUniforms', () => {
  it('uses the approved Wine amount and warp', () => {
    const uniforms = createWineUniforms();

    expect(uniforms.uAmount.value).toBe(1);
    expect(uniforms.uWarp.value).toBe(3);
  });
});

describe('motionSpeed', () => {
  it('runs at full speed normally', () => {
    expect(motionSpeed(false)).toBe(1);
  });

  it('keeps the scene alive but calm under reduced motion', () => {
    expect(REDUCED_SPEED).toBeCloseTo(0.35, 6);
    expect(motionSpeed(true)).toBe(REDUCED_SPEED);
  });
});
