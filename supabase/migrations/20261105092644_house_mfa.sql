-- House sign-in second step (D-11, James 1 Nov 2026: "your call, keep it simple"; built 5 Nov 2026).
--
-- House accounts (jw_admin, jw_editor, jw_portfolio_manager, admin, finance) count as house only in a session
-- that has passed the authenticator-app code: Supabase marks such a session aal2 in its token. A house
-- account signed in with a password alone is, to the database, nobody special: it sees what any signed-in
-- user without a partner membership sees, which is nothing private. The app sends it to the code screen.
-- Partners are not affected (D-11: password, email verification and leaked-password protection).
-- One function changes; every policy and function that asks "is this the house?" goes through it.

create or replace function private.is_jw(roles text[] default array['jw_admin', 'jw_editor', 'jw_portfolio_manager', 'admin'])
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (
       select 1 from public.organization_memberships m
       join public.organizations o on o.id = m.organization_id
       where m.user_id = auth.uid() and m.status = 'active' and o.status = 'active'
         and o.type = 'internal' and m.role = any (roles)
     );
$$;
