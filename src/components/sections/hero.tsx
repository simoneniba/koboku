"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const kobokuRef = useRef<HTMLDivElement>(null);
  const creativeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !kobokuRef.current || !creativeRef.current) return;

      // Entry animation — independent of 3D scene readiness, runs on mount.
      // Delays are calibrated to land after the loading screen lifts.
      gsap.fromTo(
        kobokuRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.6, delay: 0.6, ease: "expo.out" },
      );
      gsap.fromTo(
        creativeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.6, delay: 1.7, ease: "expo.out" },
      );

      // --- Coreografia di scroll (sempre attiva, indipendente dall'entrata) ---
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        creativeRef.current,
        { y: 0 },
        {
          y: () =>
            -(window.innerHeight - creativeRef.current!.getBoundingClientRect().height - 100),
          ease: "none",
          duration: 1,
        },
        0,
      );

      tl.fromTo(
        [kobokuRef.current, creativeRef.current],
        { opacity: 1 },
        { opacity: 0, ease: "none", duration: 0.5 },
        0.5,
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-svh w-full px-6 md:px-10 pt-12 pb-12 pointer-events-none overflow-hidden z-[1]"
    >
      <div ref={kobokuRef} className="absolute top-12 left-2 md:left-4 -z-10" style={{ opacity: 0 }}>
        <h1
          className="text-display font-bold uppercase text-bone leading-[0.85] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3.6rem, 9.9vw, 9.9rem)", willChange: "opacity, transform" }}
        >
          Koboku
          <br />
          Studio
        </h1>
      </div>

      <div
        ref={creativeRef}
        className="absolute bottom-12 right-6 md:right-10 text-right"
        style={{ opacity: 0 }}
      >
        <h2
          className="text-display font-bold uppercase text-bone leading-[0.85] tracking-[-0.02em]"
          style={{ fontSize: "clamp(2rem, 4.8vw, 4.8rem)", willChange: "opacity, transform" }}
        >
          Creative
          <br />
          Direction
        </h2>
      </div>
    </section>
  );
}