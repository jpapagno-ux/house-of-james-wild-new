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
  begin
    insert into public.contacts (organization_id, first_name) values (o_k, 'Nope');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', 'B04 contributor cannot create contacts', 'pass', ok);
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

  raise exception 'PARTNER_DESK_RLS %', r;
end $$;
