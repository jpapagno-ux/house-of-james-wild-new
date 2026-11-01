alter table public.room_types
  add column if not exists reference_from_rate numeric,
  add column if not exists reference_currency text,
  add column if not exists reference_rate_status text,
  add column if not exists source_webflow_item_id text,
  add column if not exists source_webflow_slug text,
  add column if not exists source_gallery_urls text[],
  add column if not exists source_hero_url text;

create unique index if not exists room_types_source_webflow_item_id_key
on public.room_types(source_webflow_item_id)
where source_webflow_item_id is not null;
