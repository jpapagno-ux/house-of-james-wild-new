"""UnCruise Adventures in Alaska (James, 19 Nov 2026: "begin on voyages in Alaska using UnCruise ... their full schedule and a
full suite about their boats and animated maps"; UnCruise is a contracted partner, photographs credited to them).

Builds lib/content/ships/alaska/<slug>.json for the seven boats that sail Alaska, from:
  scripts/data/uncruise/ships.json   facts per boat (uncruise.com/blogs/our-ships, read 19 Nov 2026)
  scripts/data/uncruise/rates-*.txt  every 2027 and 2028 Alaska sailing and fare, per person, by cabin, as UnCruise
                                     publishes them on its itinerary pages (read 19 Nov 2026)
Day by days are short house summaries of UnCruise's own day pages; positions are approximate, for the route chart.
Run from the repo root, then the route charts:
    python3 scripts/partners/uncruise-build.py . && python3 scripts/build-ship-maps.py .
"""
import json, os, re, sys, datetime as dt

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
DATA = os.path.join(ROOT, "scripts/data/uncruise")
OUT = os.path.join(ROOT, "lib/content/ships/alaska")
CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/jwco"
CREDIT = "UnCruise Adventures"

# ---------- places (approximate water positions for the chart) ----------
P = {
  "juneau": ("Juneau", 58.30, -134.42), "tracy": ("Tracy Arm (or another tidewater glacier)", 57.85, -133.45),
  "frederick": ("Frederick Sound", 57.12, -133.75), "chichagof": ("Chichagof Island", 57.93, -135.15),
  "gb": ("Glacier Bay National Park", 58.62, -136.05), "gbup": ("Upper Glacier Bay", 58.93, -136.80),
  "gbouter": ("Glacier Bay, the outer bay", 58.45, -136.05), "icy": ("Icy Strait", 58.24, -135.65),
  "endicott": ("Endicott Arm and Dawes Glacier", 57.58, -133.25), "thomas": ("Thomas Bay", 57.04, -132.98),
  "wrangell": ("Wrangell Narrows", 56.72, -132.95), "blashke": ("Blashke Islands", 56.15, -132.92),
  "behm": ("Behm Canal", 55.92, -131.62), "misty": ("Misty Fjords National Monument", 55.55, -130.88),
  "ketchikan": ("Ketchikan", 55.34, -131.65), "robert": ("Robert and Crow", 57.30, -133.62),
  "leconte": ("LeConte Bay", 56.80, -132.55), "kuiu": ("Kuiu Island", 56.62, -134.22),
  "baranof": ("Baranof Island and Peril Strait", 57.45, -135.40), "krestof": ("Krestof and Nakwasina Sounds", 57.17, -135.52),
  "sitka": ("Sitka", 57.05, -135.34), "seattle": ("Seattle", 47.66, -122.40), "sucia": ("Sucia Island", 48.76, -122.90),
  "georgia": ("Strait of Georgia", 49.60, -124.40), "qcs": ("Queen Charlotte Sound", 51.00, -127.70),
  "gbr": ("Great Bear Rainforest", 52.80, -128.70), "olympic": ("Port Angeles, for Olympic National Park", 48.13, -123.43),
  "basket": ("Chichagof Island: Iyoukeen Cove and Basket Bay", 57.66, -134.93), "whitewater": ("Admiralty Island: Whitewater Bay", 57.22, -134.60),
  "warm": ("Warm Springs Bay", 57.09, -134.83), "fredadm": ("Frederick Sound, Admiralty Island National Monument", 57.15, -134.05),
  "fairbanks": ("Fairbanks", 64.84, -147.72), "denali": ("Denali National Park", 63.73, -148.90),
  "talkeetna": ("Talkeetna", 62.32, -150.11), "anchorage": ("Anchorage", 61.22, -149.90),
  "seward": ("Seward", 60.10, -149.44), "icybaypws": ("Icy Bay, Prince William Sound", 60.27, -148.20),
  "knight": ("Knight Island", 60.35, -147.70), "cordova": ("Cordova", 60.54, -145.76),
  "columbia": ("Columbia Glacier", 60.98, -147.05), "unakwik": ("Unakwik Inlet and Meares Glacier", 61.05, -147.55),
  "barry": ("Barry Arm and Esther Island", 60.85, -148.05), "kenai": ("Kenai Fjords National Park", 59.75, -149.65),
  "kodiak": ("Kodiak Island", 57.79, -152.40), "katmai": ("Katmai National Park", 58.10, -154.55),
  "ugashik": ("Alaska Peninsula National Wildlife Refuge", 57.05, -156.55), "aniakchak": ("Aniakchak National Monument and Preserve", 56.80, -157.95),
  "unga": ("Unga Island", 55.25, -160.70), "capt_al": ("Captain's choice, the Alaska Peninsula", 54.80, -163.30),
  "akutan": ("Akutan Island", 54.13, -165.77), "dutch": ("Dutch Harbor, Unalaska", 53.89, -166.54),
  "driftwood": ("Driftwood Bay State Marine Park", 60.20, -147.85), "montague": ("Montague or Hinchinbrook Island", 60.25, -146.90),
  "kayakisl": ("Kayak Island", 59.90, -144.40), "icybay": ("Icy Bay, Wrangell-St. Elias", 59.95, -141.40),
  "disench": ("Disenchantment Bay and Hubbard Glacier", 60.00, -139.55), "yakutat": ("Yakutat", 59.55, -139.73),
  "lituya": ("Lituya Bay", 58.64, -137.60), "george": ("George Island", 58.20, -136.38),
}

def day(n, key, title, summary, mode=None, label=None):
    name, lat, lng = P[key]
    d = {"day": n, "title": title, "place": name, "lat": lat, "lng": lng, "summary": summary}
    if mode: d["mode"] = mode
    if label: d["label"] = label
    return d

EMB_J = "Fly into Juneau by 4 pm; UnCruise meets you and you board in the evening."
DIS_J = "Breakfast aboard, then the transfer to Juneau airport for flights from 11.30 am."
CHICH = "A day on Chichagof's shore for coastal brown bears, from skiffs, kayaks and the beach."
GB1 = "Deep into the park by kayak, skiff and on foot: moraines, glacial ridges, puffins, sea lions and mountain goats."
GB2 = "A second day in the park, among the tidewater glaciers of the upper bay."
ICY = "Kayaking, all-day paddles, shore walks and bushwhacks where the humpbacks feed."

ITINS = {
 "gba": ("Glacier Bay Adventure, 7 nights", 7, "Juneau round trip", "Two days in Glacier Bay, Frederick Sound and Chichagof", [
   day(1, "juneau", "Embark in Juneau", EMB_J),
   day(2, "tracy", "Tracy Arm, or another tidewater glacier", "A fjord of floating ice and sheer walls; after landslides in Tracy Arm, the expedition team picks the safest tidewater glacier."),
   day(3, "frederick", "Frederick Sound", "Humpback country: paddle, watch the spouts and walk the shoreline."),
   day(4, "chichagof", "Chichagof Island", CHICH),
   day(5, "gb", "Glacier Bay National Park", GB1),
   day(6, "gbup", "Glacier Bay National Park", "Margerie and Lamplugh glaciers, Bartlett Cove and the birds of South Marble Island."),
   day(7, "icy", "Icy Strait or Neka Bay", ICY),
   day(8, "juneau", "Disembark in Juneau", DIS_J)]),
 "fj": ("Alaska's Fjords and Glaciers, 7 nights", 7, "Juneau to Ketchikan", "Dawes Glacier, Frederick Sound and Misty Fjords", [
   day(1, "juneau", "Embark in Juneau", EMB_J),
   day(2, "endicott", "Endicott Arm and Dawes Glacier", "Granite walls, drifting icebergs and harbor seals hauled out on the ice."),
   day(3, "frederick", "Frederick Sound", "A day among feeding humpbacks."),
   day(4, "thomas", "Thomas Bay and Wrangell Narrows", "Moraines and muskeg in Thomas Bay, then the narrow channel locals call Christmas Tree Lane."),
   day(5, "blashke", "Blashke Islands", "Hike, kayak, snorkel or skiff among remote, forested islands."),
   day(6, "behm", "Behm Canal", "Streams, moss and old forest on low trails, and the wildlife that lives along them."),
   day(7, "misty", "Misty Fjords National Monument", "Cliffs of 3,000 feet in Walker Cove or Rudyerd Bay, by kayak and skiff."),
   day(8, "ketchikan", "Disembark in Ketchikan", "Breakfast aboard, then the transfer to Ketchikan airport for flights from 11.30 am.")]),
 "www": ("Wild, Woolly and Wow with Glacier Bay, 7 nights", 7, "Juneau round trip", "LeConte Glacier, Kuiu Island, Chichagof and Glacier Bay", [
   day(1, "juneau", "Embark in Juneau", EMB_J),
   day(2, "robert", "Robert and Crow", "Bushwhacks, forest walks and kayaking among old growth, with the Five Finger lighthouse in view."),
   day(3, "leconte", "LeConte Glacier", "The southernmost tidewater glacier in the Northern Hemisphere, up a channel the big ships cannot enter."),
   day(4, "thomas", "Thomas Bay", "Cascade Creek's falls and the trails of the land the Tlingit call home of the Kushtaka."),
   day(5, "kuiu", "Kuiu Island and whale watching", "Black bear country, sea otters in the bays and humpbacks offshore."),
   day(6, "chichagof", "Chichagof Island", CHICH),
   day(7, "gbouter", "Glacier Bay, the outer bay", "Parts of the park very few visitors ever reach."),
   day(8, "juneau", "Disembark in Juneau", DIS_J)]),
 "np": ("Northern Passages with Glacier Bay and Sitka, 7 nights", 7, "Juneau to Sitka", "Glacier Bay, Chichagof, Peril Strait and Sitka Sound", [
   day(1, "juneau", "Embark in Juneau", EMB_J),
   day(2, "icy", "Captain's choice, the Tongass", "The captain and expedition leader choose the day's cove by season and wildlife."),
   day(3, "gb", "Glacier Bay National Park", GB1),
   day(4, "icy", "Icy Strait", ICY),
   day(5, "chichagof", "Chichagof Island", CHICH),
   day(6, "baranof", "Baranof Island and Peril Strait", "Glacial fjords, salmon streams and a strait known for its currents and marine mammals."),
   day(7, "krestof", "Krestof and Nakwasina Sounds", "Snorkelling, tide pools and seabird cliffs among uninhabited islands; the Captain's Dinner."),
   day(8, "sitka", "Disembark in Sitka", "Breakfast aboard, then the transfer to Sitka airport for flights from 11.30 am.")]),
 "sj": ("Glacier Bay and the Inside Passage with the San Juan Islands, 12 nights", 12, "Seattle to Juneau", "Sucia Island, Canada's Inside Passage, Misty Fjords and Glacier Bay", None),
 "ol": ("Glacier Bay and the Inside Passage with Olympic National Park, 12 nights", 12, "Seattle to Juneau via Olympic", "Olympic National Park, Canada's Inside Passage, Misty Fjords and Glacier Bay", None),
 "gw": ("Alaska's Glacier Wilderness, 7 nights", 7, "Juneau round trip", "Glacier Bay's outer bay, Admiralty Island and Dawes Glacier", [
   day(1, "juneau", "Embark in Juneau", "Fly into Juneau by 3 pm and board the Safari Quest."),
   day(2, "gbouter", "Icy Strait and Glacier Bay's outer bay", "Whales in Icy Strait, then the quiet outer reaches of the park."),
   day(3, "basket", "Iyoukeen Cove and Basket Bay", "Deep into Chichagof's wilderness by skiff and kayak."),
   day(4, "whitewater", "Whitewater Bay or Takatz Bay", "Admiralty Island, Kootznoowoo to the Tlingit, the fortress of the bears."),
   day(5, "warm", "Warm Springs Bay", "Hot springs few visitors reach, and the Red Bluff wilderness."),
   day(6, "fredadm", "Frederick Sound", "Humpback, killer, minke and fin whales off Admiralty Island."),
   day(7, "endicott", "Dawes Glacier", "Skiffs up Endicott Arm among harbor seals on the ice."),
   day(8, "juneau", "Disembark in Juneau", DIS_J)]),
 "nps": ("Alaska's National Parks by Land and Sea, 15 nights", 15, "Fairbanks to Juneau", "Fairbanks, Denali and Talkeetna by land, then Glacier Bay by sea", [
   day(1, "fairbanks", "Fairbanks", "Arrive in Fairbanks; hotel night."),
   day(2, "fairbanks", "Reindeer and gold", "A reindeer farm and gold panning in Fairbanks."),
   day(3, "denali", "Fairbanks to Denali", "By coach south to Denali National Park.", mode="road"),
   day(4, "denali", "Denali National Park", "Into the park on the Tundra Wilderness Tour."),
   day(5, "talkeetna", "Denali to Talkeetna by rail", "A dome railcar south to Talkeetna.", mode="road"),
   day(6, "talkeetna", "Talkeetna", "A hike on the Curry Ridge Trail, then kayaking."),
   day(7, "anchorage", "Talkeetna to Anchorage", "A guided hike in the Talkeetna Lakes, then on to Anchorage.", mode="road"),
   day(8, "juneau", "Anchorage to Juneau", "Fly to Juneau (the flight is not included); a night in Juneau.", mode="air"),
   day(9, "juneau", "Embark in Juneau", "A day in Juneau, then aboard."),
   day(10, "tracy", "Tracy Arm, or another tidewater glacier", "The expedition team picks the safest tidewater glacier."),
   day(11, "frederick", "Frederick Sound", "Humpback country."),
   day(12, "chichagof", "Chichagof Island", CHICH),
   day(13, "gb", "Glacier Bay National Park", GB1),
   day(14, "gbup", "Glacier Bay National Park", GB2),
   day(15, "icy", "Icy Strait or Neka Bay", ICY),
   day(16, "juneau", "Disembark in Juneau", DIS_J)]),
 "pws": ("Prince William Sound Explorer with Cordova, 7 nights", 7, "Seward round trip", "Columbia Glacier, Cordova, Knight Island and College Fjord", [
   day(1, "seward", "Embark in Seward", "Fly into Anchorage; the transfer to Seward is included."),
   day(2, "icybaypws", "Icy Bay glaciers", "Waking among the glacial waterways of Icy Bay."),
   day(3, "knight", "Knight Island", "One of the sound's largest islands, by kayak, skiff and trail."),
   day(4, "cordova", "Cordova", "A fishing town reached only by air or sea."),
   day(5, "columbia", "Columbia Glacier", "The widest and most powerful glacier of the week."),
   day(6, "unakwik", "Unakwik Inlet and Meares Glacier", "Two glacier-carved worlds in one day."),
   day(7, "barry", "Barry Arm and Esther Island", "Wildlife, culture and big scenery to close the week."),
   day(8, "seward", "Disembark in Seward", "The transfer to Anchorage airport is included.")]),
 "al": ("Aleutian Islands Adventure, 10 nights", 10, "Seward to Dutch Harbor", "Kenai Fjords, Kodiak, Katmai, Aniakchak and the Aleutians", [
   day(1, "seward", "Embark in Seward", "Fly into Anchorage; the transfer to Seward is included."),
   day(2, "kenai", "Kenai Fjords National Park", "A glacial wonderland, protected since 1980."),
   day(3, "kodiak", "Kodiak Island", "Volcanic shores and clear water, by kayak and on foot."),
   day(4, "katmai", "Katmai National Park", "A coast shaped by fire, and its brown bears."),
   day(5, "ugashik", "Alaska Peninsula National Wildlife Refuge", "Volcanic peaks and open tundra on the peninsula."),
   day(6, "aniakchak", "Aniakchak National Monument and Preserve", "One of the least visited places in the National Park System."),
   day(7, "unga", "Unga Island", "An abandoned village and the petrified stumps of an ancient forest."),
   day(8, "capt_al", "Captain's choice", "Chosen by tides, weather and the shifting channels."),
   day(9, "akutan", "Akutan Island", "Below Mount Akutan, one of Alaska's most active volcanoes."),
   day(10, "dutch", "Unalaska and Dutch Harbor", "The heart of the Aleutians and its working waterfront."),
   day(11, "dutch", "Disembark in Dutch Harbor", "The transfer to the airport is included.")]),
 "ct": ("Alaska's Coastal Treasures, 13 nights", 13, "Seward to Juneau", "Kayak Island, Icy Bay, Hubbard Glacier, Yakutat and Lituya Bay", [
   day(1, "seward", "Embark in Seward", "Fly into Anchorage by 1 pm; the transfer to Seward is included, and the ship sails at about 9 pm."),
   day(2, "driftwood", "Driftwood Bay State Marine Park", "Beach walks, muskeg meadows and a first paddle; whales and sea lions."),
   day(3, "montague", "Montague or Hinchinbrook Island", "Brown bears in Zaikof Bay, or the Cape Hinchinbrook lighthouse."),
   day(4, "kayakisl", "Kayak Island", "Where Bering's expedition met the Steller's sea cow in 1741.", label="Days 4 and 5"),
   day(6, "icybay", "Icy Bay", "Malaspina and Guyot glaciers below Mount St. Elias.", label="Days 6 and 7"),
   day(8, "disench", "Disenchantment Bay", "Hubbard Glacier, calving into the bay."),
   day(9, "yakutat", "Yakutat", "A fishing town between the wild coast and the rainforest."),
   day(10, "lituya", "Lituya Bay", "Cenotaph Island, kittiwakes, sea lions and the Fairweather Range, when the entrance allows.", label="Days 10 and 11"),
   day(12, "george", "George Island", "A cannon from the world wars, and Cape Spencer."),
   day(13, "icy", "Captain's choice", "Whales in the Inian Islands and Icy Strait."),
   day(14, "juneau", "Disembark in Juneau", DIS_J)]),
}
INSIDE = lambda second: [
   day(1, "seattle", "Embark in Seattle", "Fly into Seattle by 2 pm; you board in Ballard."),
   second,
   day(3, "georgia", "Canada's Inside Passage", "North through the Strait of Georgia, eagles over the treetops."),
   day(4, "qcs", "Canada's Inside Passage", "Coffee on the bow through Queen Charlotte Sound."),
   day(5, "gbr", "The Great Bear Rainforest", "Watching the shore for the white spirit bear."),
   day(6, "misty", "Misty Fjords National Monument", "Sheer cliffs and waterfalls by kayak and skiff."),
   day(7, "ketchikan", "Ketchikan", "Alaska's First City and its Tlingit culture."),
   day(8, "thomas", "Thomas Bay and Wrangell Narrows", "Moraines, muskeg and Christmas Tree Lane."),
   day(9, "chichagof", "Chichagof Island", CHICH),
   day(10, "icy", "Icy Strait", ICY),
   day(11, "gb", "Glacier Bay National Park", GB1),
   day(12, "gbup", "Glacier Bay National Park", GB2),
   day(13, "juneau", "Disembark in Juneau", "The transfer to Juneau airport is included.")]
ITINS["sj"] = ITINS["sj"][:4] + (INSIDE(day(2, "sucia", "Sucia Island", "A marine state park in the San Juans, reached only by boat.")),)
ITINS["ol"] = ITINS["ol"][:4] + (INSIDE(day(2, "olympic", "Olympic National Park", "Ashore to Lake Crescent, with a stop at Storm King Ranger Station.")),)

REVERSE = {"fj": "Ketchikan to Juneau", "np": "Sitka to Juneau", "sj": "Juneau to Seattle", "ol": "Juneau to Seattle via Olympic", "al": "Dutch Harbor to Seward", "ct": "Juneau to Seward"}

def reversed_days(days, nights):
    out, n = [], 1
    for d in reversed(days):
        e = dict(d); e["day"] = n; e["indicative"] = True; e.pop("label", None); out.append(e); n += 1
    out[0]["title"] = "Embark in " + out[0]["place"].split(",")[0]; out[-1]["title"] = "Disembark in " + out[-1]["place"].split(",")[0]
    return out

HANDLE = {"glacier-bay-adventure-cruise-with-2-days-in-glacier-bay": "gba", "alaskas-fjords-glaciers-with-ketchikan": "fj",
  "wild-woolly-and-wow-with-glacier-bay": "www", "northern-passages-with-glacier-bay": "np",
  "glacier-bay-national-park-with-inside-passage-and-san-juan-islands": "sj", "alaskas-glacier-wilderness-with-glacier-bay": "gw",
  "alaskas-national-parks-by-land-and-sea": "nps", "glacier-bay-national-park-with-inside-passage-and-olympic-national-park": "ol",
  "price-william-sound-explorer-with-cordova": "pws", "aleutian-islands-adventure-with-dutch-harbor-and-kodiak": "al", "alaskas-coastal-treasures": "ct"}
# What UnCruise's marks mean on each itinerary's tables.
MARKS = {"gba": {"**": "Adult Escape (18 and over)", "*": "Families in Nature"}, "www": {"**": "Adult Escape (18 and over)", "*": "Families in Nature"},
  "np": {"**": "Adult Escape (18 and over)", "‡": "REV"}, "fj": {"*": "REV", "»": "Photography cruise with Lisa Mize"},
  "sj": {"*": "REV"}, "ol": {"*": "REV"}, "al": {"*": "REV"}, "ct": {"*": "REV"}}
SPECIAL = {("www", "2027-08-14"): "Hosted with the National Forest Foundation"}

MON = {"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6, "jul": 7, "aug": 8, "sep": 9, "oct": 10}
def dates(spec, year):
    out, mon = [], None
    for tok in re.split(r"[;,]", spec):
        tok = tok.strip()
        if not tok: continue
        m = re.match(r"([A-Za-z]+)?\s*(\d+)\s*([*‡»]*)$", tok)
        if not m: raise SystemExit(f"bad date token {tok!r} in {spec!r}")
        if m.group(1): mon = MON[m.group(1)[:3].lower()]
        out.append((dt.date(year, mon, int(m.group(2))).isoformat(), m.group(3)))
    return out

def cols(spec):
    out = []
    for c in spec.split(","):
        name, kind = c.strip().rsplit(" ", 1)
        out += [(name, "D"), (name, "S")] if kind == "D/S" else [(name, "S")]
    return out

def num(t): return None if t == "-" else int(t)

SAIL = {}   # ship name -> list of departures
def add(ship, key, date, mark, row, cspec):
    it = ITINS[key]; meaning = MARKS.get(key, {})
    marks = re.findall(r"\*\*|\*|‡|»", mark or "")
    unknown = [mk for mk in marks if mk not in meaning]
    if unknown: raise SystemExit(f"{key} {date}: mark {unknown} has no meaning filed")
    notes, direction = [], it[2]
    for mk in marks:
        if meaning[mk] == "REV": direction = REVERSE[key]
        else: notes.append(meaning[mk])
    if (key, date) in SPECIAL: notes.append(SPECIAL[(key, date)])
    prices, singles = {}, {}
    for (cab, kind), v in zip(cspec, row):
        if v is None: continue
        (prices if kind == "D" else singles)[cab] = v
    end = (dt.date.fromisoformat(date) + dt.timedelta(days=it[1])).isoformat()
    SAIL.setdefault(ship, []).append({"date": date, "dateTo": end, "itinerary": it[0], "direction": direction, "status": None,
        "prices": prices, "singlePrices": singles, "note": "; ".join(notes) or None})

for f in sorted(os.listdir(DATA)):
    if not f.startswith("rates-"): continue
    key = cspec = ship = year = None
    for line in open(os.path.join(DATA, f), encoding="utf-8"):
        line = line.rstrip("\n")
        if not line.strip() or line.startswith("#") or line.startswith("NOTE"): continue
        if line.startswith("@itin"):
            key = HANDLE[line.split("|")[0].split()[1]]; continue
        if line.startswith("@land"): key = None; continue
        if key is None: continue
        if line.startswith("TABLE"):
            head, cs = line[6:].split("|"); ship, year = head.strip().rsplit(" ", 1); year = int(year); cspec = cols(cs); continue
        if line.startswith("MULTI"):
            cspec = cols(line.split("|", 1)[1]); ship = None; continue
        parts = [p.strip() for p in line.split("|")]
        if ship is None or len(parts) == 3:   # MULTI row: "2027 Ship | date | prices"
            y, s = parts[0].split(" ", 1); y = int(y); spec, vals = parts[1], parts[2]; sname = s
        else:
            y, sname, spec, vals = year, ship, parts[0], parts[1]
        row = [num(t) for t in vals.split()]
        if len(row) != len(cspec): raise SystemExit(f"{f}: {len(row)} prices for {len(cspec)} columns: {line}")
        for d, mk in dates(spec, y): add(sname, key, d, mk, row, cspec)

SHIPS = json.load(open(os.path.join(DATA, "ships.json")))["ships"]
TEXT = json.load(open(os.path.join(DATA, "ship-text.json")))
os.makedirs(OUT, exist_ok=True)
for s in SHIPS:
    deps = sorted(SAIL.get(s["name"], []), key=lambda d: d["date"])
    keys = [HANDLE[h] for h in s["alaska"]]
    its = []
    for k in keys:
        name, nights, direction, short, days = ITINS[k]
        if not any(d["itinerary"] == name for d in deps): continue
        its.append({"name": name, "nights": nights, "direction": direction, "short": short, "days": days})
        if k in REVERSE and any(d["itinerary"] == name and d["direction"] == REVERSE[k] for d in deps):
            its.append({"name": name, "nights": nights, "direction": REVERSE[k], "short": short + " (reverse)", "days": reversed_days(days, nights)})
    t = TEXT[s["slug"]]
    m = round(s["lengthFt"] * 0.3048)
    facts = [["Guests", str(s["guests"])], ["Cabins", f"{s['cabins']}, all outside"], ["Guest to crew", s["crewRatio"]],
             ["Length", f"{s['lengthFt']} ft ({m} m)"], ["Beam", f"{s['beamFt']} ft"], ["Built", str(s["built"])],
             ["Decks", str(s["decks"])], ["Speed", f"{s['mph']} mph"], ["Registry and crew", "USA"]]
    if s.get("balcony"): facts.insert(2, ["Balcony cabins", str(s["balcony"])])
    img = lambda pid, alt: {"url": f"{CLD}/{pid}", "alt": alt, "credit": CREDIT}
    rec = {
      "slug": s["slug"], "name": s["name"], "brandLine": "UnCruise Adventures", "operator": "UnCruise Adventures",
      "type": "expedition yacht" if s["guests"] <= 36 else "small expedition ship", "waters": "Alaska", "country": "United States",
      "status": "sailing", "seo": t["seo"], "tagline": t["tagline"], "answer": t["answer"], "facts": facts,
      "overview": t["overview"], "why": t["why"], "hero": img(*t["hero"]), "gallery": [img(*g) for g in t["gallery"]],
      "cabins": [{"type": c[0], "count": None, "size": None, "beds": c[1], "deck": c[2], "features": c[3], "image": None} for c in t["cabins"]],
      "deckPlans": [], "itineraries": its, "departures": deps, "datesPublished": True,
      "pricesNote": "Fares per person in USD as UnCruise publishes them for 2027 and 2028, by cabin, sharing; single fares where UnCruise publishes them (Compass cabins are singles). Port fees and taxes included; gratuities not. Whole-ship charters on request.",
      "fareBasis": "Per person, sharing, by cabin; single fares as published",
      "inclusions": ["All meals, with vegetarian, vegan, gluten-free and dairy-free options", "All drinks, alcoholic and not", "Port fees and taxes",
                     "Kayaks, paddleboards, skiffs and hiking poles, with naturalist guides", "Airport transfers on embarkation and disembarkation days, as UnCruise publishes them"],
      "exclusions": ["Gratuities", "Flights to and from Alaska", "Pre and post cruise hotels (we arrange them)", "Wi-Fi inside national parks and protected areas (none is available there)"],
      "children": t["children"], "faqs": t["faqs"], "suits": t["suits"],
      "sources": [f"https://uncruise.com/blogs/our-ships/{s['slug']}"] + [f"https://uncruise.com/products/{h}" for h in s["alaska"]],
      "film": None, "proofLine": "UnCruise Adventures partner", "pathway": t["pathway"],
      "terms": ["UnCruise's own terms apply; we confirm deposit, payment and cancellation terms with your quote."],
    }
    json.dump(rec, open(os.path.join(OUT, f"{s['slug']}.json"), "w"), indent=1, ensure_ascii=False)
    print(s["slug"], len(its), "routes,", len(deps), "sailings")
