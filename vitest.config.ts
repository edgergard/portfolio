import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    // Several tests wait for lazy chunks (the contact form, the wine canvas) with findBy timeouts
    // up to 8s; under a loaded full-suite run the 5s default cut them off at random.
    testTimeout: 15000,
    setupFiles: ['./vitest.setup.ts'],
    // Let tests read styles.css as ?raw text (vitest blanks CSS by default).
    css: { include: [/styles\.css/] },
    // Node 25+ ships its own global localStorage (undefined without --localstorage-file), which
    // shadows jsdom's; turn it off so tests get the jsdom Storage.
    pool: 'forks',
    poolOptions: { forks: { execArgv: ['--no-experimental-webstorage'] } },
  },
});
