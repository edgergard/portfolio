import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { intersectEverything } from '@/test/intersect';
import Reveal, { REVEAL_ROOT_MARGIN } from './Reveal';

afterEach(() => vi.unstubAllGlobals());

describe('Reveal', () => {
  it('starts hidden (data-reveal without data-shown) until it scrolls into view', () => {
    render(<Reveal testId="r">x</Reveal>);

    expect(screen.getByTestId('r')).toHaveAttribute('data-reveal');
    expect(screen.getByTestId('r')).not.toHaveAttribute('data-shown');
  });

  it('shows once it intersects, observing 60px inside the viewport', () => {
    const options: (IntersectionObserverInit | undefined)[] = [];
    const Base = (() => {
      intersectEverything();

      return globalThis.IntersectionObserver;
    })();

    vi.stubGlobal('IntersectionObserver', class extends Base {
      constructor(cb: IntersectionObserverCallback, init?: IntersectionObserverInit) {
        super(cb, init);
        options.push(init);
      }
    });
    render(<Reveal testId="r" className="mt-14">x</Reveal>);

    expect(screen.getByTestId('r')).toHaveAttribute('data-shown');
    expect(screen.getByTestId('r')).toHaveClass('mt-14');
    expect(options[0]?.rootMargin).toBe(REVEAL_ROOT_MARGIN);
    expect(REVEAL_ROOT_MARGIN).toBe('-60px');
  });

  it('shows at once without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Reveal testId="r">x</Reveal>);

    expect(screen.getByTestId('r')).toHaveAttribute('data-shown');
  });
});
