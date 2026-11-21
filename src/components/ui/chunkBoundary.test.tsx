import { render, screen } from '@testing-library/react';
import { lazy, Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import ChunkBoundary from './ChunkBoundary';

describe('ChunkBoundary', () => {
  it('shows its fallback instead of blanking the page when a lazy chunk fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = lazy(() => Promise.reject(new Error('Failed to fetch dynamically imported module')));

    render(
      <div>
        <p>page stays</p>
        <ChunkBoundary fallback={<p>reload please</p>}>
          <Suspense fallback={null}><Broken /></Suspense>
        </ChunkBoundary>
      </div>,
    );

    expect(await screen.findByText('reload please')).toBeInTheDocument();
    expect(screen.getByText('page stays')).toBeInTheDocument();
  });
});
