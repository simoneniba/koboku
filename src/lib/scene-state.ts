/**
 * Shared mutable scene state — the single source of truth for which page
 * section the camera is serving and for the interactive statue/orbit values.
 *
 * Written by: SceneDirector (section tracking), PersistentScene (drag input),
 * Statue / OrbitRing / CameraRig (per-frame integration).
 * All plain mutables — never React state — so nothing re-renders on scroll.
 */

export type SceneMode = "cinematic" | "pedestal" | "orbit";

/** Page sections in document order. Each has one camera keyframe. */
export const SECTION_IDS = [
  "hero",
  "thesis",
  "verticals",
  "process",
  "work",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Which section is active and how far through it we are (0 → 1). */
export const sectionTrack = {
  index: 0,
  local: 0,
};

export const sceneState = {
  mode: "cinematic" as SceneMode,

  /** 0 → 1 blend into pedestal presentation (small centred statue). */
  pedestalBlend: 0,
  /** 0 → 1 blend into orbit presentation (ring visible). */
  orbitBlend: 0,

  /** Pedestal: accumulated self-rotation (radians) + drag velocity. */
  spinY: 0,
  spinVelocity: 0,

  /** Which of the three orbits is active (0 → 2, continuous 0 → 3) —
   *  scrubbed by the Selected Work section pin. */
  orbitPhase: 0,
  /** Orbit ring rotation: accumulated pointer drag (radians) + inertia. */
  orbitDrag: 0,
  orbitDragVelocity: 0,
  /** Reels ring: posters only until the user first drags horizontally. */
  orbitReelsEngaged: false,

  /** True while the user is actively dragging on the canvas. */
  dragging: false,

  /** Pointer in NDC (-1..1), written by the Work overlay, read by
   *  OrbitRing for manual raycast hover — no canvas events needed. */
  pointer: { x: 0, y: 0, active: false },
};

export function modeForSection(index: number): SceneMode {
  const id = SECTION_IDS[index];
  if (id === "process") return "pedestal";
  if (id === "work") return "orbit";
  return "cinematic";
}
