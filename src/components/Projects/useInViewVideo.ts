import { useEffect, type RefObject } from 'react';

/** Share of the video that must be on screen before it plays. */
export const IN_VIEW_THRESHOLD = 0.25;

/**
 * Plays the video while at least a quarter of it is in the viewport and pauses it otherwise.
 * With `enabled` false (reduced motion, no video) it never observes, so play() is never called.
 */
export const useInViewVideo = (ref: RefObject<HTMLVideoElement>, enabled: boolean) => {
  useEffect(() => {
    const video = ref.current;

    if (!video || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= IN_VIEW_THRESHOLD) {
          // play() rejects when the browser blocks it or a pause interrupts it; the poster stays.
          video.play()?.catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: IN_VIEW_THRESHOLD },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [ref, enabled]);
};
