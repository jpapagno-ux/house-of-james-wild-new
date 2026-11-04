-- Booking Live · Phase 3a · 0011 holds and bookings (traveler dashboard, 1 Nov 2026)
--
-- A quote may now be HELD: the house has asked the property to hold the room
-- while the traveler decides (held_until). A BOOKING is what a quote becomes
-- once the property confirms and the house records it, or what an advisor
-- records directly for a stay booked by phone or email (source = advisor).
-- Money columns are snapshots in minor units; payments arrive in Phase 3b and
-- only ever move deposit_paid_minor / balance_paid_minor forward. Everything
-- is written by the server (service role); travelers read their own rows.

-- 1. Holds on quotes (the constraint swap is also in supabase/manual/0011b_hold_status.sql for a hand run)
alter table public.quotes drop constraint if exists quotes_advisor_status_check;
alter table public.quotes add constraint quotes_advisor_status_check
  check (advisor_status in ('pending', 'held', 'approved', 'declined'));
alter table public.quotes
  add column if not exists held_until timestamptz,
  add column if not exists hold_note text check (char_length(hold_note) <= 1000);
drop index if exists quotes_advisor_queue_idx;
create index quotes_advisor_queue_idx on public.quotes (advisor_status, created_at) where advisor_status in ('pending', 'held');

-- 2. Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default ('B-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  traveler_user_id uuid not null references auth.users (id) on delete cascade,
  quote_id uuid unique references public.quotes (id) on delete set null,
  folio_id uuid references public.folios (id) on delete set null,
  property_id uuid not null references public.properties (id),
  room_type_id uuid references public.room_types (id) on delete set null,
  source text not null check (source in ('traveler_quote', 'advisor')),
  partner_confirmation_number text check (char_length(partner_confirmation_number) <= 80),
  arrival_date date not null,
  departure_date date not null,
  adults smallint not null check (adults between 1 and 20),
  children smallint not null default 0 check (children between 0 and 20),
  currency char(3) not null,
  grand_total_minor bigint not null check (grand_total_minor >= 0),
  deposit_due_minor bigint not null default 0 check (deposit_due_minor >= 0),
  deposit_paid_minor bigint not null default 0 check (deposit_paid_minor >= 0),
  balance_paid_minor bigint not null default 0 check (balance_paid_minor >= 0),
  balance_due_date date,
  status text not null default 'confirmed' check (status in ('confirmed', 'deposit_paid', 'paid', 'cancelled', 'stayed')),
  traveler_note text check (char_length(traveler_note) <= 2000),   -- what the traveler reads (documents, transfers, what to bring)
  advisor_user_id uuid references auth.users (id),
  advisor_name text check (char_length(advisor_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (departure_date > arrival_date)
);
create index if not exists bookings_traveler_idx on public.bookings (traveler_user_id, arrival_date desc);
create index if not exists bookings_property_idx on public.bookings (property_id, arrival_date);

create or replace function private.bookings_touch()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
revoke execute on function private.bookings_touch() from public, anon, authenticated;
drop trigger if exists bookings_touch on public.bookings;
create trigger bookings_touch before update on public.bookings for each row execute function private.bookings_touch();
drop trigger if exists audit_bookings on public.bookings;
create trigger audit_bookings after insert or update or delete on public.bookings for each row execute function private.audit_row();

alter table public.bookings enable row level security;
drop policy if exists bookings_read on public.bookings;
create policy bookings_read on public.bookings for select to authenticated using (
  traveler_user_id = (select auth.uid()) or private.has_org_role(array['admin', 'advisor'])
);
revoke insert, update, delete, truncate, references, trigger on public.bookings from anon, authenticated;
revoke all on public.bookings from anon;
grant select on public.bookings to authenticated;
