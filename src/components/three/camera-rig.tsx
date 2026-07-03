"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { modeForSection, SECTION_IDS, sceneState, sectionTrack } from "@/lib/scene-state";

// Shared between CameraRig and Statue — written by CameraRig, read by Statue.
export const statueRotationState = { y: 0 };

/**
 * Section-driven cinematic camera. One keyframe per page section, in the
 * same order as SECTION_IDS. The active section and its local progress come
 * from SceneDirector (real ScrollTrigger measurements), so keyframes stay
 * glued to their sections no matter how long any pin is.
 *
 * Within a section: the first TRANSITION_RATIO blends from the previous
 * keyframe to this one, the rest holds.
 */

type Keyframe = {
  position: [number, number, number];
  lookAt: [number, number, number];
  statueRotationY: number;
};

// Index-aligned with SECTION_IDS: hero, thesis, verticals, process, work, contact.
const KEYFRAMES: Keyframe[] = [
  // hero — wide, full statue
  { position: [0, 0.2, 4.2], lookAt: [0, 0, 0], statueRotationY: 0 },
  // thesis — statue right, wing framing
  { position: [-1.2, 1.0, 2.2], lookAt: [-0.8, 0.8, 0], statueRotationY: -Math.PI * 0.14 },
  // verticals — hold the same framing while the cube rolls
  { position: [-1.2, 1.0, 2.2], lookAt: [-0.8, 0.8, 0], statueRotationY: -Math.PI * 0.14 },
  // process — pedestal: pulled back, statue centred (scale drop happens in Statue)
  { position: [0, 0.45, 13], lookAt: [0, 0.45, 0], statueRotationY: 0 },
  // work — the orbit constellation: wide enough to see the full ring
  { position: [0, 0.6, 7.2], lookAt: [0, 0.35, 0], statueRotationY: 0 },
  // contact — gentle retreat after work, statue readable behind the CTA
  { position: [0.1, 0.8, 7.0], lookAt: [0, 0, 0], statueRotationY: 0 },
];

const TRANSITION_RATIO = 0.25;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function CameraRig() {
  const { camera } = useThree();

  useFrame(() => {
    const index = Math.min(sectionTrack.index, KEYFRAMES.length - 1);
    const local = sectionTrack.local;

    // Keep the scene mode in sync with the active section.
    sceneState.mode = modeForSection(index);

    const kfTo = KEYFRAMES[index];
    const kfFrom = KEYFRAMES[Math.max(0, index - 1)];
    const t = local >= TRANSITION_RATIO ? 1 : smoothstep(local / TRANSITION_RATIO);

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

// Keep the id list exported for anyone tuning keyframes against sections.
export { SECTION_IDS };
