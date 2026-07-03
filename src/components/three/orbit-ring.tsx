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
 * Three stacked rings of media planes orbiting the statue (Sites → Film →
 * Reels). The statue is the fixed sun; only the ring stack slides past it.
 *
 * PERFORMANCE ARCHITECTURE — hard decoder budget:
 *   1. Only the ACTIVE ring mounts <video> elements at all. Inactive rings
 *      render posters — zero decode.
 *   2. A global budget (VIDEO_BUDGET, reset each frame by the stack, spent
 *      by planes in mount order) caps simultaneous playing videos at 2,
 *      regardless of how many planes face the camera. Everything else
 *      shows its poster.
 *   3. Planes only qualify for the budget when facing the camera
 *      (cos(worldAngle) > FACING_THRESHOLD).
 *   4. When the Work section is left (orbitBlend < 0.05) every video
 *      pauses immediately; unmount disposes element + texture.
 *   5. Video items without a poster render a dark neutral panel while
 *      inactive — a .mp4 src is never passed to useTexture.
 */

const RADIUS = 3.3;
const RING_Y = 0.45;
const RING_GAP = 3.6;
const IDLE_SPEED = 0.04;

const VIDEO_BUDGET = 2; // max simultaneous decoding videos, page-wide
const FACING_THRESHOLD = 0.55; // cos(worldAngle) — ~±56° window front-centre

// Shared frame budget: reset by OrbitRing's useFrame (parent mounts first,
// so its frame callback runs before the planes'), spent by LazyVideoPlane.
const frameBudget = { remaining: 0 };

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

/** Smooth premium hover: lerps the plane group toward HOVER_SCALE while
 *  the pointer is over it, back to 1 when it leaves. */
const HOVER_SCALE = 1.09;
const HOVER_LERP = 0.12;

function useHoverScale() {
  const groupRef = useRef<Group>(null);
  const hovered = useRef(false);
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const target = hovered.current ? HOVER_SCALE : 1;
    const s = g.scale.x + (target - g.scale.x) * HOVER_LERP;
    g.scale.setScalar(s);
  });
  return {
    groupRef,
    onPointerOver: () => {
      hovered.current = true;
    },
    onPointerOut: () => {
      hovered.current = false;
    },
  };
}

// ─── Static planes ───────────────────────────────────────────────────

function ImagePlane({ item, src }: { item: OrbitItem; src: string }) {
  const texture = useTexture(src);
  const onClick = useOpenHref(item);
  const hover = useHoverScale();
  return (
    <group ref={hover.groupRef}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: R3F mesh */}
      <mesh
        onClick={onClick}
        onPointerOver={() => {
          hover.onPointerOver();
          if (item.href) hoverCursor(true);
        }}
        onPointerOut={() => {
          hover.onPointerOut();
          if (item.href) hoverCursor(false);
        }}
      >
        <planeGeometry args={planeSize(item)} />
        <meshBasicMaterial map={texture} toneMapped={false} transparent />
      </mesh>
    </group>
  );
}

/** Neutral panel for video items with no poster on inactive rings —
 *  never feeds a video URL to the image loader. */
function BlankPlane({ item }: { item: OrbitItem }) {
  return (
    <mesh>
      <planeGeometry args={planeSize(item)} />
      <meshBasicMaterial color="#101820" toneMapped={false} transparent />
    </mesh>
  );
}

function StaticPlane({ item }: { item: OrbitItem }) {
  if (item.type === "image") return <ImagePlane item={item} src={item.src} />;
  if (item.poster) return <ImagePlane item={item} src={item.poster} />;
  return <BlankPlane item={item} />;
}

// ─── Lazy video plane (active ring only) ─────────────────────────────

function LazyVideoPlane({
  item,
  slotAngle,
  ringRotationRef,
}: {
  item: OrbitItem;
  slotAngle: number;
  ringRotationRef: React.RefObject<number>;
}) {
  const meshRef = useRef<Mesh>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playingRef = useRef(false);
  const [ready, setReady] = useState(false);

  // Poster shown until the video is granted budget and has frames.
  const posterTexture = useTexture(item.poster ?? "/images/poster-fallback.jpg");

  const videoTexture = useMemo(() => {
    const video = document.createElement("video");
    video.src = item.src;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata"; // never buffer until actually played
    videoRef.current = video;
    video.addEventListener("canplay", () => setReady(true), { once: true });

    const tex = new VideoTexture(video);
    tex.colorSpace = SRGBColorSpace;
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }, [item.src]);

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

  useFrame(() => {
    const mesh = meshRef.current;
    const video = videoRef.current;
    if (!mesh || !video) return;

    const mat = mesh.material as MeshBasicMaterial;

    // Section left → hard pause, poster back.
    if (sceneState.orbitBlend < 0.05) {
      if (playingRef.current) {
        video.pause();
        playingRef.current = false;
      }
      if (mat.map !== posterTexture) {
        mat.map = posterTexture;
        mat.needsUpdate = true;
      }
      return;
    }

    // Facing + budget: only front-centre planes may spend a decode slot.
    const worldAngle = (ringRotationRef.current ?? 0) + slotAngle;
    const facing = Math.cos(worldAngle) > FACING_THRESHOLD;
    const wants = facing && frameBudget.remaining > 0;

    if (wants) frameBudget.remaining -= 1;

    if (wants && !playingRef.current) {
      video.play().catch(() => {});
      playingRef.current = true;
    } else if (!wants && playingRef.current) {
      video.pause();
      playingRef.current = false;
    }

    if (playingRef.current && ready && video.readyState >= 2) {
      if (mat.map !== videoTexture) {
        mat.map = videoTexture;
        mat.needsUpdate = true;
      }
      videoTexture.needsUpdate = true;
    } else if (mat.map !== posterTexture) {
      mat.map = posterTexture;
      mat.needsUpdate = true;
    }
  });

  const onClick = useOpenHref(item);
  const hover = useHoverScale();

  return (
    <group ref={hover.groupRef}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: R3F mesh */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => {
          hover.onPointerOver();
          if (item.href) hoverCursor(true);
        }}
        onPointerOut={() => {
          hover.onPointerOut();
          if (item.href) hoverCursor(false);
        }}
      >
        <planeGeometry args={planeSize(item)} />
        <meshBasicMaterial map={posterTexture} toneMapped={false} transparent />
      </mesh>
    </group>
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
        // Videos only get a real <video> element on the active ring AND
        // when they have a poster to fall back to; otherwise static.
        const lazy = item.type === "video" && active && item.poster;
        return (
          <Billboard key={`${item.title}-${angle.toFixed(3)}`} position={[x, 0, z]}>
            <Suspense fallback={null}>
              {lazy ? (
                <LazyVideoPlane item={item} slotAngle={angle} ringRotationRef={ringRotationRef} />
              ) : (
                <StaticPlane item={item} />
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
  const [activeRingIndex, setActiveRingIndex] = useState(-1); // -1: none until Work

  useLayoutEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((_state, delta) => {
    // Reset the shared decode budget FIRST (parent frame runs before
    // children in mount order).
    frameBudget.remaining = VIDEO_BUDGET;

    const stack = stackRef.current;
    if (!stack) return;

    const vis = sceneState.orbitBlend;
    stack.visible = vis > 0.02;

    // No ring is "active" (= no video elements exist) until the Work
    // section is actually reached.
    if (vis < 0.05) {
      if (activeRingIndex !== -1) setActiveRingIndex(-1);
      return;
    }

    if (!reducedMotion.current && !sceneState.dragging) {
      sceneState.orbitDrag += IDLE_SPEED * delta;
    }
    sceneState.orbitDrag += sceneState.orbitDragVelocity;
    sceneState.orbitDragVelocity *= 0.94;

    const phase = Math.min(2, Math.max(0, sceneState.orbitPhase));
    stack.position.y = RING_Y + phase * RING_GAP;

    const newActive = Math.min(2, Math.max(0, Math.round(phase)));
    if (newActive !== activeRingIndex) setActiveRingIndex(newActive);

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const rotation = sceneState.orbitDrag + i * 0.35;
      ring.rotation.y = rotation;
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
