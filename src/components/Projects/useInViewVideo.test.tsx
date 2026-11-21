import { cleanup, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useInViewVideo } from './useInViewVideo';

const Player = () => {
  const ref = useRef<HTMLVideoElement>(null);

  useInViewVideo(ref, true);

  return <video ref={ref} data-testid="v" />;
};

// jsdom has no media playback; unmount (the hook pauses the video) while pause is stubbed.
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useInViewVideo', () => {
  it('mutes the video itself (a hydrated <video muted> keeps only the attribute), so autoplay is allowed', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const { getByTestId } = render(<Player />);

    expect((getByTestId('v') as HTMLVideoElement).muted).toBe(true);
  });
});
