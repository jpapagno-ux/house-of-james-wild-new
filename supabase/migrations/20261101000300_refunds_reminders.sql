-- Booking Live · Phase 3b(ii) · 0013 refunds, cancellation, balance reminders (1 Nov 2026)
--
-- A refund reverses part or all of a succeeded payment and moves the booking's
-- paid columns back, in one transaction (refund_payment). Cancellation is a
-- status change recorded by the house; money is handled by refunds, never
-- implied. The balance reminder is sent once per booking by the cron route.

alter table public.payments
  add column if not exists refunded_minor bigint not null default 0 check (refunded_minor >= 0),
  add column if not exists provider_charge text check (char_length(provider_charge) <= 200), -- the payment intent / charge a refund is issued against
  add column if not exists refund_reference text check (char_length(refund_reference) <= 200);
alter table public.bookings
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancel_note text check (char_length(cancel_note) <= 1000),
  add column if not exists balance_reminder_sent_at timestamptz;

create or replace function public.refund_payment(p_payment uuid, p_amount bigint, p_reference text default null, p_note text default null)
returns public.bookings language plpgsql security definer set search_path = '' as $$
declare p public.payments; b public.bookings; room bigint;
begin
  select * into p from public.payments where id = p_payment for update;
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;
  if p.status not in ('succeeded', 'refunded') then raise exception 'only a succeeded payment can be refunded' using errcode = '23514'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'refund amount must be positive' using errcode = '23514'; end if;
  room := p.amount_minor - p.refunded_minor;
  if p_amount > room then raise exception 'refund exceeds what remains of this payment' using errcode = '23514'; end if;
  select * into b from public.bookings where id = p.booking_id for update;
  update public.payments set refunded_minor = refunded_minor + p_amount,
    status = case when refunded_minor + p_amount >= amount_minor then 'refunded' else status end,
    refund_reference = coalesce(p_reference, refund_reference), note = coalesce(p_note, note) where id = p.id;
  if p.kind = 'deposit' then
    update public.bookings set deposit_paid_minor = greatest(0, deposit_paid_minor - p_amount) where id = b.id;
  else
    update public.bookings set balance_paid_minor = greatest(0, balance_paid_minor - p_amount) where id = b.id;
  end if;
  select * into b from public.bookings where id = b.id;
  update public.bookings set status = case
      when b.deposit_paid_minor + b.balance_paid_minor >= b.grand_total_minor then 'paid'
      when b.deposit_paid_minor >= b.deposit_due_minor and b.deposit_due_minor > 0 then 'deposit_paid'
      else 'confirmed' end
    where id = b.id and b.status in ('confirmed', 'deposit_paid', 'paid');
  select * into b from public.bookings where id = b.id;
  return b;
end $$;
revoke all on function public.refund_payment(uuid, bigint, text, text) from public, anon, authenticated;
grant execute on function public.refund_payment(uuid, bigint, text, text) to service_role;
