"use client";

import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const SOCIAL = [
  {
    label: "Email",
    value: "info@koboku.it",
    href: "mailto:info@koboku.it",
    external: false,
  },
  {
    label: "Instagram",
    value: "@koboku_aistudio",
    href: "https://www.instagram.com/koboku_aistudio/",
    external: true,
  },
] as const;

function CommissionStudyCard() {
  return (
    <Link
      href="/contact"
      className="group relative flex min-h-[4.75rem] items-center justify-between gap-6 overflow-hidden rounded-sm border border-bone/15 bg-marine/55 px-5 py-5 backdrop-blur-md transition-[border-color,background-color,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-amber/45 hover:bg-marine/70 active:scale-[0.995] md:min-h-[5.5rem] md:px-7 md:py-6 pointer-events-auto outline-none focus-visible:ring-1 focus-visible:ring-amber/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
      aria-label="Commission a study — open the inquiry form"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber/[0.06] via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
      />
      <span className="relative">
        <span className="text-eyebrow mb-2 block text-bone/45">Primary action</span>
        <span className="text-display block text-[clamp(1.5rem,3.2vw,2.35rem)] leading-[0.95] text-bone transition-colors duration-700 group-hover:text-amber group-focus-visible:text-amber">
          Commission a study
        </span>
      </span>
      <span
        aria-hidden
        className="relative shrink-0 text-eyebrow text-bone/35 transition-[color,transform] duration-700 group-hover:translate-x-1 group-hover:text-amber group-focus-visible:translate-x-1 group-focus-visible:text-amber"
      >
        →
      </span>
    </Link>
  );
}

function SocialLink({
  label,
  value,
  href,
  external,
  delay,
  inView,
}: {
  label: string;
  value: string;
  href: string;
  external: boolean;
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex min-h-[3.25rem] items-center justify-between gap-4 rounded-sm border border-bone/10 bg-marine/30 px-5 py-4 backdrop-blur-sm transition-[border-color,background-color] duration-500 hover:border-bone/25 hover:bg-marine/45 active:scale-[0.995] md:min-h-[3.5rem] pointer-events-auto outline-none focus-visible:ring-1 focus-visible:ring-amber/40"
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.2, delay, ease: EASE }}
    >
      <span>
        <span className="text-eyebrow mb-1 block text-bone/40">{label}</span>
        <span className="text-sm md:text-[0.95rem] text-bone/75 transition-colors duration-500 group-hover:text-bone">
          {value}
        </span>
      </span>
      <span
        aria-hidden
        className="text-eyebrow text-bone/30 transition-[color,transform] duration-500 group-hover:translate-x-0.5 group-hover:text-bone/60"
      >
        →
      </span>
    </motion.a>
  );
}

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  return (
    <section
      ref={ref}
      id="contact"
      className="relative flex min-h-svh flex-col px-6 pb-10 pt-28 md:px-10 md:pt-32"
    >
      <div className="flex-1 min-h-[4vh] md:min-h-[6vh]" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.6, ease: EASE }}
          >
            <span className="text-eyebrow mb-8 block text-bone/40 md:mb-10">
              — Commission a study / 05
            </span>

            <div className="-mx-1 rounded-sm bg-marble/92 px-4 py-5 md:-mx-2 md:px-6 md:py-7">
              <h2 className="text-display max-w-[12ch] text-[clamp(2.4rem,7.5vw,7rem)] leading-[0.92] text-marine">
                Have a brief <span className="italic">worth carving?</span>
              </h2>
            </div>

            <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-bone/45 md:mt-8 md:text-[0.95rem]">
              We take a limited number of mandates each year. Introductions are welcome; cold briefs
              are read with equal attention.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
          >
            <CommissionStudyCard />

            <div className="mt-1 flex flex-col gap-2">
              {SOCIAL.map((item, i) => (
                <SocialLink key={item.label} {...item} delay={0.35 + i * 0.08} inView={inView} />
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 text-eyebrow text-bone/25 md:mt-20"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1.4, delay: 0.7 }}
        >
          <span className="block">© Koboku Studio · MMXXVI · Brescia</span>
          <span className="mt-1 block">Est. 2026</span>
        </motion.div>
      </div>
    </section>
  );
}
