"use client";

import Lenis from "lenis";
import { type ReactNode, useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollStore } from "@/lib/scroll-store";

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Single source of truth for scroll values — mutable store, no React
    // state, no per-frame re-renders. ScrollTrigger is kept in lockstep
    // with Lenis (this sync line was missing and caused pin jitter).
    lenis.on("scroll", ({ progress, scroll }: { progress: number; scroll: number }) => {
      scrollStore.progress = progress;
      scrollStore.scrollY = scroll;
      ScrollTrigger.update();
    });

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
