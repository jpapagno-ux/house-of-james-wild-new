# Supabase drift check

The live project is **JWC Booking Live** (`ejewisknfobrblmkqvmh`). Every schema change must
arrive through `supabase/migrations`; nothing is created in the SQL editor any more.

`replay.sh` rebuilds the schema from the repo on a local Postgres, runs `rls_phase1.sql` and
`rls_phase2.sql`, and prints a fingerprint (columns, constraints, indexes, policies, functions,
triggers, views, grants). Run `fingerprint.sql` on live; the two outputs must be identical.
This stands in for `supabase db diff` where the CLI cannot reach the database directly.

## Result on 1 Nov 2026 (drift sync, D-12)

| Part | Rows | Local replay = live |
| --- | --- | --- |
| columns | 350 | yes |
| constraints | 197 | yes |
| functions | 17 | yes |
| indexes | 73 | yes |
| policies | 41 | yes |
| relations + grants | 25 | yes |
| triggers | 14 | yes |
| views | 1 | yes |
| schema grants | 2 | yes |

RLS: phase 1 26/26, phase 2 12/12 on the replayed schema.
