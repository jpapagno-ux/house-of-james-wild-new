-- Partner Desk · Leeu Collection (James, 5 Nov 2026: "make sure Leeu is set up in the partner section; they're our
-- next link and population for the partner portal"). Idempotent. Run as the database owner, never from a browser.
--
--   • Leeu Collection: the next partner code (PAR-000004 on live; PAR-000003 is The Good Life Bahamas).
--     Owner and operator of its three Franschhoek houses already in the Library: Leeu Estates (STY-2026-000148),
--     Leeu House (STY-2026-000149) and Le Quartier Français (STY-2026-000145). James stayed at and vetted all
--     three in May 2026. Brand: Leeu Collection.
--   • Commission: 20% across the collection, confirmed by James on 3 Nov 2026. It is kept in Airtable Partner
--     Brands (D-31) and reaches the desk with the Stage 2 commission sync; once this runs, the partner code is
--     written into that row.
--   • Contacts as published on leeucollection.com (Leeu House and Leeu Estates FAQ pages, read 5 Nov 2026):
--     departments only, no named people, all to_verify. Named contacts come from James's contacts sheet.
--   • Content requests: the 2027 rates (the card in Airtable is sample data), named contacts, a host for each
--     house, photography and policies.
-- Nothing here publishes anything or touches Cloudinary or Airtable.

begin;

insert into public.organizations (name, type, slug, partner_code, website, hq_country, phone, general_email, address, preferred_communication)
select 'Leeu Collection', 'partner', 'leeu-collection', private.next_partner_code(), 'https://leeucollection.com', 'ZA',
  '+27 21 492 2222', 'reservations@leeucollection.com', '12 Huguenot Street, Franschhoek, South Africa (Leeu House)', 'email'
where not exists (select 1 from public.organizations where slug = 'leeu-collection');

insert into public.brands (organization_id, name, slug, website)
select id, 'Leeu Collection', 'leeu-collection', 'https://leeucollection.com' from public.organizations where slug = 'leeu-collection'
on conflict (slug) do nothing;

update public.properties set brand_id = (select id from public.brands where slug = 'leeu-collection')
where slug in ('leeu-estates', 'leeu-house', 'le-quartier-francais') and brand_id is null;

insert into public.entity_volumes (property_id, volume_key, is_primary)
select id, 'stays', true from public.properties where slug in ('leeu-estates', 'leeu-house', 'le-quartier-francais')
on conflict do nothing;

-- Leeu owns and runs the houses: owner and operator (primary).
insert into public.entity_partners (property_id, organization_id, role, is_primary)
select p.id, o.id, r.role, r.role = 'operator'
from public.properties p
cross join (values ('operator'), ('owner')) r(role)
join public.organizations o on o.slug = 'leeu-collection'
where p.slug in ('leeu-estates', 'leeu-house', 'le-quartier-francais')
on conflict do nothing;

insert into public.contacts (organization_id, first_name, last_name, title, email, mobile, country, timezone, roles, preferred_communication, trade_opt_in, status, notes)
select o.id, v.first, null, v.title, v.email, v.phone, 'ZA', 'Africa/Johannesburg', v.roles::text[], 'email', true, 'to_verify', v.notes
from public.organizations o
cross join (values
  ('Reservations', 'Leeu Collection reservations', 'reservations@leeucollection.com', '+27 21 492 2222', '{reservations}', 'Published on leeucollection.com (read 5 Nov 2026). Department line; a named reservations lead comes from James.'),
  ('Leeu Estates reception', 'Reception, Leeu Estates', 'reception.leeuestates@leeucollection.com', '+27 21 492 5988', '{reservations}', 'Published on leeucollection.com (read 5 Nov 2026).')
) v(first, title, email, phone, roles, notes)
where o.slug = 'leeu-collection'
  and not exists (select 1 from public.contacts c where c.organization_id = o.id and c.email = v.email);

insert into public.content_requests (organization_id, property_id, request_type, requested_item, instructions, priority, due_date)
select o.id, p.id, v.kind, v.item, v.instructions, v.priority, v.due::date
from (values
  ('leeu-estates', 'commercial', '2027 rates', 'The 2027 rate sheet for Leeu Estates, Leeu House and Le Quartier Français: seasons, room types, what the rate includes, and whether the rates are rack or net.', 'high', '2026-11-30'),
  ('leeu-estates', 'commercial', 'Commission in writing', 'We have 20% across the collection. Please confirm it in writing (or upload the signed agreement under Documents) so the desk can show it as confirmed.', 'high', '2026-11-30'),
  ('leeu-estates', 'editorial', 'Named contacts', 'Your sales, reservations, marketing and accounts contacts by name, so the right person receives each request.', 'high', '2026-11-20'),
  ('leeu-estates', 'editorial', 'A host for each house', 'Who should travellers meet on a short group call before they book: a name and job title for Leeu Estates, Leeu House and Le Quartier Français. You can add them under Hosts once it is live.', 'normal', '2026-11-30'),
  ('leeu-house', 'commercial', 'Cancellation and children', 'Your cancellation and refund terms, and your children policy, for each house.', 'normal', '2026-11-30'),
  ('le-quartier-francais', 'media', 'High-resolution photography', 'Originals 3000px or wider: the rooms, the courtyard and pool, the village street and food. No logo, minimal filtering. Confirm the credit line.', 'normal', '2026-12-15')
) v(slug, kind, item, instructions, priority, due)
join public.properties p on p.slug = v.slug
join public.organizations o on o.slug = 'leeu-collection'
where not exists (select 1 from public.content_requests cr where cr.property_id = p.id and cr.requested_item = v.item and cr.status not in ('closed', 'cancelled'));

commit;

select o.partner_code, o.name, p.legacy_cms_id, p.name as entity,
  (select count(*) from public.content_requests cr where cr.property_id = p.id) as requests
from public.organizations o
join public.entity_partners ep on ep.organization_id = o.id and ep.is_primary
join public.properties p on p.id = ep.property_id
where o.slug = 'leeu-collection' order by p.legacy_cms_id;
