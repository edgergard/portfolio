import { describe, expect, it } from 'vitest';
import html from '../../index.html?raw';
import svg from '../../public/favicon.svg?raw';
import touchIcon from '../../public/apple-touch-icon.png';

describe('favicon', () => {
  it('links the OB SVG favicon and the apple touch icon', () => {
    expect(html).toMatch(/<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg"/);
    expect(html).toMatch(/<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon\.png"/);
    expect(touchIcon).toMatch(/apple-touch-icon\.png$/);
  });

  it('draws the burgundy letters as paths (no font dependency)', () => {
    expect(svg).not.toMatch(/<text|font-family/);
    expect(svg).toMatch(/#8B1426/);
    expect(svg).toMatch(/<path /);
  });
});
