// Inlines the prerendered home page into dist/index.html (run by `npm run build` after the
// client build and the SSR build of src/entry-server.tsx), then removes the SSR output.
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Production builds of react, react-dom and react-router (their entry files pick by NODE_ENV).
process.env.NODE_ENV = 'production';

const PLACEHOLDER = '<!--app-->';
const dist = path.resolve('dist');
const ssr = path.resolve('dist-ssr');
const htmlPath = path.join(dist, 'index.html');

const html = await readFile(htmlPath, 'utf8');

if (!html.includes(PLACEHOLDER)) {
  console.error(`prerender: ${PLACEHOLDER} not found in dist/index.html`);
  process.exit(1);
}

const { render } = await import(pathToFileURL(path.join(ssr, 'entry-server.js')).href);
const app = render();

await writeFile(htmlPath, html.replace(PLACEHOLDER, () => app));
await rm(ssr, { recursive: true, force: true });
console.log(`prerender: inlined ${(app.length / 1024).toFixed(1)} KB of home page HTML`);
