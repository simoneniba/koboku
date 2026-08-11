"use client";

import { useActionState } from "react";
import {
  requestEducationMagicLink,
  type MagicLinkState,
} from "@/app/education/actions";

const initial: MagicLinkState = { ok: true, message: "" };

export function EducationLoginForm() {
  const [state, action, pending] = useActionState(requestEducationMagicLink, initial);

  return (
    <form action={action} className="mt-12 max-w-md">
      <label htmlFor="education-email" className="text-eyebrow text-bone/40 block mb-3">
        Purchase email
      </label>
      <input
        id="education-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@studio.com"
        className="w-full bg-transparent border-b border-bone/20 focus:border-amber outline-none py-3 text-bone placeholder:text-bone/30 transition-colors"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-8 inline-flex items-center gap-3 text-bone/80 hover:text-amber transition-colors disabled:opacity-50"
      >
        <span className="text-display text-[clamp(1.35rem,2.5vw,1.85rem)] leading-none">
          {pending ? "Sending…" : "Email me a login link"}
        </span>
        <span className="text-eyebrow" aria-hidden>
          →
        </span>
      </button>
      {state.message ? (
        <p
          className={`mt-6 text-sm leading-relaxed ${state.ok ? "text-bone/50" : "text-amber"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
