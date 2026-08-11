import type { Metadata } from "next";
import Link from "next/link";
import { EducationLoginForm } from "@/components/education/login-form";
import { EducationVault } from "@/components/education/vault";
import { signOutFromEducation } from "@/app/education/actions";
import { MEMBERS_TABLE } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Education",
  description: "Members area — workshops, lectures, and learning programs from Koboku Studio.",
};

export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
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
        {children}
      </div>
    </main>
  );
}

export default async function EducationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const linkError = params.error === "invalid_link";

  let userEmail: string | null = null;
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email?.toLowerCase() ?? null;
  } catch {
    // Missing public Supabase env — treat as logged out so the page still renders.
  }

  if (!userEmail) {
    return (
      <Shell>
        <header>
          <span className="text-eyebrow text-bone/40 block mb-10">— Education</span>
          <h1 className="text-display text-[clamp(2.6rem,6vw,5.6rem)] text-bone leading-[0.95] max-w-[14ch]">
            Log in with the email you <span className="italic">purchased</span> with.
          </h1>
          <p className="mt-10 text-base md:text-lg text-bone/55 leading-relaxed max-w-[52ch]">
            After checkout you receive a one-click access link. Use the same address here anytime you
            need a fresh login — no password.
          </p>
          {linkError ? (
            <p className="mt-6 text-sm text-amber" role="alert">
              That login link is invalid or expired. Request a new one below.
            </p>
          ) : null}
        </header>
        <EducationLoginForm />
        <div className="mt-24 pt-10 border-t border-bone/10 text-sm text-bone/40">
          <Link href="/" className="hover:text-bone transition-colors">
            ← Return to the studio
          </Link>
        </div>
      </Shell>
    );
  }

  let isMember = false;
  try {
    const admin = createAdminClient();
    const { data: member } = await admin
      .from(MEMBERS_TABLE)
      .select("email")
      .eq("email", userEmail)
      .eq("status", "active")
      .maybeSingle();
    isMember = Boolean(member);
  } catch (err) {
    console.error("education membership lookup failed:", err);
  }

  if (!isMember) {
    return (
      <Shell>
        <header>
          <span className="text-eyebrow text-bone/40 block mb-10">— Education</span>
          <h1 className="text-display text-[clamp(2.6rem,6vw,5.6rem)] text-bone leading-[0.95] max-w-[16ch]">
            This email doesn&apos;t have access <span className="italic">yet</span>.
          </h1>
          <p className="mt-10 text-base md:text-lg text-bone/55 leading-relaxed max-w-[52ch]">
            You&apos;re signed in as {userEmail}. Check the address you bought with, or contact{" "}
            <a href="mailto:info@koboku.it" className="text-bone/70 hover:text-amber transition-colors">
              info@koboku.it
            </a>
            .
          </p>
        </header>
        <div className="mt-24 pt-10 border-t border-bone/10 text-sm text-bone/40 flex flex-wrap gap-6">
          <form action={signOutFromEducation}>
            <button type="submit" className="hover:text-bone transition-colors">
              Try a different email
            </button>
          </form>
          <Link href="/" className="hover:text-bone transition-colors">
            ← Return to the studio
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <EducationVault email={userEmail} />
    </Shell>
  );
}
