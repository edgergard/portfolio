import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import WineBadge from './WineBadge';

const loop = vi.hoisted(() => ({ unregister: vi.fn(), register: vi.fn() }));

vi.mock('./wineButtons/loop', () => ({ wineButtons: { register: loop.register } }));
loop.register.mockImplementation(() => loop.unregister);

describe('WineBadge', () => {
  it('renders its text on the server, with the empty shader canvas beside it', () => {
    const html = renderToString(<WineBadge as="li">React Native</WineBadge>);

    expect(html).toMatch(/^<li class="wine-badge bg-wine-flow[^"]*">/);
    expect(html).toContain('React Native');
    expect(html).toMatch(/<canvas aria-hidden="true"/);
    expect(loop.register).not.toHaveBeenCalled();
  });

  it('registers its canvas with the shared renderer on the client', () => {
    render(<WineBadge data-testid="badge">TypeScript</WineBadge>);
    const badge = screen.getByTestId('badge');

    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveTextContent(/^TypeScript$/);
    expect(loop.register).toHaveBeenCalledWith(badge.querySelector('canvas'));
  });
});
