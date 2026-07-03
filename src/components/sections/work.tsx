"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { sceneState } from "@/lib/scene-state";

/**
 * Selected Work — the orbit constellation. Three rings of real footage
 * (Sites → Film → Reels) orbit the statue in the persistent 3D scene.
 *
 * The pin timeline holds phase 0 for its first stretch — a settle window
 * that covers the camera's travel into the section — so the Sites ring is
 * the first thing seen once the statue is in its final framing, instead
 * of burning away mid-transition.
 *
 * ALL interaction lives on the DOM overlay below (not on the WebGL
 * canvas): drag / touch-drag rotates the ring, trackpad lateral swipe and
 * Shift+wheel rotate it, and pointer position is written to the shared
 * store for raycast hover inside OrbitRing. touch-action: pan-y keeps
 * vertical scroll native on mobile while horizontal gestures rotate.
 */

const SETTLE = 1.2; // timeline units held at phase 0 before the orbits move
const PHASES = 3;

export function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, lastX: 0 });

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=450%",
          pin: pinRef.current,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const proxy = { phase: 0 };
      const apply = () => {
        sceneState.orbitPhase = proxy.phase;
      };
      // Settle hold: statue arrives, Sites ring fades in, nothing advances.
      tl.to(proxy, { phase: 0, duration: SETTLE, onUpdate: apply }, 0);
      // Then the three orbits, evenly.
      tl.to(proxy, { phase: PHASES, ease: "none", duration: PHASES, onUpdate: apply }, SETTLE);
    },
    { scope: sectionRef },
  );

  // ── DOM interaction layer (no canvas events involved) ──────────────
  const setPointer = (e: React.PointerEvent) => {
    sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    sceneState.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    sceneState.pointer.active = true;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    sceneState.dragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setPointer(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    setPointer(e);
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    sceneState.orbitDragVelocity = dx * 0.0022;
  };

  const endDrag = (e: React.PointerEvent) => {
    drag.current.active = false;
    sceneState.dragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const onPointerLeave = (e: React.PointerEvent) => {
    endDrag(e);
    sceneState.pointer.active = false;
  };

  const onWheel = (e: React.WheelEvent) => {
    // Lateral trackpad swipe OR Shift+wheel (mouse) rotates the ring;
    // plain vertical wheel scrolls the page as normal.
    const lateral = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!lateral && !e.shiftKey) return;
    e.preventDefault();
    const delta = lateral ? e.deltaX : e.deltaY;
    sceneState.orbitDragVelocity += delta * 0.00035;
  };

  return (
    <section ref={sectionRef} id="work" className="relative">
      <div ref={pinRef} className="relative h-svh">
        <span className="text-eyebrow text-bone/40 absolute top-24 left-6 md:left-12 pointer-events-none">
          — Selected work / 04
        </span>

        {/* Interaction surface: sits in normal page stacking (above the
            canvas), so drag/hover work without any pointer-event gating. */}
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={onPointerLeave}
          onWheel={onWheel}
        />
      </div>
    </section>
  );
}
