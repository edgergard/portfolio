import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file: string) => (existsSync(file) ? readFileSync(file, 'utf8') : '');
const pkg = JSON.parse(read('package.json')) as {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

/** Every .ts/.tsx file under a directory, recursively. */
const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = join(dir, entry.name);

    if (entry.isDirectory()) {
      return sourceFiles(file);
    }

    return /\.tsx?$/.test(entry.name) ? [file] : [];
  });

describe('Next.js scaffold', () => {
  it('runs the app with Next.js and the tests with Vitest', () => {
    expect(pkg.scripts.dev).toBe('next dev');
    expect(pkg.scripts.build).toBe('next build');
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

  it('has no Vite app, router, i18next or GitHub Pages packages left', () => {
    const installed = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const removed = [
      'vite',
      'react-router',
      'react-router-dom',
      'react-router-hash-link',
      '@types/react-router-hash-link',
      'i18next',
      'react-i18next',
      'framer-motion',
      'gh-pages',
    ];

    removed.forEach(name => expect(installed).not.toContain(name));
    expect(installed.filter(name => name.startsWith('@fontsource-variable/'))).toEqual([]);
    // Vitest still needs the React plugin.
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBeTruthy();
    ['predeploy', 'deploy', 'preview'].forEach(script => {
      expect(pkg.scripts).not.toHaveProperty(script);
    });
  });

  it('has no Vite entry files or Pages Router directory left', () => {
    ['index.html', 'vite.config.ts', 'src/main.tsx', 'src/pages', 'src/vite-env.d.ts'].forEach(
      file => expect(existsSync(file)).toBe(false),
    );
  });

  it('no file under src/ imports react-router, react-i18next or framer-motion', () => {
    const offenders = sourceFiles('src').filter(file =>
      /(from\s+|import\(\s*)['"](react-router[\w-]*|react-i18next|framer-motion)['"]/
        .test(readFileSync(file, 'utf8')),
    );

    expect(offenders).toEqual([]);
  });
});
