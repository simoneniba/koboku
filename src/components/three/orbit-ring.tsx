"use client";

import { Billboard, useTexture } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  type Group,
  LinearFilter,
  type Mesh,
  type MeshBasicMaterial,
  SRGBColorSpace,
  VideoTexture,
} from "three";
import { type OrbitItem, orbitFilm, orbitReels, orbitSites } from "@/data/portfolio";
import { sceneState } from "@/lib/scene-state";

/**
 * Three stacked rings of media planes orbiting the statue:
 *   0 — Sites/apps (clickable)   — over the white backdrop
 *   1 — Film (cinema, 16:9)      — over the black backdrop
 *   2 — Reels (9:16)             — over the water video
 *
 * PERFORMANCE ARCHITECTURE — lazy video activation:
 *   1. Only the ACTIVE ring (nearest to orbitPhase) mounts video elements.
 *      Inactive rings render poster images — zero GPU decode.
 *   2. Within the active ring, only FRONT-FACING planes (camera-side of
 *      the orbit) play their video. Back-facing planes pause and show the
 *      poster texture. At peak: 2–3 videos decode simultaneously.
 *   3. The statue never moves — it is the fixed sun; only the ring stack
 *      slides vertically past it as the phase advances.
 */

const RADIUS = 3.3;
const RING_Y = 0.45;
const RING_GAP = 3.6;
const IDLE_SPEED = 0.04;

const LANDSCAPE: [number, number] = [1.7, 0.956];
const PORTRAIT: [number, number] = [0.72, 1.28];

function planeSize(item: OrbitItem): [number, number] {
  return item.ratio === "9:16" ? PORTRAIT : LANDSCAPE;
}

function useOpenHref(item: OrbitItem) {
  return (e: ThreeEvent<MouseEvent>) => {
    if (!item.href || e.delta > 6) return;
    e.stopPropagation();
    window.open(item.href, "_blank", "noopener,noreferrer");
  };
}

function hoverCursor(on: boolean) {
  document.body.style.cursor = on ? "pointer" : "";
}

// ─── Poster-only plane (images and inactive-ring videos) ─────────────

function ImagePlane({ item, posterSrc }: { item: OrbitItem; posterSrc: string }) {
  const texture = useTexture(posterSrc);
  const onClick = useOpenHref(item);
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F mesh
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

// ─── Smart video plane (active ring only) ────────────────────────────
// Creates the <video> element manually so we can play/pause it per frame
// based on whether the plane faces the camera — without unmounting.

function LazyVideoPlane({
  item,
  slotAngle,
  ringRotationRef,
}: {
  item: OrbitItem;
  /** Fixed slot angle on the ring (radians). */
  slotAngle: number;
  /** Ref to a mutable that tracks the ring's current Y rotation. */
  ringRotationRef: React.RefObject<number>;
}) {
  const meshRef = useRef<Mesh>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playingRef = useRef(false);
  const [ready, setReady] = useState(false);

  // Poster texture — always loaded, shown until the video is playing
  // and whenever the plane faces away from the camera.
  const posterSrc = item.poster || item.src;
  const posterTexture = useTexture(posterSrc);

  // Create the video element + VideoTexture once on mount.
  const videoTexture = useMemo(() => {
    const video = document.createElement("video");
    video.src = item.src;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    videoRef.current = video;

    video.addEventListener("canplaythrough", () => setReady(true), { once: true });

    const tex = new VideoTexture(video);
    tex.colorSpace = SRGBColorSpace;
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }, [item.src]);

  // Dispose on unmount (when the ring becomes inactive).
  useLayoutEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
      videoTexture.dispose();
    };
  }, [videoTexture]);

  // Per-frame: decide play/pause based on facing direction.
  useFrame(() => {
    const mesh = meshRef.current;
    const video = videoRef.current;
    if (!mesh || !video || !ready) return;

    // World angle of this plane = ring rotation + fixed slot offset.
    const worldAngle = (ringRotationRef.current ?? 0) + slotAngle;
    // cos > 0 means the plane is in the front hemisphere (facing camera).
    const facing = Math.cos(worldAngle) > 0.15;

    if (facing && !playingRef.current) {
      video.play().catch(() => {});
      playingRef.current = true;
    } else if (!facing && playingRef.current) {
      video.pause();
      playingRef.current = false;
    }

    // Swap texture: video when playing + actually has frames, poster otherwise.
    const mat = mesh.material as MeshBasicMaterial;
    if (playingRef.current && video.readyState >= 2) {
      if (mat.map !== videoTexture) {
        mat.map = videoTexture;
        mat.needsUpdate = true;
      }
      videoTexture.needsUpdate = true;
    } else {
      if (mat.map !== posterTexture) {
        mat.map = posterTexture;
        mat.needsUpdate = true;
      }
    }
  });

  const onClick = useOpenHref(item);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F mesh
    <mesh
      ref={meshRef}
      onClick={onClick}
      onPointerOver={item.href ? () => hoverCursor(true) : undefined}
      onPointerOut={item.href ? () => hoverCursor(false) : undefined}
    >
      <planeGeometry args={planeSize(item)} />
      <meshBasicMaterial map={posterTexture} toneMapped={false} transparent />
    </mesh>
  );
}

// ─── Ring ────────────────────────────────────────────────────────────

function Ring({
  items,
  baseOffset,
  active,
  ringRotationRef,
}: {
  items: OrbitItem[];
  baseOffset: number;
  /** True when this is the orbit the user is currently viewing. */
  active: boolean;
  ringRotationRef: React.RefObject<number>;
}) {
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
              {item.type === "video" && active ? (
                <LazyVideoPlane item={item} slotAngle={angle} ringRotationRef={ringRotationRef} />
              ) : (
                <ImagePlane item={item} posterSrc={item.poster || item.src} />
              )}
            </Suspense>
          </Billboard>
        );
      })}
    </>
  );
}

// ─── Ring stack ──────────────────────────────────────────────────────

const RING_DEFS: { items: OrbitItem[]; baseOffset: number }[] = [
  { items: orbitSites, baseOffset: 0 },
  { items: orbitFilm, baseOffset: Math.PI / 5 },
  { items: orbitReels, baseOffset: Math.PI / 3 },
];

export function OrbitRing() {
  const stackRef = useRef<Group>(null);
  const ringRefs = useRef<(Group | null)[]>([]);
  const ringRotationRefs = useRef<React.RefObject<number>[]>(RING_DEFS.map(() => ({ current: 0 })));
  const reducedMotion = useRef(false);
  const [activeRingIndex, setActiveRingIndex] = useState(0);

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
    const phase = Math.min(2, Math.max(0, sceneState.orbitPhase));
    stack.position.y = RING_Y + phase * RING_GAP;

    // Determine active ring (nearest integer phase) — drives video loading.
    const newActive = Math.min(2, Math.max(0, Math.round(phase)));
    if (newActive !== activeRingIndex) {
      setActiveRingIndex(newActive);
    }

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const rotation = sceneState.orbitDrag + i * 0.35;
      ring.rotation.y = rotation;
      // Write the rotation into the shared ref so LazyVideoPlane can read
      // it without traversing the scene graph.
      const ref = ringRotationRefs.current[i];
      if (ref) ref.current = rotation;

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
      {RING_DEFS.map((ring, i) => (
        <group
          key={`ring-${ring.baseOffset.toFixed(2)}`}
          position={[0, -i * RING_GAP, 0]}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
        >
          <Ring
            items={ring.items}
            baseOffset={ring.baseOffset}
            active={i === activeRingIndex}
            ringRotationRef={ringRotationRefs.current[i]}
          />
        </group>
      ))}
    </group>
  );
}
