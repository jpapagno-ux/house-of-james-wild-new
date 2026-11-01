# House-wide audit · 1 November 2026

Scope: the whole site as built from `main` at `0d92137` (after the Friday–Sunday run of ~45 PRs from the Iggi Core, Booking Live, chrome and release efforts, plus Wild Pathways 2B–2F). Production flags on (`NEXT_PUBLIC_PATHWAYS`, `NEXT_PUBLIC_IGGI`, `NEXT_PUBLIC_INDEXING`, link guard). Method: static scan of all 1,006 built pages (titles, descriptions, canonicals, robots, H1, JSON-LD, og:image, image alts, internal links, page weight), sitemap vs. indexable set, and axe-core (WCAG 2.x A/AA + best practice) on 30 representative pages at desktop and mobile widths.

## Headline

The house is in good shape. 1,006 pages, 537 indexable, every indexable page has a title, description, canonical, JSON-LD and og:image; no image without alt; no malformed JSON-LD; sitemap and indexable set agree to within 7 pages. 43 of 60 axe scans are clean. The findings below are specific and small, and most sit in one of four components.

## Findings

### A. Fixed in this PR (Wild Pathways surface)
1. **Pathway pages and the Compass named stays that have no page.** Eight classified stays (Birkenhead House, Jabulani, Kruger Shalati, Lepogo, Seseka, Sashwa, Sirai House, Thornybush Reserve) are in the Ledger but not yet released; their cards were link-guarded in the HTML but their URLs still appeared in the ItemList schema and could surface in a Compass reading. `pathwayStays()` now lists only stays with a page (previews still see all). The Compass `ledger.json` inherits the rule.

### B. For the owning effort (small, specific)
2. **axe `scrollable-region-focusable` (serious, 20 instances)** — the horizontal photo scrollers on reserve, camp and stay pages (`ul[aria-label="… photographs"]`), the mobile record bar (`#record-bar`), and the country-page table, are scrollable without keyboard access. Fix: `tabIndex={0}` on the scroll container (or make the first child focusable). Pages: `/safaris/londolozi-reserve` (5), camp pages (2), stay pages on mobile (1 each), `/for-advisors` mobile (1), `/destinations/africa/botswana` mobile (1).
3. **axe `color-contrast` (serious, 16 instances)** — the day/strip ribbon on route and voyage pages (`.h-8.text-paper.text-[10px]`, `.h-8.font-mono.text-paper`: white 10px text on a mid tint) and the advisor page's inline pathway chips at `!text-[10px] !text-current`. These are the same under-4.5:1 pattern fixed house-wide on 30 Oct; 10px uppercase text needs ≥ 4.5:1. Pages: `/voyages/raja-ampat/aliikai-10-day-raja-ampat-north` (4), `/overland/south-africa/the-sand-river-by-road` (3), `/advisors/anthony-papagno` (1).
4. **axe `definition-list` (serious, 4)** — the fact grid on route and voyage pages is a `<dl>` whose children are not `dt`/`dd` pairs (grid wrappers in between). Either make them pairs or use a plain grid.
5. **`region` (moderate, 8)** — content outside landmarks on stay and reserve pages (the record bar and the sticky plan band). Wrap in `<nav>`/`<aside>` with a label.
6. **`empty-table-header`, `aria-allowed-role` on `figure`** (minor, 2 each) — route pages.
7. **Six redirect stubs render as indexable pages with the default title** — `/overland/costa-rica`, `/overland/botswana`, `/overland/south-africa`, `/voyages/komodo`, `/voyages/raja-ampat`, `/preview/safaris/tswalu-reserve` return 308 to their destinations, so Google follows, but each ships a shell with `James Wild & Co | Vetted Safaris, Stays & Voyages` and no canonical/H1. Harmless today; cleaner as `redirects` in `next.config` than as pages.
8. **`/for-advisors/apply` is indexable and not in the sitemap.** A form page: either `noindex` it or add it to `LIVE_ROUTES`.
9. **Title length**: 185 of 537 indexable titles exceed 60 characters (6 exceed 70), all from the `… | James Wild & Co` suffix on long stay names. Google truncates in the SERP but reads the whole title; no action unless CTR data says otherwise.
10. **Seven descriptions under 100 characters, six over 165** — list on request; the long ones are country pages whose description is assembled from counts.

### C. Page weight (Wild Pathways, follow-on)
11. **`/pathways/where-the-wild-lives` is 1.86 MB of HTML** (235 cards, each rendered in HTML and again in the React payload). Next largest: Costa Rica 1.25 MB, `/overland` 1.15 MB, Between Tides 0.96 MB. Proposal: show each country's first eight cards and fold the rest behind a "Show all n in Botswana" control (client component, no layout shift); the ItemList schema keeps every entry. **Done 1 Nov (PR follows):** Where the Wild Lives 1.86 MB → 0.97 MB; Above It All 0.41 MB. Between Tides barely moved (0.96 → 0.90 MB) because its countries hold fewer than eight cards each, which exposed the real weight: every `next/image` card tag carries an eight-candidate `srcset` of long Cloudinary/Base44 URLs (~1.9 KB per image, in the HTML and again in the React payload — about half of every card-heavy page). A house-level fix is `images.deviceSizes`/`imageSizes` in `next.config` trimmed to the widths the cards actually render (e.g. 320/640/960/1280), which would roughly halve card-heavy pages site-wide; that is the chrome effort's file, so it is proposed, not changed, here.

### D. Not findings, for the record
- Internal links: with the production link guard on, the chrome drops every link to an unbuilt page; the only remaining dead links are on noindex preview pages (`/preview/*`), by design.
- `robots.txt` disallows `/api/`, `/account/`, `/auth/`, `/booking/*` correctly. `llms.txt` is 130 KB and current.
- No duplicate descriptions among real pages; the 6 duplicates are the redirect stubs in (7).

## Re-audit cadence
This scan is `scripts/seo-snapshot.py` plus `/home/claude/audit-scan.py` (to be added to `scripts/` as `site-audit.py` if the house wants it in CI) and the axe runner in `docs/wild-pathways/ACCESSIBILITY.md`. Worth re-running after each release-branch merge, not after every PR.
