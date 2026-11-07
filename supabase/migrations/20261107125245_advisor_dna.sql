-- Advisor Desk · Step 3, part five · Advisor DNA kept on the desk (James, 6-7 Nov 2026: "yes").
--
-- The desk becomes the one place an advisor's DNA is kept: Pathways, volumes, who they plan for, the
-- countries they know first-hand, their own marks on Ledger records, languages, specialties, a line in
-- their own words and whether they are taking clients. The advisor proposes; the house approves or
-- returns it (advisors contribute, the house publishes). The approved DNA is what the website shows:
-- the build reads public_advisor_dna() and lays it over the Library's copy, advisor by advisor, so an
-- advisor without approved desk DNA keeps the Library's until they confirm their own.
--
-- Only ACTIVE advisors are published. A paused advisor, or one who has left, is published as hidden, so
-- the site stops offering them for places they merely state (their past marks stay true).
--
-- Activation now also needs approved DNA (part five of the file).

-- ===== The approved DNA (one row per advisor; replaced on each approval)
create table public.advisor_dna (
  advisor_id uuid primary key references public.advisors (id) on delete cascade,
  pathways text[] not null default '{}',
  volumes text[] not null default '{}',
  party_types text[] not null default '{}',
  countries text[] not null default '{}',
  languages text[] not null default '{}',
  specialties text[] not null default '{}',
  availability text not null default 'open' check (availability in ('open', 'waitlist', 'closed')),
  match_note text check (char_length(match_note) <= 300),
  marks jsonb not null default '[]'::jsonb check (jsonb_typeof(marks) = 'array'),
  proposal_id uuid,
  confirmed_at timestamptz not null,
  approved_at timestamptz not null default now(),
  approved_by uuid references auth.users (id)
);
create trigger audit_advisor_dna after insert or update or delete on public.advisor_dna for each row execute function private.audit_row();
alter table public.advisor_dna enable row level security;
create policy advisor_dna_select on public.advisor_dna for select to authenticated
  using (advisor_id = private.my_advisor_file() or private.is_advisor_keeper());
revoke all on public.advisor_dna from anon;
revoke insert, update, delete on public.advisor_dna from authenticated;
grant select on public.advisor_dna to authenticated;

-- ===== Proposals (what the advisor sends; the house decides)
create table public.advisor_dna_proposals (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'returned', 'withdrawn')),
  house_note text check (char_length(house_note) <= 1000),
  submitted_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users (id)
);
create unique index advisor_dna_proposals_one_open on public.advisor_dna_proposals (advisor_id) where status = 'submitted';
create index advisor_dna_proposals_advisor_idx on public.advisor_dna_proposals (advisor_id, created_at desc);
create trigger audit_advisor_dna_proposals after insert or update or delete on public.advisor_dna_proposals for each row execute function private.audit_row();
alter table public.advisor_dna_proposals enable row level security;
create policy advisor_dna_proposals_select on public.advisor_dna_proposals for select to authenticated
  using (advisor_id = private.my_advisor_file() or private.is_advisor_keeper());
revoke all on public.advisor_dna_proposals from anon;
revoke insert, update, delete on public.advisor_dna_proposals from authenticated;
grant select on public.advisor_dna_proposals to authenticated;

-- ===== Checking a proposal: every list from its own short set, every free word short. Returns it tidied.
create or replace function private.clean_advisor_dna(p jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare
  arr text[]; out jsonb := '{}'::jsonb; m jsonb; marks jsonb := '[]'::jsonb; t text;
  allowed jsonb := jsonb_build_object(
    'pathways', jsonb_build_array('PATH-01', 'PATH-02', 'PATH-03', 'PATH-04', 'PATH-05', 'PATH-06', 'PATH-07', 'PATH-08'),
    'volumes', jsonb_build_array('stays', 'safaris', 'gatherings', 'voyages', 'overland', 'europe'),
    'party_types', jsonb_build_array('couple', 'family', 'friends', 'solo', 'group'));
  k text;
begin
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'Nothing to send' using errcode = '22023'; end if;
  foreach k in array array['pathways', 'volumes', 'party_types'] loop
    select coalesce(array_agg(distinct x), '{}') into arr from jsonb_array_elements_text(coalesce(p -> k, '[]')) x;
    if exists (select 1 from unnest(arr) x where not (allowed -> k) ? x) then raise exception 'Choose % from the list', replace(k, '_', ' ') using errcode = '22023'; end if;
    out := out || jsonb_build_object(k, to_jsonb(arr));
  end loop;
  if jsonb_array_length(out -> 'pathways') = 0 then raise exception 'Choose at least one Pathway' using errcode = '22023'; end if;
  if jsonb_array_length(out -> 'volumes') = 0 then raise exception 'Choose at least one volume' using errcode = '22023'; end if;
  select coalesce(array_agg(distinct x), '{}') into arr from jsonb_array_elements_text(coalesce(p -> 'countries', '[]')) x;
  if cardinality(arr) = 0 then raise exception 'Name at least one country you know first-hand' using errcode = '22023'; end if;
  if cardinality(arr) > 60 or exists (select 1 from unnest(arr) x where x !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(x) > 60) then
    raise exception 'Choose countries from the list' using errcode = '22023'; end if;
  out := out || jsonb_build_object('countries', to_jsonb(arr));
  foreach k in array array['languages', 'specialties'] loop
    select coalesce(array_agg(btrim(x)), '{}') into arr from jsonb_array_elements_text(coalesce(p -> k, '[]')) x where btrim(x) <> '';
    if cardinality(arr) > 12 or exists (select 1 from unnest(arr) x where length(x) > 80) then raise exception 'Keep % to twelve, each short', k using errcode = '22023'; end if;
    out := out || jsonb_build_object(k, to_jsonb(arr));
  end loop;
  t := coalesce(p ->> 'availability', 'open');
  if t not in ('open', 'waitlist', 'closed') then raise exception 'Choose whether you are taking clients' using errcode = '22023'; end if;
  out := out || jsonb_build_object('availability', t);
  t := nullif(btrim(coalesce(p ->> 'match_note', '')), '');
  if length(t) > 300 then raise exception 'Keep your line under 300 characters' using errcode = '22023'; end if;
  out := out || jsonb_build_object('match_note', t);
  for m in select * from jsonb_array_elements(coalesce(p -> 'marks', '[]')) loop
    if (m ->> 'ledgerId') !~ '^[A-Z]{3}-\d{4}-\d{6}$' or (m ->> 'mark') not in ('Stayed', 'Walked It', 'Sailed It') then
      raise exception 'Mark a stay as Stayed, Walked It or Sailed It' using errcode = '22023'; end if;
    if coalesce(m ->> 'when', '') !~ '^[A-Za-z0-9 ,.-]{0,20}$' then raise exception 'Say when you were there in a few words, like May 2024' using errcode = '22023'; end if;
    if length(m ->> 'note') > 200 then raise exception 'Keep each note under 200 characters' using errcode = '22023'; end if;
    marks := marks || jsonb_build_array(jsonb_build_object('ledgerId', m ->> 'ledgerId', 'mark', m ->> 'mark',
      'when', nullif(m ->> 'when', ''), 'note', nullif(btrim(coalesce(m ->> 'note', '')), '')));
  end loop;
  if jsonb_array_length(marks) > 80 then raise exception 'Up to 80 marks' using errcode = '22023'; end if;
  return out || jsonb_build_object('marks', marks);
end;
$$;
revoke execute on function private.clean_advisor_dna(jsonb) from public, anon, authenticated;

-- ===== The advisor sends their DNA (a newer send replaces one still waiting)
create or replace function public.submit_advisor_dna(p_dna jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare me uuid := private.my_advisor_file(); clean jsonb; pid uuid;
begin
  if me is null then raise exception 'Sign in with your authenticator code' using errcode = '42501'; end if;
  clean := private.clean_advisor_dna(p_dna);
  update public.advisor_dna_proposals set status = 'withdrawn', decided_at = now(), decided_by = auth.uid()
    where advisor_id = me and status = 'submitted';
  insert into public.advisor_dna_proposals (advisor_id, payload, submitted_by) values (me, clean, auth.uid()) returning id into pid;
  return pid;
end;
$$;
revoke all on function public.submit_advisor_dna(jsonb) from public, anon;
grant execute on function public.submit_advisor_dna(jsonb) to authenticated;

-- ===== The house decides
create or replace function public.decide_advisor_dna(p_proposal uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare pr record; d jsonb;
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  if p_status not in ('approved', 'returned') then raise exception 'Approve or return' using errcode = '22023'; end if;
  if p_status = 'returned' and coalesce(btrim(p_note), '') = '' then raise exception 'Say why it is returned' using errcode = '22023'; end if;
  select * into pr from public.advisor_dna_proposals where id = p_proposal for update;
  if pr is null or pr.status <> 'submitted' then raise exception 'That is no longer waiting' using errcode = 'P0002'; end if;
  update public.advisor_dna_proposals set status = p_status, house_note = nullif(btrim(p_note), ''), decided_at = now(), decided_by = auth.uid()
    where id = p_proposal;
  if p_status = 'approved' then
    d := pr.payload;
    insert into public.advisor_dna as x (advisor_id, pathways, volumes, party_types, countries, languages, specialties, availability, match_note, marks, proposal_id, confirmed_at, approved_at, approved_by)
    values (pr.advisor_id,
      array(select jsonb_array_elements_text(d -> 'pathways')), array(select jsonb_array_elements_text(d -> 'volumes')),
      array(select jsonb_array_elements_text(d -> 'party_types')), array(select jsonb_array_elements_text(d -> 'countries')),
      array(select jsonb_array_elements_text(d -> 'languages')), array(select jsonb_array_elements_text(d -> 'specialties')),
      d ->> 'availability', d ->> 'match_note', d -> 'marks', pr.id, pr.created_at, now(), auth.uid())
    on conflict (advisor_id) do update set pathways = excluded.pathways, volumes = excluded.volumes, party_types = excluded.party_types,
      countries = excluded.countries, languages = excluded.languages, specialties = excluded.specialties, availability = excluded.availability,
      match_note = excluded.match_note, marks = excluded.marks, proposal_id = excluded.proposal_id, confirmed_at = excluded.confirmed_at,
      approved_at = excluded.approved_at, approved_by = excluded.approved_by;
  end if;
end;
$$;
revoke all on function public.decide_advisor_dna(uuid, text, text) from public, anon;
grant execute on function public.decide_advisor_dna(uuid, text, text) to authenticated;

-- ===== What the website reads at build: public fields only, active advisors; paused or left as hidden.
create or replace function public.public_advisor_dna()
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x ->> 'ledgerId'), '[]'::jsonb) from (
    select case when a.status = 'active' then jsonb_build_object(
        'slug', a.slug, 'ledgerId', a.adv_number, 'hidden', false,
        'pathways', to_jsonb(d.pathways), 'volumes', to_jsonb(d.volumes), 'partyTypes', to_jsonb(d.party_types),
        'countries', to_jsonb(d.countries), 'languages', to_jsonb(d.languages), 'specialties', to_jsonb(d.specialties),
        'availability', d.availability, 'matchNote', d.match_note,
        'confirmed', to_char(d.confirmed_at at time zone 'UTC', 'YYYY-MM-DD'), 'updated', to_char(d.approved_at at time zone 'UTC', 'YYYY-MM-DD'),
        'marks', d.marks)
      else jsonb_build_object('slug', a.slug, 'ledgerId', a.adv_number, 'hidden', true) end as x
    from public.advisors a left join public.advisor_dna d on d.advisor_id = a.id
    where a.slug is not null and ((a.status = 'active' and d.advisor_id is not null) or a.status in ('paused', 'left'))
  ) s;
$$;
revoke all on function public.public_advisor_dna() from public;
grant execute on function public.public_advisor_dna() to anon, authenticated;

-- ===== The file now has five parts: DNA counts as done once sent; activation needs it approved.
create or replace function private.advisor_file_state(p_advisor uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  with cur as (select id, is_placeholder from public.advisor_agreements where status = 'current'),
  sig as (select s.* from public.advisor_signatures s join cur on cur.id = s.agreement_id where s.advisor_id = p_advisor),
  docs as (select kind from public.advisor_documents where advisor_id = p_advisor and status in ('submitted', 'accepted')),
  ok_docs as (select kind from public.advisor_documents where advisor_id = p_advisor and status = 'accepted'
              and (expires_on is null or expires_on >= current_date))
  select jsonb_build_object(
    'details', exists (select 1 from public.advisor_details where advisor_id = p_advisor),
    'plan', exists (select 1 from public.advisor_plan_acks where advisor_id = p_advisor),
    'agreement', exists (select 1 from sig),
    'agreement_placeholder', coalesce((select is_placeholder from cur), true),
    'tax_form', exists (select 1 from docs where kind = 'tax_form'),
    'eo_insurance', exists (select 1 from docs where kind = 'eo_insurance'),
    'tax_form_accepted', exists (select 1 from ok_docs where kind = 'tax_form'),
    'eo_insurance_accepted', exists (select 1 from ok_docs where kind = 'eo_insurance'),
    'dna', exists (select 1 from public.advisor_dna where advisor_id = p_advisor)
           or exists (select 1 from public.advisor_dna_proposals where advisor_id = p_advisor and status = 'submitted'),
    'dna_approved', exists (select 1 from public.advisor_dna where advisor_id = p_advisor));
$$;
revoke execute on function private.advisor_file_state(uuid) from public, anon, authenticated;

create or replace function public.activate_advisor(p_advisor uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare s jsonb; a record;
begin
  if not private.is_jw(array['jw_admin', 'admin']) then raise exception 'Only a house admin activates an advisor' using errcode = '42501'; end if;
  select * into a from public.advisors where id = p_advisor;
  if a is null then raise exception 'No such advisor' using errcode = 'P0002'; end if;
  if a.status <> 'invited' then raise exception 'Only an invited advisor can be activated' using errcode = '22023'; end if;
  if a.user_id is null then raise exception 'The advisor has not signed in yet' using errcode = '22023'; end if;
  s := private.advisor_file_state(p_advisor);
  if not ((s ->> 'details')::boolean and (s ->> 'plan')::boolean and (s ->> 'agreement')::boolean
          and (s ->> 'tax_form_accepted')::boolean and (s ->> 'eo_insurance_accepted')::boolean and (s ->> 'dna_approved')::boolean) then
    raise exception 'The file is not complete: %', s using errcode = '22023';
  end if;
  if (s ->> 'agreement_placeholder')::boolean and not a.house_advisor then
    raise exception 'The agreement is still the draft awaiting the attorney; only house advisors can be activated on it' using errcode = '22023';
  end if;
  update public.advisors set status = 'active', activated_at = now(), activated_by = auth.uid() where id = p_advisor;
end;
$$;
revoke all on function public.activate_advisor(uuid) from public, anon;
grant execute on function public.activate_advisor(uuid) to authenticated;
