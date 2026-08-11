/**
 * Migrate existing Gumroad buyer onto vault token delivery
 * using NEW AI MAFIA MEMBERS + private Storage tokens.
 */
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { createHash, randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { tmpdir } from "os";
import { join } from "path";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TABLE = "NEW AI MAFIA MEMBERS";
const BUCKET = "vault";
const BUYER_EMAIL = "lordfalco6@gmail.com";
const ORDER_ID = "5CEHrLTMJLB18_9BkAKTpg==";
const TIER = "omgiye";

function orderKey(orderId) {
  return createHash("sha256").update(orderId).digest("hex");
}

async function main() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.id === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
    if (error) throw error;
    console.log("created vault bucket");
  } else {
    await supabase.storage.updateBucket(BUCKET, { public: false });
    console.log("vault bucket ok (private)");
  }

  const { error: memberErr } = await supabase.from(TABLE).upsert(
    {
      email: BUYER_EMAIL,
      product: TIER,
      status: "active",
      source: "gumroad",
      order_id: ORDER_ID,
    },
    { onConflict: "email" },
  );
  if (memberErr) throw memberErr;
  console.log("member upserted", BUYER_EMAIL);

  const orderPath = `orders/${orderKey(ORDER_ID)}.json`;
  const { data: existingOrder } = await supabase.storage.from(BUCKET).download(orderPath);
  let accessToken;
  if (existingOrder) {
    try {
      accessToken = JSON.parse(await existingOrder.text()).token;
    } catch {
      accessToken = null;
    }
  }
  if (!accessToken) {
    accessToken = randomBytes(32).toString("hex");
    const tokenBody = JSON.stringify({
      email: BUYER_EMAIL,
      product: TIER,
      order_id: ORDER_ID,
    });
    const orderBody = JSON.stringify({ token: accessToken });
    const up1 = await supabase.storage
      .from(BUCKET)
      .upload(`tokens/${accessToken}.json`, tokenBody, {
        contentType: "application/json",
        upsert: true,
      });
    if (up1.error) throw up1.error;
    const up2 = await supabase.storage.from(BUCKET).upload(orderPath, orderBody, {
      contentType: "application/json",
      upsert: true,
    });
    if (up2.error) throw up2.error;
    console.log("minted access token");
  } else {
    console.log("reused existing order token");
  }

  const tmp = join(tmpdir(), `vault-readme-${Date.now()}.txt`);
  writeFileSync(
    tmp,
    "NEW AI MAFIA vault\n\nUpload your course zip/PDFs here in Storage → vault → omgiye/\n",
  );
  const { error: fileErr } = await supabase.storage
    .from(BUCKET)
    .upload(`${TIER}/README.txt`, readFileSync(tmp), {
      contentType: "text/plain",
      upsert: true,
    });
  unlinkSync(tmp);
  if (fileErr) console.warn("placeholder:", fileErr.message);
  else console.log("uploaded vault/omgiye/README.txt");

  const site = (env.SITE_URL || "https://koboku.it").replace(/\/$/, "");
  // Production links should use koboku.it
  const prodLink = `https://koboku.it/vault?token=${accessToken}`;
  console.log("vault link:", prodLink);
  console.log("local link:", `${site}/vault?token=${accessToken}`);

  if (process.argv.includes("--email") && env.RESEND_API_KEY) {
    const resend = new Resend(env.RESEND_API_KEY);
    const sent = await resend.emails.send({
      from: `koboku <${env.FROM_EMAIL || "access@koboku.it"}>`,
      to: BUYER_EMAIL,
      subject: "Your access is ready",
      html: `<p>Payment confirmed — you're in.</p>
             <p><a href="${prodLink}">Open your vault →</a></p>
             <p>Bookmark this link. It is your access key — no password needed.</p>`,
    });
    console.log("email", sent.data ?? sent.error);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
