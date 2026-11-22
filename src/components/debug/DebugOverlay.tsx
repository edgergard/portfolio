'use client';

import { useEffect, useState } from 'react';

type Dbg = { errors: string[]; lost: string[]; draws: Map<HTMLCanvasElement, number> };

const where = (c: HTMLCanvasElement) => {
  if (!c.isConnected) {
    return 'offscreen';
  }

  if (c.closest('#hero')) {
    return 'hero';
  }

  const surface = c.closest<HTMLElement>('[data-testid="wine-surface"]');

  if (surface) {
    const index = [...document.querySelectorAll('[data-testid="wine-surface"]')].indexOf(surface);
    const section = surface.closest('section')?.id || surface.parentElement?.className.split(' ')[0];

    return `surface${index} (${section})`;
  }

  return c.parentElement?.className.split(' ')[0] || 'canvas';
};

const gpu = () => {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    const name = info ? gl?.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl ? 'webgl (renderer hidden)' : 'no webgl';

    gl?.getExtension('WEBGL_lose_context')?.loseContext();

    return String(name);
  } catch {
    return 'probe failed';
  }
};

/** Live diagnostics panel, shown only with `?debug` in the URL (see lib/debug-script.ts). */
const DebugOverlay = () => {
  const [lines, setLines] = useState<string[] | null>(null);

  useEffect(() => {
    const dbg = (window as unknown as { __dbg?: Dbg }).__dbg;

    if (!dbg) {
      return undefined;
    }

    const renderer = gpu();
    let frames = 0;
    let raf = 0;
    const tick = () => {
      frames++;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    let last = new Map(dbg.draws);
    const timer = setInterval(() => {
      const now = new Map(dbg.draws);
      const canvases = [...document.querySelectorAll('canvas')].filter(c => !now.has(c) && c.closest('#hero, [data-testid="wine-surface"]'));
      const rows = [...now].map(([c, n]) => `${where(c)} ${c.width}x${c.height}: ${n - (last.get(c) ?? 0)} draws/s`);

      canvases.forEach(c => rows.push(`${where(c)} ${c.width}x${c.height}: never drew`));
      const surfaces = [...document.querySelectorAll<HTMLElement>('[data-testid="wine-surface"]')]
        .map((s, i) => `s${i}:${s.dataset.state}`).join(' ');

      setLines([
        `fps ${frames} · dpr ${devicePixelRatio} · ${innerWidth}x${innerHeight}`,
        `gpu ${renderer}`,
        `reduced motion ${matchMedia('(prefers-reduced-motion: reduce)').matches} · hidden ${document.hidden}`,
        `surfaces ${surfaces || 'none'}`,
        ...rows,
        `context lost: ${dbg.lost.join(', ') || 'none'}`,
        ...dbg.errors.slice(-6),
      ]);
      frames = 0;
      last = now;
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };
  }, []);

  if (!lines) {
    return null;
  }

  return (
    <pre
      data-testid="debug-overlay"
      className="pointer-events-none fixed inset-x-2 bottom-2 z-[9999] max-h-[45vh] overflow-hidden whitespace-pre-wrap rounded bg-black/85 p-2 font-mono text-[10px] leading-snug text-green-300"
    >
      {lines.join('\n')}
    </pre>
  );
};

export default DebugOverlay;
