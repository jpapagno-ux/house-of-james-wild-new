-- Booking Live · Phase 1 · row-level security tests (spec §16 cases 1–3, 19).
-- Runs as one DO block and ALWAYS ends by raising an exception, so every test
-- user and row is rolled back. The exception text is the JSON result list.
-- Run in the Supabase SQL editor (or via the MCP execute_sql tool).

do $$
declare
  a uuid := gen_random_uuid();  -- owner
  b uuid := gen_random_uuid();  -- invited editor
  c uuid := gen_random_uuid();  -- stranger
  v uuid := gen_random_uuid();  -- invited viewer
  prop uuid;
  fol uuid;
  n int;
  r jsonb := '[]';
  ok boolean;
  procedure_note text;
begin
  -- helpers as local closures are not available in plpgsql, so each test
  -- switches identity with set_config and records pass/fail into r.
  insert into auth.users (id, email, email_confirmed_at, aud, role, raw_user_meta_data) values
    (a, 'a@test.jwc', now(), 'authenticated', 'authenticated', '{"first_name":"Ada"}'),
    (b, 'b@test.jwc', now(), 'authenticated', 'authenticated', '{}'),
    (c, 'c@test.jwc', now(), 'authenticated', 'authenticated', '{}'),
    (v, 'v@test.jwc', now(), 'authenticated', 'authenticated', '{}');
  select id into prop from public.properties where slug = 'leeu-estates';

  select count(*) into n from public.profiles where id in (a, b, c, v);
  r := r || jsonb_build_object('t', '01 profile auto-created for each sign-up', 'pass', n = 4);

  -- ===== as A (owner)
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  insert into public.favorites (property_id) values (prop);
  insert into public.folios (title) values ('Cape Winelands, May') returning id into fol;
  insert into public.folio_items (folio_id, property_id, notes) values (fol, prop, 'Manor House suite');
  insert into public.folio_invitations (folio_id, invited_email, role, token_hash)
    values (fol, 'b@test.jwc', 'editor', encode(extensions.digest('tok-b', 'sha256'), 'hex')),
           (fol, 'v@test.jwc', 'viewer', encode(extensions.digest('tok-v', 'sha256'), 'hex'));
  select count(*) into n from public.favorites;
  r := r || jsonb_build_object('t', '02 owner saves and sees own favorite', 'pass', n = 1);

  -- ===== as C (stranger)
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  select count(*) into n from public.favorites;
  r := r || jsonb_build_object('t', '03 stranger cannot see another traveler''s favorites', 'pass', n = 0);
  select count(*) into n from public.folios where id = fol;
  r := r || jsonb_build_object('t', '04 stranger cannot read a Folio by guessing its id', 'pass', n = 0);
  update public.folios set title = 'hijacked' where id = fol;
  get diagnostics n = row_count;
  r := r || jsonb_build_object('t', '05 stranger cannot edit a Folio by id', 'pass', n = 0);
  delete from public.folio_items where folio_id = fol;
  get diagnostics n = row_count;
  r := r || jsonb_build_object('t', '06 stranger cannot delete Folio items', 'pass', n = 0);
  begin
    insert into public.favorites (user_id, property_id) values (a, prop);
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', '07 stranger cannot write a favorite into another account', 'pass', ok);
  begin
    perform public.accept_folio_invitation('tok-b');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', '08 invitation cannot be accepted by the wrong email', 'pass', ok);
  select count(*) into n from public.profiles;
  r := r || jsonb_build_object('t', '09 traveler sees only their own profile', 'pass', n = 1);
  begin
    update public.profiles set email = 'x@evil.test' where id = c;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', '10 profile email is not client-editable', 'pass', ok);
  begin
    perform count(*) from private.audit_logs;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', '11 audit log is unreadable to travelers', 'pass', ok);
  begin
    execute 'truncate public.favorites';
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', '12 TRUNCATE (bypasses RLS) is denied', 'pass', ok);
  select count(*) into n from public.folio_invitations;
  r := r || jsonb_build_object('t', '13 stranger cannot list invitations or tokens', 'pass', n = 0);

  -- ===== as B (invited editor)
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  select count(*) into n from public.folios where id = fol;
  r := r || jsonb_build_object('t', '14 invitee sees nothing before accepting', 'pass', n = 0);
  ok := public.accept_folio_invitation('tok-b') = fol;
  r := r || jsonb_build_object('t', '15 invitee accepts with the right email', 'pass', ok);
  begin
    perform public.accept_folio_invitation('tok-b');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', '16 an invitation link works only once', 'pass', ok);
  insert into public.folio_items (folio_id, external_item_type, notes) values (fol, 'note', 'Add a wine day');
  select count(*) into n from public.folio_items where folio_id = fol;
  r := r || jsonb_build_object('t', '17 editor reads and adds Folio items', 'pass', n = 2);
  delete from public.folios where id = fol;
  get diagnostics n = row_count;
  r := r || jsonb_build_object('t', '18 editor cannot delete the Folio', 'pass', n = 0);
  begin
    update public.folios set owner_user_id = b where id = fol;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', '19 editor cannot take ownership', 'pass', ok);
  begin
    insert into public.folio_members (folio_id, user_id, role) values (fol, c, 'editor');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', '20 editor cannot share the Folio onward', 'pass', ok);

  -- ===== as V (viewer)
  perform set_config('request.jwt.claims', json_build_object('sub', v, 'role', 'authenticated')::text, true);
  perform public.accept_folio_invitation('tok-v');
  select count(*) into n from public.folio_items where folio_id = fol;
  r := r || jsonb_build_object('t', '21 viewer can read the Folio', 'pass', n = 2);
  begin
    insert into public.folio_items (folio_id, external_item_type) values (fol, 'note');
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', '22 viewer cannot add items', 'pass', ok);

  -- ===== as A: revoke B
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  update public.folio_members set access_status = 'revoked' where folio_id = fol and user_id = b;
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  select count(*) into n from public.folios where id = fol;
  r := r || jsonb_build_object('t', '23 revoking access removes it immediately', 'pass', n = 0);

  -- ===== anonymous visitor
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  select count(*) into n from public.properties;
  r := r || jsonb_build_object('t', '24 anonymous visitors can read published stays', 'pass', n >= 76);
  begin
    perform count(*) from public.folios;
    ok := false;
  exception when others then ok := true; end;
  r := r || jsonb_build_object('t', '25 anonymous visitors cannot touch Folios', 'pass', ok);

  -- ===== back to the database owner: audit trail exists
  perform set_config('role', 'postgres', true);
  select count(*) into n from private.audit_logs where entity_type = 'folio_members' and entity_id = fol::text || ':' || b::text;
  r := r || jsonb_build_object('t', '26 sharing changes are written to the audit log', 'pass', n >= 2);

  raise exception 'RLS_RESULTS %', r;
end $$;
