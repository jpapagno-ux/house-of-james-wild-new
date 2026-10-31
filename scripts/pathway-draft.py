#!/usr/bin/env python3
"""Wild Pathways: draft a classification for every live stay that has none.

usage: pathway-draft.py lib/content/stays.json OUT.json

Reads the Ledger's own words for each stay (country, category, tagline, quote,
experiences, features, only-here, why, best-for) and scores the eight
pathways from a keyword vocabulary per pathway plus the country's setting.
Primary = top score; secondaries = the next one or two above a floor, never
the primary. Every draft carries the words that earned it, so James can
confirm or move it. Nothing here is approved: the output is a review list
and, once James says so, library drafts (pathway_status: draft).
"""
import json, re, sys, html, collections

S = json.load(open(sys.argv[1])); S = S["stays"] if isinstance(S, dict) else S

# Setting by country: the pathway a place in this country leans to before its own words speak.
COUNTRY = {
  "Botswana": "PATH-04", "Kenya": "PATH-04", "Tanzania": "PATH-04", "Zambia": "PATH-04", "Zimbabwe": "PATH-04", "Rwanda": "PATH-04",
  "South Africa": "PATH-04", "Namibia": "PATH-06", "Mozambique": "PATH-02", "Madagascar": "PATH-06", "Seychelles": "PATH-02",
  "Maldives": "PATH-02", "Tahiti": "PATH-02", "Fiji": "PATH-02", "Philippines": "PATH-02", "Hawaii": "PATH-02", "Indonesia": "PATH-02",
  "Belize": "PATH-02", "Mexico": "PATH-02", "Costa Rica": "PATH-01", "Panama": "PATH-02", "Peru": "PATH-03", "Ecuador & Galapagos": "PATH-04",
  "Brazil": "PATH-01", "Bolivia": "PATH-06", "Chile & Easter Island": "PATH-03", "Argentina": "PATH-03", "Thailand": "PATH-02",
  "Vietnam": "PATH-08", "Cambodia": "PATH-08", "Japan": "PATH-08", "Australia": "PATH-01", "New Zealand": "PATH-03", "Utah": "PATH-06",
  "Montana": "PATH-03", "Wyoming": "PATH-03", "Arizona": "PATH-06", "California": "PATH-08", "Canada": "PATH-03", "Iceland": "PATH-06",
  "Ireland": "PATH-08", "Portugal + Azores": "PATH-08", "Spain": "PATH-08", "Spain-Ibiza": "PATH-02", "Italy": "PATH-08", "France": "PATH-08", "Switzerland": "PATH-03",
}
VOCAB = {
  "PATH-01": ["rainforest", "rain forest", "jungle", "cloud forest", "canopy", "monteverde", "amazon", "tortuguero", "osa", "corcovado", "arenal", "volcano", "sloth", "toucan", "daintree", "waterfall", "hot springs", "tropical forest"],
  "PATH-02": ["island", "beach", "lagoon", "reef", "atoll", "ocean", "overwater", "snorkel", "dive", "diving", "surf", "coast", "cay", "caye", "sea", "bay", "shore", "marine", "sailing", "mantas", "whale shark", "coral"],
  "PATH-03": ["mountain", "highland", "alpine", "andes", "patagonia", "altitude", "peak", "summit", "glacier", "valley", "ski", "torres del paine", "sacred valley", "fjord", "sierra", "hiking", "trek"],
  "PATH-04": ["safari", "big five", "wildlife", "game drive", "leopard", "lion", "elephant", "rhino", "gorilla", "chimpanzee", "migration", "predator", "wilderness", "game reserve", "private reserve", "concession", "bush", "bushveld", "delta", "mara", "serengeti", "kruger", "sabi sand", "ranger", "tracker", "giraffe", "cheetah", "bison", "elk", "bear", "whale", "galapagos", "iguana", "tortoise", "birding", "jaguar", "pantanal"],
  "PATH-05": ["wellness", "spa", "retreat", "yoga", "meditation", "restoration", "restorative", "sanctuary", "stillness", "slow down", "holistic", "healing", "mindful", "six senses", "como shambhala", "thermal", "serenity", "calm", "quiet"],
  "PATH-06": ["remote", "hidden", "undiscovered", "desert", "dunes", "skeleton coast", "kalahari", "namib", "atacama", "salt flat", "uyuni", "far", "frontier", "end of the world", "off the grid", "wild coast", "untouched", "few", "secret", "mobile camp", "fly camp", "expedition", "antarctica", "arctic", "iceland", "outback", "tundra", "lake natron"],
  "PATH-07": ["private villa", "private house", "exclusive use", "exclusive-use", "sole use", "sole-use", "whole house", "taken whole", "homestead", "residence", "villa", "private home", "your own", "family home", "farmhouse", "manor house", "private estate", "entire", "buyout", "buy-out", "private camp", "country house"],
  "PATH-08": ["heritage", "historic", "history", "castle", "manor", "estate", "winelands", "vineyard", "wine", "georgian", "victorian", "colonial", "culture", "cultural", "tradition", "village", "artisan", "craft", "hacienda", "palazzo", "monastery", "temple", "ruins", "city", "town", "cuisine", "culinary", "chef", "art", "architecture", "riad", "palace", "farm"],
}
CATEGORY = {"villa": "PATH-07", "residence": "PATH-07", "house": "PATH-07", "camp": "PATH-04", "lodge": "PATH-04", "island": "PATH-02", "resort": "PATH-02", "hotel": "PATH-08", "retreat": "PATH-05", "ranch": "PATH-03", "reserve": "PATH-04"}
BEST_FOR = {"wellness": "PATH-05", "spa": "PATH-05", "family": "PATH-07", "group_exclusive_use": "PATH-07", "families": "PATH-07", "honeymoon": "PATH-02", "couples": "PATH-05", "wildlife": "PATH-04", "safari": "PATH-04", "diving": "PATH-02", "surf": "PATH-02", "culture": "PATH-08", "food": "PATH-08", "adventure": "PATH-06", "remote": "PATH-06"}

def strip(h): return html.unescape(re.sub(r"<[^>]+>", " ", str(h or ""))).lower()
def words(s):
  parts = [s.get("name"), s.get("tagline"), s.get("quote"), s.get("bestMonthsNote")]
  for k in ("rooms", "experiences", "features"):
    v = s.get(k) or {}
    if isinstance(v, dict): parts += v.get("paras", []) + v.get("items", [])
  oh = s.get("onlyHere") or []
  parts += [json.dumps(oh)] if oh else []
  parts += s.get("why") or []
  return strip(" ".join(str(p) for p in parts if p))

def draft(s):
  t = words(s); score = collections.Counter(); hits = collections.defaultdict(set)
  for pid, vocab in VOCAB.items():
    for w in vocab:
      n = len(re.findall(r"\b" + re.escape(w) + r"s?\b", t))
      if n:
        score[pid] += min(n, 4) * (2 if w in ("safari", "island", "rainforest", "villa", "wellness", "heritage", "remote", "mountain", "private villa", "exclusive use", "gorilla", "overwater", "desert", "winelands") else 1)
        hits[pid].add(w)
  c = COUNTRY.get(s.get("country") or "")
  if c: score[c] += 3; hits[c].add(f"country: {s.get('country')}")
  cat = CATEGORY.get((s.get("category") or "").lower())
  if cat: score[cat] += 2; hits[cat].add(f"category: {s.get('category')}")
  for b in s.get("bestFor") or []:
    p = BEST_FOR.get(str(b).lower())
    if p: score[p] += 2; hits[p].add(f"best for: {b}")
  if not score: return None
  ranked = score.most_common()
  primary, top = ranked[0]
  secondary = [p for p, v in ranked[1:3] if v >= max(4, top * 0.45)]
  confidence = "high" if top >= 10 and (len(ranked) == 1 or top >= ranked[1][1] * 1.6) else "medium" if top >= 6 else "low"
  return {"primary": primary, "secondary": secondary, "confidence": confidence, "scores": dict(ranked[:4]), "why": {p: sorted(hits[p])[:6] for p in [primary] + secondary}}

out = []
for s in S:
  if s.get("pathway"): continue
  d = draft(s)
  if not d: continue
  vols = ["stays"]
  if d["primary"] == "PATH-04" and s.get("regionSlug") == "africa": vols.append("safaris")
  if s.get("regionSlug") == "europe": vols.append("europe")
  if d["primary"] == "PATH-07" or "PATH-07" in d["secondary"]: vols.append("gatherings")
  out.append({"slug": s["slug"], "name": re.sub(r"\s+", " ", s["name"]).strip(), "ledgerId": s.get("ledgerId"), "country": s.get("country"), "region": s.get("regionSlug"), "category": s.get("category"), **d, "volumes": vols})
json.dump({"draftedOn": "2026-10-31", "by": "Iggi draft (scripts/pathway-draft.py)", "records": out}, open(sys.argv[2], "w"), indent=1, ensure_ascii=False)
print(len(out), "drafts;", collections.Counter(r["primary"] for r in out).most_common(), "| confidence:", collections.Counter(r["confidence"] for r in out))
