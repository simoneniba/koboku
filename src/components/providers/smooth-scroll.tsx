"use client";

import Lenis from "lenis";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { ScrollContext } from "@/lib/scroll-context";

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const [progress, setProgress] = useState(0);
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

    lenis.on("scroll", ({ progress: p }: { progress: number }) => {
      setProgress(p);
    });

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <ScrollContext.Provider value={{ progress }}>
      {children}
    </ScrollContext.Provider>
  );
}
