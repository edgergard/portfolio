import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { usePrefersReducedMotion } from '../components/Hero/sceneSupport';
import { useCurrentTheme } from '../theme';

const ThemeProbe = () => <span data-testid="theme">{useCurrentTheme()}</span>;
const MotionProbe = () => <span>{String(usePrefersReducedMotion())}</span>;

describe('server-safe first render', () => {
  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('renders the dark theme on the server even for a visitor who saved light', () => {
    localStorage.setItem('theme', 'light');
    document.documentElement.dataset.theme = 'light';

    expect(renderToString(<ThemeProbe />)).toContain('dark');
  });

  it('shows the saved light theme on the client', () => {
    localStorage.setItem('theme', 'light');
    document.documentElement.dataset.theme = 'light';
    render(<ThemeProbe />);

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('renders reduced-motion on the server without touching matchMedia', () => {
    const original = window.matchMedia;

    // @ts-expect-error simulate a server without matchMedia
    delete window.matchMedia;

    try {
      expect(renderToString(<MotionProbe />)).toContain('false');
    } finally {
      window.matchMedia = original;
    }
  });
});
