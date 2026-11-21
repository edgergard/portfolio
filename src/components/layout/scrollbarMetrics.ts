export type ScrollDims = { scrollTop: number; scrollHeight: number; clientHeight: number };

export type ThumbMetrics = {
  /** Thumb height in px. */
  size: number;
  /** Thumb top inside the rail in px. */
  offset: number;
  /** False when the page doesn't scroll (or the rail has no height): hide the rail. */
  scrollable: boolean;
};

export const MIN_THUMB = 40;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Thumb size and position for a page scrolled to `scrollTop`, in a rail `rail` px tall. */
export const thumbMetrics = (
  { scrollTop, scrollHeight, clientHeight }: ScrollDims,
  rail: number,
  min = MIN_THUMB,
): ThumbMetrics => {
  const max = scrollHeight - clientHeight;

  if (max <= 0 || rail <= 0) {
    return { size: 0, offset: 0, scrollable: false };
  }

  const size = Math.min(rail, Math.max(min, (rail * clientHeight) / scrollHeight));

  return { size, offset: (rail - size) * clamp(scrollTop / max, 0, 1), scrollable: true };
};

/** Page scrollTop after dragging the thumb `dy` px from where the page was at `startTop`. */
export const dragScrollTop = (
  dims: ScrollDims,
  rail: number,
  startTop: number,
  dy: number,
  min = MIN_THUMB,
) => {
  const max = dims.scrollHeight - dims.clientHeight;
  const travel = rail - thumbMetrics(dims, rail, min).size;

  if (max <= 0 || travel <= 0) {
    return clamp(startTop, 0, Math.max(0, max));
  }

  return clamp(startTop + (dy * max) / travel, 0, max);
};
