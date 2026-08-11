-- Run in Supabase → SQL → New query → Run
-- Upgrades public."NEW AI MAFIA MEMBERS" for Education access (does NOT rename the table).
-- Safe to re-run. If the table already has rows, email is added nullable first, then uniqued.

ALTER TABLE public."NEW AI MAFIA MEMBERS"
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS product text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS order_id text;

ALTER TABLE public."NEW AI MAFIA MEMBERS"
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN status SET DEFAULT 'active';

-- Empty rows with null email cannot stay if we enforce NOT NULL.
-- If this fails because old blank rows exist, delete/fix those rows then re-run.
UPDATE public."NEW AI MAFIA MEMBERS"
SET email = 'unknown+' || id::text || '@invalid.local'
WHERE email IS NULL;

ALTER TABLE public."NEW AI MAFIA MEMBERS"
  ALTER COLUMN email SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'NEW_AI_MAFIA_MEMBERS_email_key'
  ) THEN
    ALTER TABLE public."NEW AI MAFIA MEMBERS"
      ADD CONSTRAINT NEW_AI_MAFIA_MEMBERS_email_key UNIQUE (email);
  END IF;
END $$;

ALTER TABLE public."NEW AI MAFIA MEMBERS" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read own membership" ON public."NEW AI MAFIA MEMBERS";

CREATE POLICY "read own membership"
  ON public."NEW AI MAFIA MEMBERS"
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);
