import re, os, io, json, urllib.request, urllib.parse, html
from PIL import Image, ImageDraw, ImageFont
import pillow_avif  # noqa
UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36','Accept-Language':'en'}
def get(u,t=40):
    return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=t).read()
rows=[l.split('\t') for l in open('.contact/pages.tsv').read().splitlines() if l.strip() and not l.startswith('#')]
for d in ['sheets','text','links','media']: os.makedirs(f'.contact/{d}',exist_ok=True)
font=ImageFont.load_default(size=26)
for slug,url in rows:
    try: raw=get(url).decode('utf-8','ignore')
    except Exception as e: open(f'.contact/text/{slug}.txt','w').write(f'FETCH FAILED {e}'); continue
    base=url
    # text
    body=re.sub(r'(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>',' ',raw)
    txt=html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>','\n',body)))
    open(f'.contact/text/{slug}.txt','w').write(txt[:60000])
    links=sorted(set(urllib.parse.urljoin(base,h) for h in re.findall(r'href=["\']([^"\'#]+)',raw)))
    links=[l for l in links if not re.search(r'(?i)access_token|api[_-]?key|mapbox|token=',l)]
    open(f'.contact/links/{slug}.txt','w').write('\n'.join(links))
    cands=[]
    for m in re.findall(r'(?:src|data-src|data-lazy-src|data-bg|poster|content|href)=["\']([^"\']+)',raw): cands.append(m)
    for m in re.findall(r'srcset=["\']([^"\']+)',raw): cands+= [p.strip().split(' ')[0] for p in m.split(',')]
    for m in re.findall(r'url\(([^)]+)\)',raw): cands.append(m.strip('\'" '))
    for m in re.findall(r'https?:\\?/\\?/[^"\'\s<>]+?\.(?:jpe?g|png|webp|avif|mp4|m3u8|webm)(?:\?[^"\'\s<>]*)?',raw): cands.append(m.replace('\\/','/'))
    vids=[];imgs=[]
    for c in cands:
        c=html.unescape(c).replace('\\/','/')
        if '/_next/image' in c and 'url=' in c:
            c=urllib.parse.unquote(urllib.parse.parse_qs(urllib.parse.urlparse(c).query).get('url',[''])[0])
        u=urllib.parse.urljoin(base,c)
        low=u.lower().split('?')[0]
        if re.search(r'\.(mp4|webm|m3u8)$',low) or 'youtube.com/embed' in u or 'player.vimeo' in u: vids.append(u); continue
        if re.search(r'\.(jpe?g|png|webp|avif)$',low) or re.search(r'(fm=|format=)(webp|jpg|jpeg)',u) or 'cdn.sanity' in u:
            if re.search(r'logo|icon|favicon|sprite|badge|award|tripadvisor|flag',low): continue
            imgs.append(u)
    def key(u): return re.sub(r'[?#].*','',u)
    seen=set(); uimgs=[]
    for u in imgs:
        k=key(u)
        if k in seen: continue
        seen.add(k); uimgs.append(u)
    open(f'.contact/media/{slug}.json','w').write(json.dumps({'videos':sorted(set(vids)),'images':uimgs},indent=1))
    thumbs=[];idx=[]
    for u in uimgs[:60]:
        try:
            data=get(u,30); im=Image.open(io.BytesIO(data)); w,h=im.size
            if w<500 and h<500: continue
            im=im.convert('RGB'); im.thumbnail((360,240)); thumbs.append((len(idx),im)); idx.append(f'{len(idx)}\t{w}x{h}\t{u}')
        except Exception as e: pass
    open(f'.contact/sheets/{slug}.idx','w').write('\n'.join(idx)+'\n')
    if not thumbs: continue
    cols=4; rws=(len(thumbs)+cols-1)//cols
    sheet=Image.new('RGB',(cols*368,rws*248),'white'); d=ImageDraw.Draw(sheet)
    for n,(i,im) in enumerate(thumbs):
        x=(n%cols)*368+4; y=(n//cols)*248+4; sheet.paste(im,(x,y))
        d.rectangle([x,y,x+40,y+32],fill='black'); d.text((x+4,y+2),str(i),fill='white',font=font)
    sheet.save(f'.contact/sheets/{slug}.jpg',quality=80)
