-- Hosts on the Partner Desk: the pages each partner hosts, and the hosts already live on the website
-- (James, 4 Nov 2026). Matt Smith hosts every Lion Sands and MORE page "until they approve the other hosts
-- per lodge". Re-runnable: pages upsert; a host is added only where the page has no approved host yet.
-- Partners are matched by code where the code is the same everywhere (Kayumanis PAR-000001, MORE PAR-000002)
-- and by name for Leeu: on live PAR-000003 is The Good Life Bahamas, and Leeu gets its code when it is created.
with org as (
  select id, partner_code as code from public.organizations where partner_code in ('PAR-000001', 'PAR-000002')
  union all
  select id, 'LEEU' from public.organizations where type = 'partner' and name = 'Leeu Collection'
)
insert into public.host_pages (page_key, organization_id, property_id, label, volume, place)
select x.page_key, org.id, p.id, x.label, x.volume, x.place
from (values
  ('PAR-000002', 'reserve:lion-sands', 'lion-sands', 'Lion Sands (reserve page)', 'safaris', 'Sabi Sand'),
  ('PAR-000002', 'stay:lion-sands', 'lion-sands', 'Lion Sands Reserve', 'safaris', 'Sabi Sand'),
  ('PAR-000002', 'camp:lion-sands/ivory-lodge', null, 'Ivory Lodge', 'safaris', 'Sabi Sand'),
  ('PAR-000002', 'camp:lion-sands/river-lodge', null, 'River Lodge', 'safaris', 'Sabi Sand'),
  ('PAR-000002', 'camp:lion-sands/narina-lodge', null, 'Narina Lodge', 'safaris', 'Sabi Sand'),
  ('PAR-000002', 'camp:lion-sands/tinga-lodge', null, 'Tinga Lodge', 'safaris', 'Kruger'),
  ('PAR-000002', 'camp:lion-sands/fish-eagle-residence', null, 'Fish Eagle Residence', 'gatherings', 'Sabi Sand'),
  ('PAR-000002', 'camp:lion-sands/hinkwenu-residence', null, 'Hinkwenu Residence', 'gatherings', 'Sabi Sand'),
  ('PAR-000002', 'stay:monwana-thornybush', 'monwana-thornybush', 'Monwana', 'safaris', 'Thornybush'),
  ('PAR-000002', 'stay:marataba', 'marataba', 'Marataba', 'safaris', 'Marakele'),
  ('PAR-000002', 'stay:cape-cadogan-boutique-hotel', 'cape-cadogan-boutique-hotel', 'Cape Cadogan', 'stays', 'Cape Town'),
  ('PAR-000001', 'stay:kayumanis-ubud', 'kayumanis-ubud', 'Kayumanis Ubud', 'stays', 'Ubud'),
  ('PAR-000001', 'stay:kayumanis-nusa-dua', 'kayumanis-nusa-dua', 'Kayumanis Nusa Dua', 'stays', 'Nusa Dua'),
  ('PAR-000001', 'stay:kayumanis-jimbaran-private-estates', 'kayumanis-jimbaran-private-estates', 'Kayumanis Jimbaran', 'stays', 'Jimbaran'),
  ('LEEU', 'stay:leeu-estates', 'leeu-estates', 'Leeu Estates', 'stays', 'Franschhoek'),
  ('LEEU', 'stay:leeu-house', 'leeu-house', 'Leeu House', 'stays', 'Franschhoek'),
  ('LEEU', 'stay:le-quartier-francais', 'le-quartier-francais', 'Le Quartier Français', 'stays', 'Franschhoek')
) as x(code, page_key, slug, label, volume, place)
join org on org.code = x.code
left join public.properties p on p.slug = x.slug
on conflict (page_key) do update set organization_id = excluded.organization_id, label = excluded.label, volume = excluded.volume, place = excluded.place,
  property_id = coalesce(excluded.property_id, public.host_pages.property_id);

insert into public.site_hosts (page_key, organization_id, name, job_title, company, card_line, place, tz, zone_label, seats, status, show_on_site, decided_at, review_note, proposed_by)
select hp.page_key, hp.organization_id, 'Matthew Christopher Smith', 'International Sales Manager', 'MORE Collection',
       'Your host · International Sales Manager, MORE Collection', 'Johannesburg', 'Africa/Johannesburg', 'South Africa Standard Time (UTC+2)', 6,
       'approved', true, now(), 'James, 4 Nov 2026: Matt on every Lion Sands and MORE page until MORE approves a host per lodge.', null
from public.host_pages hp join public.organizations o on o.id = hp.organization_id
where o.partner_code = 'PAR-000002'
  and not exists (select 1 from public.site_hosts h where h.page_key = hp.page_key and h.status = 'approved');
