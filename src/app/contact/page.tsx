import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm } from "@/components/contact/inquiry-form";

export const metadata: Metadata = {
  title: "Commission a study",
  description:
    "Koboku Studio takes a limited number of mandates each year. Send a qualified brief — website, cinematic AI, or automations — and the studio replies within two working days.",
};

export default function ContactPage() {
  return (
    <main className="relative z-[2] min-h-svh flex flex-col px-6 md:px-10 pt-32 md:pt-40 pb-24 bg-marine">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <header>
          <span className="text-eyebrow text-bone/40 block mb-10">— Commission a study</span>
          <h1 className="text-display text-[clamp(2.6rem,6vw,5.6rem)] text-bone leading-[0.95] max-w-[16ch]">
            A brief is a <span className="italic">first draft</span> of trust.
          </h1>
          <p className="mt-10 text-base md:text-lg text-bone/55 leading-relaxed max-w-[52ch]">
            Tell us what you are building and what should change once it exists. We take a limited
            number of mandates each year and read everything that arrives, usually within two
            working days.
          </p>
        </header>

        <div className="mt-20 md:mt-24">
          <InquiryForm />
        </div>

        <div className="mt-24 pt-10 border-t border-bone/10 flex flex-col md:flex-row md:items-baseline md:justify-between gap-6 text-sm text-bone/40">
          <p>
            Prefer email?{" "}
            <a
              href="mailto:info@koboku.it"
              className="text-bone/70 hover:text-amber transition-colors"
            >
              info@koboku.it
            </a>
          </p>
          <a
            href="https://www.instagram.com/koboku_aistudio/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bone/70 hover:text-amber transition-colors"
          >
            Instagram — @koboku_aistudio →
          </a>
          <Link href="/" className="hover:text-bone transition-colors">
            ← Return to the studio
          </Link>
        </div>
      </div>
    </main>
  );
}
