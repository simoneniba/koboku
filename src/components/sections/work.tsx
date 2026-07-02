"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { sceneState } from "@/lib/scene-state";

/**
 * Selected Work — the orbit constellation. The three rings of real footage
 * (Sites → Film → Reels) live in the persistent 3D scene with the statue
 * as the fixed centre; this section owns the pin and the phase scrub.
 *
 * Vertical scroll moves BETWEEN orbits (the ring stack slides past the
 * statue); lateral input — drag or horizontal trackpad swipe — rotates the
 * active ring. No backdrop choreography: the constellation plays over
 * whatever the page background is at this point (the water video, after
 * the Process sheet exits).
 *
 * Reduced motion: the pin and scrub remain (scroll-driven, not autonomous);
 * only the idle drift is disabled, inside OrbitRing.
 */

const LABELS = ["Sites & Apps", "Film", "Reels"] as const;

export function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current) return;

      const labels = labelRefs.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=350%",
          pin: pinRef.current,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Timeline is 3 units — one per orbit. The scrub drives the phase;
      // OrbitRing slides the ring stack past the statue accordingly.
      const proxy = { phase: 0 };
      tl.to(
        proxy,
        {
          phase: 3,
          ease: "none",
          duration: 3,
          onUpdate: () => {
            sceneState.orbitPhase = proxy.phase;
          },
        },
        0,
      );

      // Labels: one per orbit, crossfading at the phase boundaries.
      labels.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 });
      });
      if (labels[0]) tl.to(labels[0], { autoAlpha: 0, duration: 0.2 }, 0.9);
      if (labels[1]) {
        tl.to(labels[1], { autoAlpha: 1, duration: 0.2 }, 1.1);
        tl.to(labels[1], { autoAlpha: 0, duration: 0.2 }, 1.9);
      }
      if (labels[2]) tl.to(labels[2], { autoAlpha: 1, duration: 0.2 }, 2.1);
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="work" className="relative">
      <div ref={pinRef} className="relative h-svh">
        <span className="text-eyebrow text-bone/40 absolute top-24 left-6 md:left-12">
          — Selected work / 04
        </span>
        <div className="absolute bottom-16 left-6 md:left-12 pointer-events-none">
          {LABELS.map((label, i) => (
            <span
              key={label}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="text-display absolute bottom-0 left-0 text-[clamp(1.6rem,3.2vw,2.8rem)] leading-none whitespace-nowrap text-bone"
            >
              {label}
            </span>
          ))}
        </div>
        <span className="text-eyebrow text-bone/35 absolute bottom-16 right-6 md:right-12">
          Drag or swipe sideways to rotate
        </span>
      </div>
    </section>
  );
}
