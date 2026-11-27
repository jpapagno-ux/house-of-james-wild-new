# Downloads brand photographs on the runner (for sites that refuse Cloudinary's fetcher) into .contact/stage/ so the
# house library can take them from this public branch. Input .contact/stage.tsv: name \t url
import os, urllib.request
os.makedirs('.contact/stage', exist_ok=True)
for line in open('.contact/stage.tsv').read().splitlines():
    if not line.strip(): continue
    parts = line.split('\t'); name, url = parts[:2]
    ref = parts[2] if len(parts) > 2 and parts[2] else '/'.join(url.split('/')[:3]) + '/'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36', 'Referer': ref})
    try:
        data = urllib.request.urlopen(req, timeout=180).read()
        open(f'.contact/stage/{name}', 'wb').write(data); print('ok', name, len(data))
    except Exception as e: print('ERROR', name, e)
