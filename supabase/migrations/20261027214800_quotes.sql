-- Booking Live · Phase 2 · 0008 quotes (spec §5E)
-- A quote is an immutable price snapshot: the engine's night-by-night
-- breakdown, taxes, policy and the rate-card revision it came from. It is
-- written ONLY by the server (service role) — never from a browser — so a
-- traveler can't change a price. Contracted-card quotes carry
-- availability = 'on_request' until the property confirms (spec §6).

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default ('Q-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  traveler_user_id uuid not null references auth.users (id) on delete cascade,
  folio_id uuid references public.folios (id) on delete set null,
  property_id uuid not null references public.properties (id),
  room_type_id uuid not null references public.room_types (id),
  rate_plan_id uuid not null references public.rate_plans (id),
  rate_card_version_id uuid references public.rate_card_versions (id),
  source text not null check (source in ('live_api', 'contracted_card', 'manual')),
  source_quote_reference text,
  price_revision text not null,
  availability text not null default 'on_request' check (availability in ('on_request', 'confirmed_by_property', 'live')),
  arrival_date date not null,
  departure_date date not null,
  adults smallint not null check (adults between 1 and 20),
  children smallint not null default 0,
  child_ages jsonb not null default '[]',
  currency char(3) not null,
  subtotal_minor bigint not null,
  discounts_minor bigint not null default 0,
  taxes_minor bigint not null default 0,
  fees_minor bigint not null default 0,
  florida_tax_minor bigint not null default 0,
  grand_total_minor bigint not null,
  deposit_due_minor bigint not null,
  balance_due_date date,
  merchant_model text not null default 'supplier_direct',
  policy_snapshot jsonb not null,
  price_breakdown jsonb not null,
  expires_at timestamptz not null,
  status text not null default 'quoted' check (status in ('draft', 'pricing', 'quoted', 'revalidation_required', 'expired', 'converted', 'rejected')),
  advisor_status text not null default 'pending' check (advisor_status in ('pending', 'approved', 'declined')),
  advisor_user_id uuid references auth.users (id),
  advisor_note text,
  advisor_decided_at timestamptz,
  created_at timestamptz not null default now(),
  check (departure_date > arrival_date),
  check (grand_total_minor >= 0 and deposit_due_minor between 0 and grand_total_minor)
);
create index quotes_traveler_idx on public.quotes (traveler_user_id, created_at desc);
create index quotes_property_idx on public.quotes (property_id, arrival_date);
create index quotes_advisor_queue_idx on public.quotes (advisor_status, created_at) where advisor_status = 'pending';

-- Immutable price: once written, only status / advisor fields may change.
create or replace function private.quotes_price_locked()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (new.grand_total_minor, new.subtotal_minor, new.discounts_minor, new.taxes_minor, new.florida_tax_minor,
      new.deposit_due_minor, new.currency, new.price_revision, new.price_breakdown, new.policy_snapshot,
      new.arrival_date, new.departure_date, new.adults, new.child_ages, new.traveler_user_id)
     is distinct from
     (old.grand_total_minor, old.subtotal_minor, old.discounts_minor, old.taxes_minor, old.florida_tax_minor,
      old.deposit_due_minor, old.currency, old.price_revision, old.price_breakdown, old.policy_snapshot,
      old.arrival_date, old.departure_date, old.adults, old.child_ages, old.traveler_user_id) then
    raise exception 'quote prices are immutable; create a new quote' using errcode = '42501';
  end if;
  return new;
end $$;
revoke execute on function private.quotes_price_locked() from public, anon, authenticated;
create trigger quotes_price_locked before update on public.quotes
  for each row execute function private.quotes_price_locked();

alter table public.quotes enable row level security;

-- Travelers read their own quotes; advisors and admins read all (assignment
-- rules arrive with the Advisor Desk). Nobody writes from a browser.
create policy quotes_read on public.quotes for select to authenticated using (
  traveler_user_id = (select auth.uid()) or private.has_org_role(array['admin', 'advisor'])
);
revoke insert, update, delete, truncate, references, trigger on public.quotes from anon, authenticated;
revoke all on public.quotes from anon;
grant select on public.quotes to authenticated;

create trigger audit_quotes after insert or update on public.quotes
  for each row execute function private.audit_row();
