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
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(document.getElementById('experience')).toBeInTheDocument();
  });
});

describe('Footer', () => {
  it('contains Back to top', () => {
    render(<Footer />);
    expect(screen.getByText(/Back to top/)).toBeInTheDocument();
  });
});
