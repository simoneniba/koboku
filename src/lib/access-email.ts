import { createHash, randomBytes } from "crypto";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_VAULT_TIER, PURCHASES_TABLE, VAULT_BUCKET } from "@/lib/vault";

function siteUrl() {
  return (process.env.SITE_URL ?? "https://koboku.it").replace(/\/$/, "");
}

export function createAccessToken() {
  return randomBytes(32).toString("hex");
}

function orderKey(orderId: string) {
  return createHash("sha256").update(orderId).digest("hex");
}

type TokenRecord = {
  email: string;
  product: string;
  order_id: string | null;
};

async function readJson<T>(path: string): Promise<T | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(VAULT_BUCKET).download(path);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text()) as T;
  } catch {
    return null;
  }
}

async function writeJson(path: string, value: unknown) {
  const supabase = createAdminClient();
  const body = JSON.stringify(value);
  const { error } = await supabase.storage.from(VAULT_BUCKET).upload(path, body, {
    contentType: "application/json",
    upsert: true,
  });
  if (error) throw error;
}

export type GrantPurchaseInput = {
  email: string;
  tier?: string;
  orderId?: string | null;
};

export type GrantPurchaseResult = {
  accessToken: string;
  created: boolean;
};

/**
 * Upsert into NEW AI MAFIA MEMBERS and mint a vault access token
 * stored privately in Storage (tokens/{token}.json). Idempotent on order_id.
 */
export async function grantPurchase({
  email,
  tier = DEFAULT_VAULT_TIER,
  orderId = null,
}: GrantPurchaseInput): Promise<GrantPurchaseResult> {
  const supabase = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  if (orderId) {
    const existing = await readJson<{ token: string }>(`orders/${orderKey(orderId)}.json`);
    if (existing?.token) {
      await supabase.from(PURCHASES_TABLE).upsert(
        {
          email: normalizedEmail,
          product: tier,
          status: "active",
          source: "gumroad",
          order_id: orderId,
        },
        { onConflict: "email" },
      );
      return { accessToken: existing.token, created: false };
    }
  }

  const accessToken = createAccessToken();
  const record: TokenRecord = {
    email: normalizedEmail,
    product: tier,
    order_id: orderId,
  };

  const { error: memberErr } = await supabase.from(PURCHASES_TABLE).upsert(
    {
      email: normalizedEmail,
      product: tier,
      status: "active",
      source: "gumroad",
      order_id: orderId,
    },
    { onConflict: "email" },
  );
  if (memberErr) throw memberErr;

  await writeJson(`tokens/${accessToken}.json`, record);
  if (orderId) {
    await writeJson(`orders/${orderKey(orderId)}.json`, { token: accessToken });
  }

  return { accessToken, created: true };
}

/** Resolve a vault token → active member + product tier. */
export async function resolveVaultToken(token: string) {
  const record = await readJson<TokenRecord>(`tokens/${token}.json`);
  if (!record?.email) return null;

  const supabase = createAdminClient();
  const { data: member, error } = await supabase
    .from(PURCHASES_TABLE)
    .select("email, product, status")
    .eq("email", record.email)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!member) return null;

  return {
    email: member.email as string,
    product: (member.product as string) || record.product || DEFAULT_VAULT_TIER,
  };
}

/** Email the buyer their unique vault link (token is the key — no login). */
export async function sendVaultAccessEmail(email: string, accessToken: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL ?? "access@koboku.it";
  if (!resendKey) throw new Error("Missing RESEND_API_KEY");

  const link = `${siteUrl()}/vault?token=${encodeURIComponent(accessToken)}`;
  const resend = new Resend(resendKey);
  const { error: sendError } = await resend.emails.send({
    from: `koboku <${from}>`,
    to: email,
    subject: "Your access is ready",
    html: `<p>Payment confirmed — you're in.</p>
           <p><a href="${link}">Open your vault →</a></p>
           <p>Bookmark this link. It is your access key — no password needed.</p>`,
  });
  if (sendError) throw sendError;
}

export async function sendAccessEmail(email: string) {
  const { accessToken } = await grantPurchase({ email });
  await sendVaultAccessEmail(email, accessToken);
}
