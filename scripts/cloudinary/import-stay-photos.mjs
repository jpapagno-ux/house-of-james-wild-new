// Stay photo import (James, 10 Nov 2026: "Yes, move them in"): every stay photograph still served from outside
// Cloudinary (Base44 media) is uploaded into the one house library, so each gets Cloudinary's AI upscale, focal-point
// phone crop and quality tuning. Same photographs, nothing edited: one folder per stay, jwco/stays/<slug>/library/.
// Writes lib/content/stay-cloud.json (original address -> public id, width, height). Safe to re-run: anything already
// in the map is skipped, and an existing public id is never overwritten.
//
// Credentials: CLOUDINARY_URL (the repository secret James added for housekeeping). Run by the Stay photo import
// workflow on push, or: CLOUDINARY_URL=... node scripts/cloudinary/import-stay-photos.mjs [--limit N]
import fs from "node:fs";
import crypto from "node:crypto";

const args = process.argv.slice(2);
const LIMIT = Number(args[args.indexOf("--limit") + 1] || 100000) || 100000;
const url = process.env.CLOUDINARY_URL ? new URL(process.env.CLOUDINARY_URL) : null;
if (!url) { console.error("Set CLOUDINARY_URL."); process.exit(1); }
const KEY = decodeURIComponent(url.username), SECRET = decodeURIComponent(url.password), CLOUD = url.hostname;
const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474/";
const MAPFILE = "lib/content/stay-cloud.json";
const store = JSON.parse(fs.readFileSync(MAPFILE, "utf8"));
store.map ??= {}; store.failed ??= {};

const stays = JSON.parse(fs.readFileSync("lib/content/stays.json", "utf8")).stays;
const photos = JSON.parse(fs.readFileSync("lib/content/stay-photos.json", "utf8"));
const abs = (u) => (u.startsWith("/img/b44/") ? B44 + u.slice(9) : u);
const outside = (u) => !!u && !/res\.cloudinary\.com/.test(u) && /^(https?:|\/img\/b44\/)/.test(u);

// every photograph each stay shows: hero, gallery, and its hand-picked slides and full frames
const jobs = [];
const seen = new Set(Object.keys(store.map));
const add = (slug, u) => { if (!outside(u)) return; const a = abs(u); if (seen.has(a)) return; seen.add(a); jobs.push({ slug, src: a }); };
for (const s of stays) { add(s.slug, s.hero); for (const g of s.gallery ?? []) add(s.slug, g); }
for (const [slug, v] of Object.entries(photos.stays ?? {})) for (const list of Object.values(v ?? {})) if (Array.isArray(list)) for (const x of list) add(slug, typeof x === "string" ? x : x?.url);
const sets = JSON.parse(fs.readFileSync("lib/content/hero-sets.json", "utf8"));
for (const [k, list] of Object.entries(sets)) if (k.startsWith("stay:") && Array.isArray(list)) for (const u of list) add(k.slice(5), u);
console.log(`${jobs.length} photographs to import (${Object.keys(store.map).length} already in Cloudinary)`);

const name = (src) => { const base = decodeURIComponent(src.split("?")[0].split("/").pop() ?? "photo").replace(/\.[a-z0-9]+$/i, ""); const words = base.replace(/_20/g, " ").replace(/[^A-Za-z0-9]+/g, " ").trim().split(/\s+/).filter((w) => !/^[0-9a-f]{8,}$/i.test(w)); const nice = words.slice(-6).join("-").toLowerCase().slice(0, 60) || "photo"; return `${nice}-${crypto.createHash("sha1").update(src).digest("hex").slice(0, 6)}`; };

async function upload(job) {
  const params = { public_id: `jwco/stays/${job.slug}/library/${name(job.src)}`, overwrite: "false", context: `source=${job.src.replace(/[|=]/g, "")}|import=stay-library`, tags: "stay-library-import", timestamp: Math.floor(Date.now() / 1000) };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const form = new URLSearchParams({ ...params, file: job.src, api_key: KEY, signature: crypto.createHash("sha1").update(toSign + SECRET).digest("hex") });
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: form });
    const j = await r.json().catch(() => ({}));
    if (r.ok) return { id: j.public_id, w: j.width, h: j.height };
    if (r.status >= 500 || r.status === 420 || r.status === 429) { await new Promise((s) => setTimeout(s, 4000 * (attempt + 1))); continue; }
    throw new Error(`${r.status} ${j?.error?.message ?? ""}`.trim());
  }
  throw new Error("server error");
}

let done = 0, failed = 0;
const queue = jobs.slice(0, LIMIT);
const save = () => fs.writeFileSync(MAPFILE, JSON.stringify(store, null, 1) + "\n");
async function worker() {
  while (queue.length) {
    const job = queue.shift();
    try { store.map[job.src] = await upload(job); delete store.failed[job.src]; done++; }
    catch (e) { store.failed[job.src] = String(e.message).slice(0, 160); failed++; }
    if ((done + failed) % 50 === 0) { save(); console.log(`${done} imported, ${failed} failed`); }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
save();
console.log(`Done: ${done} imported, ${failed} failed, ${Object.keys(store.map).length} in the map.`);
