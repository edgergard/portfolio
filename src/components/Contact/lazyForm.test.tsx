import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { intersectEverything } from '../../test/intersect';
import { renderWithI18n } from '../../test/renderWithI18n';
import LazyForm from './LazyForm';
import lazyFormSource from './LazyForm.tsx?raw';

// A stand-in that loads at once, so a form that is not shown was not requested (the real form
// is tested with the Contact section).
vi.mock('./ContactForm', () => ({ default: () => <form aria-label="contact form" /> }));

const form = () => screen.queryByRole('form', { name: 'contact form' });
const placeholder = (container: HTMLElement) => container.querySelector('[aria-hidden].min-h-\\[478px\\]');
/** Lets a requested chunk (the mocked import resolves in a few ticks) render. */
const settle = () => act(() => new Promise(resolve => setTimeout(resolve, 50)));

describe('LazyForm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('loads the form on demand, in the browser only, with the glass placeholder meanwhile', () => {
    expect(lazyFormSource).toMatch(
      /dynamic\(\(\) => import\('\.\/ContactForm'\), \{ ssr: false, loading: FormPlaceholder \}\)/,
    );
  });

  it('shows only the placeholder until the section nears the viewport', async () => {
    const { container } = renderWithI18n(<LazyForm />);

    await settle();
    expect(placeholder(container)).not.toBeNull();
    expect(form()).toBeNull();
  });

  it('swaps the placeholder for the form once the section nears the viewport', async () => {
    intersectEverything();
    const { container } = renderWithI18n(<LazyForm />);

    await settle();
    expect(form()).not.toBeNull();
    expect(placeholder(container)).toBeNull();
  });
});
