#!/usr/bin/env python3
"""Apply a batch of Exceptional Few designations (scripts/data/ef-*.json) to the site files:
exceptional-few.json records, media-assets.json roles, and the palette lines in globals.css.
usage: ef-apply.py scripts/data/ef-005-011.json DATE
"""
import json, sys, re

batch = json.load(open(sys.argv[1])); today = sys.argv[2]
SIZES = json.load(open("scripts/data/ef-sizes.json"))
PAL = {  # sand, earth, landscape, shadow, accent, night surface
  "amanpuri":        ("#D9C2A0", "#7A5A3A", "#F5F0E8", "#3B2F25", "#EADBC4", "#1F1A15"),
  "rosewood-phuket": ("#A9C9B0", "#2E6B4F", "#EEF4EF", "#263F33", "#D6E7DA", "#10241B"),
  "golden-triangle": ("#D8B46A", "#8A5A1F", "#F7F1E4", "#3F2E17", "#EEDDB3", "#1E1810"),
  "amanpulo":        ("#A6D8DA", "#1E6E78", "#EEF7F7", "#20434A", "#D5EDEE", "#0D2428"),
  "banwa":           ("#8FD0C8", "#156B66", "#ECF6F4", "#1E3F3C", "#CDEBE6", "#0C2422"),
  "amanwana":        ("#9DB98A", "#3E6233", "#F0F4EC", "#2B3A26", "#D9E6CF", "#121C10"),
  "elang":           ("#E2B48E", "#9A5232", "#F7EFE8", "#3D2A20", "#F1DCCB", "#1E1712"),
  "hadiprana":       ("#B9C78F", "#5B6B2E", "#F3F4EA", "#2F3520", "#E1E8C8", "#161A0E"),
  "soori":           ("#C9C1B6", "#4A4540", "#F4F2EE", "#262321", "#E6E1D9", "#141312"),
}
NOTE = {
  "amanpuri": "Phuket's west coast: night is the Andaman after dark, accents the teak and sand of Aman's first resort; day is pale sand.",
  "rosewood-phuket": "Emerald Bay: the green hillside and the bay it is named for.",
  "golden-triangle": "The Golden Triangle: bamboo jungle by night, accents of gold and river earth.",
  "amanpulo": "Pamalican: the turquoise sandbar and white beach.",
  "banwa": "Palawan's marine sanctuary: reef water and white sand.",
  "amanwana": "Moyo Island: national park forest and the Flores Sea.",
  "elang": "The Anambas: granite and warm teak at dusk over the lagoons.",
  "hadiprana": "Ubud: rice paddy green and old teak.",
  "soori": "Tabanan: black volcanic sand, stone and sea mist.",
}
def rgb(h): h = h.lstrip("#"); return " ".join(str(int(h[i:i+2], 16)) for i in (0, 2, 4))
def mix(a, b, t):
    a = [int(a.lstrip("#")[i:i+2], 16) for i in (0, 2, 4)]; b = [int(b.lstrip("#")[i:i+2], 16) for i in (0, 2, 4)]
    return "#" + "".join(f"{round(x + (y - x) * t):02X}" for x, y in zip(a, b))

ef = json.load(open("lib/content/exceptional-few.json"))
media = json.load(open("lib/content/media-assets.json"))
css = open("app/globals.css").read()
have = {r["id"] for r in ef["records"]}
light, dark = [], []
for r in batch:
    rid = f"EF-{r['n']:03d}"
    rec = {"id": rid, "stayId": r["stayId"], "staySlug": r["staySlug"], "stayName": r["stayName"], "collectionNumber": r["n"],
           "heroLine": r["heroLine"], "whyItMadeTheCut": r["why"], "signals": [{"key": k, "line": l} for k, l in r["signals"]],
           "pathwaysOverride": r["pathways"], "worthAnotherNight": r["worth"], "whoItSuits": r["suits"], "whoItMayNotSuit": r["notSuit"],
           "continueRefs": r["continue"], "paletteKey": r["palette"], "designationStatus": "designated", "selectionDate": today,
           "publicationStatus": "published", "reviewDate": today, "reviewStatus": "approved", "jamesNote": None}
    ef["records"] = [x for x in ef["records"] if x["id"] != rid] + [rec]
    media["assets"] = [a for a in media["assets"] if a.get("entityId") != r["stayId"]]
    counts = {}
    for role, pid, alt in r["media"]:
        counts[role] = counts.get(role, 0) + 1
        w, h = SIZES[pid]
        media["assets"].append({"rights": "approved", "licence": "owner", "crop": "g_auto", "active": True, "focalPoint": None,
            "entityType": "stay", "mediaId": f"{r['stayId']}-{role}-{counts[role]}", "entityId": r["stayId"], "publicId": f"jwco/stays/{pid}",
            "role": role, "caption": r["stayName"] if role == "hero" else alt.split(",")[0], "alt": alt, "credit": r["credit"],
            "orientation": "landscape" if w >= h else "portrait", "sort": counts[role], "width": w, "height": h})
    k = r["palette"]
    if f".theme-ef-{k} " in css: continue
    sand, earth, land, shadow, acc, night = PAL[k]
    deep = mix(earth, "#000000", 0.18); nland = mix(night, sand, 0.08); nearth = mix(sand, "#000000", 0.12)
    light.append(f"/* The Exceptional Few: {r['stayName']} palette ({today}). {NOTE[k]} */\n"
                 f".theme-ef-{k} {{ --ef-sand: {sand}; --ef-earth: {earth}; --ef-landscape: {land}; --ef-shadow: {shadow}; --ef-accent: {acc}; }}")
    dark.append(f".theme-ef-dark.theme-ef-{k} {{ --ef-surface: {night}; --ef-ink: #F3EFE9; --ef-muted: rgba(243,239,233,0.74); --ef-line: rgba(243,239,233,0.2); --ef-sand: {sand}; --ef-earth: {sand}; --ef-landscape: {nland}; --ef-shadow: rgba(243,239,233,0.6); --ef-accent: {sand}; --jw-accent: {rgb(sand)}; --jw-accent-deep: {rgb(nearth)}; --jw-accent-light: {rgb(acc)}; --jw-accent-hex: {sand}; --jw-accent-deep-hex: {nearth}; --jw-card: {nland}; }}\n"
                f".theme-ef-dark.theme-ef-{k} .ef-day {{ --ef-surface: {land}; --ef-ink: {mix(shadow, '#000000', 0.25)}; --ef-muted: rgba({','.join(rgb(shadow).split())},0.7); --ef-line: rgba({','.join(rgb(shadow).split())},0.2); --ef-landscape: #FFFFFF; --ef-shadow: {shadow}; --ef-earth: {earth}; --ef-sand: {earth}; --jw-card: #FFFFFF; --jw-accent: {rgb(earth)}; --jw-accent-deep: {rgb(deep)}; --jw-accent-hex: {earth}; --jw-accent-deep-hex: {deep}; }}")
ef["records"].sort(key=lambda x: x["collectionNumber"])
if light:
    a = css.index(".ef-module {"); css = css[:a] + "\n".join(light) + "\n" + css[a:]
    b = css.index("/* The ship section nav sits on the night surface"); css = css[:b] + "\n".join(dark) + "\n" + css[b:]
json.dump(ef, open("lib/content/exceptional-few.json", "w"), indent=1, ensure_ascii=False)
json.dump(media, open("lib/content/media-assets.json", "w"), indent=1, ensure_ascii=False)
open("app/globals.css", "w").write(css)
print("records", len(ef["records"]), "assets", len(media["assets"]))
