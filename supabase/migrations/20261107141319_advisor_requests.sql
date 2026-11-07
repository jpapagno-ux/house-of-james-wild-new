-- Advisor Desk · Step 5 · Quote requests (James, 7 Nov 2026: "we could do it this way").
--
-- An active advisor asks the house to price and hold a stay for a client: client name and email, the stay,
-- dates, party, room preference and notes, with the desk's estimate where a rate card exists. The house
-- prices it, confirms availability and holds it; the advisor sees the confirmed quote and shares it with
-- the client themselves. Nothing is emailed to a client. These requests live on the desks, apart from
-- Booking Live's traveller quotes, so step 5 needs no production switch; they become Booking Live quotes
-- and bookings with the commission ledger (step 6).
--
-- Only the advisor who sent it and the house's operations people (with the code) can read a request.
-- Writes go through functions that check who is asking and which way the status may move.

create sequence public.advisor_request_seq;

create table public.advisor_requests (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default ('AR-' || to_char(now() at time zone 'America/New_York', 'YYYY') || '-' || lpad(nextval('public.advisor_request_seq')::text, 6, '0')),
  advisor_id uuid not null references public.advisors (id),
  client_name text not null check (char_length(client_name) between 2 and 160),
  client_email text check (client_email is null or (client_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(client_email) <= 254)),
  stay_slug text not null check (stay_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(stay_slug) <= 120),
  ledger_id text check (ledger_id ~ '^[A-Z]{3}-\d{4}-\d{6}$'),
  stay_name text not null check (char_length(stay_name) between 1 and 200),
  arrival date not null,
  departure date not null,
  adults smallint not null check (adults between 1 and 20),
  child_ages smallint[] not null default '{}' check (cardinality(child_ages) <= 10),
  room_pref text check (char_length(room_pref) <= 200),
  notes text check (char_length(notes) <= 1000),
  estimate jsonb check (estimate is null or jsonb_typeof(estimate) = 'object'),
  status text not null default 'sent' check (status in ('sent', 'pricing', 'held', 'confirmed', 'declined', 'withdrawn')),
  price_minor bigint check (price_minor is null or price_minor >= 0),
  currency char(3) check (currency is null or currency ~ '^[A-Z]{3}$'),
  hold_until date,
  valid_until date,
  house_note text check (char_length(house_note) <= 1000),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  decided_by uuid references auth.users (id),
  check (departure > arrival and departure - arrival <= 60),
  check (status not in ('held', 'confirmed') or (price_minor is not null and currency is not null)),
  check (status <> 'held' or hold_until is not null)
);
create index advisor_requests_advisor_idx on public.advisor_requests (advisor_id, created_at desc);
create index advisor_requests_open_idx on public.advisor_requests (status) where status in ('sent', 'pricing', 'held');
create trigger advisor_requests_touch before update on public.advisor_requests for each row execute function private.touch_updated_at();
create trigger audit_advisor_requests after insert or update or delete on public.advisor_requests for each row execute function private.audit_row();
alter table public.advisor_requests enable row level security;
create policy advisor_requests_select on public.advisor_requests for select to authenticated
  using (advisor_id = private.my_advisor_id() or private.is_house_ops());
revoke all on public.advisor_requests from anon;
revoke insert, update, delete on public.advisor_requests from authenticated;
grant select on public.advisor_requests to authenticated;
revoke all on sequence public.advisor_request_seq from public, anon, authenticated;

-- The advisor sends a request (active advisors with the code). The app passes the estimate it worked out
-- from the house's rate cards; it is stored as shown, never as a price.
create or replace function public.create_advisor_request(p jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare me uuid := private.my_advisor_id(); r record; ages smallint[];
begin
  if me is null then raise exception 'Sign in to an active Advisor Desk with your authenticator code' using errcode = '42501'; end if;
  select coalesce(array_agg(x::smallint), '{}') into ages from jsonb_array_elements_text(coalesce(p -> 'child_ages', '[]')) x;
  if exists (select 1 from unnest(ages) a where a < 0 or a > 17) then raise exception 'Children are 0 to 17' using errcode = '22023'; end if;
  if (p ->> 'arrival')::date < current_date then raise exception 'Arrival is in the past' using errcode = '22023'; end if;
  insert into public.advisor_requests (advisor_id, client_name, client_email, stay_slug, ledger_id, stay_name, arrival, departure, adults, child_ages, room_pref, notes, estimate, created_by)
  values (me, btrim(p ->> 'client_name'), nullif(lower(btrim(coalesce(p ->> 'client_email', ''))), ''), p ->> 'stay_slug', nullif(p ->> 'ledger_id', ''), p ->> 'stay_name',
    (p ->> 'arrival')::date, (p ->> 'departure')::date, (p ->> 'adults')::smallint, ages, nullif(btrim(coalesce(p ->> 'room_pref', '')), ''), nullif(btrim(coalesce(p ->> 'notes', '')), ''),
    case when jsonb_typeof(p -> 'estimate') = 'object' then p -> 'estimate' end, auth.uid())
  returning id, ref into r;
  return jsonb_build_object('id', r.id, 'ref', r.ref);
end;
$$;
revoke all on function public.create_advisor_request(jsonb) from public, anon;
grant execute on function public.create_advisor_request(jsonb) to authenticated;

-- The advisor withdraws a request the house has not confirmed or declined.
create or replace function public.withdraw_advisor_request(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if private.my_advisor_id() is null then raise exception 'Sign in with your authenticator code' using errcode = '42501'; end if;
  update public.advisor_requests set status = 'withdrawn' where id = p_id and advisor_id = private.my_advisor_id() and status in ('sent', 'pricing', 'held');
  if not found then raise exception 'That request can no longer be withdrawn' using errcode = 'P0002'; end if;
end;
$$;
revoke all on function public.withdraw_advisor_request(uuid) from public, anon;
grant execute on function public.withdraw_advisor_request(uuid) to authenticated;

-- The house moves a request on: pricing, held (price and hold date), confirmed (price), or declined (a reason).
create or replace function public.decide_advisor_request(p_id uuid, p_status text, p_price_minor bigint, p_currency text, p_hold_until date, p_valid_until date, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare cur record;
begin
  if not private.is_house_ops() then raise exception 'House operations only, with the code' using errcode = '42501'; end if;
  select * into cur from public.advisor_requests where id = p_id for update;
  if cur is null then raise exception 'Not found' using errcode = 'P0002'; end if;
  if cur.status in ('confirmed', 'declined', 'withdrawn') then raise exception 'That request is closed' using errcode = '22023'; end if;
  if p_status not in ('pricing', 'held', 'confirmed', 'declined') then raise exception 'Pricing, held, confirmed or declined' using errcode = '22023'; end if;
  if p_status = 'declined' and coalesce(btrim(p_note), '') = '' then raise exception 'Say why; the advisor sees this' using errcode = '22023'; end if;
  if p_status in ('held', 'confirmed') and (p_price_minor is null or p_price_minor <= 0 or coalesce(p_currency, '') !~ '^[A-Z]{3}$') then
    raise exception 'Give the price and currency' using errcode = '22023'; end if;
  if p_status = 'held' and (p_hold_until is null or p_hold_until < current_date) then raise exception 'Give the date the hold runs to' using errcode = '22023'; end if;
  update public.advisor_requests set status = p_status,
    price_minor = coalesce(p_price_minor, price_minor), currency = coalesce(p_currency, currency),
    hold_until = coalesce(p_hold_until, hold_until), valid_until = coalesce(p_valid_until, valid_until),
    house_note = coalesce(nullif(btrim(coalesce(p_note, '')), ''), house_note), decided_by = auth.uid()
  where id = p_id;
end;
$$;
revoke all on function public.decide_advisor_request(uuid, text, bigint, text, date, date, text) from public, anon;
grant execute on function public.decide_advisor_request(uuid, text, bigint, text, date, date, text) to authenticated;
