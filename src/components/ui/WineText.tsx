import { useEffect, useRef } from 'react';
import { wineButtons, type Paint } from './wineButtons/loop';

const px = (value: string) => (Number.isFinite(parseFloat(value)) ? parseFloat(value) : 0);

/**
 * Text filled with the live Wine shader, the same animation as the wine backgrounds. The shared
 * renderer copies a frame into a canvas over the text each tick; the canvas then keeps only the
 * glyphs (drawn with the text's own computed font). The real text stays underneath for screen
 * readers and selection; until the canvas holds a frame, or without WebGL, it shows the CSS
 * `.wine-text` gradient instead (styles.css hides that once the canvas is live).
 */
const WineText = ({ text }: { text: string }) => {
  const label = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const paint: Paint = (ctx, width) => {
      const el = label.current;
      const box = canvas.current;

      if (!el || !box || !box.clientWidth) {
        return;
      }

      const cs = getComputedStyle(el);
      const scale = width / box.clientWidth;
      const value = cs.textTransform === 'uppercase' ? text.toUpperCase() : text;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.font = `${cs.fontWeight} ${px(cs.fontSize) * scale}px ${cs.fontFamily}`;
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px(cs.letterSpacing) * scale}px`;
      ctx.textBaseline = 'alphabetic';
      // Put the baseline where the DOM puts it: the font box centred in the line box.
      const m = ctx.measureText(value);
      const ascent = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
      const descent = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
      const line = box.clientHeight * scale;

      ctx.fillStyle = '#000';
      ctx.fillText(value, 0, (line - (ascent + descent)) / 2 + ascent);
      ctx.restore();
    };

    return wineButtons.register(canvas.current!, { paint, fit: 'fill' });
  }, [text]);

  return (
    <span className="wine-name relative inline-block">
      <span ref={label} className="wine-text">{text}</span>
      <canvas
        ref={canvas}
        aria-hidden
        data-testid="wine-text-canvas"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      />
    </span>
  );
};

export default WineText;
