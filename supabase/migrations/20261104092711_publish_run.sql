-- Publish run (D-18 option A, James, 2 Nov 2026; "Yes approve and publish", 4 Nov 2026)
--
-- Approved property content reaches the website only through the Library, and only when James merges:
--   1. a GitHub workflow asks the site for the pending batch (public.publish_run_pending) and opens a PR
--      that writes it to scripts/data/content-apply.json
--   2. James merges; the workflow posts the batch to the Library's contentApply function
--   3. the Library reports ok; the workflow tells the site, which stamps the revisions published
--      (public.publish_run_mark), and the library sync carries the change to the pages
-- Rooms are not in the run: approved room changes are written to room_types on approval, and the
-- stay pages read rooms from there (D-30). Service role only: the site's server, never a browser.

alter table public.revisions
  add column published_at timestamptz,
  add column published_batch text check (char_length(published_batch) <= 120);
create index revisions_publish_pending_idx on public.revisions (target_table, status)
  where published_at is null and status in ('approved', 'edited_approved');

-- What is approved and not yet published: one row per property, with its current approved content
-- (entity_content holds exactly what the editors approved) and the revisions the run will stamp.
create or replace function public.publish_run_pending()
returns table (property_id uuid, ledger_id text, name text, content jsonb, fields text[], revision_ids uuid[], last_decided timestamptz)
language sql stable security definer set search_path = '' as $$
  with pending as (
    select r.target_id, array_agg(distinct r.field order by r.field) as fields, array_agg(r.id order by r.decided_at) as ids, max(r.decided_at) as last_decided
    from public.revisions r
    where r.target_table = 'entity_content' and r.status in ('approved', 'edited_approved') and r.published_at is null
    group by r.target_id
  )
  select p.id, p.legacy_cms_id, p.name,
         to_jsonb(ec) - 'id' - 'published_at' - 'created_at' - 'updated_at',
         pending.fields, pending.ids, pending.last_decided
  from pending
  join public.properties p on p.id = pending.target_id
  join public.entity_content ec on ec.id = pending.target_id
  order by p.name;
$$;
revoke execute on function public.publish_run_pending() from public, anon, authenticated;
grant execute on function public.publish_run_pending() to service_role;

-- After the Library has taken the batch: stamp exactly those revisions, once.
create or replace function public.publish_run_mark(p_revisions uuid[], p_batch text)
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if p_batch is null or char_length(p_batch) not between 1 and 120 then
    raise exception 'Name the batch' using errcode = '22023';
  end if;
  update public.revisions set published_at = now(), published_batch = p_batch
    where id = any (p_revisions) and target_table = 'entity_content'
      and status in ('approved', 'edited_approved') and published_at is null;
  get diagnostics n = row_count;
  update public.entity_content set published_at = now()
    where id in (select target_id from public.revisions where id = any (p_revisions) and published_batch = p_batch);
  return n;
end $$;
revoke execute on function public.publish_run_mark(uuid[], text) from public, anon, authenticated;
grant execute on function public.publish_run_mark(uuid[], text) to service_role;
