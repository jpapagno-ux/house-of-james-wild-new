import re
#!/usr/bin/env python3
"""Map every URL of the old wildearthstays.com (Webflow) to its page on the new site.

Input:  data/old-site/wildearthstays-urls.json  (crawl of the live site: path, status, parent property, title)
Output: lib/redirects/old-site.json              (exact path -> destination, served by middleware.ts)
        data/old-site/redirect-report.csv         (every mapping and why, for review)

Re-run whenever a country, stay or voyage page ships so old links land on the most specific page:
    python3 scripts/build-redirects.py
"""
import csv, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
crawl = json.load(open(ROOT / "data/old-site/wildearthstays-urls.json"))["pages"]
# Only stays whose page is built (STAY_SLUGS in lib/routes.ts); the rest fall back to their country or region.
_routes = (ROOT / "lib/routes.ts").read_text()
stays = set(re.findall(r'"([a-z0-9-]+)"', _routes[_routes.index("STAY_SLUGS"):_routes.index("];", _routes.index("STAY_SLUGS"))]))
reserves = json.load(open(ROOT / "lib/content/reserves.json"))["reserves"]
RESERVES = {r["slug"] for r in reserves}
CAMPS = {f"{r['slug']}/{c['slug']}" for r in reserves for c in r["camps"]}
# Country pages built (lib/content/countries.ts): slug -> region
countries_ts = (ROOT / "lib/content/countries.ts").read_text()
BUILT_COUNTRIES = dict(re.findall(r'slug: "([a-z-]+)", name: "[^"]+", region: "([a-z-]+)"', countries_ts))
# Country guides (lib/content/guides.ts) without a parent are country pages too
guides_ts = (ROOT / "lib/content/guides.ts").read_text()
BUILT_COUNTRIES.update({s: r for s, r in re.findall(r'slug: "([a-z-]+)", region: "([a-z-]+)", country: "[a-z-]+", name:', guides_ts)})

# Old country name (from page titles) or /country/ slug -> (new country slug, region)
REGION = {
    "africa": ["botswana", "south-africa", "tanzania", "kenya", "zambia", "namibia", "rwanda", "zimbabwe", "madagascar", "seychelles", "masai-mara"],
    "asia": ["indonesia", "maldives", "thailand", "vietnam", "cambodia", "philippines", "mongolia"],
    "caribbean-mexico": ["mexico", "baja-mexico", "bahamas", "turks-caicos", "st-barths", "st-lucia", "virgin-islands"],
    "central-america": ["costa-rica", "panama", "belize"],
    "europe": ["ireland", "spain", "spain-ibiza", "spain-isla-mallorca", "france", "greece", "italy", "portugal", "switzerland", "norway"],
    "south-america": ["peru", "chile", "ecuador-galapagos", "argentina", "brazil", "bolivia", "falkland-islands"],
    "oceania": ["tahiti", "fiji", "australia", "new-zealand"],
    "usa-canada": ["utah", "new-mexico", "california", "canada", "montana", "arizona", "wyoming", "hawaii", "colorado", "florida"],
    "polar-antarctica": ["antarctica-cruises", "antarctic-peninsula", "antarctic-circle", "ross-sea", "south-georgia", "south-pole"],
    "polar-arctic": ["arctic-cruises", "iceland", "canadian-high-arctic", "northwest-passage"],
}
C2R = {c: r for r, cs in REGION.items() for c in cs}
ALIAS_COUNTRY = {"masai-mara": "kenya", "seychelles-find-your-wild-in-the-indian-ocean": "seychelles", "chile-easter-island": "chile",
                 "portugal-azores": "portugal", "spain-ibiza": "spain", "spain-isla-mallorca": "spain", "baja-mexico": "mexico"}

def slugify(s):
    s = s.replace("&amp;", "&").replace("+", " ").lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

def country_page(slug):
    slug = ALIAS_COUNTRY.get(slug, slug).replace("chile-easter-island", "chile").replace("ecuador-galapagos", "ecuador-galapagos")
    region = C2R.get(slug) or C2R.get(ALIAS_COUNTRY.get(slug, ""), None)
    if slug in BUILT_COUNTRIES: return f"/destinations/{BUILT_COUNTRIES[slug]}/{slug}", "country page"
    if region: return f"/destinations/{region}", f"region page ({slug} country page not built yet)"
    return "/destinations", "destinations hub (unknown country)"

def country_from_title(t):
    m = re.search(r"in ([^|]+?) \| Wild", t or "")
    return slugify(m.group(1)) if m else None

# Hand-mapped records whose old slug differs from the new one
SPECIAL = {
    "aliikai-voyage": ("/voyages/ships/aliikai", "Aliikai vessel profile"),
    "monwana": ("/stays/monwana-thornybush", "renamed stay"),
}

def stay_target(slug):
    if slug in SPECIAL: return SPECIAL[slug]
    if slug in RESERVES: return f"/safaris/{slug}", "safari reserve"
    for r in RESERVES:
        if slug.startswith(r + "-") and f"{r}/{slug[len(r)+1:]}" in CAMPS: return f"/safaris/{r}/{slug[len(r)+1:]}", "safari camp"
    if slug in stays: return f"/stays/{slug}", "stay page"
    near = [s for s in stays if slug.startswith(s + "-") or s.startswith(slug + "-")]
    if len(near) == 1: return f"/stays/{near[0]}", f"stay page (matched {near[0]})"
    return None, None

def property_target(slug, title):
    t, why = stay_target(slug)
    if t: return t, why
    c = country_from_title(title)
    if c:
        t, why = country_page(c)
        return t, f"not on the new site yet; {why}"
    return "/stays", "not on the new site yet; stays hub"

TOP = {
    "/": "/", "/about": "/about", "/team": "/about/team", "/contact": "/plan", "/Contact": "/plan",
    "/wild-earth-portfolio": "/about", "/find-stay": "/stays", "/find-your-itinerary": "/overland",
    "/coming-soon": "/", "/agents-influencers": "/for-advisors", "/agent-application": "/for-advisors",
    "/influencer-application": "/for-advisors", "/partners": "/partners", "/booking-process": "/plan",
    "/ai-itinerary": "/plan/iggi", "/workshops": "/workshops", "/request-itinerary": "/plan",
    "/booking-itinerary": "/plan", "/booking-form-retreat": "/plan", "/wellness-retreats": "/gatherings",
    "/memoirs": "/journal", "/land": "/stays?by=land", "/water": "/voyages",
}
# Journal posts already migrated: each post's oldUrl in lib/content/journal/posts.ts.
_jp = open("lib/content/journal/posts.ts").read()
JOURNAL = {m.group(2): f"/journal/{m.group(1)}" for m in re.finditer(r'slug: "([^"]+)"[\s\S]*?oldUrl: "([^"]+)"', _jp)}
ITINERARY = {
    "/itinerary/aliikai-raja-ampat": "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north",
    "/itinerary/lalibela-reserve-safaris": "/safaris/lalibela-reserve",
    "/itinerary/asilia-safari-circuits": "/safaris",
    "/itinerary/mobile-safaris-by-serian": "/safaris",
    "/itinerary/nomad-safari-circuits": "/safaris",
    "/itinerary/harbors-headlands-irish-hearths": "/destinations/europe",
    "/wellness-retreats/londolozi": "/safaris/londolozi-reserve",
    "/wellness-retreats/kaaba-luum-tulum": "/destinations/caribbean-mexico",
}

rows, MAP = [], {}
for path, p in sorted(crawl.items()):
    if p["status"] != 200: continue
    parts = path.strip("/").split("/")
    kind, slug = (parts[0], parts[1]) if len(parts) > 1 else (parts[0] or "", "")
    dest, why = None, ""
    if path in TOP: dest, why = TOP[path], "site page"
    elif path in ITINERARY: dest, why = ITINERARY[path], "itinerary"
    elif kind == "property": dest, why = property_target(slug, p["title"])
    elif kind == "book":
        parent = (p["parent"] or f"/property/{slug}").split("/")[-1]
        dest, why = property_target(parent, crawl.get(f"/property/{parent}", {}).get("title", p["title"]))
        why = "booking page -> " + why
    elif kind == "stay":
        parent = (p["parent"] or "").split("/")[-1]
        if parent:
            dest, why = property_target(parent, crawl.get(f"/property/{parent}", {}).get("title", ""))
            if dest == "/voyages/ships/aliikai": dest += "#cabins"
            why = f"room of {parent} -> " + why
        else: dest, why = "/stays", "room with no parent found; stays hub"
    elif kind == "country": dest, why = country_page(slug)
    elif kind == "region": dest, why = (f"/destinations/{slug}", "region page")
    elif kind == "memoir":
        dest, why = (JOURNAL[path], "journal post") if path in JOURNAL else ("/journal", "journal (post not migrated yet)")
    elif kind == "itinerary": dest, why = "/overland", "itinerary not migrated yet"
    else: dest, why = "/", "unmatched; home"
    if dest == path: continue  # same URL on the new site, nothing to redirect
    MAP[path] = dest
    rows.append([path, dest, why, p["title"]])

(ROOT / "lib/redirects").mkdir(exist_ok=True)
json.dump(MAP, open(ROOT / "lib/redirects/old-site.json", "w"), separators=(",", ":"), sort_keys=True)
with open(ROOT / "data/old-site/redirect-report.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["old path", "new path", "why", "old title"]); w.writerows(rows)
from collections import Counter
print(len(MAP), "redirects")
import sys
if sys.stdout.isatty() or True: print(Counter(r[2].split(";")[0].split(" ->")[0].split(" (")[0] for r in rows).most_common(20))
