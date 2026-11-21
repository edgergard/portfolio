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
    setupFiles: ['./vitest.setup.ts'],
    // Let tests read styles.css as ?raw text (vitest blanks CSS by default).
    css: { include: [/styles\.css/] },
    // Node 25+ ships its own global localStorage (undefined without --localstorage-file), which
    // shadows jsdom's; turn it off so tests get the jsdom Storage.
    pool: 'forks',
    poolOptions: { forks: { execArgv: ['--no-experimental-webstorage'] } },
  },
});
