"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { VokuWheel } from "@/components/wheel/VokuWheel";
import { cinema, portfolioItemCount, reels, sites } from "@/data/portfolio";

export function Work() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section ref={ref} id="work" className="relative min-h-svh px-6 md:px-10 py-32">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1.2 }}
        >
          <span className="text-eyebrow text-bone/40 block">— Selected work / 04</span>
          <span className="text-eyebrow text-bone/30 block mt-2">
            {portfolioItemCount} studies
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <VokuWheel variant="cinema" ratio="16:9" label="Cinema" items={cinema} />
          <VokuWheel variant="reels" ratio="9:16" label="Reels" items={reels} />
          <VokuWheel variant="sites" ratio="16:9" label="Sites" chrome items={sites} />
        </motion.div>
      </div>
    </section>
  );
}
