-- Partner Desk · Stage 1 · 0002 desk core (1 Nov 2026)
--
-- Contacts, submissions + revisions (the only road from a partner to the website),
-- content requests, verifications, partner applications and organization invitations.
--
-- Rules carried into the database (not only the UI):
--   • Partners edit administrative data directly (contacts, company details) — audited.
--   • Everything editorial or commercial is a SUBMISSION holding REVISIONS. A revision
--     reaches its target only through public.decide_revision(), which only James Wild & Co
--     staff can call, and only for whitelisted fields.
--   • Canonical IDs, publication status, Pathway assignments and SEO are never
--     whitelisted, so no partner action can reach them.

-- ===== 1. Contacts (partner CRM)
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  first_name text check (char_length(first_name) <= 80),
  last_name text check (char_length(last_name) <= 80),
  title text check (char_length(title) <= 120),
  email text check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  mobile text check (char_length(mobile) <= 40),
  whatsapp text check (char_length(whatsapp) <= 40),
  country char(2) check (country ~ '^[A-Z]{2}$'),
  timezone text check (char_length(timezone) <= 64),
  territory text check (char_length(territory) <= 120),
  languages text[] not null default '{}',
  roles text[] not null default '{}' check (roles <@ array['owner', 'general_manager', 'sales_director', 'reservations', 'marketing', 'pr',
    'trade_sales', 'groups', 'media', 'sustainability', 'conservation', 'finance', 'commission', 'emergency']::text[]),
  preferred_communication text check (preferred_communication in ('email', 'phone', 'whatsapp', 'video')),
  newsletter_opt_in boolean not null default false,
  trade_opt_in boolean not null default false,
  status text not null default 'active' check (status in ('active', 'to_verify', 'archived')),
  notes text check (char_length(notes) <= 2000),
  -- House-side fields: partners can read but not write these.
  jw_owner_id uuid references auth.users (id) on delete set null,
  last_communication_at timestamptz,
  last_verified_at timestamptz,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (coalesce(first_name, last_name, title) is not null)
);
create index contacts_org_idx on public.contacts (organization_id);
create trigger contacts_touch before update on public.contacts for each row execute function private.touch_updated_at();

create table public.contact_entities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  unique (contact_id, property_id)
);
create index contact_entities_property_idx on public.contact_entities (property_id);

-- ===== 2. Content requests (JW → partner)
create table public.content_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('REQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  property_id uuid references public.properties (id) on delete cascade,
  request_type text not null check (request_type in ('media', 'editorial', 'commercial')),
  requested_item text not null check (char_length(requested_item) between 1 and 160),
  instructions text check (char_length(instructions) <= 4000),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  due_date date,
  jw_owner_id uuid references auth.users (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'submitted', 'changes_requested', 'approved', 'closed', 'cancelled')),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_requests_org_idx on public.content_requests (organization_id, status);
create index content_requests_property_idx on public.content_requests (property_id);
create trigger content_requests_touch before update on public.content_requests for each row execute function private.touch_updated_at();

-- ===== 3. Submissions and revisions (partner → JW)
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('SUB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  property_id uuid references public.properties (id) on delete cascade,
  request_id uuid references public.content_requests (id) on delete set null,
  kind text not null check (kind in ('request_reply', 'content', 'rooms', 'rates', 'offer', 'media', 'document', 'profile', 'other')),
  title text not null check (char_length(title) between 1 and 160),
  partner_note text check (char_length(partner_note) <= 4000),
  -- Supporting documents by reference only (name + https link or storage path); uploads arrive in Stage 3.
  documents jsonb not null default '[]'::jsonb check (jsonb_typeof(documents) = 'array' and jsonb_array_length(documents) <= 20),
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'in_review', 'changes_requested', 'approved', 'partially_approved', 'rejected', 'withdrawn')),
  submitted_by uuid references auth.users (id) on delete set null default auth.uid(),
  submitted_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  jw_note text check (char_length(jw_note) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index submissions_org_idx on public.submissions (organization_id, status, created_at desc);
create index submissions_property_idx on public.submissions (property_id);
create index submissions_request_idx on public.submissions (request_id);
create trigger submissions_touch before update on public.submissions for each row execute function private.touch_updated_at();

-- Which fields a revision may target. Anything not listed can never be changed
-- through the desk (IDs, slugs, publication status, Pathways, SEO, prices).
create table private.revision_fields (
  target_table text not null,
  field text not null,
  label text not null,
  primary key (target_table, field)
);
insert into private.revision_fields (target_table, field, label) values
  ('properties', 'name', 'Name'),
  ('properties', 'category', 'Category'),
  ('properties', 'country', 'Country'),
  ('properties', 'region', 'Region'),
  ('properties', 'timezone', 'Time zone'),
  ('room_types', 'name', 'Room name'),
  ('room_types', 'description', 'Room description'),
  ('room_types', 'short_description', 'Short description'),
  ('room_types', 'full_description', 'Full description'),
  ('room_types', 'unit_type', 'Unit type'),
  ('room_types', 'bed_configuration', 'Bed configuration'),
  ('room_types', 'size_sqm', 'Size (m²)'),
  ('room_types', 'view_name', 'View'),
  ('room_types', 'max_adults', 'Maximum adults'),
  ('room_types', 'max_children', 'Maximum children'),
  ('room_types', 'max_occupancy', 'Maximum occupancy'),
  ('room_types', 'features', 'Room features'),
  ('room_types', 'included', 'Included'),
  ('room_types', 'excluded', 'Not included'),
  ('room_types', 'important_notes', 'Important notes');
revoke all on private.revision_fields from public, anon, authenticated;

create table public.revisions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  property_id uuid references public.properties (id) on delete cascade,
  target_table text not null,
  target_id uuid not null,
  field text not null,
  current_value jsonb,
  proposed_value jsonb not null,
  partner_note text check (char_length(partner_note) <= 2000),
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'edited_approved', 'rejected', 'asked')),
  final_value jsonb,
  jw_note text check (char_length(jw_note) <= 2000),
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index revisions_submission_idx on public.revisions (submission_id);
create index revisions_target_idx on public.revisions (target_table, target_id);

-- A revision must name a whitelisted field, and its current value is captured by the
-- database (not trusted from the client) so the reviewer sees the true "before".
create or replace function private.revision_prepare()
returns trigger language plpgsql security definer set search_path = '' as $$
declare cur jsonb; owner_prop uuid;
begin
  if not exists (select 1 from private.revision_fields f where f.target_table = new.target_table and f.field = new.field) then
    raise exception 'field %.% cannot be changed through the desk', new.target_table, new.field using errcode = '42501';
  end if;
  if new.target_table = 'properties' then
    owner_prop := new.target_id;
    execute format('select to_jsonb(t) -> %L from public.properties t where t.id = $1', new.field) into cur using new.target_id;
  elsif new.target_table = 'room_types' then
    select property_id into owner_prop from public.room_types where id = new.target_id;
    execute format('select to_jsonb(t) -> %L from public.room_types t where t.id = $1', new.field) into cur using new.target_id;
  end if;
  if owner_prop is null then raise exception 'revision target not found' using errcode = '23503'; end if;
  if not exists (select 1 from public.submissions s where s.id = new.submission_id and s.property_id = owner_prop) then
    raise exception 'revision must belong to a submission for the same entity' using errcode = '23514';
  end if;
  new.property_id := owner_prop;
  new.current_value := cur;
  new.status := 'proposed';
  new.final_value := null; new.decided_by := null; new.decided_at := null; new.jw_note := null;
  return new;
end $$;
revoke execute on function private.revision_prepare() from public, anon, authenticated;
create trigger revisions_prepare before insert on public.revisions for each row execute function private.revision_prepare();

-- Partner-side guard on submissions: partners may only create submissions as
-- themselves, and may only edit or withdraw them while still open. JW decisions
-- go through decide_revision / decide_submission (security definer).
create or replace function private.submission_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Set only inside decide_* functions, and honoured only for JW editors.
  if current_setting('jw.deciding', true) = 'on' and private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']) then return new; end if;
  if tg_op = 'INSERT' then
    new.submitted_by := auth.uid();
    if new.status not in ('draft', 'submitted') then new.status := 'submitted'; end if;
    new.submitted_at := case when new.status = 'submitted' then now() end;
    new.decided_by := null; new.decided_at := null; new.jw_note := null;
    return new;
  end if;
  if old.status not in ('draft', 'submitted', 'changes_requested') then
    raise exception 'this submission is already with the house' using errcode = '42501';
  end if;
  if new.status not in ('draft', 'submitted', 'withdrawn') then
    raise exception 'partners can only submit or withdraw' using errcode = '42501';
  end if;
  if (new.organization_id, new.property_id, new.request_id, new.kind, new.submitted_by, new.decided_by, new.decided_at, new.jw_note, new.reference)
     is distinct from (old.organization_id, old.property_id, old.request_id, old.kind, old.submitted_by, old.decided_by, old.decided_at, old.jw_note, old.reference) then
    raise exception 'those fields are set by the house' using errcode = '42501';
  end if;
  if new.status = 'submitted' and old.status <> 'submitted' then new.submitted_at := now(); end if;
  return new;
end $$;
revoke execute on function private.submission_guard() from public, anon, authenticated;
create trigger submissions_guard before insert or update on public.submissions for each row execute function private.submission_guard();

-- A reply to a content request moves the request to "submitted".
create or replace function private.submission_marks_request()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.request_id is not null and new.status = 'submitted' then
    update public.content_requests set status = 'submitted' where id = new.request_id and status in ('open', 'changes_requested');
  end if;
  return new;
end $$;
revoke execute on function private.submission_marks_request() from public, anon, authenticated;
create trigger submissions_mark_request after insert or update of status on public.submissions
  for each row execute function private.submission_marks_request();

-- ===== 4. Verifications ("last verified" lines and Portfolio Health)
create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  aspect text not null check (aspect in ('contacts', 'images', 'property_info', 'rates', 'offers', 'pathways', 'rooms')),
  status text not null check (status in ('verified', 'attention', 'missing')),
  note text check (char_length(note) <= 400),
  valid_until date,
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz not null default now(),
  unique (property_id, aspect)
);

-- ===== 5. Partner applications (no self-signup: JW reviews, then invites)
create table public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null check (char_length(organization_name) between 1 and 160),
  website text check (char_length(website) <= 200),
  contact_name text not null check (char_length(contact_name) between 1 and 120),
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  country text check (char_length(country) <= 80),
  properties text check (char_length(properties) <= 1000),
  message text check (char_length(message) <= 4000),
  status text not null default 'new' check (status in ('new', 'reviewing', 'invited', 'declined')),
  created_at timestamptz not null default now()
);

-- ===== 6. Organization invitations
create table public.org_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role text not null check (role in ('partner_admin', 'partner_contributor', 'jw_admin', 'jw_editor', 'jw_portfolio_manager')),
  entity_ids uuid[] not null default '{}',
  token_hash text not null unique,
  invited_by uuid references auth.users (id) on delete set null default auth.uid(),
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index org_invitations_org_idx on public.org_invitations (organization_id);

create or replace function public.accept_org_invitation(raw_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare inv public.org_invitations; me text; mid uuid; e uuid;
begin
  if auth.uid() is null then raise exception 'sign in first' using errcode = '42501'; end if;
  select * into inv from public.org_invitations
    where token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex') for update;
  if not found or inv.accepted_at is not null or inv.revoked_at is not null or inv.expires_at < now() then
    raise exception 'invitation is not valid' using errcode = 'P0002';
  end if;
  select lower(email) into me from auth.users where id = auth.uid();
  if me is distinct from lower(inv.email) then raise exception 'invitation is for another email' using errcode = '42501'; end if;
  insert into public.organization_memberships (user_id, organization_id, role, status)
    values (auth.uid(), inv.organization_id, inv.role, 'active')
    on conflict (user_id, organization_id, role) do update set status = 'active'
    returning id into mid;
  foreach e in array inv.entity_ids loop
    if exists (select 1 from public.entity_partners ep where ep.property_id = e and ep.organization_id = inv.organization_id) then
      insert into public.entity_access (membership_id, property_id) values (mid, e) on conflict do nothing;
    end if;
  end loop;
  update public.org_invitations set accepted_at = now(), accepted_by = auth.uid() where id = inv.id;
  return inv.organization_id;
end $$;
revoke all on function public.accept_org_invitation(text) from public, anon;
grant execute on function public.accept_org_invitation(text) to authenticated;

-- Partner admins may change a teammate's partner role or remove them; never their own
-- membership and never a JW role.
create or replace function public.set_team_member(p_membership uuid, p_role text, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
declare m public.organization_memberships;
begin
  select * into m from public.organization_memberships where id = p_membership for update;
  if not found then raise exception 'not found' using errcode = 'P0002'; end if;
  if not (private.is_org_member(m.organization_id, array['partner_admin', 'partner_manager']) or private.is_jw(array['jw_admin'])) then
    raise exception 'only a partner admin can change the team' using errcode = '42501';
  end if;
  if m.user_id = auth.uid() then raise exception 'you cannot change your own access' using errcode = '42501'; end if;
  if p_role not in ('partner_admin', 'partner_contributor') or m.role not in ('partner_admin', 'partner_contributor', 'partner_manager', 'partner_editor') then
    raise exception 'that role cannot be set here' using errcode = '23514';
  end if;
  if p_status not in ('active', 'revoked') then raise exception 'bad status' using errcode = '23514'; end if;
  update public.organization_memberships set role = p_role, status = p_status where id = m.id;
end $$;
revoke all on function public.set_team_member(uuid, text, text) from public, anon;
grant execute on function public.set_team_member(uuid, text, text) to authenticated;

-- ===== 7. Editorial decisions (James Wild & Co only)
-- approve | edit_approve | reject | ask. Only approved values ever reach the target row,
-- and only if the row still holds the value the partner saw (no silent overwrites).
create or replace function public.decide_revision(p_revision uuid, p_action text, p_final jsonb default null, p_note text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare r public.revisions; now_val jsonb; v jsonb; open_n int; ok_n int; asked_n int; s_status text;
begin
  if not private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']) then
    raise exception 'only James Wild & Co editors can decide' using errcode = '42501';
  end if;
  if p_action not in ('approve', 'edit_approve', 'reject', 'ask') then raise exception 'bad action' using errcode = '23514'; end if;
  select * into r from public.revisions where id = p_revision for update;
  if not found then raise exception 'revision not found' using errcode = 'P0002'; end if;
  if r.status not in ('proposed', 'asked') then raise exception 'already decided' using errcode = '23514'; end if;
  if not exists (select 1 from private.revision_fields f where f.target_table = r.target_table and f.field = r.field) then
    raise exception 'field no longer allowed' using errcode = '42501';
  end if;

  perform set_config('jw.deciding', 'on', true);
  if p_action in ('approve', 'edit_approve') then
    v := case when p_action = 'edit_approve' then p_final else r.proposed_value end;
    if v is null then raise exception 'edit + approve needs a value' using errcode = '23514'; end if;
    execute format('select to_jsonb(t) -> %L from public.%I t where t.id = $1', r.field, r.target_table) into now_val using r.target_id;
    if now_val is distinct from r.current_value then
      raise exception 'the live value changed since this was submitted; ask the partner to resubmit' using errcode = '40001';
    end if;
    execute format('update public.%I set %I = (jsonb_populate_record(null::public.%I, jsonb_build_object(%L, $1))).%I where id = $2',
                   r.target_table, r.field, r.target_table, r.field, r.field) using v, r.target_id;
    update public.revisions set status = case when p_action = 'approve' then 'approved' else 'edited_approved' end,
      final_value = v, jw_note = p_note, decided_by = auth.uid(), decided_at = now() where id = r.id;
  else
    update public.revisions set status = case when p_action = 'reject' then 'rejected' else 'asked' end,
      jw_note = p_note, decided_by = auth.uid(), decided_at = now() where id = r.id;
  end if;

  -- Roll the submission's status up from its revisions.
  select count(*) filter (where status = 'proposed'), count(*) filter (where status in ('approved', 'edited_approved')), count(*) filter (where status = 'asked')
    into open_n, ok_n, asked_n from public.revisions where submission_id = r.submission_id;
  s_status := case
    when asked_n > 0 then 'changes_requested'
    when open_n > 0 then 'in_review'
    when ok_n = (select count(*) from public.revisions where submission_id = r.submission_id) then 'approved'
    when ok_n > 0 then 'partially_approved'
    else 'rejected' end;
  update public.submissions set status = s_status, decided_by = auth.uid(),
    decided_at = case when s_status in ('approved', 'partially_approved', 'rejected') then now() end
    where id = r.submission_id;
  update public.content_requests cr set status = case s_status when 'changes_requested' then 'changes_requested' when 'rejected' then 'changes_requested' else 'approved' end
    from public.submissions s where s.id = r.submission_id and cr.id = s.request_id and s_status in ('approved', 'partially_approved', 'changes_requested', 'rejected');
  return s_status;
end $$;
revoke all on function public.decide_revision(uuid, text, jsonb, text) from public, anon;
grant execute on function public.decide_revision(uuid, text, jsonb, text) to authenticated;

-- Decide a submission that carries no field revisions (a reply with a note or documents).
create or replace function public.decide_submission(p_submission uuid, p_action text, p_note text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare s public.submissions; s_status text;
begin
  if not private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']) then
    raise exception 'only James Wild & Co editors can decide' using errcode = '42501';
  end if;
  if p_action not in ('approve', 'reject', 'ask', 'in_review') then raise exception 'bad action' using errcode = '23514'; end if;
  select * into s from public.submissions where id = p_submission for update;
  if not found then raise exception 'submission not found' using errcode = 'P0002'; end if;
  if s.status in ('approved', 'partially_approved', 'rejected', 'withdrawn', 'draft') then raise exception 'not open for a decision' using errcode = '23514'; end if;
  if p_action <> 'in_review' and exists (select 1 from public.revisions where submission_id = s.id and status = 'proposed') then
    raise exception 'decide each proposed change first' using errcode = '23514';
  end if;
  perform set_config('jw.deciding', 'on', true);
  s_status := case p_action when 'approve' then 'approved' when 'reject' then 'rejected' when 'ask' then 'changes_requested' else 'in_review' end;
  update public.submissions set status = s_status, jw_note = coalesce(p_note, jw_note), decided_by = auth.uid(),
    decided_at = case when s_status in ('approved', 'rejected') then now() end where id = s.id;
  if s.request_id is not null and p_action <> 'in_review' then
    update public.content_requests set status = case s_status when 'approved' then 'approved' else 'changes_requested' end where id = s.request_id;
  end if;
  return s_status;
end $$;
revoke all on function public.decide_submission(uuid, text, text) from public, anon;
grant execute on function public.decide_submission(uuid, text, text) to authenticated;

-- ===== 8. Row-level security
alter table public.contacts enable row level security;
alter table public.contact_entities enable row level security;
alter table public.content_requests enable row level security;
alter table public.submissions enable row level security;
alter table public.revisions enable row level security;
alter table public.verifications enable row level security;
alter table public.partner_applications enable row level security;
alter table public.org_invitations enable row level security;
alter table private.revision_fields enable row level security;

-- Contacts: organization members read; partner admins and JW write (direct, audited).
create policy contacts_select on public.contacts for select to authenticated
  using (private.is_jw() or private.is_org_member(organization_id));
create policy contacts_insert on public.contacts for insert to authenticated
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']) or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));
create policy contacts_update on public.contacts for update to authenticated
  using (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']) or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']))
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']) or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));
create policy contacts_delete on public.contacts for delete to authenticated
  using (private.is_jw(array['jw_admin']) or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));

create policy contact_entities_select on public.contact_entities for select to authenticated using (
  exists (select 1 from public.contacts c where c.id = contact_id and (private.is_jw() or private.is_org_member(c.organization_id))));
create policy contact_entities_insert on public.contact_entities for insert to authenticated with check (
  exists (select 1 from public.contacts c where c.id = contact_id
          and (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']) or private.is_org_member(c.organization_id, array['partner_admin', 'partner_manager'])))
  and exists (select 1 from public.entity_partners ep join public.contacts c on c.organization_id = ep.organization_id
              where c.id = contact_id and ep.property_id = contact_entities.property_id));
create policy contact_entities_delete on public.contact_entities for delete to authenticated using (
  exists (select 1 from public.contacts c where c.id = contact_id
          and (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']) or private.is_org_member(c.organization_id, array['partner_admin', 'partner_manager']))));

-- Requests: members see their organization's requests (narrowed members only for
-- their entities); only JW creates or changes them.
create policy requests_select on public.content_requests for select to authenticated using (
  private.is_jw() or (private.is_org_member(organization_id) and (property_id is null or private.can_see_entity(property_id))));
create policy requests_jw_insert on public.content_requests for insert to authenticated
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']));
create policy requests_jw_update on public.content_requests for update to authenticated
  using (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']))
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']));

-- Submissions: visible to JW and to members who can see the entity; created by
-- members who can edit it (or, for organization-level submissions, partner admins).
create policy submissions_select on public.submissions for select to authenticated using (
  private.is_jw() or (private.is_org_member(organization_id) and (property_id is null or private.can_see_entity(property_id))));
create policy submissions_insert on public.submissions for insert to authenticated with check (
  private.is_org_member(organization_id, array['partner_admin', 'partner_contributor', 'partner_manager', 'partner_editor'])
  and (property_id is null and private.is_org_member(organization_id, array['partner_admin', 'partner_manager'])
       or property_id is not null and private.can_edit_entity(property_id)
          and exists (select 1 from public.entity_partners ep where ep.property_id = submissions.property_id and ep.organization_id = submissions.organization_id))
  and (request_id is null or exists (select 1 from public.content_requests cr where cr.id = request_id and cr.organization_id = submissions.organization_id
                                     and cr.property_id is not distinct from submissions.property_id and cr.status in ('open', 'changes_requested'))));
create policy submissions_update on public.submissions for update to authenticated
  using (submitted_by = (select auth.uid()) or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']))
  with check (submitted_by = (select auth.uid()) or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));

create policy revisions_select on public.revisions for select to authenticated using (
  exists (select 1 from public.submissions s where s.id = submission_id
          and (private.is_jw() or (private.is_org_member(s.organization_id) and (s.property_id is null or private.can_see_entity(s.property_id))))));
create policy revisions_insert on public.revisions for insert to authenticated with check (
  exists (select 1 from public.submissions s where s.id = submission_id and s.status in ('draft', 'submitted', 'changes_requested')
          and (s.submitted_by = (select auth.uid()) or private.is_org_member(s.organization_id, array['partner_admin', 'partner_manager']))
          and s.property_id is not null and private.can_edit_entity(s.property_id)));

create policy verifications_select on public.verifications for select to authenticated using (private.can_see_entity(property_id));
create policy verifications_jw_write on public.verifications for all to authenticated
  using (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']))
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager']));

-- Applications: anyone may apply; only JW reads them.
create policy applications_insert on public.partner_applications for insert to anon, authenticated with check (status = 'new');
create policy applications_jw_select on public.partner_applications for select to authenticated using (private.is_jw());
create policy applications_jw_update on public.partner_applications for update to authenticated
  using (private.is_jw()) with check (private.is_jw());

-- Invitations: partner admins invite partner roles to their organization; JW
-- invites anyone. The token hash is never readable by clients.
create policy org_invitations_select on public.org_invitations for select to authenticated
  using (private.is_jw(array['jw_admin']) or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));
create policy org_invitations_insert on public.org_invitations for insert to authenticated with check (
  private.is_jw(array['jw_admin'])
  or (private.is_org_member(organization_id, array['partner_admin', 'partner_manager']) and role in ('partner_admin', 'partner_contributor')));
create policy org_invitations_update on public.org_invitations for update to authenticated
  using (private.is_jw(array['jw_admin']) or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']))
  with check (private.is_jw(array['jw_admin']) or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));

-- ===== 9. Grants (default Supabase grants are taken back first)
revoke all on public.contacts, public.contact_entities, public.content_requests, public.submissions, public.revisions,
  public.verifications, public.partner_applications, public.org_invitations from anon, authenticated;

grant select, delete on public.contacts to authenticated;
grant insert (organization_id, first_name, last_name, title, email, mobile, whatsapp, country, timezone, territory, languages, roles,
              preferred_communication, newsletter_opt_in, trade_opt_in, status, notes) on public.contacts to authenticated;
grant update (first_name, last_name, title, email, mobile, whatsapp, country, timezone, territory, languages, roles,
              preferred_communication, newsletter_opt_in, trade_opt_in, status, notes) on public.contacts to authenticated;
grant select, insert, delete on public.contact_entities to authenticated;

grant select on public.content_requests to authenticated;
grant insert (organization_id, property_id, request_type, requested_item, instructions, priority, due_date, jw_owner_id, status) on public.content_requests to authenticated;
grant update (requested_item, instructions, priority, due_date, jw_owner_id, status) on public.content_requests to authenticated;

grant select on public.submissions to authenticated;
grant insert (organization_id, property_id, request_id, kind, title, partner_note, documents, status) on public.submissions to authenticated;
grant update (title, partner_note, documents, status) on public.submissions to authenticated;

grant select on public.revisions to authenticated;
grant insert (submission_id, target_table, target_id, field, proposed_value, partner_note) on public.revisions to authenticated;

grant select, insert, update, delete on public.verifications to authenticated;

grant insert (organization_name, website, contact_name, email, country, properties, message) on public.partner_applications to anon, authenticated;
grant select, update (status) on public.partner_applications to authenticated;

grant select (id, organization_id, email, role, entity_ids, invited_by, expires_at, accepted_at, accepted_by, revoked_at, created_at) on public.org_invitations to authenticated;
grant insert (organization_id, email, role, entity_ids, token_hash, expires_at) on public.org_invitations to authenticated;
grant update (revoked_at) on public.org_invitations to authenticated;

-- ===== 10. Audit
create trigger audit_contacts after insert or update or delete on public.contacts for each row execute function private.audit_row();
create trigger audit_contact_entities after insert or update or delete on public.contact_entities for each row execute function private.audit_row();
create trigger audit_content_requests after insert or update or delete on public.content_requests for each row execute function private.audit_row();
create trigger audit_submissions after insert or update or delete on public.submissions for each row execute function private.audit_row();
create trigger audit_revisions after insert or update or delete on public.revisions for each row execute function private.audit_row();
create trigger audit_verifications after insert or update or delete on public.verifications for each row execute function private.audit_row();
create trigger audit_org_invitations after insert or update or delete on public.org_invitations for each row execute function private.audit_row();
