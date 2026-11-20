import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../i18n';
import About from './About';
import Experience from './Experience';
import Certifications from './Certifications';
import { Projects } from './Projects';
import Contact from './Contact';
import { PROJECT_LIST } from '../data/projects';
import { SKILLS } from '../data/content';

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

  it('shows every skill as a pill on a wine-flow panel', () => {
    render(<About />);
    const panel = screen.getByTestId('skills-panel');
    const pills = within(panel).getAllByTestId('skill-pill');

    expect(panel).toHaveClass('bg-wine-flow');
    expect(pills).toHaveLength(SKILLS.flatMap(g => g.items).length);
    expect(within(panel).getByText('React Native')).toBeInTheDocument();
    expect(within(panel).getByText('TanStack Query')).toBeInTheDocument();
  });

  it('runs the skills panel full-bleed with its content on the centred column', () => {
    render(<About />);
    const panel = screen.getByTestId('skills-panel');

    // Not boxed by the section's 1120px column, so it can span the page edge to edge...
    expect(panel.parentElement?.closest('[class*="max-w-[1120px]"]')).toBeNull();
    expect(panel).not.toHaveClass('rounded-[24px]');
    // ...while the labels and pills sit in a column matching the section content.
    const column = within(panel).getByTestId('skills-column');

    expect(column).toHaveClass('mx-auto', 'max-w-[1120px]', 'px-6', 'min-[900px]:px-10');
    expect(within(column).getAllByTestId('skill-pill')).toHaveLength(SKILLS.flatMap(g => g.items).length);
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

  it('titles the HYS role React Native / Frontend Developer', () => {
    render(<Experience />);
    const hys = screen.getAllByTestId('xp-row')[1];

    expect(within(hys).getByRole('heading', { level: 3 })).toHaveTextContent(
      'React Native / Frontend Developer · HYS Enterprise',
    );
  });

  it('renders three detailed education cards', () => {
    render(<Experience />);
    const cards = screen.getAllByTestId('edu-card');

    expect(cards).toHaveLength(3);
    expect(screen.getByRole('heading', { level: 3, name: 'Education' })).toBeInTheDocument();

    const [nuft, kpi, mate] = cards;

    expect(within(nuft).getByRole('heading', { level: 4 })).toHaveTextContent('National University of Food Technologies');
    expect(within(nuft).getByText('B.Sc. in Software Engineering')).toBeInTheDocument();
    expect(within(nuft).getByText('2026 – present')).toBeInTheDocument();
    expect(within(nuft).getByText('University')).toBeInTheDocument();

    expect(within(kpi).getByRole('heading', { level: 4 })).toHaveTextContent('Igor Sikorsky Kyiv Polytechnic Institute');
    expect(within(kpi).getByText('Automation and Computer-Integrated Technologies')).toBeInTheDocument();
    expect(within(kpi).getByText('2019 – 2022')).toBeInTheDocument();
    expect(within(kpi).getByText('University')).toBeInTheDocument();

    expect(within(mate).getByRole('heading', { level: 4 })).toHaveTextContent('Mate Academy');
    expect(within(mate).getByText('Fullstack Development course')).toBeInTheDocument();
    expect(within(mate).getByText('2023')).toBeInTheDocument();
    expect(within(mate).getByText('Course')).toBeInTheDocument();
  });

  it('shows no status badge on the education cards', () => {
    render(<Experience />);
    for (const label of ['In progress', 'Completed', 'Certificate']) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
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
      const demo = within(row).getByRole('link', { name: /Live demo — / });
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
  beforeEach(() => {
    vi.mocked(emailjs.sendForm).mockReset();
    vi.mocked(emailjs.sendForm).mockResolvedValue({ status: 200, text: 'OK' });
  });

  const renderContact = () =>
    render(
      <HashRouter>
        <Contact />
      </HashRouter>,
    );

  it('renders the headline, the lead line and the email link', () => {
    renderContact();
    expect(screen.getByText(/Let.s build something precise\./)).toBeInTheDocument();
    expect(screen.getByText(/The fastest way to reach me is Telegram or email\./)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Contact/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /oleksandrbryksin@gmail\.com/ })).toHaveAttribute(
      'href',
      'mailto:oleksandrbryksin@gmail.com',
    );
  });

  it('groups the rows into Direct and Profiles & documents', () => {
    renderContact();
    const direct = screen.getByRole('list', { name: 'Direct' });
    const profiles = screen.getByRole('list', { name: 'Profiles & documents' });

    expect(within(direct).getAllByRole('listitem')).toHaveLength(3);
    expect(within(direct).getByText('Email')).toBeInTheDocument();
    expect(within(direct).getByText('Telegram')).toBeInTheDocument();
    expect(within(direct).getByText('WhatsApp')).toBeInTheDocument();
    expect(within(profiles).getByText('LinkedIn')).toBeInTheDocument();
    expect(within(profiles).getAllByText('GitHub')).toHaveLength(2);
    expect(within(profiles).getByText('CV')).toBeInTheDocument();
  });

  it('links Telegram, LinkedIn and both GitHub profiles in a new tab', () => {
    renderContact();
    const expected: [RegExp, string][] = [
      [/Telegram @oleksandrbryksin/, 'https://t.me/oleksandrbryksin'],
      [/LinkedIn/, 'https://www.linkedin.com/in/oleksandr-bryksin-898687253/'],
      [/GitHub edgergard/, 'https://github.com/edgergard'],
      [/GitHub edgelordxd/, 'https://github.com/edgelordxd?tab=repositories'],
    ];

    for (const [name, href] of expected) {
      const link = screen.getByRole('link', { name });

      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('shows the WhatsApp handle with a copy action and no link', () => {
    renderContact();
    const direct = screen.getByRole('list', { name: 'Direct' });
    const row = within(direct).getByText('WhatsApp').closest('li')!;

    expect(within(row).getByText('@oleksandrbryksin')).toBeInTheDocument();
    expect(within(row).queryByRole('link')).not.toBeInTheDocument();
    expect(within(row).getByRole('button', { name: /Copy/ })).toBeInTheDocument();
  });

  it('copies the email address and briefly shows Copied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderContact();
    const copy = screen.getByRole('button', { name: 'Copy email address' });

    expect(copy.tagName).toBe('BUTTON');
    expect(copy).toHaveAttribute('type', 'button');
    fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledWith('oleksandrbryksin@gmail.com');
    expect(await screen.findByText('Copied')).toBeInTheDocument();
    expect(screen.getAllByRole('status').map(s => s.textContent)).toContain('Copied to clipboard');
  });

  it('copies the WhatsApp handle', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderContact();
    fireEvent.click(screen.getByRole('button', { name: 'Copy WhatsApp handle' }));
    expect(writeText).toHaveBeenCalledWith('@oleksandrbryksin');
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });

  it('offers both CV downloads and links View CV to the cv page, with no phone', () => {
    renderContact();
    const rn = screen.getByRole('link', { name: /CV · React Native/ });

    expect(rn).toHaveAttribute('href', '/cv/oleksandr-bryksin-react-native-cv.pdf');
    expect(rn).toHaveAttribute('download');
    const fe = screen.getByRole('link', { name: /CV · Frontend/ });

    expect(fe).toHaveAttribute('href', '/cv/oleksandr-bryksin-frontend-cv.pdf');
    expect(fe).toHaveAttribute('download');
    expect(screen.getByRole('link', { name: 'View CV' })).toHaveAttribute('href', '#/cv');
    expect(screen.queryByText(/\+380/)).not.toBeInTheDocument();
  });

  it('titles the form, shows the status line and the Telegram hint', () => {
    renderContact();
    expect(screen.getByRole('heading', { level: 3, name: 'Write a message' })).toBeInTheDocument();
    expect(screen.getByText(/Open to work · replies within 24h/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Or write on Telegram/ })).toHaveAttribute(
      'href',
      'https://t.me/oleksandrbryksin',
    );
  });

  it('shows validation errors and does not send an empty form', async () => {
    renderContact();
    fireEvent.click(screen.getByRole('button', { name: /Send message/ }));
    expect(await screen.findByText('Subject is required.')).toBeInTheDocument();
    expect(screen.getByText('Message is required.')).toBeInTheDocument();
    expect(emailjs.sendForm).not.toHaveBeenCalled();
  });

  it('shows the translated message for an invalid email format', async () => {
    renderContact();
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: /Send message/ }));
    expect(await screen.findByText('Email is invalid')).toBeInTheDocument();
  });

  it('disables the button and sets aria-busy while sending', async () => {
    let resolve!: () => void;

    vi.mocked(emailjs.sendForm).mockReturnValueOnce(new Promise<never>((r) => {
      resolve = () => r(undefined as never);
    }));
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

  it('sends a valid form through EmailJS', async () => {
    renderContact();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Hi' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /Send message/ }));
    await waitFor(() => expect(emailjs.sendForm).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });
});
