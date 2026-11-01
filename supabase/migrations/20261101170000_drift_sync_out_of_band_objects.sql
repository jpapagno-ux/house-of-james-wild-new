-- Drift sync · 1 Nov 2026 (decision D-12, Stage 0 blocker B-1)
--
-- Captures every object that exists in the live JWC Booking Live database but was
-- created outside the recorded migration history (SQL editor or a connector call that
-- timed out before it was logged). Nothing here changes the live schema: it is
-- already applied there. After this PR merges, record it as applied on the live
-- project WITHOUT running it:
--   supabase migration repair --status applied 20261101170000
--
-- 1. Booking Live Phase 1 · 0005 advisor fixes (was 20261027000500_policy_tidy.sql,
--    applied live but never recorded).
-- 2. Booking Live Phase 2 · 0010 second half (was the tail of
--    20261027001000_review_fixes.sql, run live from supabase/manual/0010b_apply_rate_card.sql).
-- 3. Booking Live Phase 3 bookings + payments, settle/refund functions (created live,
--    never committed to the repo).
-- 4. Quote hold columns and the house-staff profile read policy (created live).

-- ===== 1. Phase 1 advisor fixes
create index folio_invitations_invited_by_idx on public.folio_invitations (invited_by);
create index folio_invitations_accepted_by_idx on public.folio_invitations (accepted_by);

drop policy folio_items_write on public.folio_items;
create policy folio_items_insert on public.folio_items for insert to authenticated
  with check (private.folio_role(folio_id) in ('owner', 'editor'));
create policy folio_items_update on public.folio_items for update to authenticated
  using (private.folio_role(folio_id) in ('owner', 'editor'))
  with check (private.folio_role(folio_id) in ('owner', 'editor'));
create policy folio_items_delete on public.folio_items for delete to authenticated
  using (private.folio_role(folio_id) in ('owner', 'editor'));

drop policy folio_members_owner_write on public.folio_members;
create policy folio_members_insert on public.folio_members for insert to authenticated
  with check (private.folio_role(folio_id) = 'owner');
create policy folio_members_update on public.folio_members for update to authenticated
  using (private.folio_role(folio_id) = 'owner') with check (private.folio_role(folio_id) = 'owner');
create policy folio_members_delete on public.folio_members for delete to authenticated
  using (private.folio_role(folio_id) = 'owner');

drop policy parties_owner_all on public.travel_parties;
drop policy parties_member_read on public.travel_parties;
create policy parties_select on public.travel_parties for select to authenticated using (
  owner_user_id = (select auth.uid())
  or exists (select 1 from public.travel_party_members m
             where m.party_id = travel_parties.id and m.user_id = (select auth.uid())
               and m.invitation_status = 'accepted'));
create policy parties_insert on public.travel_parties for insert to authenticated
  with check (owner_user_id = (select auth.uid()));
create policy parties_update on public.travel_parties for update to authenticated
  using (owner_user_id = (select auth.uid())) with check (owner_user_id = (select auth.uid()));
create policy parties_delete on public.travel_parties for delete to authenticated
  using (owner_user_id = (select auth.uid()));

drop policy party_members_owner_all on public.travel_party_members;
drop policy party_members_self_read on public.travel_party_members;
create policy party_members_select on public.travel_party_members for select to authenticated
  using (private.is_party_owner(party_id) or user_id = (select auth.uid()));
create policy party_members_insert on public.travel_party_members for insert to authenticated
  with check (private.is_party_owner(party_id));
create policy party_members_update on public.travel_party_members for update to authenticated
  using (private.is_party_owner(party_id)) with check (private.is_party_owner(party_id));
create policy party_members_delete on public.travel_party_members for delete to authenticated
  using (private.is_party_owner(party_id));

-- ===== 2. Phase 2 · 0010 second half
-- R9: column-level read access for visitors. A table-level REVOKE also removes column
-- grants, so the column grant from 20261027221337_review_fixes_a is re-issued here,
-- exactly as supabase/manual/0010b_apply_rate_card.sql did live.
revoke select on public.rate_card_versions from anon, authenticated;
grant select (id, property_id, version_label, source_revision, currency, effective_from, effective_to, status,
              payment_terms, cancellation, timezone, published_at, is_sample)
  on public.rate_card_versions to anon, authenticated;

-- R3/R4/R7: apply one card and all its rows atomically. Service role only.
create or replace function public.apply_rate_card(p jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  c jsonb := p -> 'card';
  prop uuid;
  cid uuid;
  prev record;
  missing integer;
begin
  select id into prop from public.properties where airtable_record_id = c ->> 'property_at';
  if prop is null then raise exception 'card %: unknown property', c ->> 'version_label'; end if;

  select id, status, source_revision, content_hash into prev
    from public.rate_card_versions where airtable_record_id = c ->> 'airtable_record_id';

  if c ->> 'status' = 'published' then
    -- R4: same revision, different content → must be re-approved at a new revision.
    if prev.id is not null and prev.status = 'published' and prev.source_revision = (c ->> 'source_revision')::int
       and prev.content_hash is not null and prev.content_hash <> c ->> 'content_hash' then
      raise exception 'card %: rates changed since revision % was approved — bump Revision and re-approve', c ->> 'version_label', prev.source_revision;
    end if;
    -- R7: no overlap with another card already published for this property.
    if exists (select 1 from public.rate_card_versions v
               where v.property_id = prop and v.status = 'published'
                 and v.airtable_record_id is distinct from c ->> 'airtable_record_id'
                 and v.is_sample = coalesce((c ->> 'is_sample')::boolean, false)
                 and v.effective_from <= (c ->> 'effective_to')::date and (c ->> 'effective_from')::date <= v.effective_to) then
      raise exception 'card %: overlaps another published card for this property', c ->> 'version_label';
    end if;
  end if;

  insert into public.rate_card_versions (airtable_record_id, property_id, version_label, supplier_contract_reference, source_revision,
    currency, effective_from, effective_to, status, payment_terms, cancellation, timezone, approved_by, approved_at, approved_revision,
    is_sample, content_hash, published_at, synced_at)
  values (c ->> 'airtable_record_id', prop, c ->> 'version_label', c ->> 'supplier_contract_reference', (c ->> 'source_revision')::int,
    c ->> 'currency', (c ->> 'effective_from')::date, (c ->> 'effective_to')::date, c ->> 'status', c -> 'payment_terms', c -> 'cancellation',
    c ->> 'timezone', c ->> 'approved_by', (c ->> 'approved_at')::timestamptz, (c ->> 'approved_revision')::int,
    coalesce((c ->> 'is_sample')::boolean, false), c ->> 'content_hash',
    case when c ->> 'status' = 'published' then now() end, now())
  on conflict (airtable_record_id) do update set
    property_id = excluded.property_id, version_label = excluded.version_label,
    supplier_contract_reference = excluded.supplier_contract_reference, source_revision = excluded.source_revision,
    currency = excluded.currency, effective_from = excluded.effective_from, effective_to = excluded.effective_to,
    status = excluded.status, payment_terms = excluded.payment_terms, cancellation = excluded.cancellation,
    timezone = excluded.timezone, approved_by = excluded.approved_by, approved_at = excluded.approved_at,
    approved_revision = excluded.approved_revision, is_sample = excluded.is_sample, content_hash = excluded.content_hash,
    published_at = case
      when excluded.status <> 'published' then null
      when public.rate_card_versions.status = 'published' and public.rate_card_versions.content_hash = excluded.content_hash
        then public.rate_card_versions.published_at
      else now() end,
    synced_at = now()
  returning id into cid;

  -- Replace children wholesale inside this transaction.
  delete from public.seasonal_rate_rules where rate_card_version_id = cid;
  delete from public.tax_fee_rules where rate_card_version_id = cid;
  delete from public.promotions where rate_card_version_id = cid;
  delete from public.inventory_restrictions where rate_card_version_id = cid;

  insert into public.seasonal_rate_rules (airtable_record_id, rate_card_version_id, room_type_id, rate_plan_id, season, stay_start, stay_end,
    booking_start, booking_end, base_occupancy, amount_minor, extra_adult_minor, child_bands, min_nights, max_nights, days_of_week, priority, active)
  select r ->> 'airtable_record_id', cid,
    (select id from public.room_types where airtable_record_id = r ->> 'room_type_at' and property_id = prop),
    (select id from public.rate_plans where airtable_record_id = r ->> 'rate_plan_at'),
    r ->> 'season', (r ->> 'stay_start')::date, (r ->> 'stay_end')::date, (r ->> 'booking_start')::date, (r ->> 'booking_end')::date,
    (r ->> 'base_occupancy')::smallint, (r ->> 'amount_minor')::bigint, (r ->> 'extra_adult_minor')::bigint, coalesce(r -> 'child_bands', '[]'),
    (r ->> 'min_nights')::smallint, (r ->> 'max_nights')::smallint,
    case when jsonb_typeof(r -> 'days_of_week') = 'array' then array(select jsonb_array_elements_text(r -> 'days_of_week')::smallint) end,
    coalesce((r ->> 'priority')::smallint, 0), coalesce((r ->> 'active')::boolean, true)
  from jsonb_array_elements(coalesce(p -> 'rules', '[]')) r;

  insert into public.tax_fee_rules (airtable_record_id, rate_card_version_id, name, jurisdiction, kind, charge_basis, amount_minor, percentage_bp, included_in_display_price, min_age)
  select t ->> 'airtable_record_id', cid, t ->> 'name', t ->> 'jurisdiction', t ->> 'kind', t ->> 'charge_basis',
    (t ->> 'amount_minor')::bigint, (t ->> 'percentage_bp')::int, coalesce((t ->> 'included_in_display_price')::boolean, false), (t ->> 'min_age')::smallint
  from jsonb_array_elements(coalesce(p -> 'taxes', '[]')) t;

  insert into public.promotions (airtable_record_id, rate_card_version_id, promotion_code, label, discount_type, discount_value,
    booking_start, booking_end, stay_start, stay_end, min_nights, eligible_rate_plans, stacking_policy, approval_status)
  select x ->> 'airtable_record_id', cid, x ->> 'promotion_code', x ->> 'label', x ->> 'discount_type', (x ->> 'discount_value')::int,
    (x ->> 'booking_start')::date, (x ->> 'booking_end')::date, (x ->> 'stay_start')::date, (x ->> 'stay_end')::date, (x ->> 'min_nights')::smallint,
    case when jsonb_array_length(coalesce(x -> 'eligible_plan_ats', '[]')) = 0 then null
         else array(select pl.id from public.rate_plans pl join public.room_types rt on rt.id = pl.room_type_id
                    where rt.property_id = prop and pl.airtable_record_id in (select jsonb_array_elements_text(x -> 'eligible_plan_ats'))) end,
    x ->> 'stacking_policy', x ->> 'approval_status'
  from jsonb_array_elements(coalesce(p -> 'promotions', '[]')) x;

  insert into public.inventory_restrictions (airtable_record_id, rate_card_version_id, room_type_id, start_date, end_date, restriction_type, minimum_stay)
  select x ->> 'airtable_record_id', cid,
    case when x ->> 'room_type_at' is null then null else (select id from public.room_types where airtable_record_id = x ->> 'room_type_at' and property_id = prop) end,
    (x ->> 'start_date')::date, (x ->> 'end_date')::date, x ->> 'restriction_type', (x ->> 'minimum_stay')::smallint
  from jsonb_array_elements(coalesce(p -> 'restrictions', '[]')) x;

  -- Every room, plan and room-specific restriction must have resolved; otherwise roll the whole card back.
  select count(*) into missing from public.seasonal_rate_rules where rate_card_version_id = cid and (room_type_id is null or rate_plan_id is null);
  if missing > 0 then raise exception 'card %: % rate row(s) point at a room or plan that is not synced', c ->> 'version_label', missing; end if;
  select count(*) into missing from jsonb_array_elements(coalesce(p -> 'restrictions', '[]')) x
    where x ->> 'room_type_at' is not null
      and not exists (select 1 from public.inventory_restrictions ir where ir.airtable_record_id = x ->> 'airtable_record_id' and ir.room_type_id is not null);
  if missing > 0 then raise exception 'card %: a restriction points at a room that is not synced', c ->> 'version_label'; end if;
  select count(*) into missing from jsonb_array_elements(coalesce(p -> 'promotions', '[]')) x
    where jsonb_array_length(coalesce(x -> 'eligible_plan_ats', '[]')) > 0
      and coalesce(array_length((select eligible_rate_plans from public.promotions pr where pr.airtable_record_id = x ->> 'airtable_record_id'), 1), 0)
          <> jsonb_array_length(x -> 'eligible_plan_ats');
  if missing > 0 then raise exception 'card %: an offer names a plan that is not synced', c ->> 'version_label'; end if;

  if p -> 'terms' is not null and jsonb_typeof(p -> 'terms') = 'object' then
    perform public.sync_contract_terms(jsonb_build_array((p -> 'terms') || jsonb_build_object('rate_card_version_id', cid)));
  end if;
  return cid;
end $$;

revoke all on function public.apply_rate_card(jsonb) from public, anon, authenticated;
grant execute on function public.apply_rate_card(jsonb) to service_role;

-- ===== 3. Phase 3 bookings and payments
create table public.bookings (
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
  traveler_note text check (char_length(traveler_note) <= 2000),
  advisor_user_id uuid references auth.users (id),
  advisor_name text check (char_length(advisor_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancel_note text check (char_length(cancel_note) <= 1000),
  balance_reminder_sent_at timestamptz,
  check (departure_date > arrival_date)
);
create index bookings_traveler_idx on public.bookings (traveler_user_id, arrival_date desc);
create index bookings_property_idx on public.bookings (property_id, arrival_date);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default ('P-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  traveler_user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('deposit', 'balance', 'other')),
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  provider text not null check (provider in ('stripe', 'manual')),
  provider_reference text check (char_length(provider_reference) <= 200),
  provider_event text check (char_length(provider_event) <= 200),
  note text check (char_length(note) <= 500),
  recorded_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  succeeded_at timestamptz,
  refunded_minor bigint not null default 0 check (refunded_minor >= 0),
  provider_charge text check (char_length(provider_charge) <= 200),
  refund_reference text check (char_length(refund_reference) <= 200)
);
create index payments_booking_idx on public.payments (booking_id, created_at);
create index payments_traveler_idx on public.payments (traveler_user_id, created_at desc);
create unique index payments_provider_ref_idx on public.payments (provider, provider_reference) where provider_reference is not null;

create or replace function private.bookings_touch()
returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at := now(); return new; end $$;
revoke execute on function private.bookings_touch() from public, anon, authenticated;
create trigger bookings_touch before update on public.bookings
  for each row execute function private.bookings_touch();

create or replace function public.settle_payment(p_payment uuid, p_event text default null)
returns public.bookings language plpgsql security definer set search_path = '' as $$
declare p public.payments; b public.bookings; owed bigint;
begin
  select * into p from public.payments where id = p_payment for update;
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;
  if p.status = 'succeeded' then select * into b from public.bookings where id = p.booking_id; return b; end if;
  if p.status <> 'pending' then raise exception 'payment is %', p.status using errcode = '23514'; end if;
  select * into b from public.bookings where id = p.booking_id for update;
  if b.status = 'cancelled' then raise exception 'booking is cancelled' using errcode = '23514'; end if;
  owed := b.grand_total_minor - b.deposit_paid_minor - b.balance_paid_minor;
  if p.amount_minor > owed then raise exception 'payment exceeds what is owed' using errcode = '23514'; end if;
  update public.payments set status = 'succeeded', succeeded_at = now(), provider_event = coalesce(p_event, provider_event) where id = p.id;
  if p.kind = 'deposit' then
    update public.bookings set deposit_paid_minor = deposit_paid_minor + p.amount_minor where id = b.id;
  else
    update public.bookings set balance_paid_minor = balance_paid_minor + p.amount_minor where id = b.id;
  end if;
  select * into b from public.bookings where id = b.id;
  update public.bookings set status = case
      when b.deposit_paid_minor + b.balance_paid_minor >= b.grand_total_minor then 'paid'
      when b.deposit_paid_minor >= b.deposit_due_minor and b.deposit_due_minor > 0 then 'deposit_paid'
      else b.status end
    where id = b.id and b.status in ('confirmed', 'deposit_paid');
  select * into b from public.bookings where id = b.id;
  return b;
end $$;

create or replace function public.refund_payment(p_payment uuid, p_amount bigint, p_reference text default null, p_note text default null)
returns public.bookings language plpgsql security definer set search_path = '' as $$
declare p public.payments; b public.bookings; room bigint;
begin
  select * into p from public.payments where id = p_payment for update;
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;
  if p.status not in ('succeeded', 'refunded') then raise exception 'only a succeeded payment can be refunded' using errcode = '23514'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'refund amount must be positive' using errcode = '23514'; end if;
  room := p.amount_minor - p.refunded_minor;
  if p_amount > room then raise exception 'refund exceeds what remains of this payment' using errcode = '23514'; end if;
  select * into b from public.bookings where id = p.booking_id for update;
  update public.payments set refunded_minor = refunded_minor + p_amount,
    status = case when refunded_minor + p_amount >= amount_minor then 'refunded' else status end,
    refund_reference = coalesce(p_reference, refund_reference), note = coalesce(p_note, note) where id = p.id;
  if p.kind = 'deposit' then
    update public.bookings set deposit_paid_minor = greatest(0, deposit_paid_minor - p_amount) where id = b.id;
  else
    update public.bookings set balance_paid_minor = greatest(0, balance_paid_minor - p_amount) where id = b.id;
  end if;
  select * into b from public.bookings where id = b.id;
  update public.bookings set status = case
      when b.deposit_paid_minor + b.balance_paid_minor >= b.grand_total_minor then 'paid'
      when b.deposit_paid_minor >= b.deposit_due_minor and b.deposit_due_minor > 0 then 'deposit_paid'
      else 'confirmed' end
    where id = b.id and b.status in ('confirmed', 'deposit_paid', 'paid');
  select * into b from public.bookings where id = b.id;
  return b;
end $$;

revoke all on function public.settle_payment(uuid, text) from public, anon, authenticated;
revoke all on function public.refund_payment(uuid, bigint, text, text) from public, anon, authenticated;
grant execute on function public.settle_payment(uuid, text) to service_role;
grant execute on function public.refund_payment(uuid, bigint, text, text) to service_role;

alter table public.bookings enable row level security;
alter table public.payments enable row level security;

create policy bookings_read on public.bookings for select to authenticated using (
  traveler_user_id = (select auth.uid()) or private.has_org_role(array['admin', 'advisor'])
);
create policy payments_read on public.payments for select to authenticated using (
  traveler_user_id = (select auth.uid()) or private.has_org_role(array['admin', 'advisor'])
);

revoke insert, update, delete, truncate, references, trigger on public.bookings, public.payments from anon, authenticated;
revoke all on public.bookings, public.payments from anon;
grant select on public.bookings, public.payments to authenticated;

create trigger audit_bookings after insert or update or delete on public.bookings
  for each row execute function private.audit_row();
create trigger audit_payments after insert or update or delete on public.payments
  for each row execute function private.audit_row();

-- ===== 4. Quote holds and house read access to profiles
alter table public.quotes
  add column held_until timestamptz,
  add column hold_note text check (char_length(hold_note) <= 1000);

create policy profiles_select_house on public.profiles for select to authenticated
  using (private.has_org_role(array['admin', 'advisor']));
