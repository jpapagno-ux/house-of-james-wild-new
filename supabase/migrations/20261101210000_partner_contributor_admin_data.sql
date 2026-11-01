-- Partner Desk · Stage 1 · 0003 contributors edit administrative data (James, 1 Nov 2026)
--
-- Matches the Stage 0 permissions matrix: partner contributors, like partner admins, edit
-- their organization's contacts and company details directly (administrative data, audited).
-- Removing a contact and managing the team stay with partner admins. Nothing editorial or
-- commercial changes: those still go through submissions and the house's review.

drop policy contacts_insert on public.contacts;
drop policy contacts_update on public.contacts;
create policy contacts_insert on public.contacts for insert to authenticated with check (
  private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
  or private.is_org_member(organization_id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']));
create policy contacts_update on public.contacts for update to authenticated
  using (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
         or private.is_org_member(organization_id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']))
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
         or private.is_org_member(organization_id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']));

drop policy contact_entities_insert on public.contact_entities;
drop policy contact_entities_delete on public.contact_entities;
create policy contact_entities_insert on public.contact_entities for insert to authenticated with check (
  exists (select 1 from public.contacts c where c.id = contact_id
          and (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
               or private.is_org_member(c.organization_id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor'])))
  and exists (select 1 from public.entity_partners ep join public.contacts c on c.organization_id = ep.organization_id
              where c.id = contact_id and ep.property_id = contact_entities.property_id));
create policy contact_entities_delete on public.contact_entities for delete to authenticated using (
  exists (select 1 from public.contacts c where c.id = contact_id
          and (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
               or private.is_org_member(c.organization_id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']))));

-- Company details (website, phone, general email, address, preferred contact, media kit
-- only — the column grant is unchanged, so name, code and type are never writable from
-- the desk). House editors may make the same corrections on a partner's behalf.
drop policy organizations_update_partner_admin on public.organizations;
create policy organizations_update_partner_member on public.organizations for update to authenticated
  using (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
         or private.is_org_member(id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']))
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
         or private.is_org_member(id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']));
