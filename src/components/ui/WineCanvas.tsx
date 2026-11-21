import { useEffect, useRef } from 'react';
import { wineButtons } from './wineButtons/loop';

/**
 * The hero's live Wine shader for a small element (primary button, tile, badge): a 2D canvas
 * the shared renderer (wineButtons) copies into every frame, so it costs no extra WebGL context.
 * Put it inside a `.bg-wine-flow` element: it stays transparent until it holds a frame,
 * so the CSS fill shows while loading, without WebGL, or after an error.
 */
const WineCanvas = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => wineButtons.register(canvas.current!), []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[1] h-full w-full opacity-0 transition-opacity duration-300"
    />
  );
};

export default WineCanvas;
