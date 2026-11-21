import { describe, it, expect } from 'vitest';
import { PROJECT_LIST, featuredProjects } from './projects';

describe('projects data model', () => {
  it('lists all six projects', () => {
    expect(PROJECT_LIST.length).toBe(6);
  });

  it('featuredProjects returns the 3 featured in order', () => {
    expect(featuredProjects().map((p) => p.name)).toEqual([
      'Pokemon Trainer',
      'Vue Weather App',
      'Rick and Morty API app',
    ]);
  });

  it('every project has type, year and poster', () => {
    for (const p of PROJECT_LIST) {
      expect(['mobile', 'web']).toContain(p.type);
      expect(typeof p.year).toBe('number');
      expect(p.poster).toBeTruthy();
    }
  });

  it('serves recorded loops and their posters from /videos as plain URLs', () => {
    for (const p of PROJECT_LIST.filter(p => p.video)) {
      expect(p.poster).toMatch(/^\/videos\/[\w-]+\.jpg$/);
      expect(p.video?.webm).toMatch(/^\/videos\/[\w-]+\.webm$/);
      expect(p.video?.mp4).toMatch(/^\/videos\/[\w-]+\.mp4$/);
    }
  });
});
