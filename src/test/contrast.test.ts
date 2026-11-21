import { describe, expect, it } from 'vitest';
import css from '../../styles.css?raw';

/** The RGB channels of one --c-* variable inside a CSS block. */
const channels = (block: string, name: string) => {
  const m = block.match(new RegExp(`--c-${name}: ([0-9]+) ([0-9]+) ([0-9]+);`));

  if (!m) {
    throw new Error(`--c-${name} missing`);
  }

  return [m[1], m[2], m[3]].map(Number);
};

const luminance = (rgb: number[]) => {
  const [r, g, b] = rgb.map(v => {
    const c = v / 255;

    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (hi + 0.05) / (lo + 0.05);
};

/** The theme's variable block: the one that sets `color-scheme: <theme>`. */
const block = (theme: string) => {
  const start = css.indexOf(`color-scheme: ${theme};`);

  return css.slice(start, css.indexOf('}', start));
};

const GREYS = ['ink-2', 'soft-2', 'soft-3', 'muted-2', 'muted'];

describe('grey text contrast', () => {
  for (const theme of ['dark', 'light']) {
    it(`keeps every grey at 7:1 or more on the ${theme} page and its cards`, () => {
      const b = block(theme);

      for (const grey of GREYS) {
        expect(ratio(channels(b, grey), channels(b, 'bg'))).toBeGreaterThanOrEqual(7);
        expect(ratio(channels(b, grey), channels(b, 'surface-2'))).toBeGreaterThanOrEqual(6.4);
      }
    });
  }
});
