-- Booking Live · Phase 1 · 0001 identity
-- Travelers (profiles), organizations and staff roles. Spec §5A.
-- Sensitive and operational objects live in the `private` schema, which the
-- Supabase API never exposes.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- updated_at helper, shared by every table that carries one.
create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Profiles: one per auth user, created by trigger on sign-up.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text check (char_length(first_name) <= 80),
  last_name text check (char_length(last_name) <= 80),
  email text not null,
  phone text check (char_length(phone) <= 40),
  preferred_currency char(3) not null default 'USD' check (preferred_currency ~ '^[A-Z]{3}$'),
  timezone text not null default 'America/New_York' check (char_length(timezone) <= 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_updated_at();

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- Keep profile email in step with the verified auth email.
create or replace function private.sync_user_email()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = coalesce(new.email, '') where id = new.id;
  end if;
  return new;
end $$;

create trigger on_auth_user_email_changed after update of email on auth.users
  for each row execute function private.sync_user_email();

-- Organizations: the house, agencies, partner properties.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  type text not null check (type in ('internal', 'agency', 'partner')),
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role text not null check (role in ('admin', 'finance', 'advisor', 'partner_manager', 'partner_editor')),
  status text not null default 'active' check (status in ('active', 'invited', 'revoked')),
  created_at timestamptz not null default now(),
  unique (user_id, organization_id, role)
);
create index organization_memberships_org_idx on public.organization_memberships (organization_id);

-- Role check used by RLS. Security definer so policies on other tables can
-- read memberships without granting travelers access to them.
create or replace function private.has_org_role(roles text[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_memberships m
    join public.organizations o on o.id = m.organization_id
    where m.user_id = auth.uid() and m.status = 'active'
      and o.status = 'active' and m.role = any (roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;

-- Profiles: a traveler reads and edits only their own; id and email are not
-- client-editable (email follows auth.users via trigger).
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (first_name, last_name, phone, preferred_currency, timezone) on public.profiles to authenticated;

-- Organizations and memberships: members see their own; no client writes.
create policy memberships_select_own on public.organization_memberships
  for select to authenticated using (user_id = (select auth.uid()));
create policy organizations_select_member on public.organizations
  for select to authenticated using (
    exists (select 1 from public.organization_memberships m
            where m.organization_id = organizations.id and m.user_id = (select auth.uid()))
  );
revoke insert, update, delete on public.organizations, public.organization_memberships from anon, authenticated;
grant select on public.organizations, public.organization_memberships to authenticated;
revoke all on public.profiles, public.organizations, public.organization_memberships from anon;
