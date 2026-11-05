-- Partner Desk · Stage 2 · Rates & offers (plan §3.3, step 5; D-08)
--
-- Partners send rates three ways: a rate sheet (a commercial document, already in Documents),
-- seasonal rates typed into a grid, or an offer. Nothing here prices the website: the house loads
-- each proposal into the Airtable rates base, approves the card there, and the certified sync brings
-- it to the site (D-08). The desk never writes rate_card_versions, seasonal_rate_rules or promotions.
--
--   who sees        the partner team for their properties; the whole house
--   who sends      partner admins and managers; property managers for their own properties
--   who decides    house editors, portfolio managers and finance: "loaded" (with the Airtable card)
--                  or "returned" with a note
-- Only adds a table.

create table public.rate_proposals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  kind text not null check (kind in ('rate_sheet', 'seasonal', 'offer')),
  document_id uuid references public.partner_documents (id) on delete set null,
  currency text check (currency ~ '^[A-Z]{3}$'),
  valid_from date,
  valid_to date,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 32768),
  note text check (char_length(note) <= 2000),
  status text not null default 'submitted' check (status in ('submitted', 'loaded', 'returned', 'withdrawn')),
  airtable_card text check (char_length(airtable_card) <= 120),   -- e.g. "2027-V1", set when loaded
  review_note text check (char_length(review_note) <= 1000),
  submitted_by uuid default auth.uid() references auth.users (id) on delete set null,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_to is null or valid_from is null or valid_to >= valid_from),
  check (kind <> 'rate_sheet' or document_id is not null),
  check (kind = 'rate_sheet' or payload <> '{}'::jsonb)
);
create index rate_proposals_org_idx on public.rate_proposals (organization_id, status);
create index rate_proposals_property_idx on public.rate_proposals (property_id, created_at desc);
create trigger rate_proposals_touch before update on public.rate_proposals for each row execute function private.touch_updated_at();
create trigger audit_rate_proposals after insert or update or delete on public.rate_proposals for each row execute function private.audit_row();

create or replace function private.rate_proposal_rules() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.entity_partners ep where ep.property_id = new.property_id and ep.organization_id = new.organization_id) then
    raise exception 'That property belongs to another partner' using errcode = '23514';
  end if;
  if new.document_id is not null and not exists (select 1 from public.partner_documents d where d.id = new.document_id and d.organization_id = new.organization_id and d.kind = 'commercial') then
    raise exception 'Attach one of this partner''s rate documents' using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' and new.status in ('loaded', 'returned') and old.status is distinct from new.status then
    new.reviewed_by := auth.uid(); new.reviewed_at := now();
  end if;
  return new;
end $$;
revoke execute on function private.rate_proposal_rules() from public, anon, authenticated;
create trigger rate_proposals_rules before insert or update on public.rate_proposals for each row execute function private.rate_proposal_rules();

alter table public.rate_proposals enable row level security;
create policy rate_proposals_select on public.rate_proposals for select to authenticated
  using (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin', 'finance'])
         or private.is_org_member(organization_id, array['partner_admin', 'partner_manager'])
         or (private.is_org_member(organization_id) and private.partner_can(property_id, array['partner_contributor', 'partner_editor'])));
create policy rate_proposals_insert on public.rate_proposals for insert to authenticated
  with check (status = 'submitted' and submitted_by = (select auth.uid())
              and (private.is_org_member(organization_id, array['partner_admin', 'partner_manager'])
                   or (private.is_org_member(organization_id, array['partner_contributor', 'partner_editor'])
                       and private.partner_can(property_id, array['partner_contributor', 'partner_editor']))));
-- The house decides; a partner may only withdraw their own proposal while it is still open.
create policy rate_proposals_update on public.rate_proposals for update to authenticated
  using (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin', 'finance'])
         or (submitted_by = (select auth.uid()) and status = 'submitted'))
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin', 'finance'])
              or (submitted_by = (select auth.uid()) and status = 'withdrawn'));
revoke all on public.rate_proposals from anon, authenticated;
grant select on public.rate_proposals to authenticated;
grant insert (organization_id, property_id, kind, document_id, currency, valid_from, valid_to, payload, note, submitted_by) on public.rate_proposals to authenticated;
grant update (status, airtable_card, review_note) on public.rate_proposals to authenticated;
