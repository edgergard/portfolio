import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import css from '../../styles.css?raw';
import '../i18n';
import SkillsList from './About/SkillsList';
import { GROW, lensScale, rowShifts, SHRINK } from './About/useMagnify';
import Certifications from './Certifications';
import Contact from './Contact';
import ArchiveCta from './Projects/ArchiveCta';

const finePointer = () =>
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('pointer: fine'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

const frames: FrameRequestCallback[] = [];
const flushFrames = () => frames.splice(0).forEach(cb => cb(0));

describe('Core stack lens', () => {
  beforeEach(() => {
    finePointer();
    frames.length = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('grows the chip at the pointer, shrinks its neighbours, leaves far chips alone', () => {
    expect(lensScale(0)).toBeCloseTo(1 + GROW, 3);
    expect(lensScale(80)).toBeLessThan(1);
    expect(lensScale(80)).toBeGreaterThan(1 - SHRINK - 0.01);
    expect(lensScale(400)).toBeCloseTo(1, 3);
    expect(lensScale(0, 0)).toBe(1);
  });

  it('moves neighbours aside so scaled chips never overlap', () => {
    const row = [0, 1, 2, 3, 4].map(i => ({ left: i * 86, width: 80 }));
    const scales = row.map(c => lensScale(2 * 86 + 40 - (c.left + 40)));
    const shifts = rowShifts(row, scales, 2);
    const box = (i: number) => {
      const cx = row[i].left + 40 + shifts[i];

      return [cx - 40 * scales[i], cx + 40 * scales[i]];
    };

    expect(shifts[2]).toBe(0);
    for (let i = 0; i < 4; i++) {
      expect(box(i)[1]).toBeLessThanOrEqual(box(i + 1)[0] + 0.001);
    }
  });

  it('reacts only in the row under the pointer, and settles on leave', () => {
    const rows = [{ group: 'Web', items: ['A', 'B', 'C'] }, { group: 'Mobile', items: ['D', 'E'] }];

    render(<SkillsList rows={rows} magnify itemTestId="chip" data-testid="list" />);
    const chips = screen.getAllByTestId('chip');

    chips.forEach((chip, i) => {
      const row = i < 3 ? 0 : 1;
      const rect = { left: (i % 3) * 80, top: row * 40, width: 60, height: 24 } as DOMRect;

      chip.getBoundingClientRect = () => rect;
    });

    const list = screen.getByTestId('list');
    // jsdom has no PointerEvent; a MouseEvent with the pointer type carries clientX/Y.
    const pointer = (type: string) => new MouseEvent(type, { clientX: 110, clientY: 12 });
    const num = (el: HTMLElement, v: string) => parseFloat(el.style.getPropertyValue(v));

    list.dispatchEvent(pointer('pointerenter'));
    list.dispatchEvent(pointer('pointermove'));
    flushFrames();

    expect(num(chips[1], '--s')).toBeGreaterThan(1.2);
    expect(num(chips[0], '--s')).toBeLessThan(1);
    expect(num(chips[2], '--s')).toBeLessThan(1);
    expect(num(chips[0], '--tx')).toBeLessThan(0);
    expect(num(chips[2], '--tx')).toBeGreaterThan(0);
    expect(num(chips[3], '--s')).toBe(1);
    expect(num(chips[4], '--s')).toBe(1);

    list.dispatchEvent(new MouseEvent('pointerleave'));
    flushFrames();
    chips.forEach(c => expect(num(c, '--s')).toBe(1));
  });

  it('leaves the CV list without the lens', () => {
    render(<SkillsList rows={[{ group: 'Web', items: ['A'] }]} itemTestId="chip" />);
    expect(screen.getByTestId('chip')).not.toHaveClass('glass-chip');
    expect(screen.getByTestId('chip')).not.toHaveAttribute('data-chip');
  });

  it('scales, shifts and brightens chips from the lens variables, without will-change', () => {
    const block = css.slice(css.indexOf('.glass-chip {'), css.indexOf('}', css.indexOf('.glass-chip {')));

    expect(block).toMatch(/transform: translateX\(var\(--tx\)\) scale\(var\(--s\)\)/);
    expect(block).not.toMatch(/will-change/);
    expect(block).toMatch(/backdrop-filter: blur\(calc\(/);
    expect(block).toMatch(/transition:/);
  });
});

describe('round 6 fixes', () => {
  it('fills the certificate bars with the live wine', () => {
    render(<Certifications />);
    const fills = screen.getAllByTestId('cert-bar-fill');

    expect(fills.length).toBeGreaterThan(0);
    fills.forEach(f => {
      expect(f).toHaveClass('bg-wine-flow');
      expect(f.querySelector('canvas')).not.toBeNull();
      expect(f.style.width).toMatch(/%$/);
    });
  });

  it('styles Send message like View experience (the live wine fill)', () => {
    render(<MemoryRouter><Contact /></MemoryRouter>);
    const send = screen.getByRole('button', { name: /Send message/ });

    // The primary button, like View experience in the hero: the live wine fill.
    expect(send).toHaveClass('bg-wine-flow');
    expect(send.querySelector('canvas')).not.toBeNull();
  });

  it('does not light the CV arrow when the rest of the CV row is hovered', () => {
    render(<MemoryRouter><Contact /></MemoryRouter>);
    const cvLink = screen.getByRole('link', { name: 'View CV' });
    const row = cvLink.closest('li')!;

    expect(row).not.toHaveClass('group');
    // The last-row rule drops only row hairlines ([data-row]), never the arrow circle's border.
    expect(cvLink).not.toHaveAttribute('data-row');
    expect(within(row).getAllByRole('link').length).toBeGreaterThan(1);
  });

  it('puts the archive arrow on the live wine instead of a white disc', () => {
    render(<MemoryRouter><ArchiveCta /></MemoryRouter>);
    const arrow = screen.getByTestId('archive-cta-arrow');

    expect(arrow).toHaveClass('bg-wine-flow', 'text-white');
    expect(arrow).not.toHaveClass('bg-white');
    expect(arrow.querySelector('canvas')).not.toBeNull();
  });

  it('keeps the dark palette inside wine bands in the light theme', () => {
    const block = css.slice(css.indexOf(":root[data-theme='light'] .on-wine"));

    expect(block).toMatch(/--c-ink: 255 255 255/);
    expect(block).toMatch(/--c-surface: 18 18 20/);
  });
});
