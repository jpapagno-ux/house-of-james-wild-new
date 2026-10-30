# Wild Pathways · Accessibility and Contrast Audit

Phase 1 checkpoint 1d · 30 Oct 2026 · branch `feature/wild-pathways-foundation`

Scope: every page and component added by the Wild Pathways work (`/preview/pathways/*`, `components/pathways/*`, `components/impact/ImpactNote.tsx`, the Compass adapter preview). Method: axe-core 4 (WCAG 2.0 A/AA, 2.1 AA, 2.2 AA) run headless on desktop (1440) and mobile (390) viewports; keyboard walk of every interactive control; `prefers-reduced-motion: reduce` check; contrast ratios computed from the token source (`lib/pathways.ts`), which `tests/pathways.test.ts` also asserts on every test run.

## 1. Contrast — tokens (WCAG AA, 4.5:1 for text, 3:1 for large text)

| ID | Pathway | Accent | Text | Tint | Text on white | Text on card #F6F4F0 | Text on tint | White on accent | Addendum proposed |
|---|---|---|---|---|---|---|---|---|---|
| PATH-01 | Into the Green | `#38634B` | `#38634B` | `#EBF0EC` | 6.88 ✓ | 6.26 ✓ | 5.96 ✓ | 6.88 ✓ | `#405A45` |
| PATH-02 | Between Tides | `#426E79` | `#426E79` | `#ECF2F3` | 5.62 ✓ | 5.11 ✓ | 4.97 ✓ | 5.62 ✓ | same |
| PATH-03 | Above It All | `#73786C` | `#696D62` | `#F0F1EF` | 5.30 ✓ | 4.82 ✓ | 4.67 ✓ | 4.53 ✓ | `#7D8275` |
| PATH-04 | Where the Wild Lives | `#936F49` | `#866642` | `#F5F0EA` | 5.26 ✓ | 4.79 ✓ | 4.64 ✓ | 4.55 ✓ | `#A0794F` |
| PATH-05 | The Art of Stillness | `#737769` | `#6C7062` | `#F2F3F0` | 5.08 ✓ | 4.63 ✓ | 4.56 ✓ | 4.59 ✓ | `#929785` |
| PATH-06 | Off the Map | `#766B63` | `#766B63` | `#F1EFEE` | 5.18 ✓ | 4.72 ✓ | 4.52 ✓ | 5.18 ✓ | same |
| PATH-07 | A Place of Our Own | `#94512F` | `#94512F` | `#F7EFE6` | 6.04 ✓ | 5.50 ✓ | 5.30 ✓ | 6.04 ✓ | `#A65332` |
| PATH-08 | Rooted in Place | `#8D6958` | `#876554` | `#F4F0EE` | 5.22 ✓ | 4.76 ✓ | 4.61 ✓ | 4.89 ✓ | same |

Impact: forest `#405A45` on sage `#E6E9DD` 6.17 ✓ · rust `#94512F` on sage 4.91 ✓ · ink #2D2A26 on sage 11.60 ✓

Character: James annotation ink #2D2A26 on white 14.28 ✓ · James accent (seal oxblood) #8B2525 on white 8.79 ✓ · Iggi green #405A45 on white 7.59 ✓ · focus ring #8B2525 on white 8.79 ✓

Rules the components follow:
- Pathway-coloured words always use the `text` variant (`--jw-path-0n-text`), never the raw accent.
- Solid accent fills carry white text only; every accent now clears 4.5:1 for white (PATH-03/04/05 were darkened the smallest step to get there, agreed 30 Oct).
- Tints are backgrounds for chips and panels; `text` on `tint` clears AA for all eight.
- The pathway name is always printed beside the colour. Selected or primary state carries a second signal (`aria-pressed`, "Selected:" / "(primary pathway)" screen-reader text, solid vs. tint fill), never colour alone.
- Impact statements print status, review date and source in words. Status icons differ by shape as well as colour.

## 2. Automated scan (axe-core)

| Page | Violations in new components (after fixes) | Total on page | Of which pre-existing House chrome |
|---|---|---|---|
| `/preview/pathways` (token sheet) | 0 | 32 | 32 |
| `/preview/pathways/stays` | 0 | 34 | 34 |
| `/preview/pathways/stay/tswalu-reserve` | 0 | 48 | 48 |
| `/preview/pathways/where-the-wild-lives` | 0 | 30 | 30 |
| `/preview/pathways/compass` | 0 | 34 | 34 |
| Baseline `/stays` (live, untouched) | — | 24 | 24 |
| Baseline `/stays/tswalu-reserve` (live, untouched) | — | 66 | 66 |

Fixed during the audit (ours):
- Impact Note captions at 75–80% opacity on sage measured 3.5–3.9:1; now full forest copy (6.17:1).
- Featured-stay preview section links rendered as `##why` (double hash) through `RecordNav`; corrected.

Pre-existing, House-wide — **fixed 30 Oct 2026 with James's approval** (`globals.css` `.ledger-eyebrow` and Tailwind `ink.faint`: alpha 0.55 → 0.68, `#706E6B`, 5.08:1 on white / 4.63:1 on card). After the change: `/stays` 24 → 0 violations, `/` 0, `/compass` 0; every Wild Pathways preview 0. Still open on the live stay template (outside this branch): a hard-coded `#8a7f70` caption colour (3.82:1) and the hero photo-dot buttons at 12×2px. Original finding, kept for the record:
- `.ledger-eyebrow` prints ink at 55% alpha (`#8C8A88`), 3.43:1 on white and 3.13:1 on the card tone. It is used on every page of the site, including inside our components for consistency. Raising the alpha to 0.65 (`#777572`, 4.59:1 white / 4.18:1 card) or 0.68 (`#706E6B`, 5.08 / 4.63) would clear AA site-wide in one token change in `globals.css`.
- Header utility navigation at 10px/9px and the breadcrumb current-page span are the other recurring items; same root cause.

## 3. Keyboard and focus

- Compass preview: all 21 chips, the two presentation tabs and "Start again" are native `<button>`s, reachable in document order, toggled with Enter and Space; `aria-pressed` updates; results re-render without moving focus. Tabs carry `role="tab"` / `aria-selected`.
- Focus ring: the House's `:focus-visible` (2px oxblood `#8B2525`, 3px offset) is visible on white and on selected (ink-filled) chips because the offset draws it outside the control.
- Stays landing: every pathway card and index row is a single link whose accessible name is the setting, the pathway name and the house line; all eight pathways are reachable from the landing (six cards + two index rows marked "more").
- Featured-stay preview: section navigation links resolve to their `id`s; the Impact Note and Follow the Pathway sections have `aria-labelledby` headings.

## 4. Reduced motion

With `prefers-reduced-motion: reduce`, `document.getAnimations()` reports 0 running animations on the landing and the featured-stay preview. The only motion in the new components is a hover scale on card photographs (`transition-transform`), which is a non-essential transition and does not autoplay.

## 5. Mobile

All preview routes were scanned and screenshotted at 390px: no horizontal overflow; chips wrap; the trade table scrolls horizontally inside its own container; the six-card grid collapses to one column with the lead card first.

## 6. Open items

1. ~~House decision on the `.ledger-eyebrow` alpha~~ — done, see §2.
2. `tests/seo-baseline.json` is stale on `main` (126 of 489 pages); re-snapshot on `main` after the Beckon release branches land so the guard reports real regressions only.
3. The live Vercel preview, with photographs, is the place to judge the darkened PATH-05 against the lighter addendum value; sandbox renders have no images.
