import urllib.request, io, os
from PIL import Image, ImageDraw
B="https://silolona.sgp1.cdn.digitaloceanspaces.com/silolona/6351115a3ae70d03975326d7/content-images/"
ids="""13df0ceb-ba2f-4a75-a67e-456acc5f0db7.jpeg 2d254768-d4cf-448c-aa99-ac31096227d5.png 3f8f7b55-8b0f-4b6f-b24f-88c87bb9ba0b.jpeg 51285e84-61dc-4a77-b440-75a02d9820ba.png 5d064826-9f7f-41de-bfa9-9607f6b18dcf.jpeg 67593db1-2f4e-450f-8749-dd4cc0e61fd6.png 6db727cc-299b-437d-9174-ccecc40fc59d.jpeg 75473016-96d9-452b-9222-7f5191a99309.jpeg 824cfa2e-e747-433d-a873-0b3d9476737c.png ba65fa4e-86a2-4d6c-a82c-c9b983a555ef.png c89e5950-450d-4378-9af0-7d03a857ada8.jpeg dfb2c857-64aa-4d31-b547-32f7f44ac98d.png 377e2a25-2e1b-4537-a471-9c3bb317487c.jpeg 4aaafa53-4097-43c8-9a2b-8cac7ee8cbce.jpeg 993b18b4-c7e6-4e55-91bc-eb036e2374c5.jpeg ca016465-03df-4bbe-a449-0f277a3ee847.jpeg d4da7c1a-d0f7-4390-939c-9e816ac0238d.jpeg e653d995-99e9-4794-82c2-ada1bb84b465.jpeg e8443d02-228c-468b-a301-94376ede674c.jpeg f26193b5-b213-4e57-b5db-933a6ee7b127.jpeg 3cf393ad-ab0f-49c0-b374-32ab2b1b3dee.jpeg adbc805f-d1bc-45dc-9a4c-70131a66d98f.jpeg 13f55a38-86df-43fc-b976-593c6a76bf14.png 0b84855c-a829-40c8-b720-dae1bdce8451.jpeg be408bf5-c405-4a42-bf99-6a5ca8109350.jpeg 8c6d002f-8487-4471-8293-c1e7cdb41bc8.jpeg e570e51e-c404-4f34-b1bc-927fc54902d2.jpeg""".split()
W,H,c=300,200,4
rows=(len(ids)+c-1)//c
sheet=Image.new("RGB",(W*c,(H+18)*rows),"white"); d=ImageDraw.Draw(sheet)
for i,x in enumerate(ids):
    try:
        im=Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(B+x,headers={"User-Agent":"Mozilla/5.0"}),timeout=60).read())).convert("RGB")
    except Exception as e:
        print("err",x,e); continue
    sz=im.size; im.thumbnail((W,H)); X,Y=(i%c)*W,(i//c)*(H+18); sheet.paste(im,(X,Y)); d.text((X+2,Y+H+2),f"{x[:8]} {sz[0]}x{sz[1]}",fill="black")
os.makedirs("out",exist_ok=True); sheet.save("out/sdb-sheet.jpg",quality=80)
