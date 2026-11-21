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

describe('prerendered home page: links and theme', () => {
  it('writes router links as hash URLs inside the site, like HashRouter', () => {
    const html = render();

    expect(html).toContain('href="#/cv"');
    expect(html).toContain('href="#/#contact"');
    // No path-style router links: on GitHub Pages they would leave /portfolio/ before the app
    // takes over (the CV PDFs are files under the base URL, not routes).
    expect(html).not.toMatch(/href="\/(?:cv|projects)"|href="\/#/);
  });

  it('leaves the hero gradient, caption and theme icon to CSS, so a light visitor sees light', () => {
    const html = render();
    const hero = html.slice(html.indexOf('id="hero"'), html.indexOf('id="about"'));

    expect(hero).not.toContain('radial-gradient');
    expect(hero).toContain('hero-wine-fallback');
    expect(hero).toContain('Obsidian');
    expect(hero).toContain('Porcelain');
    expect(html).toContain('data-theme-icon="sun"');
    expect(html).toContain('data-theme-icon="moon"');
  });
});
