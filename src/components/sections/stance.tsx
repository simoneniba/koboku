"use client";

import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

interface Tenet {
  numeral: "I" | "II" | "III";
  claim: string;
  body: string;
}

const tenets: Tenet[] = [
  {
    numeral: "I",
    claim: "By appointment.",
    body: "We take a small number of mandates each year. The work is built for the client across the table, not for a portfolio.",
  },
  {
    numeral: "II",
    claim: "One studio, one voice.",
    body: "No account managers, no offshoring, no junior pass. The person who hears the brief is the person who carves it.",
  },
  {
    numeral: "III",
    claim: "Slow, on purpose.",
    body: "A vessel is finished before the world is allowed to photograph it. We work the way Italian ateliers have always worked.",
  },
];

export function Stance() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <section
      ref={ref}
      id="stance"
      className="relative min-h-svh px-6 md:px-10 py-32 md:py-48"
    >
      <div className="max-w-5xl mx-auto">
        <motion.span
          className="text-eyebrow text-bone/40 block mb-16"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1.2 }}
        >
          — How we keep faith / 05
        </motion.span>

        <motion.h2
          className="text-display text-[clamp(2.2rem,5vw,4.6rem)] text-bone leading-[0.95] max-w-[18ch] mb-24 md:mb-32"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          A studio is a <span className="italic">promise</span> kept three ways.
        </motion.h2>

        <div className="border-t border-bone/10">
          {tenets.map((t, i) => (
            <motion.div
              key={t.numeral}
              className="grid grid-cols-12 items-baseline gap-x-6 md:gap-x-10 py-12 md:py-16 border-b border-bone/10"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 1.4,
                delay: 0.3 + i * 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="col-span-2 md:col-span-1 text-eyebrow text-amber tabular-nums">
                {t.numeral}.
              </span>
              <h3 className="col-span-10 md:col-span-5 text-display text-[clamp(1.4rem,2.8vw,2.4rem)] text-bone leading-[1.05]">
                {t.claim}
              </h3>
              <p className="col-span-12 md:col-span-6 mt-4 md:mt-0 text-sm md:text-base text-bone/55 leading-relaxed max-w-[44ch]">
                {t.body}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-24 md:mt-32"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/contact"
            className="group inline-flex items-baseline gap-4 text-display text-[clamp(1.4rem,2.4vw,2rem)] text-bone hover:text-amber transition-colors duration-500 pointer-events-auto border-b border-bone/30 hover:border-amber pb-2"
          >
            <span>Begin a conversation</span>
            <span className="text-eyebrow text-bone/50 group-hover:text-amber transition-all duration-500">
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
