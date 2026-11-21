import { describe, expect, it } from 'vitest';
import { toJsonLd } from './PersonJsonLd';

describe('toJsonLd', () => {
  const payload = { name: 'x</script><img src=x onerror=alert(1)>', nested: ['<!--', 'a<b'] };

  it('emits no "<", so the JSON cannot close the script tag', () => {
    const out = toJsonLd(payload);

    expect(out).not.toContain('<');
    expect(out).toContain('\\u003c/script>');
  });

  it('still parses back to the original value', () => {
    expect(JSON.parse(toJsonLd(payload))).toEqual(payload);
  });
});
