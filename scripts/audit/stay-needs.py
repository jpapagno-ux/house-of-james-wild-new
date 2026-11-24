#!/usr/bin/env python3
"""Stay needs report: one row per stay, what is on file for the locked stay template and what is still needed,
including whether rates are on file. Reads only the repo's own data files (plus an optional Base44 export of
pricing_model for the pricing basis). Re-run after every batch:

    python3 scripts/audit/stay-needs.py [base44-pricing.json] > stay-needs.json
"""
import json, re, sys, collections

J = lambda p: json.load(open(p))
stays = J("lib/content/stays.json")["stays"]
template = set(J("lib/journal-style/template-stays.json")["stays"])
intros = J("lib/journal-style/intros.json")["intros"]
notes = {k: v for k, v in J("lib/journal-style/photo-notes.json").items() if not k.startswith("_")}
roomlib = {k: v for k, v in J("lib/journal-style/room-library.json").items() if not k.startswith("_")}
roomphotos = {k: v for k, v in J("lib/journal-style/room-photos.json").items() if not k.startswith("_")}
rateholds = {k: v for k, v in J("lib/journal-style/rate-holds.json").items() if not k.startswith("_")}
stayphotos = J("lib/content/stay-photos.json")["stays"]
offers = J("lib/content/offers/library.json")
live_cards = set(J("lib/booking-live/rate-card-stays.json")["stays"])
more = J("lib/content/rate-cards/more.json")["properties"]

# stay-rooms.ts: per-stay blocks with published seasonal rates
t = open("lib/content/stay-rooms.ts").read()
marks = [(m.start(), m.group(1)) for m in re.finditer(r'^  "?([a-z0-9-]+)"?: \{', t, re.M)]
stayrooms = {}
for i, (pos, key) in enumerate(marks):
    blk = t[pos: marks[i + 1][0] if i + 1 < len(marks) else len(t)]
    stayrooms[key] = {"rooms": len(re.findall(r"^\s+name: ", blk, re.M)), "rated": "rates: [" in blk,
                      "photos": len(re.findall(r"image: \{ id:", blk))}
cayuga = set(re.findall(r'"([a-z0-9-]+)"', open("lib/content/rates/cayuga-rates.ts").read())) - {"list", "now"}
cayuga = {c for c in cayuga if not c[0].isdigit()}

pricing = {}
if len(sys.argv) > 1:
    for r in J(sys.argv[1]):
        s = r.get("webflow_slug") or r.get("property_slug")
        if s and r.get("pricing_model"):
            pricing[s] = r["pricing_model"].replace("_", " ")

live_offers = collections.defaultdict(list)
for o in offers:
    if o.get("status") == "Live" and o.get("scope") == "stay":
        live_offers[o.get("ref")].append(o.get("headline") or o.get("name"))

HELD = {"inkaterra-reserva-amazonica": "Held for photographs", "explora-torres-del-paine": "Held for photographs",
        "sorrisniva": "Held for photographs"}
REGION = {"africa": "Africa", "asia": "Asia", "europe": "Europe", "oceania": "Oceania", "south-america": "South America",
          "central-america": "Central America", "caribbean": "Caribbean and Mexico", "mexico": "Caribbean and Mexico",
          "north-america": "USA and Canada", "usa-canada": "USA and Canada", "caribbean-mexico": "Caribbean and Mexico",
          "polar-arctic": "Polar and Arctic"}

rows = []
for s in stays:
    slug = s["slug"]
    sp = stayphotos.get(slug, {})
    sp_n = sum(len(v) for v in sp.values() if isinstance(v, list)) if isinstance(sp, dict) else 0
    photos = max(len(s.get("gallery") or []) + (1 if s.get("hero") else 0), sp_n)
    pw = (s.get("pathway") or {}).get("status") or "none"
    # rooms
    rl = roomlib.get(slug, {})
    sr = stayrooms.get(slug, {})
    room_n = max(len(rl.get("rooms", [])), sr.get("rooms", 0), len((s.get("rooms") or {}).get("items") or []))
    room_ph = max(sum(1 for r in rl.get("rooms", []) if r.get("photos")), len(roomphotos.get(slug, {})), sr.get("photos", 0))
    # rates
    more_key = next((k for k in more if slug.startswith(k)), None)
    if slug in live_cards:
        rates, rate_detail = "Yes", "Live rate card in Booking Live (Check availability on)"
    elif sr.get("rated"):
        rates, rate_detail = "Yes", "Published seasonal rates filed (stay-rooms)"
    elif more_key:
        rates, rate_detail = "Yes", "MORE published rate card filed"
    elif "tswalu" in slug:
        rates, rate_detail = "Yes", "Tswalu public rate card filed"
    elif slug in cayuga:
        rates, rate_detail = "Yes", "Cayuga public rates filed"
    elif any(r.get("from") for r in rl.get("rooms", [])):
        rates, rate_detail = "From price", "From prices on room cards only"
    elif pricing.get(slug):
        rates, rate_detail = "Basis only", f"Pricing basis filed ({pricing[slug]}), no figures"
    else:
        rates, rate_detail = "No", "No rates on file"
    if slug in rateholds:
        rate_detail += "; rate hold: " + "; ".join(str(v) for v in rateholds[slug].values())[:160]

    need = []
    if pw != "approved": need.append("pathway approval")
    if slug not in intros: need.append("written intro")
    if photos < 8: need.append(f"photographs ({photos} of 8)")
    if slug not in notes: need.append("photo descriptions")
    if room_n == 0: need.append("room cards")
    elif room_ph < room_n: need.append(f"room photos ({room_ph} of {room_n})")
    if rates in ("No", "Basis only"): need.append("rates")
    if not s.get("coords"): need.append("map pin")
    if not s.get("airport"): need.append("nearest airport")
    if len(s.get("faqs") or []) < 3: need.append("questions")

    on = slug in template
    region = REGION.get(s.get("regionSlug") or "", (s.get("regionSlug") or "").replace("-", " ").title())
    if slug in HELD: nxt = HELD[slug]
    elif on: nxt = "Live on new design" + ("; fill: " + ", ".join(need) if need else "; complete")
    elif region == "Africa": nxt = "Waits for Stage 10 (safari camp design)"
    elif pw == "approved" and photos >= 8: nxt = "Ready for next batch"
    elif photos < 8: nxt = "Needs photographs from the brand"
    else: nxt = "Needs pathway approval"
    rows.append({"region": region, "country": s.get("country") or "", "stay": s["name"], "slug": slug,
                 "design": "New" if on else "Old", "pathway": pw.title(), "intro": "Yes" if slug in intros else "No",
                 "photos": photos, "photoNotes": "Yes" if slug in notes else "No", "rooms": room_n, "roomPhotos": room_ph,
                 "rates": rates, "rateDetail": rate_detail,
                 "offer": "; ".join(live_offers.get(slug, [])) or "None",
                 "mapPin": "Yes" if s.get("coords") else "No", "airport": "Yes" if s.get("airport") else "No",
                 "faqs": len(s.get("faqs") or []), "needed": ", ".join(need) or "Nothing", "next": nxt})

rows.sort(key=lambda r: (r["design"] != "New", r["region"], r["country"], r["stay"]))
json.dump({"generated": stays and J("lib/content/stays.json").get("exportedOn"), "rows": rows}, sys.stdout, ensure_ascii=False)
