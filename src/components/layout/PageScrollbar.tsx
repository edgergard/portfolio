import { useEffect, useRef, useState } from 'react';
import { dragScrollTop, thumbMetrics, type ScrollDims } from './scrollbarMetrics';

const FINE_POINTER = '(pointer: fine)';
/** How long the rail stays fully visible after the last scroll. */
const IDLE_MS = 900;
/** A rail click pages by this share of the viewport, like the native track. */
const PAGE = 0.9;

const scroller = () =>
  (document.scrollingElement as HTMLElement | null) ?? document.documentElement;

const dimsOf = (el: HTMLElement): ScrollDims => ({
  scrollTop: el.scrollTop,
  scrollHeight: el.scrollHeight,
  clientHeight: el.clientHeight,
});

/** True on devices with a mouse or trackpad; tracks changes (a tablet docking a mouse). */
const useFinePointer = () => {
  const [fine, setFine] = useState(() => window.matchMedia(FINE_POINTER).matches);

  useEffect(() => {
    const query = window.matchMedia(FINE_POINTER);
    const onChange = () => setFine(query.matches);

    query.addEventListener?.('change', onChange);

    return () => query.removeEventListener?.('change', onChange);
  }, []);

  return fine;
};

/**
 * The page's scrollbar on fine-pointer devices: a floating wine pill (styles.css .wine-thumb)
 * on a faint rail, over native scrolling (styles.css hides the native bar there). It follows
 * the page's scroll and size, drags to scroll and pages toward rail clicks; keyboard, wheel
 * and anchor scrolling stay native. Decorative, so hidden from assistive tech. Touch devices
 * render nothing and keep their own scrollbar.
 */
const PageScrollbar = () => {
  const fine = useFinePointer();
  const rail = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fine) {
      return;
    }

    const railEl = rail.current!;
    const thumbEl = thumb.current!;
    let frame: number | null = null;
    let idle: ReturnType<typeof setTimeout> | undefined;
    let drag: { y: number; top: number } | null = null;

    const update = () => {
      frame = null;
      const { size, offset, scrollable } = thumbMetrics(dimsOf(scroller()), railEl.clientHeight);

      railEl.style.visibility = scrollable ? '' : 'hidden';
      thumbEl.style.height = `${size}px`;
      thumbEl.style.transform = `translateY(${offset}px)`;
    };

    const schedule = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(update);
      }
    };

    const wake = () => {
      railEl.dataset.active = 'true';
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (!drag) {
          delete railEl.dataset.active;
        }
      }, IDLE_MS);
    };

    const onScroll = () => {
      schedule();
      wake();
    };

    const onMove = (e: PointerEvent) => {
      if (drag) {
        const el = scroller();

        el.scrollTop = dragScrollTop(dimsOf(el), railEl.clientHeight, drag.top, e.clientY - drag.y);
      }
    };

    const endDrag = () => {
      drag = null;
      delete railEl.dataset.dragging;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      wake();
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) {
        return;
      }

      e.preventDefault();
      const el = scroller();
      const dims = dimsOf(el);
      const { size, offset } = thumbMetrics(dims, railEl.clientHeight);
      const y = e.clientY - railEl.getBoundingClientRect().top;

      if (y >= offset && y <= offset + size) {
        drag = { y: e.clientY, top: dims.scrollTop };
        railEl.dataset.dragging = 'true';
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);
      } else {
        const step = dims.clientHeight * PAGE * (y < offset ? -1 : 1);

        el.scrollTo({ top: dims.scrollTop + step, behavior: 'smooth' });
      }

      wake();
    };

    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);

    resize?.observe(document.documentElement);
    resize?.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    railEl.addEventListener('pointerdown', onDown);
    update();

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }

      clearTimeout(idle);
      resize?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
      railEl.removeEventListener('pointerdown', onDown);
      endDrag();
      // endDrag() wakes the rail and arms a fresh idle timer; clear it after, not before.
      clearTimeout(idle);
    };
  }, [fine]);

  if (!fine) {
    return null;
  }

  return (
    <div
      ref={rail}
      aria-hidden
      data-scrollbar-rail
      className={
        'group fixed bottom-2.5 right-1.5 top-[82px] z-50 w-2 touch-none select-none print:hidden '
        // A wider invisible hit area out to the window edge; the visible track fades when idle.
        + "after:absolute after:-left-1 after:-right-1.5 after:inset-y-0 after:content-[''] "
        + "before:absolute before:inset-0 before:rounded-full before:bg-white/[.04] before:opacity-40 before:transition-opacity before:duration-500 before:content-[''] "
        + 'hover:before:opacity-100 data-[active]:before:opacity-100'
      }
    >
      <div ref={thumb} data-scrollbar-thumb className="wine-thumb" />
    </div>
  );
};

export default PageScrollbar;
