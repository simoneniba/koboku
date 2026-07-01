"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useScrollProgress } from "@/lib/scroll-context";

// Shared between CameraRig and Statue — written by CameraRig, read by Statue.
export const statueRotationState = { y: 0 };

/**
 * Six-keyframe cinematic camera choreography.
 *
 * Keyframes (one per page section):
 *   0 — Hero:      wide, full statue, current composition
 *   1 — Thesis:    aggressive zoom on left wing
 *   2 — Verticals: aggressive zoom on face / head
 *   3 — Process:   aggressive zoom on crossed hands / chest
 *   4 — Work:      aggressive zoom on right wing (mirror of keyframe 1)
 *   5 — Contact:   aggressive zoom on feet
 *
 * Snap-and-hold timing: each keyframe holds for ~80% of its scroll segment,
 * with the remaining 20% used for the transition to the next keyframe.
 *
 * IMPORTANT: position and lookAt values are initial guesses. Tune iteratively
 * by adjusting the numeric values below. Each keyframe is independent.
 */

type Keyframe = {
  position: [number, number, number];
  lookAt: [number, number, number];
  statueRotationY: number; // additional Y rotation offset for the statue at this keyframe
};

const KEYFRAMES: Keyframe[] = [
  // 0 — Hero: locked, base rotation
  { position: [0, 0.2, 4.2], lookAt: [0, 0, 0], statueRotationY: 0 },
  // 1 — Thesis: stessa inquadratura del kf2, statua a destra, traslata oltre.
  { position: [-1.2, 1.0, 2.2], lookAt: [-0.8, 0.8, 0], statueRotationY: -Math.PI * 0.14 },
  // 2 — Verticals: stessa inquadratura, statua a destra
  { position: [-1.2, 1.0, 2.2], lookAt: [-0.8, 0.8, 0], statueRotationY: -Math.PI * 0.14 },
  // 3 — Process: hands frontal, statue rotates further to face camera
  { position: [0, -0.1, 2.0], lookAt: [0, -0.1, 0], statueRotationY: -Math.PI * 0.25 },
  // 4 — Work: face frontal, statue rotates slightly more for face presentation
  { position: [0, 0.7, 1.9], lookAt: [0, 0.7, 0], statueRotationY: -Math.PI * 0.32 },
  // 5 — Contact: zoom out, statue returns toward base rotation
  { position: [0.1, 0.8, 7.0], lookAt: [0, 0, 0], statueRotationY: 0 },
];

const SECTION_COUNT = 6;
const HOLD_RATIO = 0.4; // transizione più ampia e anticipata

// Smoothstep easing for the transition portion of each segment
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function getKeyframeBlend(progress: number): {
  from: number;
  to: number;
  t: number;
} {
  // Total scroll is divided into SECTION_COUNT segments.
  const segmentSize = 1 / SECTION_COUNT;
  const segmentIndex = Math.min(
    SECTION_COUNT - 1,
    Math.floor(progress / segmentSize),
  );
  const localProgress = (progress - segmentIndex * segmentSize) / segmentSize;

  // Within each segment, hold for HOLD_RATIO, then transition.
  if (localProgress < HOLD_RATIO) {
    // Holding at current keyframe.
    return { from: segmentIndex, to: segmentIndex, t: 0 };
  }

  // Transitioning to next keyframe.
  const transitionProgress = (localProgress - HOLD_RATIO) / (1 - HOLD_RATIO);
  const nextIndex = Math.min(segmentIndex + 1, KEYFRAMES.length - 1);
  return {
    from: segmentIndex,
    to: nextIndex,
    t: smoothstep(transitionProgress),
  };
}

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export function CameraRig() {
  const { camera } = useThree();
  const progress = useScrollProgress();

  useFrame(() => {
    const { from, to, t } = getKeyframeBlend(progress);
    const kfFrom = KEYFRAMES[from];
    const kfTo = KEYFRAMES[to];

    const targetPos = lerp3(kfFrom.position, kfTo.position, t);
    const targetLook = lerp3(kfFrom.lookAt, kfTo.lookAt, t);

    camera.position.x += (targetPos[0] - camera.position.x) * 0.08;
    camera.position.y += (targetPos[1] - camera.position.y) * 0.08;
    camera.position.z += (targetPos[2] - camera.position.z) * 0.08;

    camera.lookAt(targetLook[0], targetLook[1], targetLook[2]);

    const targetStatueY =
      kfFrom.statueRotationY + (kfTo.statueRotationY - kfFrom.statueRotationY) * t;
    statueRotationState.y += (targetStatueY - statueRotationState.y) * 0.05;
  });

  return null;
}
