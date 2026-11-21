import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '../i18n';
import { Root } from '../Root';

describe('Root', () => {
  it('renders the name in the h1', () => {
    render(<Root />);
    const h1 = screen.getByRole('heading', { level: 1 });

    expect(h1.textContent?.replace(/\s+/g, ' ').trim()).toBe('Oleksandr Bryksin');
  });

  it('shows the custom page scrollbar on fine pointers', () => {
    const real = window.matchMedia;

    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ ...real(query), matches: query.includes('pointer: fine') }));
    const { container } = render(<Root />);

    expect(container.querySelector('[data-scrollbar-rail]')).not.toBeNull();
    vi.restoreAllMocks();
  });
});
