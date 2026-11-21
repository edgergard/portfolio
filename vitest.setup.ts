import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { createElement, lazy, Suspense, type ComponentType } from 'react';
import { afterEach, vi } from 'vitest';

afterEach(() => cleanup());

window.matchMedia
  = window.matchMedia
  || ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList);

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver
  = IntersectionObserverStub;

// Next.js modules are mocked: their real versions need the Next runtime (router, image and
// font loaders). Tests can override any of these with vi.mocked(...).
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('next/image', () => {
  // Next-only <Image> props that are not valid <img> attributes.
  const nextOnly = new Set([
    'fill', 'priority', 'placeholder', 'blurDataURL', 'quality', 'loader', 'unoptimized',
  ]);

  return {
    default: ({ src, ...props }: Record<string, unknown> & { src: string | { src: string } }) =>
      createElement('img', {
        ...Object.fromEntries(Object.entries(props).filter(([key]) => !nextOnly.has(key))),
        src: typeof src === 'string' ? src : src.src,
      }),
  };
});

vi.mock('next/font/local', () => ({
  default: () => ({ variable: 'font-variable', className: 'font-class' }),
}));

type Loaded<P> = ComponentType<P> | { default: ComponentType<P> };

vi.mock('next/dynamic', () => ({
  default: <P extends object>(
    loader: () => Promise<Loaded<P>>,
    options?: { loading?: ComponentType },
  ) => {
    const Lazy = lazy(async () => {
      const mod = await loader();

      return { default: 'default' in mod ? mod.default : mod };
    });

    const fallback = options?.loading ? createElement(options.loading) : null;

    return (props: P) => createElement(Suspense, { fallback }, createElement(Lazy, props));
  },
}));
