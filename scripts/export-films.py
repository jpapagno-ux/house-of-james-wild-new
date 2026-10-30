#!/usr/bin/env python3
"""Ledger export: films. Turns the Film Desk's approved films (siteExport.films,
one per stay) into lib/content/films.json, which lib/content/hosts.ts merges
into VIDEOS so the stay page's Film slot plays them.

usage: export-films.py FILMS.json OUT.json
A film needs a stay slug and an 11-character YouTube id; anything else is skipped and listed."""
import json, re, sys

def main(src, out):
    try:
        rows = json.load(open(src)).get("entities", [])
    except FileNotFoundError:
        rows = []
    keep, skipped = {}, []
    for f in rows:
        ref, vid = (f.get("ref") or "").strip(), (f.get("id") or "").strip()
        if not ref or not re.fullmatch(r"[\w-]{11}", vid):
            skipped.append(f"{ref or '?'}: needs a stay and a YouTube id"); continue
        keep[f"stay:{ref}"] = {"id": vid, "title": (f.get("title") or "").strip() or ref}
    json.dump(dict(sorted(keep.items())), open(out, "w"), ensure_ascii=False, indent=1)
    open(out, "a").write("\n")
    print(len(keep), "films exported", f"({len(skipped)} skipped)" if skipped else "")
    for s in skipped: print("  skipped", s)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
