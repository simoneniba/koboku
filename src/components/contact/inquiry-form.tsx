"use client";

import { useState } from "react";

/**
 * Lead-qualification inquiry form. Submits to Web3Forms (free tier), which
 * forwards a structured, pre-qualified brief to the studio inbox.
 *
 * Setup: create the access key at https://web3forms.com (tied to the
 * receiving email) and set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY in .env.local
 * and in Vercel → Project → Settings → Environment Variables.
 *
 * Graceful degradation: if the key is missing, the form falls back to a
 * pre-filled mailto so no lead is ever lost.
 */

const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
const FALLBACK_EMAIL = "info@koboku.it";

const INTERESTS = ["Website", "Cinematic AI", "Automations"] as const;
const VERTICALS = [
  "Yachting",
  "Hospitality",
  "Expert practice (law, tax, clinic…)",
  "Finance / by referral",
  "Other",
] as const;
const BUDGETS = ["Under €4k", "€4k – €10k", "€10k – €25k", "€25k+"] as const;
const TIMELINES = [
  "As soon as possible",
  "Within 1–2 months",
  "This quarter",
  "Exploring for later",
] as const;

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "w-full bg-transparent border-b border-bone/20 focus:border-amber outline-none py-3 text-bone placeholder:text-bone/30 transition-colors";
const label = "text-eyebrow text-bone/40 block mb-3";

export function InquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — bots fill it, humans never see it.
    if (data.get("botcheck")) return;

    const name = String(data.get("name") ?? "");
    const company = String(data.get("company") ?? "");
    const email = String(data.get("email") ?? "");
    const vertical = String(data.get("vertical") ?? "");
    const budget = String(data.get("budget") ?? "");
    const timeline = String(data.get("timeline") ?? "");
    const message = String(data.get("message") ?? "");
    const interestLine = interests.join(", ") || "Not specified";

    const structured = [
      `Name: ${name}`,
      `Company: ${company || "—"}`,
      `Email: ${email}`,
      `Interested in: ${interestLine}`,
      `Industry: ${vertical}`,
      `Budget: ${budget}`,
      `Timeline: ${timeline}`,
      "",
      "Brief:",
      message,
    ].join("\n");

    if (!ACCESS_KEY) {
      // No key configured yet — hand off to email with the full brief.
      const subject = encodeURIComponent(`Inquiry — ${interestLine} — ${name}`);
      const body = encodeURIComponent(structured);
      window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `Koboku inquiry — ${interestLine} — ${name}`,
          from_name: "koboku.it inquiry form",
          name,
          email,
          company,
          interested_in: interestLine,
          industry: vertical,
          budget,
          timeline,
          message: structured,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("sent");
        form.reset();
        setInterests([]);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="py-16">
        <p className="text-display text-[clamp(1.6rem,3vw,2.6rem)] text-bone leading-tight">
          Received. <span className="italic">Thank you.</span>
        </p>
        <p className="mt-6 text-sm text-bone/50 max-w-[44ch] leading-relaxed">
          Your brief is with the studio. We read everything that arrives, usually within two working
          days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
      {/* Honeypot */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <span className={label}>Name</span>
        <input name="name" required autoComplete="name" placeholder="Your name" className={field} />
      </div>

      <div>
        <span className={label}>Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className={field}
        />
      </div>

      <div className="md:col-span-2">
        <span className={label}>Company or project</span>
        <input name="company" placeholder="Optional" className={field} />
      </div>

      <fieldset className="md:col-span-2">
        <legend className={label}>Interested in</legend>
        <div className="flex flex-wrap gap-3">
          {INTERESTS.map((item) => {
            const active = interests.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                aria-pressed={active}
                className={`px-5 py-2.5 border text-sm transition-colors ${
                  active
                    ? "border-amber text-bone bg-amber/15"
                    : "border-bone/20 text-bone/60 hover:border-bone/40"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <span className={label}>Industry</span>
        <select name="vertical" required defaultValue="" className={`${field} appearance-none`}>
          <option value="" disabled>
            Select…
          </option>
          {VERTICALS.map((v) => (
            <option key={v} value={v} className="bg-marine">
              {v}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={label}>Budget</span>
        <select name="budget" required defaultValue="" className={`${field} appearance-none`}>
          <option value="" disabled>
            Select…
          </option>
          {BUDGETS.map((b) => (
            <option key={b} value={b} className="bg-marine">
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <span className={label}>Timeline</span>
        <select name="timeline" required defaultValue="" className={`${field} appearance-none`}>
          <option value="" disabled>
            Select…
          </option>
          {TIMELINES.map((t) => (
            <option key={t} value={t} className="bg-marine">
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <span className={label}>The brief</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="What are you building, for whom, and what should change once it exists?"
          className={`${field} resize-none`}
        />
      </div>

      <div className="md:col-span-2 flex items-center gap-8">
        <button
          type="submit"
          disabled={status === "sending"}
          className="text-display text-[clamp(1.2rem,2.2vw,1.8rem)] text-bone border-b border-bone/40 hover:border-amber hover:text-amber transition-colors pb-1 disabled:opacity-40"
        >
          {status === "sending" ? "Sending…" : "Send the brief →"}
        </button>
        {status === "error" && (
          <p className="text-sm text-amber">
            Something failed — write to{" "}
            <a href={`mailto:${FALLBACK_EMAIL}`} className="underline">
              {FALLBACK_EMAIL}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
