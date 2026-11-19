-- DRAFT, NOT APPLIED (Booking & Checkout Studio, Session 04, 19 Nov 2026).
-- Kept outside supabase/migrations on purpose, so no deploy or database branch runs it.
-- It becomes a migration only after James names the staging database and approves it.
--
-- A saved Journey Cart: what was chosen, who holds it, and where it stands. No prices are stored as truth:
-- every price is asked again from its source when the cart opens (lib/checkout/journey.ts, decodeJourney).
-- A cart that becomes a request is then written through the existing quotes and bookings tables; this
-- table never replaces them and holds no payment data.

create table if not exists public.journey_carts (
  id uuid primary key default gen_random_uuid(),
  public_token text not null unique default replace(gen_random_uuid()::text, '-', ''),  -- the link an advisor sends
  advisor_slug text not null check (char_length(advisor_slug) <= 80),
  advisor_ledger_id text not null check (char_length(advisor_ledger_id) <= 40),
  created_by uuid references auth.users (id) on delete set null,          -- the advisor or traveler who saved it
  traveler_user_id uuid references auth.users (id) on delete set null,    -- set once the traveler signs in
  status text not null default 'draft' check (status in ('draft', 'sent', 'opened', 'requested', 'expired')),
  picks jsonb not null check (jsonb_typeof(picks) = 'array' and jsonb_array_length(picks) between 1 and 12),
  expires_at timestamptz not null default now() + interval '30 days',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists journey_carts_advisor_idx on public.journey_carts (advisor_slug, created_at desc);

alter table public.journey_carts enable row level security;
-- Written and read by the server only (service role), as bookings are. A traveler reads their own carts; the house and advisors read all.
create policy journey_carts_read on public.journey_carts for select to authenticated using (
  traveler_user_id = (select auth.uid()) or created_by = (select auth.uid()) or private.has_org_role(array['admin', 'advisor'])
);
revoke all on public.journey_carts from anon;
revoke insert, update, delete, truncate, references, trigger on public.journey_carts from authenticated;
grant select on public.journey_carts to authenticated;
