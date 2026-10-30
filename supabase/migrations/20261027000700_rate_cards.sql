-- Booking Live · Phase 2 · 0007 rooms, rate plans and contracted rate cards (spec §5C, §5D)
-- Synced FROM the Airtable commercial base; Airtable stays the editing desk,
-- Supabase holds the read-optimised copy the site prices from.
-- Money: integer minor units + ISO-4217 currency. Percentages: basis points.
-- Gross (sell) rates of PUBLISHED cards are public; net rates and commission
-- live only in private.* and never reach a browser.

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  code text not null check (code ~ '^[a-z0-9-]{1,60}$'),
  name text not null check (char_length(name) between 1 and 120),
  description text,
  max_adults smallint not null check (max_adults between 1 and 20),
  max_children smallint not null default 0 check (max_children between 0 and 20),
  max_occupancy smallint not null check (max_occupancy between 1 and 30),
  active boolean not null default true,
  airtable_record_id text unique,
  unique (property_id, code)
);

create table public.rate_plans (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types (id) on delete cascade,
  code text not null check (code ~ '^[a-z0-9-]{1,60}$'),
  name text not null,
  board_basis text not null check (board_basis in ('room_only', 'bed_breakfast', 'half_board', 'full_board', 'fully_inclusive')),
  refundability text not null default 'refundable' check (refundability in ('refundable', 'partially_refundable', 'non_refundable')),
  inclusions text,
  active boolean not null default true,
  airtable_record_id text unique,
  unique (room_type_id, code)
);
create index rate_plans_room_idx on public.rate_plans (room_type_id);

create table public.rate_card_versions (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  version_label text not null check (char_length(version_label) between 1 and 60), -- e.g. "2027-V1"
  supplier_contract_reference text,
  source_revision integer not null default 1,
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  effective_from date not null,
  effective_to date not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'published', 'retired')),
  payment_terms jsonb not null default '{"depositPercentBp": 3000, "balanceDueDaysBeforeArrival": 60}',
  cancellation jsonb not null default '{"summary": "", "tiers": []}',
  timezone text not null default 'UTC',
  approved_by text,          -- name/email of the approver in Airtable
  approved_at timestamptz,
  published_at timestamptz,
  airtable_record_id text unique,
  synced_at timestamptz not null default now(),
  check (effective_to >= effective_from),
  unique (property_id, version_label)
);
create index rate_card_versions_property_idx on public.rate_card_versions (property_id, status);
-- Several published cards may coexist (e.g. 2027 and 2028); the site picks the one whose
-- effective dates cover the stay. Overlapping published cards are refused by the sync.

create table public.seasonal_rate_rules (
  id uuid primary key default gen_random_uuid(),
  rate_card_version_id uuid not null references public.rate_card_versions (id) on delete cascade,
  room_type_id uuid not null references public.room_types (id) on delete cascade,
  rate_plan_id uuid not null references public.rate_plans (id) on delete cascade,
  season text not null,
  stay_start date not null,
  stay_end date not null,
  booking_start date,
  booking_end date,
  base_occupancy smallint not null check (base_occupancy between 1 and 20),
  amount_minor bigint not null check (amount_minor >= 0),
  extra_adult_minor bigint check (extra_adult_minor >= 0),
  child_bands jsonb not null default '[]',
  min_nights smallint check (min_nights between 1 and 60),
  max_nights smallint check (max_nights between 1 and 365),
  days_of_week smallint[] check (days_of_week <@ array[0,1,2,3,4,5,6]::smallint[]),
  priority smallint not null default 0,
  active boolean not null default true,
  airtable_record_id text unique,
  check (stay_end >= stay_start),
  check (booking_end is null or booking_start is null or booking_end >= booking_start)
);
create index seasonal_rules_lookup_idx on public.seasonal_rate_rules (rate_card_version_id, room_type_id, rate_plan_id, stay_start, stay_end);

create table public.inventory_restrictions (
  id uuid primary key default gen_random_uuid(),
  rate_card_version_id uuid not null references public.rate_card_versions (id) on delete cascade,
  room_type_id uuid references public.room_types (id) on delete cascade,
  rate_plan_id uuid references public.rate_plans (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  restriction_type text not null check (restriction_type in ('closed', 'min_stay', 'close_to_arrival', 'close_to_departure')),
  minimum_stay smallint,
  airtable_record_id text unique,
  check (end_date >= start_date)
);
create index inventory_restrictions_card_idx on public.inventory_restrictions (rate_card_version_id);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  rate_card_version_id uuid not null references public.rate_card_versions (id) on delete cascade,
  promotion_code text not null check (promotion_code ~ '^[A-Z0-9-]{2,30}$'),
  label text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed_per_night', 'nth_night_free')),
  discount_value integer not null check (discount_value > 0),
  booking_start date, booking_end date, stay_start date, stay_end date,
  min_nights smallint,
  eligible_rate_plans uuid[],
  stacking_policy text not null default 'exclusive' check (stacking_policy in ('exclusive', 'stackable')),
  approval_status text not null default 'draft' check (approval_status in ('draft', 'approved', 'retired')),
  airtable_record_id text unique,
  unique (rate_card_version_id, promotion_code)
);

create table public.tax_fee_rules (
  id uuid primary key default gen_random_uuid(),
  rate_card_version_id uuid not null references public.rate_card_versions (id) on delete cascade,
  name text not null,
  jurisdiction text,
  kind text not null default 'tax' check (kind in ('tax', 'fee')),
  charge_basis text not null check (charge_basis in ('percent_of_room', 'per_person_per_night', 'per_room_per_night', 'per_stay')),
  amount_minor bigint check (amount_minor >= 0),
  percentage_bp integer check (percentage_bp between 0 and 10000),
  included_in_display_price boolean not null default false,
  min_age smallint,
  airtable_record_id text unique,
  check ((charge_basis = 'percent_of_room') = (percentage_bp is not null))
);

-- Private commercial terms: net rates, commission, contract contacts. No client access, ever.
create table private.contract_terms (
  rate_card_version_id uuid primary key references public.rate_card_versions (id) on delete cascade,
  rates_are_net boolean not null default false,
  commission_bp integer check (commission_bp between 0 and 10000),
  net_rate_notes text,
  contract_contact text,
  merchant_model text not null default 'supplier_direct' check (merchant_model in ('supplier_direct', 'house_collection', 'connected_account')),
  updated_at timestamptz not null default now()
);

-- Sync log (Airtable → Supabase), private.
create table private.rate_sync_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'ok', 'partial', 'failed')),
  cards_upserted integer not null default 0,
  rows_upserted integer not null default 0,
  errors jsonb not null default '[]'
);

-- Read access: anyone may read the rows of PUBLISHED cards (these are the
-- prices the site shows). Drafts and approvals-in-progress stay hidden.
create or replace function private.card_published(v uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.rate_card_versions where id = v and status = 'published');
$$;
revoke execute on function private.card_published(uuid) from public;
grant execute on function private.card_published(uuid) to anon, authenticated;
-- Policies run as the visitor, so anon needs USAGE on the private schema to call the
-- check above. Tables in private stay revoked; only granted functions are callable.
grant usage on schema private to anon;

-- Audit rows for tables keyed by rate card rather than by id.
create or replace function private.audit_row()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  eid text := coalesce(rec ->> 'id', rec ->> 'rate_card_version_id', concat_ws(':', rec ->> 'folio_id', rec ->> 'user_id'));
begin
  insert into private.audit_logs (actor_id, action, entity_type, entity_id, before_snapshot, after_snapshot)
  values (
    auth.uid(), lower(tg_op), tg_table_name, eid,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) - 'token_hash' end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) - 'token_hash' end
  );
  return coalesce(new, old);
end $$;
revoke execute on function private.audit_row() from public, anon, authenticated;

alter table public.room_types enable row level security;
alter table public.rate_plans enable row level security;
alter table public.rate_card_versions enable row level security;
alter table public.seasonal_rate_rules enable row level security;
alter table public.inventory_restrictions enable row level security;
alter table public.promotions enable row level security;
alter table public.tax_fee_rules enable row level security;

create policy room_types_read on public.room_types for select to anon, authenticated using (active);
create policy rate_plans_read on public.rate_plans for select to anon, authenticated using (active);
create policy cards_read on public.rate_card_versions for select to anon, authenticated using (status = 'published');
create policy rules_read on public.seasonal_rate_rules for select to anon, authenticated using (active and private.card_published(rate_card_version_id));
create policy restrictions_read on public.inventory_restrictions for select to anon, authenticated using (private.card_published(rate_card_version_id));
create policy promotions_read on public.promotions for select to anon, authenticated using (approval_status = 'approved' and private.card_published(rate_card_version_id));
create policy taxes_read on public.tax_fee_rules for select to anon, authenticated using (private.card_published(rate_card_version_id));

-- No client writes anywhere in the commercial tables: only the server-side sync writes.
revoke insert, update, delete, truncate, references, trigger on
  public.room_types, public.rate_plans, public.rate_card_versions, public.seasonal_rate_rules,
  public.inventory_restrictions, public.promotions, public.tax_fee_rules from anon, authenticated;
grant select on public.room_types, public.rate_plans, public.rate_card_versions, public.seasonal_rate_rules,
  public.inventory_restrictions, public.promotions, public.tax_fee_rules to anon, authenticated;
revoke all on private.contract_terms, private.rate_sync_runs from public, anon, authenticated;

-- Audit every change to cards and contract terms.
create trigger audit_rate_cards after insert or update or delete on public.rate_card_versions
  for each row execute function private.audit_row();
create trigger audit_contract_terms after insert or update or delete on private.contract_terms
  for each row execute function private.audit_row();
