"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollStore } from "@/lib/scroll-store";

const START = { r: 138, g: 106, b: 74 }; // amber
const END = { r: 244, g: 241, b: 234 }; // near-white

export function Nav() {
  const fillRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const diamondRef = useRef<HTMLDivElement>(null);

  // Progress bar is driven imperatively from the scroll store — zero React
  // re-renders during scroll (the old version re-rendered every frame).
  useEffect(() => {
    let last = -1;
    const sync = () => {
      const p = scrollStore.progress;
      if (p === last) return;
      last = p;
      const pct = Math.min(100, p * 100);
      const r = Math.round(START.r + (END.r - START.r) * p);
      const g = Math.round(START.g + (END.g - START.g) * p);
      const b = Math.round(START.b + (END.b - START.b) * p);
      const color = `rgb(${r}, ${g}, ${b})`;
      if (fillRef.current) {
        fillRef.current.style.width = `${pct}%`;
        fillRef.current.style.backgroundColor = color;
      }
      if (markerRef.current) markerRef.current.style.left = `${pct}%`;
      if (diamondRef.current) diamondRef.current.style.backgroundColor = color;
    };
    gsap.ticker.add(sync);
    return () => gsap.ticker.remove(sync);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="px-6 md:px-10 pt-8">
        <div className="relative h-px w-full bg-bone/15">
          <div ref={fillRef} className="absolute inset-y-0 left-0" />
          <div
            ref={markerRef}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: "0%" }}
          >
            <div ref={diamondRef} className="w-1.5 h-1.5 rotate-45" />
          </div>
        </div>
      </div>
    </header>
  );
}
