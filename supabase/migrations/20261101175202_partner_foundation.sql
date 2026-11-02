-- Partner Desk · Stage 1 · 0001 platform foundation (1 Nov 2026)
--
-- Shared, role-agnostic foundation for the Partner Desk and the later Advisor Desk,
-- Traveler Journey and Field Community. Additive only: no existing row is rewritten,
-- no existing column changes type, no existing policy is loosened.
--
-- Decisions: D-01 Ledger ID is the canonical entity identity (aliases in external_ids);
-- D-04 role names; D-06 parent/child entities; D-14 an entity may sit in several volumes.
-- Partners contribute, James Wild & Co publishes: partners get READ access to the
-- entities they are linked to and never write `properties` directly.

-- ===== 1. Roles: widen the membership role list without touching existing rows
alter table public.organization_memberships drop constraint organization_memberships_role_check;
alter table public.organization_memberships add constraint organization_memberships_role_check check (role in (
  -- existing (Booking Live)
  'admin', 'finance', 'advisor', 'partner_manager', 'partner_editor',
  -- Partner Desk (D-04)
  'partner_admin', 'partner_contributor',
  -- James Wild & Co internal
  'jw_admin', 'jw_editor', 'jw_portfolio_manager'
));
alter table public.organization_memberships add column updated_at timestamptz not null default now();
create trigger organization_memberships_touch before update on public.organization_memberships
  for each row execute function private.touch_updated_at();

-- ===== 2. Organizations: partner identity
create sequence private.partner_code_seq start 1;
alter table public.organizations
  add column partner_code text unique check (partner_code ~ '^PAR-[0-9]{6}$'),
  add column slug text unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  add column website text check (char_length(website) <= 200),
  add column hq_country char(2) check (hq_country ~ '^[A-Z]{2}$'),
  add column logo_media_id text check (char_length(logo_media_id) <= 200),
  add column media_kit_url text check (char_length(media_kit_url) <= 400),
  add column phone text check (char_length(phone) <= 40),
  add column general_email text check (general_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add column address text check (char_length(address) <= 400),
  add column preferred_communication text check (preferred_communication in ('email', 'phone', 'whatsapp', 'video')),
  add column airtable_record_id text unique,
  add column updated_at timestamptz not null default now();
create trigger organizations_touch before update on public.organizations
  for each row execute function private.touch_updated_at();

create or replace function private.next_partner_code()
returns text language sql volatile security definer set search_path = '' as $$
  select 'PAR-' || lpad(nextval('private.partner_code_seq')::text, 6, '0');
$$;
revoke execute on function private.next_partner_code() from public, anon, authenticated;

-- ===== 3. Brands (Lion Sands is a brand of the MORE Family Collection)
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  website text check (char_length(website) <= 200),
  created_at timestamptz not null default now()
);
create index brands_org_idx on public.brands (organization_id);

-- ===== 4. Reference data: volumes, pathways, destinations
create table public.volumes (
  key text primary key check (key ~ '^[a-z]{3,20}$'),
  roman text not null,
  label text not null,
  sort smallint not null
);
insert into public.volumes (key, roman, label, sort) values
  ('stays', 'I', 'Stays', 1),
  ('safaris', 'II', 'Safaris & Reserves', 2),
  ('gatherings', 'III', 'Gatherings', 3),
  ('voyages', 'IV', 'Voyages', 4),
  ('europe', 'V', 'The Other Europe', 5),
  ('overland', 'VI', 'Overland & Expeditions', 6);

create table public.pathways (
  id text primary key check (id ~ '^PATH-[0-9]{2}$'),
  key text not null unique check (key ~ '^[a-z0-9-]{2,60}$'),
  name text not null,
  setting text not null,
  sort smallint not null
);
-- Mirrors lib/pathways.ts (names and settings only; colours stay in code).
insert into public.pathways (id, key, name, setting, sort) values
  ('PATH-01', 'into-the-green', 'Into the Green', 'Rainforest and jungle', 1),
  ('PATH-02', 'between-tides', 'Between Tides', 'Islands and oceans', 2),
  ('PATH-03', 'above-it-all', 'Above It All', 'Mountains and highlands', 3),
  ('PATH-04', 'where-the-wild-lives', 'Where the Wild Lives', 'Wildlife and wilderness', 4),
  ('PATH-05', 'the-art-of-stillness', 'The Art of Stillness', 'Wellness and restoration', 5),
  ('PATH-06', 'off-the-map', 'Off the Map', 'Hidden and undiscovered', 6),
  ('PATH-07', 'a-place-of-our-own', 'A Place of Our Own', 'Private residences', 7),
  ('PATH-08', 'rooted-in-place', 'Rooted in Place', 'Heritage and culture', 8);

-- Destinations. DST Ledger IDs are issued only by the Library, so ledger_id is
-- filled when the Library has one and is never minted here.
create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,120}$'),
  name text not null check (char_length(name) between 1 and 120),
  kind text not null check (kind in ('region', 'country', 'area', 'place')),
  parent_id uuid references public.destinations (id) on delete restrict,
  country_code char(2) check (country_code ~ '^[A-Z]{2}$'),
  ledger_id text unique check (ledger_id ~ '^DST-[0-9]{4}-[0-9]{6}$'),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);
create index destinations_parent_idx on public.destinations (parent_id);

-- ===== 5. Entities = public.properties (additive columns, all nullable or defaulted)
alter table public.properties
  add column entity_type text check (entity_type in ('property', 'lodge', 'camp', 'residence', 'villa', 'reserve', 'vessel', 'experience')),
  add column entity_kind text check (char_length(entity_kind) <= 40),            -- e.g. treehouse
  add column volume_key text references public.volumes (key),                     -- primary volume
  add column destination_id uuid references public.destinations (id) on delete set null,
  add column parent_property_id uuid references public.properties (id) on delete restrict,
  add column brand_id uuid references public.brands (id) on delete set null,
  add column external_ids jsonb not null default '{}'::jsonb check (jsonb_typeof(external_ids) = 'object'),
  add column provenance text check (provenance in ('JW_VERIFIED', 'PARTNER_SUBMITTED', 'PUBLIC_SOURCE', 'SYSTEM_SYNC')),
  add column last_verified_at timestamptz,
  add column updated_at timestamptz not null default now(),
  add constraint properties_not_own_parent check (parent_property_id is distinct from id);
create index properties_parent_idx on public.properties (parent_property_id);
create index properties_destination_idx on public.properties (destination_id);
create index properties_brand_idx on public.properties (brand_id);
create trigger properties_touch before update on public.properties
  for each row execute function private.touch_updated_at();

-- An entity may appear in more than one volume (D-14); volume_key is the primary one.
create table public.entity_volumes (
  property_id uuid not null references public.properties (id) on delete cascade,
  volume_key text not null references public.volumes (key),
  is_primary boolean not null default false,
  primary key (property_id, volume_key)
);
create unique index entity_volumes_one_primary on public.entity_volumes (property_id) where is_primary;

-- Ledger IDs for new entities (D-01). The Library has issued IDs both in sequence
-- (STY-2026-000130) and at random (STY-2026-290658). The Partner Desk allocates from
-- its own block, 800001–899999, and skips any number already in use, so it can never
-- reuse an existing ID. The Library must not issue in this block.
create sequence private.ledger_entity_seq start 800001 maxvalue 899999;
create or replace function private.next_ledger_id(p_prefix text default 'STY')
returns text language plpgsql volatile security definer set search_path = '' as $$
declare candidate text;
begin
  if p_prefix !~ '^[A-Z]{3}$' then raise exception 'bad ledger prefix %', p_prefix; end if;
  loop
    candidate := p_prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('private.ledger_entity_seq')::text, 6, '0');
    exit when not exists (select 1 from public.properties where legacy_cms_id = candidate);
  end loop;
  return candidate;
end $$;
revoke execute on function private.next_ledger_id(text) from public, anon, authenticated;

-- ===== 6. Who is connected to an entity, and who may see it
create table public.entity_partners (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role text not null check (role in ('owner', 'operator', 'sales_representative', 'dmc', 'booking_partner', 'marketing_representative', 'guide', 'ground_handler')),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (property_id, organization_id, role)
);
create index entity_partners_org_idx on public.entity_partners (organization_id);

-- Narrows one membership to specific entities. A membership with no rows here
-- sees every entity its organization is connected to.
create table public.entity_access (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.organization_memberships (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (membership_id, property_id)
);
create index entity_access_property_idx on public.entity_access (property_id);

-- ===== 7. Authorisation helpers (security definer; read memberships without
-- exposing them). Every Partner Desk policy goes through these.
create or replace function private.is_jw(roles text[] default array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin'])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_memberships m
    join public.organizations o on o.id = m.organization_id
    where m.user_id = auth.uid() and m.status = 'active' and o.status = 'active'
      and o.type = 'internal' and m.role = any (roles)
  );
$$;

create or replace function private.is_org_member(org uuid, roles text[] default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_memberships m
    join public.organizations o on o.id = m.organization_id
    where m.user_id = auth.uid() and m.organization_id = org and m.status = 'active' and o.status = 'active'
      and (roles is null or m.role = any (roles))
  );
$$;

-- Through a partner membership (not JW), may the current user see / edit this entity?
create or replace function private.partner_can(p uuid, roles text[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_memberships m
    join public.organizations o on o.id = m.organization_id and o.status = 'active'
    join public.entity_partners ep on ep.organization_id = m.organization_id and ep.property_id = p
    where m.user_id = auth.uid() and m.status = 'active' and m.role = any (roles)
      and (not exists (select 1 from public.entity_access a where a.membership_id = m.id)
           or exists (select 1 from public.entity_access a where a.membership_id = m.id and a.property_id = p))
  );
$$;

create or replace function private.can_see_entity(p uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_jw() or private.partner_can(p, array['partner_admin', 'partner_contributor', 'partner_manager', 'partner_editor']);
$$;

create or replace function private.can_edit_entity(p uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
      or private.partner_can(p, array['partner_admin', 'partner_contributor', 'partner_manager', 'partner_editor']);
$$;

-- True when the current user and `other` share an organization in which the
-- current user is a partner admin (to list team members' names).
create or replace function private.is_team_admin_of(other uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_memberships me
    join public.organization_memberships them on them.organization_id = me.organization_id
    where me.user_id = auth.uid() and me.status = 'active' and me.role in ('partner_admin', 'partner_manager')
      and them.user_id = other
  );
$$;

revoke execute on function private.is_jw(text[]), private.is_org_member(uuid, text[]), private.partner_can(uuid, text[]),
  private.can_see_entity(uuid), private.can_edit_entity(uuid), private.is_team_admin_of(uuid) from public, anon;
grant execute on function private.is_jw(text[]), private.is_org_member(uuid, text[]), private.partner_can(uuid, text[]),
  private.can_see_entity(uuid), private.can_edit_entity(uuid), private.is_team_admin_of(uuid) to authenticated;

-- ===== 8. Row-level security
alter table public.brands enable row level security;
alter table public.volumes enable row level security;
alter table public.pathways enable row level security;
alter table public.destinations enable row level security;
alter table public.entity_volumes enable row level security;
alter table public.entity_partners enable row level security;
alter table public.entity_access enable row level security;

-- Reference data: readable by everyone; written only by migrations / service role.
create policy volumes_read on public.volumes for select to anon, authenticated using (true);
create policy pathways_read on public.pathways for select to anon, authenticated using (true);
create policy destinations_read_published on public.destinations for select to anon using (status = 'published');
create policy destinations_read_signed_in on public.destinations for select to authenticated using (true);

-- Entities: the public still sees only published rows (existing policy). Signed-in
-- partners and JW staff additionally see the entities they are connected to, drafts included.
create policy properties_select_connected on public.properties for select to authenticated
  using (private.can_see_entity(id));
create policy entity_volumes_read on public.entity_volumes for select to anon, authenticated using (
  exists (select 1 from public.properties p where p.id = property_id and p.publication_status = 'published')
  or ((select auth.uid()) is not null and private.can_see_entity(property_id))
);

create policy brands_read on public.brands for select to authenticated
  using (private.is_jw() or private.is_org_member(organization_id));
create policy entity_partners_read on public.entity_partners for select to authenticated
  using (private.is_jw() or private.is_org_member(organization_id) or private.can_see_entity(property_id));
create policy entity_access_read on public.entity_access for select to authenticated using (
  private.is_jw()
  or exists (select 1 from public.organization_memberships m where m.id = membership_id
             and (m.user_id = (select auth.uid()) or private.is_org_member(m.organization_id, array['partner_admin', 'partner_manager'])))
);

-- Organizations: JW sees every organization; partner admins may edit their own
-- organization's administrative details directly (audited), nothing else.
create policy organizations_select_jw on public.organizations for select to authenticated using (private.is_jw());
create policy organizations_update_partner_admin on public.organizations for update to authenticated
  using (private.is_org_member(id, array['partner_admin', 'partner_manager']))
  with check (private.is_org_member(id, array['partner_admin', 'partner_manager']));
grant update (website, phone, general_email, address, preferred_communication, media_kit_url) on public.organizations to authenticated;

-- Memberships: partner admins and JW see their teams.
create policy memberships_select_team on public.organization_memberships for select to authenticated
  using (private.is_jw() or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));
-- Profiles: a partner admin may read the names of people in their organization.
create policy profiles_select_team on public.profiles for select to authenticated
  using (private.is_team_admin_of(id) or private.is_jw());

-- Grants: the Supabase default grants everything on new tables; take it back.
revoke all on public.brands, public.volumes, public.pathways, public.destinations,
  public.entity_volumes, public.entity_partners, public.entity_access from anon, authenticated;
grant select on public.volumes, public.pathways, public.destinations, public.entity_volumes to anon, authenticated;
grant select on public.brands, public.entity_partners, public.entity_access to authenticated;

-- ===== 9. Audit
create trigger audit_organizations after insert or update or delete on public.organizations
  for each row execute function private.audit_row();
create trigger audit_memberships after insert or update or delete on public.organization_memberships
  for each row execute function private.audit_row();
create trigger audit_properties after insert or update or delete on public.properties
  for each row execute function private.audit_row();
create trigger audit_entity_partners after insert or update or delete on public.entity_partners
  for each row execute function private.audit_row();
create trigger audit_entity_access after insert or update or delete on public.entity_access
  for each row execute function private.audit_row();
