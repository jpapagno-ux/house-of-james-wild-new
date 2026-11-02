-- Partner Desk · Stage 1 · 0003 contributors edit administrative data (James, 1 Nov 2026)
--
-- Matches the Stage 0 permissions matrix: partner contributors, like partner admins, edit
-- their organization's contacts and company details directly (administrative data, audited).
-- Removing a contact and managing the team stay with partner admins. Nothing editorial or
-- commercial changes: those still go through submissions and the house's review.
-- Written as ALTER POLICY (in place, nothing dropped).

alter policy contacts_insert on public.contacts with check (
  private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
  or private.is_org_member(organization_id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']));
alter policy contacts_update on public.contacts
  using (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
         or private.is_org_member(organization_id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']))
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
         or private.is_org_member(organization_id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']));

alter policy contact_entities_insert on public.contact_entities with check (
  exists (select 1 from public.contacts c where c.id = contact_id
          and (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
               or private.is_org_member(c.organization_id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor'])))
  and exists (select 1 from public.entity_partners ep join public.contacts c on c.organization_id = ep.organization_id
              where c.id = contact_id and ep.property_id = contact_entities.property_id));
alter policy contact_entities_delete on public.contact_entities using (
  exists (select 1 from public.contacts c where c.id = contact_id
          and (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
               or private.is_org_member(c.organization_id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']))));

-- Company details (website, phone, general email, address, preferred contact, media kit
-- only — the column grant is unchanged, so name, code and type are never writable from
-- the desk). House editors may make the same corrections on a partner's behalf.
alter policy organizations_update_partner_admin on public.organizations rename to organizations_update_partner_member;
alter policy organizations_update_partner_member on public.organizations
  using (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
         or private.is_org_member(id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']))
  with check (private.is_jw(array['jw_admin', 'jw_editor', 'jw_portfolio_manager'])
         or private.is_org_member(id, array['partner_admin', 'partner_manager', 'partner_contributor', 'partner_editor']));
