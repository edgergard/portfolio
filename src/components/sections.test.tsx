import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { describe, expect, it, vi } from 'vitest';
import '../i18n';
import About from './About';
import Experience from './Experience';
import Certifications from './Certifications';
import { Projects } from './Projects';
import Contact from './Contact';
import { PROJECT_LIST } from '../data/projects';

vi.mock('@emailjs/browser', () => ({
  default: { sendForm: vi.fn().mockResolvedValue({ status: 200 }) },
}));

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

describe('Projects', () => {
  it('renders 6 rows', () => {
    render(<Projects />);
    expect(screen.getAllByTestId('project-row')).toHaveLength(6);
  });

  it('gives each row Live demo and Code links from the data', () => {
    render(<Projects />);
    const rows = screen.getAllByTestId('project-row');
    rows.forEach((row, i) => {
      const demo = within(row).getByRole('link', { name: /Live demo/ });
      const code = within(row).getByRole('link', { name: /Code/ });
      expect(demo).toHaveAttribute('href', PROJECT_LIST[i].demolink);
      expect(code).toHaveAttribute('href', PROJECT_LIST[i].codelink);
      expect(demo).toBeVisible();
      expect(code).toBeVisible();
    });
  });

  it('does not link to the archive', () => {
    render(<Projects />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs.some((h) => h?.includes('/archive'))).toBe(false);
  });

  it('reverses every even row', () => {
    render(<Projects />);
    const rows = screen.getAllByTestId('project-row');
    expect(rows[0]).toHaveAttribute('data-reverse', 'false');
    expect(rows[1]).toHaveAttribute('data-reverse', 'true');
  });
});

describe('Contact', () => {
  const renderContact = () =>
    render(
      <HashRouter>
        <Contact />
      </HashRouter>,
    );

  it('renders the headline and the email link', () => {
    renderContact();
    expect(screen.getByRole('heading', { name: /Let.s build something precise\./ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'oleksandrbryksin@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:oleksandrbryksin@gmail.com',
    );
  });

  it('lists socials and both CV downloads', () => {
    renderContact();
    for (const name of [/LinkedIn/, /GitHub/, /Telegram/]) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
    const rn = screen.getByRole('link', { name: /CV · React Native/ });
    expect(rn).toHaveAttribute('href', '/cv/oleksandr-bryksin-react-native-cv.pdf');
    expect(rn).toHaveAttribute('download');
    const fe = screen.getByRole('link', { name: /CV · Frontend/ });
    expect(fe).toHaveAttribute('href', '/cv/oleksandr-bryksin-frontend-cv.pdf');
    expect(fe).toHaveAttribute('download');
  });

  it('links View CV to the cv page and has no phone', () => {
    renderContact();
    expect(screen.getByRole('link', { name: 'View CV' })).toHaveAttribute('href', '#/cv');
    expect(screen.queryByText(/\+380/)).not.toBeInTheDocument();
  });

  it('shows validation errors and does not send an empty form', async () => {
    renderContact();
    fireEvent.click(screen.getByRole('button', { name: /Send message/ }));
    expect(await screen.findByText('Subject is required.')).toBeInTheDocument();
    expect(screen.getByText('Message is required.')).toBeInTheDocument();
    expect(emailjs.sendForm).not.toHaveBeenCalled();
  });

  it('disables the button and sets aria-busy while sending', async () => {
    let resolve!: () => void;
    vi.mocked(emailjs.sendForm).mockReturnValueOnce(new Promise<never>((r) => { resolve = () => r(undefined as never); }));
    renderContact();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Hi' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /Send message/ }));
    const busy = await screen.findByRole('button', { name: 'Sending…' });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
    resolve();
    await waitFor(() => expect(screen.getByRole('button', { name: /Send message/ })).toBeEnabled());
  });
});
