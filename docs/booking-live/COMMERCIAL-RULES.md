# Booking Live: commercial rules (owner's build notes)

These are James's standing rules for every phase of Booking Live. Anything that
prices, books, pays or reports must follow them. The source is the owner's notes
of 27 Oct 2026.

Status key:
- **Built**: in the code now.
- **Planned**: scheduled for the phase named.
- **Confirm**: a wording point James still needs to confirm.

---

## 1. Partner commission (differs by partner)

Each partner pays the house its own commission, and the rates vary across the
partner library.

| Rule | Status |
| --- | --- |
| Commission is stored per partner contract in Airtable **Contract Terms** (`Commission %`, `Rates are net`), linked to the partner's rate card. Each new card or season can carry a different figure. | **Built** (Phase 2) |
| Commission and net rates are never readable by browsers, Base44 front-ends or guests. Only the server and finance roles can see them. | **Built** (Phase 2, access rules) |
| A **default commission per partner** sits on the Properties table, so a new card picks it up unless its Contract Terms override it. | **Planned**, Phase 2b |
| Commission is earned on the **commissionable base** only: room, land or vessel cost after offers. It is **not** earned on local taxes, government fees or the 7% Florida sales tax. | **Planned**, Phase 3 (commission ledger) |
| Net-rate partners: the house's margin = sell price − net. It is recorded the same way as commission. | **Planned**, Phase 3 |

## 2. How a price is charged (rate basis)

Every rate row in Airtable will carry a **Rate Basis**. The engine prices each
night according to it, and checkout charges the result.

| Rate Basis | Typical use | How a night is priced | Status |
| --- | --- | --- | --- |
| **Per room, double occupancy** | Most lodges and resorts | Rate covers 2 adults. A 3rd adult or a child adds the Extra Adult or child-band charge. A single traveller pays the room rate unless a single rate is set. | **Built**: Base Occupancy = 2 plus Extra Adult and child bands |
| **Per room, price shared** | Suites and villas sold by the room | One rate for the room, shared by everyone in it up to its Max Occupancy. No extra-person charge. | **Built**: Base Occupancy = Max Occupancy, no Extra Adult |
| **Per person sharing** | Safari camps, some lodges | Rate × adults, plus child bands. A single traveller pays the single supplement if the card has one. | **Planned**, Phase 2b (new Rate Basis field and engine rule) |
| **Per house, per night** (residences) | Family residences, private villas | One nightly price for the whole house, shared by up to that house's limit (up to 14 guests; varies by residence). Guest count never changes the price; it only has to be within the limit. | **Planned**, Phase 2b. Today it works as "per room, price shared" with Max Occupancy set to the house limit. 2b adds the field so it reads clearly in Airtable and on quotes. |
| **Per person, per departure** (voyages) | Vessels and cruises | Cabin category price per person for a dated departure. | **Planned**, Phase 2b (Voyages tables) |

The checkout total always follows the same order, whatever the basis:
1. Nights (or departure) at the basis above.
2. Minus offers.
3. Plus local taxes and fees.
4. Plus the 7% Florida sales tax on that total.

The deposit and balance follow the card's payment terms. Phase 3 checkout
charges exactly the stored quote and never re-prices in the browser.

## 3. Advisor (agent) split

| Rule | Status |
| --- | --- |
| Default split: the advisor receives **70%**, the house keeps the remaining **30%**. | **Planned**, Phase 3 |
| The split is calculated on the **room fee, or the land or vessel cost, only**: never on taxes, government fees, the Florida sales tax or third-party extras. | **Planned**, Phase 3 |
| A **per-advisor override** (a toggle plus a percentage on the advisor's record) replaces the 70% for that advisor. A per-booking override is available to admins, with a reason, and is audit-logged. | **Planned**, Phase 3 |
| Each booking stores the split as it stood when the booking was made, so a later change to an advisor's split never rewrites past bookings. | **Planned**, Phase 3 |
| Advisor earnings show in the Base44 Advisor Desk (Commissions), and house earnings in Administration. Advisors see only their own figures. | **Planned**, Phase 3 |
| **Confirm:** we read "70% of just room fee or land and vessel cost" as 70% of the **commission (or margin)** the house earns on that cost, not 70% of the cost itself. | **Confirm** |

Worked example (on our reading): a lodge stay with US$10,000 of room cost, 20% partner commission:
- Commission: US$2,000.
- Advisor: US$1,400 (70%).
- House: US$600 (30%).
- Taxes and the Florida sales tax are excluded from all three figures.

## 4. Advisor-recorded bookings

Advisors can also record a booking made directly with a partner, by phone or
email. It goes into the same bookings table with:
- `source = advisor`
- the advisor's name
- partner, room or cabin, dates and price
- the partner's confirmation number

The commission and split rules above apply to it, and it appears on the Base44
dashboards. **Planned**, Phase 3.

## 5. Categories and sources

| Rule | Status |
| --- | --- |
| Every partner has a **Stay Type** (Lodge, Resort or Family Residence) and a **Rate Source** (Rate Card or Live API). | **Built** (Phase 2) |
| Voyages are tracked separately, by vessel name, voyage, departure date, year and cabin category. Their price source is either an uploaded rate card or the price published on the partner's website, with the date it was last checked. Voyages are always on request. | **Planned**, Phase 2b |
| Live API partners keep pricing from their rate card until their connection is certified. | **Planned**, Phase 4 |
