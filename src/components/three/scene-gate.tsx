"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MobileFallback } from "./mobile-fallback";

const PersistentScene = dynamic(
  () => import("./persistent-scene").then((m) => m.PersistentScene),
  { ssr: false, loading: () => <MobileFallback /> },
);

/**
 * Renders the live 3D scene unless the device is clearly underpowered
 * (touch + small screen + low cores).
 *
 * `prefers-reduced-motion` is intentionally NOT a kill-switch — the statue
 * is the brand asset, not the motion. Reduced motion is respected by
 * dampening the scroll-driven camera and lighting transitions, not by
 * removing the canvas.
 */
export function SceneGate() {
  const [decision, setDecision] = useState<"loading" | "scene" | "fallback">("loading");

  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    const isTouchOnly = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const isSmallScreen = window.innerWidth < 768;

    if (isTouchOnly && isSmallScreen && cores < 4) {
      setDecision("fallback");
    } else {
      setDecision("scene");
    }
  }, []);

  if (decision === "loading" || decision === "fallback") return <MobileFallback />;
  return <PersistentScene />;
}
