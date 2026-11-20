import { useRef } from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ScenePointer } from './motion';
import { useHeroPointer } from './useHeroPointer';

const seen: { pointer?: ScenePointer } = {};

const Probe = () => {
  const panel = useRef<HTMLDivElement>(null);
  const pointer = useHeroPointer(panel);

  seen.pointer = pointer.current;

  return (
    <section data-testid="hero">
      <p>copy</p>
      <div ref={panel} data-testid="panel" />
    </section>
  );
};

describe('useHeroPointer', () => {
  // Reduced motion no longer switches tracking off: the hook has no on/off switch at all.
  it('tracks the pointer over the whole hero in panel NDC, then lets go on leave', () => {
    const { getByTestId } = render(<Probe />);

    const rect = { left: 100, top: 0, width: 200, height: 100 };

    getByTestId('panel').getBoundingClientRect = () => rect as unknown as DOMRect;

    // jsdom has no PointerEvent; a MouseEvent carries the same coordinates.
    act(() => {
      const move = new MouseEvent('pointermove', { clientX: 300, clientY: 25, bubbles: true });

      getByTestId('hero').dispatchEvent(move);
    });
    expect(seen.pointer).toMatchObject({ x: 1, y: 0.5, hovering: true });

    fireEvent.pointerLeave(getByTestId('hero'));
    expect(seen.pointer?.hovering).toBe(false);
  });
});
