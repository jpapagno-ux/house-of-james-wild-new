-- Partner Desk · Stage 2 · Commission terms seed (D-25, James, 3 Nov 2026). Preview branch first.
-- James, 3 Nov 2026: "commissions vary by brand ... Kayumanis is 17% ... Leeu Estates, Leeu House and
-- Le Quartier Français is always one group under Leeu, and that commission is 20%. MORE, Lion Sands,
-- and all of their properties and lodges and homes are at 20%."
--   MORE Family Collection   20%  whole partner (Lion Sands and every lodge, villa and home)  confirmed
--   Kayumanis                17%  Kayumanis brand                                             confirmed
--   Leeu Collection          20%  whole partner (Leeu Estates, Leeu House, Le Quartier Français) confirmed
-- Start dates are 1 Jan 2026 until the signed agreements are filed in Documents; correct a date by
-- retiring the term and recording the dated one. Safe to run twice.
begin;

-- ===== Leeu Collection: the partner, its brand and its three Franschhoek properties
insert into public.organizations (name, type, slug, partner_code, website, hq_country)
select 'Leeu Collection', 'partner', 'leeu-collection', private.next_partner_code(), 'https://www.leeucollection.com', 'ZA'
where not exists (select 1 from public.organizations where slug = 'leeu-collection');
insert into public.brands (organization_id, name, slug, website)
select id, 'Leeu Collection', 'leeu-collection', 'https://www.leeucollection.com' from public.organizations where slug = 'leeu-collection'
on conflict (slug) do nothing;

-- The properties already exist on live with their Library Ledger IDs (lib/content/stays.json),
-- carried verbatim, never minted (D-20). Only a database without them (the preview branch) gets them.
insert into public.properties (legacy_cms_id, name, slug, category, country, region, publication_status)
select v.lid, v.name, v.slug, 'hotel', 'South Africa', 'africa', 'published'
from (values ('STY-2026-000145', 'Le Quartier Francais South Africa', 'le-quartier-francais'),
             ('STY-2026-000148', 'Leeu Estates Franschhoek', 'leeu-estates'),
             ('STY-2026-000149', 'Leeu House South Africa', 'leeu-house')) v(lid, name, slug)
where not exists (select 1 from public.properties p where p.slug = v.slug or p.legacy_cms_id = v.lid);
update public.properties p set brand_id = b.id, country_code = coalesce(p.country_code, 'ZA'),
  entity_type = coalesce(p.entity_type, 'property'), volume_key = coalesce(p.volume_key, 'stays')
from public.brands b
where b.slug = 'leeu-collection' and p.slug in ('le-quartier-francais', 'leeu-estates', 'leeu-house') and p.brand_id is distinct from b.id;
insert into public.entity_partners (property_id, organization_id, role, is_primary)
select p.id, o.id, 'owner', true
from public.properties p, public.organizations o
where o.slug = 'leeu-collection' and p.slug in ('le-quartier-francais', 'leeu-estates', 'leeu-house')
  and not exists (select 1 from public.entity_partners ep where ep.property_id = p.id and ep.organization_id = o.id);

-- ===== the terms
insert into public.commission_terms (organization_id, basis, rate_bp, effective_from, status, note)
select o.id, 'commission', v.bp, '2026-01-01', 'confirmed', v.note
from (values ('more-family-collection', 2000, 'James, 3 Nov 2026: MORE, Lion Sands and all of their properties, lodges and homes are 20%. Start date to match the signed agreement.'),
             ('leeu-collection', 2000, 'James, 3 Nov 2026: Leeu Estates, Leeu House and Le Quartier Français are one group under Leeu, always 20%. Start date to match the signed agreement.')) v(slug, bp, note)
join public.organizations o on o.slug = v.slug
where not exists (select 1 from public.commission_terms t where t.organization_id = o.id and t.brand_id is null and t.property_id is null and t.status <> 'retired');

insert into public.commission_terms (organization_id, brand_id, basis, rate_bp, effective_from, status, note)
select b.organization_id, b.id, 'commission', 1700, '2026-01-01', 'confirmed', 'James, 3 Nov 2026: Kayumanis is 17%. Start date to match the signed agreement.'
from public.brands b
where b.slug = 'kayumanis'
  and not exists (select 1 from public.commission_terms t where t.brand_id = b.id and t.status <> 'retired');
-- The first seed recorded Kayumanis as "to confirm"; James confirmed 17% on 3 Nov 2026.
update public.commission_terms t set status = 'confirmed', note = 'James, 3 Nov 2026: Kayumanis is 17%. Start date to match the signed agreement.'
from public.brands b
where b.slug = 'kayumanis' and t.brand_id = b.id and t.rate_bp = 1700 and t.status = 'to_confirm';
commit;

select o.name as partner, coalesce(b.name, p.name, 'whole partner') as applies_to, t.basis, t.rate_bp / 100.0 as rate_pct, t.status, t.effective_from
from public.commission_terms t
join public.organizations o on o.id = t.organization_id
left join public.brands b on b.id = t.brand_id
left join public.properties p on p.id = t.property_id
order by o.name;
