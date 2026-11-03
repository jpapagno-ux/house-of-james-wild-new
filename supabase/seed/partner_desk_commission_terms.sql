-- Partner Desk · Stage 2 · Commission terms seed (D-25, James, 3 Nov 2026). Preview branch first.
-- "MORE Collection is 20%. Kayumanis, I think, is 17%, but I need to check on that."
--   MORE Family Collection: 20%, whole partner, confirmed by James.
--   Kayumanis: 17% on the Kayumanis brand, TO CONFIRM against the signed agreement.
-- Start dates are 1 Jan 2026 until the signed agreements are filed in Documents; correct them then
-- by retiring the term and recording the dated one. Safe to run twice.
begin;
insert into public.commission_terms (organization_id, basis, rate_bp, effective_from, status, note)
select o.id, 'commission', 2000, '2026-01-01', 'confirmed', 'James, 3 Nov 2026: MORE Collection is 20%. Start date to match the signed agreement.'
from public.organizations o
where o.slug = 'more-family-collection'
  and not exists (select 1 from public.commission_terms t where t.organization_id = o.id and t.brand_id is null and t.property_id is null and t.status <> 'retired');

insert into public.commission_terms (organization_id, brand_id, basis, rate_bp, effective_from, status, note)
select b.organization_id, b.id, 'commission', 1700, '2026-01-01', 'to_confirm', 'James, 3 Nov 2026: "I think 17%, but I need to check." Confirm against the signed agreement.'
from public.brands b
where b.slug = 'kayumanis'
  and not exists (select 1 from public.commission_terms t where t.brand_id = b.id and t.status <> 'retired');
commit;

select o.name as partner, coalesce(b.name, p.name, 'whole partner') as applies_to, t.basis, t.rate_bp / 100.0 as rate_pct, t.status, t.effective_from
from public.commission_terms t
join public.organizations o on o.id = t.organization_id
left join public.brands b on b.id = t.brand_id
left join public.properties p on p.id = t.property_id
order by o.name;
