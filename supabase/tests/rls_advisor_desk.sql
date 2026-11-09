-- Advisor Desk · Step 1 · row-level security tests (same shape as rls_partner_desk.sql: one DO block
-- that always ends by raising, so everything rolls back; the message is the JSON result list).
--
-- (S) an advisor reads only what they sold, and only with the authenticator code; the house reads all
-- as house operations (with the code); a leftover internal "advisor" membership opens nothing.

do $$
declare
  jw uuid := gen_random_uuid(); aa uuid := gen_random_uuid(); ab uuid := gen_random_uuid();
  t1 uuid := gen_random_uuid(); t2 uuid := gen_random_uuid(); lg uuid := gen_random_uuid();
  o_jw uuid; o_ag uuid; p uuid; rt uuid; rp uuid; pd1 uuid; pd2 uuid; dna jsonb; rq uuid; rq2 uuid; o_pt uuid; cl uuid;
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

  -- (D) part five: Advisor DNA, sent by the advisor
  dna := '{"pathways":["PATH-04","PATH-02"],"volumes":["safaris"],"party_types":["family"],"countries":["botswana","kenya"],"languages":["English"],"specialties":["First safaris"],"availability":"open","match_note":"I plan first safaris for families.","marks":[{"ledgerId":"STY-2026-000101","mark":"Stayed","when":"2025"}]}';
  begin perform public.submit_advisor_dna(jsonb_set(dna, '{pathways}', '["PATH-99"]')); ok := false; exception when others then ok := sqlerrm like '%Pathways%' or sqlerrm like '%pathways%'; end;
  r := r || jsonb_build_object('t', 'D01 a Pathway not on the list is refused', 'pass', ok);
  begin perform public.submit_advisor_dna(jsonb_set(dna, '{countries}', '[]')); ok := false; exception when others then ok := sqlerrm like '%country%'; end;
  r := r || jsonb_build_object('t', 'D02 at least one country is needed', 'pass', ok);
  begin perform public.submit_advisor_dna(jsonb_set(dna, '{marks}', '[{"ledgerId":"STY-2026-000101","mark":"Sent Guests"}]')); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'D03 an advisor cannot claim Sent Guests (bookings prove that)', 'pass', ok);
  pd1 := public.submit_advisor_dna(dna);
  js := public.my_advisor_file_state();
  r := r || jsonb_build_object('t', 'D04 sent: part five done, waiting for the house', 'pass', (js ->> 'dna')::boolean and not (js ->> 'dna_approved')::boolean);
  pd2 := public.submit_advisor_dna(jsonb_set(dna, '{countries}', '["botswana","kenya","tanzania"]'));
  r := r || jsonb_build_object('t', 'D05 sending again replaces the one waiting', 'pass',
    (select status from public.advisor_dna_proposals where id = pd1) = 'withdrawn' and (select count(*) from public.advisor_dna_proposals where advisor_id = adv_i and status = 'submitted') = 1);
  begin perform public.decide_advisor_dna(pd2, 'approved'); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'D06 an advisor cannot approve their own DNA', 'pass', ok);
  begin insert into public.advisor_dna (advisor_id, confirmed_at) values (adv_i, now()); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'D07 nor write the published DNA directly', 'pass', ok);

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
  begin perform public.activate_advisor(adv_i); ok := false; exception when others then ok := sqlerrm like '%not complete%'; end;
  r := r || jsonb_build_object('t', 'D08 activation also waits for approved DNA', 'pass', ok);
  begin perform public.decide_advisor_dna(pd2, 'returned', ' '); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'D09 returned DNA needs a reason', 'pass', ok);
  perform public.decide_advisor_dna(pd2, 'approved');
  r := r || jsonb_build_object('t', 'D10 approved: the DNA is published from the proposal', 'pass',
    (select countries from public.advisor_dna where advisor_id = adv_i) = array['botswana','kenya','tanzania'] and (select jsonb_array_length(marks) from public.advisor_dna where advisor_id = adv_i) = 1);
  perform set_config('role', 'anon', true);
  js := public.public_advisor_dna();
  perform set_config('role', 'authenticated', true);
  r := r || jsonb_build_object('t', 'D11 the website does not show an advisor before activation', 'pass', not exists (select 1 from jsonb_array_elements(js) e where e ->> 'slug' = 'adv-test-new'));
  begin perform public.activate_advisor(adv_i); ok := false; exception when others then ok := sqlerrm like '%draft%'; end;
  r := r || jsonb_build_object('t', 'T23 on the draft agreement, only house advisors can be activated', 'pass', ok);
  perform set_config('role', 'postgres', true);
  update public.advisors set house_advisor = true where id = adv_i;
  perform set_config('role', 'authenticated', true);
  perform public.activate_advisor(adv_i);
  r := r || jsonb_build_object('t', 'T24 complete file: the house activates', 'pass', (select status from public.advisors where id = adv_i) = 'active');
  perform set_config('role', 'anon', true);
  js := public.public_advisor_dna();
  perform set_config('role', 'authenticated', true);
  r := r || jsonb_build_object('t', 'D12 once active, the website reads the approved DNA, public fields only', 'pass',
    exists (select 1 from jsonb_array_elements(js) e where e ->> 'slug' = 'adv-test-new' and not (e ->> 'hidden')::boolean and e -> 'countries' ? 'tanzania' and e ->> 'matchNote' like 'I plan%' and not e ? 'legal_name'));
  perform set_config('role', 'postgres', true);
  update public.advisors set status = 'paused' where id = adv_i;
  perform set_config('role', 'anon', true);
  js := public.public_advisor_dna();
  perform set_config('role', 'postgres', true);
  update public.advisors set status = 'active' where id = adv_i;
  perform set_config('role', 'authenticated', true);
  r := r || jsonb_build_object('t', 'D13 a paused advisor is published as hidden, nothing else', 'pass',
    exists (select 1 from jsonb_array_elements(js) e where e ->> 'slug' = 'adv-test-new' and (e ->> 'hidden')::boolean and not e ? 'countries'));
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

  -- (R) step 5: quote requests
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', aa, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  js := public.create_advisor_request(jsonb_build_object('client_name', 'Ana Reyes', 'client_email', 'Ana@Example.test', 'stay_slug', 'lion-sands', 'ledger_id', 'STY-2026-290658', 'stay_name', 'Lion Sands Reserve',
    'arrival', (current_date + 120)::text, 'departure', (current_date + 123)::text, 'adults', 2, 'child_ages', '[12]'::jsonb, 'notes', 'Anniversary', 'estimate', '{"source":"MORE rate card","options":[]}'::jsonb));
  rq := (js ->> 'id')::uuid;
  r := r || jsonb_build_object('t', 'R01 an active advisor sends a request with a house reference', 'pass', js ->> 'ref' ~ '^AR-\d{4}-\d{6}$' and (select client_email from public.advisor_requests where id = rq) = 'ana@example.test');
  begin perform public.create_advisor_request(jsonb_build_object('client_name', 'Ana', 'stay_slug', 'lion-sands', 'stay_name', 'x', 'arrival', (current_date - 1)::text, 'departure', (current_date + 2)::text, 'adults', 2)); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'R02 not for a past arrival', 'pass', ok);
  begin insert into public.advisor_requests (advisor_id, client_name, stay_slug, stay_name, arrival, departure, adults, created_by) values (adv_a, 'X Y', 'x', 'x', current_date + 5, current_date + 6, 1, aa); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'R03 no writing the table directly', 'pass', ok);
  begin perform public.decide_advisor_request(rq, 'held', 100000, 'USD', current_date + 3, null, null); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'R04 an advisor cannot price or hold their own request', 'pass', ok);
  perform set_config('request.jwt.claims', json_build_object('sub', ab, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select count(*) into n from public.advisor_requests where id = rq;
  r := r || jsonb_build_object('t', 'R05 another advisor cannot see it', 'pass', n = 0);
  begin perform public.withdraw_advisor_request(rq); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'R06 nor withdraw it', 'pass', ok);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  select count(*) into n from public.advisor_requests where id = rq;
  r := r || jsonb_build_object('t', 'R07 the house without the code sees nothing', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  begin perform public.decide_advisor_request(rq, 'held', null, null, current_date + 3, null, null); ok := false; exception when others then ok := sqlerrm like '%price%'; end;
  r := r || jsonb_build_object('t', 'R08 a hold needs a price', 'pass', ok);
  perform public.decide_advisor_request(rq, 'pricing', null, null, null, null, null);
  perform public.decide_advisor_request(rq, 'held', 1840000, 'USD', current_date + 3, current_date + 10, 'Ivory Lodge suite held');
  r := r || jsonb_build_object('t', 'R09 the house prices and holds it', 'pass', (select status = 'held' and price_minor = 1840000 and hold_until = current_date + 3 from public.advisor_requests where id = rq));
  perform set_config('request.jwt.claims', json_build_object('sub', aa, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  select count(*) into n from public.advisor_requests where id = rq and status = 'held' and house_note like 'Ivory%';
  r := r || jsonb_build_object('t', 'R10 the advisor sees the hold, price and note', 'pass', n = 1);
  perform public.withdraw_advisor_request(rq);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  begin perform public.decide_advisor_request(rq, 'confirmed', 1840000, 'USD', null, null, null); ok := false; exception when others then ok := sqlerrm like '%closed%'; end;
  r := r || jsonb_build_object('t', 'R11 a withdrawn request is closed', 'pass', ok);
  perform set_config('role', 'anon', true);
  begin select count(*) into n from public.advisor_requests; ok := n = 0; exception when insufficient_privilege then ok := true; end;
  r := r || jsonb_build_object('t', 'R12 the public sees no request', 'pass', ok);
  perform set_config('role', 'postgres', true);

  -- (C) step 6: the commission ledger
  perform set_config('role', 'postgres', true);
  insert into public.organizations (name, type, slug) values ('ADV Partner', 'partner', 'adv-partner') returning id into o_pt;
  insert into public.entity_partners (property_id, organization_id, role, is_primary) values (p, o_pt, 'owner', true);
  insert into public.commission_terms (organization_id, rate_bp, effective_from, status) values (o_pt, 2000, current_date - 30, 'confirmed');
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', aa, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  rq2 := (public.create_advisor_request(jsonb_build_object('client_name', 'Ana Reyes', 'stay_slug', 'adv-lodge', 'stay_name', 'ADV Lodge',
    'arrival', (current_date + 60)::text, 'departure', (current_date + 64)::text, 'adults', 2)) ->> 'id')::uuid;
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  begin perform public.record_commission_from_request(rq2, 1000000); ok := false; exception when others then ok := sqlerrm like '%Confirm%'; end;
  r := r || jsonb_build_object('t', 'C01 commission waits for a confirmed request', 'pass', ok);
  perform public.decide_advisor_request(rq2, 'confirmed', 1200000, 'USD', null, null, null);
  begin perform public.record_commission_from_request(rq2, 1300000); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C02 the commissionable amount is no more than the price', 'pass', ok);
  js := public.record_commission_from_request(rq2, 1000000);
  cl := (js ->> 'id')::uuid;
  r := r || jsonb_build_object('t', 'C03 recorded from the terms on file: 20% of $10,000', 'pass', js ->> 'ref' ~ '^CL-\d{4}-\d{6}$' and
    (select rate_bp = 2000 and rate_source = 'term' and gross_minor = 200000 and advisor_minor + house_minor = gross_minor and advisor_minor = round(200000 * advisor_share_bp / 10000.0) and organization_id = o_pt from public.commission_lines where id = cl));
  begin perform public.record_commission_from_request(rq2, 1000000); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C04 only once per request', 'pass', ok);
  perform set_config('role', 'postgres', true);
  update public.commission_terms set rate_bp = 2500 where organization_id = o_pt;
  perform set_config('role', 'authenticated', true);
  r := r || jsonb_build_object('t', 'C05 a later rate change never rewrites the line', 'pass', (select gross_minor = 200000 from public.commission_lines where id = cl));
  begin perform public.set_commission_status(cl, 'received'); ok := false; exception when others then ok := sqlerrm like '%invoiced%'; end;
  r := r || jsonb_build_object('t', 'C06 the steps go in order', 'pass', ok);
  perform public.set_commission_status(cl, 'invoiced', current_date, 'INV-001');
  perform public.set_commission_status(cl, 'received', current_date, 'Wire 22');
  -- the advisor
  perform set_config('request.jwt.claims', json_build_object('sub', aa, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  js := public.my_earnings();
  r := r || jsonb_build_object('t', 'C07 the advisor sees their own line and share, never the rate, gross or house share', 'pass',
    jsonb_array_length(js) = 1 and (js -> 0 ->> 'advisor_minor')::bigint > 0 and not (js -> 0) ? 'rate_bp' and not (js -> 0) ? 'gross_minor' and not (js -> 0) ? 'house_minor' and js -> 0 ->> 'status' = 'received');
  select count(*) into n from public.commission_lines;
  r := r || jsonb_build_object('t', 'C08 and cannot read the ledger itself', 'pass', n = 0);
  begin perform public.set_commission_status(cl, 'advisor_paid'); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C09 nor mark themselves paid', 'pass', ok);
  perform set_config('request.jwt.claims', json_build_object('sub', ab, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  r := r || jsonb_build_object('t', 'C10 another advisor sees none of it', 'pass', jsonb_array_length(public.my_earnings()) = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  select count(*) into n from public.commission_lines;
  r := r || jsonb_build_object('t', 'C11 the house without the code sees no ledger', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  perform public.set_commission_status(cl, 'advisor_paid', current_date, 'ACH 3');
  begin perform public.set_commission_status(cl, 'cancelled'); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C12 a paid line cannot be cancelled', 'pass', ok and (select status = 'advisor_paid' and paid_reference = 'ACH 3' from public.commission_lines where id = cl));
  perform set_config('role', 'anon', true);
  begin select count(*) into n from public.commission_lines; ok := n = 0; exception when insufficient_privilege then ok := true; end;
  r := r || jsonb_build_object('t', 'C13 the public sees no ledger', 'pass', ok);
  perform set_config('role', 'postgres', true);

  -- ===== (I) Step 7: invitations, profiles, portraits
  declare ni uuid := gen_random_uuid(); nx uuid := gen_random_uuid(); na uuid; iv uuid; tok text := 'TestInvitationToken_0123456789abcdef'; adv_row record;
  begin
    insert into auth.users (id, email, email_confirmed_at, aud, role) values
      (ni, 'new.advisor@adv.test', now(), 'authenticated', 'authenticated'), (nx, 'someone.else@adv.test', now(), 'authenticated', 'authenticated');
    perform set_config('role', 'authenticated', true);
    perform set_config('request.jwt.claims', json_build_object('sub', aa, 'role', 'authenticated', 'aal', 'aal2')::text, true);
    begin perform public.create_advisor('Sneaky Person'); ok := false; exception when others then ok := true; end;
    r := r || jsonb_build_object('t', 'I01 an advisor cannot add advisors', 'pass', ok);
    begin perform public.invite_advisor(adv_a, 'x@adv.test', repeat('a', 64)); ok := false; exception when others then ok := true; end;
    r := r || jsonb_build_object('t', 'I02 nor send invitations', 'pass', ok);
    perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal1')::text, true);
    begin perform public.create_advisor('No Code'); ok := false; exception when others then ok := true; end;
    r := r || jsonb_build_object('t', 'I03 the house needs the code to add an advisor', 'pass', ok);
    perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal2')::text, true);
    na := public.create_advisor('Zoë  Ndlovu');
    select * into adv_row from public.advisors where id = na;
    r := r || jsonb_build_object('t', 'I04 a new advisor gets a number, a clean slug and starts invited', 'pass',
      adv_row.slug = 'zoe-ndlovu' and adv_row.adv_number ~ '^ADV-\d{4}-\d{6}$' and adv_row.status = 'invited' and adv_row.display_name = 'Zoë Ndlovu' and adv_row.user_id is null);
    iv := public.create_advisor('Zoe Ndlovu');
    r := r || jsonb_build_object('t', 'I05 a second advisor of the same name gets a different slug', 'pass',
      (select slug from public.advisors where id = iv) = 'zoe-ndlovu-2');
    perform public.invite_advisor(na, 'first@adv.test', repeat('b', 64));
    iv := public.invite_advisor(na, 'New.Advisor@adv.test', encode(extensions.digest(tok, 'sha256'), 'hex'));
    r := r || jsonb_build_object('t', 'I06 a newer invitation replaces the open one', 'pass',
      (select count(*) from public.advisor_invitations where advisor_id = na and revoked_at is null) = 1 and (select email from public.advisor_invitations where id = iv) = 'new.advisor@adv.test');
    begin perform public.invite_advisor(adv_a, 'again@adv.test', repeat('c', 64)); ok := false; exception when others then ok := true; end;
    r := r || jsonb_build_object('t', 'I07 an advisor who already has access cannot be invited again', 'pass', ok);
    -- someone else holding the link
    perform set_config('request.jwt.claims', json_build_object('sub', nx, 'role', 'authenticated', 'aal', 'aal1')::text, true);
    select count(*) into n from public.advisor_invitations;
    begin perform public.accept_advisor_invitation(tok); ok := false; exception when others then ok := true; end;
    r := r || jsonb_build_object('t', 'I08 the link does not work for another address, and invitations are not readable', 'pass', ok and n = 0 and (select user_id from public.advisors where id = na) is null);
    -- the invitee
    perform set_config('request.jwt.claims', json_build_object('sub', ni, 'role', 'authenticated', 'aal', 'aal1')::text, true);
    begin perform public.accept_advisor_invitation('WrongToken_0123456789abcdefghij'); ok := false; exception when others then ok := true; end;
    r := r || jsonb_build_object('t', 'I09 a wrong token does nothing', 'pass', ok);
    perform public.accept_advisor_invitation(tok);
    perform set_config('role', 'postgres', true);
    r := r || jsonb_build_object('t', 'I10 accepting links the account to the advisor, once', 'pass',
      (select user_id from public.advisors where id = na) = ni and (select accepted_at is not null from public.advisor_invitations where id = iv));
    perform set_config('role', 'authenticated', true);
    begin perform public.accept_advisor_invitation(tok); ok := false; exception when others then ok := true; end;
    r := r || jsonb_build_object('t', 'I11 the link works only once', 'pass', ok);
    -- profile words with the DNA (the invitee, now with the code)
    perform set_config('request.jwt.claims', json_build_object('sub', ni, 'role', 'authenticated', 'aal', 'aal2')::text, true);
    begin perform public.submit_advisor_dna(jsonb_build_object('pathways', jsonb_build_array('PATH-01'), 'volumes', jsonb_build_array('safaris'), 'countries', jsonb_build_array('kenya'), 'bio', repeat('x', 1501))); ok := false;
    exception when others then ok := true; end;
    r := r || jsonb_build_object('t', 'I12 a biography over 1,500 characters is refused', 'pass', ok);
    iv := public.submit_advisor_dna(jsonb_build_object('pathways', jsonb_build_array('PATH-01'), 'volumes', jsonb_build_array('safaris'), 'countries', jsonb_build_array('kenya'),
      'title', 'Travel advisor', 'intro', 'Kenya on foot — and by canoe.', 'bio', 'Line one.' || E'\n\n\n\n' || 'Line two.'));
    perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated', 'aal', 'aal2')::text, true);
    perform public.decide_advisor_dna(iv, 'approved');
    r := r || jsonb_build_object('t', 'I13 approved profile words are kept tidy, without long dashes', 'pass',
      (select intro = 'Kenya on foot, and by canoe.' and title = 'Travel advisor' and bio = 'Line one.' || E'\n\n' || 'Line two.' from public.advisor_dna where advisor_id = na));
    -- portraits
    begin perform public.set_advisor_portrait(na, 'jwco/advisors/someone-else/portrait'); ok := false; exception when others then ok := true; end;
    r := r || jsonb_build_object('t', 'I14 a portrait must sit at the advisor''s own path', 'pass', ok);
    perform public.set_advisor_portrait(na, 'jwco/advisors/zoe-ndlovu/portrait');
    perform set_config('request.jwt.claims', json_build_object('sub', ni, 'role', 'authenticated', 'aal', 'aal2')::text, true);
    begin perform public.set_advisor_portrait(na, null); ok := false; exception when others then ok := true; end;
    r := r || jsonb_build_object('t', 'I15 an advisor cannot set their own portrait', 'pass', ok);
    perform set_config('role', 'postgres', true);
    update public.advisors set status = 'active' where id = na;
    perform set_config('role', 'anon', true);
    js := public.public_advisor_dna();
    r := r || jsonb_build_object('t', 'I16 the website reads the name, words and portrait of an active advisor', 'pass',
      exists (select 1 from jsonb_array_elements(js) x where x ->> 'slug' = 'zoe-ndlovu' and x ->> 'name' = 'Zoë Ndlovu' and x ->> 'portrait' = 'jwco/advisors/zoe-ndlovu/portrait' and x ->> 'intro' = 'Kenya on foot, and by canoe.'));
    perform set_config('role', 'postgres', true);
  end;

  raise exception 'ADVISOR_DESK_RLS %', r;
end $$;
