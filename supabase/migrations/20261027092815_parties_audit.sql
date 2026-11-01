-- Booking Live · Phase 1 · 0004 travel parties and audit log. Spec §5A, §5F.

create table public.travel_parties (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  owner_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index travel_parties_owner_idx on public.travel_parties (owner_user_id);

create table public.travel_party_members (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.travel_parties (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  invitation_email text check (invitation_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role text not null default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  invitation_status text not null default 'pending' check (invitation_status in ('pending', 'accepted', 'revoked')),
  accepted_at timestamptz,
  check (user_id is not null or invitation_email is not null)
);
create index travel_party_members_party_idx on public.travel_party_members (party_id);
create index travel_party_members_user_idx on public.travel_party_members (user_id);

create or replace function private.is_party_owner(p uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.travel_parties where id = p and owner_user_id = auth.uid());
$$;
grant execute on function private.is_party_owner(uuid) to authenticated;

alter table public.travel_parties enable row level security;
alter table public.travel_party_members enable row level security;

create policy parties_owner_all on public.travel_parties
  for all to authenticated
  using (owner_user_id = (select auth.uid()))
  with check (owner_user_id = (select auth.uid()));
create policy parties_member_read on public.travel_parties
  for select to authenticated using (
    exists (select 1 from public.travel_party_members m
            where m.party_id = travel_parties.id and m.user_id = (select auth.uid())
              and m.invitation_status = 'accepted')
  );
create policy party_members_owner_all on public.travel_party_members
  for all to authenticated
  using (private.is_party_owner(party_id))
  with check (private.is_party_owner(party_id));
create policy party_members_self_read on public.travel_party_members
  for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.travel_parties, public.travel_party_members from anon;
grant select, insert, update, delete on public.travel_parties, public.travel_party_members to authenticated;

-- Audit log: private schema, written only by triggers, never read by clients.
create table private.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_snapshot jsonb,
  after_snapshot jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on private.audit_logs (entity_type, entity_id, created_at desc);

create or replace function private.audit_row()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  eid text := coalesce(rec ->> 'id', concat_ws(':', rec ->> 'folio_id', rec ->> 'user_id'));
begin
  insert into private.audit_logs (actor_id, action, entity_type, entity_id, before_snapshot, after_snapshot)
  values (
    auth.uid(), lower(tg_op), tg_table_name, eid,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) - 'token_hash' end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) - 'token_hash' end
  );
  return coalesce(new, old);
end $$;

-- Phase 1 audits sharing (who can see a traveler's Folio) and staff roles.
create trigger audit_folio_members after insert or update or delete on public.folio_members
  for each row execute function private.audit_row();
create trigger audit_folio_invitations after insert or update or delete on public.folio_invitations
  for each row execute function private.audit_row();
create trigger audit_org_memberships after insert or update or delete on public.organization_memberships
  for each row execute function private.audit_row();
create trigger audit_folios_delete after delete on public.folios
  for each row execute function private.audit_row();

-- Lock down the private schema: no client reads the audit log, and helper
-- functions run only for signed-in users (policies call them as definer).
revoke all on all tables in schema private from public, anon, authenticated;
revoke execute on all functions in schema private from public, anon;
grant execute on function private.folio_role(uuid), private.has_org_role(text[]), private.is_party_owner(uuid) to authenticated;

-- Supabase grants ALL on public tables to API roles by default. TRUNCATE
-- bypasses row-level security, so it (and REFERENCES, TRIGGER) is removed.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
