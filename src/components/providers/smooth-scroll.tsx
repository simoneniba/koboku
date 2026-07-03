"use client";

import Lenis from "lenis";
import { type ReactNode, useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollStore } from "@/lib/scroll-store";

interface SmoothScrollProps {
  children: ReactNode;
}

function syncScrollStore() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollStore.scrollY = window.scrollY;
  scrollStore.progress = max > 0 ? window.scrollY / max : 0;
  ScrollTrigger.update();
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    if (isTouch) {
      syncScrollStore();
      window.addEventListener("scroll", syncScrollStore, { passive: true });
      window.addEventListener("resize", syncScrollStore, { passive: true });
      return () => {
        window.removeEventListener("scroll", syncScrollStore);
        window.removeEventListener("resize", syncScrollStore);
      };
    }

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
