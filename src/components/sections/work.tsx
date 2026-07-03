"use client";

import { useGSAP } from "@gsap/react";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { sceneState } from "@/lib/scene-state";

const SETTLE = 0.2;
const PHASE_SCRUB = 1.0;
const PHASE_TARGET = 2;
const PIN_SCROLL = "+=70%";
const REELS_LABEL_HIDE = 1.5;

const DRAG_GAIN = 0.006;
const DRAG_VEL = 0.0035;
const GESTURE_MIN = 8;
const GESTURE_RATIO = 0.85;
const TAP_MAX = 12;

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
  sceneState.orbitHitHref = null;
}

export function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const drag = useRef<DragState>({ ...DRAG_IDLE });
  const isCoarse = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);

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

        const label = labelRef.current;
        if (label) {
          label.style.display = proxy.phase >= REELS_LABEL_HIDE ? "none" : "";
        }
      };

      tl.to(proxy, { phase: 0, duration: SETTLE, onUpdate: apply }, 0);
      tl.to(
        proxy,
        { phase: PHASE_TARGET, ease: "none", duration: PHASE_SCRUB, onUpdate: apply },
        SETTLE,
      );
    },
    { scope: sectionRef },
  );

  const setPointer = (e: React.PointerEvent) => {
    sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    sceneState.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    sceneState.pointer.active = true;
  };

  const syncOverlayCursor = () => {
    const el = overlayRef.current;
    if (!el) return;
    if (sceneState.orbitHitHref) {
      el.style.cursor = "pointer";
    } else if (drag.current.rotating) {
      el.style.cursor = "grabbing";
    } else {
      el.style.cursor = "grab";
    }
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
    syncOverlayCursor();
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

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    const travel =
      Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY);
    if (!d.rotating && travel < TAP_MAX && sceneState.orbitHitHref) {
      window.open(sceneState.orbitHitHref, "_blank", "noopener,noreferrer");
    }
    endDrag(e);
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
    const delta = lateral ? e.deltaX : e.deltaY;
    sceneState.orbitDrag += delta * 0.0016;
    sceneState.orbitDragVelocity += delta * 0.00055;
  };

  return (
    <section ref={sectionRef} id="work" className="relative">
      <div ref={pinRef} className="relative h-svh">
        <span
          ref={labelRef}
          className="text-eyebrow text-bone/40 absolute top-24 left-6 md:left-12 pointer-events-none"
        >
          — Selected work / 04
        </span>

        <div
          ref={overlayRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
          onWheel={onWheel}
        />
      </div>
    </section>
  );
}
