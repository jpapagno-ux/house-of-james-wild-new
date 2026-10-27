"""SEO regression guard for Booking Live (spec §15 Phase 0 acceptance, §16 case 23).

After `npm run build`, snapshot every prerendered page's title, canonical,
robots, JSON-LD count and H1 count, then compare with the committed baseline.

  python3 scripts/seo-snapshot.py --write   # refresh tests/seo-baseline.json (only when a change is intended)
  python3 scripts/seo-snapshot.py           # compare; exits 1 on any difference
"""
import json, os, re, sys

ROOT = ".next/server/app"
BASELINE = "tests/seo-baseline.json"


def snapshot():
    out = {}
    for dp, _, fs in os.walk(ROOT):
        for f in fs:
            if not f.endswith(".html"):
                continue
            h = open(os.path.join(dp, f), encoding="utf-8", errors="ignore").read()
            route = "/" + os.path.relpath(os.path.join(dp, f), ROOT)[:-5]
            route = route.replace("/index", "") or "/"
            if route.startswith("/account") or route in ("/_not-found", "/404", "/500"):
                continue  # private or error pages are not part of the public SEO surface
            g = lambda r: (re.search(r, h) or [None, None])[1]
            out[route] = {
                "title": g(r"<title>(.*?)</title>"),
                "canonical": g(r'<link rel="canonical" href="([^"]+)"'),
                "robots": g(r'<meta name="robots" content="([^"]+)"'),
                "jsonld": len(re.findall(r"application/ld\+json", h)),
                "h1": len(re.findall(r"<h1", h)),
            }
    return out


def main():
    now = snapshot()
    if "--write" in sys.argv:
        json.dump(now, open(BASELINE, "w"), indent=1, sort_keys=True)
        print(f"wrote {len(now)} pages to {BASELINE}")
        return
    base = json.load(open(BASELINE))
    problems = [f"missing page {r}" for r in base if r not in now]
    problems += [f"{r}: {k} {base[r][k]!r} -> {now[r][k]!r}" for r in base if r in now for k in base[r] if base[r][k] != now[r][k]]
    added = sorted(set(now) - set(base))
    print(f"{len(base)} baseline pages, {len(now)} now, {len(added)} new: {added[:10]}")
    if problems:
        print("SEO REGRESSIONS:\n  " + "\n  ".join(problems[:50]))
        sys.exit(1)
    print("SEO surface unchanged")


main()
