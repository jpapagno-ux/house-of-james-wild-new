-- SUPERSEDED 1 Nov 2026: captured in supabase/migrations/20261101170000_drift_sync_out_of_band_objects.sql.
-- Kept for history only. Do not run.
-- Booking Live · Phase 2 · run ONCE in the Supabase SQL editor (project JWC Booking Live).
-- Second half of migration 20261027001000_review_fixes.sql. The first half (columns,
-- sample marking, offer limits, quote lock) was applied on 27 Oct; the connector timed
-- out waiting for approval on this half because the function replaces a card's rows.
-- Safe to re-run.

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

select 'apply_rate_card installed' as result where exists (select 1 from pg_proc where proname = 'apply_rate_card');
