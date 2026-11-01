alter table public.rate_card_versions
  add column is_sample boolean not null default false,
  add column content_hash text,
  add column approved_revision integer;

alter table public.properties
  add column stay_type text check (stay_type in ('lodge', 'resort', 'family_residence')),
  add column rate_source text not null default 'rate_card' check (rate_source in ('rate_card', 'live_api'));

update public.rate_card_versions set is_sample = true where version_label like 'SAMPLE-%';

grant select (id, property_id, version_label, source_revision, currency, effective_from, effective_to, status,
              payment_terms, cancellation, timezone, published_at, is_sample)
  on public.rate_card_versions to anon, authenticated;

alter table public.promotions add constraint promotions_value_bounds check (
  (discount_type = 'percent' and discount_value between 1 and 9000) or
  (discount_type = 'nth_night_free' and discount_value between 2 and 30) or
  (discount_type = 'fixed_per_night' and discount_value > 0)
);

create or replace function private.quotes_price_locked()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (new.grand_total_minor, new.subtotal_minor, new.discounts_minor, new.taxes_minor, new.fees_minor, new.florida_tax_minor,
      new.deposit_due_minor, new.balance_due_date, new.currency, new.price_revision, new.price_breakdown, new.policy_snapshot,
      new.arrival_date, new.departure_date, new.adults, new.children, new.child_ages, new.traveler_user_id,
      new.property_id, new.room_type_id, new.rate_plan_id, new.rate_card_version_id, new.source, new.expires_at, new.created_at)
     is distinct from
     (old.grand_total_minor, old.subtotal_minor, old.discounts_minor, old.taxes_minor, old.fees_minor, old.florida_tax_minor,
      old.deposit_due_minor, old.balance_due_date, old.currency, old.price_revision, old.price_breakdown, old.policy_snapshot,
      old.arrival_date, old.departure_date, old.adults, old.children, old.child_ages, old.traveler_user_id,
      old.property_id, old.room_type_id, old.rate_plan_id, old.rate_card_version_id, old.source, old.expires_at, old.created_at) then
    raise exception 'quote prices are immutable; create a new quote' using errcode = '42501';
  end if;
  return new;
end $$;
