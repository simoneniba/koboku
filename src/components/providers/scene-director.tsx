"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "@/lib/gsap";
import { SECTION_IDS, sectionTrack } from "@/lib/scene-state";

/**
 * Creates one ScrollTrigger per page section and writes { index, local }
 * into the shared sectionTrack store. This replaces the old "divide total
 * scroll into equal sixths" camera mapping, which broke as soon as pinned
 * sections made section lengths unequal.
 *
 * ScrollTrigger measures section ranges AFTER pin spacing is applied, so
 * the camera keyframes now follow the real sections regardless of how long
 * any pin is.
 */
export function SceneDirector() {
  useGSAP(() => {
    const triggers: ScrollTrigger[] = [];

    SECTION_IDS.forEach((id, index) => {
      const el = document.getElementById(id);
      if (!el) return;

      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            // A section owns the camera from when its top reaches the
            // viewport top until its bottom does. Using the raw
            // top-bottom→bottom-top range plus a remap keeps one trigger
            // per section while excluding the enter/exit overlap zones.
            const vh = window.innerHeight;
            const total = self.end - self.start;
            const owned = Math.max(1, total - vh);
            const local = Math.min(1, Math.max(0, (self.scroll() - self.start - vh) / owned));
            if (local > 0 && local < 1) {
              sectionTrack.index = index;
              sectionTrack.local = local;
            } else if (local >= 1 && sectionTrack.index === index) {
              sectionTrack.local = 1;
            }
          },
          invalidateOnRefresh: true,
        }),
      );
    });

    return () => {
      for (const t of triggers) t.kill();
    };
  }, []);

  return null;
}
