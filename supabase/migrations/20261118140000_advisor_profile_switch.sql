-- Advisor profile switch (James, 18 Nov 2026: "go with your picks"). The advisor can take their profile off the site
-- at once (no approval); putting it back waits for the house. "Away until" keeps them listed with a return date and
-- turns itself off on that date. The house can hide a profile and leave the advisor a note on their desk.
alter table public.advisors
  add column if not exists profile_visible boolean not null default true,
  add column if not exists profile_show_requested_at timestamptz,
  add column if not exists away_until date,
  add column if not exists house_message text;

-- The advisor's own switch. Off: at once. On: a request the house approves.
create or replace function public.set_advisor_profile_visible(p_visible boolean)
returns text language plpgsql security definer set search_path to '' as $$
declare me uuid := private.my_advisor_file();
begin
  if me is null then raise exception 'Advisors only' using errcode = '42501'; end if;
  if p_visible then
    update public.advisors set profile_show_requested_at = case when profile_visible then null else now() end, updated_at = now() where id = me;
    return (select case when profile_visible then 'visible' else 'requested' end from public.advisors where id = me);
  end if;
  update public.advisors set profile_visible = false, profile_show_requested_at = null, updated_at = now() where id = me;
  return 'hidden';
end; $$;

-- The advisor's own "away until" (null clears it). A date in the past or more than a year out is refused.
create or replace function public.set_advisor_away(p_until date)
returns date language plpgsql security definer set search_path to '' as $$
declare me uuid := private.my_advisor_file();
begin
  if me is null then raise exception 'Advisors only' using errcode = '42501'; end if;
  if p_until is not null and (p_until <= current_date or p_until > current_date + 366) then
    raise exception 'Choose a return date in the next twelve months' using errcode = '22023'; end if;
  update public.advisors set away_until = p_until, updated_at = now() where id = me;
  return p_until;
end; $$;

-- The house: show (approving a request) or hide a profile, with an optional note the advisor sees on their desk.
create or replace function public.house_set_advisor_profile(p_advisor uuid, p_visible boolean, p_message text)
returns boolean language plpgsql security definer set search_path to '' as $$
begin
  if not private.is_advisor_keeper() then raise exception 'House only' using errcode = '42501'; end if;
  update public.advisors set profile_visible = p_visible, profile_show_requested_at = null,
    house_message = nullif(btrim(coalesce(p_message, '')), ''), updated_at = now()
  where id = p_advisor;
  if not found then raise exception 'No such advisor' using errcode = 'P0002'; end if;
  return p_visible;
end; $$;

revoke all on function public.set_advisor_profile_visible(boolean) from public, anon;
revoke all on function public.set_advisor_away(date) from public, anon;
revoke all on function public.house_set_advisor_profile(uuid, boolean, text) from public, anon;
grant execute on function public.set_advisor_profile_visible(boolean) to authenticated;
grant execute on function public.set_advisor_away(date) to authenticated;
grant execute on function public.house_set_advisor_profile(uuid, boolean, text) to authenticated;

-- The site's export: an active advisor whose profile is off is exported hidden and offline (off every page);
-- an away advisor carries their return date.
create or replace function public.public_advisor_dna()
returns jsonb language sql stable security definer set search_path to '' as $function$
  select coalesce(jsonb_agg(x order by x ->> 'ledgerId'), '[]'::jsonb) from (
    select case when a.status = 'active' and a.profile_visible then jsonb_build_object(
        'slug', a.slug, 'ledgerId', a.adv_number, 'hidden', false, 'name', a.display_name, 'house', a.house_advisor,
        'title', d.title, 'intro', d.intro, 'bio', d.bio, 'portrait', a.portrait_public_id,
        'pathways', to_jsonb(d.pathways), 'volumes', to_jsonb(d.volumes), 'partyTypes', to_jsonb(d.party_types),
        'countries', to_jsonb(d.countries), 'languages', to_jsonb(d.languages), 'specialties', to_jsonb(d.specialties),
        'availability', d.availability, 'matchNote', d.match_note,
        'confirmed', to_char(d.confirmed_at at time zone 'UTC', 'YYYY-MM-DD'), 'updated', to_char(d.approved_at at time zone 'UTC', 'YYYY-MM-DD'),
        'awayUntil', case when a.away_until > current_date then to_char(a.away_until, 'YYYY-MM-DD') end,
        'marks', d.marks)
      else jsonb_build_object('slug', a.slug, 'ledgerId', a.adv_number, 'hidden', true, 'offline', a.status = 'active' and not a.profile_visible) end as x
    from public.advisors a left join public.advisor_dna d on d.advisor_id = a.id
    where a.slug is not null and ((a.status = 'active' and d.advisor_id is not null) or a.status in ('paused', 'left'))
  ) s;
$function$;
