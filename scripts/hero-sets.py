#!/usr/bin/env python3
"""Five hero photographs per stay, camp and reserve → lib/content/hero-sets.json.

The record's own hero leads; the next four come from its gallery (and, for a
camp, its suites), ranked so wide views (aerial, deck, river, pool, game
drive) open the slider and bathrooms and close-ups don't. Library images only.
"""
import json, re

GOOD = r"aerial|drone|view|exterior|landscape|deck|pool|river|safari|game|drive|sunset|sunrise|lodge|camp|vineyard|beach|ocean|bush|walk|elephant|lion|leopard|treehouse|boma|fire|valley|mountain|garden|terrace|veranda|overlook|main|arrival|estate|manor|villa|wide"
BAD = r"bath|shower|toilet|vanity|bar\b|study|food|plate|dish|detail|amenit|spa-product|logo|map|menu|floorplan|twin|bedroom"

def score(u, i):
  n = u.lower()
  s = 0
  if re.search(GOOD, n): s += 3
  if re.search(BAD, n): s -= 4
  if "medium" in n or "preview" in n: s -= 1
  return (-s, i)

def pick(urls, n=5):
  seen, uniq = set(), []
  for u in urls:
    if not u: continue
    k = re.sub(r"^.*?/", "", u.split("?")[0])[-48:]
    if k in seen: continue
    seen.add(k); uniq.append(u)
  if not uniq: return []
  head, rest = uniq[0], uniq[1:]
  rest = [u for _, u in sorted(((score(u, i), u) for i, u in enumerate(rest)), key=lambda x: x[0])]
  return [head] + rest[: n - 1]

st = json.load(open("lib/content/stays.json"))["stays"]
rs = json.load(open("lib/content/reserves.json"))["reserves"]
out = {}
extra = json.load(open("scripts/data/stay-room-photos.json"))  # suite photos for stays with a thin gallery
for s in st:
  if s["hero"]: out[f"stay:{s['slug']}"] = pick([s["hero"]] + s["gallery"] + extra.get(s["slug"], []))
for r in rs:
  out[f"reserve:{r['slug']}"] = pick([r["stay"]["hero"]] + [c["hero"] for c in r["camps"]] + (r["stay"]["gallery"] or []))
  for c in r["camps"]:
    out[f"camp:{r['slug']}/{c['slug']}"] = pick([c["hero"]] + c["gallery"] + [p for m in c["rooms"] for p in m["photos"]])
json.dump(out, open("lib/content/hero-sets.json", "w"), indent=0)
from collections import Counter
print(len(out), Counter(len(v) for v in out.values()))
