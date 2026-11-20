import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Button, { buttonClass } from './Button';

describe('Button', () => {
  it('renders a native button with the wine-flow fill by default', () => {
    render(<Button type="submit">Send</Button>);
    const button = screen.getByRole('button', { name: 'Send' });

    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('bg-wine-flow');
    expect(button.className).not.toMatch(/translate/);
  });

  it('has a compact small size', () => {
    render(<Button size="sm">Send</Button>);
    expect(screen.getByRole('button', { name: 'Send' })).toHaveClass('text-[15px]');
  });

  it('renders an anchor when given href', () => {
    render(<Button href="/cv.pdf" download>Download</Button>);
    const link = screen.getByRole('link', { name: 'Download' });

    expect(link).toHaveAttribute('href', '/cv.pdf');
    expect(link).toHaveAttribute('download');
    expect(link).toHaveClass('bg-wine-flow');
  });

  it('renders a router link when given to', () => {
    render(
      <HashRouter>
        <Button to="/cv" variant="outline">View CV</Button>
      </HashRouter>,
    );
    const link = screen.getByRole('link', { name: 'View CV' });

    expect(link).toHaveAttribute('href', '#/cv');
    expect(link).not.toHaveClass('bg-wine-flow');
    expect(link.className).toMatch(/border/);
  });

  it('renders a hash link for in-page targets', () => {
    render(
      <HashRouter>
        <Button to="/#experience">Experience</Button>
      </HashRouter>,
    );
    expect(screen.getByRole('link', { name: 'Experience' }).getAttribute('href')).toMatch(/#experience$/);
  });

  it('uses a readable label size and a visible focus ring', () => {
    expect(buttonClass()).toMatch(/text-\[16px\]/);
    expect(buttonClass({ size: 'lg' })).toMatch(/text-\[17px\]/);
    expect(buttonClass()).toMatch(/focus-visible:/);
  });
});
