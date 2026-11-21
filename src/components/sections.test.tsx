import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import emailjs from '@emailjs/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { intersectEverything } from '../test/intersect';
import About from './About';
import Experience from './Experience';
import Certifications from './Certifications';
import Contact from './Contact';
import { SKILLS } from '../data/content';
import type { Lang } from '../lib/locale';
import { renderWithI18n } from '../test/renderWithI18n';

vi.mock('@emailjs/browser', () => ({
  default: { sendForm: vi.fn().mockResolvedValue({ status: 200 }) },
}));

// jsdom never reports intersections, so render the reveal wrapper as a plain div.
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...rest }: Record<string, unknown>) => (
      <div className={className as string} data-testid={rest['data-testid'] as string}>
        {children as React.ReactNode}
      </div>
    ),
  },
}));

describe('About', () => {
  const render = renderWithI18n;

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

  it('layers the hero Wine shader over the CSS fill, under the pills', () => {
    render(<About />);
    const panel = screen.getByTestId('skills-panel');
    const layer = within(panel).getByTestId('wine-surface');

    expect(panel).toHaveClass('bg-wine-flow');
    expect(layer).toHaveClass('absolute', 'inset-0');
    // The column comes after the layer and is positioned, so it paints on top.
    expect(layer.compareDocumentPosition(within(panel).getByTestId('skills-column')))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(within(panel).getByTestId('skills-column')).toHaveClass('relative');
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
  const render = renderWithI18n;

  it('renders three detailed education cards', () => {
    render(<Experience />);
    const cards = screen.getAllByTestId('edu-card');

    expect(cards).toHaveLength(3);
    cards.forEach(card => expect(card).toHaveClass('wine-edge'));
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
  const render = renderWithI18n;

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
    const fills = screen.getAllByTestId('cert-bar-fill');

    expect(fills[0].style.width).toBe('72%');
    expect(fills[1].style.width).toBe('76%');
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
    expect(screen.getByTestId('cert-card')).toHaveClass('wine-edge');
  });
});

describe('home sections in Ukrainian (I18nProvider, no i18next)', () => {
  it('renders About from the uk dictionary', () => {
    renderWithI18n(<About />, 'uk');
    expect(screen.getByRole('heading', { level: 2, name: /Про мене/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Ключовий стек' })).toBeInTheDocument();
    expect(screen.getByText(/React Native та frontend-розробник/)).toBeInTheDocument();
    expect(screen.getByText('Просунутий')).toBeInTheDocument();
    expect(screen.getByText('Web')).toBeInTheDocument();
  });

  it('renders the education cards from the uk dictionary', () => {
    renderWithI18n(<Experience />, 'uk');
    expect(screen.getByRole('heading', { level: 3, name: 'Освіта' })).toBeInTheDocument();
    expect(within(screen.getAllByTestId('edu-card')[2]).getByText('Курс')).toBeInTheDocument();
    expect(screen.getAllByText('Програма')).toHaveLength(3);
  });

  it('renders Certifications from the uk dictionary', () => {
    renderWithI18n(<Certifications />, 'uk');
    expect(screen.getByText('Результат')).toBeInTheDocument();
    expect(screen.getByText('Видано 18 лист. 2026')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Переглянути сертифікат/ })).toBeInTheDocument();
  });
});

describe('Contact', () => {
  beforeEach(() => {
    vi.mocked(emailjs.sendForm).mockReset();
    vi.mocked(emailjs.sendForm).mockResolvedValue({ status: 200, text: 'OK' });
  });

  // The form loads on demand; wait for it so every test sees the whole section.
  const renderContact = async (lang: Lang = 'en') => {
    intersectEverything();
    renderWithI18n(<Contact />, lang);
    await screen.findByRole('button', { name: lang === 'uk' ? /Відправити повідомлення/ : /Send message/ }, { timeout: 8000 });
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('renders the headline, the lead line and the email link', async () => {
    await renderContact();
    expect(screen.getByText(/Let.s build something precise\./)).toBeInTheDocument();
    expect(screen.getByText(/The fastest way to reach me is Telegram or email\./)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Contact/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /oleksandrbryksin@gmail\.com/ })).toHaveAttribute(
      'href',
      'mailto:oleksandrbryksin@gmail.com',
    );
  });

  it('groups the rows into Direct and Profiles & documents', async () => {
    await renderContact();
    const direct = screen.getByRole('list', { name: 'Direct' });
    const profiles = screen.getByRole('list', { name: 'Profiles & documents' });

    expect(within(direct).getAllByRole('listitem')).toHaveLength(4);
    expect(within(direct).getByText('Email')).toBeInTheDocument();
    expect(within(direct).getByText('Phone')).toBeInTheDocument();
    expect(within(direct).getByText('Telegram')).toBeInTheDocument();
    expect(within(direct).getByText('WhatsApp')).toBeInTheDocument();
    expect(within(profiles).getByText('LinkedIn')).toBeInTheDocument();
    expect(within(profiles).getAllByText('GitHub')).toHaveLength(2);
    expect(within(profiles).getByText('CV')).toBeInTheDocument();
  });

  it('links Telegram, WhatsApp, LinkedIn and both GitHub profiles in a new tab', async () => {
    await renderContact();
    const expected: [RegExp, string][] = [
      [/Telegram @oleksandrbryksin/, 'https://t.me/oleksandrbryksin'],
      [/WhatsApp @oleksandrbryksin/, 'https://wa.me/380635383049'],
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

  it('shows the phone number as a tel: link with a copy action', async () => {
    await renderContact();
    const direct = screen.getByRole('list', { name: 'Direct' });
    const row = within(direct).getByText('Phone').closest('li')!;
    const link = within(row).getByRole('link', { name: /Phone \+380 63 538 3049/ });

    expect(link).toHaveAttribute('href', 'tel:+380635383049');
    expect(link).not.toHaveAttribute('target');
    expect(within(row).getByRole('button', { name: 'Copy phone number' })).toBeInTheDocument();
  });

  it('opens the WhatsApp chat on wa.me in a new tab, with no copy action', async () => {
    await renderContact();
    const direct = screen.getByRole('list', { name: 'Direct' });
    const row = within(direct).getByText('WhatsApp').closest('li')!;

    expect(within(row).getByRole('link')).toHaveAttribute('href', 'https://wa.me/380635383049');
    expect(within(row).queryByRole('button')).not.toBeInTheDocument();
  });

  it('copies the email address and briefly shows Copied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await renderContact();
    const copy = screen.getByRole('button', { name: 'Copy email address' });

    expect(copy.tagName).toBe('BUTTON');
    expect(copy).toHaveAttribute('type', 'button');
    fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledWith('oleksandrbryksin@gmail.com');
    expect(await screen.findByText('Copied')).toBeInTheDocument();
    expect(screen.getAllByRole('status').map(s => s.textContent)).toContain('Copied to clipboard');
  });

  it('copies the phone number', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await renderContact();
    fireEvent.click(screen.getByRole('button', { name: 'Copy phone number' }));
    expect(writeText).toHaveBeenCalledWith('+380635383049');
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });

  it('offers both CV downloads and links View CV to the cv page', async () => {
    await renderContact();
    const rn = screen.getByRole('link', { name: /CV · React Native/ });

    expect(rn).toHaveAttribute('href', '/cv/oleksandr-bryksin-react-native-cv.pdf');
    expect(rn).toHaveAttribute('download');
    const fe = screen.getByRole('link', { name: /CV · Frontend/ });

    expect(fe).toHaveAttribute('href', '/cv/oleksandr-bryksin-frontend-cv.pdf');
    expect(fe).toHaveAttribute('download');
    expect(screen.getByRole('link', { name: 'View CV' })).toHaveAttribute('href', '/cv/react-native');
  });

  it('links View CV to the Ukrainian cv page under /uk', async () => {
    await renderContact('uk');
    expect(screen.getByRole('link', { name: 'Переглянути CV' })).toHaveAttribute('href', '/uk/cv/react-native');
    expect(screen.getByRole('link', { name: /CV · React Native/ })).toHaveAttribute(
      'href',
      '/cv/oleksandr-bryksin-react-native-cv.pdf',
    );
  });

  it('shows the form placeholder until the section nears the viewport', () => {
    renderWithI18n(<Contact />);
    expect(screen.queryByRole('button', { name: /Send message/ })).not.toBeInTheDocument();
    expect(document.querySelector('[aria-hidden].min-h-\\[478px\\]')).not.toBeNull();
  });

  it('titles the form, shows the status line and the Telegram hint', async () => {
    await renderContact();
    expect(screen.getByRole('heading', { level: 3, name: 'Write a message' })).toBeInTheDocument();
    expect(screen.getByText(/Open to work · replies within 24h/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Or write on Telegram/ })).toHaveAttribute(
      'href',
      'https://t.me/oleksandrbryksin',
    );
  });

  it('shows validation errors and does not send an empty form', async () => {
    await renderContact();
    fireEvent.click(screen.getByRole('button', { name: /Send message/ }));
    expect(await screen.findByText('Subject is required.')).toBeInTheDocument();
    expect(screen.getByText('Message is required.')).toBeInTheDocument();
    expect(emailjs.sendForm).not.toHaveBeenCalled();
  });

  it('shows the translated message for an invalid email format', async () => {
    await renderContact();
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: /Send message/ }));
    expect(await screen.findByText('Email is invalid')).toBeInTheDocument();
  });

  it('disables the button and sets aria-busy while sending', async () => {
    let resolve!: () => void;

    vi.mocked(emailjs.sendForm).mockReturnValueOnce(new Promise<never>((r) => {
      resolve = () => r(undefined as never);
    }));
    await renderContact();
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
    await renderContact();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Hi' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /Send message/ }));
    await waitFor(() => expect(emailjs.sendForm).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });

  it('sends with the NEXT_PUBLIC_EMAILJS_* service, template and key', async () => {
    vi.stubEnv('NEXT_PUBLIC_EMAILJS_SERVICE_ID', 'service_test');
    vi.stubEnv('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID', 'template_test');
    vi.stubEnv('NEXT_PUBLIC_EMAILJS_KEY', 'key_test');
    await renderContact();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Hi' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /Send message/ }));
    await waitFor(() => expect(emailjs.sendForm).toHaveBeenCalledTimes(1));
    expect(emailjs.sendForm).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      expect.any(HTMLFormElement),
      process.env.NEXT_PUBLIC_EMAILJS_KEY,
    );
    expect(emailjs.sendForm).toHaveBeenCalledWith('service_test', 'template_test', expect.any(HTMLFormElement), 'key_test');
  });
});
