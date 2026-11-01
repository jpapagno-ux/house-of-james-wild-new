alter table public.room_types
  add column if not exists unit_type text,
  add column if not exists bed_configuration text,
  add column if not exists size_sqm numeric,
  add column if not exists size_sqft numeric,
  add column if not exists view_name text,
  add column if not exists private_pool boolean,
  add column if not exists private_terrace boolean,
  add column if not exists connecting_available boolean,
  add column if not exists short_description text,
  add column if not exists full_description text,
  add column if not exists pricing_mode text,
  add column if not exists booking_mode text,
  add column if not exists hero_media_id text,
  add column if not exists gallery_media_ids text[],
  add column if not exists sort_order integer,
  add column if not exists founder_note text,
  add column if not exists amenities text[],
  add column if not exists legacy_room_id text,
  add column if not exists source_system text,
  add column if not exists source_updated_at timestamptz;

alter table public.properties
  add column if not exists pricing_mode text,
  add column if not exists rate_status text,
  add column if not exists availability_mode text,
  add column if not exists hero_media_id text,
  add column if not exists gallery_media_ids text[],
  add column if not exists source_system text;
