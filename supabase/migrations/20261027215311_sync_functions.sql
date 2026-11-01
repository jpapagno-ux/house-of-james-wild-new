-- Booking Live · Phase 2 · 0009 server-only sync helpers
-- The private schema is never exposed to the API, so the Airtable sync writes
-- contract terms and its own run log through these two functions. Only the
-- service role (server-side key, never in a browser) may call them.

create or replace function public.sync_contract_terms(rows jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer := 0; r jsonb;
begin
  for r in select * from jsonb_array_elements(rows) loop
    insert into private.contract_terms (rate_card_version_id, rates_are_net, commission_bp, net_rate_notes, contract_contact, updated_at)
    values ((r ->> 'rate_card_version_id')::uuid, coalesce((r ->> 'rates_are_net')::boolean, false), (r ->> 'commission_bp')::integer,
            r ->> 'net_rate_notes', r ->> 'contract_contact', now())
    on conflict (rate_card_version_id) do update set
      rates_are_net = excluded.rates_are_net, commission_bp = excluded.commission_bp,
      net_rate_notes = excluded.net_rate_notes, contract_contact = excluded.contract_contact, updated_at = now()
    where (private.contract_terms.rates_are_net, private.contract_terms.commission_bp, private.contract_terms.net_rate_notes, private.contract_terms.contract_contact)
      is distinct from (excluded.rates_are_net, excluded.commission_bp, excluded.net_rate_notes, excluded.contract_contact);
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function public.log_rate_sync(p_status text, p_cards integer, p_rows integer, p_errors jsonb)
returns uuid language sql security definer set search_path = '' as $$
  insert into private.rate_sync_runs (finished_at, status, cards_upserted, rows_upserted, errors)
  values (now(), p_status, p_cards, p_rows, coalesce(p_errors, '[]'::jsonb))
  returning id;
$$;

revoke all on function public.sync_contract_terms(jsonb) from public, anon, authenticated;
revoke all on function public.log_rate_sync(text, integer, integer, jsonb) from public, anon, authenticated;
grant execute on function public.sync_contract_terms(jsonb) to service_role;
grant execute on function public.log_rate_sync(text, integer, integer, jsonb) to service_role;
