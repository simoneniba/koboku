"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useGSAP(
    () => {
      // Re-runs when `mounted` flips true and the portaled sheet exists.
      if (!mounted || !sectionRef.current || !pinRef.current || !whiteRef.current)
        return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // No-op: sheet stays parked below viewport, video remains visible,
        // section is a plain viewport-height beat.
        return;
      }

      const sheet = whiteRef.current;

      // ONE pinned, scrubbed timeline: rise (first ~half) + hold (rest).
      // immediateRender keeps the sheet at y:100% any time scroll is above
      // the trigger start — no guard trigger needed.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=160%",
          pin: pinRef.current,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Exit: sheet leaves upward when scrolling past the section,
          // returns to full white when scrolling back up into it.
          onLeave: () =>
            gsap.to(sheet, { y: "-100%", duration: 0.5, ease: "power2.in" }),
          onEnterBack: () => {
            gsap.killTweensOf(sheet);
            gsap.to(sheet, { y: "0%", duration: 0.4, ease: "power2.out" });
          },
        },
      });

      tl.fromTo(
        sheet,
        { y: "100%" },
        { y: "0%", ease: "none", duration: 1, immediateRender: true },
        0,
      );
      // Hold at full white for the remainder of the pin.
      tl.to(sheet, { y: "0%", duration: 1 }, 1);

      // Refresh AFTER upstream pin spacing (Verticals +=320%) has settled.
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(raf);
    },
    { scope: sectionRef, dependencies: [mounted] },
  );

  const whiteLayer = (
    <div
      ref={whiteRef}
      className="fixed inset-0 z-[1] bg-white pointer-events-none will-change-transform"
      style={{ transform: "translate3d(0, 100%, 0)" }}
      aria-hidden="true"
    />
  );

  return (
    <>
      {mounted ? createPortal(whiteLayer, document.body) : null}
      <section ref={sectionRef} id="process" className="relative">
        <div ref={pinRef} className="h-svh" aria-hidden="true" />
      </section>
    </>
  );
}
