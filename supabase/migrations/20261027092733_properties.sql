-- Booking Live · Phase 1 · 0002 properties
-- Read-optimised copy of the Ledger's stays, keyed by the existing Ledger ID
-- (legacy_cms_id, e.g. STY-2026-000006) so current URLs and IDs never change.
-- Phase 1 needs only identity + slug so travelers can save stays. Spec §5C.

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  legacy_cms_id text not null unique check (legacy_cms_id ~ '^[A-Z]{3}-[0-9]{4}-[0-9]{6}$'),
  airtable_record_id text unique,
  name text not null check (char_length(name) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,120}$'),
  category text,
  country text,
  country_code char(2),
  region text,
  timezone text,
  default_currency char(3) not null default 'USD',
  booking_mode text not null default 'inquiry' check (booking_mode in ('inquiry', 'request', 'live')),
  publication_status text not null default 'published' check (publication_status in ('draft', 'published', 'retired')),
  last_synced_at timestamptz not null default now()
);
create index properties_region_idx on public.properties (region);

alter table public.properties enable row level security;

-- Anyone may read published properties; nobody writes from a client.
create policy properties_select_published on public.properties
  for select to anon, authenticated using (publication_status = 'published');
revoke insert, update, delete on public.properties from anon, authenticated;
grant select on public.properties to anon, authenticated;
