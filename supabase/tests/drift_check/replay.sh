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
for f in "$ROOT"/supabase/migrations/*.sql; do $P -d "$DB" -f "$f" >/dev/null || { echo "FAIL $f"; exit 1; }; done
echo "replayed $(ls "$ROOT"/supabase/migrations/*.sql | wc -l) migrations"
# The RLS tests expect the published Ledger stays; seed 76 stand-ins (one is leeu-estates).
$P -d "$DB" -c "insert into public.properties (legacy_cms_id, name, slug) select 'STY-2026-'||lpad(g::text,6,'0'), 'Test stay '||g, case when g=1 then 'leeu-estates' else 'test-stay-'||g end from generate_series(1,76) g"
for t in rls_phase1 rls_phase2; do
  out=$($P -d "$DB" -f "$ROOT/supabase/tests/$t.sql" 2>&1 || true)
  python3 -c 'import sys,re,json
r=json.loads(re.search(r"(\[.*\])",sys.argv[2],re.S).group(1)); bad=[x["t"] for x in r if not x["pass"]]
print(f"{sys.argv[1]}: {len(r)-len(bad)}/{len(r)} pass"); [print("  FAIL",b) for b in bad]; sys.exit(1 if bad else 0)' "$t" "$out"
done
echo "fingerprint (compare with the same query on live):"
psql -U ${PGUSER:-postgres} -d "$DB" -tA -F' ' -f "$HERE/fingerprint.sql"
$P -d postgres -c "drop database $DB"
