import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import css from '../../styles.css?raw';
import '../i18n';
import SkillsList from './About/SkillsList';
import { magnifyAt, MAGNIFY_RADIUS } from './About/useMagnify';
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

  it('falls off smoothly from 1 under the pointer to 0 at the radius', () => {
    expect(magnifyAt(0, 0)).toBe(1);
    expect(magnifyAt(MAGNIFY_RADIUS / 2, 0)).toBeGreaterThan(0.3);
    expect(magnifyAt(MAGNIFY_RADIUS / 2, 0)).toBeLessThan(0.7);
    expect(magnifyAt(MAGNIFY_RADIUS, 0)).toBe(0);
  });

  it('grows the chip under the pointer more than its neighbour, and resets on leave', () => {
    const rows = [{ group: 'Web', items: ['A', 'B', 'C'] }];

    render(<SkillsList rows={rows} magnify itemTestId="chip" data-testid="list" />);
    const chips = screen.getAllByTestId('chip');

    chips.forEach((chip, i) => {
      const rect = { left: i * 80, top: 0, width: 60, height: 24 } as DOMRect;

      chip.getBoundingClientRect = () => rect;
    });

    const list = screen.getByTestId('list');

    // jsdom has no PointerEvent; a MouseEvent with the pointer type carries clientX/Y.
    const pointer = (type: string) => new MouseEvent(type, { clientX: 30, clientY: 12 });

    list.dispatchEvent(pointer('pointerenter'));
    list.dispatchEvent(pointer('pointermove'));
    flushFrames();
    const m = chips.map(c => Number(c.style.getPropertyValue('--m')));

    expect(m[0]).toBeCloseTo(1, 2);
    expect(m[1]).toBeGreaterThan(0);
    expect(m[1]).toBeLessThan(m[0]);
    expect(m[2]).toBe(0);
    expect(chips[0]).toHaveClass('glass-chip');

    list.dispatchEvent(new MouseEvent('pointerleave'));
    flushFrames();
    chips.forEach(c => expect(c.style.getPropertyValue('--m')).toBe('0.000'));
  });

  it('leaves the CV list without the lens', () => {
    render(<SkillsList rows={[{ group: 'Web', items: ['A'] }]} itemTestId="chip" />);
    expect(screen.getByTestId('chip')).not.toHaveClass('glass-chip');
    expect(screen.getByTestId('chip')).not.toHaveAttribute('data-chip');
  });

  it('scales and brightens chips from --m in the stylesheet', () => {
    const block = css.slice(css.indexOf('.glass-chip {'));

    expect(block).toMatch(/transform: scale\(calc\(1 \+ var\(--m\)/);
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

  it('styles Send message like View CV (edge), not the wine fill', () => {
    render(<MemoryRouter><Contact /></MemoryRouter>);
    const send = screen.getByRole('button', { name: /Send message/ });

    expect(send).toHaveClass('wine-edge');
    expect(send).not.toHaveClass('bg-wine-flow');
  });

  it('does not light the CV arrow when the rest of the CV row is hovered', () => {
    render(<MemoryRouter><Contact /></MemoryRouter>);
    const cvLink = screen.getByRole('link', { name: 'View CV' });
    const row = cvLink.closest('li')!;

    expect(row).not.toHaveClass('group');
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
