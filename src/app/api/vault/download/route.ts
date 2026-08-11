import { NextResponse } from "next/server";
import { resolveVaultToken } from "@/lib/access-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { VAULT_BUCKET, VAULT_SIGNED_URL_TTL } from "@/lib/vault";

/**
 * Re-validate token + path, then redirect to a short-lived signed Storage URL.
 * Never expose permanent public URLs.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = (url.searchParams.get("token") ?? "").trim();
  const path = (url.searchParams.get("path") ?? "").trim();

  if (!token || !path) {
    return NextResponse.json({ error: "missing token or path" }, { status: 400 });
  }

  if (path.includes("..") || path.startsWith("/") || path.includes("\\")) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  // Never sign token/order metadata objects as downloads
  if (path.startsWith("tokens/") || path.startsWith("orders/")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let purchase: { email: string; product: string } | null = null;
  try {
    purchase = await resolveVaultToken(token);
  } catch (err) {
    console.error("vault download lookup failed:", err);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }

  if (!purchase?.product) {
    return NextResponse.json({ error: "invalid token" }, { status: 403 });
  }

  const prefix = `${purchase.product}/`;
  if (!path.startsWith(prefix)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: signed, error: signError } = await supabase.storage
    .from(VAULT_BUCKET)
    .createSignedUrl(path, VAULT_SIGNED_URL_TTL);

  if (signError || !signed?.signedUrl) {
    console.error("vault signed url failed:", signError);
    return NextResponse.json({ error: "sign failed" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
