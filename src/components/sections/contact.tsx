"use client";

import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

function CommissionStudyLink() {
  return (
    <Link
      href="/contact"
      className="group relative inline-flex items-baseline gap-5 md:gap-6 pointer-events-auto outline-none focus-visible:ring-1 focus-visible:ring-amber/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-sm"
      aria-label="Commission a study — open the inquiry form"
    >
      <span className="relative pb-2 text-display text-[clamp(1.6rem,3.4vw,3rem)] text-bone transition-colors duration-700 ease-out group-hover:text-amber group-focus-visible:text-amber">
        Commission a study
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-[0.12] bg-bone/25 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-hover:bg-amber group-focus-visible:scale-x-100 group-focus-visible:bg-amber"
        />
      </span>
      <span className="text-eyebrow text-bone/40 transition-[color,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 group-hover:text-amber group-focus-visible:translate-x-1.5 group-focus-visible:text-amber group-active:translate-x-0.5 group-active:scale-95">
        →
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-sm opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-bone/[0.03]"
      />
    </Link>
  );
}

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section
      ref={ref}
      id="contact"
      className="relative min-h-svh flex flex-col justify-between px-6 md:px-10 pt-32 pb-10"
    >
      <div>
        <motion.span
          className="text-eyebrow text-bone/40 block mb-10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1.2 }}
        >
          — Commission a study / 05
        </motion.span>

        <motion.h2
          className="text-display text-[clamp(3rem,8vw,8rem)] text-bone leading-[0.92] max-w-[14ch]"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.8, delay: 0.1, ease: EASE }}
        >
          Have a brief <span className="italic">worth carving?</span>
        </motion.h2>

        <motion.div
          className="mt-14"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, delay: 0.45, ease: EASE }}
        >
          <CommissionStudyLink />
          <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <a
              href="mailto:info@koboku.it"
              className="text-sm text-bone/50 hover:text-bone transition-colors pointer-events-auto"
            >
              info@koboku.it
            </a>
            <a
              href="https://www.instagram.com/koboku_aistudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-bone/50 hover:text-bone transition-colors pointer-events-auto"
            >
              Instagram — @koboku_aistudio →
            </a>
          </div>
          <p className="mt-4 text-sm text-bone/40 max-w-[36ch] leading-relaxed">
            We take a limited number of mandates each year. Introductions are welcome; cold briefs
            are read with equal attention.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="text-eyebrow text-bone/25 mt-20"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.4, delay: 0.8 }}
      >
        <span className="block">© Koboku Studio · MMXXVI · Brescia</span>
        <span className="block mt-1">Est. 2026</span>
      </motion.div>
    </section>
  );
}
