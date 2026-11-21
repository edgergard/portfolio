import { Color } from 'three';
import { describe, expect, it } from 'vitest';
import { applyWineTheme, createWineUniforms, WINE_PALETTE, WINE_THEMES } from './wineShader';

const lum = (hex: string) => {
  const { r, g, b } = new Color(hex);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

describe('wine shader themes', () => {
  it('keeps the dark palette exactly as before', () => {
    expect(WINE_THEMES.dark.palette).toEqual(WINE_PALETTE);
    expect(WINE_THEMES.dark.bg).toBe('#0A0A0B');
  });

  it('lifts every stop of the light palette above the dark one', () => {
    WINE_THEMES.light.palette.forEach((hex, i) => {
      expect(lum(hex)).toBeGreaterThan(lum(WINE_THEMES.dark.palette[i]));
    });
  });

  it('switches the shader uniforms between themes', () => {
    const uniforms = createWineUniforms();

    applyWineTheme(uniforms, 'light');
    expect(`#${(uniforms.uC4.value as Color).getHexString()}`).toBe(WINE_THEMES.light.palette[3].toLowerCase());
    applyWineTheme(uniforms, 'dark');
    expect(`#${(uniforms.uBg.value as Color).getHexString()}`).toBe('#0a0a0b');
  });
});
