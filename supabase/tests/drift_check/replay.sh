#!/usr/bin/env bash
# Replays every migration in supabase/migrations on a throwaway local Postgres database,
# then runs the existing RLS tests and prints the schema fingerprint to compare with live.
# Needs a local Postgres you can reach as a superuser: PGHOST, PGPORT, PGUSER (default postgres).
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$HERE/../../.." && pwd)
DB=${REPLAY_DB:-jw_drift_replay}
P="psql -U ${PGUSER:-postgres} -v ON_ERROR_STOP=1 -q"
$P -d postgres -c "drop database if exists $DB" -c "create database $DB"
$P -d "$DB" -f "$HERE/shim.sql" >/dev/null
# Booking Live Phase 3 files (20261101000100-300) arrived on main after the drift migration (20261101170000)
# had already captured their objects on live; they are written to be re-runnable, so replay them right
# after it, the order live will see them in (late.txt lists them).
LATE=$(cat "$HERE/late.txt" 2>/dev/null || true)
run() { $P -d "$DB" -f "$1" >/dev/null || { echo "FAIL $1"; exit 1; }; }
for f in "$ROOT"/supabase/migrations/*.sql; do
  b=$(basename "$f")
  if echo "$LATE" | grep -qx "$b"; then continue; fi
  run "$f"
  if [ "$b" = "20261101170000_drift_sync_out_of_band_objects.sql" ]; then for l in $LATE; do [ -f "$ROOT/supabase/migrations/$l" ] && { $P -d "$DB" -f "$ROOT/supabase/migrations/$l" >/dev/null 2>&1 || echo "WARN $l is not re-runnable over the drift objects (fix before applying it live)"; }; done; fi
done
echo "replayed $(ls "$ROOT"/supabase/migrations/*.sql | wc -l) migrations"
# The RLS tests expect the published Ledger stays; seed 76 stand-ins (one is leeu-estates).
$P -d "$DB" -c "insert into public.properties (legacy_cms_id, name, slug) select 'STY-2026-'||lpad(g::text,6,'0'), 'Test stay '||g, case when g=1 then 'leeu-estates' else 'test-stay-'||g end from generate_series(1,76) g"
for t in rls_phase1 rls_phase2 rls_partner_desk; do
  out=$($P -d "$DB" -f "$ROOT/supabase/tests/$t.sql" 2>&1 || true)
  python3 -c 'import sys,re,json
r=json.loads(re.search(r"(\[.*\])",sys.argv[2],re.S).group(1)); bad=[x["t"] for x in r if not x["pass"]]
print(f"{sys.argv[1]}: {len(r)-len(bad)}/{len(r)} pass"); [print("  FAIL",b) for b in bad]; sys.exit(1 if bad else 0)' "$t" "$out"
done
echo "fingerprint (compare with the same query on live):"
psql -U ${PGUSER:-postgres} -d "$DB" -tA -F' ' -f "$HERE/fingerprint.sql"
$P -d postgres -c "drop database $DB"
