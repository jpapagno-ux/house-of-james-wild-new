# Lion Sands · the checkout, worked for every unit

The full Request-to-Reserve process on the published card (`2027-V1`, revision 2),
run through the same pricing engine the site uses (`tests/lion-sands-checkout.test.ts`
re-computes this table on every test run). One worked stay: **3 nights, 10–13 June
2027**, 2 adults (6 for the whole residence), no offer code.

Pricing order (COMMERCIAL-RULES.md): room nights − offers + local taxes the rate
excludes + **7% Florida sales tax** = total → **30% deposit** → balance due **60
days before arrival** (11 Apr 2027). South African VAT 15% is in the rate, so it
is shown ("Already in the rate") and never added.

| Unit | Nightly (2 adults) | 3 nights | VAT 15% in the rate | Florida sales tax 7% | **Total** | Deposit 30% | Balance due 11 Apr 2027 |
|---|---:|---:|---:|---:|---:|---:|---:|
| River Lodge · Luxury Room | US$3,886.00 | US$11,658.00 | US$1,520.61 | US$816.06 | **US$12,474.06** | US$3,742.22 | US$8,731.84 |
| River Lodge · Superior Luxury Room | US$4,274.00 | US$12,822.00 | US$1,672.43 | US$897.54 | **US$13,719.54** | US$4,115.86 | US$9,603.68 |
| Narina Lodge · Narina Suite | US$4,460.00 | US$13,380.00 | US$1,745.22 | US$936.60 | **US$14,316.60** | US$4,294.98 | US$10,021.62 |
| River Lodge · Luxury River Suite | US$4,996.00 | US$14,988.00 | US$1,954.96 | US$1,049.16 | **US$16,037.16** | US$4,811.15 | US$11,226.01 |
| Tinga Lodge · Tinga Suite | US$5,848.00 | US$17,544.00 | US$2,288.35 | US$1,228.08 | **US$18,772.08** | US$5,631.62 | US$13,140.46 |
| River Lodge · Family River Suite | US$5,996.00 | US$17,988.00 | US$2,346.26 | US$1,259.16 | **US$19,247.16** | US$5,774.15 | US$13,473.01 |
| Ivory Lodge · Ivory Suite | US$6,840.00 | US$20,520.00 | US$2,676.52 | US$1,436.40 | **US$21,956.40** | US$6,586.92 | US$15,369.48 |
| Fish Eagle Residence · exclusive use (6 guests) | US$11,845.00 | US$35,535.00 | US$4,635.00 | US$2,487.45 | **US$38,022.45** | US$11,406.74 | US$26,615.71 |

## The process the traveler walks

1. **Stay page** `/stays/lion-sands` — each unit reads *Rates available · From US$…*;
   View details shows the provenance line (*Contracted rate · Rate card 2027-V1 ·
   verified 1 Nov 2026 · availability confirmed on request*) and **Check availability**.
2. **Request to Reserve** `/booking/property/lion-sands` — dates, adults, children's
   ages, optional offer code → every unit priced night by night with the table above:
   room nights, taxes already in the rate, Florida sales tax, total, deposit, balance
   date, cancellation. Nothing is held or charged.
3. **Request to Reserve** (button) — signed-in travelers only (magic-link sign-in,
   returns to the same page) → `POST /api/v1/quotes` stores an immutable quote
   (price snapshot, policy snapshot, price reference) → `/booking/quote/<id>`:
   *Waiting for the house*, held 72 hours.
4. **House side** — an advisor approves or declines (`POST /api/v1/ops/quotes/:id/approve`;
   the Advisor Desk screens follow in Phase 3). Approved → *Confirmed by the house ·
   the house will send the deposit details*.
5. **Payment (Phase 3)** — checkout charges exactly the stored quote (deposit now, or
   everything inside the balance window), never re-priced in the browser. Payment
   gateways connect here; nothing in steps 1–4 changes when they do.

## Caveats on this card

- Figures are the library's per-person from-rates × 2, approved by James on
  1 Nov 2026 as a stand-in. The contracted card (`2027-V2`) brings real seasons,
  child bands, extra-adult rates, any levies, cancellation tiers and contract terms.
- Lion Sands quotes per person sharing; the engine prices per room for the base
  occupancy (2), so a third adult or a child is not priced until the card carries
  Extra Adult / child bands (Phase 2b adds a per-person basis).
