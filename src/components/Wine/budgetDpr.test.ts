import { describe, expect, it } from 'vitest';
import { budgetDpr, WINE_MAX_PIXELS, WINE_MIN_DPR } from './budgetDpr';

describe('budgetDpr', () => {
  it('keeps the device ratio while the canvas fits the budget', () => {
    expect(budgetDpr(500, 400, 2)).toBe(2);
    expect(budgetDpr(500, 400, 1.25)).toBe(1.25);
  });

  it('caps the ratio at 2 and never goes below 1 on low-density screens when it fits', () => {
    expect(budgetDpr(300, 200, 3)).toBe(2);
    expect(budgetDpr(300, 200, 0.75)).toBe(1);
  });

  it('lowers the ratio on a tall section so it renders at most the pixel budget', () => {
    const dpr = budgetDpr(1366, 1667, 2);

    expect(dpr).toBeLessThan(1);
    expect(1366 * dpr * 1667 * dpr).toBeCloseTo(WINE_MAX_PIXELS, -3);
  });

  it('never drops below the minimum ratio', () => {
    expect(budgetDpr(4000, 6000, 2)).toBe(WINE_MIN_DPR);
  });

  it('falls back to the capped device ratio before layout (zero size)', () => {
    expect(budgetDpr(0, 0, 2)).toBe(2);
  });
});
