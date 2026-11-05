-- Commercial · Commission comes from Airtable Partner Brands (D-31, James, 3 Nov 2026)
--
-- "I recommend Airtable stays the place your team enters commission (next to the contract terms),
-- with the desk reading a synced copy" ... "yes correct".
--
-- One place to type a commission: the Partner Brands table in the Airtable rates base. Each brand
-- row names its desk partner by Partner Code (PAR-000002); the rates sync hands every row to
-- public.sync_commission_terms(), which keeps a partner-level commission term per row:
--   * first sight: adopts the partner's open desk term (the seeded one) or creates one
--   * same rate: updates the status (Confirmed -> confirmed, anything else -> to_confirm) and note
--   * new rate: closes the old term yesterday (kept for bookings already made) and opens a new one
--     from today, so a booking always resolves to the rate that was in force on its stay date
-- Rows without a Partner Code, or with a code the desk does not know, are reported back, never
-- guessed. A brand removed from Airtable is reported as orphaned; its term is left as it was.
--
-- On the desk the synced terms are read-only: rate, basis, status, dates and scope change only
-- through the sync. The house can still link the signed contract (contract_document_id).

alter table public.commission_terms
  add column source text not null default 'desk' check (source in ('desk', 'airtable')),
  add column airtable_record_id text,
  add column synced_at timestamptz;
-- One open term per Airtable row; closed ones keep the record id for history.
create unique index commission_terms_airtable_open_idx on public.commission_terms (airtable_record_id)
  where airtable_record_id is not null and effective_to is null;

-- Synced terms are not edited by hand. Server code runs as service_role or through the security
-- definer sync below (current_user is then the owner); people come in as authenticated.
create or replace function private.commission_terms_synced_guard() returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user <> 'authenticated' then
    return coalesce(new, old);
  end if;
  if tg_op = 'INSERT' then
    if new.source <> 'desk' or new.airtable_record_id is not null then
      raise exception 'Commission from Airtable arrives through the sync' using errcode = '42501';
    end if;
    return new;
  end if;
  if old.source = 'airtable' then
    if tg_op = 'DELETE' then
      raise exception 'This commission is kept in Airtable (Partner Brands); change it there' using errcode = '42501';
    end if;
    if (new.organization_id, new.brand_id, new.property_id, new.basis, new.rate_bp, new.effective_from, new.effective_to, new.status, new.source, new.airtable_record_id, new.note)
       is distinct from
       (old.organization_id, old.brand_id, old.property_id, old.basis, old.rate_bp, old.effective_from, old.effective_to, old.status, old.source, old.airtable_record_id, old.note) then
      raise exception 'This commission is kept in Airtable (Partner Brands); change it there' using errcode = '42501';
    end if;
  elsif new.source <> 'desk' or new.airtable_record_id is not null then
    raise exception 'Commission from Airtable arrives through the sync' using errcode = '42501';
  end if;
  return new;
end $$;
revoke execute on function private.commission_terms_synced_guard() from public, anon, authenticated;
create trigger commission_terms_synced_guard before insert or update or delete on public.commission_terms
  for each row execute function private.commission_terms_synced_guard();

-- p_rows: [{ "record_id", "brand", "partner_code", "rate_bp", "net": bool, "confirmed": bool, "note" }]
-- p_on: the sync date (defaults to today). Returns what happened, for the Sync Log.
create or replace function public.sync_commission_terms(p_rows jsonb, p_on date default current_date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  r jsonb;
  v_org uuid;
  v_rate integer;
  v_basis text;
  v_status text;
  v_note text;
  cur public.commission_terms;
  seen text[] := '{}';
  out_created text[] := '{}';
  out_adopted text[] := '{}';
  out_changed text[] := '{}';
  out_status text[] := '{}';
  out_same text[] := '{}';
  out_unmatched text[] := '{}';
  out_orphaned text[] := '{}';
begin
  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Expected a list of Partner Brands rows' using errcode = '22023';
  end if;
  for r in select * from jsonb_array_elements(p_rows) loop
    if coalesce(r->>'record_id', '') !~ '^rec[A-Za-z0-9]{14}$' then
      out_unmatched := out_unmatched || (coalesce(r->>'brand', '?') || ': no Airtable record id');
      continue;
    end if;
    seen := seen || (r->>'record_id');
    select o.id into v_org from public.organizations o
      where o.type = 'partner' and o.partner_code = nullif(trim(r->>'partner_code'), '');
    if v_org is null then
      out_unmatched := out_unmatched || (coalesce(r->>'brand', '?') ||
        case when nullif(trim(r->>'partner_code'), '') is null then ': no Partner Code' else ': no desk partner ' || trim(r->>'partner_code') end);
      continue;
    end if;
    v_basis := case when (r->>'net')::boolean then 'net' else 'commission' end;
    v_rate := case when r->>'rate_bp' ~ '^\d+$' then (r->>'rate_bp')::integer end;
    if v_rate is null or v_rate > 10000 then
      if v_basis = 'commission' then
        out_unmatched := out_unmatched || (coalesce(r->>'brand', '?') || ': no Commission %');
        continue;
      end if;
      v_rate := null;
    end if;
    v_status := case when (r->>'confirmed')::boolean then 'confirmed' else 'to_confirm' end;
    v_note := left(coalesce(nullif(trim(r->>'note'), ''), 'From Airtable Partner Brands: ' || coalesce(r->>'brand', '')), 1000);

    -- the open term this row already keeps
    select * into cur from public.commission_terms t
      where t.airtable_record_id = r->>'record_id' and t.effective_to is null limit 1;
    -- first sight: adopt the partner's open, unsynced, partner- or brand-level term
    if not found then
      select * into cur from public.commission_terms t
        where t.organization_id = v_org and t.source = 'desk' and t.airtable_record_id is null
          and t.property_id is null and t.status <> 'retired' and t.effective_to is null
        order by (t.brand_id is null) desc, t.created_at limit 1;
      if found then
        update public.commission_terms set source = 'airtable', airtable_record_id = r->>'record_id', synced_at = now()
          where id = cur.id returning * into cur;
        out_adopted := out_adopted || (r->>'brand');
      end if;
    end if;

    if cur.id is null then
      insert into public.commission_terms (organization_id, basis, rate_bp, effective_from, status, note, source, airtable_record_id, synced_at, created_by)
        values (v_org, v_basis, v_rate, p_on, v_status, v_note, 'airtable', r->>'record_id', now(), null);
      out_created := out_created || (r->>'brand');
    elsif cur.organization_id <> v_org then
      out_unmatched := out_unmatched || (coalesce(r->>'brand', '?') || ': Partner Code changed; fix it in Airtable or ask the house');
    elsif cur.rate_bp is distinct from v_rate or cur.basis <> v_basis then
      if cur.effective_from >= p_on then
        update public.commission_terms set rate_bp = v_rate, basis = v_basis, status = v_status, note = v_note, synced_at = now() where id = cur.id;
      else
        update public.commission_terms set effective_to = p_on - 1, synced_at = now() where id = cur.id;
        insert into public.commission_terms (organization_id, brand_id, basis, rate_bp, effective_from, status, contract_document_id, note, source, airtable_record_id, synced_at, created_by)
          values (v_org, cur.brand_id, v_basis, v_rate, p_on, v_status, cur.contract_document_id, v_note, 'airtable', r->>'record_id', now(), null);
      end if;
      out_changed := out_changed || (r->>'brand' || ' ' || coalesce(cur.rate_bp::text, '-') || ' to ' || coalesce(v_rate::text, '-') || ' bp');
    elsif cur.status is distinct from v_status or cur.note is distinct from v_note then
      update public.commission_terms set status = v_status, note = v_note, synced_at = now() where id = cur.id;
      out_status := out_status || (r->>'brand');
    else
      update public.commission_terms set synced_at = now() where id = cur.id;
      out_same := out_same || (r->>'brand');
    end if;
    cur := null;
    v_org := null;
  end loop;

  select coalesce(array_agg(distinct t.airtable_record_id), '{}') into out_orphaned from public.commission_terms t
    where t.source = 'airtable' and t.effective_to is null and not (t.airtable_record_id = any (seen));

  return jsonb_build_object('created', out_created, 'adopted', out_adopted, 'changed', out_changed,
    'status_or_note', out_status, 'unchanged', out_same, 'unmatched', out_unmatched, 'orphaned', out_orphaned);
end $$;
revoke execute on function public.sync_commission_terms(jsonb, date) from public, anon, authenticated;
grant execute on function public.sync_commission_terms(jsonb, date) to service_role;
