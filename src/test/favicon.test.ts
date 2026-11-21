import { describe, expect, it, vi } from 'vitest';
import svg from '../../public/favicon.svg?raw';
import touchIcon from '../../public/apple-touch-icon.png';
import { metadata } from '../app/[lang]/layout';

// The layout imports the global stylesheet, which jsdom cannot parse.
vi.mock('../../styles.css', () => ({}));

describe('favicon', () => {
  it('links the OB SVG favicon and the apple touch icon', () => {
    expect(metadata.icons).toEqual({
      icon: { url: '/favicon.svg', type: 'image/svg+xml' },
      apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
    });
    expect(touchIcon).toMatch(/apple-touch-icon\.png$/);
  });

  it('draws the burgundy letters as paths (no font dependency)', () => {
    expect(svg).not.toMatch(/<text|font-family/);
    expect(svg).toMatch(/#8B1426/);
    expect(svg).toMatch(/<path /);
  });
});
