"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const LINES = [
  "Japanese discipline. Italian craft.",
  "Websites, software, cinematic AI.",
  "Agents, automations, and apps.",
  "Made for the Riviera.",
  "Yachting. Hospitality. Luxury.",
];

const SCROLL_PER_LINE = 80;

const STATE = {
  hidden:   { opacity: 0,    y: 80,   scale: 1 },
  current:  { opacity: 1,    y: -60,  scale: 1 },
  previous: { opacity: 0.28, y: -150, scale: 0.62 },
  gone:     { opacity: 0,    y: -260, scale: 0.5 },
};

export function Thesis() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current) return;

      const total = LINES.length * SCROLL_PER_LINE;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${total}%`,
          pin: pinRef.current,
          scrub: 1,
        },
      });

      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        // Frase 0: parte già nella posizione finale (y/scale di STATE.current)
        // ma con opacity 0 — così entra in fade puro senza scorrere dal basso.
        gsap.set(el, i === 0 ? { ...STATE.current, opacity: 0 } : STATE.hidden);
      });

      const slice = 1 / LINES.length;

      // Fade-in iniziale della frase 0: solo opacity, nessun movimento.
      const first = lineRefs.current[0];
      if (first) {
        tl.to(first, { opacity: 1, ease: "power2.out", duration: slice * 0.4 }, 0);
      }

      for (let i = 0; i < LINES.length - 1; i++) {
        const at =
          i === 0
            ? slice * 0.85
            : (i + 1) * slice - slice * 0.5;
        const dur = slice * 0.6;
        const cur = lineRefs.current[i];
        const next = lineRefs.current[i + 1];
        const prev = i > 0 ? lineRefs.current[i - 1] : null;

        const isLast = i === LINES.length - 2;

        if (cur) {
          tl.to(
            cur,
            { ...(isLast ? STATE.gone : STATE.previous), ease: "power2.out", duration: dur },
            at,
          );
        }
        if (next) tl.to(next, { ...STATE.current, ease: "power2.out", duration: dur }, at);
        if (prev) tl.to(prev, { ...STATE.gone, ease: "power2.out", duration: dur }, at);
      }

      // L'ultima frase resta sola al centro, poi sfuma via FERMA (solo opacity,
      // niente y) nell'ultimo tratto del pin — non scrolla fuori dallo schermo.
      const lastLine = lineRefs.current[LINES.length - 1];
      if (lastLine) {
        tl.to(
          lastLine,
          { opacity: 0, ease: "power2.in", duration: slice * 0.4 },
          1 - slice * 0.4,
        );
      }
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="thesis" className="relative w-full">
      <div ref={pinRef} className="h-screen w-full overflow-hidden pointer-events-none">
        <div className="relative h-full w-full">
          <div className="absolute top-1/2 left-6 md:left-12 w-[82%] md:w-[48%] -translate-y-1/2">
            {LINES.map((line, i) => (
              <p
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className="absolute left-0 w-full text-display text-bone text-contour leading-[1.08] tracking-[-0.02em] origin-left"
                style={{
                  fontSize: "clamp(2rem, 3.6vw, 3.6rem)",
                  willChange: "opacity, transform",
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}