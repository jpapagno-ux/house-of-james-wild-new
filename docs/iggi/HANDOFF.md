# Iggi ↔ advisor handoff — the contract between this site and Iggi Core

Agreed with James, 31 Oct 2026. The house is **advisor-led, advisor-built**: an
advisor is the face on every page; Iggi works for that advisor and hands the
traveller to them. Prices, availability and bookings always go to a person.

This file is what the Base44 app (Iggi Core, `wild-journey-intel.base44.app`)
must read and send. The site side of it ships in PR "advisor-iggi-handoff".

## 1. The advisor on the page

- `James` (`james-papagno`, ADV-1982-000001) is the advisor on every page while
  the house is in testing. Advisors who have carried or slept in the place —
  stand-ins included, labelled "stand-in" — appear beside him from the book
  (`advisorsFor` in `lib/content/advisors.ts`).
- The one exception: an advisor's own profile (`/advisors/[slug]`) tells Iggi
  that advisor (`ctx.advisor = slug`).
- The embed URL carries `advisor=<slug>` and `advisorsFeed=<origin>/api/v1/advisors`.
  Core reads the feed for names, roles, marks and each advisor's `plan` URL.

## 2. Messages Core sends to the page (`window.postMessage`, origin-checked)

| type | fields | page behaviour |
|---|---|---|
| `ji:resize` | `height` | resizes the iframe (480–920) |
| `ji:open_app` | `path`, `external?` | `external` → same-origin path on this site; else opens Core |
| `ji:folio` | `folio` (Folio object, see `lib/folio/shelf.ts`) | shelves it on the device (and the account when on) and shows "Open My Folio / Plan with {advisor}" |
| `ji:open_folio` | `fol?` | opens `/folio` |
| `ji:inquiry` | `entitySlug?`, `fol?`, `q?`, `notes?`, `advisor?` | **the handoff** — see §3 |

## 3. `ji:inquiry` — Iggi hands the traveller to a person

Send it when the traveller asks for a price, availability, a booking, or says
they want to talk to someone, after Iggi has said the approved line
(`iggi.handoff.advisor` in `lib/content/dialogue.ts`):

> "I'll pass your questions to an advisor, a person…"

Fields:

- `advisor` — slug; omit to use the advisor on the page.
- `fol` — the Folio ID if one is open (`FOL-YYYY-NNNNNN`, or `JRN-YYYY-NNNNNN` for the Journey Sketch a chat opens — Contract A6).
- `q` — the place in words, ≤ 120 chars ("Monwana, Thornybush").
- `notes` — **what Iggi learned**, ≤ 600 chars, plain text, written for the
  advisor: who's travelling, when, what they care about, what Iggi already
  ruled in or out, anything to check. No prices. No invented memories of James.

The page then opens
`/plan?from=iggi&advisor=<slug>&folio=<fol>&q=<q>&notes=<notes>`.
`/plan` shows "Writing to {advisor}", the Folio and a "What Iggi learned" box,
and sends all of it with the enquiry (`context.notes` in `lib/enquiry.ts`).
If `notes` is missing but a Folio is on the shelf, the Folio summary is used.

## 4. Where the enquiry goes

`app/api/enquiry/route.ts` → the enquiry record (Airtable base "James Wild & Co
— Enquiries", `lib/enquiry-record.ts`) → Resend. Every enquiry gets an
`ENQ-YYYY-NNNNNN` ID, carried in the email subject and shown to the traveller.

- To a real advisor directly, **hello@ copied**, when the base's Advisors table
  has their Inbox (active, not a stand-in). `ADVISOR_INBOXES` is only the
  fallback if the table can't be read.
- Otherwise — James, stand-ins, anyone unlisted — to hello@ alone.
- The email carries: Writing to, Folio, Destination, Route, Asked about, Trip
  and a "What Iggi learned" block.

## 5. Safari readings → Crux

Unchanged. A pure safari reading walks over to Wild & Co Safaris with
`iggi.handoff.crux` ("That's a safari reading through and through…") and the
single door `/safaris/wild-co-safaris`. Crux reads the same advisor feed.

## 6. Core side — done 1 Nov 2026 (Journey Intelligence checkpoint "Advisor handoff contract")

1. `ji:inquiry` now carries `fol`, `q` (the traveller's first question) and
   `notes` (a ≤ 600-char brief written by Iggi from the chat, stored on the
   Inquiry too); the Folio is opened first so the number travels.
2. Iggi addresses the traveller to the page advisor by first name; when the
   roster feed is down the handoff still names James (ADV-1982-000001).
3. Approved lines are used verbatim in the handoff aside, the confirmation and
   the prompt. `handoff_target: "crux"` is set for a pure safari reading; the
   embed shows the Crux line and posts `ji:open_app { crux: true }`, which this
   site routes through the one door, `/safaris/wild-co-safaris`.

Still open: the Core does not yet write the Airtable enquiry row itself; the
row is written when the traveller reaches `/plan`. Core→Airtable comes with
the Desk's "unfinished handoff" view, if James wants it.
