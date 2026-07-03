"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollStore } from "@/lib/scroll-store";

function sheetYPercent(sheet: HTMLElement): number {
  const y = gsap.getProperty(sheet, "y");
  if (typeof y === "string") return parseFloat(y);
  return typeof y === "number" ? y : 100;
}

function syncSheetCovering(sheet: HTMLElement) {
  scrollStore.whiteSheetCovering = Math.abs(sheetYPercent(sheet)) < 2;
}

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useGSAP(
    () => {
      if (!mounted || !sectionRef.current || !pinRef.current || !whiteRef.current)
        return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const sheet = whiteRef.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=160%",
          pin: pinRef.current,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: () => syncSheetCovering(sheet),
        },
      });

      tl.fromTo(
        sheet,
        { y: "100%" },
        { y: "0%", ease: "none", duration: 1, immediateRender: true },
        0,
      );
      tl.to(sheet, { y: "0%", duration: 0.45 }, 1);
      tl.to(sheet, { y: "-100%", ease: "none", duration: 0.55 }, 1.45);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          sheet.style.willChange = "transform";
        },
        onEnterBack: () => {
          sheet.style.willChange = "transform";
        },
        onLeave: () => {
          gsap.set(sheet, { y: "-100%" });
          scrollStore.whiteSheetCovering = false;
          sheet.style.willChange = "";
        },
        onLeaveBack: () => {
          gsap.set(sheet, { y: "100%" });
          scrollStore.whiteSheetCovering = false;
          sheet.style.willChange = "";
        },
      });

      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(raf);
    },
    { scope: sectionRef, dependencies: [mounted] },
  );

  const whiteLayer = (
    <div
      ref={whiteRef}
      className="fixed -inset-[2px] z-[1] isolate bg-white pointer-events-none backface-hidden"
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
