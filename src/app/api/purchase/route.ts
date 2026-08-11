import { grantPurchase, sendVaultAccessEmail } from "@/lib/access-email";
import { DEFAULT_VAULT_TIER } from "@/lib/vault";

/*
 * Platform: Gumroad Ping (D-1).
 * Public URL: https://koboku.it/api/purchase?token=YOUR_WEBHOOK_SECRET
 */

const GUMROAD_SELLER_ID = process.env.GUMROAD_SELLER_ID ?? "";
const ALLOWED_PRODUCTS = (process.env.GUMROAD_PRODUCT_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "";

function resolveTier(p: Record<string, string>) {
  const candidates = [
    p.short_product_id,
    p.permalink,
    p.product_permalink,
    p.product_id,
  ].filter(Boolean);

  for (const allowed of ALLOWED_PRODUCTS) {
    for (const value of candidates) {
      if (
        value === allowed ||
        value.endsWith(`/l/${allowed}`) ||
        value.includes(`/l/${allowed}?`) ||
        value.includes(`/l/${allowed}/`)
      ) {
        return allowed;
      }
    }
  }

  return DEFAULT_VAULT_TIER;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  if (!WEBHOOK_SECRET || url.searchParams.get("token") !== WEBHOOK_SECRET) {
    return new Response("ok", { status: 200 });
  }

  const p = Object.fromEntries((await req.formData()).entries()) as Record<string, string>;

  if (!GUMROAD_SELLER_ID && p.seller_id) {
    console.warn("GUMROAD_SELLER_ID missing — ping seller_id=", p.seller_id);
  }
  const sellerOk = !GUMROAD_SELLER_ID || p.seller_id === GUMROAD_SELLER_ID;

  const productCandidates = [
    p.product_id,
    p.product_permalink,
    p.permalink,
    p.short_product_id,
  ].filter(Boolean);
  const productOk =
    ALLOWED_PRODUCTS.length === 0 ||
    productCandidates.some(
      (value) =>
        ALLOWED_PRODUCTS.includes(value) ||
        ALLOWED_PRODUCTS.some(
          (allowed) =>
            value === allowed ||
            value.endsWith(`/l/${allowed}`) ||
            value.includes(`/l/${allowed}?`) ||
            value.includes(`/l/${allowed}/`),
        ),
    );
  if (!sellerOk || !productOk) return new Response("ignored", { status: 200 });

  const allowTest = process.env.GUMROAD_ALLOW_TEST_PURCHASES === "true";
  if (p.test === "true" && !allowTest) return new Response("test ok", { status: 200 });
  if (p.resource_name === "refund" || p.refunded === "true" || p.disputed === "true") {
    return new Response("not a completed sale", { status: 200 });
  }

  const email = (p.email ?? "").trim().toLowerCase();
  if (!email) return new Response("no email", { status: 200 });

  try {
    const tier = resolveTier(p);
    const orderId = p.sale_id ?? p.order_number ?? null;
    const { accessToken, created } = await grantPurchase({ email, tier, orderId });

    // Always send on first create; on Gumroad retries with same order_id, skip duplicate email.
    if (created) {
      await sendVaultAccessEmail(email, accessToken);
    }

    return new Response("granted", { status: 200 });
  } catch (err) {
    console.error("purchase webhook failed:", err);
    return new Response("error", { status: 500 });
  }
}
