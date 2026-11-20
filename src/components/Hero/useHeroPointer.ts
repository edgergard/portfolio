import { useEffect, useRef, type RefObject } from 'react';
import type { ScenePointer } from './motion';

/**
 * Tracks the pointer anywhere over the hero section, in NDC of the canvas panel,
 * so the knot reacts while the visitor reads the text column too.
 * Active under reduced motion as well: the tilt follows the visitor's own hand.
 */
export const useHeroPointer = (ref: RefObject<HTMLElement>) => {
  const pointer = useRef<ScenePointer>({ x: 0, y: 0, hovering: false });

  useEffect(() => {
    const panel = ref.current;
    const hero = panel?.closest('section') ?? panel;

    if (!panel || !hero) {
      return;
    }

    const state = pointer.current;
    const onMove = (event: PointerEvent) => {
      const rect = panel.getBoundingClientRect();

      state.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      state.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      state.hovering = true;
    };

    const onLeave = () => {
      state.hovering = false;
    };

    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);

    return () => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      state.hovering = false;
    };
  }, [ref]);

  return pointer;
};
