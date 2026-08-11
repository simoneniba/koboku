-- Optional: if you later want access_token on the members table itself,
-- run this. The app currently stores tokens in private Storage (vault/tokens/)
-- and uses public."NEW AI MAFIA MEMBERS" for membership (email, product, status).
--
-- Storage layout (private bucket "vault"):
--   vault/omgiye/*          ← downloadable files for the omgiye tier
--   vault/tokens/{token}.json
--   vault/orders/{hash}.json

-- Ensure private vault bucket exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vault', 'vault', false, null, null)
on conflict (id) do update set public = false;
