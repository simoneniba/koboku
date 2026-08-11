import { sendAccessEmail } from "@/lib/access-email";
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
  // Enable once on first deploy to confirm Gumroad field names, then remove:
  // console.log("gumroad ping:", JSON.stringify(p));

  const sellerOk = Boolean(GUMROAD_SELLER_ID) && p.seller_id === GUMROAD_SELLER_ID;
  const productOk =
    ALLOWED_PRODUCTS.length === 0 ||
    ALLOWED_PRODUCTS.includes(p.product_id) ||
    ALLOWED_PRODUCTS.includes(p.product_permalink);
  if (!sellerOk || !productOk) return new Response("ignored", { status: 200 });

  if (p.test === "true") return new Response("test ok", { status: 200 });
  if (p.refunded === "true" || p.disputed === "true") {
    return new Response("not a completed sale", { status: 200 });
  }

  const email = (p.email ?? "").trim().toLowerCase();
  if (!email) return new Response("no email", { status: 200 });

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("members").upsert(
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
