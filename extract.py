import fitz, os, glob, io
from PIL import Image
os.makedirs("out", exist_ok=True)
for p in sorted(glob.glob("pdf/*.pdf")):
    name = os.path.basename(p)[:-4]
    try: doc = fitz.open(p)
    except Exception as e:
        print("bad", p, e); continue
    with open(f"out/{name}.txt", "w") as t:
        for i, page in enumerate(doc):
            t.write(f"\n===== PAGE {i+1} =====\n" + page.get_text())
    if name.startswith("it-"): continue
    os.makedirs(f"out/{name}", exist_ok=True)
    seen = set()
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=60); pix.save(f"out/{name}/page-{i+1:02d}.jpg")
        for img in page.get_images(full=True):
            x = img[0]
            if x in seen: continue
            seen.add(x)
            try:
                d = doc.extract_image(x)
                im = Image.open(io.BytesIO(d["image"])).convert("RGB")
            except Exception as e:
                print("skip", x, e); continue
            if im.width < 700 or im.height < 450: continue
            im.save(f"out/{name}/img-p{i+1:02d}-x{x}.jpg", quality=88)
            print(name, i+1, x, im.size)
