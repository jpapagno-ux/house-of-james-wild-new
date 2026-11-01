-- Booking Live · Phase 1 · 0003 favorites and Folios
-- A Folio is an organising shelf for a journey, never a confirmed itinerary or
-- reservation. Spec §5B. Sharing: owner > editor > viewer.

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, property_id)
);
create index favorites_property_idx on public.favorites (property_id);

create table public.folios (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  destination_summary text check (char_length(destination_summary) <= 400),
  start_date date,
  end_date date,
  status text not null default 'idea' check (status in ('idea', 'planning', 'proposed', 'booked', 'traveling', 'archived')),
  cover_media_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index folios_owner_idx on public.folios (owner_user_id);
create trigger folios_touch before update on public.folios
  for each row execute function private.touch_updated_at();

create table public.folio_items (
  id uuid primary key default gen_random_uuid(),
  folio_id uuid not null references public.folios (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  external_item_type text check (external_item_type in ('voyage', 'safari', 'experience', 'route', 'note')),
  external_item_reference text check (char_length(external_item_reference) <= 200),
  arrival_date date,
  departure_date date,
  notes text check (char_length(notes) <= 2000),
  sort_order integer not null default 0,
  status text not null default 'idea' check (status in ('idea', 'shortlisted', 'requested', 'confirmed', 'removed')),
  created_at timestamptz not null default now(),
  check (property_id is not null or external_item_type is not null),
  check (departure_date is null or arrival_date is null or departure_date > arrival_date)
);
create index folio_items_folio_idx on public.folio_items (folio_id, sort_order);
create index folio_items_property_idx on public.folio_items (property_id);

create table public.folio_members (
  folio_id uuid not null references public.folios (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('editor', 'viewer')),
  access_status text not null default 'active' check (access_status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  primary key (folio_id, user_id)
);
create index folio_members_user_idx on public.folio_members (user_id);

-- Invitations by email. Only a SHA-256 hash of the token is stored; the raw
-- token travels once, in the invite link. Accepted through accept_folio_invitation().
create table public.folio_invitations (
  id uuid primary key default gen_random_uuid(),
  folio_id uuid not null references public.folios (id) on delete cascade,
  invited_email text not null check (invited_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role text not null check (role in ('editor', 'viewer')),
  token_hash text not null unique,
  invited_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index folio_invitations_folio_idx on public.folio_invitations (folio_id);

-- The caller's role on a Folio: 'owner', 'editor', 'viewer' or null.
-- Security definer avoids policy recursion between folios and folio_members.
create or replace function private.folio_role(f uuid)
returns text language sql stable security definer set search_path = '' as $$
  select case
    when exists (select 1 from public.folios where id = f and owner_user_id = auth.uid()) then 'owner'
    else (select m.role from public.folio_members m
          where m.folio_id = f and m.user_id = auth.uid() and m.access_status = 'active')
  end;
$$;
grant usage on schema private to authenticated;
grant execute on function private.folio_role(uuid) to authenticated;
grant execute on function private.has_org_role(text[]) to authenticated;

-- An owner can never be changed by a client, even by the owner.
create or replace function private.folio_owner_locked()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.owner_user_id is distinct from old.owner_user_id then
    raise exception 'folio owner cannot be changed' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger folios_owner_locked before update on public.folios
  for each row execute function private.folio_owner_locked();

alter table public.favorites enable row level security;
alter table public.folios enable row level security;
alter table public.folio_items enable row level security;
alter table public.folio_members enable row level security;
alter table public.folio_invitations enable row level security;

-- Favorites: strictly the owner's.
create policy favorites_owner_all on public.favorites
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Folios
create policy folios_select_member on public.folios
  for select to authenticated using (private.folio_role(id) is not null);
create policy folios_insert_owner on public.folios
  for insert to authenticated with check (owner_user_id = (select auth.uid()));
create policy folios_update_editor on public.folios
  for update to authenticated
  using (private.folio_role(id) in ('owner', 'editor'))
  with check (private.folio_role(id) in ('owner', 'editor'));
create policy folios_delete_owner on public.folios
  for delete to authenticated using (owner_user_id = (select auth.uid()));

-- Folio items: members read, owner/editor write.
create policy folio_items_select on public.folio_items
  for select to authenticated using (private.folio_role(folio_id) is not null);
create policy folio_items_write on public.folio_items
  for all to authenticated
  using (private.folio_role(folio_id) in ('owner', 'editor'))
  with check (private.folio_role(folio_id) in ('owner', 'editor'));

-- Members: anyone on the Folio sees who else is; only the owner changes it.
create policy folio_members_select on public.folio_members
  for select to authenticated using (private.folio_role(folio_id) is not null);
create policy folio_members_owner_write on public.folio_members
  for all to authenticated
  using (private.folio_role(folio_id) = 'owner')
  with check (private.folio_role(folio_id) = 'owner');

-- Invitations: owner only. Acceptance goes through the function below.
create policy folio_invitations_owner on public.folio_invitations
  for all to authenticated
  using (private.folio_role(folio_id) = 'owner')
  with check (private.folio_role(folio_id) = 'owner' and invited_by = (select auth.uid()));

revoke all on public.favorites, public.folios, public.folio_items, public.folio_members, public.folio_invitations from anon;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.folios, public.folio_items, public.folio_members to authenticated;
grant select, insert, update, delete on public.folio_invitations to authenticated;

-- Accept an invitation: token must match, be pending, unexpired, and addressed
-- to the signed-in user's verified email. Returns the folio id.
create or replace function public.accept_folio_invitation(raw_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  inv public.folio_invitations;
  me_email text;
begin
  if auth.uid() is null then
    raise exception 'sign in required' using errcode = '28000';
  end if;
  select email into me_email from auth.users where id = auth.uid() and email_confirmed_at is not null;
  select * into inv from public.folio_invitations
    where token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex')
    for update;
  if inv.id is null or inv.status <> 'pending' then
    raise exception 'invitation not found' using errcode = 'P0002';
  end if;
  if inv.expires_at < now() then
    update public.folio_invitations set status = 'expired' where id = inv.id;
    raise exception 'invitation expired' using errcode = 'P0002';
  end if;
  if me_email is null or lower(me_email) <> lower(inv.invited_email) then
    raise exception 'invitation is for another email' using errcode = '42501';
  end if;
  insert into public.folio_members (folio_id, user_id, role, access_status)
  values (inv.folio_id, auth.uid(), inv.role, 'active')
  on conflict (folio_id, user_id) do update set role = excluded.role, access_status = 'active';
  update public.folio_invitations set status = 'accepted', accepted_by = auth.uid() where id = inv.id;
  return inv.folio_id;
end $$;
revoke all on function public.accept_folio_invitation(text) from public, anon;
grant execute on function public.accept_folio_invitation(text) to authenticated;
