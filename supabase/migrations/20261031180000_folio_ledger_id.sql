-- Booking Live · 0011 the Folio's own number and the advisor it is open with
-- Stage 4 (31 Oct 2026): Iggi opens a journey as a Folio with a FOL number
-- issued once by the Iggi Core, with the house advisor (ADV number) on it.
-- The account-side Folio carries both, so the number quoted anywhere in the
-- house resolves to the traveller's shelf. Nullable: a Folio a traveller
-- starts by hand has no FOL until the house issues one.
alter table public.folios
  add column ledger_id text check (ledger_id ~ '^FOL-[0-9]{4}-[0-9]{6}$'),
  add column advisor_adv text check (advisor_adv ~ '^ADV-[0-9]{4}-[0-9]{6}$'),
  add column advisor_slug text check (char_length(advisor_slug) <= 60),
  add column source text check (source in ('traveler', 'iggi', 'advisor'));
create unique index folios_ledger_id_key on public.folios (ledger_id) where ledger_id is not null;
