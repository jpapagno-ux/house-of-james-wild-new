# Downloads brand photographs and films on the runner (some brand sites refuse Cloudinary's fetcher) and uploads
# them to the house Cloudinary library with signed requests. Input .contact/upload.tsv:
# public_id \t source url \t alt \t credit \t source site \t resource_type(image|video)
import os, sys, time, hashlib, subprocess, urllib.parse, urllib.request, json
u = urllib.parse.urlparse(os.environ['CLOUDINARY_URL'])
key, secret, cloud = u.username, u.password, u.hostname
os.makedirs('.contact/dl', exist_ok=True)
log = []
for n, line in enumerate(open('.contact/upload.tsv').read().splitlines()):
    if not line.strip(): continue
    pid, url, alt, credit, site, rt = (line.split('\t') + ['image'])[:6]
    rt = rt or 'image'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36', 'Referer': '/'.join(url.split('/')[:3]) + '/'})
        data = urllib.request.urlopen(req, timeout=180).read()
        path = f'.contact/dl/{n}'
        open(path, 'wb').write(data)
        esc = lambda s: s.replace('\\', '\\\\').replace('|', '\\|').replace('=', '\\=')
        params = {'public_id': pid, 'timestamp': str(int(time.time())), 'overwrite': 'true', 'invalidate': 'true',
                  'asset_folder': pid.rsplit('/', 1)[0],
                  'context': f'alt={esc(alt)}|credit={esc(credit)}|source={esc(site)}'}
        s = '&'.join(f'{k}={params[k]}' for k in sorted(params)) + secret
        params['signature'] = hashlib.sha1(s.encode()).hexdigest(); params['api_key'] = key
        cmd = ['curl', '-s', f'https://api.cloudinary.com/v1_1/{cloud}/{rt}/upload', '-F', f'file=@{path}']
        for k, v in params.items(): cmd += ['--form-string', f'{k}={v}']
        r = json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout or '{}')
        if 'error' in r: log.append(f'{pid}\tERROR\t{r["error"].get("message")}')
        else: log.append(f'{pid}\tok\t{r.get("width")}x{r.get("height")}\t{r.get("format")}\t{r.get("duration","")}')
    except Exception as e:
        log.append(f'{pid}\tERROR\t{e}')
    print(log[-1], flush=True)
open('.contact/upload-log.tsv', 'w').write('\n'.join(log) + '\n')
