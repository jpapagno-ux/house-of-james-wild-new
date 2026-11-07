-- Advisor Desk · Step 6 · The commission ledger and advisor earnings (James, 7 Nov 2026: "next step 6
-- continue"; rules in claude/commissions-and-accounting-plan.md, D-25 and D-26).
--
-- One line per booking. The house's finance people record it when a stay is confirmed: from an advisor's
-- confirmed quote request (step 5), from a booking made on the site, or from a booking an advisor made
-- directly with a supplier under the house (the trade book, later). At that moment the commissionable
-- base, the partner's rate, the advisor's tier and share are SNAPSHOTTED, so later changes to rates or
-- tiers never rewrite a sold booking. Money is whole cents; the advisor's and the house's share always add
-- up to the gross commission. The line then moves: expected, invoiced to the partner, received, advisor
-- paid (or cancelled).
--
-- Who sees what: house admins, portfolio managers and finance see every line (with the code). An advisor
-- sees only their own lines, and only through my_earnings(): their client, the stay, the dates, the
-- sale and their own share in money; never the partner's rate, the gross or the house's share
-- (decision 3). Partners, travellers and the public see none of it.

create or replace function private.is_house_finance()
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin', 'finance']);
$$;
revoke execute on function private.is_house_finance() from public, anon;
grant execute on function private.is_house_finance() to authenticated;

create sequence public.commission_line_seq;

create table public.commission_lines (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default ('CL-' || to_char(now() at time zone 'America/New_York', 'YYYY') || '-' || lpad(nextval('public.commission_line_seq')::text, 6, '0')),
  source text not null check (source in ('advisor_request', 'site_booking', 'supplier_direct')),
  advisor_request_id uuid unique references public.advisor_requests (id),
  booking_id uuid unique references public.bookings (id),
  supplier_name text check (char_length(supplier_name) <= 160),
  supplier_reference text check (char_length(supplier_reference) <= 120),
  advisor_id uuid references public.advisors (id),
  organization_id uuid references public.organizations (id),
  property_id uuid references public.properties (id),
  stay_name text not null check (char_length(stay_name) between 1 and 200),
  stay_slug text check (stay_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ledger_id text check (ledger_id ~ '^[A-Z]{3}-\d{4}-\d{6}$'),
  client_name text check (char_length(client_name) <= 160),
  arrival date not null,
  departure date not null,
  booked_on date not null default current_date,
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  sell_minor bigint not null check (sell_minor >= 0),
  base_minor bigint not null check (base_minor >= 0),
  rate_bp integer not null check (rate_bp between 0 and 10000),
  rate_source text not null check (rate_source in ('term', 'override')),
  term_id uuid references public.commission_terms (id),
  gross_minor bigint not null check (gross_minor >= 0),
  tier text references public.advisor_tiers (key),
  advisor_share_bp integer not null default 0 check (advisor_share_bp between 0 and 10000),
  advisor_minor bigint not null default 0 check (advisor_minor >= 0),
  house_minor bigint not null check (house_minor >= 0),
  status text not null default 'expected' check (status in ('expected', 'invoiced', 'received', 'advisor_paid', 'cancelled')),
  invoiced_on date, invoice_reference text check (char_length(invoice_reference) <= 120),
  received_on date, received_reference text check (char_length(received_reference) <= 120),
  paid_on date, paid_reference text check (char_length(paid_reference) <= 120),
  cancelled_on date,
  note text check (char_length(note) <= 1000),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (departure > arrival),
  check (base_minor <= sell_minor),
  check (advisor_minor + house_minor = gross_minor),
  check (rate_source = 'term' or note is not null),
  check ((source = 'advisor_request') = (advisor_request_id is not null)),
  check ((source = 'site_booking') = (booking_id is not null)),
  check (source <> 'supplier_direct' or supplier_name is not null)
);
create index commission_lines_status_idx on public.commission_lines (status, arrival);
create index commission_lines_advisor_idx on public.commission_lines (advisor_id, booked_on desc);
create index commission_lines_org_idx on public.commission_lines (organization_id, booked_on desc);
create trigger commission_lines_touch before update on public.commission_lines for each row execute function private.touch_updated_at();
create trigger audit_commission_lines after insert or update or delete on public.commission_lines for each row execute function private.audit_row();
alter table public.commission_lines enable row level security;
create policy commission_lines_select on public.commission_lines for select to authenticated using (private.is_house_finance());
revoke all on public.commission_lines from anon;
revoke insert, update, delete on public.commission_lines from authenticated;
grant select on public.commission_lines to authenticated;
revoke all on sequence public.commission_line_seq from public, anon, authenticated;

-- The arithmetic, in one place: gross from the base and rate, the advisor's share of the gross, the rest
-- to the house. Rounded half up to whole cents; advisor + house = gross always.
create or replace function private.commission_split(p_base bigint, p_rate_bp integer, p_share_bp integer)
returns table (gross bigint, advisor bigint, house bigint) language sql immutable set search_path = '' as $$
  with g as (select round(p_base::numeric * p_rate_bp / 10000)::bigint as gross)
  select g.gross, round(g.gross::numeric * p_share_bp / 10000)::bigint, g.gross - round(g.gross::numeric * p_share_bp / 10000)::bigint from g;
$$;
revoke execute on function private.commission_split(bigint, integer, integer) from public, anon;

-- The advisor's tier on a date (no tier: Tier 2).
create or replace function private.advisor_tier_on(p_advisor uuid, p_on date)
returns table (tier text, share_bp integer) language sql stable security definer set search_path = '' as $$
  select t.key, t.share_bp from public.advisor_tiers t
  where t.key = coalesce((
    select ta.tier from public.advisor_tier_assignments ta join public.advisors a on a.user_id = ta.user_id
    where a.id = p_advisor and ta.effective_from <= p_on and (ta.effective_to is null or ta.effective_to >= p_on)
    order by ta.effective_from desc limit 1), 'tier_2');
$$;
revoke execute on function private.advisor_tier_on(uuid, date) from public, anon, authenticated;

-- Record a line from an advisor's confirmed quote request. The base is what the house says is
-- commissionable (room, land or vessel after offers; never taxes, fees or Florida sales tax), at most the
-- price. The rate comes from the commission terms on file for the stay; a house override needs a reason.
create or replace function public.record_commission_from_request(p_request uuid, p_base_minor bigint, p_rate_bp integer default null, p_note text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare rq record; prop uuid; org uuid; term record; rate integer; src text; tr record; sp record; line record;
begin
  if not private.is_house_finance() then raise exception 'House finance only, with the code' using errcode = '42501'; end if;
  select * into rq from public.advisor_requests where id = p_request for update;
  if rq is null then raise exception 'Not found' using errcode = 'P0002'; end if;
  if rq.status <> 'confirmed' then raise exception 'Confirm the request before recording its commission' using errcode = '22023'; end if;
  if exists (select 1 from public.commission_lines where advisor_request_id = p_request) then raise exception 'Already recorded' using errcode = '23505'; end if;
  if p_base_minor is null or p_base_minor <= 0 or p_base_minor > rq.price_minor then raise exception 'The commissionable amount is more than zero and no more than the price' using errcode = '22023'; end if;
  select p.id, ep.organization_id into prop, org from public.properties p left join public.entity_partners ep on ep.property_id = p.id and ep.is_primary where p.slug = rq.stay_slug limit 1;
  if prop is not null then select * into term from private.commission_rate_for(prop, current_date) limit 1; end if;
  if p_rate_bp is not null then
    if p_rate_bp < 0 or p_rate_bp > 10000 then raise exception 'A rate between 0 and 100 percent' using errcode = '22023'; end if;
    if coalesce(btrim(p_note), '') = '' then raise exception 'Say why the rate differs from the terms on file' using errcode = '22023'; end if;
    rate := p_rate_bp; src := 'override';
  elsif term.rate_bp is not null then rate := term.rate_bp; src := 'term';
  else raise exception 'No commission term on file for this stay: enter the rate and say where it comes from' using errcode = '22023';
  end if;
  select * into tr from private.advisor_tier_on(rq.advisor_id, current_date);
  select * into sp from private.commission_split(p_base_minor, rate, tr.share_bp);
  insert into public.commission_lines (source, advisor_request_id, advisor_id, organization_id, property_id, stay_name, stay_slug, ledger_id, client_name, arrival, departure,
    currency, sell_minor, base_minor, rate_bp, rate_source, term_id, gross_minor, tier, advisor_share_bp, advisor_minor, house_minor, note, created_by)
  values ('advisor_request', rq.id, rq.advisor_id, org, prop, rq.stay_name, rq.stay_slug, rq.ledger_id, rq.client_name, rq.arrival, rq.departure,
    rq.currency, rq.price_minor, p_base_minor, rate, src, case when src = 'term' then term.term_id end, sp.gross, tr.tier, tr.share_bp, sp.advisor, sp.house, nullif(btrim(coalesce(p_note, '')), ''), auth.uid())
  returning id, ref into line;
  return jsonb_build_object('id', line.id, 'ref', line.ref);
end;
$$;
revoke all on function public.record_commission_from_request(uuid, bigint, integer, text) from public, anon;
grant execute on function public.record_commission_from_request(uuid, bigint, integer, text) to authenticated;

-- Move a line on: expected → invoiced → received → advisor paid; or cancelled before the advisor is paid.
create or replace function public.set_commission_status(p_line uuid, p_status text, p_on date default current_date, p_reference text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare cur record; nxt text;
begin
  if not private.is_house_finance() then raise exception 'House finance only, with the code' using errcode = '42501'; end if;
  select * into cur from public.commission_lines where id = p_line for update;
  if cur is null then raise exception 'Not found' using errcode = 'P0002'; end if;
  nxt := case cur.status when 'expected' then 'invoiced' when 'invoiced' then 'received' when 'received' then 'advisor_paid' end;
  if p_status = 'cancelled' then
    if cur.status in ('advisor_paid', 'cancelled') then raise exception 'A paid or cancelled line cannot be cancelled' using errcode = '22023'; end if;
  elsif p_status is distinct from nxt then
    raise exception 'Next for this line: %', coalesce(nxt, 'nothing, it is closed') using errcode = '22023';
  end if;
  if p_on is null or p_on > current_date + 1 then raise exception 'Give the date it happened' using errcode = '22023'; end if;
  update public.commission_lines set status = p_status,
    invoiced_on = case when p_status = 'invoiced' then p_on else invoiced_on end, invoice_reference = case when p_status = 'invoiced' then nullif(btrim(coalesce(p_reference, '')), '') else invoice_reference end,
    received_on = case when p_status = 'received' then p_on else received_on end, received_reference = case when p_status = 'received' then nullif(btrim(coalesce(p_reference, '')), '') else received_reference end,
    paid_on = case when p_status = 'advisor_paid' then p_on else paid_on end, paid_reference = case when p_status = 'advisor_paid' then nullif(btrim(coalesce(p_reference, '')), '') else paid_reference end,
    cancelled_on = case when p_status = 'cancelled' then p_on else cancelled_on end
  where id = p_line;
end;
$$;
revoke all on function public.set_commission_status(uuid, text, date, text) from public, anon;
grant execute on function public.set_commission_status(uuid, text, date, text) to authenticated;

-- The advisor's own earnings: their share in money, never the partner's rate, the gross or the house's share.
create or replace function public.my_earnings()
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', l.id, 'ref', l.ref, 'source', l.source, 'request_id', l.advisor_request_id, 'stay_name', l.stay_name, 'stay_slug', l.stay_slug,
      'client_name', l.client_name, 'arrival', l.arrival, 'departure', l.departure, 'booked_on', l.booked_on,
      'currency', l.currency, 'sell_minor', l.sell_minor, 'advisor_minor', l.advisor_minor, 'tier', l.tier,
      'status', l.status, 'paid_on', l.paid_on, 'paid_reference', l.paid_reference) order by l.booked_on desc, l.ref desc), '[]'::jsonb)
  from public.commission_lines l
  where private.my_advisor_id() is not null and l.advisor_id = private.my_advisor_id();
$$;
revoke all on function public.my_earnings() from public, anon;
grant execute on function public.my_earnings() to authenticated;

-- For the house's form: the partner's rate on file for a stay today (most specific term wins), or null.
create or replace function public.commission_rate_for_stay(p_slug text)
returns integer language plpgsql stable security definer set search_path = '' as $$
declare prop uuid; rate integer;
begin
  if not private.is_house_finance() then raise exception 'House finance only, with the code' using errcode = '42501'; end if;
  select id into prop from public.properties where slug = p_slug;
  if prop is null then return null; end if;
  select t.rate_bp into rate from private.commission_rate_for(prop, current_date) t limit 1;
  return rate;
end;
$$;
revoke all on function public.commission_rate_for_stay(text) from public, anon;
grant execute on function public.commission_rate_for_stay(text) to authenticated;
