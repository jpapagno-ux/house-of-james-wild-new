#!/usr/bin/env python3
"""Ledger export: stays. Turns live Stay records (with their Destination) into
lib/content/stays.json for /stays/[slug] and the country pages.

usage: export-stays.py STAYS.json DESTINATIONS.json OUT.json

Public fields only (never commission, net rates, contracts, contacts).
Library copy is cleaned (HTML out, lists kept, "Wild Earth Stays" read as the
house) but not rewritten. FAQs and fact blocks ship only when the record's
content is approved/published AND AEO-approved.
"""
import json, re, sys, html

def load(p): return json.load(open(p))["entities"]
MEDIA = "https://media.base44.com/images/public/"
# Countries filed under a destination they don't belong to (flagged in review).
NOT_IN = {"south-africa": {"camp-hwange-muddy-teak": "Zimbabwe", "gorongosa-safaris": "Mozambique"}, "costa-rica": {"isla-palenque-resort": "Panama"}}
# Live booking-engine properties (Tag Albie), by stay slug.
ENGINE = {"leeu-estates": "leeu-estates-resorts", "le-quartier-francais": "le-quartier-francais", "leeu-house": "leeu-house"}
# Hand corrections to library records, re-applied on every export.
FIX = {
    "arenal-springs-camp-by-nayara": {"name": "Arenal Springs Camp by Nayara"},
    "lales-camp-expeditions": {"name": "Lale’s Camp & Expeditions", "country": "Madagascar", "countrySlug": "madagascar",
                               "misfiled": "Library destination is South Africa; the property is in Masoala, Madagascar"},
}

def text(s):
    s = html.unescape(s or "")  # some records hold escaped tags (&lt;span&gt;)
    s = re.sub(r"<figure.*?</figure>", "", s, flags=re.S)
    s = re.sub(r"<br\s*/?>", "\n", s)
    s = re.sub(r"</(p|h\d|li)>", "\n\n", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s).replace("‍", "").replace("\xa0", " ").replace("—", ", ")
    s = s.replace("Wild Earth Stays", "James Wild & Co")
    return re.sub(r"[ \t]+", " ", s).strip()

def block(raw):
    """-> {paras: [...], items: [...]} ; short lines become items (lists)."""
    t = text(raw)
    lines = [l.strip(" .•-") for l in t.split("\n") if l.strip()]
    items = [l for l in lines if len(l) <= 70 and not l.endswith(":")]
    if lines and len(items) >= 3 and len(items) >= 0.7 * len(lines):
        return {"paras": [], "items": items}
    paras = [" ".join(p.strip().split("\n")) for p in t.split("\n\n") if p.strip()]
    # "Classic Room. Deluxe Room. Studio." -> a list
    if len(paras) == 1:
        segs = [x.strip(" .") for x in re.split(r"\.\s+", paras[0]) if x.strip(" .")]
        if len(segs) >= 3 and all(len(x) <= 55 for x in segs): return {"paras": [], "items": segs}
    return {"paras": paras, "items": []}

def sections(raw):
    """<h4>Title</h4><p>text</p> blocks -> [{title, body}]; else paragraphs."""
    if not raw: return []
    out = [{"title": text(t), "body": text(b)} for t, b in re.findall(r"<h[34][^>]*>(.*?)</h[34]>\s*<p[^>]*>(.*?)</p>", raw, flags=re.S)]
    if out: return [o for o in out if o["body"]][:6]
    ps = block(raw)["paras"]
    res, i = [], 0
    while i < len(ps):  # a short line followed by text is that text's heading
        if len(ps[i]) <= 60 and i + 1 < len(ps) and len(ps[i + 1]) > 60:
            res.append({"title": ps[i].rstrip(":"), "body": ps[i + 1]}); i += 2
        else:
            res.append({"title": None, "body": ps[i]}); i += 1
    return res[:4]

def img(u):
    if not u: return None
    u = u.replace("https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/", MEDIA)
    if u.startswith(MEDIA) and u.lower().endswith(".avif"): return "/img/b44/" + u.rsplit("/", 1)[1]
    return u

def coords(s):
    m = re.match(r"\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)", s or "")
    return {"lat": float(m.group(1)), "lng": float(m.group(2))} if m else None

stays, dests = load(sys.argv[1]), load(sys.argv[2])
import pathlib, datetime
RELEASE = [r["slug"] for r in json.load(open(pathlib.Path(__file__).resolve().parent / "data" / "stay-release.json"))["released"]]
stays = [s for s in stays if (s.get("webflow_slug") or s.get("property_slug")) in set(RELEASE)]
STOP = set("the and of by at a in on resort lodge camp hotel villa villas house suites suite island private reserve beach spa retreat safari tented collection mara game boutique luxury estate inn ranch room guest area general low resolution width jpg jpeg png avif webp".split())
def toks(x): return {t for t in re.findall(r"[a-z]{3,}", re.sub(r"['’]s?\b", "", html.unescape(x or "").lower())) if t not in STOP}
ALL_NAMES = [toks(s["name"]) for s in load(sys.argv[1])]
def foreign(url, own):
    """True when a photo's file name names a different stay and not this one."""
    fn = toks(re.sub(r"%20|[_-]+", " ", url.rsplit("/", 1)[-1]))
    if fn & own: return False
    return any(len(o) >= 2 and o <= fn for o in ALL_NAMES if o != own)
D = {d["id"]: d for d in dests}
out, seen = [], set()
for s in sorted(stays, key=lambda s: s["name"]):
    slug = s.get("webflow_slug") or s.get("property_slug")
    if not slug or slug in seen: continue
    seen.add(slug)
    d = D.get(s.get("destination_id")) or {}
    cslug = d.get("webflow_slug")
    actual = NOT_IN.get(cslug, {}).get(slug)
    reviewed = s.get("content_status") in ("approved", "published") and bool(s.get("aeo_approved"))
    fb = s.get("fact_blocks") or {}
    gallery = [img(g) for g in (s.get("gallery_urls") or []) if g and not foreign(g, toks(s["name"]))][:10]
    out.append({
        "slug": slug, "name": text(s.get("display_name") or s["name"]).replace(" ", " "), "ledgerId": s.get("ledger_id"),
        "country": actual or d.get("name"), "countrySlug": None if actual else cslug, "regionSlug": None if actual else d.get("region_slug"),
        "misfiled": actual, "category": s.get("category"),
        "tagline": text(s.get("tagline")) or None, "quote": text(s.get("intro_quote")).strip('"“” ') or None,
        "hero": img(s.get("hero_image_url")), "gallery": [g for g in gallery if g and g != img(s.get("hero_image_url"))],
        "bestMonths": s.get("best_months"), "bestMonthsNote": text(s.get("best_months_description")) or None,
        "bestFor": s.get("best_for") or [],
        "status": s.get("house_status"), "statusDate": s.get("house_status_date"),
        "coords": coords(s.get("coordinates")), "airport": s.get("airport_name"), "airportDirections": text(s.get("airport_directions")) or None,
        "founderNote": text(s.get("founder_note")) or None,
        "rooms": block(s.get("stays_content")), "experiences": block(s.get("adventures_experiences_content")),
        "features": block(s.get("features_content")), "onlyHere": block(s.get("only_here_content"))["paras"],
        "why": sections(s.get("why_stay_here_content")),
        "facts": {k: text(v) for k, v in fb.items() if v} if reviewed else {},
        "faqs": [{"q": text(f.get("question")), "a": text(f.get("answer"))} for f in (s.get("faq_blocks") or []) if f.get("question")] if reviewed else [],
        "reviewed": reviewed, "reserveChild": bool(s.get("is_reserve_child")), "parentSlug": s.get("parent_property_slug"),
        "engine": ENGINE.get(slug),
    })
for x in out: x.update(FIX.get(x["slug"], {}))
json.dump({"exportedOn": datetime.date.today().isoformat(), "stays": out}, open(sys.argv[3], "w"), indent=1, ensure_ascii=False)
from collections import Counter
print(len(out), "stays;", Counter(x["countrySlug"] or "misfiled" for x in out))
print("no hero:", [x["slug"] for x in out if not x["hero"]])
print("thin (no rooms/why/features):", [x["slug"] for x in out if not (x["rooms"]["paras"] or x["rooms"]["items"] or x["why"] or x["features"]["items"] or x["features"]["paras"])])
print("reviewed:", sum(x["reviewed"] for x in out))

# Keep the link guard's list of stay pages in step with the export.
import pathlib
has = lambda b: b["paras"] or b["items"]
ready = sorted(x["slug"] for x in out if x["hero"] and (has(x["rooms"]) or has(x["features"]) or x["why"] or x["onlyHere"]))
rp = pathlib.Path(__file__).resolve().parent.parent / "lib" / "routes.ts"
src = rp.read_text()
new = "// BEGIN GENERATED STAYS (scripts/export-stays.py rewrites this list)\nexport const STAY_SLUGS: string[] = [\n" + "".join(f'  "{x}",\n' for x in ready) + "];\n// END GENERATED STAYS\n"
src = re.sub(r"// BEGIN GENERATED STAYS.*?// END GENERATED STAYS\n", lambda m: new, src, flags=re.S)
rp.write_text(src)
print("stay pages:", len(ready))
