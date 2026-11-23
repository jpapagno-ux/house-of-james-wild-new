# House rules for anyone building this site

## Colour: The House Standard (James approved, 2 Nov 2026)
- Five warm tones, one accent, one gradient: Paper `#FFFFFF`, Stone Mist `#F4F2EF` (the only band), Warm Stone
  `#8C8277` (text `#6B635A`), Graphite `#2E2B28`, Ink `#1A1816`; keylines `#CFC8BF`, borders `#DCD7D0`. Source:
  `lib/palette.ts`. Photography carries the colour.
- House Crimson `#8B2525` is the single accent: seal, logo and rule, Ledger IDs, key dates, "Plan with James".
  One or two crimson touches per screen. `--jw-accent` / `.ledger-crimson` / `text-crimson` are Graphite now; use
  `text-house` / `.ledger-id` for real crimson.
- The one gradient, Ink to Garnet (`#1A1816, #2E2B28, #3A1C1F, #5A1F23`): hero photo fades, the ticker, the opening.
- Volumes (the Heritage set) come only from `lib/volumes.ts`: a 5px tab, map pins and an occasional volume-mist
  panel, never sections, buttons or chips; volume words use the deep (`volumeInk`). Never write a volume hex anywhere
  else: `volumeCss()` feeds the CSS variables and `npm run check:palette` (before every build) fails on drift.
- The button family (James, 2 Nov 2026): the Ledger column for the main action (`.ledger-btn--house` / `--solid` /
  any `.ledger-btn` to `/plan`: 56px, Ink border, crimson arrow cell), the editorial line for quiet links (`.ledger-btn`,
  `.ledger-btn-ghost`: Cormorant italic, crimson arrow and rule), the seal once on the homepage (`.jw-seal-cta`).
  Chips, filters, tabs and search stay squared graphite (`.house-chip`), never pills. Never style a button per page.
- Wild Pathways colour on stay pages (James, 21 Nov 2026: "lock in design for stays"). A stay with an approved pathway
  grounds its hero in the deep pathway colour (the pathway colour mixed toward ink) and the photograph fades into it, low: the photograph stays clear and the colour rises only behind the title (James, 21 Nov 2026: "lowering the tint so you can see the images better");
  the pathway stamp sits on the hero photograph in white ink, transparent, with one press-in and a slight drift (none
  under reduced motion); one slim tinted pathway row under the jump links; a faint pathway tint on the page ground
  (cards stay white); the bottom bar in the deep pathway colour. This is the one exception to the white ground and to
  Ink to Garnet as the hero fade, and it lives only inside `.journal-style` stay pages. Pathway colour comes only from
  the pathway scope (`.pathway-0N`, `--jw-path`): never write a pathway hex in a component. House Crimson stays the
  single accent. A stay with no approved pathway keeps the ink hero. No other tinted bands or sections.
- Stay pages: Field questions fold (first one open); every answer stays in the page source and the FAQ markup is
  unchanged; no photographs inside the questions (James, 21 Nov 2026).
- Pathway chips are graphite outlines with a 6px pathway dot. River waters and The Exceptional Few are protected.
- No em or en dashes in public copy; no parchment textures. Tans sparingly (James, 2 Nov 2026: "I like tans but not
  everywhere"): an occasional tan panel, tag or accent is fine; never the ground of every section or page.
- Media: one Cloudinary library for every site; rights in structured metadata, one copy per
  image, folders = public_id path (see `docs/brand-colours.md`, "Media").
- No hare in the house watercolours (James, 23 Nov 2026): sign-in trails, Europe plates, the founder's sketchbook,
  guide and voyage plates and the email header show the place only. Do not paint the hare or Iggi into new plates.
- Full rule: `docs/brand-colours.md`.

## Sources (James, 31 Oct 2026)
- Facts, photos and pins for a property come only from that brand's own website (or its owner's
  media kit). Never use competitors as a source: other agencies, tour operators, booking sites,
  review sites or third-party guides. If the brand site can't supply it, flag the record for
  follow-up in Stay Studio instead of filling the gap.

## No outbound links, no competitor data (James, 13 Nov 2026: "a hard freeze")
- Never link out to an operator's, hotel's, cruise line's, tour company's, booking site's or OTA's pages, on any
  page: stays, voyages, ships, partners, gatherings, guides. Facts from a partner's own site are fine, filed with
  their source kept in the data (`sources`), never printed as a link. Every enquiry goes to the house (`/plan`).
- Never collect data from competing tour operators, travel companies, booking sites or OTAs.
- Check with `scripts/audit/external-links.mjs` (the External links audit workflow) after any content build.

## What's coming (James, 31 Oct 2026)
- Lodges that are announced, opening or rebuilding are tagged "WHAT'S COMING SECTION" in their
  Stay Studio review notes (Singita Elela, Dec 2026; andBeyond Xaranna Okavango Delta Lodge,
  Aug 2027). A dedicated site section will be built later as a separate build.

## Verified facts (James, 1 Nov 2026)
- Before writing about any property, check `docs/verified-facts.md`. Facts there override older copy
  anywhere on the site (e.g. Wilderness Ruckomechi: suites not tents, swimming pool not infinity pool,
  closed 20 Nov to 31 Mar).

## Tengile MalaMala (James, 20 Nov 2026: "a site wide rule")
- Kirkman's Kamp and Tengile River Lodge are Tengile MalaMala Collection lodges, with Rattray's Lodge, MalaMala Camp
  and Sable Camp. Never label, credit or group them as &Beyond, anywhere: stays, maps, journeys, Grand Traverse, Atlas,
  Iggi, partners. Source is tengilemalamala.com only, never andbeyond.com. `tests/brand-rules.test.ts` fails on drift.

## Dates (James, 1 Nov 2026)
- Dated content (offers, departures, sailings, sessions) is hidden automatically once its end date
  passes; the site rebuilds daily. Weekly and monthly syncs (to be built) also re-check terms and
  pull new dates. One rule, one helper: `lib/dates.ts`. Full rule: `docs/site-rules.md`.

## Where the house sells (James, 1 Nov 2026)
- No Habitas properties anywhere (Habitas closed Tulum and Namibia; records are excluded in the library).
- No Middle East stays, pages or maps (e.g. UAE, Oman, Jordan, Saudi Arabia, Qatar, Israel). Turkey may be added later.
- Egypt and Morocco are Africa, not the Middle East, and can be sold.
- No Malawi (James, 31 Oct 2026). Ethiopia is a future country (Lale's Camp held).

## Stay template, locked (James, 22 Nov 2026: "fix this as the template and lock in the template")
- Stays listed in `lib/journal-style/template-stays.json` render the locked layout, in this order: full-screen hero (film
  where filed) with the pathway colour rising behind the title and the pathway stamp in white, legible on phone and
  desktop; Why We Added It to the Portfolio (italic serif intro, reasons folded, no boxed lines); a photo chapter; rooms
  as swipe cards with filed prices; a photo chapter; What You Can Expect (experiences and features, once); offers; Iggi in
  his card, above the map; map; How to Reserve (no sample quote; one line for the host call); questions; the pathway.
- Say each thing once. One house icon and one heading style per section. No advisor line or pathway chips under the hero.
- Round two (James, 23 Nov 2026): the intro is a written traveller introduction of two or three sentences from the
  stay's own filed facts, kept in `lib/journal-style/intros.json` (no Ledger ID or "filed in the Ledger" wording on the
  page; the answer paragraph stays in the structured data). Beside it sits the at-a-glance grid with icons (Best for,
  three at most; best months; rooms; from price; nearest airport; pathway), filed facts only; "Who it is for" is not
  repeated lower down. Photo chapters pin while the words rise; sections arrive softly (none under reduced motion).
  What You Can Expect runs across the page in the intro's italic serif. One short rates line under the rooms.
- Talk to the house: Iggi lives in a panel (right side on desktop, bottom sheet on phones), opened from a slim row
  after offers and from the bottom bar: Iggi first with answers scrolling inside the chat, then Call, Live call (the
  host where one is filed, else James) and The team pinned below. Iggi's own logic is untouched.
- New stays join by adding their slug to that file and an introduction to `intros.json` (`tests/journal-style.test.ts`
  fails without one). Change the template only when James asks.
- No vertical lines (James, 23 Nov 2026: "I do not want any vertical lines on the site anywhere"): no accent bar beside
  text and no column dividers on public pages; separate with space and horizontal hairlines. `app/globals.css` removes
  them site-wide (desks, tables and form steppers excepted); do not add new ones. Scroll effects only where they help.
- Phones: How to Reserve is the request form only; the sticky bar carries the price and Check dates.
- Search opens to the box alone: recent items or three starting points, nothing else before typing.
- Check availability shows only on stays listed in `lib/booking-live/rate-card-stays.json` (a Published rate card in
  Booking Live). Add the slug as the last step of `docs/booking-live/RATE-CARD-PUSH.md`.
