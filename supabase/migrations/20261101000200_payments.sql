-- Booking Live · Phase 3b · 0012 payments (1 Nov 2026)
--
-- A payment is one movement of money against a booking: the deposit, the
-- balance, or another amount the house records. Rows are written only by the
-- server — from a gateway webhook (provider = stripe …) or by an advisor
-- (provider = manual, a bank transfer or card taken by phone). When a payment
-- succeeds, the booking's paid columns move forward and its status follows
-- (confirmed → deposit_paid → paid). Amounts never exceed what the booking is
-- owed. Travelers read their own payments; nobody writes from a browser.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default ('P-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  traveler_user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('deposit', 'balance', 'other')),
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  provider text not null check (provider in ('stripe', 'manual')),
  provider_reference text check (char_length(provider_reference) <= 200),   -- checkout session / payment intent / bank reference
  provider_event text check (char_length(provider_event) <= 200),           -- the webhook event id that settled it (idempotency)
  note text check (char_length(note) <= 500),
  recorded_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  succeeded_at timestamptz
);
create index if not exists payments_booking_idx on public.payments (booking_id, created_at);
create index if not exists payments_traveler_idx on public.payments (traveler_user_id, created_at desc);
create unique index if not exists payments_provider_ref_idx on public.payments (provider, provider_reference) where provider_reference is not null;

-- Settle a payment: mark it succeeded (once) and move the booking forward, in one transaction.
create or replace function public.settle_payment(p_payment uuid, p_event text default null)
returns public.bookings language plpgsql security definer set search_path = '' as $$
declare p public.payments; b public.bookings; owed bigint;
begin
  select * into p from public.payments where id = p_payment for update;
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;
  if p.status = 'succeeded' then select * into b from public.bookings where id = p.booking_id; return b; end if;
  if p.status <> 'pending' then raise exception 'payment is %', p.status using errcode = '23514'; end if;
  select * into b from public.bookings where id = p.booking_id for update;
  if b.status = 'cancelled' then raise exception 'booking is cancelled' using errcode = '23514'; end if;
  owed := b.grand_total_minor - b.deposit_paid_minor - b.balance_paid_minor;
  if p.amount_minor > owed then raise exception 'payment exceeds what is owed' using errcode = '23514'; end if;
  update public.payments set status = 'succeeded', succeeded_at = now(), provider_event = coalesce(p_event, provider_event) where id = p.id;
  if p.kind = 'deposit' then
    update public.bookings set deposit_paid_minor = deposit_paid_minor + p.amount_minor where id = b.id;
  else
    update public.bookings set balance_paid_minor = balance_paid_minor + p.amount_minor where id = b.id;
  end if;
  select * into b from public.bookings where id = b.id;
  update public.bookings set status = case
      when b.deposit_paid_minor + b.balance_paid_minor >= b.grand_total_minor then 'paid'
      when b.deposit_paid_minor >= b.deposit_due_minor and b.deposit_due_minor > 0 then 'deposit_paid'
      else b.status end
    where id = b.id and b.status in ('confirmed', 'deposit_paid');
  select * into b from public.bookings where id = b.id;
  return b;
end $$;
revoke all on function public.settle_payment(uuid, text) from public, anon, authenticated;
grant execute on function public.settle_payment(uuid, text) to service_role;

create trigger audit_payments after insert or update or delete on public.payments for each row execute function private.audit_row();
alter table public.payments enable row level security;
create policy payments_read on public.payments for select to authenticated using (
  traveler_user_id = (select auth.uid()) or private.has_org_role(array['admin', 'advisor'])
);
revoke insert, update, delete, truncate, references, trigger on public.payments from anon, authenticated;
revoke all on public.payments from anon;
grant select on public.payments to authenticated;

-- Advisors and admins may read travelers' profiles (names for the desk). Column
-- grants are unchanged: no client can edit another person's profile.
create policy profiles_select_house on public.profiles
  for select to authenticated using (private.has_org_role(array['admin', 'advisor']));
