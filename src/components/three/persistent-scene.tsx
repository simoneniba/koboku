"use client";

import { Preload } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { CameraRig } from "./camera-rig";
import { LightingRig } from "./lighting-rig";
import { Statue } from "./statue";
import { markSceneReady } from "@/lib/ready-state";

/** Montato dentro il Canvas dopo che la statua è caricata: aspetta qualche
 *  frame perché il frame rate si stabilizzi, poi segnala "scena pronta". */
function ReadySignal() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    let raf = 0;
    let left = 8;
    const tick = () => {
      left -= 1;
      if (left <= 0) markSceneReady();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gl]);
  return null;
}

export function PersistentScene() {
  return (
    <div className="fixed inset-0 z-[2]" style={{ pointerEvents: "none" }} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        camera={{ position: [0, 0, 5], fov: 38 }}
      >
        <CameraRig />
        <LightingRig />
        <Suspense fallback={null}>
          <Statue />
          <ReadySignal />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}