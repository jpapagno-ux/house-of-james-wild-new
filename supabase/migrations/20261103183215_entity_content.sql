-- Partner Desk · Stage 2 · Property content (plan §3.1, step 2/3; James approved Stage 2, 2 Nov 2026)
--
-- Partners propose content for their properties; house editors approve, edit or return each
-- field through the existing revision flow (public.decide_revision). Approved content lands in
-- public.entity_content; the publish run (D-18 A) carries it to the Library and the site.
-- Partners never write this table directly, and never reach James Wild editorial copy
-- (tagline, quote, why we chose it, founder notes), Pathways or SEO.
-- Only adds: a table, whitelist rows and a widened revision_prepare().

create table public.entity_content (
  id uuid primary key references public.properties (id) on delete cascade,   -- = the property
  overview text check (char_length(overview) <= 2000),
  nearest_airport text check (char_length(nearest_airport) <= 160),
  getting_there text check (char_length(getting_there) <= 1200),
  best_months text check (char_length(best_months) <= 160),
  features jsonb check (features is null or (jsonb_typeof(features) = 'array' and jsonb_array_length(features) <= 30)),
  experiences jsonb check (experiences is null or (jsonb_typeof(experiences) = 'array' and jsonb_array_length(experiences) <= 30)),
  inclusions jsonb check (inclusions is null or (jsonb_typeof(inclusions) = 'array' and jsonb_array_length(inclusions) <= 30)),
  exclusions jsonb check (exclusions is null or (jsonb_typeof(exclusions) = 'array' and jsonb_array_length(exclusions) <= 30)),
  children_policy text check (char_length(children_policy) <= 800),
  sustainability text check (char_length(sustainability) <= 1500),
  conservation text check (char_length(conservation) <= 1500),
  community text check (char_length(community) <= 1500),
  published_at timestamptz,          -- set by the publish run when this content reaches the Library
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger entity_content_touch before update on public.entity_content for each row execute function private.touch_updated_at();
create trigger audit_entity_content after insert or update or delete on public.entity_content for each row execute function private.audit_row();

alter table public.entity_content enable row level security;
create policy entity_content_select on public.entity_content for select to authenticated using (private.can_see_entity(id));
revoke all on public.entity_content from anon, authenticated;
grant select on public.entity_content to authenticated;
-- No insert/update grants: values arrive only through decide_revision (security definer).

insert into private.revision_fields (target_table, field, label) values
  ('entity_content', 'overview', 'About the property'),
  ('entity_content', 'nearest_airport', 'Nearest airport'),
  ('entity_content', 'getting_there', 'Getting there'),
  ('entity_content', 'best_months', 'Best months'),
  ('entity_content', 'features', 'Features'),
  ('entity_content', 'experiences', 'Experiences'),
  ('entity_content', 'inclusions', 'Included in the rate'),
  ('entity_content', 'exclusions', 'Not included'),
  ('entity_content', 'children_policy', 'Children'),
  ('entity_content', 'sustainability', 'Sustainability'),
  ('entity_content', 'conservation', 'Conservation'),
  ('entity_content', 'community', 'Community')
on conflict do nothing;

-- revision_prepare, now also for entity_content: the content row is created empty on the first
-- proposal (so the reviewer's "before" is the true stored value), and list fields must be
-- arrays of short strings, text fields strings.
create or replace function private.revision_prepare()
returns trigger language plpgsql security definer set search_path = '' as $$
declare cur jsonb; owner_prop uuid;
begin
  if not exists (select 1 from private.revision_fields f where f.target_table = new.target_table and f.field = new.field) then
    raise exception 'field %.% cannot be changed through the desk', new.target_table, new.field using errcode = '42501';
  end if;
  if new.target_table = 'properties' then
    owner_prop := new.target_id;
    execute format('select to_jsonb(t) -> %L from public.properties t where t.id = $1', new.field) into cur using new.target_id;
  elsif new.target_table = 'room_types' then
    select property_id into owner_prop from public.room_types where id = new.target_id;
    execute format('select to_jsonb(t) -> %L from public.room_types t where t.id = $1', new.field) into cur using new.target_id;
  elsif new.target_table = 'entity_content' then
    select id into owner_prop from public.properties where id = new.target_id;
    if owner_prop is not null then
      insert into public.entity_content (id) values (owner_prop) on conflict (id) do nothing;
      execute format('select to_jsonb(t) -> %L from public.entity_content t where t.id = $1', new.field) into cur using new.target_id;
    end if;
    if new.field in ('features', 'experiences', 'inclusions', 'exclusions') then
      if jsonb_typeof(new.proposed_value) <> 'array' or jsonb_array_length(new.proposed_value) not between 1 and 30
         or exists (select 1 from jsonb_array_elements(new.proposed_value) e where jsonb_typeof(e) <> 'string' or char_length(e #>> '{}') not between 1 and 300) then
        raise exception 'a list needs 1 to 30 lines of up to 300 characters' using errcode = '23514';
      end if;
    elsif jsonb_typeof(new.proposed_value) <> 'string' then
      raise exception 'this field takes text' using errcode = '23514';
    end if;
  end if;
  if owner_prop is null then raise exception 'revision target not found' using errcode = '23503'; end if;
  if not exists (select 1 from public.submissions s where s.id = new.submission_id and s.property_id = owner_prop) then
    raise exception 'revision must belong to a submission for the same entity' using errcode = '23514';
  end if;
  new.property_id := owner_prop;
  new.current_value := cur;
  new.status := 'proposed';
  new.final_value := null; new.decided_by := null; new.decided_at := null; new.jw_note := null;
  return new;
end $$;
revoke execute on function private.revision_prepare() from public, anon, authenticated;
