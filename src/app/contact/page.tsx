import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Write to the studio",
  description:
    "Koboku Studio takes a limited number of mandates each year. Write directly to info@koboku.it to begin a conversation.",
};

export default function ContactPage() {
  return (
    <main className="relative z-[2] min-h-svh flex flex-col px-6 md:px-10 pt-32 md:pt-40 pb-24">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-between">
        <header>
          <span className="text-eyebrow text-bone/40 block mb-10">
            — Begin a conversation
          </span>
          <h1 className="text-display text-[clamp(2.6rem,6vw,5.6rem)] text-bone leading-[0.95] max-w-[16ch]">
            A brief is a <span className="italic">first draft</span> of trust.
          </h1>
          <p className="mt-10 text-base md:text-lg text-bone/55 leading-relaxed max-w-[52ch]">
            Write to the studio. We take a limited number of mandates each year and read everything that arrives, usually within two working days. Introductions are welcome; cold briefs are read with equal attention.
          </p>
        </header>

        <div className="mt-24 md:mt-32">
          <a
            href="mailto:info@koboku.it?subject=A%20brief%20for%20Koboku%20Studio"
            className="group inline-flex items-baseline gap-5 text-display text-[clamp(2rem,5vw,4.4rem)] text-bone hover:text-amber transition-colors duration-500 border-b border-bone/30 hover:border-amber pb-3 leading-[1.05]"
          >
            <span>Write to the studio</span>
            <span className="text-eyebrow text-bone/50 group-hover:text-amber transition-colors duration-500">
              →
            </span>
          </a>
          <p className="mt-8 text-sm text-bone/40 leading-relaxed max-w-[42ch]">
            Or copy the address directly:{" "}
            <a
              href="mailto:info@koboku.it"
              className="text-bone/70 hover:text-amber transition-colors"
            >
              info@koboku.it
            </a>
          </p>
        </div>

        <nav className="mt-24 text-eyebrow text-bone/30">
          <Link
            href="/"
            className="hover:text-bone transition-colors duration-500"
          >
            ← Return to the studio
          </Link>
        </nav>
      </div>
    </main>
  );
}
