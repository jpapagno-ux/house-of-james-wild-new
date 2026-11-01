#!/usr/bin/env python3
"""Ledger export: country pages. Turns the library's Destination records into
lib/content/countries-library.json for every country with at least one live
stay page (Costa Rica and South Africa stay hand-built in countries.ts;
Indonesia keeps its approved by-sea guide).

usage: export-countries.py DESTINATIONS_FULL.json

Library copy is cleaned (HTML out, headings kept) but not rewritten. FAQs and
fact blocks ship only when the record is approved/published AND AEO-approved,
the same rule as stays. Airports and the best-months label come from the
country's own stay records when the Destination has none.

Destination cards (James, 1 Nov 2026, Sri Lanka first): a country with no stay
pages yet still gets a page when its record is live, approved and AEO-approved.
It is exported with "staysComing": true; the page then shows "stays coming
soon, plan with James" instead of stay counts, and the region page lists it as
a card. Its airports come from the IATA codes in the record's getting-there
fact, and a best-months fact written as area sentences ("West and south
coasts: December to April. East coast: April to September.") becomes one
month band per area.
"""
import json, re, sys, html, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
D = {d["webflow_slug"]: d for d in json.load(open(sys.argv[1]))["entities"] if d.get("webflow_slug")}
STAYS = json.load(open(ROOT / "lib/content/stays.json"))["stays"]
REGIONS = {r["slug"]: r["name"] for r in json.load(open(ROOT / "lib/content/regions.json"))["regions"]}
SKIP = {"costa-rica", "south-africa", "indonesia"}
ATLAS = {"chile": "Chile", "ecuador-galapagos": "Ecuador", "tahiti": "Fr. Polynesia", "spain-ibiza": "Spain", "portugal": "Portugal",
         "turks-caicos": "Turks and Caicos Is.", "st-barths": "St-Barthélemy", "virgin-islands": "British Virgin Is."}
STATES = {"utah": "Utah", "california": "California", "montana": "Montana", "arizona": "Arizona", "hawaii": "Hawaii", "wyoming": "Wyoming",
          "colorado": "Colorado", "florida": "Florida", "alaska": "Alaska", "new-mexico": "New Mexico"}
NAMES = {"chile": "Chile & Easter Island", "ecuador-galapagos": "Ecuador & Galápagos", "portugal": "Portugal & the Azores", "spain-ibiza": "Ibiza"}
MON = {m: m[:3] for m in "January February March April May June July August September October November December".split()}

def clean(s):
    s = html.unescape(s or "").replace("‍", "").replace("\xa0", " ")
    s = s.replace("Wild Earth Stays", "James Wild & Co")
    return re.sub(r"[ \t]+", " ", s).strip()

def blocks(raw):
    raw = raw or ""
    out = []
    if "<p" in raw:
        for p in re.findall(r"<p[^>]*>(.*?)</p>", raw, flags=re.S):
            m = re.match(r"\s*<strong>(.*?)(?:<br\s*/?>)?\s*</strong>\s*(?:<br\s*/?>)?(.*)", p, flags=re.S)
            h, body = (m.group(1), m.group(2)) if m else (None, p)
            body = clean(re.sub(r"<br\s*/?>", " ", re.sub(r"<(?!br)[^>]+>", "", body)))
            h = clean(re.sub(r"<[^>]+>", "", h)) if h else None
            if body: out.append({"h": h.rstrip(":") if h else None, "p": body})
    else:
        h = None
        for line in [l.strip() for l in clean(raw).split("\n") if l.strip()]:
            if len(line) < 60 and line.upper() == line and re.search(r"[A-Z]", line): h = line.title(); continue
            out.append({"h": h, "p": line}); h = None
    return [{k: v for k, v in b.items() if v} for b in out]

def short_months(t):
    m = re.search(r"(January|February|March|April|May|June|July|August|September|October|November|December)\s*(?:to|through|-|–|and)\s*(January|February|March|April|May|June|July|August|September|October|November|December)", t or "")
    return f"{MON[m.group(1)]}–{MON[m.group(2)]}" if m else None

MONTHS = "January February March April May June July August September October November December".split()
def bands(t):
    """'May to October' (and any other ranges in the text) -> twelve best/good marks."""
    marks = ["good"] * 12; found = False
    for a, b in re.findall(r"(%s)\s*(?:to|through|until|-|–)\s*(%s)" % ("|".join(MONTHS), "|".join(MONTHS)), t or ""):
        i, j = MONTHS.index(a), MONTHS.index(b); found = True
        while True:
            marks[i] = "best"
            if i == j: break
            i = (i + 1) % 12
    return marks if found else None

def title_case(s):
    return s if not s or s != s.upper() else s.title()

pages = [s for s in STAYS if s["hero"] and s["countrySlug"] and (s["rooms"]["paras"] or s["rooms"]["items"] or s["features"]["paras"] or s["features"]["items"] or s["why"] or s["onlyHere"])]
by = collections.defaultdict(list)
for s in pages: by[s["countrySlug"]].append(s)

# Destination cards: live, reviewed country records with no stay page yet (see the docstring).
for slug, d in D.items():
    if slug in by or slug in SKIP or d.get("parent_destination_id") or not d.get("region_slug"): continue
    if d.get("site_status") == "live" and d.get("content_status") in ("approved", "published") and d.get("aeo_approved"):
        by[slug] = []

def area_bands(t):
    """'West coast: December to April. East coast: April to September.' -> one row per area, or None
    unless every sentence names an area and a month range (so a plain best-months note keeps one row)."""
    parts = [p.strip() for p in re.split(r"(?<=\.)\s+", t or "") if p.strip()]
    rows = []
    for p in parts:
        m = re.match(r"([^:.]{3,60}):\s*(.+)", p)
        if not m or not bands(m.group(2)): return None
        rows.append({"area": clean(m.group(1)), "note": "From the Ledger's best-months notes", "months": bands(m.group(2))})
    return rows if len(rows) >= 2 else None

def year_round(t):
    """Area bands read together (two monsoons, two coasts): 'Year-round' when every month is a best
    month somewhere, else the one unbroken run they cover ('Dec–Sep'). None when there are no area
    bands or the run is broken, so the first range in the text is used as before."""
    rows = area_bands(t)
    if not rows: return None
    best = [any(r["months"][i] == "best" for r in rows) for i in range(12)]
    if all(best): return "Year-round"
    starts = [i for i in range(12) if best[i] and not best[i - 1]]
    if len(starts) != 1: return None
    end = starts[0]
    while best[(end + 1) % 12]: end = (end + 1) % 12
    return f"{MONTHS[starts[0]][:3]}–{MONTHS[end][:3]}"

out = []
for slug, ss in sorted(by.items()):
    if slug in SKIP or slug not in D: continue
    coming = not ss
    d = D[slug]; region = d.get("region_slug") or ss[0]["regionSlug"]
    if coming and not (d.get("content_status") in ("approved", "published") and d.get("aeo_approved")): continue
    # Destination-first (Stage 2): a place inside a country (parent_destination_id set) is exported by
    # export-places.py and rendered under its parent; it is never a country page.
    if d.get("parent_destination_id"): continue
    reviewed = d.get("content_status") in ("approved", "published") and bool(d.get("aeo_approved"))
    fb = d.get("fact_blocks") or {}
    name = NAMES.get(slug, clean(d["name"]))
    heroes = [s["hero"] for s in ss if s["hero"]]
    img = lambda u, i: u if u and u != "None" else (heroes[i % len(heroes)] if heroes else None)
    story = []
    for n in ("1", "2"):
        b = blocks(d.get(f"section_{n}_description"))
        if b: story.append({"eyebrow": title_case(clean(d.get(f"section_{n}_subtitle"))) or name, "title": clean(d.get(f"section_{n}_title")) or name, "blocks": b,
                            "image": {"src": img(d.get(f"section_{n}_image"), int(n)), "alt": f"{name}: {clean(d.get(f'section_{n}_title')) or 'the landscape'}"}})
    # Airports by IATA code across the country's stays: "Maun International Airport (MUB)" -> MUB
    codes, cname = collections.Counter(), {}
    for st in ss:
        for m in re.finditer(r"([A-Z][^(),;–]*?)\s*\(([A-Z]{3})\)", st.get("airport") or ""):
            nm = re.sub(r"^(and|or|then|via)\s+", "", m.group(1).strip(), flags=re.I)
            codes[m.group(2)] += 1; cname.setdefault(m.group(2), nm)
    top = [c for c, _ in codes.most_common(3)]
    airports = [[f"{cname[c]} ({c})", f"Serves {codes[c]} {'stay' if codes[c] == 1 else 'stays'} in the Ledger here"] for c in top]
    if coming:  # no stays to count: the gateways named in the record's getting-there fact, in order
        for m in re.finditer(r"([A-Z][^(),;:.–]*?)\s*\(([A-Z]{3})\)", fb.get("how_to_get_there") or ""):
            if m.group(2) not in top: top.append(m.group(2)); cname[m.group(2)] = re.sub(r"^(Fly into|Fly to|and|or|then|via|at|from)\s+", "", m.group(1).strip(), flags=re.I)
        top = top[:3]
        airports = [[f"{cname[c]} ({c})", "The main international gateway" if i == 0 else "On record for " + clean(d["name"])] for i, c in enumerate(top)]
    fly = top[:2]
    months_src = fb.get("best_months") or collections.Counter(s["bestMonths"] for s in ss if s.get("bestMonths")).most_common(1)[0][0] if (fb.get("best_months") or any(s.get("bestMonths") for s in ss)) else None
    facts = []
    if reviewed:
        for k, label in (("best_months", "Best months"), ("how_to_get_there", "Getting there"), ("who_its_for", "Who it suits"), ("signature_experiences", "Signature experiences")):
            if fb.get(k): facts.append([label, clean(fb[k])])
    out.append({
        "slug": slug, "name": name, "region": region, "regionName": REGIONS.get(region, region),
        "ledgerId": d.get("ledger_id"),
        "subtitle": title_case(clean(d.get("section_1_subtitle"))) or (f"{len(ss)} vetted stays" if ss else "Stays coming soon"),
        "leading": clean(d.get("leading_description")),
        "hero": {"src": img(d.get("featured_image_url"), 0), "alt": f"{name}, {REGIONS.get(region, region)}"},
        "story": story, "facts": facts,
        "faqs": [{"q": clean(f["question"]), "a": clean(f["answer"])} for f in (d.get("faq_blocks") or []) if f.get("question")] if reviewed else [],
        "contentStatus": d.get("content_status") or "none",
        "months": area_bands(months_src) or ([{"area": f"Across {name}", "note": "From the Ledger's best-months notes", "months": bands(months_src)}] if bands(months_src) else []), "airports": airports, "transfers": [],
        "flyInto": " · ".join(fly) or "Ask James", "bestShort": year_round(months_src) or short_months(months_src) or "Ask James",
        "atlasName": STATES.get(slug) and "United States of America" or ATLAS.get(slug, clean(d["name"])),
        **({"useStays": True, "chartLabel": STATES[slug]} if slug in STATES else {}),
        **({"staysComing": True} if coming else {}),
    })
json.dump({"_note": "Generated by scripts/export-countries.py from the library's Destination records. Edit the library, then re-run.", "countries": out},
          open(ROOT / "lib/content/countries-library.json", "w"), indent=1, ensure_ascii=False)
print(len(out), "country pages:", ", ".join(c["slug"] for c in out))
print("no story:", [c["slug"] for c in out if not c["story"]], "no airports:", [c["slug"] for c in out if not c["airports"]], "stays coming:", [c["slug"] for c in out if c.get("staysComing")])
