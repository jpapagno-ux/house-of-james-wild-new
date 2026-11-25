import sys, os, io, subprocess, urllib.request
from PIL import Image, ImageDraw, ImageFont
import pillow_avif  # noqa
rows=[l.split('\t') for l in open('.contact/list2.tsv').read().splitlines() if l.strip()]
os.makedirs('.contact/sheets', exist_ok=True)
by={}
for slug,key,url in rows: by.setdefault(slug,[]).append((key,url))
font=ImageFont.load_default(size=26)
for slug,items in by.items():
    thumbs=[]; idx=[]
    for i,(key,url) in enumerate(items):
        idx.append(f"{i}\t{key}")
        try:
            if url.startswith('/'): data=open('public'+url,'rb').read()
            else:
                if 'res.cloudinary.com' in url:
                    import re; url=re.sub(r'/image/upload/((?:[a-z]_[^/]*,?)+/)*','/image/upload/w_480,c_limit,f_jpg/',url)
                data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read()
            im=Image.open(io.BytesIO(data)).convert('RGB'); im.thumbnail((360,240)); thumbs.append((i,im))
        except Exception as e: print(slug,key,e)
    open(f'.contact/sheets/{slug}.idx','w').write('\n'.join(idx)+'\n')
    if not thumbs: continue
    cols=4; rws=(len(thumbs)+cols-1)//cols
    sheet=Image.new('RGB',(cols*368,rws*248),'white'); d=ImageDraw.Draw(sheet)
    for n,(i,im) in enumerate(thumbs):
        x=(n%cols)*368+4; y=(n//cols)*248+4; sheet.paste(im,(x,y))
        d.rectangle([x,y,x+40,y+32],fill='black'); d.text((x+4,y+2),str(i),fill='white',font=font)
    sheet.save(f'.contact/sheets/{slug}.jpg',quality=80)
