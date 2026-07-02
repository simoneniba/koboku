"use client";

import { Billboard, useTexture, useVideoTexture } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useRef } from "react";
import type { Group, Mesh, MeshBasicMaterial } from "three";
import { type OrbitItem, orbitFilm, orbitReels, orbitSites } from "@/data/portfolio";
import { sceneState } from "@/lib/scene-state";

/**
 * Three stacked rings of media planes orbiting the statue:
 *   0 — Sites/apps (clickable)   — over the white backdrop
 *   1 — Film (cinema, 16:9)      — over the black backdrop
 *   2 — Reels (9:16)             — over the water video
 *
 * The statue never moves between orbits: it is the fixed centre of the
 * system. Only the ring STACK slides vertically past it as the phase
 * advances, so the statue stays centred and visually constant.
 *
 * Vertical page scroll (Orbit section pin) scrubs sceneState.orbitPhase,
 * which slides the whole stack so the active ring aligns with the statue —
 * "scrolling down moves to the next orbit". Lateral input (drag or
 * horizontal wheel/trackpad, handled in PersistentScene) rotates the rings.
 *
 * Rings live inside the persistent Canvas so the statue occludes the far
 * side with real depth — the back planes read smaller behind it.
 */

const RADIUS = 3.3;
const RING_Y = 0.45;
const RING_GAP = 3.6; // vertical distance between the three orbit planes
const IDLE_SPEED = 0.04;

const LANDSCAPE: [number, number] = [1.7, 0.956];
const PORTRAIT: [number, number] = [0.72, 1.28];

function planeSize(item: OrbitItem): [number, number] {
  return item.ratio === "9:16" ? PORTRAIT : LANDSCAPE;
}

function useOpenHref(item: OrbitItem) {
  return (e: ThreeEvent<MouseEvent>) => {
    // Only treat as a click if the pointer barely moved (not a drag).
    if (!item.href || e.delta > 6) return;
    e.stopPropagation();
    window.open(item.href, "_blank", "noopener,noreferrer");
  };
}

function hoverCursor(on: boolean) {
  document.body.style.cursor = on ? "pointer" : "";
}

function VideoPlane({ item }: { item: OrbitItem }) {
  const texture = useVideoTexture(item.src, {
    muted: true,
    loop: true,
    start: true,
    crossOrigin: "anonymous",
  });
  const onClick = useOpenHref(item);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F mesh, not a DOM element
    <mesh
      onClick={onClick}
      onPointerOver={item.href ? () => hoverCursor(true) : undefined}
      onPointerOut={item.href ? () => hoverCursor(false) : undefined}
    >
      <planeGeometry args={planeSize(item)} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  );
}

function ImagePlane({ item }: { item: OrbitItem }) {
  const texture = useTexture(item.src);
  const onClick = useOpenHref(item);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F mesh, not a DOM element
    <mesh
      onClick={onClick}
      onPointerOver={item.href ? () => hoverCursor(true) : undefined}
      onPointerOut={item.href ? () => hoverCursor(false) : undefined}
    >
      <planeGeometry args={planeSize(item)} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  );
}

function Ring({ items, baseOffset }: { items: OrbitItem[]; baseOffset: number }) {
  const count = items.length;
  return (
    <>
      {items.map((item, i) => {
        const angle = baseOffset + (i / count) * Math.PI * 2;
        const x = Math.sin(angle) * RADIUS;
        const z = Math.cos(angle) * RADIUS;
        return (
          <Billboard key={`${item.title}-${angle.toFixed(3)}`} position={[x, 0, z]}>
            <Suspense fallback={null}>
              {item.type === "video" ? <VideoPlane item={item} /> : <ImagePlane item={item} />}
            </Suspense>
          </Billboard>
        );
      })}
    </>
  );
}

const RINGS: { items: OrbitItem[]; baseOffset: number }[] = [
  { items: orbitSites, baseOffset: 0 },
  { items: orbitFilm, baseOffset: Math.PI / 5 },
  { items: orbitReels, baseOffset: Math.PI / 3 },
];

export function OrbitRing() {
  const stackRef = useRef<Group>(null);
  const ringRefs = useRef<(Group | null)[]>([]);
  const reducedMotion = useRef(false);

  useLayoutEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((_state, delta) => {
    const stack = stackRef.current;
    if (!stack) return;

    const vis = sceneState.orbitBlend;
    stack.visible = vis > 0.02;
    if (!stack.visible) return;

    // Lateral rotation: idle drift + drag/wheel inertia.
    if (!reducedMotion.current && !sceneState.dragging) {
      sceneState.orbitDrag += IDLE_SPEED * delta;
    }
    sceneState.orbitDrag += sceneState.orbitDragVelocity;
    sceneState.orbitDragVelocity *= 0.94;

    // Vertical phase: slide the stack so the active ring meets the statue.
    // phase 0..3 → active ring index 0..2.
    const phase = Math.min(2, Math.max(0, sceneState.orbitPhase));
    stack.position.y = RING_Y + phase * RING_GAP;

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      ring.rotation.y = sceneState.orbitDrag + i * 0.35;
      // Bell-curve visibility around the active phase; neighbours stay
      // faintly present above/below for depth and anticipation.
      const proximity = Math.max(0, 1 - Math.abs(phase - i));
      const ringVis = vis * (0.12 + 0.88 * proximity * proximity);
      ring.traverse((obj) => {
        const mesh = obj as Mesh;
        if (mesh.isMesh) {
          const mat = mesh.material as MeshBasicMaterial;
          if (mat && "opacity" in mat) mat.opacity = ringVis;
        }
      });
    });

    stack.scale.setScalar(0.85 + 0.15 * vis);
  });

  return (
    <group ref={stackRef} position={[0, RING_Y, 0]} visible={false}>
      {RINGS.map((ring, i) => (
        <group
          key={`ring-${ring.baseOffset.toFixed(2)}`}
          position={[0, -i * RING_GAP, 0]}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
        >
          <Ring items={ring.items} baseOffset={ring.baseOffset} />
        </group>
      ))}
    </group>
  );
}
