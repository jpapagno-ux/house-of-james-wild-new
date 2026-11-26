-- Booking Live: a fee charged per person, once per stay (Awasi Patagonia's conservation contribution; James, 26 Nov 2026).
alter table public.tax_fee_rules drop constraint if exists tax_fee_rules_charge_basis_check;
alter table public.tax_fee_rules add constraint tax_fee_rules_charge_basis_check
  check (charge_basis in ('percent_of_room', 'per_person_per_night', 'per_room_per_night', 'per_stay', 'per_person_per_stay'));
