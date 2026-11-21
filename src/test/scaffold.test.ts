import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (file: string) => (existsSync(file) ? readFileSync(file, 'utf8') : '');
const pkg = JSON.parse(read('package.json')) as {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
};

describe('Next.js scaffold', () => {
  it('runs the app with Next.js and the tests with Vitest', () => {
    expect(pkg.scripts.dev).toBe('next dev');
    // App Router only until the Vite-era src/pages/ is gone (Task 12): Next.js would
    // otherwise build every file there as a Pages Router route.
    expect(pkg.scripts.build).toBe('next build --experimental-app-only');
    expect(pkg.scripts.start).toBe('next start');
    expect(pkg.scripts.test).toBe('vitest run');
    expect(pkg.scripts.lint).toBeTruthy();
  });

  it('depends on Next.js, React 19, motion and React Three Fiber 9', () => {
    expect(pkg.dependencies.next).toBeTruthy();
    expect(pkg.dependencies.react).toMatch(/^[\^~]?19\./);
    expect(pkg.dependencies['react-dom']).toMatch(/^[\^~]?19\./);
    expect(pkg.dependencies.motion).toBeTruthy();
    expect(pkg.dependencies['@react-three/fiber']).toMatch(/^[\^~]?9\./);
  });

  it('runs React in strict mode and builds for Vercel, not as a static export', () => {
    const config = read('next.config.ts');

    expect(config).toMatch(/reactStrictMode:\s*true/);
    expect(config).not.toMatch(/output:\s*['"]export['"]/);
  });

  it('tells Vercel to skip commits that have no Next.js', () => {
    const vercel = JSON.parse(read('vercel.json') || '{}') as { ignoreCommand?: string };

    expect(vercel.ignoreCommand).toBe(
      `git show HEAD:package.json | grep -q '"next"' && exit 1 || exit 0`,
    );
  });
});
