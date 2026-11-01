-- Booking Live · Phase 1 · 0006 owners can always read their own Folio
-- Found by rls_phase1.sql: INSERT … RETURNING applies the SELECT policy to the
-- new row, and private.folio_role() (a separate query) cannot yet see a row
-- inserted by the same statement, so creating a Folio failed. Checking the
-- owner column directly fixes it; members still go through folio_role().
alter policy folios_select_member on public.folios
  using (owner_user_id = (select auth.uid()) or private.folio_role(id) is not null);
