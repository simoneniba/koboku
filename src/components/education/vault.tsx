import Link from "next/link";
import { signOutFromEducation } from "@/app/education/actions";

const PROGRAMS = [
  {
    title: "Studio workshop",
    blurb: "Placeholder — a one-day intensive on craft, tooling, and process for teams.",
    meta: "1 day · On-site / remote",
  },
  {
    title: "Lecture series",
    blurb: "Placeholder — short talks on cinematic AI, web craft, and luxury digital systems.",
    meta: "45–60 min · By invitation",
  },
  {
    title: "Mentorship",
    blurb: "Placeholder — limited seats for designers and builders seeking directed feedback.",
    meta: "8 weeks · Application only",
  },
] as const;

export function EducationVault({ email }: { email: string }) {
  return (
    <>
      <header>
        <span className="text-eyebrow text-bone/40 block mb-10">— Education / members</span>
        <h1 className="text-display text-[clamp(2.6rem,6vw,5.6rem)] text-bone leading-[0.95] max-w-[14ch]">
          Learning as <span className="italic">craft</span>, not content.
        </h1>
        <p className="mt-10 text-base md:text-lg text-bone/55 leading-relaxed max-w-[52ch]">
          Placeholder vault — signed in as {email}. Replace this with real lesson library, downloads,
          and cohort materials when ready.
        </p>
      </header>

      <section className="mt-20 md:mt-28" aria-labelledby="programs-heading">
        <h2 id="programs-heading" className="text-eyebrow text-bone/40 mb-10">
          — Programs / placeholder
        </h2>
        <ul className="grid gap-8 md:gap-10">
          {PROGRAMS.map((item) => (
            <li
              key={item.title}
              className="border-t border-bone/10 pt-8 grid gap-3 md:grid-cols-12 md:gap-8"
            >
              <h3 className="text-display text-[clamp(1.5rem,3vw,2.25rem)] text-bone leading-[1.05] md:col-span-4">
                {item.title}
              </h3>
              <p className="text-sm md:text-base text-bone/55 leading-relaxed md:col-span-5">
                {item.blurb}
              </p>
              <p className="text-eyebrow text-bone/35 md:col-span-3 md:text-right">{item.meta}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-24 pt-10 border-t border-bone/10 flex flex-col md:flex-row md:items-baseline md:justify-between gap-6 text-sm text-bone/40">
        <p>Members area — placeholder content.</p>
        <div className="flex flex-wrap gap-6">
          <form action={signOutFromEducation}>
            <button type="submit" className="hover:text-bone transition-colors">
              Sign out
            </button>
          </form>
          <Link href="/" className="hover:text-bone transition-colors">
            ← Return to the studio
          </Link>
        </div>
      </div>
    </>
  );
}
