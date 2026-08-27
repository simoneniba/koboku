import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CarouselCopyTool } from "@/components/education/carousel-copy-tool";

export const metadata: Metadata = {
  title: "Luxury Carousel Engine",
  description: "Copy the fashion-journal carousel prompt — paste it into the best AI you know.",
};

export default function LuxuryCarouselPage() {
  return (
    <main className="relative z-[2] h-svh h-dvh max-h-dvh overflow-hidden flex flex-col bg-black text-bone overscroll-none">
      <div
        className="flex-1 min-h-0 flex flex-col"
        style={{
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
          paddingRight: "max(1.25rem, env(safe-area-inset-right))",
        }}
      >
        <nav className="shrink-0 mb-3 md:mb-5 flex flex-wrap items-center gap-x-5 md:gap-x-8 gap-y-1 text-display text-[0.86rem] sm:text-[0.9rem] md:text-sm font-bold uppercase tracking-[-0.02em] text-bone/40">
          <Link
            href="/"
            className="min-h-11 inline-flex items-center hover:text-bone transition-colors touch-manipulation"
          >
            Studio
          </Link>
          <Link
            href="/education"
            className="min-h-11 inline-flex items-center hover:text-bone transition-colors touch-manipulation"
          >
            Education
          </Link>
          <span className="min-h-11 inline-flex items-center text-bone/70" aria-current="page">
            Carousel
          </span>
        </nav>

        {/* Mobile: +33% visual zoom (layout-compensated scale). Desktop unchanged. */}
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
          <div
            className="
              flex h-full w-full flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4
              max-md:h-[calc(100%/1.33)] max-md:w-[calc(100%/1.33)] max-md:origin-center max-md:scale-[1.33]
            "
          >
            <Image
              src="/images/tools/koboku-mark.png"
              alt="Koboku"
              width={120}
              height={120}
              className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain opacity-80"
              priority
              sizes="48px"
            />

            <CarouselCopyTool />
          </div>
        </div>
      </div>
    </main>
  );
}
