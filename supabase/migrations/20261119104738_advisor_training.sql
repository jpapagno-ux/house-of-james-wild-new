-- Advisor Desk · training registration (James, 19 Nov 2026)
-- The house's advisor training program is being designed. Until its sessions are scheduled, an advisor
-- (invited or active, with the authenticator code) registers once from their file; the house sees who is
-- waiting and writes to them when it opens. One row per advisor. No dates, sessions or payment here.
-- Additive: touches no existing table.

create table public.advisor_training_registrations (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null unique references public.advisors (id) on delete cascade,
  note text check (note is null or char_length(note) between 1 and 500),
  registered_by uuid references auth.users (id) on delete set null default auth.uid(),
  registered_at timestamptz not null default now()
);
create trigger audit_advisor_training_registrations after insert or update or delete on public.advisor_training_registrations
  for each row execute function private.audit_row();
alter table public.advisor_training_registrations enable row level security;
-- The advisor reads their own row; the house's advisor keepers read every row.
create policy advisor_training_registrations_select on public.advisor_training_registrations for select to authenticated
  using (advisor_id = private.my_advisor_file() or private.is_advisor_keeper());
revoke all on public.advisor_training_registrations from anon;
revoke insert, update, delete on public.advisor_training_registrations from authenticated;
grant select on public.advisor_training_registrations to authenticated;

-- Register (or change the note). Only for the caller's own file.
create or replace function public.register_for_advisor_training(p_note text default null)
returns timestamptz language plpgsql security definer set search_path = '' as $$
declare me uuid := private.my_advisor_file(); n text := nullif(btrim(coalesce(p_note, '')), ''); at timestamptz;
begin
  if me is null then raise exception 'Sign in with your authenticator code' using errcode = '42501'; end if;
  if char_length(n) > 500 then raise exception 'Keep the note under 500 characters' using errcode = '22023'; end if;
  insert into public.advisor_training_registrations (advisor_id, note) values (me, n)
  on conflict (advisor_id) do update set note = excluded.note
  returning registered_at into at;
  return at;
end;
$$;
revoke all on function public.register_for_advisor_training(text) from public, anon;
grant execute on function public.register_for_advisor_training(text) to authenticated;

-- Withdraw the caller's own registration.
create or replace function public.withdraw_advisor_training()
returns boolean language plpgsql security definer set search_path = '' as $$
declare me uuid := private.my_advisor_file(); n int;
begin
  if me is null then raise exception 'Sign in with your authenticator code' using errcode = '42501'; end if;
  delete from public.advisor_training_registrations where advisor_id = me;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;
revoke all on function public.withdraw_advisor_training() from public, anon;
grant execute on function public.withdraw_advisor_training() to authenticated;
