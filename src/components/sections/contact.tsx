"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";

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
          — Commission a study / 06
        </motion.span>

        <motion.h2
          className="text-display text-[clamp(3rem,8vw,8rem)] text-bone leading-[0.92] max-w-[14ch]"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Have a brief{" "}
          <span className="italic">worth carving?</span>
        </motion.h2>

        <motion.div
          className="mt-14"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1.4, delay: 0.5 }}
        >
          <a
            href="mailto:info@koboku.it"
            className="text-display text-[clamp(1.2rem,2.5vw,2rem)] text-bone/70 hover:text-bone transition-colors pointer-events-auto"
          >
            info@koboku.it
          </a>
          <p className="mt-4 text-sm text-bone/40 max-w-[36ch] leading-relaxed">
            We take a limited number of mandates each year. Introductions are
            welcome; cold briefs are read with equal attention.
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
