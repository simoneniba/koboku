-- Run in the Supabase SQL editor (Project → SQL → New query).
-- The email unique constraint makes the purchase webhook upsert idempotent.

create table if not exists members (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  product    text,
  status     text default 'active',
  source     text,
  order_id   text,
  created_at timestamptz default now()
);

alter table members enable row level security;

-- A logged-in user may read only their own membership row.
create policy "read own membership"
  on members for select
  using ( auth.jwt() ->> 'email' = email );
