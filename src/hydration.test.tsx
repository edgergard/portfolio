import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from './entry-server';
import { Root } from './Root';

/** Hydrates the prerendered home page with the browser app (dev React reports every mismatch). */
const hydrateHome = async () => {
  const container = document.createElement('div');

  container.innerHTML = render();
  document.body.appendChild(container);
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});

  await act(async () => {
    hydrateRoot(container, <Root />);
  });

  return { container, errors: errors.mock.calls.map(c => c.map(String).join(" ").slice(0, 400)) };
};

describe('hydrating the prerendered home page', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.dataset.theme = 'dark';
    document.body.innerHTML = '';
  });

  it('matches the browser render for a dark visitor', async () => {
    document.documentElement.dataset.theme = 'dark';
    const { errors } = await hydrateHome();

    expect(errors.filter(e => /did not match|hydrat|server/i.test(e))).toEqual([]);
  });

  it('matches for a light visitor too, then shows the light theme', async () => {
    localStorage.setItem('theme', 'light');
    document.documentElement.dataset.theme = 'light';
    const { container, errors } = await hydrateHome();

    expect(errors.filter(e => /did not match|hydrat|server/i.test(e))).toEqual([]);
    expect(container.querySelector('[data-testid="theme-toggle"]')).toHaveAccessibleName('Switch to dark theme');
  });
});
