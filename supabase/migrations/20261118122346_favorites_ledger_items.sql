-- Booking Live · favorites for everything in the Ledger (James, 18 Nov 2026)
-- Until now a favorite was always a stay (property_id). A traveler can now also save a ship, a voyage,
-- a safari camp page or an overland route. Those are site content, not rows in public.properties, so the
-- favorite keeps the page's own path, its kind and its name as saved.
-- Additive: existing rows are untouched and stay valid. Row level security (favorites_owner_all) and the
-- grants (select, insert, delete to authenticated) already cover the new columns.

alter table public.favorites alter column property_id drop not null;

alter table public.favorites
  add column item_type text check (item_type in ('ship', 'voyage', 'safari', 'route')),
  add column item_path text check (char_length(item_path) <= 200 and item_path ~ '^/(voyages|safaris|overland)(/[a-z0-9-]+){2}$'),
  add column item_title text check (char_length(item_title) between 1 and 160);

-- A favorite is either a stay or one Ledger page, never both and never neither.
alter table public.favorites add constraint favorites_one_subject check (
  (property_id is not null and item_type is null and item_path is null and item_title is null)
  or (property_id is null and item_type is not null and item_path is not null and item_title is not null)
);

-- One save per traveler per page.
create unique index favorites_user_item_key on public.favorites (user_id, item_path) where item_path is not null;
