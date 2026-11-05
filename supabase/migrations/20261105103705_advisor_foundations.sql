-- Advisor Desk · Step 1 · Foundations (James, 5 Nov 2026: "Yes, I'm happy. Please proceed with step one.")
--
-- 1. Advisor accounts: one row per advisor, tied to the ADV number and profile slug the site already
--    shows, and (once invited) to a sign-in. Outside advisors belong to their own agency organization.
-- 2. The selling advisor on folios, quotes and bookings: who sold it, kept apart from the house person
--    who approved or held it (quotes.advisor_user_id / bookings.advisor_user_id stay as they are).
-- 3. Narrower read rules. Until now any active "advisor" or "admin" membership could read every quote,
--    booking, payment and traveller profile. Now:
--      - the house reads all, as house operations: jw_admin, jw_portfolio_manager or admin in the
--        internal organization, signed in with the authenticator code (aal2; is_jw, D-11);
--      - an advisor reads only what they sold, also only with the authenticator code;
--      - travellers keep reading their own.
--    An "advisor" membership in the internal organization no longer opens anything by itself: advisors
--    are people in public.advisors, not a house role.
-- 4. The house manages advisor accounts and sets the selling advisor (service role or house editors).

-- ===== 1. advisor accounts
create table public.advisors (
  id uuid primary key default gen_random_uuid(),
  adv_number text not null unique check (adv_number ~ '^ADV-[0-9]{4}-[0-9]{6}$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  display_name text not null check (char_length(display_name) between 1 and 120),
  user_id uuid unique references auth.users (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  status text not null default 'invited' check (status in ('invited', 'active', 'paused', 'left')),
  house_advisor boolean not null default false,
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger advisors_touch before update on public.advisors for each row execute function private.touch_updated_at();
create trigger audit_advisors after insert or update or delete on public.advisors for each row execute function private.audit_row();

-- ===== who is asking
-- House operations: the house, signed in with the authenticator code.
create or replace function private.is_house_ops()
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin']);
$$;

-- This person's advisor id, only when active and signed in with the authenticator code.
create or replace function private.my_advisor_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select a.id from public.advisors a
  where a.user_id = auth.uid() and a.status = 'active'
    and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

revoke execute on function private.is_house_ops(), private.my_advisor_id() from public, anon;
grant execute on function private.is_house_ops(), private.my_advisor_id() to authenticated;

alter table public.advisors enable row level security;
create policy advisors_select on public.advisors for select to authenticated
  using (private.is_jw() or id = private.my_advisor_id());
revoke all on public.advisors from anon;
revoke insert, update, delete on public.advisors from authenticated;
grant select on public.advisors to authenticated;

-- ===== 2. the selling advisor
alter table public.folios add column selling_advisor_id uuid references public.advisors (id) on delete set null;
alter table public.quotes add column selling_advisor_id uuid references public.advisors (id) on delete set null;
alter table public.bookings add column selling_advisor_id uuid references public.advisors (id) on delete set null;
create index folios_selling_advisor_idx on public.folios (selling_advisor_id) where selling_advisor_id is not null;
create index quotes_selling_advisor_idx on public.quotes (selling_advisor_id) where selling_advisor_id is not null;
create index bookings_selling_advisor_idx on public.bookings (selling_advisor_id) where selling_advisor_id is not null;

-- ===== 3. narrower read rules
alter policy quotes_read on public.quotes using (
  traveler_user_id = (select auth.uid())
  or private.is_house_ops()
  or (selling_advisor_id is not null and selling_advisor_id = private.my_advisor_id())
);

alter policy bookings_read on public.bookings using (
  traveler_user_id = (select auth.uid())
  or private.is_house_ops()
  or (selling_advisor_id is not null and selling_advisor_id = private.my_advisor_id())
);

alter policy payments_read on public.payments using (
  traveler_user_id = (select auth.uid())
  or private.is_house_ops()
  or exists (select 1 from public.bookings b where b.id = payments.booking_id
             and b.selling_advisor_id is not null and b.selling_advisor_id = private.my_advisor_id())
);

-- An advisor reads the folios they sell (the traveller's own sharing rules are unchanged).
create policy folios_read_advisor on public.folios for select to authenticated using (
  selling_advisor_id is not null and selling_advisor_id = private.my_advisor_id()
);

-- Traveller names: the house, and an advisor for their own clients only.
alter policy profiles_select_house on public.profiles using (
  private.is_house_ops()
  or exists (select 1 from public.quotes q where q.traveler_user_id = profiles.id
             and q.selling_advisor_id is not null and q.selling_advisor_id = private.my_advisor_id())
  or exists (select 1 from public.bookings b where b.traveler_user_id = profiles.id
             and b.selling_advisor_id is not null and b.selling_advisor_id = private.my_advisor_id())
  or exists (select 1 from public.folios f where f.owner_user_id = profiles.id
             and f.selling_advisor_id is not null and f.selling_advisor_id = private.my_advisor_id())
);

-- ===== 4. house tools
-- Assign (or clear) the selling advisor on a folio, quote or booking. House editors only; audited by
-- the row triggers already on those tables.
create or replace function public.set_selling_advisor(p_kind text, p_id uuid, p_advisor uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin']) then
    raise exception 'Only the house can assign the selling advisor' using errcode = '42501';
  end if;
  if p_advisor is not null and not exists (select 1 from public.advisors where id = p_advisor and status in ('invited', 'active')) then
    raise exception 'No such advisor' using errcode = '22023';
  end if;
  case p_kind
    when 'folio' then update public.folios set selling_advisor_id = p_advisor where id = p_id;
    when 'quote' then update public.quotes set selling_advisor_id = p_advisor where id = p_id;
    when 'booking' then update public.bookings set selling_advisor_id = p_advisor where id = p_id;
    else raise exception 'Kind must be folio, quote or booking' using errcode = '22023';
  end case;
  if not found then raise exception 'Not found' using errcode = 'P0002'; end if;
end;
$$;
revoke all on function public.set_selling_advisor(text, uuid, uuid) from public, anon;
grant execute on function public.set_selling_advisor(text, uuid, uuid) to authenticated;

-- ===== the six advisors already on the site (lib/content/advisors.ts), not yet tied to a sign-in.
-- The stand-ins (sample profiles) are not advisors and are left out.
insert into public.advisors (adv_number, slug, display_name, status, house_advisor) values
  ('ADV-1982-000001', 'james-papagno', 'James Papagno', 'invited', true),
  ('ADV-2026-000001', 'kristina-larson', 'Kristina Larson', 'invited', false),
  ('ADV-2026-000002', 'anthony-papagno', 'Anthony Papagno', 'invited', true),
  ('ADV-2026-000003', 'albert-alvarez', 'Albert Alvarez', 'invited', false),
  ('ADV-2026-000004', 'carlos-alger', 'Carlos Alger', 'invited', false),
  ('ADV-2026-000009', 'marissa-held', 'Marissa Held', 'invited', false)
on conflict (adv_number) do nothing;
