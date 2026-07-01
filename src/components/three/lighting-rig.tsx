"use client";

import { useRef } from "react";
import type { DirectionalLight } from "three";

/**
 * Static lighting for marble against marine water.
 * Key: bright, slightly cool, above-front — like overhead Mediterranean sun.
 * Fill: cool, low intensity, opposite side — water-bounced light.
 * Rim: warm, behind, low — subtle warmth to separate the marble from the blue.
 */
export function LightingRig() {
  const keyRef = useRef<DirectionalLight>(null);
  const fillRef = useRef<DirectionalLight>(null);
  const rimRef = useRef<DirectionalLight>(null);

  return (
    <>
      <directionalLight
        ref={keyRef}
        position={[2, 4, 3]}
        intensity={2.4}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        ref={fillRef}
        position={[-3, 1, -2]}
        intensity={0.9}
        color="#B8D0E8"
      />
      <directionalLight
        ref={rimRef}
        position={[1, -2, -4]}
        intensity={0.6}
        color="#D9B58A"
      />
      <ambientLight intensity={0.45} color="#E8EEF2" />
    </>
  );
}
