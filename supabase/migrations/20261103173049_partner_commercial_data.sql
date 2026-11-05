-- Partner Desk · Stage 2 · Commercial data (D-26, James, 3 Nov 2026)
--
-- "We will have different tiers for advisors: Tier 1 75%, Tier 2 70%, Tier 3 55%." "Give partners
-- optional currencies with a dropdown, and add banking details and cancellation and refund policies
-- to the partner data for them to add or upload." "A reminder once expired goes to the email contact
-- on file, automatically."
--
--   1. advisor tiers           reference shares (house-set) and each advisor's tier, by date
--   2. partner currencies      a primary currency and optional others, chosen by the partner
--   3. banking details         partner admins submit; the house verifies before anything is paid;
--                              a change is a new submission, never an edit; audit masks numbers
--   4. cancellation / refund   partners submit (text or a document); house editors approve
--   5. contract on a term      a commission term may cite the signed contract it comes from
--   6. expiry reminders        a log so each reminder (60, 30 days, on expiry) is sent once
-- Nothing is dropped; this only adds.

-- ===== 1. advisor tiers
create table public.advisor_tiers (
  key text primary key check (key ~ '^tier_[0-9]$'),
  label text not null,
  share_bp integer not null check (share_bp between 0 and 10000),   -- share of the commission
  sort smallint not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.advisor_tiers (key, label, share_bp, sort) values
  ('tier_1', 'Tier 1', 7500, 1), ('tier_2', 'Tier 2', 7000, 2), ('tier_3', 'Tier 3', 5500, 3);
create trigger advisor_tiers_touch before update on public.advisor_tiers for each row execute function private.touch_updated_at();
create trigger audit_advisor_tiers after insert or update or delete on public.advisor_tiers for each row execute function private.audit_row();

create table public.advisor_tier_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tier text not null references public.advisor_tiers (key),
  effective_from date not null,
  effective_to date,
  note text check (char_length(note) <= 500),
  set_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from)
);
create index advisor_tier_assignments_user_idx on public.advisor_tier_assignments (user_id, effective_from desc);
create trigger advisor_tier_assignments_touch before update on public.advisor_tier_assignments for each row execute function private.touch_updated_at();
create trigger audit_advisor_tier_assignments after insert or update or delete on public.advisor_tier_assignments for each row execute function private.audit_row();

alter table public.advisor_tiers enable row level security;
alter table public.advisor_tier_assignments enable row level security;
-- The tier table is a price list for the house and its advisors; never public, never partners.
create policy advisor_tiers_select on public.advisor_tiers for select to authenticated
  using (private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin', 'finance', 'advisor']));
create policy advisor_tiers_write on public.advisor_tiers for update to authenticated
  using (private.is_jw(array['jw_admin', 'admin', 'finance'])) with check (private.is_jw(array['jw_admin', 'admin', 'finance']));
create policy advisor_tier_assignments_select on public.advisor_tier_assignments for select to authenticated
  using (private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin', 'finance']) or user_id = (select auth.uid()));
create policy advisor_tier_assignments_insert on public.advisor_tier_assignments for insert to authenticated
  with check (private.is_jw(array['jw_admin', 'admin', 'finance']));
create policy advisor_tier_assignments_update on public.advisor_tier_assignments for update to authenticated
  using (private.is_jw(array['jw_admin', 'admin', 'finance'])) with check (private.is_jw(array['jw_admin', 'admin', 'finance']));
revoke all on public.advisor_tiers, public.advisor_tier_assignments from anon;
revoke insert, delete on public.advisor_tiers from authenticated;
grant select, update (label, share_bp) on public.advisor_tiers to authenticated;
grant select, insert, update on public.advisor_tier_assignments to authenticated;

-- An advisor's share on a date: their tier, else Tier 2 (70%), the house default.
create or replace function private.advisor_share_for(p_user uuid, p_on date default current_date)
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select t.share_bp from public.advisor_tier_assignments a join public.advisor_tiers t on t.key = a.tier
     where a.user_id = p_user and a.effective_from <= p_on and (a.effective_to is null or a.effective_to >= p_on)
     order by a.effective_from desc limit 1),
    (select share_bp from public.advisor_tiers where key = 'tier_2'), 7000)
  where private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin', 'finance']) or p_user = (select auth.uid());
$$;
revoke execute on function private.advisor_share_for(uuid, date) from public, anon;
grant execute on function private.advisor_share_for(uuid, date) to authenticated;

-- ===== 2. partner currencies (ISO 4217; the desk offers a fixed list)
alter table public.organizations
  add column primary_currency text not null default 'USD' check (primary_currency ~ '^[A-Z]{3}$'),
  add column other_currencies text[] not null default '{}'
    check (cardinality(other_currencies) <= 6 and array_to_string(other_currencies, ',') ~ '^([A-Z]{3}(,[A-Z]{3})*)?$');
grant update (primary_currency, other_currencies) on public.organizations to authenticated;

-- ===== 3. banking details
create table public.partner_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  account_holder text not null check (char_length(account_holder) between 2 and 160),
  bank_name text not null check (char_length(bank_name) between 2 and 160),
  bank_country text not null check (bank_country ~ '^[A-Z]{2}$'),
  bank_address text check (char_length(bank_address) <= 400),
  account_number text check (account_number ~ '^[A-Za-z0-9 -]{4,40}$'),
  iban text check (iban ~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$'),
  swift_bic text check (swift_bic ~ '^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$'),
  routing_code text check (routing_code ~ '^[A-Za-z0-9 -]{3,20}$'),   -- ABA, sort code, branch code
  intermediary_bank text check (char_length(intermediary_bank) <= 400),
  note text check (char_length(note) <= 500),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'superseded')),
  submitted_by uuid default auth.uid() references auth.users (id) on delete set null,
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  review_note text check (char_length(review_note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (account_number is not null or iban is not null)
);
create index partner_bank_accounts_org_idx on public.partner_bank_accounts (organization_id, status);
create trigger partner_bank_accounts_touch before update on public.partner_bank_accounts for each row execute function private.touch_updated_at();

-- The audit trail records who changed what, but never a full account number or IBAN.
create or replace function private.audit_bank_row() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  o jsonb; n jsonb;
begin
  o := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  n := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  if o is not null then o := o || jsonb_build_object('account_number', '…' || right(coalesce(o ->> 'account_number', ''), 4), 'iban', '…' || right(coalesce(o ->> 'iban', ''), 4)); end if;
  if n is not null then n := n || jsonb_build_object('account_number', '…' || right(coalesce(n ->> 'account_number', ''), 4), 'iban', '…' || right(coalesce(n ->> 'iban', ''), 4)); end if;
  insert into private.audit_logs (actor_id, action, entity_type, entity_id, before_snapshot, after_snapshot)
  values (auth.uid(), lower(tg_op), tg_table_name, coalesce(new.id, old.id)::text, o, n);
  return coalesce(new, old);
end $$;
revoke execute on function private.audit_bank_row() from public, anon, authenticated;
create trigger audit_partner_bank_accounts after insert or update or delete on public.partner_bank_accounts for each row execute function private.audit_bank_row();

-- Verifying an account retires the previously verified account in the same currency.
create or replace function private.bank_account_verified() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'verified' and old.status is distinct from 'verified' then
    new.verified_by := auth.uid(); new.verified_at := now();
    update public.partner_bank_accounts set status = 'superseded'
    where organization_id = new.organization_id and currency = new.currency and status = 'verified' and id <> new.id;
  end if;
  return new;
end $$;
revoke execute on function private.bank_account_verified() from public, anon, authenticated;
create trigger partner_bank_accounts_verify before update on public.partner_bank_accounts for each row execute function private.bank_account_verified();

alter table public.partner_bank_accounts enable row level security;
-- Seen by the house's admins and finance and by the partner's own admins. Never portfolio managers,
-- editors, property managers, contributors, advisors or the public.
create policy partner_bank_accounts_select on public.partner_bank_accounts for select to authenticated
  using (private.is_jw(array['jw_admin', 'admin', 'finance'])
         or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));
create policy partner_bank_accounts_insert on public.partner_bank_accounts for insert to authenticated
  with check (status = 'pending' and submitted_by = (select auth.uid())
              and (private.is_jw(array['jw_admin', 'admin', 'finance'])
                   or private.is_org_member(organization_id, array['partner_admin', 'partner_manager'])));
create policy partner_bank_accounts_update on public.partner_bank_accounts for update to authenticated
  using (private.is_jw(array['jw_admin', 'admin', 'finance'])) with check (private.is_jw(array['jw_admin', 'admin', 'finance']));
revoke all on public.partner_bank_accounts from anon, authenticated;
grant select on public.partner_bank_accounts to authenticated;
grant insert (organization_id, currency, account_holder, bank_name, bank_country, bank_address, account_number, iban, swift_bic,
  routing_code, intermediary_bank, note, submitted_by) on public.partner_bank_accounts to authenticated;
grant update (status, review_note) on public.partner_bank_accounts to authenticated;

-- ===== 4. cancellation and refund policies
create table public.partner_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  property_id uuid references public.properties (id) on delete cascade,
  kind text not null check (kind in ('cancellation', 'refund')),
  body text check (char_length(body) <= 8000),
  document_id uuid references public.partner_documents (id) on delete set null,
  effective_from date,
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'rejected', 'superseded')),
  submitted_by uuid default auth.uid() references auth.users (id) on delete set null,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  review_note text check (char_length(review_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (body is not null or document_id is not null)
);
create index partner_policies_org_idx on public.partner_policies (organization_id, kind, status);
create trigger partner_policies_touch before update on public.partner_policies for each row execute function private.touch_updated_at();
create trigger audit_partner_policies after insert or update or delete on public.partner_policies for each row execute function private.audit_row();

create or replace function private.partner_policy_rules() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.property_id is not null and not exists (select 1 from public.entity_partners ep where ep.property_id = new.property_id and ep.organization_id = new.organization_id) then
    raise exception 'That property belongs to another partner' using errcode = '23514';
  end if;
  if new.document_id is not null and not exists (select 1 from public.partner_documents d where d.id = new.document_id and d.organization_id = new.organization_id and d.kind <> 'contract') then
    raise exception 'Attach one of this partner''s rate or supporting documents' using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' and new.status in ('approved', 'rejected') and old.status is distinct from new.status then
    new.reviewed_by := auth.uid(); new.reviewed_at := now();
    if new.status = 'approved' then
      update public.partner_policies set status = 'superseded'
      where organization_id = new.organization_id and kind = new.kind and property_id is not distinct from new.property_id
        and status = 'approved' and id <> new.id;
    end if;
  end if;
  return new;
end $$;
revoke execute on function private.partner_policy_rules() from public, anon, authenticated;
create trigger partner_policies_rules before insert or update on public.partner_policies for each row execute function private.partner_policy_rules();

alter table public.partner_policies enable row level security;
create policy partner_policies_select on public.partner_policies for select to authenticated
  using (private.is_jw()
         or private.is_org_member(organization_id, array['partner_admin', 'partner_manager'])
         or (private.is_org_member(organization_id) and (property_id is null or private.partner_can(property_id, array['partner_contributor', 'partner_editor']))));
create policy partner_policies_insert on public.partner_policies for insert to authenticated
  with check (status = 'submitted' and submitted_by = (select auth.uid())
              and (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin'])
                   or private.is_org_member(organization_id, array['partner_admin', 'partner_manager'])
                   or (property_id is not null and private.is_org_member(organization_id, array['partner_contributor', 'partner_editor'])
                       and private.partner_can(property_id, array['partner_contributor', 'partner_editor']))));
-- Only house editors review (approve, reject); partners submit a new version instead of editing.
create policy partner_policies_update on public.partner_policies for update to authenticated
  using (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin']))
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin']));
revoke all on public.partner_policies from anon, authenticated;
grant select on public.partner_policies to authenticated;
grant insert (organization_id, property_id, kind, body, document_id, effective_from, submitted_by) on public.partner_policies to authenticated;
grant update (status, review_note) on public.partner_policies to authenticated;

-- ===== 5. a commission term may cite its signed contract
create or replace function private.commission_terms_scope() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.brand_id is not null and not exists (select 1 from public.brands b where b.id = new.brand_id and b.organization_id = new.organization_id) then
    raise exception 'That brand belongs to another partner' using errcode = '23514';
  end if;
  if new.property_id is not null and not exists (select 1 from public.entity_partners ep where ep.property_id = new.property_id and ep.organization_id = new.organization_id) then
    raise exception 'That property belongs to another partner' using errcode = '23514';
  end if;
  if new.contract_document_id is not null and not exists (select 1 from public.partner_documents d where d.id = new.contract_document_id and d.organization_id = new.organization_id and d.kind = 'contract') then
    raise exception 'Link one of this partner''s contracts' using errcode = '23514';
  end if;
  return new;
end $$;

-- ===== 6. expiry reminders: sent at 60 and 30 days before, and on the day a document expires
create table private.document_reminders (
  document_id uuid not null references public.partner_documents (id) on delete cascade,
  stage text not null check (stage in ('60_days', '30_days', 'expired')),
  sent_to text[] not null,
  sent_at timestamptz not null default now(),
  primary key (document_id, stage)
);

-- What is due today, with whom to tell: the partner's general email and its admins. Contracts and
-- commercial documents also go to the house (the caller adds the house address). Service role only.
create or replace function private.document_reminders_due(p_on date default current_date)
returns table (document_id uuid, organization_id uuid, organization text, kind text, title text, expires_on date, stage text, recipients text[])
language sql stable security definer set search_path = '' as $$
  with due as (
    select d.*, case when d.expires_on <= p_on then 'expired'
                     when d.expires_on <= p_on + 30 then '30_days'
                     else '60_days' end as stage
    from public.partner_documents d
    where d.status = 'active' and d.expires_on is not null and d.expires_on <= p_on + 60
      and d.expires_on >= p_on - 14   -- never chase documents that expired long before reminders began
  )
  select d.id, d.organization_id, o.name, d.kind, d.title, d.expires_on, d.stage,
    array(select distinct e from unnest(array_append(
      array(select u.email::text from public.organization_memberships m join auth.users u on u.id = m.user_id
            where m.organization_id = d.organization_id and m.status = 'active' and m.role in ('partner_admin', 'partner_manager') and u.email is not null),
      o.general_email)) e where e is not null and e <> '')
  from due d join public.organizations o on o.id = d.organization_id
  where not exists (select 1 from private.document_reminders r where r.document_id = d.id and r.stage = d.stage);
$$;
revoke execute on function private.document_reminders_due(date) from public, anon, authenticated;
grant execute on function private.document_reminders_due(date) to service_role;
grant select, insert on private.document_reminders to service_role;

-- A thin public door for the server's reminder job (service role key only).
create or replace function public.document_reminders_due(p_on date default current_date)
returns table (document_id uuid, organization_id uuid, organization text, kind text, title text, expires_on date, stage text, recipients text[])
language sql stable security definer set search_path = '' as $$ select * from private.document_reminders_due(p_on) $$;
create or replace function public.document_reminder_sent(p_document uuid, p_stage text, p_to text[])
returns void language sql security definer set search_path = '' as $$
  insert into private.document_reminders (document_id, stage, sent_to) values (p_document, p_stage, p_to) on conflict do nothing;
$$;
revoke execute on function public.document_reminders_due(date), public.document_reminder_sent(uuid, text, text[]) from public, anon, authenticated;
grant execute on function public.document_reminders_due(date), public.document_reminder_sent(uuid, text, text[]) to service_role;
