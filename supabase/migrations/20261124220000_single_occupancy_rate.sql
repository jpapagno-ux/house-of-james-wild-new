-- Booking Live: single-occupancy rate on a seasonal rule (James, 24 Nov 2026).
-- Additive: a nullable column, and apply_rate_card writes it. Rules with no single rate price as before.
alter table public.seasonal_rate_rules add column if not exists single_minor bigint check (single_minor >= 0);

do $$
declare d text;
begin
  select pg_get_functiondef('public.apply_rate_card(jsonb)'::regprocedure) into d;
  if position('single_minor' in d) = 0 then
    d := replace(d, 'amount_minor, extra_adult_minor, child_bands', 'amount_minor, extra_adult_minor, single_minor, child_bands');
    d := replace(d, $q$(r ->> 'extra_adult_minor')::bigint,$q$, $q$(r ->> 'extra_adult_minor')::bigint, (r ->> 'single_minor')::bigint,$q$);
    if (length(d) - length(replace(d, 'single_minor', ''))) / length('single_minor') <> 2 then
      raise exception 'apply_rate_card: the rate insert was not found as expected; nothing changed';
    end if;
    execute d;
  end if;
end $$;
