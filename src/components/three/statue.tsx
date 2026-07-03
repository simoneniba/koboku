"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Box3, type Group, Vector3 } from "three";
import { useSceneReady } from "@/lib/ready-state";
import { sceneState } from "@/lib/scene-state";
import { scrollStore } from "@/lib/scroll-store";
import { statueRotationState } from "./camera-rig";

const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";

useGLTF.preload("/models/statue.glb", DRACO_PATH);

const ENTRANCE_DELAY = 0.15;
const ENTRANCE_DURATION = 0.7;
const RESTING_SCALE = 1.2;
const START_SCALE = 0.35;

// Pedestal presentation (Process section): statue drops to ~10% of the
// viewport and spins on its own; user can drag to rotate.
const PEDESTAL_SCALE = 0.34;
const PEDESTAL_SPIN_SPEED = 0.35; // rad/s idle auto-rotation
const SPIN_FRICTION = 0.94;
const TWO_PI = Math.PI * 2;

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - 2 ** (-10 * t);
}

export function Statue() {
  const { scene } = useGLTF("/models/statue.glb", DRACO_PATH);
  const sceneReady = useSceneReady();
  const groupRef = useRef<Group>(null);
  const mountTime = useRef<number | null>(null);
  const sceneReadyRef = useRef(false);
  const reducedMotion = useRef(false);

  if (sceneReady) sceneReadyRef.current = true;

  const { centerOffset, fitScale } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const target = 2.4;
    return {
      centerOffset: center.clone().multiplyScalar(-1),
      fitScale: target / maxAxis,
    };
  }, [scene]);

  useLayoutEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (mountTime.current === null) {
      if (!sceneReadyRef.current) {
        groupRef.current.scale.setScalar(START_SCALE);
        groupRef.current.position.set(0, -0.5, 0);
        return;
      }
      mountTime.current = performance.now();
    }

    const elapsed = (performance.now() - mountTime.current) / 1000;
    const rawEntrance = (elapsed - ENTRANCE_DELAY) / ENTRANCE_DURATION;
    const entrance = easeOutExpo(Math.min(1, Math.max(0, rawEntrance)));

    // --- Mode blends -----------------------------------------------------
    const pedestalTarget = sceneState.mode === "pedestal" ? 1 : 0;
    sceneState.pedestalBlend += (pedestalTarget - sceneState.pedestalBlend) * 0.07;
    const orbitTarget = sceneState.mode === "orbit" ? 1 : 0;
    const orbitLerp = sceneState.mode === "orbit" ? 0.12 : 0.22;
    sceneState.orbitBlend += (orbitTarget - sceneState.orbitBlend) * orbitLerp;
    const pedestal = sceneState.pedestalBlend;

    // --- Pedestal spin (self-rotation + drag inertia) --------------------
    if (sceneState.mode === "pedestal") {
      if (!reducedMotion.current && !sceneState.dragging) {
        sceneState.spinY += PEDESTAL_SPIN_SPEED * delta;
      }
      sceneState.spinY += sceneState.spinVelocity;
      sceneState.spinVelocity *= SPIN_FRICTION;
    } else {
      // Ease back to the nearest full turn so leaving the section
      // never snaps the statue's orientation.
      sceneState.spinVelocity = 0;
      const settled = Math.round(sceneState.spinY / TWO_PI) * TWO_PI;
      sceneState.spinY += (settled - sceneState.spinY) * 0.06;
    }

    // --- Scale: entrance × mode ------------------------------------------
    const entranceScale = START_SCALE + (RESTING_SCALE - START_SCALE) * entrance;
    const modeScale = 1 + (PEDESTAL_SCALE - 1) * pedestal;
    groupRef.current.scale.setScalar(entranceScale * modeScale);

    // --- Rotation: base + camera keyframe + pedestal spin + breath -------
    const entranceRotation = (1 - entrance) * 0.6;
    groupRef.current.rotation.y =
      Math.PI * 0.5 +
      statueRotationState.y +
      sceneState.spinY +
      entranceRotation +
      Math.sin(performance.now() * 0.0002) * 0.01;

    // --- Position: scroll drift zeroed while pedestal/orbit centre it ----
    const centred = Math.max(pedestal, sceneState.orbitBlend);
    const scrollFloat = scrollStore.progress * 0.6 * (1 - centred);
    const breath = Math.sin(performance.now() * 0.0006) * 0.04;
    const entranceDrift = (1 - entrance) * -0.5;
    groupRef.current.position.y = scrollFloat + breath + entranceDrift + 0.45 * pedestal;

    const scrollDriftX = scrollStore.progress * 0.15 * (1 - centred);
    groupRef.current.position.x = scrollDriftX;
  });

  return (
    <group ref={groupRef} position={[0, -0.35, 0]} scale={START_SCALE}>
      <group scale={fitScale}>
        <group position={centerOffset}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}
