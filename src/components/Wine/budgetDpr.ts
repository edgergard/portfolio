/**
 * Device-pixel ratio for a wine canvas of the given CSS size, so it never renders more than
 * `maxPixels` device pixels. The shader is a soft, UV-based glow, so a lower ratio on a tall
 * section looks the same, while a full-ratio 1700×2200 canvas redrawn every frame is what
 * stalls scrolling on integrated GPUs.
 */
export const WINE_MAX_PIXELS = 900_000;
export const WINE_MIN_DPR = 0.35;

export const budgetDpr = (
  width: number,
  height: number,
  deviceRatio: number,
  maxPixels = WINE_MAX_PIXELS,
) => {
  const cap = Math.min(Math.max(deviceRatio, 1), 2);
  const area = width * height;

  if (!(area > 0)) {
    return cap;
  }

  return Math.max(WINE_MIN_DPR, Math.min(cap, Math.sqrt(maxPixels / area)));
};
