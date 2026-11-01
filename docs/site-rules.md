# Site rules

## Nothing past its date shows (James, 1 Nov 2026)

Dated content (offers, departures, sailings, sessions) is hidden automatically once its end date
passes; the site rebuilds daily. Weekly and monthly syncs (to be built) also re-check terms and
pull new dates.

**One helper.** Every date check goes through `lib/dates.ts`:

- `today()` is the date in the house's time zone (`America/New_York`).
- `isPast(end, on)` is true once a date's last day is before `on`. A month (`2027-08`) counts to
  its last day, a year to 31 December, and undated or unreadable dates are never past.
- `activeOnly(items, getEnd, on)` keeps what has not ended. `withActiveDepartures` and
  `activeGroups` apply it to ship departures and voyage sailing groups.

Never write `new Date()` comparisons for content elsewhere; call the helper. Tests:
`tests/dates.test.ts` (each passes a fixed "today").

**What it covers**

| Content | Where | Ends on |
|---|---|---|
| Offers (Offer Ledger, Cayuga cards) | `lib/content/offers/offers.ts` `liveOffers()` | travel window end, or a Final Call's departure if earlier |
| Nile ship departures and season bands | `lib/content/ships/nile/index.ts` | `dateTo`, else `date` (a band under way stays) |
| Aliikai sailings and voyage-page sailings | `lib/content/ships/aliikai.ts`, `lib/content/trips.ts` | the sailing date |
| House Sessions | `lib/content/workshops.ts` | the session's day; then only its recording shows |
| What's Coming | `lib/content/whats-coming.ts` | the opening/reopening date ("reopened" entries stay) |
| MORE rate-card years and offers | `components/booking/RateCardSection.tsx` | `validTo` |

"From" prices, counts and the Nile compare table read only what remains, because past departures
are removed where the data is loaded. A ship or voyage with nothing left keeps its page and shows
"New dates to be announced, ask James" (`components/ships/NoDates.tsx`).

**Deliberately not filtered:** historical dates (founder trips, Ledger stamps, published and
modified dates, `checked` dates, film upload dates) and fixed prose that names a year or month
(guides, FAQs); those are reviewed with the content.

**Daily rebuild.** The site is static, so "today" is the build date. The nightly Library sync
(`.github/workflows/library-sync.yml`, 06:17 UTC) deploys when it commits; when it has nothing
to commit, or fails, its "Daily rebuild" step calls the Vercel Deploy Hook in the repository
secret `VERCEL_DEPLOY_HOOK`. Without the secret the step prints a notice and the site only
rebuilds when something changes. To set it up: Vercel, Project, Settings, Git, Deploy Hooks,
create a hook for `main`, then add its URL in GitHub as the repository secret
`VERCEL_DEPLOY_HOOK`.
