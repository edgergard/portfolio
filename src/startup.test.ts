import { describe, expect, it } from 'vitest';
import { shouldHydrate } from './startup';

describe('shouldHydrate', () => {
  it.each([
    [{ hash: '', locale: null, hasMarkup: true }, true],
    [{ hash: '#/', locale: 'en', hasMarkup: true }, true],
    [{ hash: '#about', locale: null, hasMarkup: true }, true],
    [{ hash: '#/', locale: 'ua', hasMarkup: true }, false],
    [{ hash: '#/cv', locale: 'en', hasMarkup: true }, false],
    [{ hash: '#/projects', locale: null, hasMarkup: true }, false],
    [{ hash: '', locale: null, hasMarkup: false }, false],
  ])('%o → %s', (input, expected) => {
    expect(shouldHydrate(input)).toBe(expected);
  });
});
