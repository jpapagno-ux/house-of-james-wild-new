#!/usr/bin/env python3
"""Ledger export: regions. Turns the Base44 library's Region, Destination and
live Stay records into lib/content/regions.json for /destinations/[region].

usage: export-regions.py REGIONS.json DESTINATIONS.json STAYS.json OUT.json
(each input is a query_entities dump: {"entities": [...]})

Public fields only (never commission, net rates, contracts or contact
details). Library copy is cleaned (HTML stripped, "Wild Earth Stays" read as
the house) but not rewritten; the page labels unreviewed copy.
"""
import json, re, sys, html

REG_ORDER = ["africa", "asia", "usa-canada", "central-america", "caribbean-mexico", "oceania", "south-america", "europe", "polar-antarctica", "polar-arctic"]
LABEL = {"polar-antarctica": "Polar: Antarctica", "polar-arctic": "Polar: Arctic"}
SLUG_FIX = {"chile": "chile", "spain-isla-mallorca": "spain-isla-mallorca"}

def load(p): return json.load(open(p))["entities"]

def clean(s):
    if not s: return ""
    s = re.sub(r"<br\s*/?>", "\n", s)
    s = re.sub(r"</(p|h\d|li)>", "\n\n", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s).replace("‍", "").replace("\xa0", " ")
    s = s.replace("With Wild Earth Stays, travelers", "Travelers").replace("with Wild Earth Stays", "with James Wild & Co").replace("Wild Earth Stays", "James Wild & Co")
    s = s.replace("—", ", ").replace(" , ", ", ")
    return re.sub(r"\n{3,}", "\n\n", s).strip()

def paras(s): return [p.strip() for p in clean(s).split("\n") if p.strip()]

def highlights(raw):
    """Section 2: 'TITLE\\ntext' blocks, or <strong>Title</strong><br>text, or <h4>Title</h4><p>text</p>."""
    if not raw: return []
    out = []
    for m in re.finditer(r"<(?:strong|h4)[^>]*>(?:<strong[^>]*>)?([^<]+)(?:</strong>)?</(?:strong|h4)>\s*(?:<br\s*/?>|</h4>\s*<p[^>]*>|</p>\s*<p[^>]*>)?\s*([^<]+)", raw):
        t, d = clean(m.group(1)).strip(" :"), clean(m.group(2))
        if t and d and len(d) > 30: out.append({"title": t.title() if t.isupper() else t, "text": d})
    if out: return out[:6]
    for block in clean(raw).split("\n\n"):
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        if len(lines) >= 2 and lines[0].isupper() and len(lines[0]) < 60:
            out.append({"title": lines[0].title().replace("&", "&"), "text": " ".join(lines[1:])})
    return out[:6]

def first_sentence(s, n=170):
    s = clean(s).replace("\n", " ")
    m = re.match(r"(.+?[.!?])(\s|$)", s)
    s = m.group(1) if m else s
    return s if len(s) <= n else s[: n - 1].rsplit(" ", 1)[0] + "…"

regions, dests, stays = load(sys.argv[1]), load(sys.argv[2]), load(sys.argv[3])
by_slug = {r.get("webflow_slug"): r for r in regions if r.get("webflow_slug")}
rid_slug = {r["id"]: r.get("webflow_slug") for r in regions}
live_dests = [d for d in dests if d.get("site_status") == "live"]
dest_by_id = {d["id"]: d for d in dests}

# Ordering only (never a mark): stays James has named as his own visits come
# first among the featured cards. Marks still come only from house_status.
FOUNDER_KNOWN = ["vahine", "lion sands", "monwana", "kirkman", "ellerman", "tswalu", "leeu", "dumatau", "mombo", "qorokwe", "jaci", "casa koko", "ulum", "faru faru", "tongabezi", "cottar", "lewa house", "baymahni", "kahari", "aliikai"]
def known(name): return 0 if any(k in name.lower() for k in FOUNDER_KNOWN) else 1
def norm(name): return " ".join(re.sub(r"[^a-z ]", "", name.lower().replace("\u202f", " ")).split()[:2])

MARK_ORDER = {"founder_returned": 0, "founder_visited": 1, "founder_vetted": 2, "house_approved": 3, "partner_verified": 4}

out = []
for slug in REG_ORDER:
    r = by_slug.get(slug)
    if not r: continue
    countries = []
    region_stays = []
    for d in sorted([d for d in live_dests if d.get("region_slug") == slug or rid_slug.get(d.get("region_id")) == slug], key=lambda d: d["name"]):
        ds = [s for s in stays if s.get("destination_id") == d["id"]]
        for s in ds:
            region_stays.append((s, d))
        countries.append({
            "name": d["name"].replace("Spain-Isla Mallorca", "Spain: Mallorca"),
            "slug": d.get("webflow_slug"),
            "image": d.get("featured_image_url"),
            "line": first_sentence(d.get("leading_description") or ""),
            "stays": len(ds),
            "bestMonths": ((d.get("fact_blocks") or {}).get("best_months") or None),
            "reviewed": d.get("content_status") == "approved",
        })
    countries = [c for c in countries if c["stays"] > 0 or c["image"]]
    picks = [(s, d) for s, d in region_stays if s.get("hero_image_url") and (s.get("webflow_slug") or s.get("property_slug"))]
    picks.sort(key=lambda sd: (MARK_ORDER.get(sd[0].get("house_status") or "", 9), known(sd[0]["name"]), 0 if sd[0].get("tagline") else 1, sd[0]["name"]))
    seen_c, seen_n, featured = {}, set(), []
    for s, d in picks:  # spread across countries: at most 2 per country; skip duplicate filings
        if seen_c.get(d["id"], 0) >= 2 or norm(s["name"]) in seen_n: continue
        seen_n.add(norm(s["name"]))
        seen_c[d["id"]] = seen_c.get(d["id"], 0) + 1
        featured.append({"name": s["name"], "slug": s.get("webflow_slug") or s.get("property_slug"), "ledgerId": s.get("ledger_id"), "tagline": clean(s.get("tagline") or "") or None, "image": s["hero_image_url"].replace("https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/", "https://media.base44.com/images/public/"), "country": d["name"], "status": s.get("house_status"), "statusDate": s.get("house_status_date"), "reserveChild": bool(s.get("is_reserve_child"))})
        if len(featured) >= 8: break
    lead = [l.strip() for l in clean(r.get("leading_description") or "").split("\n") if l.strip()]
    tagline, intro = (lead[0], lead[1:]) if len(lead) > 1 else (r.get("section_1_title") or "", lead)
    fb = r.get("fact_blocks") or {}
    stay_total = sum(c["stays"] for c in countries)
    out.append({
        "slug": slug, "name": LABEL.get(slug, r["name"]).replace("Polar | ", "Polar: "),
        "tagline": clean(tagline).rstrip("."), "intro": intro + paras(r.get("section_1_description")),
        "heading": clean(r.get("section_1_title") or ""),
        "highlightsTitle": clean(r.get("section_2_title") or ""), "highlights": highlights(r.get("section_2_description")),
        "hero": r.get("featured_image_url"), "gallery": [g for g in (r.get("gallery_images") or [])][:6],
        "facts": {k: clean(v) for k, v in fb.items() if v} if r.get("content_status") == "approved" else {},
        "faqs": [{"q": f["question"], "a": clean(f["answer"])} for f in (r.get("faq_blocks") or [])] if r.get("content_status") == "approved" else [],
        "countries": countries, "featured": featured, "stayCount": stay_total,
        "reviewed": r.get("content_status") == "approved" and bool(r.get("aeo_approved")),
        "ready": stay_total > 0 and bool(r.get("featured_image_url")) and bool(intro or r.get("section_1_description")),
    })

json.dump({"exportedOn": "2026-10-25", "regions": out}, open(sys.argv[4], "w"), indent=1, ensure_ascii=False)
for x in out: print(f'{x["slug"]:18} ready={x["ready"]!s:5} reviewed={x["reviewed"]!s:5} countries={len(x["countries"]):2} stays={x["stayCount"]:3} featured={len(x["featured"])} highlights={len(x["highlights"])}')
