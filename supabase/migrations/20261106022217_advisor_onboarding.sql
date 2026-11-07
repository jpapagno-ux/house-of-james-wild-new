-- Advisor Desk · Step 3 · Onboarding: the advisor's file (James, 5 Nov 2026: "an onboarding setup ...
-- the signature of an independent agreement, the layout of their compensation plan, and the ability to
-- have documents saved in their file"; "Step 3. Go ahead and proceed.").
--
-- An invited advisor, signed in with the authenticator code, completes four things; the house then
-- activates them. Until activation the desk shows them only their file.
--   1. Their details (Schedule B of the agreement). Never tax or bank numbers: those travel only on the
--      uploaded tax form and the house's secure payment setup.
--   2. Their compensation plan (Schedule A): tier and share from advisor_tier_assignments, and the
--      program fee and payment terms the house sets on the advisor. They acknowledge it; the
--      acknowledgement keeps a snapshot of what they saw.
--   3. The Independent Marketing Agreement: the current version is shown in full, they tick and type
--      their full legal name; the signature row keeps the version, a SHA-256 of the exact text, the
--      time, and that they were signed in with the code. One signature per advisor per version.
--   4. Their documents, in the private bucket "advisor-files": a tax form and errors and omissions
--      insurance are required; registrations and certificates as they apply.
-- The house reviews documents (accept or return) and activates. Activation needs every part complete
-- and a signature on a real agreement: a version marked as a placeholder (the draft awaiting the
-- attorney) can only activate the house's own advisors, for testing.

-- ===== who is asking: this person's advisor file (invited or active), only with the code
create or replace function private.my_advisor_file()
returns uuid language sql stable security definer set search_path = '' as $$
  select a.id from public.advisors a
  where a.user_id = auth.uid() and a.status in ('invited', 'active')
    and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;
revoke execute on function private.my_advisor_file() from public, anon;
grant execute on function private.my_advisor_file() to authenticated;

-- House people who manage advisors (with the code).
create or replace function private.is_advisor_keeper()
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin']);
$$;
revoke execute on function private.is_advisor_keeper() from public, anon;
grant execute on function private.is_advisor_keeper() to authenticated;

-- ===== plan terms the house sets on each advisor (Schedule A)
alter table public.advisors
  add column program_fee_minor integer check (program_fee_minor >= 0),
  add column fee_currency char(3) not null default 'USD' check (fee_currency ~ '^[A-Z]{3}$'),
  add column fee_period text not null default 'none' check (fee_period in ('none', 'month', 'year')),
  add column payment_terms text check (char_length(payment_terms) <= 600),
  add column activated_at timestamptz,
  add column activated_by uuid references auth.users (id);

-- ===== 1. details (Schedule B)
create table public.advisor_details (
  advisor_id uuid primary key references public.advisors (id) on delete cascade,
  legal_name text not null check (char_length(legal_name) between 2 and 160),
  business_name text check (char_length(business_name) <= 160),
  entity_type text check (entity_type in ('individual', 'llc', 'corporation', 'partnership', 'other')),
  mailing_address text not null check (char_length(mailing_address) between 5 and 400),
  notice_email text not null check (notice_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(notice_email) <= 254),
  mobile text check (char_length(mobile) <= 40),
  residence_state text check (char_length(residence_state) <= 80),
  residence_country char(2) not null check (residence_country ~ '^[A-Z]{2}$'),
  sot_registration text check (char_length(sot_registration) <= 160),
  memberships text check (char_length(memberships) <= 300),
  eo_insurer text check (char_length(eo_insurer) <= 160),
  eo_policy_number text check (char_length(eo_policy_number) <= 80),
  eo_expires_on date,
  years_selling smallint check (years_selling between 0 and 80),
  languages text[] not null default '{}' check (cardinality(languages) <= 20),
  specialties text check (char_length(specialties) <= 1000),
  updated_at timestamptz not null default now()
);
create trigger advisor_details_touch before update on public.advisor_details for each row execute function private.touch_updated_at();
create trigger audit_advisor_details after insert or update or delete on public.advisor_details for each row execute function private.audit_row();
alter table public.advisor_details enable row level security;
create policy advisor_details_select on public.advisor_details for select to authenticated
  using (advisor_id = private.my_advisor_file() or private.is_advisor_keeper());
create policy advisor_details_insert on public.advisor_details for insert to authenticated
  with check (advisor_id = private.my_advisor_file() or private.is_advisor_keeper());
create policy advisor_details_update on public.advisor_details for update to authenticated
  using (advisor_id = private.my_advisor_file() or private.is_advisor_keeper())
  with check (advisor_id = private.my_advisor_file() or private.is_advisor_keeper());
revoke all on public.advisor_details from anon;
grant select, insert, update on public.advisor_details to authenticated;

-- ===== 3. the agreement: versions and signatures
create table public.advisor_agreements (
  id uuid primary key default gen_random_uuid(),
  version text not null unique check (version ~ '^[A-Za-z0-9._-]{3,40}$'),
  title text not null check (char_length(title) between 3 and 160),
  body text not null check (char_length(body) between 100 and 200000),
  status text not null default 'draft' check (status in ('draft', 'current', 'retired')),
  is_placeholder boolean not null default false,
  created_at timestamptz not null default now(),
  published_at timestamptz
);
create unique index advisor_agreements_one_current on public.advisor_agreements ((status)) where status = 'current';
create trigger audit_advisor_agreements after insert or update or delete on public.advisor_agreements for each row execute function private.audit_row();
alter table public.advisor_agreements enable row level security;
create policy advisor_agreements_select on public.advisor_agreements for select to authenticated
  using ((status <> 'draft' and private.my_advisor_file() is not null) or private.is_advisor_keeper());
revoke all on public.advisor_agreements from anon;
revoke insert, update, delete on public.advisor_agreements from authenticated;
grant select on public.advisor_agreements to authenticated;

create table public.advisor_signatures (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  agreement_id uuid not null references public.advisor_agreements (id),
  version text not null,
  typed_name text not null check (char_length(typed_name) between 2 and 160),
  body_sha256 text not null check (body_sha256 ~ '^[0-9a-f]{64}$'),
  signed_by uuid not null references auth.users (id),
  signed_at timestamptz not null default now(),
  aal text not null,
  user_agent text check (char_length(user_agent) <= 400),
  unique (advisor_id, agreement_id)
);
create trigger audit_advisor_signatures after insert or update or delete on public.advisor_signatures for each row execute function private.audit_row();
alter table public.advisor_signatures enable row level security;
create policy advisor_signatures_select on public.advisor_signatures for select to authenticated
  using (advisor_id = private.my_advisor_file() or private.is_advisor_keeper());
revoke all on public.advisor_signatures from anon;
revoke insert, update, delete on public.advisor_signatures from authenticated;
grant select on public.advisor_signatures to authenticated;

-- Sign the current agreement. Only the advisor, with the code, after their details are on file; the
-- typed name must match the legal name on file (case and spacing aside).
create or replace function public.sign_advisor_agreement(p_agreement uuid, p_typed_name text, p_user_agent text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare me uuid := private.my_advisor_file(); ag record; legal text; sid uuid;
begin
  if me is null then raise exception 'Sign in with your authenticator code to sign' using errcode = '42501'; end if;
  select * into ag from public.advisor_agreements where id = p_agreement;
  if ag is null or ag.status <> 'current' then raise exception 'That is not the current agreement' using errcode = '22023'; end if;
  select legal_name into legal from public.advisor_details where advisor_id = me;
  if legal is null then raise exception 'Complete your details before signing' using errcode = '22023'; end if;
  if lower(regexp_replace(btrim(coalesce(p_typed_name, '')), '\s+', ' ', 'g')) <> lower(regexp_replace(btrim(legal), '\s+', ' ', 'g')) then
    raise exception 'Type your full legal name exactly as it appears in your details' using errcode = '22023';
  end if;
  insert into public.advisor_signatures (advisor_id, agreement_id, version, typed_name, body_sha256, signed_by, aal, user_agent)
  values (me, ag.id, ag.version, btrim(p_typed_name), encode(extensions.digest(ag.body, 'sha256'), 'hex'), auth.uid(),
          coalesce(auth.jwt() ->> 'aal', ''), left(p_user_agent, 400))
  on conflict (advisor_id, agreement_id) do nothing
  returning id into sid;
  if sid is null then raise exception 'You have already signed this version' using errcode = '23505'; end if;
  return sid;
end;
$$;
revoke all on function public.sign_advisor_agreement(uuid, text, text) from public, anon;
grant execute on function public.sign_advisor_agreement(uuid, text, text) to authenticated;

-- ===== 2. compensation plan acknowledgements (a snapshot of what the advisor saw)
create table public.advisor_plan_acks (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  tier text not null references public.advisor_tiers (key),
  share_bp integer not null check (share_bp between 0 and 10000),
  tier_assigned boolean not null,
  program_fee_minor integer,
  fee_currency char(3) not null,
  fee_period text not null,
  payment_terms text,
  acknowledged_by uuid not null references auth.users (id),
  acknowledged_at timestamptz not null default now()
);
create trigger audit_advisor_plan_acks after insert or update or delete on public.advisor_plan_acks for each row execute function private.audit_row();
alter table public.advisor_plan_acks enable row level security;
create policy advisor_plan_acks_select on public.advisor_plan_acks for select to authenticated
  using (advisor_id = private.my_advisor_file() or private.is_advisor_keeper());
revoke all on public.advisor_plan_acks from anon;
revoke insert, update, delete on public.advisor_plan_acks from authenticated;
grant select on public.advisor_plan_acks to authenticated;

-- The plan as it stands for an advisor today: their dated tier (Tier 2 when none is set) and the fee
-- and terms on their record.
create or replace function private.advisor_plan(p_advisor uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  with a as (select * from public.advisors where id = p_advisor),
  t as (
    select ta.tier from public.advisor_tier_assignments ta, a
    where ta.user_id = a.user_id and ta.effective_from <= current_date and (ta.effective_to is null or ta.effective_to >= current_date)
    order by ta.effective_from desc limit 1
  )
  select jsonb_build_object(
    'tier', coalesce((select tier from t), 'tier_2'),
    'tier_assigned', exists (select 1 from t),
    'share_bp', (select share_bp from public.advisor_tiers where key = coalesce((select tier from t), 'tier_2')),
    'program_fee_minor', a.program_fee_minor, 'fee_currency', a.fee_currency, 'fee_period', a.fee_period,
    'payment_terms', a.payment_terms)
  from a;
$$;
revoke execute on function private.advisor_plan(uuid) from public, anon, authenticated;

-- An advisor's plan, for the house's people who manage advisors.
create or replace function public.advisor_plan_for(p_advisor uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  return private.advisor_plan(p_advisor);
end;
$$;
revoke all on function public.advisor_plan_for(uuid) from public, anon;
grant execute on function public.advisor_plan_for(uuid) to authenticated;

-- The advisor's own plan, for the desk (the tier table itself stays house-only).
create or replace function public.my_advisor_plan()
returns jsonb language sql stable security definer set search_path = '' as $$
  select private.advisor_plan(private.my_advisor_file()) where private.my_advisor_file() is not null;
$$;
revoke all on function public.my_advisor_plan() from public, anon;
grant execute on function public.my_advisor_plan() to authenticated;

create or replace function public.acknowledge_advisor_plan()
returns uuid language plpgsql security definer set search_path = '' as $$
declare me uuid := private.my_advisor_file(); p jsonb; id uuid;
begin
  if me is null then raise exception 'Sign in with your authenticator code' using errcode = '42501'; end if;
  p := private.advisor_plan(me);
  insert into public.advisor_plan_acks (advisor_id, tier, share_bp, tier_assigned, program_fee_minor, fee_currency, fee_period, payment_terms, acknowledged_by)
  values (me, p ->> 'tier', (p ->> 'share_bp')::int, (p ->> 'tier_assigned')::boolean, (p ->> 'program_fee_minor')::int,
          p ->> 'fee_currency', p ->> 'fee_period', p ->> 'payment_terms', auth.uid())
  returning advisor_plan_acks.id into id;
  return id;
end;
$$;
revoke all on function public.acknowledge_advisor_plan() from public, anon;
grant execute on function public.acknowledge_advisor_plan() to authenticated;

-- ===== 4. documents
create table public.advisor_documents (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  kind text not null check (kind in ('tax_form', 'seller_of_travel', 'eo_insurance', 'business_registration', 'certificate', 'other')),
  title text not null check (char_length(title) between 1 and 160),
  storage_path text not null unique check (storage_path ~ ('^' || advisor_id::text || '/[a-z_]+/[0-9a-f]{8}-[A-Za-z0-9._-]+$')),
  mime_type text not null,
  size_bytes integer not null check (size_bytes between 1 and 20971520),
  expires_on date,
  status text not null default 'submitted' check (status in ('submitted', 'accepted', 'returned', 'archived')),
  note text check (char_length(note) <= 1000),
  house_note text check (char_length(house_note) <= 1000),
  uploaded_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users (id)
);
create index advisor_documents_advisor_idx on public.advisor_documents (advisor_id, kind);
create trigger audit_advisor_documents after insert or update or delete on public.advisor_documents for each row execute function private.audit_row();
alter table public.advisor_documents enable row level security;
create policy advisor_documents_select on public.advisor_documents for select to authenticated
  using (advisor_id = private.my_advisor_file() or private.is_advisor_keeper());
create policy advisor_documents_insert on public.advisor_documents for insert to authenticated
  with check ((advisor_id = private.my_advisor_file() and status = 'submitted' and uploaded_by = auth.uid())
              or private.is_advisor_keeper());
create policy advisor_documents_update on public.advisor_documents for update to authenticated
  using (private.is_advisor_keeper() or (advisor_id = private.my_advisor_file() and status = 'submitted'))
  with check (private.is_advisor_keeper() or (advisor_id = private.my_advisor_file() and status in ('submitted', 'archived')));
revoke all on public.advisor_documents from anon;
revoke insert, update, delete on public.advisor_documents from authenticated;
grant select on public.advisor_documents to authenticated;
grant insert (advisor_id, kind, title, storage_path, mime_type, size_bytes, expires_on, note, uploaded_by) on public.advisor_documents to authenticated;
-- An advisor can only withdraw (archive) a document still waiting; the house decides the rest.
grant update (status, house_note, decided_at, decided_by) on public.advisor_documents to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('advisor-files', 'advisor-files', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy advisor_files_select on storage.objects for select to authenticated
  using (bucket_id = 'advisor-files' and exists (
    select 1 from public.advisor_documents d where d.storage_path = storage.objects.name
      and (d.advisor_id = private.my_advisor_file() or private.is_advisor_keeper())));
create policy advisor_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'advisor-files'
    and ((storage.foldername(name))[1] = private.my_advisor_file()::text or private.is_advisor_keeper())
    and (storage.foldername(name))[2] in ('tax_form', 'seller_of_travel', 'eo_insurance', 'business_registration', 'certificate', 'other'));
create policy advisor_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'advisor-files' and private.is_jw(array['jw_admin', 'admin']));

-- ===== the file's state, and activation
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
    'eo_insurance_accepted', exists (select 1 from ok_docs where kind = 'eo_insurance'));
$$;
revoke execute on function private.advisor_file_state(uuid) from public, anon, authenticated;

create or replace function public.my_advisor_file_state()
returns jsonb language sql stable security definer set search_path = '' as $$
  select private.advisor_file_state(private.my_advisor_file()) where private.my_advisor_file() is not null;
$$;
revoke all on function public.my_advisor_file_state() from public, anon;
grant execute on function public.my_advisor_file_state() to authenticated;

create or replace function public.advisor_file_state(p_advisor uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  return private.advisor_file_state(p_advisor);
end;
$$;
revoke all on function public.advisor_file_state(uuid) from public, anon;
grant execute on function public.advisor_file_state(uuid) to authenticated;

-- Activate: every part on file, both required documents accepted, the agreement signed; a placeholder
-- agreement only for the house's own advisors.
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
          and (s ->> 'tax_form_accepted')::boolean and (s ->> 'eo_insurance_accepted')::boolean) then
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

-- The house decides a document: accept or return it with a note.
create or replace function public.decide_advisor_document(p_document uuid, p_status text, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  if p_status not in ('accepted', 'returned') then raise exception 'Accept or return' using errcode = '22023'; end if;
  if p_status = 'returned' and coalesce(btrim(p_note), '') = '' then raise exception 'Say why it is returned' using errcode = '22023'; end if;
  update public.advisor_documents set status = p_status, house_note = nullif(btrim(p_note), ''), decided_at = now(), decided_by = auth.uid()
  where id = p_document and status in ('submitted', 'accepted', 'returned');
  if not found then raise exception 'Not found' using errcode = 'P0002'; end if;
end;
$$;
revoke all on function public.decide_advisor_document(uuid, text, text) from public, anon;
grant execute on function public.decide_advisor_document(uuid, text, text) to authenticated;

-- The house sets an advisor's plan terms and, if given, a new dated tier (applies from that date on).
create or replace function public.set_advisor_plan(p_advisor uuid, p_tier text, p_from date, p_fee_minor integer, p_fee_period text, p_terms text)
returns void language plpgsql security definer set search_path = '' as $$
declare a record;
begin
  if not private.is_jw(array['jw_admin', 'admin']) then raise exception 'Only a house admin sets the plan' using errcode = '42501'; end if;
  select * into a from public.advisors where id = p_advisor;
  if a is null then raise exception 'No such advisor' using errcode = 'P0002'; end if;
  update public.advisors set program_fee_minor = p_fee_minor, fee_period = coalesce(p_fee_period, 'none'), payment_terms = nullif(btrim(p_terms), '')
  where id = p_advisor;
  if p_tier is not null then
    if a.user_id is null then raise exception 'Set the tier once the advisor has signed in' using errcode = '22023'; end if;
    update public.advisor_tier_assignments set effective_to = coalesce(p_from, current_date) - 1
      where user_id = a.user_id and effective_to is null and effective_from < coalesce(p_from, current_date);
    insert into public.advisor_tier_assignments (user_id, tier, effective_from, note, set_by)
    values (a.user_id, p_tier, coalesce(p_from, current_date), 'Set on the house desk', auth.uid());
  end if;
end;
$$;
revoke all on function public.set_advisor_plan(uuid, text, date, integer, text, text) from public, anon;
grant execute on function public.set_advisor_plan(uuid, text, date, integer, text, text) to authenticated;

-- An advisor may only withdraw (archive) their own waiting document; the house's fields are the house's.
create or replace function private.advisor_documents_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.is_advisor_keeper() or auth.uid() is null then return new; end if;
  if new.status <> 'archived' or old.status <> 'submitted'
     or new.house_note is distinct from old.house_note or new.decided_at is distinct from old.decided_at
     or new.decided_by is distinct from old.decided_by then
    raise exception 'You can withdraw a document while it waits; the house decides the rest' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger advisor_documents_guard before update on public.advisor_documents for each row execute function private.advisor_documents_guard();
