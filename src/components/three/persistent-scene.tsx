"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { markSceneReady } from "@/lib/ready-state";
import { sceneState } from "@/lib/scene-state";
import { CameraRig } from "./camera-rig";
import { LightingRig } from "./lighting-rig";
import { OrbitRing } from "./orbit-ring";
import { Statue } from "./statue";

/** Montato dentro il Canvas dopo che la statua è caricata: aspetta qualche
 *  frame perché il frame rate si stabilizzi, poi segnala "scena pronta". */
function ReadySignal() {
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
  }, []);
  return null;
}

export function PersistentScene() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, lastX: 0 });
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

  useEffect(() => {
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    setDpr(coarse ? [1, 1] : [1, 1.5]);
  }, []);

  // Pointer events are enabled only while a section wants interaction
  // (pedestal statue spin, orbit ring drag). Everywhere else the canvas
  // stays transparent to input so page content remains clickable.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const sync = () => {
      const interactive = sceneState.mode === "pedestal" || sceneState.mode === "orbit";
      const want = interactive ? "auto" : "none";
      if (el.style.pointerEvents !== want) {
        el.style.pointerEvents = want;
        el.style.cursor = interactive ? "grab" : "";
      }
    };
    gsap.ticker.add(sync);
    return () => gsap.ticker.remove(sync);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    sceneState.dragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (wrapperRef.current) wrapperRef.current.style.cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    if (sceneState.mode === "pedestal") {
      sceneState.spinVelocity = dx * 0.0035;
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    drag.current.active = false;
    sceneState.dragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (wrapperRef.current) wrapperRef.current.style.cursor = "grab";
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[2]"
      style={{ pointerEvents: "none", touchAction: "pan-y" }}
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <Canvas
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        camera={{ position: [0, 0, 5], fov: 38 }}
        style={{ pointerEvents: "none" }}
      >
        <CameraRig />
        <LightingRig />
        <Suspense fallback={null}>
          <Statue />
          <OrbitRing />
          <ReadySignal />
        </Suspense>
      </Canvas>
    </div>
  );
}
