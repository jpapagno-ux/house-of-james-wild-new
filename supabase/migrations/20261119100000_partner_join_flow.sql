-- Partner join flow (James, 19 Nov 2026: "allow partners to request a sign on ... then complete a set up form
-- to match what's offered in the dashboard ... so when I send the invitation all can be entered by the user").
--
-- 1. A partner asks to join at /partner/apply (partner_applications, unchanged; no self-signup).
-- 2. The house reviews it on /desk/partners and invites in one step: house_invite_partner() creates the
--    partner organization (with its PAR- code), connects any Ledger entries the house picks, writes the
--    invitation (only the token's SHA-256 is stored) and marks the application invited.
-- 3. The invited admin accepts (accept_org_invitation, unchanged), chooses a password and an authenticator,
--    then the set-up checklist on /partner/setup walks them through every part of the desk.

alter table public.partner_applications
  add column if not exists phone text check (char_length(phone) <= 40),
  add column if not exists role_title text check (char_length(role_title) <= 120),
  add column if not exists organization_id uuid references public.organizations (id) on delete set null,
  add column if not exists decided_at timestamptz,
  add column if not exists house_note text check (char_length(house_note) <= 1000);

-- Which step of set-up a partner has said they have finished or skipped (a step that has data counts as done
-- without this). One row per organization; partner admins write it through partner_setup_mark().
create table if not exists public.partner_setup (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  skipped text[] not null default '{}',
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.partner_setup enable row level security;
revoke all on public.partner_setup from anon, authenticated;
grant select on public.partner_setup to authenticated;
create policy partner_setup_select on public.partner_setup for select to authenticated
  using (private.is_jw() or private.is_org_member(organization_id, array['partner_admin', 'partner_manager', 'partner_contributor']));

create or replace function public.partner_setup_mark(p_org uuid, p_step text, p_skip boolean default true, p_finish boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'sign in first' using errcode = '42501'; end if;
  if not (private.is_jw(array['jw_admin']) or private.is_org_member(p_org, array['partner_admin', 'partner_manager'])) then
    raise exception 'only a partner admin can change set-up' using errcode = '42501';
  end if;
  if p_step is not null and p_step !~ '^[a-z_]{2,40}$' then raise exception 'unknown step' using errcode = '22023'; end if;
  insert into public.partner_setup (organization_id) values (p_org) on conflict (organization_id) do nothing;
  update public.partner_setup set
    skipped = case when p_step is null then skipped
                   when p_skip then (select array_agg(distinct s) from unnest(skipped || p_step) s)
                   else array_remove(skipped, p_step) end,
    finished_at = case when p_finish then now() else finished_at end,
    updated_at = now()
  where organization_id = p_org;
end $$;
revoke all on function public.partner_setup_mark(uuid, text, boolean, boolean) from public, anon;
grant execute on function public.partner_setup_mark(uuid, text, boolean, boolean) to authenticated;

-- The house invites a partner. p_org: an existing partner organization, or null to create one named p_org_name.
create or replace function public.house_invite_partner(
  p_application uuid, p_org uuid, p_org_name text, p_email text, p_role text,
  p_property_ids uuid[], p_entity_role text, p_token_hash text, p_access uuid[] default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare org uuid := p_org; inv uuid; pid uuid; code text; base text; candidate text; n int := 1;
begin
  if not private.is_jw(array['jw_admin']) then raise exception 'only a house admin can invite partners' using errcode = '42501'; end if;
  if p_email is null or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'give a valid email address' using errcode = '22023'; end if;
  if p_role not in ('partner_admin', 'partner_contributor') then raise exception 'role must be partner_admin or partner_contributor' using errcode = '22023'; end if;
  if p_entity_role not in ('owner', 'operator', 'sales_representative', 'dmc', 'booking_partner', 'marketing_representative', 'guide', 'ground_handler') then
    raise exception 'unknown connection role' using errcode = '22023'; end if;
  if p_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'bad token' using errcode = '22023'; end if;

  if org is null then
    if p_org_name is null or char_length(trim(p_org_name)) not between 1 and 160 then raise exception 'give the partner''s name' using errcode = '22023'; end if;
    base := trim(both '-' from regexp_replace(lower(trim(p_org_name)), '[^a-z0-9]+', '-', 'g'));
    if char_length(base) < 2 then base := 'partner'; end if;
    base := left(base, 72);
    candidate := base;
    while exists (select 1 from public.organizations where slug = candidate) loop
      n := n + 1; candidate := base || '-' || n;
    end loop;
    code := private.next_partner_code();
    insert into public.organizations (name, type, status, partner_code, slug)
      values (trim(p_org_name), 'partner', 'active', code, candidate) returning id into org;
  elsif not exists (select 1 from public.organizations where id = org and type = 'partner') then
    raise exception 'not a partner organization' using errcode = 'P0002';
  end if;

  if p_property_ids is not null then
    foreach pid in array p_property_ids loop
      if not exists (select 1 from public.properties where id = pid) then raise exception 'unknown Ledger entry' using errcode = 'P0002'; end if;
      insert into public.entity_partners (property_id, organization_id, role, is_primary)
        values (pid, org, p_entity_role, not exists (select 1 from public.entity_partners where property_id = pid and is_primary))
        on conflict (property_id, organization_id, role) do nothing;
    end loop;
  end if;

  -- p_access narrows this person to some of the organization's entries (a lodge manager in a group); empty = all.
  if p_access is not null and exists (select 1 from unnest(p_access) a where not exists (
      select 1 from public.entity_partners ep where ep.property_id = a and ep.organization_id = org)) then
    raise exception 'access can only name entries connected to this partner' using errcode = '22023';
  end if;

  -- A newer invitation for the same address replaces one still open.
  update public.org_invitations set revoked_at = now()
    where organization_id = org and lower(email) = lower(p_email) and accepted_at is null and revoked_at is null;
  insert into public.org_invitations (organization_id, email, role, entity_ids, token_hash, invited_by)
    values (org, lower(p_email), p_role, coalesce(p_access, '{}'), p_token_hash, auth.uid()) returning id into inv;

  if p_application is not null then
    update public.partner_applications set status = 'invited', organization_id = org, decided_at = now() where id = p_application;
  end if;
  insert into public.partner_setup (organization_id) values (org) on conflict (organization_id) do nothing;
  return jsonb_build_object('organization', org, 'invitation', inv, 'code', (select partner_code from public.organizations where id = org));
end $$;
revoke all on function public.house_invite_partner(uuid, uuid, text, text, text, uuid[], text, text, uuid[]) from public, anon;
grant execute on function public.house_invite_partner(uuid, uuid, text, text, text, uuid[], text, text, uuid[]) to authenticated;

grant update (status, house_note, decided_at) on public.partner_applications to authenticated;

grant insert (phone, role_title) on public.partner_applications to anon, authenticated;
