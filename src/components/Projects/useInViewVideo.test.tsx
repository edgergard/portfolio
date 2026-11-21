import { render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { useInViewVideo } from './useInViewVideo';

const Player = () => {
  const ref = useRef<HTMLVideoElement>(null);

  useInViewVideo(ref, true);

  return <video ref={ref} data-testid="v" />;
};

describe('useInViewVideo', () => {
  it('mutes the video itself (a hydrated <video muted> keeps only the attribute), so autoplay is allowed', () => {
    const { getByTestId } = render(<Player />);

    expect((getByTestId('v') as HTMLVideoElement).muted).toBe(true);
  });
});
