import { sendAccessEmail } from "@/lib/access-email";
import { MEMBERS_TABLE } from "@/lib/members";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Platform: Gumroad Ping (D-1).
 * No Stripe/Gumroad code existed in the repo — Gumroad is the enabled path.
 * Do not enable Stripe live alongside this. Stripe variant left below as comments (D-2).
 *
 * Public URL to paste into Gumroad → Settings → Advanced → Ping:
 *   https://koboku.it/api/purchase?token=YOUR_WEBHOOK_SECRET
 */

const GUMROAD_SELLER_ID = process.env.GUMROAD_SELLER_ID ?? "";
const ALLOWED_PRODUCTS = (process.env.GUMROAD_PRODUCT_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "";

export async function POST(req: Request) {
  const url = new URL(req.url);
  if (!WEBHOOK_SECRET || url.searchParams.get("token") !== WEBHOOK_SECRET) {
    return new Response("ok", { status: 200 }); // give nothing away
  }

  const p = Object.fromEntries((await req.formData()).entries()) as Record<string, string>;
  // Temporary — remove after first successful Gumroad connection
  console.log("gumroad ping:", JSON.stringify(p));

  // During first connect, GUMROAD_SELLER_ID may be empty — accept and log seller_id so we can save it.
  if (!GUMROAD_SELLER_ID && p.seller_id) {
    console.warn("GUMROAD_SELLER_ID missing — ping seller_id=", p.seller_id);
  }
  const sellerOk = !GUMROAD_SELLER_ID || p.seller_id === GUMROAD_SELLER_ID;
  // Gumroad may send permalink as short id ("omgiye") OR full URL (.../l/omgiye).
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

  // Buying your own product sets test=true. Allow only when explicitly enabled (setup/testing).
  const allowTest = process.env.GUMROAD_ALLOW_TEST_PURCHASES === "true";
  if (p.test === "true" && !allowTest) return new Response("test ok", { status: 200 });
  if (p.resource_name === "refund" || p.refunded === "true" || p.disputed === "true") {
    return new Response("not a completed sale", { status: 200 });
  }

  const email = (p.email ?? "").trim().toLowerCase();
  if (!email) return new Response("no email", { status: 200 });

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from(MEMBERS_TABLE).upsert(
      {
        email,
        product: p.product_permalink ?? p.product_id ?? "unknown",
        status: "active",
        source: "gumroad",
        order_id: p.sale_id ?? p.order_number ?? null,
      },
      { onConflict: "email" },
    );
    if (error) throw error;

    await sendAccessEmail(email);
    return new Response("granted", { status: 200 });
  } catch (err) {
    console.error("purchase webhook failed:", err);
    return new Response("error", { status: 500 });
  }
}

/*
 * ── D-2. Stripe verification (NOT enabled) ───────────────────────────────
 *
 * import Stripe from "stripe";
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *
 * export async function POST(req: Request) {
 *   const body = await req.text();
 *   const sig = req.headers.get("stripe-signature")!;
 *   let event: Stripe.Event;
 *   try {
 *     event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
 *   } catch {
 *     return new Response("bad signature", { status: 400 });
 *   }
 *   if (event.type !== "checkout.session.completed")
 *     return new Response("ignored", { status: 200 });
 *
 *   const session = event.data.object as Stripe.Checkout.Session;
 *   const email = (session.customer_details?.email ?? "").trim().toLowerCase();
 *   if (!email) return new Response("no email", { status: 200 });
 *
 *   // then the SAME upsert + sendAccessEmail as above, with source: "stripe"
 * }
 */
