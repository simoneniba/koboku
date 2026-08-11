import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Education",
  description:
    "Workshops, lectures, and the NEW AI MAFIA vault — access arrives by email after purchase.",
};

export default function EducationPage() {
  return (
    <main className="relative z-[2] min-h-svh flex flex-col px-6 md:px-10 pt-28 md:pt-36 pb-24 bg-marine">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <nav className="mb-16 md:mb-20 flex flex-wrap items-center gap-x-8 gap-y-3 text-eyebrow text-bone/45">
          <Link href="/" className="hover:text-bone transition-colors">
            Studio
          </Link>
          <span className="text-bone" aria-current="page">
            Education
          </span>
          <Link href="/contact" className="hover:text-bone transition-colors">
            Contact
          </Link>
        </nav>

        <header>
          <span className="text-eyebrow text-bone/40 block mb-10">— Education</span>
          <h1 className="text-display text-[clamp(2.6rem,6vw,5.6rem)] text-bone leading-[0.95] max-w-[14ch]">
            Learning as <span className="italic">craft</span>, not content.
          </h1>
          <p className="mt-10 text-base md:text-lg text-bone/55 leading-relaxed max-w-[52ch]">
            After you purchase, we email you a private vault link — no password, no account. That link
            is your key to the downloads for your tier.
          </p>
        </header>

        <section className="mt-20 md:mt-28 max-w-[48ch]">
          <h2 className="text-eyebrow text-bone/40 mb-6">— Already purchased?</h2>
          <p className="text-sm md:text-base text-bone/55 leading-relaxed">
            Check the inbox you used at checkout for{" "}
            <span className="text-bone/70">Your access is ready</span> from access@koboku.it. Open the
            vault link in that email. Lost it? Write to{" "}
            <a href="mailto:info@koboku.it" className="text-bone/70 hover:text-amber transition-colors">
              info@koboku.it
            </a>
            .
          </p>
        </section>

        <div className="mt-24 pt-10 border-t border-bone/10 text-sm text-bone/40">
          <Link href="/" className="hover:text-bone transition-colors">
            ← Return to the studio
          </Link>
        </div>
      </div>
    </main>
  );
}
