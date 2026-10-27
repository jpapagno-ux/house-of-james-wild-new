"""Builds an idempotent upsert of Ledger stays into public.properties.
Usage: python3 supabase/seed/properties.py > /tmp/seed.sql
Reads lib/content/stays.json (the Base44 Ledger export). Re-run after each export."""
import json, pathlib
root = pathlib.Path(__file__).resolve().parents[2]
stays = json.loads((root / "lib/content/stays.json").read_text())["stays"]
q = lambda v: "null" if v in (None, "") else "'" + str(v).replace("'", "''") + "'"
rows = [f"({q(s['ledgerId'])}, {q(" ".join(s["name"].split()))}, {q(s['slug'])}, {q(s.get('category'))}, {q(s.get('country'))}, {q(s.get('regionSlug'))})"
        for s in stays if s.get("ledgerId")]
print("insert into public.properties (legacy_cms_id, name, slug, category, country, region) values")
print(",\n".join(rows))
print("on conflict (legacy_cms_id) do update set name = excluded.name, slug = excluded.slug, category = excluded.category,")
print("  country = excluded.country, region = excluded.region, last_synced_at = now();")
