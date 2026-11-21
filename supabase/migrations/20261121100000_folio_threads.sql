-- Booking Live · Folio threads (Iggi Stage 2, James 21 Nov 2026: "Save to my Folio with sign-in, the itinerary
-- page in the portal, the chat into the Advisor Desk"). Design: claude/iggi-logistics-and-member-journey.md, Part B.
-- One thread per Folio: the sketch Iggi had on the table and the turns of the chat, with Iggi's Ledger citations.
-- Three readers: the traveler (Folio membership), the advisor and the house (org role), and Iggi through the Core.
-- A thread is a plan, never a booking or a quote.

create table public.folio_threads (
  id uuid primary key default gen_random_uuid(),
  folio_id uuid not null unique references public.folios (id) on delete cascade,
  core_conversation_id text check (char_length(core_conversation_id) <= 64),
  -- The sketch as Iggi left it: stops (Ledger ID, name, role, nights, pairing), transfers, dates hint, party.
  sketch jsonb not null default '{}'::jsonb check (pg_column_size(sketch) <= 65536),
  saved_by uuid default auth.uid() references auth.users (id) on delete set null,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger folio_threads_touch before update on public.folio_threads
  for each row execute function private.touch_updated_at();

create table public.folio_thread_turns (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.folio_threads (id) on delete cascade,
  role text not null check (role in ('traveler', 'advisor', 'iggi')),
  body text not null check (char_length(body) between 1 and 4000),
  -- Ledger IDs Iggi cited for this turn (STY-, ITN-, ARR-, TRF-, DST- ...).
  citations text[] not null default '{}' check (cardinality(citations) <= 12),
  author_user_id uuid default auth.uid() references auth.users (id) on delete set null,
  sort_order integer not null default 0,
  said_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index folio_thread_turns_thread_idx on public.folio_thread_turns (thread_id, sort_order);

alter table public.folio_threads enable row level security;
alter table public.folio_thread_turns enable row level security;

-- Readers: anyone on the Folio, or the house and its advisors.
create policy folio_threads_select on public.folio_threads
  for select to authenticated
  using (private.folio_role(folio_id) is not null or private.has_org_role(array['admin', 'advisor']));
-- The traveler saves: owner or editor of the Folio.
create policy folio_threads_insert on public.folio_threads
  for insert to authenticated
  with check (private.folio_role(folio_id) in ('owner', 'editor'));
create policy folio_threads_update on public.folio_threads
  for update to authenticated
  using (private.folio_role(folio_id) in ('owner', 'editor'))
  with check (private.folio_role(folio_id) in ('owner', 'editor'));
-- Deleting a saved chat removes it from the advisor's view too (one record): the owner's call.
create policy folio_threads_delete on public.folio_threads
  for delete to authenticated
  using (private.folio_role(folio_id) = 'owner');

create or replace function private.thread_folio(t uuid)
returns uuid language sql stable security definer set search_path = '' as $$
  select folio_id from public.folio_threads where id = t;
$$;
grant execute on function private.thread_folio(uuid) to authenticated;

create policy folio_thread_turns_select on public.folio_thread_turns
  for select to authenticated
  using (private.folio_role(private.thread_folio(thread_id)) is not null or private.has_org_role(array['admin', 'advisor']));
create policy folio_thread_turns_insert on public.folio_thread_turns
  for insert to authenticated
  with check (
    (role in ('traveler', 'iggi') and private.folio_role(private.thread_folio(thread_id)) in ('owner', 'editor'))
    or (role = 'advisor' and private.has_org_role(array['admin', 'advisor']))
  );
create policy folio_thread_turns_delete on public.folio_thread_turns
  for delete to authenticated
  using (private.folio_role(private.thread_folio(thread_id)) in ('owner', 'editor'));
