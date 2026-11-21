import { useEffect, useState, type RefObject } from 'react';
import { mediaQuery, useClientValue } from '../../utils/clientValue';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

const reducedMotion = mediaQuery(REDUCED_MOTION);

/** Tracks prefers-reduced-motion, live (false while prerendering and hydrating). */
export const usePrefersReducedMotion = () =>
  useClientValue(reducedMotion.subscribe, reducedMotion.getSnapshot, false);

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange);

  return () => document.removeEventListener('visibilitychange', onChange);
};

const isPageVisible = () => !document.hidden;

/**
 * Flips to true once the page has loaded and the main thread is idle, so a 3D chunk
 * (parse + shader compile) runs after the text has painted. Safari has no
 * requestIdleCallback, hence the timeout fallback.
 */
export const useIdleMount = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      } else {
        timer = setTimeout(() => setReady(true), 200);
      }
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => {
      window.removeEventListener('load', schedule);

      if (idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }

      clearTimeout(timer);
    };
  }, []);

  return ready;
};

/** True only if a WebGL context can actually be created (not just when the API exists). */
export const hasWebGL = () => {
  if (typeof window.WebGLRenderingContext === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');

    // Release the probe context right away; browsers cap live contexts.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();

    return gl !== null;
  } catch {
    return false;
  }
};

/**
 * WebGL support, probed once the page is idle: creating a context is a blocking
 * GPU-process round trip. null = not probed yet (show the CSS fallback meanwhile).
 */
export const useIdleWebGL = () => {
  const idle = useIdleMount();
  const [webGL, setWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    if (idle) {
      setWebGL(hasWebGL());
    }
  }, [idle]);

  return webGL;
};

/** True while the element intersects the viewport and the tab is visible. */
export const useOnScreen = (ref: RefObject<HTMLElement | null>) => {
  const [intersecting, setIntersecting] = useState(true);
  const pageVisible = useClientValue(subscribeVisibility, isPageVisible, true);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting));

    observer.observe(el);

    return () => observer.disconnect();
  }, [ref]);

  return intersecting && pageVisible;
};
