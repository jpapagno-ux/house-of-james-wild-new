# Partner Desk · Stage 1 (1 Nov 2026)

Branch `feature/partner-desk-stage-1`, stacked on `chore/supabase-drift-sync` (PR #148).
Behind `NEXT_PUBLIC_PARTNER_DESK` (off everywhere except the Preview of this branch).

## Principle carried into the database

Partners contribute; James Wild & Co publishes.

| Partners may | How |
| --- | --- |
| Edit contacts and company details (admins and contributors; only admins remove a contact) | Directly, audited (`contacts`, `organizations` column grants) |
| Answer requests, send updates with links | `submissions` (status set by the database, not the client) |
| Propose a change to an entry's name, category, country, region, time zone | `revisions` → only through `public.decide_revision()` by a house editor |
| Invite teammates (admin / contributor, optionally narrowed) | `org_invitations` (token hash only) → `public.accept_org_invitation()` |

Partners can never write `properties`, Ledger IDs, publication status, Pathways or SEO.
A revision records the true "before" value itself and is refused at approval if the
live value changed since (no silent overwrite).

## Database (migrations, both applied to JWC Booking Live and hash-matched to the repo)

- `20261101175202_partner_foundation.sql`: membership roles (D-04), organization partner
  fields, `brands`, `volumes`, `pathways`, `destinations` (DST IDs never minted here),
  additive `properties` columns (entity type/kind, volume, destination, parent, brand,
  external IDs, provenance, last verified), `entity_volumes`, `entity_partners`,
  `entity_access`, `private.next_ledger_id()` (block STY-2026-800001…899999), helpers
  `is_jw`, `is_org_member`, `partner_can`, `can_see_entity`, `can_edit_entity`, RLS, audit.
- `20261101175331_partner_desk_core.sql`: `contacts`, `contact_entities`,
  `content_requests`, `submissions`, `revisions` (+ `private.revision_fields` whitelist),
  `verifications`, `partner_applications`, `org_invitations`, `accept_org_invitation`,
  `set_team_member`, `decide_revision`, `decide_submission`, RLS, column grants, audit.
- `20261101210000_partner_contributor_admin_data.sql` (James, 1 Nov 2026): contributors
  edit contacts, contact links and company details like admins; house editors may correct
  company details. Removing a contact stays with partner admins and the house. **Pending
  live apply** — renamed to its recorded version once applied.

Tests: `supabase/tests/rls_partner_desk.sql` (59 checks), passing on a local replay; the
first 55 also passed on live (rolled back), the full 59 run after the migration above. `supabase/tests/drift_check/replay.sh` runs every RLS file locally.

## Seed (`supabase/seed/partner_desk_stage1.sql`, idempotent, applied 1 Nov 2026)

| Partner | Code | Entities |
| --- | --- | --- |
| Kayumanis Private Villa & Spa | PAR-000001 | Jimbaran 000128, Nusa Dua 000129, Ubud 000130 (published, names untouched); Sanur 000547 (Library ID), Nanjing 800001, Yangshuo 800002 (draft, PUBLIC_SOURCE) |
| MORE Family Collection (brand Lion Sands) | PAR-000002 | Lion Sands Reserve 290658 (parent, published); River, Narina, Tinga, Ivory lodges; Fish Eagle and Hinkwenu villas (also Gatherings); Chalkley, Tinyeleti, Kingston treehouses — 800003…800011, all draft |

17 content requests, one placeholder contact per partner (to verify). Rooms (8 on the
reserve, 10 on the Kayumanis villas) and the Lion Sands 2027-V1 card are untouched.

QA identities (`*.example.test`): `jw.admin` (jw_admin, house), `kayumanis.admin`
(partner_admin), `kayumanis.contrib` (partner_contributor, Ubud only), `more.admin`
(partner_admin). Passwords were set outside the repo and handed to James.

## Routes

`/partner/login`, `/forgot-password`, `/reset-password`, `/invite/[token]`, `/apply`,
`/no-access` · desk: `/partner` (Overview), `/portfolio`, `/portfolio/[ledgerId]`,
`/requests`, `/requests/[id]`, `/submissions`, `/contacts`, `/team`, `/account`,
`/support` · house: `/desk/review`. API under `/api/v1/partner/*` and `/api/v1/desk/*`.

## Environment

| Variable | Where | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_PARTNER_DESK` | Preview, branch `feature/partner-desk-stage-1` only | `on` |

The desk uses the anon key + the signed-in session only (RLS decides). It does not need
`SUPABASE_SERVICE_ROLE_KEY`. Invitation emails go through Resend only when
`ENQUIRY_LIVE=on` and never to `.test` addresses; otherwise the admin copies the link.

## Not in Stage 1

Content / room / rate / offer editing, uploads and the Media Library, Partner Dispatch,
Founder Notes feed, Resources, Iggi context, Airtable mirror, MFA, domain split.
Media references for the 58 Lion Sands Cloudinary assets wait for `media_assets` (Stage 3).
