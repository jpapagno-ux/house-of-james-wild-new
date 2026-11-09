-- Advisor Desk · Step 7 · Invitations and public profiles (James, 8 Nov 2026: "Yes go live").
--
-- 1. Invitations. The house adds an advisor (a new ADV number and slug) or picks one already on file, and
--    invites them by email. Only the token's SHA-256 is kept. The invitee signs in with the invited
--    address and accepts; the database checks the token, expiry, single use and email, then links the
--    account to the advisor. Nothing is sent unless the house sends it.
-- 2. Public profile. The advisor's title, one-line introduction and short biography travel with their
--    Advisor DNA, so the house reviews them in the same place and the website publishes only what the
--    house approved. Long dashes are turned into commas (the house writes without them).
-- 3. Portrait. The advisor uploads a portrait to their file (private storage, like their documents). Once
--    the house accepts it and places it in the house Cloudinary library (jwco/advisors/<slug>/portrait),
--    the house records that public ID and the card shows it.

-- ===== 1. Adding an advisor
create or replace function public.create_advisor(p_name text, p_house boolean default false)
returns uuid language plpgsql security definer set search_path = '' as $$
declare n text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g')); base text; s text; i int := 1; yr text := to_char(now(), 'YYYY'); nxt int; id uuid;
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  if char_length(n) < 2 or char_length(n) > 120 then raise exception 'Give the advisor''s full name' using errcode = '22023'; end if;
  base := trim(both '-' from regexp_replace(translate(lower(n), 'áàâäãåçéèêëíìîïñóòôöõøúùûüýÿ', 'aaaaaaceeeeiiiinoooooouuuuyy'), '[^a-z0-9]+', '-', 'g'));
  if base = '' then raise exception 'Give the advisor''s name in letters' using errcode = '22023'; end if;
  s := base;
  while exists (select 1 from public.advisors where slug = s) loop i := i + 1; s := base || '-' || i; end loop;
  select coalesce(max(substr(adv_number, 10)::int), 0) + 1 into nxt from public.advisors where adv_number like 'ADV-' || yr || '-%';
  insert into public.advisors (adv_number, slug, display_name, status, house_advisor)
    values ('ADV-' || yr || '-' || lpad(nxt::text, 6, '0'), s, n, 'invited', coalesce(p_house, false)) returning advisors.id into id;
  return id;
end;
$$;
revoke all on function public.create_advisor(text, boolean) from public, anon;
grant execute on function public.create_advisor(text, boolean) to authenticated;

-- ===== 1. Invitations
create table public.advisor_invitations (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  invited_by uuid references auth.users (id) on delete set null default auth.uid(),
  emailed boolean not null default false,
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index advisor_invitations_advisor_idx on public.advisor_invitations (advisor_id, created_at desc);
create trigger audit_advisor_invitations after insert or update or delete on public.advisor_invitations for each row execute function private.audit_row();
alter table public.advisor_invitations enable row level security;
create policy advisor_invitations_select on public.advisor_invitations for select to authenticated using (private.is_advisor_keeper());
revoke all on public.advisor_invitations from anon;
revoke insert, update, delete on public.advisor_invitations from authenticated;
grant select (id, advisor_id, email, invited_by, emailed, expires_at, accepted_at, revoked_at, created_at) on public.advisor_invitations to authenticated;

-- The house invites (a newer invitation replaces one still open for the same advisor).
create or replace function public.invite_advisor(p_advisor uuid, p_email text, p_token_hash text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare a record; e text := lower(btrim(coalesce(p_email, ''))); id uuid;
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  select * into a from public.advisors where advisors.id = p_advisor for update;
  if a is null then raise exception 'No such advisor' using errcode = 'P0002'; end if;
  if a.user_id is not null then raise exception 'This advisor already has desk access' using errcode = '22023'; end if;
  if a.status not in ('invited', 'active') then raise exception 'Bring the advisor back before inviting them' using errcode = '22023'; end if;
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(e) > 254 then raise exception 'Give a valid email address' using errcode = '22023'; end if;
  if exists (select 1 from public.advisors x join auth.users u on u.id = x.user_id where lower(u.email) = e) then
    raise exception 'That address already belongs to another advisor' using errcode = '22023'; end if;
  update public.advisor_invitations set revoked_at = now()
    where advisor_id = p_advisor and accepted_at is null and revoked_at is null;
  insert into public.advisor_invitations (advisor_id, email, token_hash) values (p_advisor, e, p_token_hash) returning advisor_invitations.id into id;
  return id;
end;
$$;
revoke all on function public.invite_advisor(uuid, text, text) from public, anon;
grant execute on function public.invite_advisor(uuid, text, text) to authenticated;

create or replace function public.advisor_invitation_emailed(p_invitation uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  update public.advisor_invitations set emailed = true where id = p_invitation;
end;
$$;
revoke all on function public.advisor_invitation_emailed(uuid) from public, anon;
grant execute on function public.advisor_invitation_emailed(uuid) to authenticated;

create or replace function public.revoke_advisor_invitation(p_invitation uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  update public.advisor_invitations set revoked_at = now() where id = p_invitation and accepted_at is null and revoked_at is null;
  if not found then raise exception 'That invitation is no longer open' using errcode = 'P0002'; end if;
end;
$$;
revoke all on function public.revoke_advisor_invitation(uuid) from public, anon;
grant execute on function public.revoke_advisor_invitation(uuid) to authenticated;

-- The invitee accepts, signed in with the invited address.
create or replace function public.accept_advisor_invitation(raw_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare inv public.advisor_invitations; me text; a record;
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = '42501'; end if;
  select * into inv from public.advisor_invitations
    where token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex') for update;
  if not found or inv.accepted_at is not null or inv.revoked_at is not null or inv.expires_at < now() then
    raise exception 'This invitation has expired, was replaced, or has already been used' using errcode = 'P0002'; end if;
  select lower(email) into me from auth.users where id = auth.uid();
  if me is distinct from lower(inv.email) then raise exception 'This invitation was sent to a different email address' using errcode = '42501'; end if;
  if exists (select 1 from public.advisors where user_id = auth.uid()) then
    raise exception 'This account already belongs to an advisor' using errcode = '42501'; end if;
  select * into a from public.advisors where id = inv.advisor_id for update;
  if a.user_id is not null or a.status not in ('invited', 'active') then
    raise exception 'This invitation has expired, was replaced, or has already been used' using errcode = 'P0002'; end if;
  update public.advisors set user_id = auth.uid() where id = inv.advisor_id;
  update public.advisor_invitations set accepted_at = now(), accepted_by = auth.uid() where id = inv.id;
  return inv.advisor_id;
end;
$$;
revoke all on function public.accept_advisor_invitation(text) from public, anon;
grant execute on function public.accept_advisor_invitation(text) to authenticated;

-- ===== 2. Profile words travel with the DNA
alter table public.advisor_dna
  add column title text check (char_length(title) <= 80),
  add column intro text check (char_length(intro) <= 240),
  add column bio text check (char_length(bio) <= 1500);

create or replace function private.clean_advisor_profile(p jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare t text; i text; b text;
begin
  t := nullif(btrim(regexp_replace(regexp_replace(coalesce(p ->> 'title', ''), '\s*[–—]\s*', ', ', 'g'), '\s+', ' ', 'g')), '');
  i := nullif(btrim(regexp_replace(regexp_replace(coalesce(p ->> 'intro', ''), '\s*[–—]\s*', ', ', 'g'), '\s+', ' ', 'g')), '');
  b := nullif(btrim(regexp_replace(regexp_replace(regexp_replace(coalesce(p ->> 'bio', ''), '\s*[–—]\s*', ', ', 'g'), '[ \t]+', ' ', 'g'), '\n{3,}', E'\n\n', 'g')), '');
  if length(t) > 80 then raise exception 'Keep your title under 80 characters' using errcode = '22023'; end if;
  if length(i) > 240 then raise exception 'Keep your introduction under 240 characters' using errcode = '22023'; end if;
  if length(b) > 1500 then raise exception 'Keep your biography under 1,500 characters' using errcode = '22023'; end if;
  return jsonb_build_object('title', t, 'intro', i, 'bio', b);
end;
$$;
revoke execute on function private.clean_advisor_profile(jsonb) from public, anon, authenticated;

create or replace function public.submit_advisor_dna(p_dna jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare me uuid := private.my_advisor_file(); clean jsonb; pid uuid;
begin
  if me is null then raise exception 'Sign in with your authenticator code' using errcode = '42501'; end if;
  clean := private.clean_advisor_dna(p_dna) || private.clean_advisor_profile(p_dna);
  update public.advisor_dna_proposals set status = 'withdrawn', decided_at = now(), decided_by = auth.uid()
    where advisor_id = me and status = 'submitted';
  insert into public.advisor_dna_proposals (advisor_id, payload, submitted_by) values (me, clean, auth.uid()) returning id into pid;
  return pid;
end;
$$;
revoke all on function public.submit_advisor_dna(jsonb) from public, anon;
grant execute on function public.submit_advisor_dna(jsonb) to authenticated;

create or replace function public.decide_advisor_dna(p_proposal uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare pr record; d jsonb;
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  if p_status not in ('approved', 'returned') then raise exception 'Approve or return' using errcode = '22023'; end if;
  if p_status = 'returned' and coalesce(btrim(p_note), '') = '' then raise exception 'Say why it is returned' using errcode = '22023'; end if;
  select * into pr from public.advisor_dna_proposals where id = p_proposal for update;
  if pr is null or pr.status <> 'submitted' then raise exception 'That is no longer waiting' using errcode = 'P0002'; end if;
  update public.advisor_dna_proposals set status = p_status, house_note = nullif(btrim(p_note), ''), decided_at = now(), decided_by = auth.uid()
    where id = p_proposal;
  if p_status = 'approved' then
    d := pr.payload;
    insert into public.advisor_dna as x (advisor_id, pathways, volumes, party_types, countries, languages, specialties, availability, match_note, marks,
      title, intro, bio, proposal_id, confirmed_at, approved_at, approved_by)
    values (pr.advisor_id,
      array(select jsonb_array_elements_text(d -> 'pathways')), array(select jsonb_array_elements_text(d -> 'volumes')),
      array(select jsonb_array_elements_text(d -> 'party_types')), array(select jsonb_array_elements_text(d -> 'countries')),
      array(select jsonb_array_elements_text(d -> 'languages')), array(select jsonb_array_elements_text(d -> 'specialties')),
      d ->> 'availability', d ->> 'match_note', d -> 'marks', d ->> 'title', d ->> 'intro', d ->> 'bio', pr.id, pr.created_at, now(), auth.uid())
    on conflict (advisor_id) do update set pathways = excluded.pathways, volumes = excluded.volumes, party_types = excluded.party_types,
      countries = excluded.countries, languages = excluded.languages, specialties = excluded.specialties, availability = excluded.availability,
      match_note = excluded.match_note, marks = excluded.marks, title = excluded.title, intro = excluded.intro, bio = excluded.bio,
      proposal_id = excluded.proposal_id, confirmed_at = excluded.confirmed_at, approved_at = excluded.approved_at, approved_by = excluded.approved_by;
  end if;
end;
$$;
revoke all on function public.decide_advisor_dna(uuid, text, text) from public, anon;
grant execute on function public.decide_advisor_dna(uuid, text, text) to authenticated;

-- ===== 3. Portraits
alter table public.advisors add column portrait_public_id text
  check (portrait_public_id ~ '^jwco/advisors/[a-z0-9]+(-[a-z0-9]+)*/portrait(-[a-z0-9]+)?$');

alter table public.advisor_documents drop constraint advisor_documents_kind_check;
alter table public.advisor_documents add constraint advisor_documents_kind_check
  check (kind in ('tax_form', 'seller_of_travel', 'eo_insurance', 'business_registration', 'certificate', 'other', 'portrait'));

drop policy advisor_files_insert on storage.objects;
create policy advisor_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'advisor-files'
    and ((storage.foldername(name))[1] = private.my_advisor_file()::text or private.is_advisor_keeper())
    and (storage.foldername(name))[2] in ('tax_form', 'seller_of_travel', 'eo_insurance', 'business_registration', 'certificate', 'other', 'portrait'));

create or replace function public.set_advisor_portrait(p_advisor uuid, p_public_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare s text;
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  select slug into s from public.advisors where id = p_advisor;
  if s is null then raise exception 'No such advisor' using errcode = 'P0002'; end if;
  if p_public_id is not null and p_public_id !~ ('^jwco/advisors/' || s || '/portrait(-[a-z0-9]+)?$') then
    raise exception 'Use the house library path jwco/advisors/%/portrait', s using errcode = '22023'; end if;
  update public.advisors set portrait_public_id = nullif(btrim(p_public_id), '') where id = p_advisor;
end;
$$;
revoke all on function public.set_advisor_portrait(uuid, text) from public, anon;
grant execute on function public.set_advisor_portrait(uuid, text) to authenticated;

-- ===== What the website reads at build: now with the name, profile words and portrait.
create or replace function public.public_advisor_dna()
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x ->> 'ledgerId'), '[]'::jsonb) from (
    select case when a.status = 'active' then jsonb_build_object(
        'slug', a.slug, 'ledgerId', a.adv_number, 'hidden', false, 'name', a.display_name, 'house', a.house_advisor,
        'title', d.title, 'intro', d.intro, 'bio', d.bio, 'portrait', a.portrait_public_id,
        'pathways', to_jsonb(d.pathways), 'volumes', to_jsonb(d.volumes), 'partyTypes', to_jsonb(d.party_types),
        'countries', to_jsonb(d.countries), 'languages', to_jsonb(d.languages), 'specialties', to_jsonb(d.specialties),
        'availability', d.availability, 'matchNote', d.match_note,
        'confirmed', to_char(d.confirmed_at at time zone 'UTC', 'YYYY-MM-DD'), 'updated', to_char(d.approved_at at time zone 'UTC', 'YYYY-MM-DD'),
        'marks', d.marks)
      else jsonb_build_object('slug', a.slug, 'ledgerId', a.adv_number, 'hidden', true) end as x
    from public.advisors a left join public.advisor_dna d on d.advisor_id = a.id
    where a.slug is not null and ((a.status = 'active' and d.advisor_id is not null) or a.status in ('paused', 'left'))
  ) s;
$$;
revoke all on function public.public_advisor_dna() from public;
grant execute on function public.public_advisor_dna() to anon, authenticated;
