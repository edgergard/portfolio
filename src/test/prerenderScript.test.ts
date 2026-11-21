import { describe, expect, it } from 'vitest';
import script from '../../scripts/prerender.mjs?raw';

describe('prerender script', () => {
  it('inserts the HTML with a replacer function, so "$" in the copy is never a replace pattern', () => {
    expect(script).toMatch(/\.replace\(PLACEHOLDER, \(\) => app\)/);
  });
});
