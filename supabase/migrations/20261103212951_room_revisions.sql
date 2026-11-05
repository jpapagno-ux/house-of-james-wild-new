-- Partner Desk · Stage 2 · Rooms & Accommodation (plan §3.2, step 4)
--
-- Partners propose the descriptive room fields (category, one line, description, beds, size, view,
-- features, included, not included, good to know) through revisions an editor approves. The Airtable
-- rates sync owns a room's name, description and occupancy, so those are refused here unless the house
-- proposes them; partners ask for them (and for new rooms) by request (D-08). Shapes are checked at
-- proposal time so an approval never fails on a bad value. Only replaces revision_prepare().

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
    -- The Airtable rates sync owns these: partners ask for them by request, never by revision.
    if new.field in ('name', 'description', 'max_adults', 'max_children', 'max_occupancy') and not private.is_jw() then
      raise exception 'names and occupancy change by request to the house' using errcode = '42501';
    end if;
    if new.field in ('features', 'included', 'excluded', 'important_notes') then
      if jsonb_typeof(new.proposed_value) <> 'array' or jsonb_array_length(new.proposed_value) not between 1 and 30
         or exists (select 1 from jsonb_array_elements(new.proposed_value) e where jsonb_typeof(e) <> 'string' or char_length(e #>> '{}') not between 1 and 300) then
        raise exception 'a list needs 1 to 30 lines of up to 300 characters' using errcode = '23514';
      end if;
    elsif new.field = 'size_sqm' then
      if jsonb_typeof(new.proposed_value) <> 'number' or (new.proposed_value #>> '{}')::numeric not between 1 and 5000 then
        raise exception 'size is a number of square metres' using errcode = '23514';
      end if;
    elsif new.field = 'unit_type' then
      if (new.proposed_value #>> '{}') not in ('room', 'suite', 'villa', 'residence', 'cottage', 'house', 'tent', 'cabin', 'treehouse') then
        raise exception 'choose a room category' using errcode = '23514';
      end if;
    elsif new.field in ('short_description', 'full_description', 'bed_configuration', 'view_name') then
      if jsonb_typeof(new.proposed_value) <> 'string' or char_length(new.proposed_value #>> '{}') not between 1 and 2000 then
        raise exception 'this field takes text' using errcode = '23514';
      end if;
    end if;
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
