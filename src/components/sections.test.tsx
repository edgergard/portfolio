import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '../i18n';
import About from './About';
import Experience from './Experience';

// jsdom never reports intersections, so render the reveal wrapper as a plain div.
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...rest }: Record<string, unknown>) => (
      <div className={className as string} data-testid={rest['data-testid'] as string}>
        {children as React.ReactNode}
      </div>
    ),
  },
}));

describe('About', () => {
  it('renders the four facts with C1 visible', () => {
    render(<About />);
    expect(screen.getAllByTestId('fact')).toHaveLength(4);
    expect(screen.getByText('C1')).toBeVisible();
  });

  it('renders the four skill groups', () => {
    render(<About />);
    for (const title of ['Web', 'Mobile', 'Data & state', 'Ship & craft']) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });
});

describe('Experience', () => {
  it('renders the jobs in order', () => {
    render(<Experience />);
    const rows = screen.getAllByTestId('xp-row');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText(/Pecode/)).toBeInTheDocument();
    expect(within(rows[1]).getByText(/HYS Enterprise/)).toBeInTheDocument();
    expect(within(rows[2]).getByText(/Self-employed/)).toBeInTheDocument();
  });

  it('shows the Pecode period and five bullets, without a Current marker', () => {
    render(<Experience />);
    const pecode = screen.getAllByTestId('xp-row')[0];
    expect(within(pecode).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Oct 2025 — Oct 2026')).toBeVisible();
    expect(screen.queryByText('Current')).not.toBeInTheDocument();
  });

  it('renders two education cards', () => {
    render(<Experience />);
    expect(screen.getAllByTestId('edu-card')).toHaveLength(2);
  });
});
