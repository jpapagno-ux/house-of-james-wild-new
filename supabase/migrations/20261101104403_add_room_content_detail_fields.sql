alter table public.room_types
  add column if not exists features text[] default '{}'::text[],
  add column if not exists included text[] default '{}'::text[],
  add column if not exists excluded text[] default '{}'::text[],
  add column if not exists important_notes text[] default '{}'::text[],
  add column if not exists inclusion_summary text,
  add column if not exists exclusion_summary text;

comment on column public.room_types.features is 'Traveler-facing room/unit features distinct from general property amenities.';
comment on column public.room_types.included is 'Items included specifically with this room/unit or rate context; not assumed property-wide.';
comment on column public.room_types.excluded is 'Items explicitly not included with this room/unit or rate context.';
comment on column public.room_types.important_notes is 'Short operational/traveler notes such as stairs, age limits, minimum stay, configuration caveats.';
