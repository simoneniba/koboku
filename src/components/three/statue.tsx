"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Box3, Group, Vector3 } from "three";
import { useScrollProgress } from "@/lib/scroll-context";
import { useSceneReady } from "@/lib/ready-state";
import { statueRotationState } from "./camera-rig";

const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";

useGLTF.preload("/models/statue.glb", DRACO_PATH);

// L'entrata parte da quando la scena è pronta (loading screen alzato),
// non da un orario fisso. Piccolo respiro, poi scale-in.
const ENTRANCE_DELAY = 0.15;
const ENTRANCE_DURATION = 0.7;
const RESTING_SCALE = 1.2;
const START_SCALE = 0.35;

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function Statue() {
  const { scene } = useGLTF("/models/statue.glb", DRACO_PATH);
  const scrollProgress = useScrollProgress();
  const sceneReady = useSceneReady();
  const groupRef = useRef<Group>(null);
  const mountTime = useRef<number | null>(null);
  const sceneReadyRef = useRef(false);

  // Tiene traccia di "scena pronta" in un ref leggibile dentro useFrame.
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
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
      }
    });
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;

    // L'entrata non parte finché la scena non è segnalata pronta.
    // Prima di allora la statua resta piccola e in basso (stato iniziale),
    // nascosta comunque dal loading screen.
    if (mountTime.current === null) {
      if (!sceneReadyRef.current) {
        // Mantieni lo stato di partenza dell'entrata.
        groupRef.current.scale.setScalar(START_SCALE);
        groupRef.current.position.set(0, -0.5, 0);
        return;
      }
      mountTime.current = performance.now();
    }

    const elapsed = (performance.now() - mountTime.current) / 1000;
    const rawEntrance = (elapsed - ENTRANCE_DELAY) / ENTRANCE_DURATION;
    const entrance = easeOutExpo(Math.min(1, Math.max(0, rawEntrance)));

    // SCALE: da piccola a riposo
    const scale = START_SCALE + (RESTING_SCALE - START_SCALE) * entrance;
    groupRef.current.scale.setScalar(scale);

    // ROTAZIONE: orientamento base + offset keyframe camera + respiro
    const entranceRotation = (1 - entrance) * 0.6;
    groupRef.current.rotation.y =
      Math.PI * 0.5 +
      statueRotationState.y +
      entranceRotation +
      Math.sin(performance.now() * 0.0002) * 0.01;

    // POSIZIONE: float da scroll + respiro + drift d'entrata
    const scrollFloat = scrollProgress * 0.6;
    const breath = Math.sin(performance.now() * 0.0006) * 0.04;
    const entranceDrift = (1 - entrance) * -0.5;
    groupRef.current.position.y = scrollFloat + breath + entranceDrift;

    const scrollDriftX = scrollProgress * 0.15;
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