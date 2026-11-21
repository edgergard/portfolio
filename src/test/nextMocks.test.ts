import { render, screen } from '@testing-library/react';
import dynamic from 'next/dynamic';
import localFont from 'next/font/local';
import Image from 'next/image';
import { notFound, redirect, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

describe('Next.js module mocks (vitest.setup.ts)', () => {
  it('renders next/image as a plain <img> without Next-only props', () => {
    render(createElement(Image, {
      src: { src: '/me.webp', width: 10, height: 10 },
      alt: 'Portrait',
      fill: true,
      priority: true,
    }));

    const img = screen.getByAltText('Portrait');

    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/me.webp');
    expect(img).not.toHaveAttribute('fill');
    expect(img).not.toHaveAttribute('priority');
  });

  it('resolves next/dynamic loaders lazily', async () => {
    const Hello = dynamic(async () => ({ default: () => createElement('p', null, 'Loaded') }));

    render(createElement(Hello));

    expect(await screen.findByText('Loaded')).toBeInTheDocument();
  });

  it('returns font class names from next/font/local', () => {
    const font = localFont({ src: './Geist.woff2', variable: '--font-geist' });

    expect(font).toEqual({ variable: expect.any(String), className: expect.any(String) });
  });

  it('stubs the next/navigation hooks and throws on redirect / notFound', () => {
    expect(usePathname()).toBe('/');
    expect(useSearchParams().toString()).toBe('');
    expect(typeof useRouter().push).toBe('function');
    expect(() => redirect('/cv/react-native')).toThrow(/NEXT_REDIRECT/);
    expect(() => notFound()).toThrow(/NEXT_NOT_FOUND/);
  });
});
