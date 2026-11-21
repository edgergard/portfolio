import { describe, expect, it } from 'vitest';
import { render } from './entry-server';

describe('prerendered home page', () => {
  it('renders the home route to HTML without throwing', () => {
    expect(() => render()).not.toThrow();
  });

  it('contains the hero text in English', () => {
    const html = render();

    expect(html).toContain('Oleksandr');
    expect(html).toContain('Bryksin');
    expect(html).toContain('React Native &amp; Frontend Developer');
  });

  it('contains every home section', () => {
    const html = render();

    for (const id of ['hero', 'about', 'experience', 'projects', 'certifications', 'contact']) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  it('keeps the hero visible before any script runs', () => {
    const html = render();
    const hero = html.slice(html.indexOf('id="hero"'), html.indexOf('id="about"'));

    expect(hero).not.toMatch(/opacity:\s*0/);
  });
});
