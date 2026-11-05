-- Airtable copy of the Partner Desk (D-07, James 1 Nov 2026: "your suggestions"; built 5 Nov 2026).
--
-- One way, Supabase to Airtable, a copy only: base "James Wild & Co · Partner Network" (Organizations,
-- Contacts, Requests, Submissions, Rate sheets, Sync Log). The daily job /api/cron/partner-mirror calls
-- this function, then upserts each row into Airtable on "Desk ID". Nothing is ever read back.
--
-- What is copied: partner organizations (not the house's own), their contacts, content requests,
-- submissions with their change count, and commercial documents (rate sheets). Not copied: contracts
-- (D-23: partner admins and house admins only), banking details, passwords or anything from auth, and
-- QA accounts (.test addresses). service_role only.

create or replace function public.partner_mirror_snapshot()
returns jsonb language sql stable security definer set search_path = '' as $$
  with orgs as (
    select o.* from public.organizations o where o.type <> 'internal'
  ), per_stay as (
    select ep.organization_id, p.name, string_agg(replace(ep.role, '_', ' ') || case when ep.is_primary then ' (primary)' else '' end, ', ' order by ep.is_primary desc, ep.role) as roles
    from public.entity_partners ep join public.properties p on p.id = ep.property_id group by ep.organization_id, p.name
  ), stays as (
    select organization_id, string_agg(name || ': ' || roles, E'\n' order by name) as list from per_stay group by organization_id
  )
  select jsonb_build_object(
    'organizations', coalesce((select jsonb_agg(jsonb_build_object(
        'id', o.id, 'name', o.name, 'partner_code', o.partner_code, 'type', o.type, 'status', o.status,
        'website', o.website, 'general_email', o.general_email, 'phone', o.phone, 'hq_country', o.hq_country,
        'address', o.address, 'preferred_communication', o.preferred_communication, 'stays', s.list,
        'desk_users', (select count(*) from public.organization_memberships m join auth.users u on u.id = m.user_id
                        where m.organization_id = o.id and m.status = 'active' and u.email not like '%.test'),
        'open_requests', (select count(*) from public.content_requests r where r.organization_id = o.id and r.status in ('open', 'changes_requested')),
        'created_at', o.created_at) order by o.name)
      from orgs o left join stays s on s.organization_id = o.id), '[]'),
    'contacts', coalesce((select jsonb_agg(jsonb_build_object(
        'id', c.id, 'first_name', c.first_name, 'last_name', c.last_name, 'partner', o.name, 'partner_code', o.partner_code,
        'title', c.title, 'roles', c.roles, 'email', c.email, 'mobile', c.mobile, 'whatsapp', c.whatsapp,
        'country', c.country, 'timezone', c.timezone, 'languages', c.languages,
        'stays', (select string_agg(p.name, E'\n' order by p.name) from public.contact_entities ce join public.properties p on p.id = ce.property_id where ce.contact_id = c.id),
        'preferred_communication', c.preferred_communication, 'newsletter', c.newsletter_opt_in, 'trade', c.trade_opt_in,
        'status', c.status, 'last_verified_at', c.last_verified_at) order by o.name, c.last_name)
      from public.contacts c join orgs o on o.id = c.organization_id where coalesce(c.email, '') not like '%.test'), '[]'),
    'requests', coalesce((select jsonb_agg(jsonb_build_object(
        'id', r.id, 'reference', r.reference, 'partner', o.name, 'stay', p.name, 'type', r.request_type,
        'item', r.requested_item, 'instructions', r.instructions, 'priority', r.priority, 'due', r.due_date,
        'status', r.status, 'created_at', r.created_at) order by r.created_at)
      from public.content_requests r join orgs o on o.id = r.organization_id left join public.properties p on p.id = r.property_id), '[]'),
    'submissions', coalesce((select jsonb_agg(jsonb_build_object(
        'id', s.id, 'reference', s.reference, 'partner', o.name, 'stay', p.name, 'kind', s.kind, 'title', s.title,
        'partner_note', s.partner_note, 'changes', (select count(*) from public.revisions v where v.submission_id = s.id),
        'status', s.status, 'submitted_at', s.submitted_at, 'decided_at', s.decided_at, 'jw_note', s.jw_note) order by s.created_at)
      from public.submissions s join orgs o on o.id = s.organization_id left join public.properties p on p.id = s.property_id), '[]'),
    'rate_sheets', coalesce((select jsonb_agg(jsonb_build_object(
        'id', d.id, 'title', d.title, 'partner', o.name, 'stay', p.name, 'kind', d.kind,
        'effective_from', d.effective_from, 'expires_on', d.expires_on, 'status', d.status, 'created_at', d.created_at) order by d.created_at)
      from public.partner_documents d join orgs o on o.id = d.organization_id left join public.properties p on p.id = d.property_id
      where d.kind = 'commercial'), '[]'));
$$;
revoke all on function public.partner_mirror_snapshot() from public, anon, authenticated;
grant execute on function public.partner_mirror_snapshot() to service_role;
