-- Hosts on the Partner Desk (James, 4 Nov 2026: "Yes [the desk is the one place hosts are kept] and then they
-- show up live on the stay or voyage or overland or gathering or other Europe stays pages and even for the
-- exceptional few, so let's build this as a toggle in every partner portal dashboard").
--
-- host_pages: every page that can carry a "Meet your host" card, and the partner it belongs to. The page key
--   is the site's own: stay:<slug>, camp:<reserve>/<camp>, reserve:<slug>, voyage:<vessel>, trip:<id>.
-- site_hosts: who hosts each page. A partner proposes (or changes) a host; the house approves the details
--   (name, title, the line on the card, the photograph) before they reach a page. The partner then switches
--   the card on or off with one toggle, at once: hiding is always the partner's call, showing needs an
--   approved host. One live host per page.
-- public.site_host_cards: the only thing the website reads (anon): approved hosts that are switched on, and
--   pages the partner has switched off. Never contact details.

create table public.host_pages (
  page_key text primary key check (page_key ~ '^(stay|camp|reserve|voyage|trip):[a-z0-9/_-]{1,160}$'),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  label text not null check (char_length(label) between 1 and 160),
  volume text check (volume in ('stays', 'safaris', 'gatherings', 'voyages', 'europe', 'overland')),
  place text check (char_length(place) <= 120),
  created_at timestamptz not null default now()
);
create index host_pages_org_idx on public.host_pages (organization_id);

create table public.site_hosts (
  id uuid primary key default gen_random_uuid(),
  page_key text not null references public.host_pages (page_key) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  job_title text check (char_length(job_title) <= 120),
  company text check (char_length(company) <= 120),
  card_line text check (char_length(card_line) <= 200),          -- "Your host · Sales Manager, Londolozi"
  place text check (char_length(place) <= 120),
  tz text check (char_length(tz) <= 64),
  zone_label text check (char_length(zone_label) <= 80),
  seats integer not null default 6 check (seats between 1 and 12),
  photo_url text check (photo_url ~ '^https://'),
  photo_approved boolean not null default false,
  topics text[] not null default '{}' check (array_length(topics, 1) is null or array_length(topics, 1) <= 8),
  partner_note text check (char_length(partner_note) <= 1000),
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'declined', 'retired')),
  show_on_site boolean not null default false,
  proposed_by uuid references auth.users (id) on delete set null default auth.uid(),
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  review_note text check (char_length(review_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (show_on_site = false or status = 'approved')
);
create unique index site_hosts_one_live_idx on public.site_hosts (page_key) where status = 'approved';
create index site_hosts_org_idx on public.site_hosts (organization_id, status);
create trigger site_hosts_touch before update on public.site_hosts for each row execute function private.touch_updated_at();
create trigger audit_site_hosts after insert or update or delete on public.site_hosts for each row execute function private.audit_row();

-- Whose page it is; what a partner may change.
create or replace function private.site_hosts_guard() returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from public.host_pages p where p.page_key = new.page_key and p.organization_id = new.organization_id) then
    raise exception 'That page belongs to another partner' using errcode = '23514';
  end if;
  if new.contact_id is not null and not exists (select 1 from public.contacts c where c.id = new.contact_id and c.organization_id = new.organization_id) then
    raise exception 'Choose one of your own contacts' using errcode = '23514';
  end if;
  if current_user = 'authenticated' and not private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin']) then
    if tg_op = 'INSERT' then
      if new.status <> 'proposed' or new.show_on_site or new.photo_approved or new.decided_by is not null then
        raise exception 'A new host goes to the house first' using errcode = '42501';
      end if;
    elsif (new.page_key, new.organization_id, new.contact_id, new.name, new.job_title, new.company, new.card_line, new.place, new.tz,
           new.zone_label, new.seats, new.photo_url, new.photo_approved, new.topics, new.status, new.decided_by, new.decided_at, new.review_note)
          is distinct from
          (old.page_key, old.organization_id, old.contact_id, old.name, old.job_title, old.company, old.card_line, old.place, old.tz,
           old.zone_label, old.seats, old.photo_url, old.photo_approved, old.topics, old.status, old.decided_by, old.decided_at, old.review_note)
          and not (old.status = 'proposed' and new.status in ('proposed', 'retired') and new.decided_by is null and not new.photo_approved
                   and new.page_key = old.page_key and new.organization_id = old.organization_id) then
      -- once approved, details change only by a new proposal; a partner may withdraw (retire) their own proposal
      raise exception 'Send the change as a new proposal; the house approves host details' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
revoke execute on function private.site_hosts_guard() from public, anon, authenticated;
create trigger site_hosts_guard before insert or update on public.site_hosts for each row execute function private.site_hosts_guard();

-- Approving a host replaces the page's previous one (kept as retired, with its toggle carried over).
create or replace function public.decide_host(p_host uuid, p_action text, p_note text default null)
returns public.site_hosts language plpgsql security definer set search_path = '' as $$
declare h public.site_hosts; was boolean;
begin
  if not private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin']) then
    raise exception 'Only the house decides hosts' using errcode = '42501';
  end if;
  select * into h from public.site_hosts where id = p_host for update;
  if not found or h.status <> 'proposed' then raise exception 'Nothing to decide' using errcode = 'P0002'; end if;
  if p_action = 'approve' then
    select coalesce(bool_or(show_on_site), true) into was from public.site_hosts where page_key = h.page_key and status = 'approved';
    update public.site_hosts set status = 'retired', show_on_site = false where page_key = h.page_key and status = 'approved';
    update public.site_hosts set status = 'approved', show_on_site = was, decided_by = auth.uid(), decided_at = now(), review_note = p_note
      where id = h.id returning * into h;
  elsif p_action = 'decline' then
    update public.site_hosts set status = 'declined', decided_by = auth.uid(), decided_at = now(), review_note = p_note where id = h.id returning * into h;
  else
    raise exception 'approve or decline' using errcode = '22023';
  end if;
  return h;
end $$;
revoke execute on function public.decide_host(uuid, text, text) from public, anon;
grant execute on function public.decide_host(uuid, text, text) to authenticated;

alter table public.host_pages enable row level security;
alter table public.site_hosts enable row level security;
create policy host_pages_select on public.host_pages for select to authenticated
  using (private.is_jw() or private.is_org_member(organization_id));
create policy host_pages_write on public.host_pages for all to authenticated
  using (private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin'])) with check (private.is_jw(array['jw_admin', 'jw_portfolio_manager', 'admin']));
create policy site_hosts_select on public.site_hosts for select to authenticated
  using (private.is_jw() or private.is_org_member(organization_id));
create policy site_hosts_insert on public.site_hosts for insert to authenticated
  with check (private.is_jw() or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));
create policy site_hosts_update on public.site_hosts for update to authenticated
  using (private.is_jw() or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']))
  with check (private.is_jw() or private.is_org_member(organization_id, array['partner_admin', 'partner_manager']));
revoke all on public.host_pages, public.site_hosts from anon;
grant select, insert, update, delete on public.host_pages to authenticated;
grant select, insert, update on public.site_hosts to authenticated;

-- What the website reads: approved hosts switched on (state 'available'), and pages the partner switched off
-- ('not_linking': the house takes the call). Pages with nothing here keep the site's own default.
create or replace view public.site_host_cards with (security_invoker = false) as
  select p.page_key, 'available'::text as state, h.name, h.card_line, h.place, h.tz, h.zone_label, h.seats,
         case when h.photo_approved then h.photo_url end as photo_url, h.topics, h.updated_at
  from public.site_hosts h join public.host_pages p on p.page_key = h.page_key
  where h.status = 'approved' and h.show_on_site
  union all
  select p.page_key, 'not_linking', null, null, null, null, null, null, null, '{}'::text[], h.updated_at
  from public.site_hosts h join public.host_pages p on p.page_key = h.page_key
  where h.status = 'approved' and not h.show_on_site;
revoke all on public.site_host_cards from public;
grant select on public.site_host_cards to anon, authenticated;
