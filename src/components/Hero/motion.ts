/** Pointer over the hero in panel NDC (−1…1, y up); `hovering` is false once it leaves the hero. */
export type ScenePointer = { x: number; y: number; hovering: boolean };

/** Longest step the animation takes in one frame, so a stalled tab doesn't make it jump. */
export const MAX_DT = 0.05;

/** Frame-rate-independent exponential approach of `current` towards `target`. */
export const damp = (current: number, target: number, rate: number, dt: number): number =>
  current + (target - current) * (1 - Math.exp(-rate * dt));

/** Shrinks the knot on panels narrower than ~0.95:1 so it never touches the edges. */
export const stageScale = (aspect: number): number => 0.85 * Math.min(1, aspect / 0.95);

const clamp = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value));

/** Knot rotation that leans towards the pointer (pointer in NDC, −1…1 across the panel). */
export const tiltTarget = (px: number, py: number): { x: number; y: number } => ({
  x: -clamp(py, 1.5) * 0.45,
  y: clamp(px, 1.5) * 0.6,
});

/** Share of normal speed the hero keeps under prefers-reduced-motion: calm, but alive. */
export const REDUCED_SPEED = 0.35;

/** Animation speed multiplier for the hero scene. */
export const motionSpeed = (reducedMotion: boolean): number => (reducedMotion ? REDUCED_SPEED : 1);
