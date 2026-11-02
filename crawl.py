import re, urllib.request, urllib.parse, os, json, html
os.makedirs("out/crawl", exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
def get(u):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40)
        return r.read().decode("utf-8", "replace")
    except Exception as e:
        print("ERR", u, e); return ""
def text(h):
    h = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", h)
    h = re.sub(r"(?i)<br\s*/?>|</(p|div|h\d|li|tr)>", "\n", h)
    t = html.unescape(re.sub(r"<[^>]+>", " ", h))
    return re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n+", "\n", t)).strip()
for site, start, maxn in [("https://www.silolona.com", ["/", "/vessels", "/vessels/si-datu-bua", "/vessels/silolona", "/about/our-people", "/partnership", "/life-on-board", "/destination"], 90),
                          ("https://www.rascalvoyages.com", ["/", "/our-fleet", "/our-fleet-individual-boat-rascal", "/our-fleet-individual-boat-rebel", "/our-fleet-individual-boat-el-aleph", "/cabin-voyages", "/voyages/komodo", "/voyages/raja-ampat", "/voyages/spice-islands-crossing", "/the-rascal-way", "/conservation-and-sustainability", "/stories"], 70)]:
    host = urllib.parse.urlparse(site).netloc
    tag = host.split(".")[1]
    q, seen, imgs, n = [site + s for s in start], set(), {}, 0
    while q and n < maxn:
        u = q.pop(0).split("#")[0].split("?")[0]
        if u in seen: continue
        seen.add(u); h = get(u); n += 1
        if not h: continue
        slug = re.sub(r"[^a-z0-9]+", "-", urllib.parse.urlparse(u).path.lower()).strip("-") or "home"
        open(f"out/crawl/{tag}-{slug}.txt", "w").write(u + "\n\n" + text(h))
        found = set(re.findall(r"""(?:src|data-src|href|content|data-bg|srcset|url\()\s*=?\s*["']?\(?([^"'\s)>]+\.(?:jpe?g|png|webp|avif|pdf)(?:\?[^"'\s)>]*)?)""", h, re.I))
        found |= set(re.findall(r"""https?://[^"'\s)>]+\.(?:jpe?g|webp|avif)""", h, re.I))
        for f in found:
            f = urllib.parse.urljoin(u, html.unescape(f))
            imgs.setdefault(f, []).append(u)
        for l in re.findall(r"""href=["']([^"'#]+)""", h):
            l = urllib.parse.urljoin(u, html.unescape(l)).split("?")[0]
            if urllib.parse.urlparse(l).netloc == host and not re.search(r"\.(pdf|jpe?g|png|webp|svg|css|js|xml)$", l, re.I) and l not in seen:
                q.append(l)
    json.dump(imgs, open(f"out/crawl/{tag}-images.json", "w"), indent=1)
    print(tag, n, len(imgs))
