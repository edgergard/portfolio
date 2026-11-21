import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithI18n as render } from '../../test/renderWithI18n';
import Experience from './Experience';

const loop = vi.hoisted(() => ({ unregister: vi.fn(), register: vi.fn() }));

vi.mock('../ui/wineButtons/loop', () => ({ wineButtons: { register: loop.register } }));
loop.register.mockImplementation(() => loop.unregister);

afterEach(() => {
  loop.register.mockClear();
});

const cards = () => screen.getAllByTestId('xp-card');

describe('Experience job cards', () => {
  it('shows only Pecode and HYS Enterprise (no Self-employed on the home page)', () => {
    render(<Experience />);

    expect(cards()).toHaveLength(2);
    expect(screen.queryByText(/Self-employed/)).not.toBeInTheDocument();
  });

  it('frames each card with the animated wine edge', () => {
    render(<Experience />);
    cards().forEach(card => expect(card).toHaveClass('wine-edge'));
  });

  it('renders the header: monogram, role, company line, period and duration', () => {
    render(<Experience />);
    const [pecode, hys] = cards();

    expect(within(pecode).getByTestId('xp-monogram')).toHaveTextContent('P');
    expect(within(pecode).getByRole('heading', { level: 3 })).toHaveTextContent('React Native / Frontend Developer');
    expect(within(pecode).getByText('Pecode · Outsourcing · Kyiv')).toBeInTheDocument();
    expect(within(pecode).getByText('Oct 2025 — Oct 2026')).toBeInTheDocument();
    expect(within(pecode).getByText('1 yr')).toBeInTheDocument();

    expect(within(hys).getByTestId('xp-monogram')).toHaveTextContent('H');
    expect(within(hys).getByText('HYS Enterprise · Product teams of 6–9')).toBeInTheDocument();
    expect(within(hys).getByText('Apr 2024 — Oct 2025')).toBeInTheDocument();
    expect(within(hys).getByText('1.5 yrs')).toBeInTheDocument();
  });

  it('shows the owner-confirmed metrics, three per job', () => {
    render(<Experience />);
    const [pecode, hys] = cards();
    const metrics = (card: HTMLElement) =>
      within(card).getAllByTestId('xp-metric').map(m => m.textContent);

    expect(metrics(pecode)).toEqual([
      '9projects · 7 mobile, 2 web',
      '10+project estimates',
      '95–100Lighthouse, Next.js site',
    ]);
    expect(metrics(hys)).toEqual([
      '3products: mobile, admin, B2B',
      '−50%+loading states on pages, thanks to caching',
      'hours → minutestime to find a production issue (PostHog)',
    ]);
  });

  it('paints metric tiles and stack badges with the live Wine shader over the CSS fallback', () => {
    render(<Experience />);
    const tiles = screen.getAllByTestId('xp-metric');
    const badges = screen.getAllByTestId('xp-badge');

    for (const el of [...tiles, ...badges]) {
      expect(el).toHaveClass('bg-wine-flow');
      expect(el.querySelector('canvas')).not.toBeNull();
    }

    expect(loop.register).toHaveBeenCalledTimes(tiles.length + badges.length);
  });

  it('lists the stack as badges', () => {
    render(<Experience />);
    const [pecode, hys] = cards();

    expect(within(pecode).getAllByTestId('xp-badge').map(b => b.textContent)).toContain('React Native');
    expect(within(hys).getAllByTestId('xp-badge').map(b => b.textContent)).toContain('PostHog');
  });

  it('puts the bullets in a native "What I did" disclosure, open on every job', () => {
    render(<Experience />);
    const [pecode, hys] = cards();
    const details = (card: HTMLElement) => card.querySelector('details')!;

    expect(details(pecode)).toHaveAttribute('open');
    expect(details(hys)).toHaveAttribute('open');
    expect(within(pecode).getByText('What I did').tagName).toBe('SUMMARY');
    expect(within(pecode).getAllByRole('listitem', { hidden: true })).toHaveLength(5);
  });

  it('uses the rewritten HYS bullets: caching, PostHog, migration without a metric', () => {
    render(<Experience />);
    const items = within(cards()[1]).getAllByRole('listitem', { hidden: true }).map(li => li.textContent);

    expect(items).toHaveLength(5);
    expect(items).toContain(
      'Built a Next.js admin portal for user data; TanStack Query caching cut loading states on pages by more than 50%.',
    );
    expect(items).toContain(
      'Integrated PostHog analytics from scratch: finding the cause of a production issue went from hours to a few minutes.',
    );
    expect(items).toContain('Migrated a site from Vue to React. Teams of 6–9, international clients, English.');
  });

  it('renders in Ukrainian', () => {
    render(<Experience />, 'uk');
    const [pecode, hys] = cards();

    expect(within(pecode).getByText('Pecode · Аутсорс · Київ')).toBeInTheDocument();
    expect(within(pecode).getByText('1 рік')).toBeInTheDocument();
    expect(within(pecode).getByText('Що я робив')).toBeInTheDocument();
    expect(within(hys).getByText('1,5 року')).toBeInTheDocument();
    expect(within(hys).getByText('години → хвилини')).toBeInTheDocument();
    expect(within(hys).getByText(/PostHog з нуля/)).toBeInTheDocument();
  });
});
