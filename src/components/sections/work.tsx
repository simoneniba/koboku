"use client";

import { useGSAP } from "@gsap/react";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { sceneState } from "@/lib/scene-state";

/**
 * Selected Work — three orbit rings scrubbed by a short pin timeline.
 * Vertical scroll drives phase (Sites → Film → Reels); horizontal drag
 * rotates the active ring with identical sensitivity on every phase.
 * Reels videos stay poster-only until the first horizontal engagement.
 */

const SETTLE = 0.5;
const PHASES = 2;
const PIN_SCROLL = "+=170%";

const DRAG_GAIN = 0.006;
const DRAG_VEL = 0.0035;
const GESTURE_MIN = 8;
const GESTURE_RATIO = 0.85;

type DragState = {
  active: boolean;
  lastX: number;
  startX: number;
  startY: number;
  decided: boolean;
  rotating: boolean;
  pointerId: number;
  target: HTMLElement | null;
};

const DRAG_IDLE: DragState = {
  active: false,
  lastX: 0,
  startX: 0,
  startY: 0,
  decided: false,
  rotating: false,
  pointerId: -1,
  target: null,
};

function horizontalIntent(dx: number, dy: number) {
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  return adx > GESTURE_MIN && adx >= ady * GESTURE_RATIO;
}

function resetWorkInteraction() {
  sceneState.dragging = false;
  sceneState.pointer.active = false;
  sceneState.orbitDragVelocity = 0;
  sceneState.orbitReelsEngaged = false;
}

function engageReelsVideos() {
  if (sceneState.orbitPhase >= 1.35) {
    sceneState.orbitReelsEngaged = true;
  }
}

export function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState>({ ...DRAG_IDLE });
  const isCoarse = useRef(false);

  useLayoutEffect(() => {
    isCoarse.current = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  }, []);

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: PIN_SCROLL,
          pin: pinRef.current,
          scrub: true,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          onLeave: resetWorkInteraction,
          onLeaveBack: resetWorkInteraction,
        },
      });

      const proxy = { phase: 0 };
      const apply = () => {
        sceneState.orbitPhase = proxy.phase;
      };

      tl.to(proxy, { phase: 0, duration: SETTLE, onUpdate: apply }, 0);
      tl.to(proxy, { phase: PHASES, ease: "none", duration: PHASES, onUpdate: apply }, SETTLE);
    },
    { scope: sectionRef },
  );

  const setPointer = (e: React.PointerEvent) => {
    sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    sceneState.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    sceneState.pointer.active = true;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = {
      active: true,
      lastX: e.clientX,
      startX: e.clientX,
      startY: e.clientY,
      decided: false,
      rotating: false,
      pointerId: e.pointerId,
      target: e.currentTarget as HTMLElement,
    };
    setPointer(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    setPointer(e);
    const d = drag.current;
    if (!d.active) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.decided) {
      if (Math.abs(dx) + Math.abs(dy) < GESTURE_MIN) return;

      d.decided = true;
      d.rotating = horizontalIntent(dx, dy);

      if (d.rotating) {
        sceneState.dragging = true;
        engageReelsVideos();
        d.target?.setPointerCapture(e.pointerId);
      } else {
        d.active = false;
        return;
      }
    }

    if (!d.rotating) return;

    const stepX = e.clientX - d.lastX;
    d.lastX = e.clientX;
    sceneState.orbitDrag += stepX * DRAG_GAIN;
    sceneState.orbitDragVelocity = stepX * DRAG_VEL;
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.rotating && d.target) {
      d.target.releasePointerCapture?.(e.pointerId);
    }
    drag.current = { ...DRAG_IDLE };
    sceneState.dragging = false;
  };

  const onPointerLeave = (e: React.PointerEvent) => {
    endDrag(e);
    sceneState.pointer.active = false;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (isCoarse.current) return;

    const lateral = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!lateral && !e.shiftKey) return;

    e.preventDefault();
    engageReelsVideos();
    const delta = lateral ? e.deltaX : e.deltaY;
    sceneState.orbitDrag += delta * 0.0016;
    sceneState.orbitDragVelocity += delta * 0.00055;
  };

  return (
    <section ref={sectionRef} id="work" className="relative">
      <div ref={pinRef} className="relative h-svh">
        <span className="text-eyebrow text-bone/40 absolute top-24 left-6 md:left-12 pointer-events-none">
          — Selected work / 04
        </span>

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
