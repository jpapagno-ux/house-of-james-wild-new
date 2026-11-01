-- Iggi Intelligence Core, Stage 1a (decision D10, 30 Oct 2026).
-- Row Level Security on the private.* tables. Tables are owned by postgres and
-- read only through owner-executed SECURITY DEFINER functions or the service role,
-- both of which bypass RLS, so existing flows are unchanged; anon/authenticated
-- get no access even if the schema is ever exposed.
alter table private.audit_logs enable row level security;
alter table private.contract_terms enable row level security;
alter table private.rate_sync_runs enable row level security;

revoke all on private.audit_logs, private.contract_terms, private.rate_sync_runs from anon, authenticated;

create policy "service role only" on private.audit_logs for all to service_role using (true) with check (true);
create policy "service role only" on private.contract_terms for all to service_role using (true) with check (true);
create policy "service role only" on private.rate_sync_runs for all to service_role using (true) with check (true);
