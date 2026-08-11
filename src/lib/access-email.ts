import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

function siteUrl() {
  return (process.env.SITE_URL ?? "https://koboku.it").replace(/\/$/, "");
}

/**
 * Ensure an auth user exists, mint a magic-link token, and email it via Resend.
 * Uses /auth/confirm?token_hash=… so App Router cookie sessions are set correctly
 * (preferred over the hosted action_link for SSR).
 */
export async function sendAccessEmail(email: string) {
  const supabase = createAdminClient();
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL ?? "access@koboku.it";

  if (!resendKey) throw new Error("Missing RESEND_API_KEY");

  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (
    createError &&
    !/already|exists|registered/i.test(createError.message) &&
    createError.code !== "email_exists"
  ) {
    throw createError;
  }

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error) throw error;

  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) throw new Error("generateLink returned no hashed_token");

  const link = `${siteUrl()}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&next=${encodeURIComponent("/education")}`;

  const resend = new Resend(resendKey);
  const { error: sendError } = await resend.emails.send({
    from: `koboku <${from}>`,
    to: email,
    subject: "Your access is ready",
    html: `<p>Payment confirmed — you're in.</p>
           <p><a href="${link}">Enter the Education area →</a></p>
           <p>This link logs you in automatically. See you inside.</p>`,
  });
  if (sendError) throw sendError;
}
