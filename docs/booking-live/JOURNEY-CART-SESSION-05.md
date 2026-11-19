# Journey Cart · Session 05 report and audit

19 Nov 2026 · branch `feature/journey-cart-saved-carts` · staging database only · simulation only.
James, 19 Nov 2026: "US $6840 is correct. Go." (database save, steps 1 and 2).

## 1. What was done

| Item | State |
| --- | --- |
| `journey_carts` table on the staging database (`partner-preview`) | Created |
| Save route and open route, `/api/preview/checkout/cart` | Built |
| Send to client saves the cart and gives a short link | Built, falls back to the long link where staging is not connected |
| Opening a short link loads the cart and prices it again | Built |
| Lion Sands Ivory Suite marked as a firm rate in Airtable | Edited, waiting for James's approval there |
| Advisor's list of saved journeys | Not built (step 3) |
| Enquiry record on Enquire to Confirm | Not built (step 4) |

## 2. What is stored, and what is not

One row per saved journey: a random 32-character token, the advisor's slug and Ledger ID, a status (`sent`, then
`opened` the first time the link is read), the choices (chapter, room or cabin, dates, guests, experiences), and an
expiry 30 days out.

Never stored: prices, names, email, phone, payment data. Every price is asked again from its source on open, so a
stored cart can never show a stale or altered figure.

## 3. Safeguards

- The routes return 404 on the live site. They run on Vercel previews only.
- They talk only to the database named by `CHECKOUT_STAGING_SUPABASE_URL`, and refuse to run if that setting is
  missing or points at the live database.
- The table has row level security on and no access for visitors or signed-in users. Only the server can read or
  write it.
- A saved row is validated on the way in and again on the way out. Anything malformed or card-shaped is refused.
- The live database was not touched. The table exists on staging only and is not in `supabase/migrations`.

## 4. Lion Sands Ivory Lodge rate

James confirmed US$6,840 a night for the Ivory Suite. In Airtable (Commercial Rates), on card `2027-V1`:

- The Ivory Suite season was renamed from "Standard 2027 (library from-rate x2, verify)" to "Standard 2027".
- The card's Revision was raised from 2 to 3.

Approved Revision is still 2, so the sync holds the card at its last approved state and the site still shows the
estimate. **James sets Approved Revision to 3 on that card to publish the change.** The other seven Lion Sands rooms
keep their "verify" labels: only the Ivory Suite was confirmed.

## 5. Audit

| Rule | Result |
| --- | --- |
| No live payment, no card data | Pass |
| No production bookings, policies or payment settings changed | Pass |
| Production rates | One label and one revision number edited in Airtable on James's confirmation; not published until he approves |
| Staging only for new data | Pass |
| Advisor stays attached | Pass. Stored on the row and carried in the link |
| No price stored or trusted from storage | Pass |
| Tests | 422 passing, 17 in the cart file (1 new) |
| Type check, lint, production build | Pass |

**Not verified, said plainly:** the save and open routes have not run against the staging database end to end,
because the two Vercel settings are not in place and this workspace holds no database key. What was checked: the table
accepts exactly the row the route writes, the round trip of stored choices to a link code (by test), and the fallback
to the long link.

## 6. Acceptance checklist

- [ ] Add `CHECKOUT_STAGING_SUPABASE_URL` and `CHECKOUT_STAGING_PUBLISHABLE_KEY` in Vercel, Preview only.
- [ ] Redeploy the preview for `feature/journey-cart-saved-carts`.
- [ ] In advisor view, press Send to client. The link is short and ends in `&j=` and 32 characters.
- [ ] Open the link in another browser. The same journey opens with the advisor attached.
- [ ] In Airtable, set Approved Revision to 3 on the Lion Sands card. After the next sync the Ivory Suite shows
      US$20,520 for three nights without "est.".

## 7. SEO and AEO

No public page changed. Saved journey links are tokens on a noindex page, so no client journey can be crawled.
One thing to carry forward: once the Ivory Suite rate is approved, the Lion Sands stay page can state a firm
"from US$6,840 a night for two" for 2027, which is the kind of plain, dated price answer engines quote. The other
Lion Sands rooms must keep "to be confirmed" until each is verified.

## 8. Next

Step 3, the advisor's list of saved journeys with status. Step 4, an enquiry record when a traveler presses
Enquire to Confirm. Still pending with James: the payment provider for the sandbox.

## 9. Round 2 · 19 Nov 2026 · connected

James asked for the Vercel settings to be added for him. Rather than place a service-role secret in the preview, the
routes now use staging's publishable key and two database functions on staging, `save_journey_cart` and
`open_journey_cart`. The table stays closed to everyone but those functions. Saves are capped at 200 an hour.
Settings added in Vercel, Preview only: `CHECKOUT_STAGING_SUPABASE_URL` and `CHECKOUT_STAGING_PUBLISHABLE_KEY`.
