-- Partner Desk · Stage 1 seed (1 Nov 2026). Idempotent: safe to run again.
-- Run as the database owner (Supabase SQL editor or MCP execute_sql), never from a browser.
--
-- What it does (decisions D-01, D-06, D-13, D-14, D-16):
--   • James Wild & Co (internal), Kayumanis (PAR-000001) and MORE Family Collection
--     (PAR-000002) organizations; brands Kayumanis and Lion Sands.
--   • Destinations needed by these entities, all draft, no DST IDs (the Library issues those).
--   • Kayumanis: the three published Bali villas gain volume/destination/brand only
--     (names untouched; the Jimbaran rename goes through a revision). Sanur is added with
--     its Library Ledger ID STY-2026-000547; Nanjing and Yangshuo get Partner Desk IDs.
--     All three new ones are draft + PUBLIC_SOURCE until Kayumanis confirms them.
--   • Lion Sands: the reserve STY-2026-290658 stays the parent; four lodges, two
--     villas (named "Villa", James 1 Nov 2026) and three treehouses are draft child entities with Partner Desk IDs.
--     The 8 existing rooms and the 2027-V1 rate card stay on the reserve (Stage 2 moves them).
--   • QA identities: *.example.test only, created WITHOUT a password here. Passwords are set
--     separately and handed to James; they are never committed.
--   • Content requests and one placeholder contact per partner (status to_verify).
-- Nothing here publishes anything, changes a published name, or touches Cloudinary/Airtable.

begin;

-- ===== organizations and brands
insert into public.organizations (name, type, slug, website, hq_country, status)
values ('James Wild & Co', 'internal', 'james-wild-co', 'https://jameswildco.com', 'US', 'active')
on conflict (slug) do nothing;
insert into public.organizations (name, type, slug, partner_code, website, hq_country)
values ('Kayumanis Private Villa & Spa', 'partner', 'kayumanis', 'PAR-000001', 'https://www.kayumanis.com', 'ID')
on conflict (slug) do nothing;
insert into public.organizations (name, type, slug, partner_code, website, hq_country)
values ('MORE Family Collection', 'partner', 'more-family-collection', 'PAR-000002', 'https://www.more.co.za', 'ZA')
on conflict (slug) do nothing;
select setval('private.partner_code_seq', greatest(2, (select coalesce(max(substr(partner_code, 5)::int), 0) from public.organizations where partner_code is not null)));

insert into public.brands (organization_id, name, slug, website)
select id, 'Kayumanis', 'kayumanis', 'https://www.kayumanis.com' from public.organizations where slug = 'kayumanis'
on conflict (slug) do nothing;
insert into public.brands (organization_id, name, slug, website)
select id, 'Lion Sands', 'lion-sands', 'https://www.lionsands.com' from public.organizations where slug = 'more-family-collection'
on conflict (slug) do nothing;

-- ===== destinations (draft reference rows)
insert into public.destinations (slug, name, kind, country_code) values
  ('asia', 'Asia', 'region', null), ('africa', 'Africa', 'region', null)
on conflict (slug) do nothing;
insert into public.destinations (slug, name, kind, parent_id, country_code)
select v.slug, v.name, 'country', d.id, v.cc from (values ('indonesia', 'Indonesia', 'asia', 'ID'), ('china', 'China', 'asia', 'CN'), ('south-africa', 'South Africa', 'africa', 'ZA')) v(slug, name, parent, cc)
join public.destinations d on d.slug = v.parent
on conflict (slug) do nothing;
insert into public.destinations (slug, name, kind, parent_id, country_code)
select v.slug, v.name, 'area', d.id, v.cc from (values ('bali', 'Bali', 'indonesia', 'ID'), ('sabi-sand', 'Sabi Sand', 'south-africa', 'ZA')) v(slug, name, parent, cc)
join public.destinations d on d.slug = v.parent
on conflict (slug) do nothing;
insert into public.destinations (slug, name, kind, parent_id, country_code)
select v.slug, v.name, 'place', d.id, v.cc from (values
  ('jimbaran', 'Jimbaran', 'bali', 'ID'), ('nusa-dua', 'Nusa Dua', 'bali', 'ID'), ('ubud', 'Ubud', 'bali', 'ID'), ('sanur', 'Sanur', 'bali', 'ID'),
  ('nanjing', 'Nanjing', 'china', 'CN'), ('yangshuo', 'Yangshuo', 'china', 'CN')) v(slug, name, parent, cc)
join public.destinations d on d.slug = v.parent
on conflict (slug) do nothing;

-- ===== Kayumanis entities
update public.properties p set entity_type = 'property', volume_key = 'stays',
  brand_id = (select id from public.brands where slug = 'kayumanis'),
  destination_id = (select id from public.destinations where slug = x.dest),
  provenance = coalesce(p.provenance, 'SYSTEM_SYNC')
from (values ('kayumanis-jimbaran-private-estates', 'jimbaran'), ('kayumanis-nusa-dua', 'nusa-dua'), ('kayumanis-ubud', 'ubud')) x(slug, dest)
where p.slug = x.slug and (p.volume_key is null or p.brand_id is null or p.destination_id is null);

insert into public.properties (legacy_cms_id, name, slug, category, country, country_code, region, publication_status,
  entity_type, volume_key, brand_id, destination_id, provenance, external_ids)
select v.lid, v.name, v.slug, 'villa', v.country, v.cc, 'asia', 'draft', 'property', 'stays',
  (select id from public.brands where slug = 'kayumanis'), (select id from public.destinations where slug = v.dest), 'PUBLIC_SOURCE', '{}'::jsonb
from (values
  ('STY-2026-000547', 'Kayumanis Sanur Private Villa & Spa', 'kayumanis-sanur', 'Indonesia', 'ID', 'sanur')) v(lid, name, slug, country, cc, dest)
where not exists (select 1 from public.properties where slug = v.slug);

insert into public.properties (legacy_cms_id, name, slug, category, country, country_code, region, publication_status,
  entity_type, volume_key, brand_id, destination_id, provenance)
select private.next_ledger_id('STY'), v.name, v.slug, 'villa', 'China', 'CN', 'asia', 'draft', 'property', 'stays',
  (select id from public.brands where slug = 'kayumanis'), (select id from public.destinations where slug = v.dest), 'PUBLIC_SOURCE'
from (values ('Kayumanis Nanjing Private Villa & Spa', 'kayumanis-nanjing', 'nanjing'),
             ('Kayumanis Yangshuo Private Villa & Spa', 'kayumanis-yangshuo', 'yangshuo')) v(name, slug, dest)
where not exists (select 1 from public.properties where slug = v.slug)
order by v.slug;

-- ===== Lion Sands: parent reserve + children
update public.properties set entity_type = 'reserve', volume_key = 'safaris',
  brand_id = (select id from public.brands where slug = 'lion-sands'),
  destination_id = (select id from public.destinations where slug = 'sabi-sand'),
  provenance = coalesce(provenance, 'SYSTEM_SYNC'),
  external_ids = external_ids || '{"library_reserve": "RSV-2026-000006"}'::jsonb
where slug = 'lion-sands' and (volume_key is null or brand_id is null);

-- Villas, not residences (James, 1 Nov 2026). Renames the two rows a first run created;
-- Ledger IDs and Library links stay.
update public.properties set name = replace(name, ' Residence', ' Villa'),
  slug = replace(slug, '-residence', '-villa'), entity_type = 'villa', updated_at = now()
where slug in ('lion-sands-fish-eagle-residence', 'lion-sands-hinkwenu-residence');

insert into public.properties (legacy_cms_id, name, slug, category, country, country_code, region, publication_status,
  entity_type, entity_kind, volume_key, brand_id, destination_id, parent_property_id, provenance, external_ids)
select private.next_ledger_id('STY'), v.name, v.slug, v.category, 'South Africa', 'ZA', 'africa', 'draft', v.etype, v.ekind, 'safaris',
  (select id from public.brands where slug = 'lion-sands'), (select id from public.destinations where slug = 'sabi-sand'),
  (select id from public.properties where slug = 'lion-sands'), 'PUBLIC_SOURCE',
  case when v.camp is null then '{}'::jsonb else jsonb_build_object('library_camp', v.camp) end
from (values
  (1, 'Lion Sands River Lodge', 'lion-sands-river-lodge', 'lodge', 'lodge', null, 'river-lodge'),
  (2, 'Lion Sands Narina Lodge', 'lion-sands-narina-lodge', 'lodge', 'lodge', null, 'narina-lodge'),
  (3, 'Lion Sands Tinga Lodge', 'lion-sands-tinga-lodge', 'lodge', 'lodge', null, 'tinga-lodge'),
  (4, 'Lion Sands Ivory Lodge', 'lion-sands-ivory-lodge', 'lodge', 'lodge', null, 'ivory-lodge'),
  (5, 'Lion Sands Fish Eagle Villa', 'lion-sands-fish-eagle-villa', 'family_residence', 'villa', null, 'fish-eagle-residence'),
  (6, 'Lion Sands Hinkwenu Villa', 'lion-sands-hinkwenu-villa', 'family_residence', 'villa', null, 'hinkwenu-residence'),
  (7, 'Chalkley Treehouse', 'lion-sands-chalkley-treehouse', 'lodge', 'residence', 'treehouse', null),
  (8, 'Tinyeleti Treehouse', 'lion-sands-tinyeleti-treehouse', 'lodge', 'residence', 'treehouse', null),
  (9, 'Kingston Treehouse', 'lion-sands-kingston-treehouse', 'lodge', 'residence', 'treehouse', null)
) v(ord, name, slug, category, etype, ekind, camp)
where not exists (select 1 from public.properties where slug = v.slug)
order by v.ord;

-- volumes per entity (D-14): primary + the two villas also in Gatherings
insert into public.entity_volumes (property_id, volume_key, is_primary)
select id, volume_key, true from public.properties where volume_key is not null
  and (slug like 'kayumanis-%' or slug like 'lion-sands%')
on conflict do nothing;
insert into public.entity_volumes (property_id, volume_key, is_primary)
select id, 'gatherings', false from public.properties where slug in ('lion-sands-fish-eagle-villa', 'lion-sands-hinkwenu-villa')
on conflict do nothing;

-- ===== who is connected to what
insert into public.entity_partners (property_id, organization_id, role, is_primary)
select p.id, o.id, r.role, r.role = 'owner'
from public.properties p
cross join (values ('owner'), ('operator')) r(role)
join public.organizations o on o.slug = case when p.slug like 'kayumanis-%' then 'kayumanis' else 'more-family-collection' end
where p.slug like 'kayumanis-%' or p.slug like 'lion-sands%'
on conflict do nothing;

-- ===== QA identities (.test only; no password set here)
insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v.email, now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb, jsonb_build_object('first_name', v.first, 'last_name', v.last, 'qa', true), now(), now(),
  '', '', '', '', '', '', '', ''
from (values
  ('jw.admin@example.test', 'House', 'Editor (QA)'),
  ('kayumanis.admin@example.test', 'Kayumanis', 'Admin (QA)'),
  ('kayumanis.contrib@example.test', 'Kayumanis', 'Contributor (QA)'),
  ('more.admin@example.test', 'MORE', 'Admin (QA)')) v(email, first, last)
where not exists (select 1 from auth.users u where lower(u.email) = v.email);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, 'email', jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), null, now(), now()
from auth.users u
where u.email in ('jw.admin@example.test', 'kayumanis.admin@example.test', 'kayumanis.contrib@example.test', 'more.admin@example.test')
  and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');

insert into public.organization_memberships (user_id, organization_id, role, status)
select u.id, o.id, v.role, 'active'
from (values
  ('jw.admin@example.test', 'james-wild-co', 'jw_admin'),
  ('kayumanis.admin@example.test', 'kayumanis', 'partner_admin'),
  ('kayumanis.contrib@example.test', 'kayumanis', 'partner_contributor'),
  ('more.admin@example.test', 'more-family-collection', 'partner_admin')) v(email, org, role)
join auth.users u on u.email = v.email
join public.organizations o on o.slug = v.org
on conflict (user_id, organization_id, role) do nothing;

-- The Kayumanis contributor is narrowed to Ubud.
insert into public.entity_access (membership_id, property_id)
select m.id, p.id from public.organization_memberships m
join auth.users u on u.id = m.user_id and u.email = 'kayumanis.contrib@example.test'
join public.properties p on p.slug = 'kayumanis-ubud'
on conflict do nothing;

-- ===== content requests (only where the same request isn't already open)
insert into public.content_requests (organization_id, property_id, request_type, requested_item, instructions, priority, due_date)
select o.id, p.id, v.kind, v.item, v.instructions, v.priority, v.due::date
from (values
  ('kayumanis-jimbaran-private-estates', 'media', 'Hero exterior at dusk', 'Show the estate as the light goes: the road in, the gate, the first lamps. Original resolution, no logo, minimal filtering.', 'normal', '2026-12-15'),
  ('kayumanis-jimbaran-private-estates', 'media', '15-second vertical reel', '8–20 seconds, 9:16, natural movement, real sense of place. No embedded logo or text.', 'normal', '2027-01-15'),
  ('kayumanis-nusa-dua', 'media', 'Hero exterior at dusk', 'Show what changes at sunrise or dusk, not another empty lobby.', 'normal', '2026-12-15'),
  ('kayumanis-nusa-dua', 'media', '15-second vertical reel', '8–20 seconds, 9:16, natural movement, real people when appropriate.', 'normal', '2027-01-15'),
  ('kayumanis-ubud', 'media', 'Hero exterior at dusk', 'The valley edge as the light goes. Original resolution, no logo.', 'normal', '2026-12-15'),
  ('kayumanis-ubud', 'media', '15-second vertical reel', '8–20 seconds, 9:16, the walk from the gate to the pool.', 'normal', '2027-01-15'),
  ('kayumanis-sanur', 'editorial', 'Confirm property facts', 'We have drafted this villa from public sources. Please confirm villa count, pools, spa and beach access before we publish.', 'high', '2026-11-30'),
  ('kayumanis-nanjing', 'editorial', 'Confirm property facts', 'Drafted from public sources. Please confirm the name, villa count, and what sets it apart.', 'high', '2026-11-30'),
  ('kayumanis-yangshuo', 'editorial', 'Confirm property facts', 'Drafted from public sources. Please confirm the name, villa count, and what sets it apart.', 'high', '2026-11-30'),
  ('lion-sands-ivory-lodge', 'media', 'Ivory Lodge photography', 'We hold no Ivory Lodge images. Suites, the river deck and the walk from the vehicle; original resolution.', 'high', '2026-12-15'),
  ('lion-sands', 'media', '15-second vertical reel', 'One reel for the reserve: 8–20 seconds, 9:16, the river at first light.', 'normal', '2027-01-15'),
  ('lion-sands-river-lodge', 'commercial', 'Confirm 2027 rate sheet', 'Upload the 2027 STO rate sheet for River Lodge, with inclusions and taxes.', 'high', '2026-12-01'),
  ('lion-sands-narina-lodge', 'commercial', 'Confirm 2027 rate sheet', 'Upload the 2027 STO rate sheet for Narina Lodge, with inclusions and taxes.', 'high', '2026-12-01'),
  ('lion-sands-tinga-lodge', 'commercial', 'Confirm 2027 rate sheet', 'Upload the 2027 STO rate sheet for Tinga Lodge, with inclusions and taxes.', 'high', '2026-12-01'),
  ('lion-sands-ivory-lodge', 'commercial', 'Confirm 2027 rate sheet', 'Upload the 2027 STO rate sheet for Ivory Lodge, with inclusions and taxes.', 'high', '2026-12-01'),
  ('lion-sands-narina-lodge', 'editorial', 'Confirm location', 'Please confirm whether Narina sits in the Sabi Sand or on the Kruger National Park concession, so we file it correctly.', 'normal', '2026-12-01'),
  ('lion-sands-tinga-lodge', 'editorial', 'Confirm location', 'Please confirm whether Tinga sits in the Sabi Sand or on the Kruger National Park concession, so we file it correctly.', 'normal', '2026-12-01')
) v(slug, kind, item, instructions, priority, due)
join public.properties p on p.slug = v.slug
join public.entity_partners ep on ep.property_id = p.id and ep.is_primary
join public.organizations o on o.id = ep.organization_id
where not exists (select 1 from public.content_requests cr where cr.property_id = p.id and cr.requested_item = v.item and cr.status not in ('closed', 'cancelled'));

-- ===== placeholder contacts (to verify; no real people)
insert into public.contacts (organization_id, first_name, title, roles, status, notes)
select o.id, 'Reservations desk', 'Reservations', array['reservations'], 'to_verify', 'Placeholder from the Stage 1 seed. Replace with the real reservations contact.'
from public.organizations o
where o.slug in ('kayumanis', 'more-family-collection')
  and not exists (select 1 from public.contacts c where c.organization_id = o.id and c.first_name = 'Reservations desk');

commit;

-- Provenance summary (printed by the SQL editor)
select o.partner_code, o.name as organization, p.legacy_cms_id, p.name as entity, p.entity_type, coalesce(p.entity_kind, '') as kind,
  p.volume_key, p.publication_status, p.provenance, coalesce(par.legacy_cms_id, '') as parent
from public.entity_partners ep
join public.organizations o on o.id = ep.organization_id and ep.is_primary
join public.properties p on p.id = ep.property_id
left join public.properties par on par.id = p.parent_property_id
order by o.partner_code, par.legacy_cms_id nulls first, p.legacy_cms_id;
