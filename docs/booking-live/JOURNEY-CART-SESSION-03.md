# Booking & Checkout Studio · Session 03 · Journey Cart & Pay Now Checkout

15 Nov 2026 · branch `feature/journey-cart-session-03` · preview route `/preview/journey-cart`
Payment mode: simulation only. Production deployment: not authorised, not done.
Preview (Vercel sign-in required): https://house-of-james-wild-new-git-featu-e159e3-james-papagno-projects.vercel.app/preview/journey-cart

Nothing in Airtable, Supabase, Vercel settings, production rates, commissions, booking records or payment
configuration was changed in this session. All reads were read-only.

---

## Round 2 (same day): James's decisions, corrections and four more examples

**Decisions recorded, 15 Nov 2026**
1. **No Florida sales tax.** The cart applies none and says so. The blanket 7% is still in the shared pricing engine,
   `lib/pricing.ts`, the `quotes.florida_tax_minor` column, seven components and `COMMERCIAL-RULES.md`; James approved
   removing it there too; that change is on its own branch, `remove-florida-sales-tax`, and goes live when merged.
2. **Ellerman House.** James will complete the card. A Draft card (`PUBLISHED-2026-27`, 35 seasonal rates, ZAR) already
   sits in Airtable from Session 01; it needs VAT and levy treatment, deposit, cancellation, minimum stays and occupancy
   before it can be published.
3. **TAG does not handle or allow cruise bookings.** Voyages never route to the booking engine: Antarctica21 is booked
   through the house. For ALBIE stays the engine collects the payment and pays the house, so the house site takes no
   payment for Leeu House; Pay Now is now described and simulated as a hand-off to the engine.

**Corrections to the first report**
- Session 01 did happen (a read-only audit, indexed in the project as `session-01-audit-index.md`). The first report
  was wrong to say no earlier specification existed.
- Ellerman House's published rates were on file all along, in `lib/content/stay-rooms.ts` (rand, four seasons, seven
  room and villa types, read from Ellerman House's own site on 10 Nov 2026). The first report missed that file.
  James approved building the pilot from published rates, so Ellerman House now prices in the cart.
- Departures now carry the Airtable Departure Code (for example `PCS-A21-CLA-270114-ME`) wherever the Polar Crossings
  Voyage Ledger has the sailing: 14 Magellan Explorer sailings. Sailings not filed there show no code; none is made up.

**New examples in the cart**

| Example | ID | How it prices |
| --- | --- | --- |
| Ellerman House, rooms | `STY-2026-000075` | Published rand rates, night by night across seasons, US dollars first at the filed ECB rate, rand kept beside it. |
| Ellerman House Villas (residence) | `STY-2026-000075` | Villa One and Villa Two, per villa a night, same method. Villa Two is capped at the six it sleeps; a larger party goes to the house. |
| Casali di Casole (Gatherings residence) | `STY-2026-000650` | Published euro rate per residence a night, for the two weeks its engine was read (12 to 19 Jun and 11 to 18 Sep 2027). The Season of Savings rate applies only from five nights. Other dates and unpriced residences go to the house. US dollars first at the filed ECB rate, euros kept beside it (rate added later the same day). |
| The Sand River by Road (land journey) | `ITN-LAND-2026-202031` | Start date and travelers. Route prices are not final in the record, so no figure: the house quotes it. Advisor Assisted only. |
| Three Generations at Pioneer (family land journey) | `ITN-LAND-2026-982652` | The same, for up to twelve. |

Checked by hand: Deluxe House Room, 26 Feb to 2 Mar 2027 = 3 Peak nights at R70,000 + 1 High night at R67,000 =
R277,000 = US$16,596.76 at 16.69. Villa Two, 10 to 14 Jun 2027 = 4 Low nights at R220,000 = R880,000 = US$52,726.18.
Santa Lucia, 12 to 18 Jun 2027 = 6 nights at EUR 4,000 = EUR 24,000 = US$26,812.65 at 0.8951.

**New gaps this round**
- Land journeys have no price build at all (`prices_final: false`, the calculator reads "Quoted against your dates").
  A journey needs its component rates (Londolozi, the charter, transfers) before it can price.
- Gatherings residences: only Casali di Casole and the Ellerman villas have published rates on file. Occupancy for
  Villa One is not stated, and no residence has deposit, cancellation or house-rules terms on file.
- A published rate is not a contracted rate: VAT and levy treatment for Ellerman House is still open.

Tests: 11 for the cart, 388 in the suite, all passing; typecheck, lint and build clean.

---

## 1. What previous sessions actually left (verified before any code)

| Area | What exists on `main` | What does not exist |
| --- | --- | --- |
| Checkout prototype | A single-property quote flow (`/booking/property/[slug]`, `/booking/quote/[id]`), behind flags that are off unless switched on in Vercel. | No Journey Cart or multi-product checkout code, and no branch for one among the repo's 401 branches. (Session 01's audit lives in the project, not the repo.) |
| Rate Desk / rate cards | Airtable base "Commercial Rates (Booking Live)" with 9 properties and 8 cards; synced copy in Supabase "JWC Booking Live"; a tested pricing engine (`lib/booking-live/pricing/engine.ts`). Two cards are published: Leeu **Estates** (a SAMPLE card) and Lion Sands 2027-V1. | No card, and no Airtable property row, for **Leeu House** or **Ellerman House**. |
| ALBIE | `lib/rates.ts` + `/api/rates`: the site reads the public page of the house booking engine (`book.wildearthstays.com`) and parses room names and the first price after each. Cached 15 minutes. | No ALBIE API, no credentials, no test or sandbox integration. It is a page reader, not a contract with TAG. |
| Payments | A gateway seam for Stripe Checkout, webhook settle, refunds, idempotency keys, `payments` table. Off unless three env vars are set. | No payment has ever been recorded (`payments`, `bookings`, `quotes` all hold 0 rows). No sandbox keys were visible to this session. |
| Advisor Portal | Advisor Desk, invitations, DNA, requests, commission ledger tables; 6 advisor rows; `?advisor=slug` attribution on `/plan` links. | Advisor share % is blank in Airtable Partner Brands ("until James sets it"). |
| Travel Ledger / Folio | `folios`, `folio_items`, members, invitations; Ledger IDs issued by the Library. | One Folio row exists. No booking has been filed to a Folio. |
| Vercel | The branch built through the GitHub integration. | The Vercel connector in this session could not see the project (empty list, 404), so env vars could not be inspected and no share link could be made. |

## 2. The three pilot products, as the records hold them today

| Product | Canonical ID | Price source on file | Gaps |
| --- | --- | --- | --- |
| Leeu House, Classic Room | `STY-2026-000149`, Supabase slug `leeu-house`, engine property `leeu-house` | Live total per room and plan from the booking engine page, in USD | No room records in Supabase; no tax breakdown, deposit, cancellation or settlement currency in what the engine page gives us. Booking mode is `inquiry`. |
| Ellerman House | `STY-2026-000075`, Supabase slug `ellerman-house` | Published rand rates by season in `lib/content/stay-rooms.ts` (corrected in Round 2; the first pass missed this file). | The contracted card: VAT and levy treatment, deposit, cancellation, minimum stays, occupancy. |
| Magellan Explorer | `VSL-2026-000034`; voyage slugs and sailing dates from `lib/content/polar/voyages/*.json` | Antarctica21's published **from** fare per person (double cabin) per dated sailing, checked 8 Nov 2026. Classic Antarctica Air-Cruise: 49 sailings filed, one sold out, from US$15,995 to US$19,995 pp. | Fares by cabin category (seven categories, none priced), cabin availability, deposit amount, payment schedule, cancellation scale. |

FX on file: 16.69 ZAR to US$1, European Central Bank reference rate of 30 Oct 2026 (`lib/content/rates/fx.json`).

## 3. What was built

- `lib/checkout/journey.ts` · the rules, pure and tested: verified vs indicative vs missing prices, three-pile totals,
  ZAR to USD display conversion, night-by-night seasonal pricing, payment-method gating by supplier policy, the
  simulated provider, card-data refusal, the three separate statuses, the Ledger and commission hand-off record.
- `lib/checkout/pilot.ts` · the three products, read from existing records. No new IDs, rates or product records.
- `components/checkout/*` · the seven screens.
- `app/preview/journey-cart` · the page. `noindex`, linked from nowhere, 404 in Production.
- `app/api/preview/checkout/simulate` · the stand-in payment provider. 404 in Production.
- `app/api/preview/checkout/rate-card` · read-only: a pilot property's published, non-sample card. 404 in Production.
- `tests/journey-cart.test.ts` · 10 tests (suite total 387, all passing; typecheck, lint and build clean).

## 4. Screen by screen

1. **Build Your Journey** · three chapters. Leeu House: dates and adults, then "Check live price and rooms" asks the
   booking engine and lists only rooms it prices, Classic Room pre-selected. Ellerman House: dates, room category,
   adults; no price until a card exists. Magellan Explorer: voyage, dated departure (sold-out sailings cannot be
   chosen), cabin category, guests. Experiences can be ticked on each; they are requests, never priced. Add any
   product more than once.
2. **Journey Cart** · every line with its Ledger ID. Edit reopens the same controls and asks the source again;
   Remove takes its experiences with it. The cart survives a refresh in the tab; traveler details are never stored.
3. **Pricing Review** · per line: basis, source, time asked, supplier currency, conversion, settlement currency,
   standing. Three totals that never mix: Verified today, Published from fares (not in the total), Awaiting a price.
4. **Fees & Inclusions** · per product: each tax, levy and charge as Included, Added, Not applied or Not on file;
   included and not included lists (Antarctica21's are complete; the stays say what is missing); deposit, balance and
   cancellation as on file.
5. **Traveler Registration** · lead traveler name, email, optional phone and country; companion names; house advisor
   (locked when the traveler arrived by `?advisor=slug`) and an optional outside advisor or agency. No passport, date of
   birth or payment field exists.
6. **Payment Selection** · one transaction per chapter. Pay Now, Deposit Now, Pay at Property and Advisor Assisted
   each show Open or Not open with the reason. Tester controls can force a decline or try a closed method.
7. **Journey Confirmation** · per chapter, three statuses side by side: Booking request, Payment, Supplier
   confirmation. Supplier confirmation always reads pending. The hand-off record the Ledger would receive is shown,
   marked not written.

## 5. Functional versus simulated

| Capability | State |
| --- | --- |
| Multi-product cart, edit, remove, experiences, three-pile totals | **Functional** |
| Leeu House live price | **Functional code path**, through the existing `/api/rates`. Not confirmed from the build workspace, which cannot reach the engine; check it on the preview. |
| Ellerman seasonal pricing, USD first with ZAR kept | **Functional**, from published rates (Round 2). A published, non-sample contracted card for `ellerman-house` takes over by itself once synced. |
| Villas, residences, land journeys | **Functional** as described in Round 2; land journeys are unpriced by design. |
| Magellan Explorer departures and from fares | **Functional**, from filed data. Indicative only. |
| Sold-out sailings blocked | **Functional** |
| Advisor attribution (`?advisor=`), carried to every line | **Functional in the cart**; not saved anywhere. |
| Payment provider | **Simulated.** Deterministic answers by idempotency key. No keys, no network, no money. |
| Booking request, Ledger / Folio records | **Simulated.** Shown as a hand-off record; nothing written. |
| Supplier confirmation | **Not simulated at all.** Always pending. |
| Commission | **Not calculated here.** Only the commissionable base (verified room or fare, no taxes) is handed across. |
| Emails, notifications | Not built. |

## 6. Missing data and capabilities

**ALBIE / TAG (Leeu House)**
1. An API or data feed with credentials and a sandbox. Today the site reads a web page; a layout change at TAG breaks it silently.
2. Tax and levy itemisation per rate (is VAT inside the total; tourism levy).
3. Rate-plan terms: inclusions, deposit, cancellation, refundability.
4. Source and settlement currency (the page is asked for USD; the hotel's contract currency is not returned).
5. A rate or quote ID and its validity window, so a price can be held and re-verified at payment.
6. Real availability and a hold or booking endpoint with a confirmation number.
7. Whether TAG permits payment to be taken on the house site, or only on the engine.

**Ellerman House**: the Draft card in Airtable completed (VAT and levy, deposit, cancellation, minimum stays, occupancy), approved and published.

**Antarctica21**: fares by cabin category per departure, cabin availability, deposit and payment schedule,
cancellation scale, and whether the house may collect deposits on its behalf.

**Payments**: a provider decision and sandbox keys (the house adds keys itself); the merchant model per supplier
(Airtable has every partner on "Supplier-direct until reviewed"); multi-currency settlement; a design for several
transactions inside one journey, since the existing `payments` table hangs off one booking.

**Decisions needed from James**
- **Florida sales tax.** Settled in Round 2: none. Removing the 7% from the shared engine is the open task.
- **Displayed prices.** Prices came off the public site on 7 Nov 2026. This preview shows prices; it is unlisted and
  cannot run in Production.
- Advisor share % (blank in Airtable), and the 70 / 30 reading still marked "Confirm" in `COMMERCIAL-RULES.md`.

## 7. Audit

**Security**
- No card field exists. The simulator and the lead-traveler check refuse anything card-shaped (card-like keys, or 13 to 19 digits passing Luhn).
- No secrets added, read or logged. The rate-card route uses the public anon key, so row-level security decides; it never touches net rates or commission tables.
- Traveler details live in page memory only: not in storage, not sent to any server except, for payment, a line ID, method and amount.
- All three new routes return 404 in Production. The page is `noindex`.
- The preview deployment sits behind Vercel sign-in (checked 15 Nov 2026: an anonymous visit is sent to the Vercel login). Open: The simulator has no rate limit; acceptable for a preview, not for a live route. Traveler, advisor and admin permission separation is untested here because nothing is saved.

**Pricing accuracy**
- No rate, tax, deposit or fee was typed in by hand. Every figure traces to the engine, a published card or a filed operator fare, with provenance printed.
- A from fare never enters the total and can never be charged (tested). A night outside a card, or a party over base occupancy, returns no price (tested).
- Weakness: the Leeu price depends on parsing a web page. If the parse matches the wrong figure the cart would show it as verified. Until TAG supplies a feed, treat "live" as "as read from the engine page".
- Weakness: the engine total is not re-asked at the payment step. A live build must re-verify and hold the quote.

**Advisor attribution**
- The advisor's Ledger ID is on every line of the hand-off, with any outside advisor noted. A link-assigned advisor cannot be changed by the traveler.
- Not yet: writing it to `quotes` / `bookings`, external advisor IDs (IATA / CLIA) as structured fields, and the call into Advisor Rates & Commissions.

**Checkout behaviour**
- One idempotency key per cart, line, method and amount; a repeat returns the same reference (tested). Each chapter is its own transaction.
- A decline keeps the traveler on Payment Selection. A closed method is refused with its reason.
- Confirmation never says confirmed (tested).

## 8. SEO and AEO notes (marketing director's view)

- Checkout, cart and preview routes stay `noindex` and out of the sitemap for good. They should never compete with stay and voyage pages.
- When prices return to public pages, publish `Offer` structured data only for verified prices with a `priceValidUntil`; never for from fares presented as totals. Answer engines repeat structured prices as fact.
- The plain-language answers this build needed are the ones travelers ask assistants: "what is included", "is VAT included", "what deposit", "can I pay at the property". Each belongs as a short question and answer on the stay or voyage page, sourced from the same card fields, so the page and the checkout can never disagree.
- Keep Ledger IDs and consistent names (Leeu House, Ellerman House, Magellan Explorer, Antarctica21) in visible text; entity consistency is what gets a house cited.

## 9. Acceptance checklist

- [x] Feature branch only; nothing merged, nothing deployed to Production
- [x] Seven screens, clickable end to end, desktop and phone
- [x] Three pilot products on existing IDs
- [x] No invented rates, taxes, deposits or availability
- [x] USD first, source currency kept (rand shown for Ellerman House; euros await a filed rate)
- [x] Separate transactions per chapter, idempotent
- [x] Advisor carried on every line; commission not recalculated
- [x] Payment simulated; no card data accepted
- [x] Payment, request and supplier confirmation kept apart
- [ ] Leeu House live price seen working on the preview (to check)
- [ ] Ellerman House Draft card completed and published
- [ ] Antarctica21 cabin fares and deposit terms supplied
- [x] Florida sales tax rule settled: none
- [x] 7% removed from the shared pricing engine: branch `remove-florida-sales-tax`, approved by James, awaiting merge to go live
- [x] EUR rate filed (0.8951 euros to US$1, ECB reference rate of 30 Oct 2026); Casali di Casole now shows US dollars first
- [ ] Ledger / Folio writes (next session, on a Supabase branch, after approval)
