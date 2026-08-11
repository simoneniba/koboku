import { MEMBERS_TABLE } from "@/lib/members";

/**
 * Shared vault constants — server-only usage for Storage paths.
 * Purchases live in the existing NEW AI MAFIA MEMBERS table (`product` = tier).
 */
export const PURCHASES_TABLE = MEMBERS_TABLE;
export const VAULT_BUCKET = "vault" as const;
export const DEFAULT_VAULT_TIER = "omgiye" as const;
/** Signed download lifetime in seconds */
export const VAULT_SIGNED_URL_TTL = 120;
