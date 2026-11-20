import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import Header from '../Header';
import Section from './Section';
import Footer from './Footer';

afterEach(async () => {
  await i18n.changeLanguage('en');
  localStorage.clear();
});

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

describe('Header', () => {
  it('renders the nav links and CV points at the /cv route', () => {
    renderHeader();
    for (const name of ['Work', 'Experience', 'About', 'Contact', 'CV']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }

    expect(screen.getByRole('link', { name: 'CV' }).getAttribute('href')).toMatch(/\/cv$/);
  });

  it('switches language to UA', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'UA' }));
    expect(i18n.language).toBe('ua');
  });
});

describe('Section', () => {
  it('renders the padded index and translated label', () => {
    render(
      <Section id="experience" index={2} labelKey="section_experience">
        <p>body</p>
      </Section>,
    );
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Experience/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Experience/ })).toBe(document.getElementById('experience'));
    expect(document.getElementById('experience')).toBeInTheDocument();
  });

  it('puts the label above the content instead of in a sticky side column', () => {
    render(
      <Section id="about" index={1} labelKey="section_about">
        <p>body</p>
      </Section>,
    );
    const heading = screen.getByRole('heading', { level: 2 });

    expect(heading.className).not.toMatch(/sticky/);
    expect(heading.parentElement?.className).not.toMatch(/280px/);
    expect(heading.compareDocumentPosition(screen.getByText('body')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('document language', () => {
  it('follows the active locale', async () => {
    await i18n.changeLanguage('ua');
    expect(document.documentElement.lang).toBe('uk');
    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });
});

describe('Footer', () => {
  it('shows the current year', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });

  it('no longer credits React & Three.js', () => {
    render(<Footer />);
    expect(screen.queryByText(/Three.js/)).not.toBeInTheDocument();
  });

  it('contains Back to top', () => {
    render(<Footer />);
    expect(screen.getByText(/Back to top/)).toBeInTheDocument();
  });
});
