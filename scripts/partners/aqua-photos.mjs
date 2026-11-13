// Uploads the Aqua Expeditions photographs listed in scripts/data/aqua/photos.json (written by
// aqua-build.mjs) into the house Cloudinary library at the public ids the ship files use. Same
// photographs, nothing edited; large originals are capped at 3200 px. Existing ids are never
// overwritten. Writes scripts/data/aqua/photos-done.json (id -> width x height, or the error).
// Credentials: the CLOUDINARY_URL repository secret (run by the Aqua Expeditions fetch workflow).
import fs from "node:fs";
import crypto from "node:crypto";

const raw = (process.env.CLOUDINARY_URL ?? "").trim().replace(/^CLOUDINARY_URL\s*=\s*/i, "").replace(/^["']|["']$/g, "");
const url = new URL(raw);
const KEY = decodeURIComponent(url.username), SECRET = decodeURIComponent(url.password), CLOUD = url.hostname;
const list = JSON.parse(fs.readFileSync("scripts/data/aqua/photos.json", "utf8"));
const OUT = "scripts/data/aqua/photos-done.json";
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};

async function upload({ id, src }) {
  const params = { public_id: id, overwrite: "false", transformation: "c_limit,w_3200", format: "jpg", context: `source=${src.replace(/[|=]/g, "")}|credit=Aqua Expeditions`, tags: "aqua-expeditions,partner-photo", timestamp: Math.floor(Date.now() / 1000) };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const form = new URLSearchParams({ ...params, file: src, api_key: KEY, signature: crypto.createHash("sha1").update(toSign + SECRET).digest("hex") });
  for (let a = 0; a < 3; a++) {
    const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: form });
    const j = await r.json().catch(() => ({}));
    if (r.ok) return `${j.width}x${j.height}${j.existing ? " (existing)" : ""}`;
    if (r.status >= 500 || r.status === 420 || r.status === 429) { await new Promise((s) => setTimeout(s, 4000 * (a + 1))); continue; }
    throw new Error(`${r.status} ${j?.error?.message ?? ""}`.trim());
  }
  throw new Error("server error");
}
const queue = list.filter((p) => !/^\d+x\d+/.test(done[p.id] ?? ""));
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const p = queue.shift();
    try { done[p.id] = await upload(p); } catch (e) { done[p.id] = `failed: ${e.message}`.slice(0, 200); }
  }
}));
fs.writeFileSync(OUT, JSON.stringify(done, null, 1) + "\n");
console.log(Object.values(done).filter((v) => !v.startsWith("failed")).length, "in Cloudinary;", Object.values(done).filter((v) => v.startsWith("failed")).length, "failed");
