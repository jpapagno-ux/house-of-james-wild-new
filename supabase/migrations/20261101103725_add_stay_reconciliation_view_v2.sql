create or replace view public.stay_reconciliation_status
with (security_invoker = true) as
select
  p.id as property_id,
  p.legacy_cms_id as stay_ledger_id,
  p.slug,
  p.name,
  p.country,
  p.category,
  p.booking_mode,
  p.rate_source,
  p.pricing_mode,
  p.rate_status,
  p.availability_mode,
  p.hero_media_id,
  coalesce(array_length(p.gallery_media_ids, 1), 0) as gallery_media_count,
  count(distinct rt.id) as room_type_count,
  count(distinct rp.id) as rate_plan_count,
  count(distinct srr.id) as seasonal_rule_count,
  count(distinct pr.id) as promotion_count,
  (count(distinct rt.id) > 0) as has_room_types,
  (count(distinct rp.id) > 0 or count(distinct srr.id) > 0) as has_pricing_records,
  (p.hero_media_id is not null or coalesce(array_length(p.gallery_media_ids, 1), 0) > 0) as has_media_links
from public.properties p
left join public.room_types rt on rt.property_id = p.id and rt.active = true
left join public.rate_plans rp on rp.room_type_id = rt.id and rp.active = true
left join public.seasonal_rate_rules srr on srr.rate_plan_id = rp.id and srr.active = true
left join public.rate_card_versions rcv on rcv.property_id = p.id
left join public.promotions pr on pr.rate_card_version_id = rcv.id
group by p.id, p.legacy_cms_id, p.slug, p.name, p.country, p.category, p.booking_mode, p.rate_source, p.pricing_mode, p.rate_status, p.availability_mode, p.hero_media_id, p.gallery_media_ids;
