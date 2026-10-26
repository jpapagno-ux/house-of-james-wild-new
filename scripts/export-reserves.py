#!/usr/bin/env python3
"""Reserves → camps → suites, from the Base44 library.

usage: export-reserves.py ROOMS.json OUT.json
  ROOMS.json: Room records whose parent is a reserve's Stay record
  (query_entities Room {parent_id: {$in: [reserve stay ids]}}).
Reserve-level copy comes from lib/content/stays.json (the Stay export).

A reserve's camps, lodges and residences are the Room records flagged
is_parent_stay; the suites are the other Room records, assigned to a camp by
the name the library gives them ("[Lion Sands] River Lodge Luxury Room" →
River Lodge). Nothing is invented: empty fields stay empty.
"""
import json, re, sys, html

RESERVES = {  # reserve Stay id → reserve meta (AfricanReserve record)
  "6a89a1cc31fcf7a7ed7725e0": {"slug": "lion-sands", "name": "Lion Sands Reserve", "rsv": "RSV-2026-000006", "area": "Sabi Sand & Kruger", "province": "Mpumalanga"},
  "6a89a1c63f904c4aa98cf554": {"slug": "londolozi-reserve", "name": "Londolozi Reserve", "rsv": "RSV-2026-000007", "area": "Sabi Sand", "province": "Mpumalanga"},
  "6a89a1c5e7476fe9f4dde136": {"slug": "lalibela-reserve", "name": "Lalibela Reserve", "rsv": "RSV-2026-000005", "area": "Eastern Cape", "province": "Eastern Cape"},
}
# Camp key words: the part of a suite's name that says which camp it belongs to.
CAMP_KEYS = {
  "lion-sands": {"River Lodge": ["River Lodge"], "Narina Lodge": ["Narina"], "Tinga Lodge": ["Tinga"], "Ivory Lodge": ["Ivory"], "Fish Eagle Residence": ["Fish Eagle"], "Hinkwenu Residence": ["Hinkwenu"]},
  "londolozi-reserve": {"Founders Camp": ["Founders"], "Varty Camp": ["Varty"], "Pioneer Camp": ["Pioneer] Camp", "Pioneer Camp"], "Tree Camp": ["Tree Camp"], "Private Granite Suites": ["Granite"], "Private Villas": ["Homestead", "Private Villa"]},
  "lalibela-reserve": {"Tree Tops Safari Lodge": ["Tree Tops"], "Kichaka Lodge": ["Kichaka"], "Lentaba Lodge": ["Lentaba"], "Marks Camp": ["Marks Camp"], "Inzolo Lodge": ["Inzolo"], "Mills Manor Residence": ["Mills Manor"]},
}
ORDER = {  # house order on the reserve page; the founder's own first
  "lion-sands": ["Ivory Lodge", "River Lodge", "Narina Lodge", "Tinga Lodge", "Fish Eagle Residence", "Hinkwenu Residence"],
  "londolozi-reserve": ["Founders Camp", "Varty Camp", "Tree Camp", "Pioneer Camp", "Private Granite Suites", "Private Villas"],
  "lalibela-reserve": ["Marks Camp", "Kichaka Lodge", "Lentaba Lodge", "Inzolo Lodge", "Tree Tops Safari Lodge", "Mills Manor Residence"],
}

def clean(s):
  if not s: return ""
  s = html.unescape(html.unescape(s))
  s = re.sub(r"<br\s*/?>|</p>|</li>", "\n", s)
  s = re.sub(r"<[^>]+>", "", s)
  s = s.replace("‍", "").replace("&nbsp;", " ")
  return re.sub(r"[ \t]+", " ", s).strip()

def items(s):
  out = []
  for line in clean(s).split("\n"):
    line = line.strip(" .-–•:\t")
    if 2 < len(line) < 160 and line.lower() not in ("features", "adventures"): out.append(line)
  return out

def bare(name):  # "[Lion Sands] River Lodge" → "River Lodge"
  return re.sub(r"^\[[^\]]+\]\s*", "", name or "").strip()

def kind(name):
  n = name.lower()
  if "residence" in n or "villa" in n or "manor" in n: return "residence"
  if "suites" in n and "granite" in n: return "suite"
  return "camp"

def imgs(urls, n=8):
  seen, out = set(), []
  for u in urls or []:
    if not u or "supabase.co" in u or u in seen: continue
    seen.add(u); out.append(u)
  return out[:n]

rooms = json.load(open(sys.argv[1]))
stays = {s["slug"]: s for s in json.load(open("lib/content/stays.json"))["stays"]}
out = []
for sid, meta in RESERVES.items():
  mine = [r for r in rooms if r.get("parent_id") == sid]
  camps = {}
  for r in mine:
    if r.get("is_parent_stay"):
      nm = bare(r["name"])
      prefix = meta["slug"] if meta["slug"] != "lion-sands" else "lion-sands"
      slug = (r.get("webflow_slug") or re.sub(r"[^a-z0-9]+", "-", nm.lower())).strip("-")
      slug = re.sub(rf"^{re.escape(prefix)}-", "", slug)
      slug = re.sub(r"^lalibela-reserve-|^londolozi-", "", slug)
      slug = {"tree-camp-2": "tree-camp", "hinkwenu": "hinkwenu-residence", "private-villa": "private-villas"}.get(slug, slug)
      camps[nm] = {
        "slug": slug, "name": nm.replace("Marks Camp", "Mark's Camp"), "key": nm, "kind": kind(nm),
        "intro": clean(r.get("intro")), "description": clean(r.get("description")),
        "units": items(r.get("stays_content")), "features": items(r.get("features_content")), "experiences": items(r.get("adventures_content")),
        "hero": r.get("hero_image_url") or (imgs(r.get("gallery_urls"), 1) or [None])[0],
        "gallery": imgs(r.get("gallery_urls"), 10), "rooms": [],
      }
  keys = CAMP_KEYS[meta["slug"]]
  for r in mine:
    if r.get("is_parent_stay"): continue
    nm = r["name"]
    camp = next((c for c, ks in keys.items() if any(k.lower() in nm.lower() for k in ks)), None)
    if not camp or camp not in camps: print("UNASSIGNED", nm); continue
    label = bare(nm)
    for k in [camp, camp.replace(" Lodge", ""), camp.replace(" Camp", ""), camp.replace(" Residence", "")]:
      if label.lower().startswith(k.lower() + " ") and len(label) > len(k) + 2: label = label[len(k):].strip(); break
    label = re.sub(r"^\]\s*", "", label)
    label = re.sub(r"^Camp (?=\w)", "", label) if label.startswith("Camp ") and label != "Camp Suites" else label
    short = camp.replace(" Safari Lodge", "").replace(" Lodge", "").replace(" Camp", "").replace(" Residence", "").replace("Private ", "")
    if label in ("Suite", "Suites", "Villa", "Camp Suites"): label = f"{short} {label.replace('Camp ', '')}"
    if label.startswith(short + " ") and label != f"{short} {label.split(' ',1)[1]}": pass
    label = {"Tree Tops Canvas Canopy Suite": "Canvas Canopy Suite", "Tree Suites": "Tree Camp Suite", "Pioneer Suites": "Pioneer Suite", "Mills Manor Villa": "The Manor, exclusive use", "Luxury Villa": "The Residence, exclusive use"}.get(label, label)
    photos = imgs([r.get("hero_image_url")] + (r.get("gallery_urls") or []), 6)
    camps[camp]["rooms"].append({
      "name": label, "capacity": r.get("capacity"), "quantity": r.get("quantity"), "beds": r.get("bed_configuration"),
      "from": r.get("from_rate") or None, "currency": r.get("currency") or "USD", "basis": r.get("pricing_model"), "photos": photos,
    })
  for c in camps.values():
    c["rooms"].sort(key=lambda x: (x["from"] is None, x["from"] or 0))
    if not c["gallery"]:  # Ivory Lodge has no camp gallery on file: use its suites' photos
      c["gallery"] = imgs([p for rm in c["rooms"] for p in rm["photos"]], 10)
    fr = [rm["from"] for rm in c["rooms"] if rm["from"]]
    c["fromRate"] = min(fr) if fr else None
  order = ORDER.get(meta["slug"]) or sorted(camps)
  s = stays.get(meta["slug"], {})
  out.append({**meta, "stay": {k: s.get(k) for k in ["ledgerId", "tagline", "quote", "hero", "gallery", "bestMonths", "bestMonthsNote", "airport", "airportDirections", "coords", "why", "experiences", "features", "onlyHere", "country", "countrySlug", "regionSlug", "status", "statusDate"]},
              "camps": [camps[n] for n in order if n in camps] + [camps[n] for n in sorted(camps) if n not in order]})
json.dump({"exportedOn": "2026-10-25", "reserves": out}, open(sys.argv[2], "w"), indent=1, ensure_ascii=False)
for r in out:
  print(r["slug"], [(c["slug"], c["kind"], len(c["rooms"]), c["fromRate"], len(c["gallery"]), bool(c["hero"])) for c in r["camps"]])
