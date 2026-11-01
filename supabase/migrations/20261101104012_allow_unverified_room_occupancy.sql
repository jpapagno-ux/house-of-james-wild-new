alter table public.room_types
  alter column max_adults drop not null,
  alter column max_occupancy drop not null;

alter table public.room_types
  add column if not exists occupancy_status text not null default 'unverified';
