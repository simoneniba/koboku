"use client";

import { useScrollProgress } from "@/lib/scroll-context";

export function Nav() {
  const progress = useScrollProgress();
  const barFillPct = Math.min(100, progress * 100);

  // Bar color brightens toward white as scroll advances.
  // Amber (#8A6A4A) at 0% → near-white (#F4F1EA) at 100%.
  const startColor = { r: 138, g: 106, b: 74 };
  const endColor = { r: 244, g: 241, b: 234 };
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * progress);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * progress);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * progress);
  const fillColor = `rgb(${r}, ${g}, ${b})`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="px-6 md:px-10 pt-8">
        <div className="relative h-px w-full bg-bone/15">
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-150 ease-linear"
            style={{
              width: `${barFillPct}%`,
              backgroundColor: fillColor,
            }}
          />
          {/* Marker — small diamond at the leading edge of the fill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[left] duration-150 ease-linear"
            style={{
              left: `${barFillPct}%`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rotate-45"
              style={{ backgroundColor: fillColor }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
