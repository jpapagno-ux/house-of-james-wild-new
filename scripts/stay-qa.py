#!/usr/bin/env python3
"""Stay QA: decides which library stays get a page on the new site.

usage: stay-qa.py STAYS.json DESTINATIONS.json

A stay is released (added to scripts/data/stay-release.json) when its record has
a slug, a country, its own hero photo, some stay copy, is not marked coming soon,
and its name and hero don't belong to another stay. Everything else is held, with
the reason, in data/library/qa.json (the Studio build checklist reads it back).
Hand decisions live in scripts/data/stay-qa-overrides.json: "clear" releases a
stay the name check flagged wrongly; "hold" keeps a stay off the site.
"""
import json, re, sys, html, collections, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S = json.load(open(sys.argv[1]))["entities"]
D = {d["id"]: d for d in json.load(open(sys.argv[2]))["entities"]}
OV = json.load(open(ROOT / "scripts/data/stay-qa-overrides.json"))
REL_P = ROOT / "scripts/data/stay-release.json"
rel = json.load(open(REL_P)); released = {r["slug"] for r in rel["released"]}

STOP = set("the and of by at a in on resort lodge camp hotel villa villas house suites suite island private reserve beach spa retreat safari tented collection mara game boutique luxury estate inn ranch".split())
def toks(s): return {t for t in re.findall(r"[a-z]{3,}", re.sub(r"['’]s?\b", "", html.unescape(s or "").lower()).replace("&", "and")) if t not in STOP}
def strip(h): return re.sub(r"<[^>]+>", " ", html.unescape(h or "")).strip()
names = [(s, toks(s["name"])) for s in S]
seen = collections.Counter((s.get("webflow_slug") or s.get("property_slug")) for s in S)

rows, newly = [], []
for s in S:
    if s.get("is_reserve_child"): continue
    slug = s.get("webflow_slug") or s.get("property_slug"); nt = toks(s["name"]); flags = []
    if s.get("site_status") == "coming_soon": flags.append("coming_soon")
    if not slug: continue
    if seen[slug] > 1: flags.append("name_check")
    d = D.get(s.get("destination_id"))
    if not d or not d.get("region_slug"): flags.append("country")
    hero = s.get("hero_image_url") or ""
    if not hero: flags.append("hero_photo")
    dn = toks(re.sub(r"<br/?>", " ", s.get("display_name") or ""))
    if dn and nt and not (dn & nt): flags.append("name_check")
    fn = toks(hero.rsplit("/", 1)[-1].split("_", 3)[-1]) if hero else set()
    if fn and nt and not (fn & nt) and any(o is not s and ot and ot <= fn for o, ot in names): flags.append("correct_hero_photo")
    copy = [strip(s.get(k)) for k in ("stays_content", "why_stay_here_content", "features_content", "only_here_content")]
    if not any(copy): flags.append("stay_copy")
    if slug in OV.get("clear", {}): flags = [f for f in flags if f != "name_check"]
    if slug in OV.get("hold", {}): flags.append("name_check")
    flags = sorted(set(flags))
    if not [f for f in flags if f != "coordinates"] and slug not in released:
        rel["released"].append({"slug": slug, "batch": f"{datetime.date.today().isoformat()} library sync"}); released.add(slug); newly.append(slug)
    # Map coordinates don't hold a page back; they're listed so the stay pins on its country map.
    if not re.match(r"\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?", s.get("coordinates") or ""): flags = flags + ["coordinates"]
    rows.append({"stay_id": s["id"], "slug": slug, "name": re.sub(r"\s+", " ", strip(s.get("display_name") or s["name"])),
                 "country": (d or {}).get("name") or "", "missing": flags, "released": slug in released})
json.dump(rel, open(REL_P, "w"), indent=1)
(ROOT / "data/library").mkdir(parents=True, exist_ok=True)
rows.sort(key=lambda r: r["slug"])
json.dump({"checkedOn": datetime.date.today().isoformat(), "rows": rows}, open(ROOT / "data/library/qa.json", "w"), indent=1, ensure_ascii=False)
print(f"{len(rows)} stays checked; {sum(r['released'] for r in rows)} released ({len(newly)} new); {sum(1 for r in rows if [m for m in r['missing'] if m != 'coordinates'] and not r['released'])} held; {sum(1 for r in rows if 'coordinates' in r['missing'])} without map coordinates")
if newly: print("new:", ", ".join(newly))
