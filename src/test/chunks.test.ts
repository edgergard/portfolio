import { describe, expect, it } from 'vitest';
import config from '../../vite.config.ts?raw';
import root from '../Root.tsx?raw';
import lazyForm from '../components/Contact/LazyForm.tsx?raw';

describe('code splitting', () => {
  it('puts the shared libraries in a long-lived vendor chunk', () => {
    expect(config).toMatch(/manualChunks/);
    expect(config).toMatch(/'vendor'/);
    expect(config).toMatch(/react-dom/);
  });

  it('loads the archive and CV pages only when their routes open', () => {
    expect(root).toMatch(/lazy\(\(\) => import\('\.\/pages\/ArchivePage'\)\)/);
    expect(root).toMatch(/lazy\(\(\) => import\('\.\/pages\/CvPage'\)\)/);
  });

  it('loads the contact form on demand', () => {
    expect(lazyForm).toMatch(/dynamic\(\(\) => import\('\.\/ContactForm'\), \{ ssr: false, loading: FormPlaceholder \}\)/);
  });
});
