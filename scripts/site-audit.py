#!/usr/bin/env python3
"""House-wide static audit of the built site (.next/server/app): titles, descriptions, canonicals,
robots, H1, JSON-LD, og:image, alts, internal links, page weight. Run after a production-flag build.
usage: python3 scripts/site-audit.py   (writes .next/site-audit.json; prints the summary)"""
import os,re,json,collections,html
ROOT=".next/server/app"; pages={}
for dp,_,fs in os.walk(ROOT):
    for f in fs:
        if not f.endswith(".html"): continue
        p=os.path.join(dp,f); route="/"+os.path.relpath(p,ROOT)[:-5]; route=route.replace("/index","") or "/"
        if route in ("/_not-found","/404","/500"): continue
        h=open(p,encoding="utf-8",errors="ignore").read()
        g=lambda r:(re.search(r,h) or [None,None])[1]
        lds=re.findall(r'<script type="application/ld\+json">(.*?)</script>',h,re.S)
        bad=0
        for x in lds:
            try: json.loads(x)
            except Exception: bad+=1
        pages[route]=dict(size=len(h),title=html.unescape(g(r"<title>(.*?)</title>") or ""),desc=html.unescape(g(r'<meta name="description" content="([^"]*)"') or ""),canon=g(r'<link rel="canonical" href="([^"]+)"'),robots=g(r'<meta name="robots" content="([^"]+)"'),h1=len(re.findall(r"<h1[\s>]",h)),ld=len(lds),ldbad=bad,og=bool(g(r'<meta property="og:image" content="([^"]+)"')),links=sorted(set(re.findall(r'href="(/[^"#?]*)',h))),imgs=len(re.findall(r"<img",h)),noalt=len(re.findall(r'<img(?![^>]*alt=)[^>]*>',h)))
json.dump(pages,open(".next/site-audit.json","w"))
idx={r:v for r,v in pages.items() if v["robots"]=="index, follow"}
print("pages",len(pages),"indexable",len(idx))
print("title >60:",sum(1 for v in idx.values() if len(v['title'])>60),"| title >70:",sum(1 for v in idx.values() if len(v['title'])>70))
print("desc missing:",[r for r,v in idx.items() if not v['desc']][:10])
print("desc <100:",sum(1 for v in idx.values() if 0<len(v['desc'])<100),"desc >165:",sum(1 for v in idx.values() if len(v['desc'])>165))
dup=collections.Counter(v['title'] for v in idx.values()); print("dup titles:",[(t,c) for t,c in dup.items() if c>1][:8])
dupd=collections.Counter(v['desc'] for v in idx.values()); print("dup descs:",[(t[:60],c) for t,c in dupd.items() if c>1][:6])
print("no canonical:",[r for r,v in idx.items() if not v['canon']][:8])
print("h1!=1:",[(r,v['h1']) for r,v in idx.items() if v['h1']!=1][:12])
print("ld bad:",[r for r,v in pages.items() if v['ldbad']][:8], "| ld 0:",[r for r,v in idx.items() if v['ld']==0][:8])
print("no og:image:",[r for r,v in idx.items() if not v['og']][:8])
print("img no alt:",[(r,v['noalt']) for r,v in idx.items() if v['noalt']][:10])
big=sorted(idx.items(),key=lambda kv:-kv[1]['size'])[:8]; print("largest KB:",[(r,round(v['size']/1024)) for r,v in big])
allhref=collections.Counter()
for r,v in pages.items():
    for l in v['links']: allhref[l.rstrip("/") or "/"]+=1
skip=("/api/","/_next","/img","/brand","/fonts","/sitemap","/robots","/llms","/compass/ledger.json","/favicon","/sketches","/maps")
missing={l:c for l,c in allhref.items() if l not in pages and not l.startswith(skip)}
print("internal links to no built page:",len(missing)); print(sorted(missing.items(),key=lambda kv:-kv[1])[:30])
