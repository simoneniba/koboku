/**
 * Mutable scroll store — written by Lenis every scrolled frame, read
 * imperatively (useFrame, gsap.ticker, direct DOM writes).
 *
 * Deliberately NOT React state: routing per-frame scroll values through
 * setState re-rendered the entire tree under SmoothScroll on every frame.
 * Consumers subscribe to the ticker instead and write to the DOM directly.
 */
export const scrollStore = {
  /** Normalised page progress 0 → 1 */
  progress: 0,
  /** Absolute scroll position in px */
  scrollY: 0,
};
