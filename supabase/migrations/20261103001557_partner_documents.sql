-- Partner Desk · Stage 2 · Documents and contracts (D-23, James, 2 Nov 2026)
--
-- Partners upload supporting and commercial documents; the house uploads the signed contract.
-- Contracts are seen only by the partner's admins and the house's admins and portfolio managers,
-- never property managers, contributors or house editors. Enforced here, on the table and on the
-- storage objects, not in the screen.
--
--   kind        who sees it                                             who adds it
--   contract    partner admins; house admins + portfolio managers      house admins + portfolio managers
--   commercial  partner admins; property managers for their own        any partner member (own org, own
--               properties; the whole house                            properties); house editors
--   supporting  the whole partner team (scoped to their properties);   same as commercial
--               the whole house
--
-- Files live in the private bucket "partner-documents" at <organization_id>/<kind>/<uuid>-<file>.
-- Nothing is ever on a public URL; the desk hands out short-lived signed links. Partners never
-- delete: they archive their own supporting/commercial documents; contracts stay put.

-- ===== the register
create table public.partner_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  kind text not null check (kind in ('contract', 'commercial', 'supporting')),
  title text not null check (char_length(title) between 1 and 160),
  storage_path text not null unique check (storage_path ~ '^[0-9a-f-]{36}/(contract|commercial|supporting)/[A-Za-z0-9._-]{1,200}$'),
  mime_type text not null check (mime_type in ('application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png')),
  size_bytes integer not null check (size_bytes between 1 and 20971520),
  effective_from date,
  expires_on date,
  note text check (char_length(note) <= 1000),
  status text not null default 'active' check (status in ('active', 'superseded', 'archived')),
  uploaded_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (storage_path like organization_id::text || '/' || kind || '/%'),
  check (expires_on is null or effective_from is null or expires_on >= effective_from)
);
create index partner_documents_org_idx on public.partner_documents (organization_id, kind, status);
create index partner_documents_property_idx on public.partner_documents (property_id) where property_id is not null;
create index partner_documents_expiry_idx on public.partner_documents (expires_on) where status = 'active' and expires_on is not null;
create trigger partner_documents_touch before update on public.partner_documents for each row execute function private.touch_updated_at();
create trigger audit_partner_documents after insert or update or delete on public.partner_documents for each row execute function private.audit_row();

-- ===== who may see, add and archive
create or replace function private.can_see_document(org uuid, prop uuid, k text)
returns boolean language sql stable security definer set search_path = '' as $$
  select case k
    when 'contract' then
      private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin'])
      or private.is_org_member(org, array['partner_admin', 'partner_manager'])
    when 'commercial' then
      private.is_jw()
      or private.is_org_member(org, array['partner_admin', 'partner_manager'])
      or (prop is not null and private.is_org_member(org) and private.partner_can(prop, array['partner_contributor', 'partner_editor']))
    else
      private.is_jw()
      or private.is_org_member(org, array['partner_admin', 'partner_manager'])
      or (private.is_org_member(org) and (prop is null or private.partner_can(prop, array['partner_contributor', 'partner_editor'])))
  end;
$$;

create or replace function private.can_add_document(org uuid, prop uuid, k text)
returns boolean language sql stable security definer set search_path = '' as $$
  select case k
    when 'contract' then private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin'])
    else private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin'])
      or private.is_org_member(org, array['partner_admin', 'partner_manager'])
      or (private.is_org_member(org, array['partner_contributor', 'partner_editor'])
          and prop is not null and private.partner_can(prop, array['partner_contributor', 'partner_editor']))
  end
  -- a document for a property must belong to one of this organization's properties
  and (prop is null or exists (select 1 from public.entity_partners ep where ep.organization_id = org and ep.property_id = prop));
$$;

revoke execute on function private.can_see_document(uuid, uuid, text), private.can_add_document(uuid, uuid, text) from public, anon;
grant execute on function private.can_see_document(uuid, uuid, text), private.can_add_document(uuid, uuid, text) to authenticated;

alter table public.partner_documents enable row level security;

create policy partner_documents_select on public.partner_documents for select to authenticated
  using (private.can_see_document(organization_id, property_id, kind));
create policy partner_documents_insert on public.partner_documents for insert to authenticated
  with check (private.can_add_document(organization_id, property_id, kind) and status = 'active' and uploaded_by = (select auth.uid()));
-- Partners may only archive (or un-archive) their own organization's non-contract documents and
-- correct the title, note and dates; the house may change status on anything it can see.
create policy partner_documents_update on public.partner_documents for update to authenticated
  using ((kind = 'contract' and private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin']))
         or (kind <> 'contract' and (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin'])
                                     or private.can_add_document(organization_id, property_id, kind))))
  with check ((kind = 'contract' and private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin']))
         or (kind <> 'contract' and (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin'])
                                     or (status in ('active', 'archived') and private.can_add_document(organization_id, property_id, kind)))));
create policy partner_documents_delete on public.partner_documents for delete to authenticated
  using (private.is_jw(array['jw_admin', 'admin']));

revoke all on public.partner_documents from anon;
revoke insert, update, delete on public.partner_documents from authenticated;
grant select, delete on public.partner_documents to authenticated;
grant insert (organization_id, property_id, kind, title, storage_path, mime_type, size_bytes, effective_from, expires_on, note, uploaded_by)
  on public.partner_documents to authenticated;
-- Never the organization, kind or file: a document is re-filed by uploading again.
grant update (title, note, effective_from, expires_on, status) on public.partner_documents to authenticated;

-- ===== the private bucket and its object rules
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('partner-documents', 'partner-documents', false, 20971520,
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Read a file only through its register row (so the kind rules above decide).
create policy partner_documents_objects_select on storage.objects for select to authenticated
  using (bucket_id = 'partner-documents' and exists (
    select 1 from public.partner_documents d
    where d.storage_path = storage.objects.name and private.can_see_document(d.organization_id, d.property_id, d.kind)));
-- Upload into <org>/<kind>/ only where this person may add that kind for that organization.
-- (Property-scoped rules are re-checked when the register row is written.)
create policy partner_documents_objects_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'partner-documents'
    and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    and (storage.foldername(name))[2] in ('contract', 'commercial', 'supporting')
    and case (storage.foldername(name))[2]
          when 'contract' then private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin'])
          else private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin'])
               or private.is_org_member(((storage.foldername(name))[1])::uuid)
        end);
-- Files are never overwritten or deleted from the desk; only house admins remove them.
create policy partner_documents_objects_delete on storage.objects for delete to authenticated
  using (bucket_id = 'partner-documents' and private.is_jw(array['jw_admin', 'admin']));
