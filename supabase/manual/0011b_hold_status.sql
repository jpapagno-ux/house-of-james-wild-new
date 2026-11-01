-- Run once in the Supabase SQL editor (the MCP's confirmation for DROP is auto-cancelled in agent sessions).
-- Lets a quote be HELD (the property is holding the room while the traveler decides).
alter table public.quotes drop constraint if exists quotes_advisor_status_check;
alter table public.quotes add constraint quotes_advisor_status_check check (advisor_status in ('pending', 'held', 'approved', 'declined'));
drop index if exists quotes_advisor_queue_idx;
create index quotes_advisor_queue_idx on public.quotes (advisor_status, created_at) where advisor_status in ('pending', 'held');
select 'hold status installed' as result;
