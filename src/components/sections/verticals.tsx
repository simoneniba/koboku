"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const verticals = [
  {
    name: "Yachting",
    note: "Quiet luxury",
    website: "Flagship build · 3D & interactive",
    cinematicAI: "3D · social · film — perceived value is the sale",
    automation: "Charter & enquiry qualification agent",
  },
  {
    name: "Hospitality",
    note: "Sensory luxury",
    website: "Flagship build · cinematic imagery",
    cinematicAI: "Video · social · stills — first taste of the stay",
    automation: "Direct-booking agent · concierge agents",
  },
  {
    name: "Expert Practices",
    note: "Personal authority",
    website: "Positioning · authority architecture",
    cinematicAI: "Social · proof — expertise obvious at the decision",
    automation: "Intake agent · call booking agent",
  },
  {
    name: "By Referral",
    note: "Institutional discretion",
    website: "Positioning · flagship · authority",
    cinematicAI: "Social · portals · permanence over polish",
    automation: "Intake agents · systems agent",
  },
];

type Vertical = (typeof verticals)[number];

const CUBE_SIZE = "min(88vw, 420px)";
const HOLD = 0.25;

function VerticalFace({ v }: { v: Vertical }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-5 md:p-8">
      <header className="pb-4 shrink-0">
        <h2 className="text-display text-[clamp(1.15rem,2.4vw,1.55rem)] md:text-[clamp(1.35rem,2.8vw,1.85rem)] text-bone leading-none">
          {v.name}
        </h2>
        <span className="text-eyebrow text-bone/30 block mt-2 text-xs md:text-sm">{v.note}</span>
      </header>

      <dl className="flex-1 flex flex-col mt-4 min-h-0 text-sm md:text-base leading-snug">
        <div className="space-y-2 md:space-y-3 min-h-0">
          <div>
            <dt className="text-eyebrow text-bone/35 mb-1 text-xs md:text-sm">Website</dt>
            <dd className="text-bone/65">{v.website}</dd>
          </div>
          <div>
            <dt className="text-eyebrow text-bone/35 mb-1 text-xs md:text-sm">Cinematic AI</dt>
            <dd className="text-bone/65">{v.cinematicAI}</dd>
          </div>
          <div>
            <dt className="text-eyebrow text-bone/35 mb-1 text-xs md:text-sm">Automation</dt>
            <dd className="text-bone/65">{v.automation}</dd>
          </div>
        </div>
      </dl>
    </div>
  );
}

export function Verticals() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current || !cubeRef.current) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=320%",
          pin: pinRef.current,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(cubeRef.current, { rotateX: 90, duration: 1, ease: "power1.inOut" })
        .to(cubeRef.current, { rotateX: 90, duration: HOLD })
        .to(cubeRef.current, { rotateX: 180, duration: 1, ease: "power1.inOut" })
        .to(cubeRef.current, { rotateX: 180, duration: HOLD })
        .to(cubeRef.current, { rotateX: 270, duration: 1, ease: "power1.inOut" });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="verticals" className="relative">
      <div ref={pinRef} className="relative h-svh overflow-hidden">
        <div className="flex h-full items-center justify-center [perspective:1200px] motion-reduce:hidden">
          <div
            ref={cubeRef}
            className="relative preserve-3d"
            style={{
              width: CUBE_SIZE,
              height: CUBE_SIZE,
              transformOrigin: "center center",
            }}
          >
            {verticals.map((v, i) => (
              <div
                key={v.name}
                className="absolute inset-0 backface-hidden overflow-hidden bg-marine/90"
                style={{
                  transform: `rotateX(${-i * 90}deg) translateZ(calc(${CUBE_SIZE} / 2))`,
                }}
              >
                <VerticalFace v={v} />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden h-full flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-16 motion-reduce:flex">
          {verticals.map((v) => (
            <div key={v.name} className="w-full max-w-md bg-marine/90">
              <VerticalFace v={v} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
