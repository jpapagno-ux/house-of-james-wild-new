-- Partner Desk · Stage 1 · row-level security tests.
-- One DO block that ALWAYS ends by raising an exception, so every test user, org and
-- row is rolled back; the exception text is the JSON result list. Identities are
-- *.test only. Run in the Supabase SQL editor, via MCP execute_sql, or through
-- supabase/tests/drift_check/replay.sh on a local replay.
--
-- Scenarios: (A) partner isolation between organizations, (B) entity narrowing for a
-- contributor, (C) partners contribute / James Wild & Co publishes, (D) team and
-- invitations, (E) the public and travelers see nothing new.

do $$
declare
  jw uuid := gen_random_uuid(); ka uuid := gen_random_uuid(); kc uuid := gen_random_uuid();
  ma uuid := gen_random_uuid(); tr uuid := gen_random_uuid(); nw uuid := gen_random_uuid();
  o_jw uuid; o_k uuid; o_m uuid;
  k1 uuid; k2 uuid; k3 uuid; m1 uuid;
  kc_mem uuid; req uuid; sub uuid; sub2 uuid; rev uuid; rev2 uuid; con uuid; inv uuid;
  n int; ok boolean; t text; pub_before int; pub_after int;
  pm uuid := gen_random_uuid(); je uuid := gen_random_uuid(); pm_mem uuid; dc uuid; dm1 uuid; dm2 uuid; ds uuid;
  b_k uuid; b_m uuid; ct uuid; rb int; src text;
  ba1 uuid; ba2 uuid; pol uuid; pol2 uuid; dd uuid;
  csub uuid; crev uuid; crev2 uuid; jt text;
  r jsonb := '[]';
begin
  -- ===== setup as the database owner
  insert into auth.users (id, email, email_confirmed_at, aud, role) values
    (jw, 'jw.admin@rls.test', now(), 'authenticated', 'authenticated'),
    (ka, 'k.admin@rls.test', now(), 'authenticated', 'authenticated'),
    (kc, 'k.contrib@rls.test', now(), 'authenticated', 'authenticated'),
    (ma, 'm.admin@rls.test', now(), 'authenticated', 'authenticated'),
    (tr, 'traveler@rls.test', now(), 'authenticated', 'authenticated'),
    (nw, 'newbie@rls.test', now(), 'authenticated', 'authenticated');
  insert into public.organizations (name, type, slug) values ('RLS House', 'internal', 'rls-house') returning id into o_jw;
  insert into public.organizations (name, type, slug, partner_code) values ('RLS Kayu', 'partner', 'rls-kayu', 'PAR-999901') returning id into o_k;
  insert into public.organizations (name, type, slug, partner_code) values ('RLS More', 'partner', 'rls-more', 'PAR-999902') returning id into o_m;
  insert into public.organization_memberships (user_id, organization_id, role) values
    (jw, o_jw, 'jw_admin'), (ka, o_k, 'partner_admin'), (ma, o_m, 'partner_admin');
  insert into public.organization_memberships (user_id, organization_id, role) values (kc, o_k, 'partner_contributor') returning id into kc_mem;
  insert into public.properties (legacy_cms_id, name, slug, publication_status) values ('STY-2026-899991', 'RLS Ubud', 'rls-ubud', 'published') returning id into k1;
  insert into public.properties (legacy_cms_id, name, slug, publication_status) values ('STY-2026-899992', 'RLS Jimbaran', 'rls-jimbaran', 'published') returning id into k2;
  insert into public.properties (legacy_cms_id, name, slug, publication_status) values ('STY-2026-899993', 'RLS Sanur', 'rls-sanur', 'draft') returning id into k3;
  insert into public.properties (legacy_cms_id, name, slug, publication_status) values ('STY-2026-899994', 'RLS River Lodge', 'rls-river', 'draft') returning id into m1;
  insert into public.entity_partners (property_id, organization_id, role, is_primary) values
    (k1, o_k, 'owner', true), (k2, o_k, 'owner', true), (k3, o_k, 'owner', true), (m1, o_m, 'owner', true);
  insert into public.entity_access (membership_id, property_id) values (kc_mem, k1);
  insert into public.content_requests (organization_id, property_id, request_type, requested_item) values (o_k, k1, 'media', 'Hero exterior at dusk') returning id into req;
  insert into public.content_requests (organization_id, property_id, request_type, requested_item) values (o_m, m1, 'commercial', 'Upload 2027 rate sheet');
  insert into public.contacts (organization_id, first_name, roles) values (o_m, 'More reservations', array['reservations']);
  select count(*) into pub_before from public.properties where publication_status = 'published';

  -- ===== (A) partner isolation: Kayumanis admin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', ka, 'role', 'authenticated')::text, true);
  select count(*) into n from public.properties where id in (k1, k2, k3);
  r := r || jsonb_build_object('t', 'A01 partner admin sees all own entities, drafts included', 'pass', n = 3);
  select count(*) into n from public.properties where id = m1;
  r := r || jsonb_build_object('t', 'A02 partner cannot see another partner''s draft entity', 'pass', n = 0);
  select count(*) into n from public.content_requests where organization_id = o_m;
  r := r || jsonb_build_object('t', 'A03 partner cannot see another partner''s requests', 'pass', n = 0);
  select count(*) into n from public.contacts where organization_id = o_m;
  r := r || jsonb_build_object('t', 'A04 partner cannot see another partner''s contacts', 'pass', n = 0);
  select count(*) into n from public.organizations where id = o_m;
  r := r || jsonb_build_object('t', 'A05 partner cannot see another organization', 'pass', n = 0);
  begin
    insert into public.submissions (organization_id, property_id, kind, title) values (o_m, m1, 'other', 'cross-org');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'A06 partner cannot submit for another partner''s entity', 'pass', ok);
  begin
    insert into public.submissions (organization_id, property_id, kind, title) values (o_k, m1, 'other', 'smuggle');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'A07 partner cannot attach another partner''s entity to own org', 'pass', ok);

  -- contacts: admin writes directly
  insert into public.contacts (organization_id, first_name, last_name, email, roles) values (o_k, 'Wayan', 'Test', 'wayan@rls.test', array['reservations']) returning id into con;
  insert into public.contact_entities (contact_id, property_id) values (con, k1);
  update public.contacts set mobile = '+62 000' where id = con;
  get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'A08 partner admin creates and edits contacts directly', 'pass', n = 1);
  begin
    insert into public.contact_entities (contact_id, property_id) values (con, m1);
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'A09 contact cannot be linked to another partner''s entity', 'pass', ok);
  begin
    update public.contacts set jw_owner_id = ka where id = con;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'A10 house-side contact fields are not partner-editable', 'pass', ok);

  -- company details: direct for admin, but never name / code / type
  update public.organizations set website = 'https://rls-kayu.test' where id = o_k;
  get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'A11 partner admin edits company details directly', 'pass', n = 1);
  begin
    update public.organizations set partner_code = 'PAR-000777' where id = o_k;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'A12 partner cannot change its partner code or name', 'pass', ok);

  -- ===== (B) contributor narrowed to one entity
  perform set_config('request.jwt.claims', json_build_object('sub', kc, 'role', 'authenticated')::text, true);
  select count(*) into n from public.properties where id = k3;
  r := r || jsonb_build_object('t', 'B01 narrowed contributor cannot see other draft entities', 'pass', n = 0);
  select count(*) into n from public.content_requests where id = req;
  r := r || jsonb_build_object('t', 'B02 narrowed contributor sees requests for their entity', 'pass', n = 1);
  begin
    insert into public.submissions (organization_id, property_id, kind, title) values (o_k, k2, 'content', 'not mine');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'B03 narrowed contributor cannot submit for other entities', 'pass', ok);
  -- Contributors edit administrative data directly (James, 1 Nov 2026).
  begin
    insert into public.contacts (organization_id, first_name) values (o_k, 'Contributor added');
    ok := true;
  exception when others then ok := false; end;
  r := r || jsonb_build_object('t', 'B04 contributor can create contacts', 'pass', ok);
  begin
    update public.contacts set title = 'Reservations' where organization_id = o_k and first_name = 'Contributor added';
    get diagnostics n = row_count;
    ok := n = 1;
  exception when others then ok := false; end;
  r := r || jsonb_build_object('t', 'B04b contributor can update contacts', 'pass', ok);
  delete from public.contacts where organization_id = o_k and first_name = 'Contributor added';
  get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'B04c contributor cannot remove contacts', 'pass', n = 0);
  update public.organizations set website = 'https://contrib.rls.test' where id = o_k;
  get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'B04d contributor can update company details', 'pass', n = 1);
  begin
    update public.organizations set name = 'Renamed by contributor' where id = o_k;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'B04e contributor cannot rename the organization', 'pass', ok);
  select count(*) into n from public.contacts where id = con;
  r := r || jsonb_build_object('t', 'B05 contributor can read organization contacts', 'pass', n = 1);

  -- ===== (C) partners contribute, the house publishes
  insert into public.submissions (organization_id, property_id, request_id, kind, title, partner_note, status)
    values (o_k, k1, req, 'request_reply', 'Dusk exterior', 'Shot last week', 'submitted') returning id into sub;
  select status into t from public.content_requests where id = req;
  r := r || jsonb_build_object('t', 'C01 replying to a request marks it submitted', 'pass', t = 'submitted');
  begin
    insert into public.revisions (submission_id, target_table, target_id, field, current_value, proposed_value)
      values (sub, 'properties', k1, 'name', '"forged before"', '"x"');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C02a a client cannot supply the "before" value', 'pass', ok);
  insert into public.revisions (submission_id, target_table, target_id, field, proposed_value, partner_note)
    values (sub, 'properties', k1, 'name', '"RLS Ubud Private Villas"', 'New name from Oct') returning id into rev;
  select current_value #>> '{}' into t from public.revisions where id = rev;
  r := r || jsonb_build_object('t', 'C02b the database records the true current value', 'pass', t = 'RLS Ubud');
  begin
    insert into public.revisions (submission_id, target_table, target_id, field, proposed_value) values (sub, 'properties', k1, 'legacy_cms_id', '"STY-2026-000001"');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C03 canonical Ledger ID cannot be targeted', 'pass', ok);
  begin
    insert into public.revisions (submission_id, target_table, target_id, field, proposed_value) values (sub, 'properties', k1, 'publication_status', '"published"');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C04 publication status cannot be targeted', 'pass', ok);
  begin
    update public.properties set name = 'hijack' where id = k1;
    get diagnostics n = row_count;
    ok := n = 0;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C05 partner cannot write entities directly', 'pass', ok);
  begin
    perform public.decide_revision(rev, 'approve');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C06 partner cannot approve their own change', 'pass', ok);
  begin
    update public.submissions set status = 'approved' where id = sub;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C07 partner cannot mark a submission approved', 'pass', ok);
  select name into t from public.properties where id = k1;
  r := r || jsonb_build_object('t', 'C08 nothing reached the entity before approval', 'pass', t = 'RLS Ubud');

  -- second submission to prove the stale guard
  insert into public.submissions (organization_id, property_id, kind, title) values (o_k, k1, 'content', 'Region') returning id into sub2;
  insert into public.revisions (submission_id, target_table, target_id, field, proposed_value) values (sub2, 'properties', k1, 'name', '"Another name"') returning id into rev2;

  -- ===== the house decides
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated')::text, true);
  select count(*) into n from public.properties where id in (k1, k2, k3, m1);
  r := r || jsonb_build_object('t', 'C09 James Wild & Co sees every entity, drafts included', 'pass', n = 4);
  t := public.decide_revision(rev, 'edit_approve', '"RLS Ubud Private Villas & Spa"', 'House style');
  r := r || jsonb_build_object('t', 'C10 edit + approve rolls the submission to approved', 'pass', t = 'approved');
  select name into t from public.properties where id = k1;
  r := r || jsonb_build_object('t', 'C11 only the approved value reaches the entity', 'pass', t = 'RLS Ubud Private Villas & Spa');
  select status into t from public.content_requests where id = req;
  r := r || jsonb_build_object('t', 'C12 the request closes as approved', 'pass', t = 'approved');
  begin
    perform public.decide_revision(rev2, 'approve');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C13 a change based on a stale value is refused', 'pass', ok);
  t := public.decide_revision(rev2, 'ask', null, 'Please resubmit against the new name');
  r := r || jsonb_build_object('t', 'C14 ask partner sets changes requested', 'pass', t = 'changes_requested');

  perform set_config('request.jwt.claims', json_build_object('sub', kc, 'role', 'authenticated')::text, true);
  begin
    update public.submissions set partner_note = 'too late' where id = sub;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'C15 partner cannot edit a decided submission', 'pass', ok);

  -- ===== (D) team and invitations
  perform set_config('request.jwt.claims', json_build_object('sub', ka, 'role', 'authenticated')::text, true);
  insert into public.org_invitations (organization_id, email, role, entity_ids, token_hash)
    values (o_k, 'newbie@rls.test', 'partner_contributor', array[k2, m1], encode(extensions.digest('tok-new', 'sha256'), 'hex')) returning id into inv;
  begin
    insert into public.org_invitations (organization_id, email, role, token_hash) values (o_k, 'evil@rls.test', 'jw_admin', 'x');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'D01 partner admin cannot invite a house role', 'pass', ok);
  begin
    perform token_hash from public.org_invitations where id = inv;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'D02 invitation token hash is unreadable', 'pass', ok);
  begin
    perform public.set_team_member((select id from public.organization_memberships where user_id = ka and organization_id = o_k), 'partner_contributor', 'active');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'D03 admin cannot change their own access', 'pass', ok);
  select count(*) into n from public.organization_memberships where organization_id = o_k;
  r := r || jsonb_build_object('t', 'D04 partner admin sees their team', 'pass', n = 2);

  perform set_config('request.jwt.claims', json_build_object('sub', ma, 'role', 'authenticated')::text, true);
  begin
    perform public.set_team_member(kc_mem, 'partner_admin', 'active');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'D05 another partner cannot change Kayumanis''s team', 'pass', ok);
  begin
    perform public.accept_org_invitation('tok-new');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'D06 invitation cannot be accepted by the wrong email', 'pass', ok);

  perform set_config('request.jwt.claims', json_build_object('sub', nw, 'role', 'authenticated')::text, true);
  ok := public.accept_org_invitation('tok-new') = o_k;
  r := r || jsonb_build_object('t', 'D07 invitee accepts with the right email', 'pass', ok);
  select count(*) into n from public.entity_access a join public.organization_memberships m on m.id = a.membership_id where m.user_id = nw;
  r := r || jsonb_build_object('t', 'D08 invitation narrows to own-org entities only (foreign entity dropped)', 'pass', n = 1);
  select count(*) into n from public.properties where id = k3;
  r := r || jsonb_build_object('t', 'D09 new contributor is narrowed as invited', 'pass', n = 0);
  begin
    perform public.accept_org_invitation('tok-new');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'D10 an invitation works only once', 'pass', ok);

  perform set_config('request.jwt.claims', json_build_object('sub', ka, 'role', 'authenticated')::text, true);
  perform public.set_team_member(kc_mem, 'partner_contributor', 'revoked');
  perform set_config('request.jwt.claims', json_build_object('sub', kc, 'role', 'authenticated')::text, true);
  select count(*) into n from public.content_requests where id = req;
  r := r || jsonb_build_object('t', 'D11 revoking a member removes access immediately', 'pass', n = 0);

  -- ===== (E) travelers and the public
  perform set_config('request.jwt.claims', json_build_object('sub', tr, 'role', 'authenticated')::text, true);
  select count(*) into n from public.properties where id in (k3, m1);
  r := r || jsonb_build_object('t', 'E01 a traveler cannot see draft entities', 'pass', n = 0);
  select count(*) into n from public.contacts;
  r := r || jsonb_build_object('t', 'E02 a traveler sees no partner contacts', 'pass', n = 0);
  select count(*) into n from public.submissions;
  r := r || jsonb_build_object('t', 'E03 a traveler sees no submissions', 'pass', n = 0);
  select count(*) into pub_after from public.properties where publication_status = 'published';
  r := r || jsonb_build_object('t', 'E04 a traveler still sees every published stay', 'pass', pub_after = pub_before);

  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  select count(*) into n from public.properties where id in (k3, m1);
  r := r || jsonb_build_object('t', 'E05 the public cannot see draft entities', 'pass', n = 0);
  begin
    perform count(*) from public.content_requests;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'E06 the public cannot read requests', 'pass', ok);
  insert into public.partner_applications (organization_name, contact_name, email) values ('RLS Applicant', 'A. Person', 'apply@rls.test');
  r := r || jsonb_build_object('t', 'E07 anyone can apply to become a partner', 'pass', true);
  begin
    perform count(*) from public.partner_applications;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'E08 applications are unreadable to the public', 'pass', ok);
  select count(*) into n from public.volumes;
  r := r || jsonb_build_object('t', 'E09 reference volumes are public', 'pass', n = 6);

  -- ===== audit trail
  perform set_config('role', 'postgres', true);
  select count(*) into n from private.audit_logs where entity_type = 'contacts' and entity_id = con::text;
  r := r || jsonb_build_object('t', 'F01 contact changes are audited', 'pass', n >= 2);
  select count(*) into n from private.audit_logs where entity_type = 'properties' and entity_id = k1::text and action = 'update' and actor_id = jw;
  r := r || jsonb_build_object('t', 'F02 the approved entity change is audited to the editor', 'pass', n = 1);

  -- ===== (G) Ledger IDs (D-20): new IDs only from private.next_ledger_id()
  -- (checked from the sequence's settings, so running the test never burns a real ID)
  select count(*) into n from pg_sequences where schemaname = 'private' and sequencename = 'ledger_entity_seq'
    and start_value = 800001 and max_value <= 899999;
  r := r || jsonb_build_object('t', 'G01 new Ledger IDs come from the Partner Desk block (800001-899999)', 'pass',
    n = 1 and position('ledger_entity_seq' in pg_get_functiondef('private.next_ledger_id(text)'::regprocedure)) > 0);
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', ka, 'role', 'authenticated')::text, true);
  begin
    perform private.next_ledger_id('STY');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'G02 partners cannot mint Ledger IDs', 'pass', ok);
  begin
    insert into public.properties (legacy_cms_id, name, slug) values ('STY-2026-000999', 'Hand-typed', 'rls-hand-typed');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'G03 partners cannot create entities or type a Ledger ID', 'pass', ok);
  perform set_config('role', 'postgres', true);

  -- ===== (H) documents and contracts (D-23): contracts for partner admins and house admins only
  perform set_config('role', 'postgres', true);
  insert into auth.users (id, email, email_confirmed_at, aud, role) values
    (pm, 'k.pm@rls.test', now(), 'authenticated', 'authenticated'), (je, 'jw.editor@rls.test', now(), 'authenticated', 'authenticated');
  insert into public.organization_memberships (user_id, organization_id, role) values (je, o_jw, 'jw_editor');
  insert into public.organization_memberships (user_id, organization_id, role) values (pm, o_k, 'partner_contributor') returning id into pm_mem;
  insert into public.entity_access (membership_id, property_id) values (pm_mem, k1);

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated')::text, true);
  begin
    insert into public.partner_documents (organization_id, kind, title, storage_path, mime_type, size_bytes, uploaded_by)
      values (o_k, 'contract', 'Agency agreement 2027', o_k::text || '/contract/agreement-2027.pdf', 'application/pdf', 1000, jw) returning id into dc;
    ok := dc is not null;
  exception when others then ok := false; end;
  r := r || jsonb_build_object('t', 'H01 a house admin files the signed contract', 'pass', ok);

  perform set_config('request.jwt.claims', json_build_object('sub', ka, 'role', 'authenticated')::text, true);
  insert into public.partner_documents (organization_id, property_id, kind, title, storage_path, mime_type, size_bytes, uploaded_by)
    values (o_k, k1, 'commercial', 'Ubud 2027 rates', o_k::text || '/commercial/ubud-2027.pdf', 'application/pdf', 1000, ka) returning id into dm1;
  insert into public.partner_documents (organization_id, property_id, kind, title, storage_path, mime_type, size_bytes, uploaded_by)
    values (o_k, k2, 'commercial', 'Jimbaran 2027 rates', o_k::text || '/commercial/jimbaran-2027.pdf', 'application/pdf', 1000, ka) returning id into dm2;
  insert into public.partner_documents (organization_id, kind, title, storage_path, mime_type, size_bytes, uploaded_by)
    values (o_k, 'supporting', 'Fact sheet', o_k::text || '/supporting/fact-sheet.pdf', 'application/pdf', 1000, ka) returning id into ds;
  r := r || jsonb_build_object('t', 'H02 a partner admin files commercial and supporting documents', 'pass', dm1 is not null and ds is not null);
  select count(*) into n from public.partner_documents where id = dc;
  r := r || jsonb_build_object('t', 'H03 the partner admin sees the contract', 'pass', n = 1);
  begin
    insert into public.partner_documents (organization_id, kind, title, storage_path, mime_type, size_bytes, uploaded_by)
      values (o_k, 'contract', 'Forged', o_k::text || '/contract/forged.pdf', 'application/pdf', 1000, ka);
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'H04 a partner cannot file a contract', 'pass', ok);
  update public.partner_documents set title = 'Changed' where id = dc; get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'H05 a partner cannot change the contract', 'pass', n = 0);
  delete from public.partner_documents where id in (dc, dm1, ds); get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'H06 a partner cannot delete documents', 'pass', n = 0);
  update public.partner_documents set status = 'archived' where id = ds; get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'H07 a partner admin archives a supporting document', 'pass', n = 1);
  update public.partner_documents set status = 'active' where id = ds;

  perform set_config('request.jwt.claims', json_build_object('sub', pm, 'role', 'authenticated')::text, true);
  select count(*) into n from public.partner_documents where id = dc;
  r := r || jsonb_build_object('t', 'H08 a property manager cannot see the contract', 'pass', n = 0);
  select count(*) into n from public.partner_documents where id = dm1;
  r := r || jsonb_build_object('t', 'H09 a property manager sees commercial documents for their own property', 'pass', n = 1);
  select count(*) into n from public.partner_documents where id = dm2;
  r := r || jsonb_build_object('t', 'H10 ...but not for a property they do not manage', 'pass', n = 0);
  select count(*) into n from public.partner_documents where id = ds;
  r := r || jsonb_build_object('t', 'H11 a property manager sees company-wide supporting documents', 'pass', n = 1);
  begin
    insert into public.partner_documents (organization_id, property_id, kind, title, storage_path, mime_type, size_bytes, uploaded_by)
      values (o_k, k2, 'supporting', 'Not mine', o_k::text || '/supporting/not-mine.pdf', 'application/pdf', 1000, pm);
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'H12 a property manager cannot file for another property', 'pass', ok);

  perform set_config('request.jwt.claims', json_build_object('sub', je, 'role', 'authenticated')::text, true);
  select count(*) into n from public.partner_documents where id = dc;
  r := r || jsonb_build_object('t', 'H13 a house editor cannot see the contract', 'pass', n = 0);
  select count(*) into n from public.partner_documents where id in (dm1, dm2, ds);
  r := r || jsonb_build_object('t', 'H14 a house editor sees commercial and supporting documents', 'pass', n = 3);

  perform set_config('request.jwt.claims', json_build_object('sub', ma, 'role', 'authenticated')::text, true);
  select count(*) into n from public.partner_documents where organization_id = o_k;
  r := r || jsonb_build_object('t', 'H15 another partner sees none of these documents', 'pass', n = 0);

  -- storage objects follow the register
  perform set_config('role', 'postgres', true);
  insert into storage.objects (bucket_id, name) values
    ('partner-documents', o_k::text || '/contract/agreement-2027.pdf'), ('partner-documents', o_k::text || '/supporting/fact-sheet.pdf');
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', pm, 'role', 'authenticated')::text, true);
  select count(*) into n from storage.objects where bucket_id = 'partner-documents' and name = o_k::text || '/contract/agreement-2027.pdf';
  r := r || jsonb_build_object('t', 'H16 a property manager cannot open the contract file', 'pass', n = 0);
  select count(*) into n from storage.objects where bucket_id = 'partner-documents' and name = o_k::text || '/supporting/fact-sheet.pdf';
  r := r || jsonb_build_object('t', 'H17 a property manager opens a supporting file', 'pass', n = 1);
  perform set_config('request.jwt.claims', json_build_object('sub', ka, 'role', 'authenticated')::text, true);
  select count(*) into n from storage.objects where bucket_id = 'partner-documents' and name = o_k::text || '/contract/agreement-2027.pdf';
  r := r || jsonb_build_object('t', 'H18 the partner admin opens the contract file', 'pass', n = 1);
  begin
    insert into storage.objects (bucket_id, name) values ('partner-documents', o_k::text || '/contract/sneaky.pdf');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'H19 a partner cannot upload into the contracts folder', 'pass', ok);
  perform set_config('request.jwt.claims', json_build_object('sub', ma, 'role', 'authenticated')::text, true);
  begin
    insert into storage.objects (bucket_id, name) values ('partner-documents', o_k::text || '/supporting/intruder.pdf');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'H20 another partner cannot upload into this organization', 'pass', ok);
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin
    select count(*) into n from public.partner_documents; ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'H21 the public cannot read the document register', 'pass', ok);
  perform set_config('role', 'postgres', true);

  -- ===== (I) commission terms (D-25): house finance writes; partner admins read their own
  perform set_config('role', 'postgres', true);
  insert into public.brands (organization_id, name, slug) values (o_k, 'RLS Kayu brand', 'rls-kayu-brand') returning id into b_k;
  insert into public.brands (organization_id, name, slug) values (o_m, 'RLS More brand', 'rls-more-brand') returning id into b_m;
  update public.properties set brand_id = b_k where id in (k1, k2);
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated')::text, true);
  insert into public.commission_terms (organization_id, rate_bp, effective_from, status) values (o_k, 1500, '2026-01-01', 'confirmed') returning id into ct;
  insert into public.commission_terms (organization_id, brand_id, rate_bp, effective_from, status) values (o_k, b_k, 1700, '2026-01-01', 'to_confirm');
  insert into public.commission_terms (organization_id, property_id, rate_bp, effective_from, status) values (o_k, k1, 1800, '2026-01-01', 'confirmed');
  r := r || jsonb_build_object('t', 'I01 a house admin records partner, brand and property commission', 'pass', ct is not null);
  begin
    insert into public.commission_terms (organization_id, brand_id, rate_bp, effective_from) values (o_k, b_m, 2000, '2026-01-01');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'I02 a brand from another partner is refused', 'pass', ok);
  select c.rate_bp, c.source into rb, src from private.commission_rate_for(k1, '2026-06-01') c;
  r := r || jsonb_build_object('t', 'I03 a property term beats the brand term', 'pass', rb = 1800 and src = 'property');
  select c.rate_bp, c.source into rb, src from private.commission_rate_for(k2, '2026-06-01') c;
  r := r || jsonb_build_object('t', 'I04 a brand term beats the partner term', 'pass', rb = 1700 and src = 'brand');
  select c.rate_bp, c.source into rb, src from private.commission_rate_for(k3, '2026-06-01') c;
  r := r || jsonb_build_object('t', 'I05 the partner term covers the rest', 'pass', rb = 1500 and src = 'partner');
  select count(*) into n from private.commission_rate_for(k1, '2025-06-01');
  r := r || jsonb_build_object('t', 'I06 no rate before the terms start', 'pass', n = 0);

  perform set_config('request.jwt.claims', json_build_object('sub', ka, 'role', 'authenticated')::text, true);
  select count(*) into n from public.commission_terms where organization_id = o_k;
  r := r || jsonb_build_object('t', 'I07 the partner admin reads their own commission terms', 'pass', n = 3);
  update public.commission_terms set rate_bp = 3000 where id = ct; get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'I08 the partner admin cannot change them', 'pass', n = 0);
  begin
    insert into public.commission_terms (organization_id, rate_bp, effective_from) values (o_k, 100, '2026-01-01'); ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'I09 the partner admin cannot add terms', 'pass', ok);
  select count(*) into n from private.commission_rate_for(k1, '2026-06-01');
  r := r || jsonb_build_object('t', 'I10 rate look-ups are house-only', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', pm, 'role', 'authenticated')::text, true);
  select count(*) into n from public.commission_terms;
  r := r || jsonb_build_object('t', 'I11 a property manager sees no commission terms', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', je, 'role', 'authenticated')::text, true);
  select count(*) into n from public.commission_terms;
  r := r || jsonb_build_object('t', 'I12 a house editor sees no commission terms', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', ma, 'role', 'authenticated')::text, true);
  select count(*) into n from public.commission_terms where organization_id = o_k;
  r := r || jsonb_build_object('t', 'I13 another partner sees none of them', 'pass', n = 0);
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin select count(*) into n from public.commission_terms; ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'I14 the public cannot read commission terms', 'pass', ok);
  perform set_config('role', 'postgres', true);

  -- ===== (J) advisor tiers, currencies, banking, policies, reminders (D-26)
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated')::text, true);
  select count(*) into n from public.advisor_tiers where (key, share_bp) in (('tier_1', 7500), ('tier_2', 7000), ('tier_3', 5500));
  r := r || jsonb_build_object('t', 'J01 the house sees Tier 1 75%, Tier 2 70%, Tier 3 55%', 'pass', n = 3);
  insert into public.advisor_tier_assignments (user_id, tier, effective_from) values (tr, 'tier_1', '2026-01-01');
  r := r || jsonb_build_object('t', 'J02 a tiered advisor earns their tier, others the 70% default', 'pass',
    private.advisor_share_for(tr, '2026-06-01') = 7500 and private.advisor_share_for(nw, '2026-06-01') = 7000);
  perform set_config('request.jwt.claims', json_build_object('sub', ka, 'role', 'authenticated')::text, true);
  select count(*) into n from public.advisor_tiers;
  r := r || jsonb_build_object('t', 'J03 partners never see advisor tiers or shares', 'pass', n = 0 and private.advisor_share_for(tr) is null);
  perform set_config('request.jwt.claims', json_build_object('sub', tr, 'role', 'authenticated')::text, true);
  select count(*) into n from public.advisor_tier_assignments;
  r := r || jsonb_build_object('t', 'J04 an advisor sees their own tier', 'pass', n = 1 and private.advisor_share_for(tr, '2026-06-01') = 7500);

  perform set_config('request.jwt.claims', json_build_object('sub', ka, 'role', 'authenticated')::text, true);
  update public.organizations set primary_currency = 'ZAR', other_currencies = '{USD,EUR}' where id = o_k; get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'J05 a partner chooses its currencies', 'pass', n = 1);
  begin update public.organizations set other_currencies = '{dollars}' where id = o_k; ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'J06 only three-letter currency codes', 'pass', ok);

  insert into public.partner_bank_accounts (organization_id, currency, account_holder, bank_name, bank_country, account_number, swift_bic, submitted_by)
  values (o_k, 'IDR', 'PT Kayu', 'Bank RLS', 'ID', '1234567890', 'BKRLIDJA', ka) returning id into ba1;
  r := r || jsonb_build_object('t', 'J07 a partner admin submits banking details', 'pass', ba1 is not null);
  begin
    insert into public.partner_bank_accounts (organization_id, currency, account_holder, bank_name, bank_country, account_number, status, submitted_by)
    values (o_k, 'IDR', 'PT Kayu', 'Bank RLS', 'ID', '999999', 'verified', ka); ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'J08 a partner cannot mark its own details verified', 'pass', ok);
  update public.partner_bank_accounts set status = 'verified' where id = ba1; get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'J09 a partner cannot verify or change banking details', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', kc, 'role', 'authenticated')::text, true);
  select count(*) into n from public.partner_bank_accounts;
  r := r || jsonb_build_object('t', 'J10 contributors see no banking details', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', je, 'role', 'authenticated')::text, true);
  select count(*) into n from public.partner_bank_accounts;
  r := r || jsonb_build_object('t', 'J11 house editors see no banking details', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', ma, 'role', 'authenticated')::text, true);
  select count(*) into n from public.partner_bank_accounts;
  r := r || jsonb_build_object('t', 'J12 another partner sees none', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated')::text, true);
  update public.partner_bank_accounts set status = 'verified' where id = ba1;
  insert into public.partner_bank_accounts (organization_id, currency, account_holder, bank_name, bank_country, account_number, submitted_by)
  values (o_k, 'IDR', 'PT Kayu', 'Bank RLS 2', 'ID', '5555666677', jw) returning id into ba2;
  update public.partner_bank_accounts set status = 'verified' where id = ba2;
  select count(*) into n from public.partner_bank_accounts where id = ba1 and status = 'superseded';
  r := r || jsonb_build_object('t', 'J13 the house verifies; a newer account retires the old one', 'pass', n = 1
    and exists (select 1 from public.partner_bank_accounts where id = ba2 and verified_by = jw and verified_at is not null));
  perform set_config('role', 'postgres', true);
  select count(*) into n from private.audit_logs where entity_type = 'partner_bank_accounts' and (after_snapshot::text like '%1234567890%' or before_snapshot::text like '%1234567890%' or after_snapshot::text like '%5555666677%');
  r := r || jsonb_build_object('t', 'J14 the audit trail never holds a full account number', 'pass', n = 0
    and exists (select 1 from private.audit_logs where entity_type = 'partner_bank_accounts' and after_snapshot ->> 'account_number' = '…7890'));
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin select count(*) into n from public.partner_bank_accounts; ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'J15 the public cannot read banking details', 'pass', ok);

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', pm, 'role', 'authenticated')::text, true);
  begin insert into public.partner_policies (organization_id, kind, body, submitted_by) values (o_k, 'cancellation', 'x', pm); ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'J16 a property manager cannot submit a company-wide policy', 'pass', ok);
  insert into public.partner_policies (organization_id, property_id, kind, body, submitted_by) values (o_k, k1, 'cancellation', '60 days: full refund', pm) returning id into pol;
  r := r || jsonb_build_object('t', 'J17 a property manager submits a policy for their property', 'pass', pol is not null);
  update public.partner_policies set status = 'approved' where id = pol; get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'J18 partners cannot approve their own policy', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', ka, 'role', 'authenticated')::text, true);
  insert into public.partner_policies (organization_id, kind, body, submitted_by) values (o_k, 'refund', 'Refunds within 14 days', ka) returning id into pol2;
  perform set_config('request.jwt.claims', json_build_object('sub', je, 'role', 'authenticated')::text, true);
  update public.partner_policies set status = 'approved' where id in (pol, pol2); get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'J19 a house editor approves policies', 'pass', n = 2
    and (select reviewed_by from public.partner_policies where id = pol) = je);
  perform set_config('request.jwt.claims', json_build_object('sub', ma, 'role', 'authenticated')::text, true);
  select count(*) into n from public.partner_policies;
  r := r || jsonb_build_object('t', 'J20 another partner sees none of them', 'pass', n = 0);

  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated')::text, true);
  begin update public.commission_terms set contract_document_id = ds where id = ct; ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'J21 a term links only to a contract', 'pass', ok or ds is null);
  update public.commission_terms set contract_document_id = dc where id = ct; get diagnostics n = row_count;
  r := r || jsonb_build_object('t', 'J22 a term links to its signed contract', 'pass', n = 1);

  perform set_config('role', 'postgres', true);
  update public.partner_documents set expires_on = current_date + 20 where id = dc;
  select count(*) into n from private.document_reminders_due(current_date) d where d.document_id = dc and d.stage = '30_days' and 'k.admin@rls.test' = any(d.recipients);
  r := r || jsonb_build_object('t', 'J23 an expiring contract is due a reminder to the partner admin', 'pass', n = 1);
  perform public.document_reminder_sent(dc, '30_days', array['k.admin@rls.test']);
  select count(*) into n from private.document_reminders_due(current_date) d where d.document_id = dc;
  r := r || jsonb_build_object('t', 'J24 each reminder goes once', 'pass', n = 0);
  update public.partner_documents set expires_on = current_date where id = dc;
  select count(*) into n from private.document_reminders_due(current_date) d where d.document_id = dc and d.stage = 'expired';
  r := r || jsonb_build_object('t', 'J25 on expiry a final reminder is due', 'pass', n = 1);
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', jw, 'role', 'authenticated')::text, true);
  begin perform public.document_reminders_due(current_date); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'J26 only the server job can list reminders', 'pass', ok);
  perform set_config('role', 'postgres', true);

  -- ===== (K) property content: partners propose, editors approve (Stage 2 §3.1)
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', pm, 'role', 'authenticated')::text, true);
  insert into public.submissions (organization_id, property_id, kind, title, status) values (o_k, k1, 'content', 'Content update', 'draft') returning id into csub;
  insert into public.revisions (submission_id, target_table, target_id, field, proposed_value) values (csub, 'entity_content', k1, 'inclusions', '["All meals", "Spa treatment"]') returning id into crev;
  insert into public.revisions (submission_id, target_table, target_id, field, proposed_value) values (csub, 'entity_content', k1, 'best_months', '"April to October"') returning id into crev2;
  r := r || jsonb_build_object('t', 'K01 a property manager proposes content for their property', 'pass', crev is not null and crev2 is not null);
  begin insert into public.revisions (submission_id, target_table, target_id, field, proposed_value) values (csub, 'entity_content', k1, 'inclusions', '"not a list"'); ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'K02 a list field refuses plain text', 'pass', ok);
  begin insert into public.revisions (submission_id, target_table, target_id, field, proposed_value) values (csub, 'entity_content', k1, 'tagline', '"New tagline"'); ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'K03 editorial copy (the tagline) cannot be proposed', 'pass', ok);
  begin insert into public.entity_content (id, overview) values (k2, 'Written straight in'); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'K04 partners never write content directly', 'pass', ok);
  begin
    insert into public.submissions (organization_id, property_id, kind, title, status) values (o_k, k2, 'content', 'x', 'draft') returning id into sub2;
    insert into public.revisions (submission_id, target_table, target_id, field, proposed_value) values (sub2, 'entity_content', k2, 'overview', '"x"'); ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'K05 a property manager cannot propose for another property', 'pass', ok);
  perform set_config('request.jwt.claims', json_build_object('sub', ma, 'role', 'authenticated')::text, true);
  begin
    insert into public.submissions (organization_id, property_id, kind, title, status) values (o_m, k1, 'content', 'x', 'draft') returning id into sub2;
    insert into public.revisions (submission_id, target_table, target_id, field, proposed_value) values (sub2, 'entity_content', k1, 'overview', '"x"'); ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'K06 another partner cannot propose for this property', 'pass', ok);
  select count(*) into n from public.entity_content where id = k1;
  r := r || jsonb_build_object('t', 'K07 another partner cannot read this content', 'pass', n = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', pm, 'role', 'authenticated')::text, true);
  begin perform public.decide_revision(crev, 'approve'); ok := false; exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'K08 partners cannot approve their own content', 'pass', ok);
  perform set_config('request.jwt.claims', json_build_object('sub', je, 'role', 'authenticated')::text, true);
  perform public.decide_revision(crev, 'approve');
  jt := public.decide_revision(crev2, 'edit_approve', '"April to October, the dry season"', null);
  select count(*) into n from public.entity_content where id = k1 and inclusions = '["All meals", "Spa treatment"]' and best_months = 'April to October, the dry season';
  r := r || jsonb_build_object('t', 'K09 a house editor approves and edits; the content is stored', 'pass', n = 1 and jt = 'approved');
  perform set_config('request.jwt.claims', json_build_object('sub', pm, 'role', 'authenticated')::text, true);
  select count(*) into n from public.entity_content where id = k1;
  r := r || jsonb_build_object('t', 'K10 the partner sees the approved content', 'pass', n = 1);
  perform set_config('role', 'postgres', true);

  raise exception 'PARTNER_DESK_RLS %', r;
end $$;
