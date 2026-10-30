-- Booking Live · Phase 2 · rate-card and quote access tests (spec §16 cases 19, 8).
-- 12 checks; always ends with an exception so every test row is rolled back.
-- Passed 12/12 on 27 Oct 2026.
do $$
declare prop uuid; rt uuid; rp uuid; pub uuid; dr uuid; r jsonb := '[]'; n int; ok boolean; u uuid := gen_random_uuid(); v uuid := gen_random_uuid();
begin
  select id into prop from public.properties where slug = 'leeu-estates';
  insert into public.room_types (property_id, code, name, max_adults, max_children, max_occupancy) values (prop, 'test-suite', 'Test Suite', 2, 1, 3) returning id into rt;
  insert into public.rate_plans (room_type_id, code, name, board_basis) values (rt, 'bb', 'B&B', 'bed_breakfast') returning id into rp;
  insert into public.rate_card_versions (property_id, version_label, currency, effective_from, effective_to, status) values (prop, 'TEST-PUB', 'USD', '2027-01-01', '2027-12-31', 'published') returning id into pub;
  insert into public.rate_card_versions (property_id, version_label, currency, effective_from, effective_to, status) values (prop, 'TEST-DRAFT', 'USD', '2027-01-01', '2027-12-31', 'draft') returning id into dr;
  insert into public.seasonal_rate_rules (rate_card_version_id, room_type_id, rate_plan_id, season, stay_start, stay_end, base_occupancy, amount_minor) values (pub, rt, rp, 'High', '2027-01-01', '2027-03-31', 2, 50000), (dr, rt, rp, 'High', '2027-01-01', '2027-03-31', 2, 99999);
  insert into public.promotions (rate_card_version_id, promotion_code, label, discount_type, discount_value, approval_status) values (pub, 'OK10', 'ok', 'percent', 1000, 'approved'), (pub, 'DRAFT50', 'draft', 'percent', 5000, 'draft');
  insert into private.contract_terms (rate_card_version_id, rates_are_net, commission_bp) values (pub, true, 1500);
  insert into auth.users (id, email, email_confirmed_at, aud, role) values (u, 'qa@test.jwc', now(), 'authenticated', 'authenticated'), (v, 'qb@test.jwc', now(), 'authenticated', 'authenticated');
  insert into public.quotes (traveler_user_id, property_id, room_type_id, rate_plan_id, rate_card_version_id, source, price_revision, arrival_date, departure_date, adults, currency, subtotal_minor, grand_total_minor, deposit_due_minor, policy_snapshot, price_breakdown, expires_at)
    values (u, prop, rt, rp, pub, 'contracted_card', 'x#1', '2027-02-01', '2027-02-04', 2, 'USD', 150000, 160500, 48150, '{}', '{}', now() + interval '1 day');
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  select count(*) into n from public.rate_card_versions where version_label like 'TEST-%';
  r := r || jsonb_build_object('t', 'anon sees published card only', 'pass', n = 1);
  select count(*) into n from public.seasonal_rate_rules where room_type_id = rt;
  r := r || jsonb_build_object('t', 'anon sees published rules only (not draft 99999)', 'pass', n = 1);
  select count(*) into n from public.promotions where rate_card_version_id = pub;
  r := r || jsonb_build_object('t', 'anon sees approved promotions only', 'pass', n = 1);
  begin perform count(*) from private.contract_terms; ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'net rates and commission unreadable', 'pass', ok);
  begin perform count(*) from public.quotes; ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'anon cannot read quotes', 'pass', ok);
  begin insert into public.seasonal_rate_rules (rate_card_version_id, room_type_id, rate_plan_id, season, stay_start, stay_end, base_occupancy, amount_minor) values (pub, rt, rp, 'Hack', '2027-01-01', '2027-01-02', 2, 1); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'anon cannot write rates', 'pass', ok);
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', v, 'role', 'authenticated')::text, true);
  select count(*) into n from public.quotes;
  r := r || jsonb_build_object('t', 'traveler B cannot see traveler A quote', 'pass', n = 0);
  begin insert into public.quotes (traveler_user_id, property_id, room_type_id, rate_plan_id, source, price_revision, arrival_date, departure_date, adults, currency, subtotal_minor, grand_total_minor, deposit_due_minor, policy_snapshot, price_breakdown, expires_at) values (v, prop, rt, rp, 'manual', 'x', '2027-02-01', '2027-02-02', 1, 'USD', 1, 1, 0, '{}', '{}', now()); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'travelers cannot write their own quote (no price tampering)', 'pass', ok);
  perform set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true);
  select count(*) into n from public.quotes;
  r := r || jsonb_build_object('t', 'traveler A sees own quote', 'pass', n = 1);
  begin update public.quotes set grand_total_minor = 1; ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'traveler A cannot change the price', 'pass', ok);
  perform set_config('role', 'postgres', true);
  begin update public.quotes set grand_total_minor = 1 where traveler_user_id = u; ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'even the server cannot change a stored quote price', 'pass', ok);
  select count(*) into n from private.audit_logs where entity_type = 'contract_terms' and entity_id = pub::text;
  r := r || jsonb_build_object('t', 'contract terms changes audited', 'pass', n = 1);
  raise exception 'PHASE2_RLS %', r;
end $$;
