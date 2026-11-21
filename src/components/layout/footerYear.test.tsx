import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import Footer from './Footer';

describe('footer year', () => {
  afterEach(() => vi.useRealTimers());

  it('prerenders the build year and shows the visit year on the client', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-21T12:00:00Z'));
    const html = renderToString(<Footer />);

    vi.setSystemTime(new Date('2027-01-02T12:00:00Z'));
    render(<Footer />);

    expect(html).toContain(String(__BUILD_YEAR__));
    expect(screen.getByText(/© 2027/)).toBeInTheDocument();
  });
});
