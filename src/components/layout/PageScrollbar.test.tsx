import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PageScrollbar from './PageScrollbar';

const RAIL = 800;

// jsdom has no PointerEvent; a MouseEvent carries the clientY and button the rail reads.
if (typeof window.PointerEvent === 'undefined') {
  (window as unknown as { PointerEvent: unknown }).PointerEvent = class extends MouseEvent {
    pointerId: number;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
    }
  };
}

/** Pretends the device has (or lacks) a fine pointer. */
const pointer = (fine: boolean) =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    query =>
      ({
        matches: query.includes('pointer: fine') ? fine : false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );

/** A 4000px page in a 1000px viewport, scrolled to `top`. */
const mockPage = (top = 0) => {
  const el = document.documentElement;
  let scrollTop = top;

  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 4000 });
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: 1000 });
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (v: number) => {
      scrollTop = v;
    },
  });
  // Every element (the rail) reports the rail height.
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(RAIL);

  return el;
};

const thumbOf = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-scrollbar-thumb]')!;
const railOf = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-scrollbar-rail]')!;

describe('PageScrollbar', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);

      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    const el = document.documentElement as unknown as Record<string, unknown>;

    delete el.scrollHeight;
    delete el.clientHeight;
    delete el.scrollTop;
  });

  it('renders nothing on coarse pointers (touch keeps the native scrollbar)', () => {
    pointer(false);
    mockPage();
    const { container } = render(<PageScrollbar />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a decorative rail with a sized thumb on fine pointers', () => {
    pointer(true);
    mockPage();
    const { container } = render(<PageScrollbar />);
    const rail = railOf(container);

    expect(rail).toHaveAttribute('aria-hidden', 'true');
    expect(rail).toHaveClass('print:hidden');
    expect(thumbOf(container).style.height).toBe('200px');
    expect(thumbOf(container)).toHaveClass('wine-thumb');
  });

  it('follows window scroll', () => {
    pointer(true);
    const el = mockPage();
    const { container } = render(<PageScrollbar />);

    el.scrollTop = 1500;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(thumbOf(container).style.transform).toBe('translateY(300px)');
  });

  it('scrolls the page when the thumb is dragged', () => {
    pointer(true);
    const el = mockPage();
    const { container } = render(<PageScrollbar />);
    const rail = railOf(container);

    vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue({ top: 10 } as DOMRect);
    // The thumb spans 10..210 in viewport coordinates; grab it at 100 and drag 60px down.
    fireEvent.pointerDown(rail, { clientY: 100, button: 0, pointerId: 1 });
    fireEvent.pointerMove(window, { clientY: 160, pointerId: 1 });
    expect(el.scrollTop).toBe(300);

    fireEvent.pointerUp(window, { clientY: 160, pointerId: 1 });
    fireEvent.pointerMove(window, { clientY: 400, pointerId: 1 });
    expect(el.scrollTop).toBe(300);
  });

  it('pages toward a click on the rail outside the thumb', () => {
    pointer(true);
    const el = mockPage();
    const scrollTo = vi.fn();

    (el as unknown as { scrollTo: unknown }).scrollTo = scrollTo;
    const { container } = render(<PageScrollbar />);
    const rail = railOf(container);

    vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue({ top: 10 } as DOMRect);
    fireEvent.pointerDown(rail, { clientY: 600, button: 0, pointerId: 1 });
    expect(scrollTo).toHaveBeenCalledWith({ top: 900, behavior: 'smooth' });
    delete (el as unknown as { scrollTo?: unknown }).scrollTo;
  });
});
