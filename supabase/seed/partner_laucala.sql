-- Partner Desk · Laucala (James, 5 Nov 2026: "for Laucala... add them to the partner portal to get set up so I can confirm
-- everything with the team"). Idempotent. Run as the database owner (Supabase SQL editor or MCP execute_sql), never from a browser.
--
--   • LAUCALA Island Resort Pte Limited: the next partner code (PAR-000005 on live). Owner and operator of Laucala, a private
--     island in Cakaudrove, Vanua Levu, Fiji. Brand: Laucala.
--   • Laucala (STY-2026-000637 in the Library, published 5 Nov 2026), Stays and Gatherings, partner vetted. The Exceptional Few No. 015.
--   • Contacts as published on laucala.com (home and imprint, read 5 Nov 2026): departments only, all to_verify. James has a direct
--     relationship with the partner; his named contacts replace these once he shares them.
--   • Content requests: the villa list and bedroom configurations, originals (the site's images cap at 1366px), rates and commission,
--     Air Laucala details, the pin, a host, policies.
-- Nothing here publishes anything or touches Cloudinary or Airtable.

begin;

insert into public.organizations (name, type, slug, partner_code, website, hq_country, phone, general_email, address, preferred_communication)
select 'LAUCALA Island Resort Pte Limited', 'partner', 'laucala', private.next_partner_code(), 'https://www.laucala.com', 'FJ',
  '+679 888 0077', 'reservations@laucala.com', 'Cakaudrove, Vanua Levu, Fiji (invoices: PO Box 11479, Nadi Airport, Fiji)', 'email'
where not exists (select 1 from public.organizations where slug = 'laucala');

insert into public.brands (organization_id, name, slug, website)
select id, 'Laucala', 'laucala', 'https://www.laucala.com' from public.organizations where slug = 'laucala'
on conflict (slug) do nothing;

insert into public.destinations (slug, name, kind, country_code) values ('oceania', 'Oceania', 'region', null)
on conflict (slug) do nothing;
insert into public.destinations (slug, name, kind, parent_id, country_code)
select 'fiji', 'Fiji', 'country', id, 'FJ' from public.destinations where slug = 'oceania'
on conflict (slug) do nothing;
insert into public.destinations (slug, name, kind, parent_id, country_code)
select 'vanua-levu', 'Vanua Levu', 'area', id, 'FJ' from public.destinations where slug = 'fiji'
on conflict (slug) do nothing;

insert into public.properties (legacy_cms_id, name, slug, category, country, country_code, region, timezone, default_currency, publication_status,
  entity_type, entity_kind, stay_type, volume_key, brand_id, destination_id, provenance, external_ids)
select 'STY-2026-000637', 'Laucala', 'laucala', 'resort', 'Fiji', 'FJ', 'oceania', 'Pacific/Fiji', 'USD', 'published',
  'property', 'private_island', 'resort', 'stays',
  (select id from public.brands where slug = 'laucala'), (select id from public.destinations where slug = 'vanua-levu'), 'PUBLIC_SOURCE',
  '{"source_url": "https://www.laucala.com/", "villas": 24, "exceptional_few": "EF-015"}'::jsonb
where not exists (select 1 from public.properties where slug = 'laucala');

insert into public.entity_volumes (property_id, volume_key, is_primary)
select id, 'stays', true from public.properties where slug = 'laucala' on conflict do nothing;
insert into public.entity_volumes (property_id, volume_key, is_primary)
select id, 'gatherings', false from public.properties where slug = 'laucala' on conflict do nothing;

insert into public.entity_partners (property_id, organization_id, role, is_primary)
select p.id, o.id, r.role, r.role = 'operator'
from public.properties p
cross join (values ('operator'), ('owner')) r(role)
join public.organizations o on o.slug = 'laucala'
where p.slug = 'laucala'
on conflict do nothing;

insert into public.contacts (organization_id, first_name, last_name, title, email, mobile, country, timezone, roles, preferred_communication, trade_opt_in, status, notes)
select o.id, v.first, null, v.title, v.email, v.phone, 'FJ', 'Pacific/Fiji', v.roles::text[], 'email', true, 'to_verify', v.notes
from public.organizations o
cross join (values
  ('Reservations', 'Laucala reservations', 'reservations@laucala.com', null, '{reservations}', 'Published on laucala.com (read 5 Nov 2026). Department inbox; a named reservations lead comes from James.'),
  ('Welcome', 'Laucala general enquiries', 'welcome@laucala.com', '+679 888 0077', '{general_manager}', 'Published in the laucala.com imprint (read 5 Nov 2026).'),
  ('Accounts', 'Billing and commission', null, null, '{finance,commission}', 'Not published. Requested: who pays commission, and how.')
) v(first, title, email, phone, roles, notes)
where o.slug = 'laucala'
  and not exists (select 1 from public.contacts c where c.organization_id = o.id and c.first_name = v.first and c.title = v.title);

insert into public.content_requests (organization_id, property_id, request_type, requested_item, instructions, priority, due_date)
select o.id, p.id, v.kind, v.item, v.instructions, v.priority, v.due::date
from (values
  ('editorial', 'Villa list and bedroom configurations', 'The name, size and bedroom count of each of the 24 villas, which can connect for a family or group, and the largest residences for a whole-family gathering.', 'high', '2026-11-20'),
  ('media', 'High-resolution photography and film', 'Originals 3000px or wider (the website images reach 1366px): the island from the air, each villa type, the pools, dining, golf, horses, the reef and the team. No logo. Your film and any vertical 9:16 cut. Confirm the credit line.', 'high', '2026-11-30'),
  ('commercial', '2026 to 2028 rates', 'Rates by villa and season, what the inclusive rate covers, minimum stays, and Air Laucala fares or how flights are priced.', 'high', '2026-11-20'),
  ('commercial', 'Commission agreement', 'Please confirm our commission on the published rate for Laucala (or upload the signed agreement under Documents).', 'high', '2026-11-20'),
  ('commercial', 'Taxes, fees and policies', 'Taxes and fees on top of the rate, deposit schedule, cancellation, and the children policy.', 'high', '2026-11-20'),
  ('editorial', 'Arrival: Air Laucala and private jets', 'Where Air Laucala departs from, flight time and schedule, and the airstrip details for private jets.', 'normal', '2026-11-30'),
  ('editorial', 'Location pin and a host', 'The GPS location for the island and arrival point, and a named host travellers can meet on a short call before they book.', 'normal', '2026-11-30')
) v(kind, item, instructions, priority, due)
join public.properties p on p.slug = 'laucala'
join public.organizations o on o.slug = 'laucala'
where not exists (select 1 from public.content_requests cr where cr.property_id = p.id and cr.requested_item = v.item and cr.status not in ('closed', 'cancelled'));

commit;

select o.partner_code, o.name, p.legacy_cms_id, p.name as entity,
  (select count(*) from public.content_requests cr where cr.property_id = p.id) as requests,
  (select count(*) from public.contacts c where c.organization_id = o.id) as contacts
from public.organizations o
join public.entity_partners ep on ep.organization_id = o.id and ep.is_primary
join public.properties p on p.id = ep.property_id
where o.slug = 'laucala';
