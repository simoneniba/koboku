"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Re-measures pin spacers after all section ScrollTriggers register.
 * Prevents compounded pin spacing from making exit distances feel too long.
 */
export function ScrollRefresh() {
  useGSAP(() => {
    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    const initial = window.setTimeout(refresh, 150);

    window.addEventListener("load", refresh);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refresh, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(initial);
      clearTimeout(resizeTimer);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
