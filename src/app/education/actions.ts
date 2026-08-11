"use server";

import { redirect } from "next/navigation";
import { sendAccessEmail } from "@/lib/access-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

export type MagicLinkState = {
  ok: boolean;
  message: string;
};

/** Request a magic link. Always returns a bland success to avoid account enumeration. */
export async function requestEducationMagicLink(
  _prev: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const bland: MagicLinkState = {
    ok: true,
    message: "If that email has access, a login link is on its way.",
  };

  if (!email || !email.includes("@")) {
    return { ok: false, message: "Enter the email you purchased with." };
  }

  try {
    const admin = createAdminClient();
    const { data: member } = await admin
      .from("members")
      .select("email")
      .eq("email", email)
      .eq("status", "active")
      .maybeSingle();

    if (member) {
      await sendAccessEmail(email);
    }
  } catch (err) {
    console.error("education magic link failed:", err);
    return {
      ok: false,
      message: "Could not send the link right now. Try again in a moment.",
    };
  }

  return bland;
}

export async function signOutFromEducation() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/education");
}
