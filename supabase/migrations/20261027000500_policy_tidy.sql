-- Booking Live · Phase 1 · 0005 advisor fixes
-- Supabase performance advisor: index the remaining foreign keys and replace
-- "for all" write policies (which also add a second SELECT policy) with
-- separate insert / update / delete policies. Behaviour is unchanged.
-- Security advisor note: public.accept_folio_invitation is SECURITY DEFINER and
-- callable by signed-in users on purpose; it checks token, expiry and email.

create index folio_invitations_invited_by_idx on public.folio_invitations (invited_by);
create index folio_invitations_accepted_by_idx on public.folio_invitations (accepted_by);

drop policy folio_items_write on public.folio_items;
create policy folio_items_insert on public.folio_items for insert to authenticated
  with check (private.folio_role(folio_id) in ('owner', 'editor'));
create policy folio_items_update on public.folio_items for update to authenticated
  using (private.folio_role(folio_id) in ('owner', 'editor'))
  with check (private.folio_role(folio_id) in ('owner', 'editor'));
create policy folio_items_delete on public.folio_items for delete to authenticated
  using (private.folio_role(folio_id) in ('owner', 'editor'));

drop policy folio_members_owner_write on public.folio_members;
create policy folio_members_insert on public.folio_members for insert to authenticated
  with check (private.folio_role(folio_id) = 'owner');
create policy folio_members_update on public.folio_members for update to authenticated
  using (private.folio_role(folio_id) = 'owner') with check (private.folio_role(folio_id) = 'owner');
create policy folio_members_delete on public.folio_members for delete to authenticated
  using (private.folio_role(folio_id) = 'owner');

drop policy parties_owner_all on public.travel_parties;
drop policy parties_member_read on public.travel_parties;
create policy parties_select on public.travel_parties for select to authenticated using (
  owner_user_id = (select auth.uid())
  or exists (select 1 from public.travel_party_members m
             where m.party_id = travel_parties.id and m.user_id = (select auth.uid())
               and m.invitation_status = 'accepted'));
create policy parties_insert on public.travel_parties for insert to authenticated
  with check (owner_user_id = (select auth.uid()));
create policy parties_update on public.travel_parties for update to authenticated
  using (owner_user_id = (select auth.uid())) with check (owner_user_id = (select auth.uid()));
create policy parties_delete on public.travel_parties for delete to authenticated
  using (owner_user_id = (select auth.uid()));

drop policy party_members_owner_all on public.travel_party_members;
drop policy party_members_self_read on public.travel_party_members;
create policy party_members_select on public.travel_party_members for select to authenticated
  using (private.is_party_owner(party_id) or user_id = (select auth.uid()));
create policy party_members_insert on public.travel_party_members for insert to authenticated
  with check (private.is_party_owner(party_id));
create policy party_members_update on public.travel_party_members for update to authenticated
  using (private.is_party_owner(party_id)) with check (private.is_party_owner(party_id));
create policy party_members_delete on public.travel_party_members for delete to authenticated
  using (private.is_party_owner(party_id));
