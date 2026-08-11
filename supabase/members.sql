-- Run in Supabase → SQL → New query → Run
-- Creates public.members + RLS if missing (safe to re-run).

DO $$
BEGIN
  IF to_regclass('public.members') IS NULL THEN
    CREATE TABLE public.members (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      product text,
      status text DEFAULT 'active',
      source text,
      order_id text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS product text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS order_id text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.members
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN email SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'members_email_key'
  ) THEN
    ALTER TABLE public.members
      ADD CONSTRAINT members_email_key UNIQUE (email);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'members_pkey'
  ) THEN
    ALTER TABLE public.members
      ADD CONSTRAINT members_pkey PRIMARY KEY (id);
  END IF;
END $$;

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read own membership" ON public.members;

CREATE POLICY "read own membership"
  ON public.members
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);
