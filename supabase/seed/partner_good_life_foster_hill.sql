-- Partner Desk · The Good Life Bahamas and the Foster Hill collection (James, 4 Nov 2026). Idempotent.
-- Run as the database owner (Supabase SQL editor or MCP execute_sql), never from a browser.
--
--   • The Good Life Bahamas (PAR-000003): the rental manager and booking partner for Foster Hill,
--     Moriah Harbour, Great Exuma. Brand: The Good Life Bahamas.
--   • Foster Hill collection (parent) and its five houses, all draft, Gatherings first and Stays second,
--     PUBLIC_SOURCE (read from thegoodlifebahamasrentals.com on 4 Nov 2026) until the partner confirms.
--     New entities, so their IDs come from private.next_ledger_id('STY'); nothing is re-minted on a re-run.
--   • Contacts as published on their site, all to_verify. The team shares one inbox (rentals@).
--   • Content requests: photography, film, rates, terms, calendars, commission, billing, house details.
-- Ledger wording for the site (not stored here): "Partner vetted · Founder favourite".
-- Commercial model (recorded in Airtable Contract Terms, not here): rack rate, commission from it.
-- Nothing here publishes anything or touches Cloudinary or Airtable.

begin;

-- ===== organization and brand
insert into public.organizations (name, type, slug, partner_code, website, hq_country, phone, general_email, address, preferred_communication)
values ('The Good Life Bahamas', 'partner', 'the-good-life-bahamas', 'PAR-000003', 'https://www.thegoodlifebahamasrentals.com', 'BS',
  '+1 305 701 4133', 'rentals@thegoodlifebahamas.com', 'The Good Life Bahamas Realty, Ltd., 17 Montrose Avenue, Nassau, New Providence, The Bahamas', 'email')
on conflict (slug) do nothing;
select setval('private.partner_code_seq', greatest(3, (select coalesce(max(substr(partner_code, 5)::int), 0) from public.organizations where partner_code is not null)));

insert into public.brands (organization_id, name, slug, website)
select id, 'The Good Life Bahamas', 'the-good-life-bahamas', 'https://www.thegoodlifebahamasrentals.com' from public.organizations where slug = 'the-good-life-bahamas'
on conflict (slug) do nothing;

-- ===== destinations (draft reference rows; the Library issues DST IDs)
insert into public.destinations (slug, name, kind, country_code) values ('caribbean-mexico', 'Caribbean & Mexico', 'region', null)
on conflict (slug) do nothing;
insert into public.destinations (slug, name, kind, parent_id, country_code)
select 'bahamas', 'The Bahamas', 'country', id, 'BS' from public.destinations where slug = 'caribbean-mexico'
on conflict (slug) do nothing;
insert into public.destinations (slug, name, kind, parent_id, country_code)
select 'exuma', 'Exuma', 'area', id, 'BS' from public.destinations where slug = 'bahamas'
on conflict (slug) do nothing;
insert into public.destinations (slug, name, kind, parent_id, country_code)
select 'moriah-harbour', 'Moriah Harbour, Great Exuma', 'place', id, 'BS' from public.destinations where slug = 'exuma'
on conflict (slug) do nothing;

-- ===== Foster Hill: the collection, then the five houses
insert into public.properties (legacy_cms_id, name, slug, category, country, country_code, region, timezone, default_currency, publication_status,
  entity_type, entity_kind, stay_type, volume_key, brand_id, destination_id, provenance, external_ids)
select private.next_ledger_id('STY'), 'Foster Hill', 'foster-hill', 'villa', 'The Bahamas', 'BS', 'caribbean-mexico', 'America/Nassau', 'USD', 'draft',
  'property', 'collection', 'family_residence', 'gatherings',
  (select id from public.brands where slug = 'the-good-life-bahamas'), (select id from public.destinations where slug = 'moriah-harbour'), 'PUBLIC_SOURCE',
  '{"source_url": "https://www.thegoodlifebahamasrentals.com/foster-hill/"}'::jsonb
where not exists (select 1 from public.properties where slug = 'foster-hill');

insert into public.properties (legacy_cms_id, name, slug, category, country, country_code, region, timezone, default_currency, publication_status,
  entity_type, entity_kind, stay_type, volume_key, brand_id, destination_id, parent_property_id, provenance, external_ids)
select private.next_ledger_id('STY'), v.name, v.slug, 'villa', 'The Bahamas', 'BS', 'caribbean-mexico', 'America/Nassau', 'USD', 'draft',
  'villa', 'house', 'family_residence', 'gatherings',
  (select id from public.brands where slug = 'the-good-life-bahamas'), (select id from public.destinations where slug = 'moriah-harbour'),
  (select id from public.properties where slug = 'foster-hill'), 'PUBLIC_SOURCE',
  jsonb_build_object('source_url', 'https://www.thegoodlifebahamasrentals.com/property/' || v.src || '/', 'sleeps', v.sleeps, 'bedrooms', v.beds, 'bathrooms', v.baths)
from (values
  (1, 'Foxy Lady, Foster Hill', 'foster-hill-foxy-lady', 'foxy-lady', 16, 7, 8.5),
  (2, 'Marina House, Foster Hill', 'foster-hill-marina-house', 'marina-house', 12, 6, 6.5),
  (3, 'Ballymena, Foster Hill', 'foster-hill-ballymena', 'ballymena', 10, 5, 5.5),
  (4, 'Casa Bella, Foster Hill', 'foster-hill-casa-bella', 'casa-bella', 10, 5, 5.5),
  (5, 'Peeps Cottage, Foster Hill', 'foster-hill-peeps-cottage', 'peeps-cottage', 4, 2, 2.5)
) v(ord, name, slug, src, sleeps, beds, baths)
where not exists (select 1 from public.properties where slug = v.slug)
order by v.ord;

-- volumes: Gatherings first, Stays second
insert into public.entity_volumes (property_id, volume_key, is_primary)
select id, 'gatherings', true from public.properties where slug like 'foster-hill%' on conflict do nothing;
insert into public.entity_volumes (property_id, volume_key, is_primary)
select id, 'stays', false from public.properties where slug like 'foster-hill%' on conflict do nothing;

-- The Good Life manages and sells the houses for their owners: operator (primary) and booking partner.
insert into public.entity_partners (property_id, organization_id, role, is_primary)
select p.id, o.id, r.role, r.role = 'operator'
from public.properties p
cross join (values ('operator'), ('booking_partner')) r(role)
join public.organizations o on o.slug = 'the-good-life-bahamas'
where p.slug like 'foster-hill%'
on conflict do nothing;

-- ===== contacts (as published on thegoodlifebahamasrentals.com/our-team, 4 Nov 2026; all to verify)
insert into public.contacts (organization_id, first_name, last_name, title, email, whatsapp, country, timezone, roles, preferred_communication, trade_opt_in, status, notes)
select o.id, v.first, v.last, v.title, v.email, v.wa, 'BS', 'America/Nassau', v.roles::text[], 'email', true, 'to_verify', v.notes
from public.organizations o
cross join (values
  ('Mercedes', 'Zalduondo', 'B2B Customer Success', 'rentals@thegoodlifebahamas.com', null, '{trade_sales}', 'Likely partnership lead and Partner Desk administrator. Shared inbox on the site; ask for a direct address.'),
  ('Valentina', 'Ezeiza', 'Vacation Rentals Operations', 'rentals@thegoodlifebahamas.com', null, '{general_manager}', 'Leads the rentals operations team. Shared inbox on the site.'),
  ('Isaac', 'Mojica', 'Reservations and Guest Services', 'rentals@thegoodlifebahamas.com', '+1 305 924 6132', '{reservations}', 'Named by Foster Hill guests in reviews. WhatsApp is the rentals line on the site.'),
  ('Meibel', 'Ferrer', 'Reservations and Guest Services', 'rentals@thegoodlifebahamas.com', null, '{reservations}', null),
  ('Karen', 'Diaz', 'Reservations and Guest Services', 'rentals@thegoodlifebahamas.com', null, '{reservations}', null),
  ('Accounts', null, 'Billing and commission', null, null, '{finance,commission}', 'Not published. Requested in the 4 Nov 2026 follow-up: who pays commission, and how.')
) v(first, last, title, email, wa, roles, notes)
where o.slug = 'the-good-life-bahamas'
  and not exists (select 1 from public.contacts c where c.organization_id = o.id and c.first_name = v.first and c.title = v.title);

-- ===== content requests (only where the same request isn't already open)
insert into public.content_requests (organization_id, property_id, request_type, requested_item, instructions, priority, due_date)
select o.id, p.id, v.kind, v.item, v.instructions, v.priority, v.due::date
from (values
  ('foster-hill-foxy-lady', 'media', 'High-resolution photography', 'Originals 3000px or wider: exterior, pool, marina view, living spaces and every bedroom. No logo, minimal filtering. Confirm the credit line.', 'high', '2026-11-30'),
  ('foster-hill-marina-house', 'media', 'High-resolution photography', 'Originals 3000px or wider: exterior, the boat slip, pool and jacuzzi, living spaces and every bedroom. No logo. Confirm the credit line.', 'high', '2026-11-30'),
  ('foster-hill-ballymena', 'media', 'High-resolution photography', 'Originals 3000px or wider: the infinity pool and jacuzzi, the beach, living spaces and every bedroom. No logo. Confirm the credit line.', 'high', '2026-11-30'),
  ('foster-hill-casa-bella', 'media', 'High-resolution photography', 'Originals 3000px or wider: pool, jacuzzi, outdoor living, the beach and every bedroom. No logo. Confirm the credit line.', 'high', '2026-11-30'),
  ('foster-hill-peeps-cottage', 'media', 'High-resolution photography', 'Originals 3000px or wider: the infinity pool, the beach, the marina and both bedrooms. No logo. Confirm the credit line.', 'high', '2026-11-30'),
  ('foster-hill', 'media', 'Film and drone footage', 'Any video or drone footage of Foster Hill, the marina and Moriah Harbour. A 15-second vertical reel (9:16) is ideal.', 'normal', '2026-12-15'),
  ('foster-hill', 'commercial', 'Confirm 2026 to 2028 rates', 'Confirm the published seasonal rates for all five houses, and whether the five can be booked together as one Foster Hill buyout.', 'high', '2026-11-20'),
  ('foster-hill', 'commercial', 'Taxes, fees and policies', 'VAT and fees on top of the nightly rate (cleaning, service, security deposit); minimum stays by season; check-in and check-out; deposit schedule; cancellation policy.', 'high', '2026-11-20'),
  ('foster-hill', 'commercial', 'Commission agreement', 'We sell at your published rates. Please confirm 20% commission on the published rate for Foster Hill.', 'high', '2026-11-20'),
  ('foster-hill', 'commercial', 'Billing and commission contact', 'Who handles billing and commission payments, and how commission is paid.', 'high', '2026-11-20'),
  ('foster-hill', 'commercial', 'Availability calendar feeds', 'An iCal (or similar) feed for each house, so our dates stay current.', 'normal', '2026-11-30'),
  ('foster-hill', 'editorial', 'Bed configuration and locations', 'Bed setup for every bedroom in each house, and the GPS location of each house and the marina.', 'normal', '2026-11-30')
) v(slug, kind, item, instructions, priority, due)
join public.properties p on p.slug = v.slug
join public.entity_partners ep on ep.property_id = p.id and ep.is_primary
join public.organizations o on o.id = ep.organization_id
where not exists (select 1 from public.content_requests cr where cr.property_id = p.id and cr.requested_item = v.item and cr.status not in ('closed', 'cancelled'));

commit;

-- Summary
select o.partner_code, o.name as organization, p.legacy_cms_id, p.name as entity, p.entity_type, p.publication_status,
  (select count(*) from public.content_requests cr where cr.property_id = p.id) as requests
from public.properties p
join public.entity_partners ep on ep.property_id = p.id and ep.is_primary
join public.organizations o on o.id = ep.organization_id
where p.slug like 'foster-hill%'
order by p.legacy_cms_id;
