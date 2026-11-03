-- Commercial · Commission terms by partner, brand and property (D-25, James, 3 Nov 2026)
--
-- "We need to add a commission structure by brand: MORE Collection is 20%, Kayumanis I think 17%
-- (to check), so we can calculate commissions for the advisors and gross commissions for us, set
-- this up in the portal as earnings and commissions, and cross-tie with advisors' earnings for an
-- internal accounting system."
--
-- This is the register of WHAT EACH PARTNER PAYS THE HOUSE. The commission ledger (per booking:
-- commissionable base, rate, gross commission, advisor 70% / house 30%, and its accounting status)
-- comes with bookings (Booking Live Phase 3, docs/booking-live/COMMERCIAL-RULES.md) and reads the
-- rate from here through private.commission_rate_for().
--
-- Resolution, most specific first, on a stay date:
--   1. the rate card's own Contract Terms (private.contract_terms, synced from Airtable) when set;
--      the ledger checks these first, since it knows the card the booking was priced from
--   2. a property term (one lodge or villa differs)
--   3. a brand term (Lion Sands, Kayumanis)
--   4. the partner organization's term (MORE Family Collection)
-- Among terms of the same level, the latest effective_from on or before the date wins.
--
-- Who sees it: house admins, portfolio managers and finance (all of it); a partner's admins see
-- their own organization's terms read-only (it is their contract). Never contributors, property
-- managers, advisors, travelers or the public. Only house admins, portfolio managers and finance
-- write it; every change is audited.

create table public.commission_terms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  brand_id uuid references public.brands (id) on delete cascade,
  property_id uuid references public.properties (id) on delete cascade,
  basis text not null default 'commission' check (basis in ('commission', 'net')),
  rate_bp integer check (rate_bp between 0 and 10000),          -- basis points: 2000 = 20.00%
  effective_from date not null,
  effective_to date,
  status text not null default 'to_confirm' check (status in ('to_confirm', 'confirmed', 'retired')),
  contract_document_id uuid references public.partner_documents (id) on delete set null,
  note text check (char_length(note) <= 1000),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (basis = 'net' or rate_bp is not null),
  check (brand_id is null or property_id is null),
  check (effective_to is null or effective_to >= effective_from)
);
create index commission_terms_org_idx on public.commission_terms (organization_id, effective_from desc);
create index commission_terms_brand_idx on public.commission_terms (brand_id) where brand_id is not null;
create index commission_terms_property_idx on public.commission_terms (property_id) where property_id is not null;
create trigger commission_terms_touch before update on public.commission_terms for each row execute function private.touch_updated_at();
create trigger audit_commission_terms after insert or update or delete on public.commission_terms for each row execute function private.audit_row();

-- A brand or property term must belong to the same partner organization.
create or replace function private.commission_terms_scope() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.brand_id is not null and not exists (select 1 from public.brands b where b.id = new.brand_id and b.organization_id = new.organization_id) then
    raise exception 'That brand belongs to another partner' using errcode = '23514';
  end if;
  if new.property_id is not null and not exists (select 1 from public.entity_partners ep where ep.property_id = new.property_id and ep.organization_id = new.organization_id) then
    raise exception 'That property belongs to another partner' using errcode = '23514';
  end if;
  return new;
end $$;
revoke execute on function private.commission_terms_scope() from public, anon, authenticated;
create trigger commission_terms_scope before insert or update on public.commission_terms for each row execute function private.commission_terms_scope();

alter table public.commission_terms enable row level security;
create policy commission_terms_select on public.commission_terms for select to authenticated
  using (private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin', 'finance'])
         or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));
create policy commission_terms_insert on public.commission_terms for insert to authenticated
  with check (private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin', 'finance']));
create policy commission_terms_update on public.commission_terms for update to authenticated
  using (private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin', 'finance']))
  with check (private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin', 'finance']));
create policy commission_terms_delete on public.commission_terms for delete to authenticated
  using (private.is_jw(array['jw_admin', 'admin']));
revoke all on public.commission_terms from anon;
grant select, insert, update, delete on public.commission_terms to authenticated;

-- The rate for a property on a date. Server-side only (the commission ledger and the house desk);
-- callers without house finance access get nothing.
create or replace function private.commission_rate_for(p_property uuid, p_on date default current_date)
returns table (rate_bp integer, basis text, status text, source text, term_id uuid)
language sql stable security definer set search_path = '' as $$
  with prop as (
    select p.id, p.brand_id, ep.organization_id
    from public.properties p
    left join public.entity_partners ep on ep.property_id = p.id and ep.is_primary
    where p.id = p_property
  ), candidates as (
    select t.rate_bp, t.basis, t.status, t.id, t.effective_from,
      case when t.property_id is not null then 'property' when t.brand_id is not null then 'brand' else 'partner' end as source,
      case when t.property_id is not null then 1 when t.brand_id is not null then 2 else 3 end as rank
    from public.commission_terms t, prop
    where t.status <> 'retired'
      and t.effective_from <= p_on and (t.effective_to is null or t.effective_to >= p_on)
      and t.organization_id = prop.organization_id
      and (t.property_id = prop.id
           or (t.property_id is null and t.brand_id = prop.brand_id)
           or (t.property_id is null and t.brand_id is null))
  )
  select c.rate_bp, c.basis, c.status, c.source, c.id from candidates c
  where private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin', 'finance'])
  order by c.rank, c.effective_from desc limit 1;
$$;
revoke execute on function private.commission_rate_for(uuid, date) from public, anon;
grant execute on function private.commission_rate_for(uuid, date) to authenticated;
