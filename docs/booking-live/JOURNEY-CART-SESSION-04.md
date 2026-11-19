# Journey Cart · Session 04 report and audit

19 Nov 2026 · branch `feature/journey-cart-session-03` · preview only · simulation only.
Follows `JOURNEY-CART-SESSION-03.md`. Asked for by James on 18 Nov 2026: save the cart, use Lion Sands Ivory Lodge
rates, tell the traveler when a booking is confirmed by enquiry, and the polish items (date clashes, photos on cart
lines, an advisor "send to client" button).

## 1. What changed

| Item | State | Where |
| --- | --- | --- |
| Lion Sands Ivory Lodge as a rate card example | Built | `lib/checkout/pilot.ts`, `app/api/preview/checkout/rate-card` |
| Price route and confirmation route kept apart | Built | `Policy.confirm` in `lib/checkout/journey.ts` |
| "Enquire to Confirm" wording | Built | `ENQUIRE` in `lib/checkout/journey.ts` |
| Estimated rates shown, never totalled or charged | Built | `Price.estimate`, `indicative()` |
| Cart kept on the device | Built | `localStorage`, key `jwc-journey-cart-v2` |
| Send to client link | Built | `encodeJourney` / `decodeJourney`, advisor view |
| Date clash warning | Built | `dateClashes()` |
| Photos on cart lines | Built | cart panel and every line card |
| Cart saved to the Travel Ledger database | Drafted, not applied | `docs/booking-live/drafts/journey-carts.sql` |
| Payment sandbox | Not started | needs a provider chosen by James |

## 2. Can we use Lion Sands Ivory Lodge rates? Yes, with one honest limit

Lion Sands holds the only published, non-sample contracted card in Booking Live: `lion-sands 2027-V1`, revision 2,
synced from Airtable, in US dollars, valid 1 Jan to 31 Dec 2027. It carries what the Ellerman card still lacks:

- Deposit 30%, balance due 60 days before arrival.
- VAT 15% included in the rate.
- Ivory Lodge · Ivory Suite at US$6,840 a night for 2 guests.

The limit: the house itself marked every 2027 season on that card "verify" (James, 4 Nov 2026: Lion Sands' estimated
2027 prices stay on the site as "to be confirmed" until MORE's 2027 rate sheet replaces them). So the cart shows the
figure as **est. US$20,520** for three nights with the chip "Estimated rate · to be confirmed". It stays out of the
priced total, opens no payment, and passes no commissionable base. The moment the season label in Airtable loses the
word "verify" or "estimated", the same line becomes a contracted price with no code change.

Not on the card, and shown as "confirmed with your quote": cancellation tiers, reserve and gate fees, the rate plan's
inclusion list. Product ID used: the existing `STY-2026-290658`. No new ID.

## 3. The logic, as now built

Two separate questions per product. They are never merged.

**Where does the price come from?**

| Route | Example | Counts as priced |
| --- | --- | --- |
| Dynamic, live from ALBIE by TAG | Leeu House | Yes |
| Static, contracted rate card from Airtable | Lion Sands Ivory Lodge | Yes, unless the season is marked an estimate |
| Static, supplier's published rate | Ellerman House, Casali di Casole | Yes (approved 15 Nov 2026) |
| Published from fare | Magellan Explorer | No, indicative only |
| None on file | Land journeys | No, the house quotes |

**How is the booking confirmed?**

| Route | Example | What the traveler can do |
| --- | --- | --- |
| Instant, on the booking engine | Leeu House | Pay Now |
| By enquiry, confirmed by the house by hand | Everything else | Enquire to Confirm. No charge opens before the house confirms |

A product on a rate card with a full deposit policy is still "by enquiry" when the property has no live inventory.
The deposit terms are shown ("A 30% deposit confirms the booking. Taken once the team has confirmed your dates.")
but the Deposit Now button stays closed.

**Words chosen for the action** (change them in one place, `ENQUIRE`):

- Button: **Enquire to Confirm**
- Short line: "Please enquire, and the team at James Wild & Co will confirm your booking."
- Long line: "Please enquire. The team at James Wild & Co checks your dates with [property] and confirms your booking.
  Nothing is paid until they do."
- Confirmation screen: "Enquiry recorded" in place of "Booking request recorded".
- Last button when every chapter is by enquiry: "Send enquiry".

Cart groups, in the traveler's words: Ready to book · Priced, please enquire · Indicative price, please enquire ·
Quoted by the house.

## 4. Saving the cart

Built and working in the preview:

- The cart is kept on the device, so it survives a refresh, a closed tab and a restart of the browser.
- On reopening, every rated stay is priced again from its source. A live ALBIE price older than 30 minutes is dropped
  and the traveler is asked to check it again. Chapters whose dates have passed are removed.
- Names, email and phone are never stored.

**Send to client** (advisor view only): makes a link that opens the same journey with the advisor attached.
The link carries choices only: chapter, room or cabin, dates, guests, experiences. It carries no price, no name and
no email, and it sits after the `#` so it is not sent to the server or written to logs. On opening, each choice is
checked against the catalogue and priced again from its source. A room on the booking engine is chosen again with
its live price. Anything malformed, past-dated or card-shaped is refused.

Not built: saving to the Travel Ledger database. Two things are needed first, both James's call:

1. Which database is "staging". There is none by that name. The choices are the existing `partner-preview` Supabase
   branch (already separate from production, already has bookings and payments tables) or a new branch, which
   Supabase bills by the hour.
2. Two server settings on the Vercel preview pointing at it. The Vercel connector in this workspace cannot see the
   project, so James or a teammate adds them.

The table is drafted in `docs/booking-live/drafts/journey-carts.sql`, deliberately outside `supabase/migrations` so
nothing runs it. Until then, a link only works for someone who can open the preview.

## 5. Polish

- **Date clashes.** Two chapters covering the same nights show a "Dates overlap" note in the cart, on the Journey Cart
  screen and on Review. Leaving one place on the day the next begins is not a clash. It is a reminder, never a block,
  because two parties can travel at once.
- **Photos.** Each cart line shows the product's own photograph, resolved the same way as the stay pages (Cloudinary
  once imported). Land journeys have no photograph on file and show none.
- **Send to client.** See section 4. It also offers "Open in email", which opens the advisor's own mail program with
  the link in the body. Nothing is sent by the site.

## 6. Functional versus simulated

| Functional | Simulated or not built |
| --- | --- |
| Lion Sands price read from the published card through the anon key | Payments, every method |
| Estimate detection from the card's own season labels | Enquiry delivery: nothing is sent to the house or a supplier |
| Enquiry routing and wording | Ledger writes |
| Device-saved cart, re-pricing on open | Database-saved cart |
| Share link encode, decode and validation | Email sending |
| Date clash detection | Commission calculation (handed off, never calculated here) |

## 7. Audit

| Rule | Result |
| --- | --- |
| No live payment, no card field | Pass. No card form exists; card-shaped text is refused in links too |
| No production rates, bookings, policies or payment settings changed | Pass. Supabase was read only this session |
| No second rate engine | Pass. Lion Sands is read from the existing card tables |
| No new product or traveler IDs | Pass |
| An indicative price is not a confirmed rate | Pass. Estimates and from fares sit in their own pile |
| Payment success is not supplier acceptance | Pass. Three statuses, unchanged |
| Advisor stays attached | Pass, including through a shared link |
| Commission stays in Advisor Rates & Commissions | Pass. Estimated lines pass no base |
| No Florida sales tax | Pass |
| No personal data in a URL | Pass. Verified by test |
| Preview only, 404 in production, noindex | Pass, unchanged |
| House rules: palette, buttons, no dashes, no outbound links | Pass. `mailto:` opens the user's own mail, it is not a link to an operator |
| Tests | 393 passing, 16 in the cart file (4 new) |
| Type check, lint, production build | Pass |

**Not verified, said plainly:**

- The Lion Sands card on the Vercel preview itself. Locally the card was supplied to the page from the figures read
  out of Supabase, because this workspace has no database settings. If the preview shows "No rate is published" for
  Ivory Lodge, the preview is missing its Supabase settings.
- Photographs. This workspace cannot reach the photo hosts, so photos were checked as placeholders only.
- Leeu House live price on the preview, still open from Session 03.
- The Lion Sands policy text in `pilot.ts` (30%, 60 days) was written from the card as read on 19 Nov 2026. If the card
  changes in Airtable, the figures price correctly but that sentence needs updating. Next step is to read it live.

## 8. Acceptance checklist for James and Anthony

- [ ] Open the example link. Five chapters appear, with Lion Sands Ivory Lodge showing "est." and a price.
- [ ] Ellerman House and Casali di Casole sit under "Priced · please enquire".
- [ ] On Payment, every chapter except a Leeu House stay offers "Enquire to Confirm" and nothing else.
- [ ] Add Leeu House with live dates. It alone shows "Ready to book" and Pay Now.
- [ ] Close the tab, reopen the start link. The cart is still there.
- [ ] In advisor view, press Send to client, open the link in a new window. The same journey opens.
- [ ] Edit a stay so its dates overlap another. "Dates overlap" appears.
- [ ] Photos show on each line, on phone and desktop.
- [ ] Wording approved, or changes sent: "Enquire to Confirm" and the two sentences in section 3.

## 9. SEO and AEO

Nothing here is indexed: the route is noindex and a 404 in production, and that is correct for a checkout.
The marketing value is in what this logic lets the public pages say truthfully once it goes live:

- **Answer engines favour pages that state how to book in one plain sentence.** Each stay page can carry a single line
  drawn from this same data: "Book instantly at a live price" for engine stays, "Enquire and the team confirms within
  one working day" for the rest. That is a direct answer to "how do I book [lodge]" and "can I book [lodge] online".
- **Structured data must match the route.** An engine stay can carry `Offer` with a price and `InStock`. An enquiry stay
  must not: use `LodgingBusiness` with `priceRange` and no `Offer` price. An estimated rate must never be published as
  an `Offer`. Marking an enquiry-only rate as a bookable offer is the kind of mismatch that loses rich results.
- **FAQ content worth adding to stay pages**, each answerable from data already on file: is the price live or
  confirmed on enquiry, what deposit is due, when is the balance due, is VAT included.
- **Shared journey links are private by design.** They carry `#` data only and the page is noindex, so no client
  journey can be crawled or cached.

## 10. Decisions needed

1. Staging database: the existing `partner-preview` branch, or a new one (billed hourly).
2. Payment provider for the sandbox.
3. The enquiry wording in section 3.
4. Still open from Session 03: Ellerman card details, Antarctica21 cabin fares, the seven ALBIE items for TAG.
