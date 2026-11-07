-- Advisor Desk · Step 1 · row-level security tests (same shape as rls_partner_desk.sql: one DO block
-- that always ends by raising, so everything rolls back; the message is the JSON result list).
--
-- (S) an advisor reads only what they sold, and only with the authenticator code; the house reads all
-- as house operations (with the code); a leftover internal "advisor" membership opens nothing.

do $$
declare
  jw uuid := gen_random_uuid(); aa uuid := gen_random_uuid(); ab uuid := gen_random_uuid();
  t1 uuid := gen_random_uuid(); t2 uuid := gen_random_uuid(); lg uuid := gen_random_uuid();
  o_jw uuid; o_ag uuid; p uuid; rt uuid; rp uuid;
  adv_a uuid; adv_b uuid; q1 uuid; q2 uuid; b1 uuid; b2 uuid; f1 uuid; f2 uuid;
  n int; ok boolean;
  ai uuid := gen_random_uuid(); adv_i uuid; ag uuid; d1 uuid; d2 uuid; js jsonb;
  r jsonb := '[]';
begin
  -- ===== setup as the database owner
  insert into auth.users (id, email, email_confirmed_at, aud, role) values
    (jw, 'jw@adv.test', now(), 'authenticated', 'authenticated'),
    (aa, 'advisor.a@adv.test', now(), 'authenticated', 'authenticated'),
    (ab, 'advisor.b@adv.test', now(), 'authenticated', 'authenticated'),
    (t1, 'client.one@adv.test', now(), 'authenticated', 'authenticated'),
    (t2, 'client.two@adv.test', now(), 'authenticated', 'authenticated'),
    (lg, 'legacy@adv.test', now(), 'authenticated', 'authenticated');
  insert into public.profiles (id, email, first_name) values (t1, 'client.one@adv.test', 'Client'), (t2, 'client.two@adv.test', 'Other') on conflict (id) do update set first_name = excluded.first_name;
  insert into public.organizations (name, type, slug) values ('ADV House', 'internal', 'adv-house') returning id into o_jw;
  insert into public.organizations (name, type, slug) values ('ADV Agency', 'agency', 'adv-agency') returning id into o_ag;
  insert into public.organization_memberships (user_id, organization_id, role) values
    (jw, o_jw, 'jw_admin'), (lg, o_jw, 'advisor'), (ab, o_ag, 'advisor');
  insert into public.advisors (adv_number, slug, display_name, user_id, organization_id, status) values
    ('ADV-2026-990001', 'adv-test-a', 'Advisor A', aa, null, 'active') returning id into adv_a;
  insert into public.advisors (adv_number, slug, display_name, user_id, organization_id, status) values
    ('ADV-2026-990002', 'adv-test-b', 'Advisor B', ab, o_ag, 'active') returning id into adv_b;

  insert into public.properties (legacy_cms_id, name, slug, publication_status) values ('STY-2026-899981', 'ADV Lodge', 'adv-lodge', 'published') returning id into p;
  insert into public.room_types (property_id, code, name, max_adults, max_occupancy, unit_type) values (p, 'suite', 'Suite', 2, 2, 'suite') returning id into rt;
  insert into public.rate_plans (room_type_id, code, name, board_basis, refundability, active) values (rt, 'fi', 'Fully inclusive', 'fully_inclusive', 'refundable', true) returning id into rp;

  insert into public.quotes (traveler_user_id, property_id, room_type_id, rate_plan_id, source, price_revision, arrival_date, departure_date, adults, currency,
    subtotal_minor, grand_total_minor, deposit_due_minor, policy_snapshot, price_breakdown, expires_at, selling_advisor_id)
  values (t1, p, rt, rp, 'contracted_card', 'r1', '2027-05-10', '2027-05-13', 2, 'USD', 300000, 300000, 90000, '{}', '{}', now() + interval '7 days', adv_a) returning id into q1;
  insert into public.quotes (traveler_user_id, property_id, room_type_id, rate_plan_id, source, price_revision, arrival_date, departure_date, adults, currency,
    subtotal_minor, grand_total_minor, deposit_due_minor, policy_snapshot, price_breakdown, expires_at, selling_advisor_id)
  values (t2, p, rt, rp, 'contracted_card', 'r1', '2027-06-10', '2027-06-13', 2, 'USD', 300000, 300000, 90000, '{}', '{}', now() + interval '7 days', adv_b) returning id into q2;
  insert into public.bookings (traveler_user_id, property_id, source, arrival_date, departure_date, adults, currency, grand_total_minor, selling_advisor_id)
  values (t1, p, 'advisor', '2027-05-10', '2027-05-13', 2, 'USD', 300000, adv_a) returning id into b1;
  insert into public.bookings (traveler_user_id, property_id, source, arrival_date, departure_date, adults, currency, grand_total_minor, selling_advisor_id)
  values (t2, p, 'advisor', '2027-06-10', '2027-06-13', 2, 'USD', 300000, adv_b) returning id into b2;
  insert into public.payments (booking_id, traveler_user_id, kind, amount_minor, currency, provider) values (b1, t1, 'deposit', 90000, 'USD', 'manual'), (b2, t2, 'deposit', 90000, 'USD', 'manual');
  insert into public.folios (owner_user_id, title, selling_advisor_id) values (t1, 'May in the Sabi Sand', adv_a) returning id into f1;
  insert into public.folios (owner_user_id, title, selling_advisor_id) values (t2, 'June in the Delta', adv_b) returning id into f2;

  -- ===== (S) advisor A, with the code
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', aa, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select count(*) into n from public.quotes where id in (q1, q2);
  r := r || jsonb_build_object('t', 'S01 an advisor sees the quote they sold, not another advisor''s', 'pass', n = 1 and exists (select 1 from public.quotes where id = q1));
  select count(*) into n from public.bookings where id in (b1, b2);
  r := r || jsonb_build_object('t', 'S02 and only their own booking', 'pass', n = 1 and exists (select 1 from public.bookings where id = b1));
  select count(*) into n from public.payments where booking_id in (b1, b2);
  r := r || jsonb_build_object('t', 'S03 and only that booking''s payment', 'pass', n = 1);
  select count(*) into n from public.profiles where id in (t1, t2);
  r := r || jsonb_build_object('t', 'S04 and only their own client''s name', 'pass', n = 1 and exists (select 1 from public.profiles where id = t1));
  select count(*) into n from public.folios where id in (f1, f2);
  r := r || jsonb_build_object('t', 'S05 and only the folio they sell', 'pass', n = 1 and exists (select 1 from public.folios where id = f1));
  select count(*) into n from public.advisors;
  r := r || jsonb_build_object('t', 'S06 an advisor sees their own advisor record only', 'pass', n = 1);
  begin perform public.set_selling_advisor('quote', q2, adv_a); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'S07 an advisor cannot take another advisor''s client', 'pass', ok);
  begin update public.advisors set status = 'active' where id = adv_a; get diagnostics n = row_count; ok := n = 0; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'S08 nor change their own advisor record', 'pass', ok);
  begin update public.quotes set selling_advisor_id = adv_a where id = q1; ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'S09 nor write to quotes directly', 'pass', ok);
  select count(*) into n from public.commission_terms;
  r := r || jsonb_build_object('t', 'S10 and never sees partner commission terms', 'pass', n = 0);

  -- without the code
  perform set_config('request.jwt.claims', json_build_object('sub', aa, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  select count(*) into n from public.quotes where id in (q1, q2);
  r := r || jsonb_build_object('t', 'S11 an advisor with a password only sees no quotes', 'pass', n = 0);
  select count(*) into n from public.bookings where id in (b1, b2);
  r := r || jsonb_build_object('t', 'S12 and no bookings', 'pass', n = 0);

  -- an advisor in an agency organization, with the code
  perform set_config('request.jwt.claims', json_build_object('sub', ab, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select count(*) into n from public.bookings where id in (b1, b2);
  r := r || jsonb_build_object('t', 'S13 an agency advisor with an advisor membership still sees only their own', 'pass', n = 1 and exists (select 1 from public.bookings where id = b2));

  -- the leftover internal "advisor" membership
  perform set_config('request.jwt.claims', json_build_object('sub', lg, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select count(*) into n from public.quotes where id in (q1, q2);
  r := r || jsonb_build_object('t', 'S14 an internal "advisor" membership alone no longer reads every quote', 'pass', n = 0);
  select count(*) into n from public.payments where booking_id in (b1, b2);
  r := r || jsonb_build_object('t', 'S15 nor every payment', 'pass', n = 0);

  -- the house
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  select count(*) into n from public.quotes where id in (q1, q2);
  r := r || jsonb_build_object('t', 'S16 the house with a password only sees no quotes', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select count(*) into n from public.quotes where id in (q1, q2);
  r := r || jsonb_build_object('t', 'S17 the house with the code sees every quote', 'pass', n = 2);
  select count(*) into n from public.payments where booking_id in (b1, b2);
  r := r || jsonb_build_object('t', 'S18 and every payment', 'pass', n = 2);
  select count(*) into n from public.advisors where id in (adv_a, adv_b);
  r := r || jsonb_build_object('t', 'S19 and every advisor', 'pass', n = 2);
  perform public.set_selling_advisor('quote', q2, adv_a);
  r := r || jsonb_build_object('t', 'S20 the house can reassign the selling advisor', 'pass', (select selling_advisor_id from public.quotes where id = q2) = adv_a);
  begin perform public.set_selling_advisor('quote', q2, gen_random_uuid()); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'S21 but only to a real advisor', 'pass', ok);

  -- a paused advisor
  perform set_config('role', 'postgres', true);
  update public.advisors set status = 'paused' where id = adv_a;
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', aa, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select count(*) into n from public.quotes;
  r := r || jsonb_build_object('t', 'S22 a paused advisor sees nothing', 'pass', n = 0);

  -- the traveller and the public
  perform set_config('request.jwt.claims', json_build_object('sub', t1, 'role', 'authenticated')::text, true);
  select count(*) into n from public.quotes where id in (q1, q2);
  r := r || jsonb_build_object('t', 'S23 a traveller still sees their own quote', 'pass', n = 1);
  select count(*) into n from public.advisors;
  r := r || jsonb_build_object('t', 'S24 and no advisor records', 'pass', n = 0);
  perform set_config('role', 'anon', true);
  begin select count(*) into n from public.advisors; ok := n = 0; exception when insufficient_privilege then ok := true; end;
  r := r || jsonb_build_object('t', 'S25 the public sees no advisor records', 'pass', ok);
  perform set_config('role', 'postgres', true);

  -- ===== (T) step 3: the advisor's file
  perform set_config('role', 'postgres', true);
  insert into auth.users (id, email, email_confirmed_at, aud, role) values (ai, 'advisor.new@adv.test', now(), 'authenticated', 'authenticated');
  insert into public.advisors (adv_number, slug, display_name, user_id, status) values ('ADV-2026-990003', 'adv-test-new', 'Nora New', ai, 'invited') returning id into adv_i;
  update public.advisors set status = 'active' where id = adv_a;
  update public.advisor_agreements set status = 'retired' where status = 'current';
  insert into public.advisor_agreements (version, title, body, status, is_placeholder)
    values ('t-placeholder', 'Independent Marketing Agreement', repeat('Draft agreement text. ', 20), 'current', true) returning id into ag;
  perform set_config('role', 'authenticated', true);

  perform set_config('request.jwt.claims', json_build_object('sub', ai, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  select count(*) into n from public.advisor_agreements;
  r := r || jsonb_build_object('t', 'T01 an invited advisor without the code sees no agreement', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', ai, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select count(*) into n from public.advisor_agreements where id = ag;
  r := r || jsonb_build_object('t', 'T02 with the code, the current agreement', 'pass', n = 1);
  begin perform public.sign_advisor_agreement(ag, 'Nora New'); ok := false; exception when others then ok := sqlerrm like '%details%'; end;
  r := r || jsonb_build_object('t', 'T03 cannot sign before the details are on file', 'pass', ok);
  begin insert into public.advisor_details (advisor_id, legal_name, mailing_address, notice_email, residence_country) values (adv_a, 'Not Me', '1 Street, Town', 'x@adv.test', 'US'); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'T04 cannot write another advisor''s details', 'pass', ok);
  insert into public.advisor_details (advisor_id, legal_name, mailing_address, notice_email, residence_country) values (adv_i, 'Nora  Q. New', '1 Ocean Drive, Miami FL 33139', 'nora@adv.test', 'US');
  r := r || jsonb_build_object('t', 'T05 an invited advisor fills in their own details', 'pass', exists (select 1 from public.advisor_details where advisor_id = adv_i));
  begin perform public.sign_advisor_agreement(ag, 'Nora New'); ok := false; exception when others then ok := sqlerrm like '%legal name%'; end;
  r := r || jsonb_build_object('t', 'T06 the typed name must match the legal name', 'pass', ok);
  perform public.sign_advisor_agreement(ag, ' nora q.  new ', 'test-agent');
  select count(*) into n from public.advisor_signatures where advisor_id = adv_i and version = 't-placeholder' and aal = 'aal2'
    and body_sha256 = encode(extensions.digest(repeat('Draft agreement text. ', 20), 'sha256'), 'hex');
  r := r || jsonb_build_object('t', 'T07 signed: version, exact text fingerprint and the code are recorded', 'pass', n = 1);
  begin perform public.sign_advisor_agreement(ag, 'Nora Q. New'); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'T08 one signature per version', 'pass', ok);
  begin delete from public.advisor_signatures where advisor_id = adv_i; get diagnostics n = row_count; ok := n = 0; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'T09 a signature cannot be deleted', 'pass', ok);
  js := public.my_advisor_plan();
  r := r || jsonb_build_object('t', 'T10 their plan: Tier 2 at 70% until the house sets a tier', 'pass', js ->> 'tier' = 'tier_2' and (js ->> 'share_bp')::int = 7000 and not (js ->> 'tier_assigned')::boolean);
  perform public.acknowledge_advisor_plan();
  r := r || jsonb_build_object('t', 'T11 acknowledging the plan keeps a snapshot', 'pass', exists (select 1 from public.advisor_plan_acks where advisor_id = adv_i and share_bp = 7000));
  insert into public.advisor_documents (advisor_id, kind, title, storage_path, mime_type, size_bytes, uploaded_by)
    values (adv_i, 'tax_form', 'W-9', adv_i::text || '/tax_form/aaaaaaaa-w9.pdf', 'application/pdf', 1200, ai) returning id into d1;
  insert into public.advisor_documents (advisor_id, kind, title, storage_path, mime_type, size_bytes, uploaded_by)
    values (adv_i, 'eo_insurance', 'E&O certificate', adv_i::text || '/eo_insurance/bbbbbbbb-eo.pdf', 'application/pdf', 1200, ai) returning id into d2;
  r := r || jsonb_build_object('t', 'T12 an advisor files their own documents', 'pass', (select count(*) from public.advisor_documents where advisor_id = adv_i) = 2);
  begin insert into public.advisor_documents (advisor_id, kind, title, storage_path, mime_type, size_bytes, uploaded_by, status)
    values (adv_i, 'other', 'Sneaky', adv_i::text || '/other/cccccccc-x.pdf', 'application/pdf', 10, ai, 'accepted'); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'T13 but cannot file one as already accepted', 'pass', ok);
  begin update public.advisor_documents set status = 'accepted' where id = d1; ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'T14 nor accept their own document', 'pass', ok);
  begin perform public.decide_advisor_document(d1, 'accepted'); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'T15 nor use the house''s decision', 'pass', ok);
  insert into storage.objects (bucket_id, name) values ('advisor-files', adv_i::text || '/tax_form/aaaaaaaa-w9.pdf');
  begin insert into storage.objects (bucket_id, name) values ('advisor-files', adv_a::text || '/tax_form/dddddddd-w9.pdf'); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'T16 files go only into their own folder', 'pass', ok);
  select count(*) into n from storage.objects where bucket_id = 'advisor-files';
  r := r || jsonb_build_object('t', 'T17 and they can read their own filed file', 'pass', n = 1);
  begin perform public.activate_advisor(adv_i); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'T18 an advisor cannot activate themselves', 'pass', ok);
  js := public.my_advisor_file_state();
  r := r || jsonb_build_object('t', 'T19 their file shows what is done and what waits for the house', 'pass',
    (js ->> 'details')::boolean and (js ->> 'plan')::boolean and (js ->> 'agreement')::boolean and (js ->> 'tax_form')::boolean and not (js ->> 'tax_form_accepted')::boolean);

  -- another advisor sees none of it
  perform set_config('request.jwt.claims', json_build_object('sub', aa, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select (select count(*) from public.advisor_details where advisor_id = adv_i) + (select count(*) from public.advisor_documents where advisor_id = adv_i)
       + (select count(*) from public.advisor_signatures where advisor_id = adv_i) + (select count(*) from storage.objects where bucket_id = 'advisor-files') into n;
  r := r || jsonb_build_object('t', 'T20 another advisor sees none of the file', 'pass', n = 0);

  -- the house
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  begin perform public.activate_advisor(adv_i); ok := false; exception when others then ok := sqlerrm like '%not complete%'; end;
  r := r || jsonb_build_object('t', 'T21 the house cannot activate before the documents are accepted', 'pass', ok);
  begin perform public.decide_advisor_document(d2, 'returned', ''); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'T22 a returned document needs a reason', 'pass', ok);
  perform public.decide_advisor_document(d1, 'accepted'); perform public.decide_advisor_document(d2, 'accepted');
  begin perform public.activate_advisor(adv_i); ok := false; exception when others then ok := sqlerrm like '%draft%'; end;
  r := r || jsonb_build_object('t', 'T23 on the draft agreement, only house advisors can be activated', 'pass', ok);
  perform set_config('role', 'postgres', true);
  update public.advisors set house_advisor = true where id = adv_i;
  perform set_config('role', 'authenticated', true);
  perform public.activate_advisor(adv_i);
  r := r || jsonb_build_object('t', 'T24 complete file: the house activates', 'pass', (select status from public.advisors where id = adv_i) = 'active');
  perform public.set_advisor_plan(adv_i, 'tier_1', current_date, 24900, 'year', 'Monthly statement; paid within 15 days by ACH');
  perform set_config('role', 'postgres', true);
  select private.advisor_plan(adv_i) into js;
  perform set_config('role', 'authenticated', true);
  r := r || jsonb_build_object('t', 'T25 the house sets tier and fee; the plan follows', 'pass', (js ->> 'share_bp')::int = 7500 and (js ->> 'program_fee_minor')::int = 24900);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  select count(*) into n from public.advisor_details;
  r := r || jsonb_build_object('t', 'T26 the house without the code sees no advisor files', 'pass', n = 0);
  perform set_config('role', 'anon', true);
  begin select count(*) into n from public.advisor_agreements; ok := n = 0; exception when insufficient_privilege then ok := true; end;
  r := r || jsonb_build_object('t', 'T27 the public sees no agreement or file', 'pass', ok);
  perform set_config('role', 'postgres', true);

  raise exception 'ADVISOR_DESK_RLS %', r;
end $$;
