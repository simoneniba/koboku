import type { Metadata } from "next";
import Link from "next/link";
import { resolveVaultToken } from "@/lib/access-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { VAULT_BUCKET } from "@/lib/vault";

export const metadata: Metadata = {
  title: "Vault",
  description: "Your private download vault.",
};

export const dynamic = "force-dynamic";

type VaultFile = {
  name: string;
  path: string;
  size: number | null;
};

async function listTierFiles(tier: string): Promise<VaultFile[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(VAULT_BUCKET).list(tier, {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) {
    console.error("vault list failed:", error);
    return [];
  }

  return (data ?? [])
    .filter((item) => item.id && !item.name.endsWith("/"))
    .map((item) => ({
      name: item.name,
      path: `${tier}/${item.name}`,
      size: typeof item.metadata?.size === "number" ? item.metadata.size : null,
    }));
}

function formatBytes(n: number | null) {
  if (n == null || Number.isNaN(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative z-[2] min-h-svh flex flex-col px-6 md:px-10 pt-28 md:pt-36 pb-24 bg-marine">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <nav className="mb-16 md:mb-20 flex flex-wrap items-center gap-x-8 gap-y-3 text-eyebrow text-bone/45">
          <Link href="/" className="hover:text-bone transition-colors">
            Studio
          </Link>
          <Link href="/education" className="hover:text-bone transition-colors">
            Education
          </Link>
          <span className="text-bone" aria-current="page">
            Vault
          </span>
        </nav>
        {children}
      </div>
    </main>
  );
}

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token: rawToken } = await searchParams;
  const token = (rawToken ?? "").trim();

  if (!token) {
    return (
      <Shell>
        <header>
          <span className="text-eyebrow text-bone/40 block mb-10">— Vault</span>
          <h1 className="text-display text-[clamp(2.6rem,6vw,5.6rem)] text-bone leading-[0.95] max-w-[14ch]">
            This link isn&apos;t <span className="italic">valid</span>.
          </h1>
          <p className="mt-10 text-base md:text-lg text-bone/55 leading-relaxed max-w-[48ch]">
            Open the access link from your purchase email, or contact{" "}
            <a href="mailto:info@koboku.it" className="text-bone/70 hover:text-amber transition-colors">
              info@koboku.it
            </a>
            .
          </p>
        </header>
      </Shell>
    );
  }

  let purchase: { email: string; product: string } | null = null;
  try {
    purchase = await resolveVaultToken(token);
  } catch (err) {
    console.error("vault token lookup failed:", err);
  }

  if (!purchase) {
    return (
      <Shell>
        <header>
          <span className="text-eyebrow text-bone/40 block mb-10">— Vault</span>
          <h1 className="text-display text-[clamp(2.6rem,6vw,5.6rem)] text-bone leading-[0.95] max-w-[14ch]">
            This link isn&apos;t <span className="italic">valid</span>.
          </h1>
          <p className="mt-10 text-base md:text-lg text-bone/55 leading-relaxed max-w-[48ch]">
            Expired or fake tokens cannot open the vault. Use the link in your access email.
          </p>
        </header>
      </Shell>
    );
  }

  const files = await listTierFiles(purchase.product);

  return (
    <Shell>
      <header>
        <span className="text-eyebrow text-bone/40 block mb-10">— Vault / {purchase.product}</span>
        <h1 className="text-display text-[clamp(2.6rem,6vw,5.6rem)] text-bone leading-[0.95] max-w-[14ch]">
          Your downloads are <span className="italic">ready</span>.
        </h1>
        <p className="mt-10 text-base md:text-lg text-bone/55 leading-relaxed max-w-[48ch]">
          Signed in via purchase token for {purchase.email}. Links expire quickly — click download when
          you are ready.
        </p>
      </header>

      <section className="mt-20 md:mt-28" aria-labelledby="files-heading">
        <h2 id="files-heading" className="text-eyebrow text-bone/40 mb-10">
          — Files
        </h2>
        {files.length === 0 ? (
          <p className="text-sm md:text-base text-bone/55 leading-relaxed max-w-[48ch]">
            No files uploaded for this tier yet. Check back shortly, or email info@koboku.it if this
            persists.
          </p>
        ) : (
          <ul className="grid gap-4">
            {files.map((file) => (
              <li
                key={file.path}
                className="border-t border-bone/10 pt-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3"
              >
                <div>
                  <p className="text-display text-[clamp(1.25rem,2.5vw,1.75rem)] text-bone leading-tight">
                    {file.name}
                  </p>
                  {file.size != null ? (
                    <p className="mt-2 text-eyebrow text-bone/35">{formatBytes(file.size)}</p>
                  ) : null}
                </div>
                <a
                  href={`/api/vault/download?token=${encodeURIComponent(token)}&path=${encodeURIComponent(file.path)}`}
                  className="inline-flex items-center gap-3 text-bone/80 hover:text-amber transition-colors shrink-0"
                >
                  <span className="text-eyebrow">Download</span>
                  <span aria-hidden>→</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-24 pt-10 border-t border-bone/10 text-sm text-bone/40">
        <Link href="/" className="hover:text-bone transition-colors">
          ← Return to the studio
        </Link>
      </div>
    </Shell>
  );
}
