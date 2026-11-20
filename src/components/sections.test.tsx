import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '../i18n';
import About from './About';
import Experience from './Experience';
import Certifications from './Certifications';

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

describe('Certifications', () => {
  it('renders the EF SET level, score, bars and award date', () => {
    render(<Certifications />);
    expect(screen.getByText('C2')).toBeInTheDocument();
    expect(screen.getByText('74')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('Listening')).toBeInTheDocument();
    expect(screen.getByText('76')).toBeInTheDocument();
    expect(screen.getByText('Awarded 18 Nov 2026')).toBeInTheDocument();
  });

  it('sizes bars by value over max', () => {
    render(<Certifications />);
    const bars = screen.getAllByTestId('cert-bar');
    expect(bars[0]).toHaveStyle('--w: 72%');
    expect(bars[1]).toHaveStyle('--w: 76%');
  });

  it('links to the certificate in a new tab', () => {
    render(<Certifications />);
    const link = screen.getByRole('link', { name: /View certificate/ });
    expect(link).toHaveAttribute('href', 'https://cert.efset.org/en/oWhPgz');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noreferrer');
  });

  it('has no placeholder card', () => {
    render(<Certifications />);
    expect(screen.getAllByTestId('cert-card')).toHaveLength(1);
  });
});
