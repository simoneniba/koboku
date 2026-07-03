"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { sectionTrack } from "@/lib/scene-state";

/** Keeps demand frameloop alive during Process and Work sections. */
export function FrameInvalidator() {
  const invalidate = useThree((s) => s.invalidate);

  useFrame(() => {
    const idx = sectionTrack.index;
    if (idx === 3 || idx === 4) invalidate();
  });

  return null;
}
