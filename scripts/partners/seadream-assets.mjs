// SeaDream Yacht Club, second pass (partner agreement, James, 15 Nov 2026): what the build needs beyond raw.json.
//   1. ports.json    a position for every port of call (seadream.com publishes none), looked up by name and
//                    country in OpenStreetMap's gazetteer; the build checks each against her sailing speed.
//   2. pages.json    the text, image addresses and film ids of the brand's own yacht pages.
//   3. photos.json   the brand's photographs and suite films copied into the house Cloudinary library, same
//                    pictures, nothing edited, existing ids never overwritten. Voyage pictures are keyed by
//                    content, so one picture used on forty voyages is stored once.
//   4. sheets/       numbered contact sheets, so each picture is captioned by looking at it. Removed before merge.
// Run by .github/workflows/seadream-fetch.yml. Credentials: the CLOUDINARY_URL repository secret.
import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const DIR = "scripts/data/seadream";
const UA = { "User-Agent": "jwco-partner-fetch/1.0 (James Wild & Co; partner data)" };
const raw = JSON.parse(fs.readFileSync(`${DIR}/raw.json`, "utf8"));
const read = (f, d) => (fs.existsSync(`${DIR}/${f}`) ? JSON.parse(fs.readFileSync(`${DIR}/${f}`, "utf8")) : d);
const write = (f, d) => fs.writeFileSync(`${DIR}/${f}`, JSON.stringify(d, null, 1) + "\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const only = (process.env.ONLY ?? "ports,pages,photos").split(",");

// 1. Ports -------------------------------------------------------------------
if (only.includes("ports")) {
  const ports = read("ports.json", {});
  const pairs = new Map();
  for (const v of raw.voyages) for (const d of v.days) if (d.port && !/^at sea/i.test(d.port)) pairs.set(`${d.port}|${d.country}`, [d.port, d.country]);
  const ask = async (q) => {
    for (let a = 0; a < 3; a++) {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&accept-language=en&q=${encodeURIComponent(q)}`, { headers: UA }).catch(() => null);
      await sleep(1100);
      if (r?.ok) return r.json();
    }
    return [];
  };
  let n = 0;
  for (const [key, [port, country]] of pairs) {
    if (ports[key]?.lat != null || ports[key]?.tried) continue;
    const name = port.replace(/\s*\(.*?\)\s*/g, " ").trim();
    const tries = [...new Set([`${name}, ${country}`, `${name.split(",")[0]}, ${country}`, name, name.split(",")[0]])].filter((q) => q.replace(/[, ]/g, ""));
    let hit = null, q = "";
    for (q of tries) { const j = await ask(q); if (j[0]) { hit = j[0]; break; } }
    ports[key] = hit ? { lat: +(+hit.lat).toFixed(4), lng: +(+hit.lon).toFixed(4), as: hit.display_name, q } : { lat: null, lng: null, tried: true };
    if (++n % 25 === 0) { write("ports.json", ports); console.log("ports", n); }
  }
  write("ports.json", ports);
  console.log(Object.values(ports).filter((p) => p.lat != null).length, "ports placed;", Object.values(ports).filter((p) => p.lat == null).length, "not found");
}

// 2. The brand's own pages -------------------------------------------------------
const PAGES = ["", "yachts", "yachts/seadream-i", "yachts/seadream-ii", "seadream-iii", "yachts/seadream-iii", "onboard", "why-seadream", "videos", "gallery", "special-offers", "destinations", "destinations/caribbean", "destinations/bahamas", "dining", "watersports", "spa", "charter", "faq"];
if (only.includes("pages")) {
  const pages = {};
  for (const p of PAGES) {
    const r = await fetch(`https://seadream.com/${p}`, { headers: UA, redirect: "follow" }).catch(() => null);
    if (!r?.ok) { pages[p || "home"] = { status: r?.status ?? 0 }; continue; }
    const html = await r.text();
    const main = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/gi, " ");
    const text = main.replace(/<(h[1-6]|p|li|tr|div|section|br)\b[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#39;|&rsquo;/g, "'").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
    const images = [...new Set([...html.matchAll(/https:\/\/static\.seadream\.com\/[^"'\s)\\]+\.(?:jpe?g|png|webp)/gi)].map((m) => m[0]))];
    const alts = Object.fromEntries([...html.matchAll(/<img\b[^>]*>/gi)].map((m) => [m[0].match(/src="([^"]+)"/)?.[1], m[0].match(/alt="([^"]*)"/)?.[1]]).filter(([s, a]) => s && a));
    const films = [...new Set([...html.matchAll(/(?:playback-id|playbackId)["'=:\s]+([A-Za-z0-9]{20,})/g)].map((m) => m[1]))];
    const mp4 = [...new Set([...html.matchAll(/https:\/\/static\.seadream\.com\/[^"'\s)\\]+\.mp4/gi)].map((m) => m[0]))];
    pages[p || "home"] = { url: r.url, text: text.slice(0, 40000), images, alts, films, mp4 };
    await sleep(400);
  }
  write("pages.json", pages);
  console.log(Object.entries(pages).map(([k, v]) => `${k}:${v.images ? v.images.length : `x${v.status}`}`).join(" "));
}

// 3. Photographs and suite films ---------------------------------------------------
if (only.includes("photos")) {
  const rawUrl = (process.env.CLOUDINARY_URL ?? "").trim().replace(/^CLOUDINARY_URL\s*=\s*/i, "").replace(/^["']|["']$/g, "");
  const cu = rawUrl ? new URL(rawUrl) : null;
  const KEY = cu && decodeURIComponent(cu.username), SECRET = cu && decodeURIComponent(cu.password), CLOUD = cu?.hostname;
  const done = read("photos.json", {});
  const ROOT = "jwco/voyages/ships/seadream";
  fs.mkdirSync("/tmp/sd", { recursive: true });
  fs.mkdirSync(`${DIR}/sheets`, { recursive: true });

  async function upload(file, id, kind = "image") {
    if (!cu) return "no credentials";
    const params = { public_id: id, overwrite: "false", context: "credit=SeaDream Yacht Club", tags: "seadream,partner-photo", timestamp: Math.floor(Date.now() / 1000), ...(kind === "image" ? { transformation: "c_limit,w_3200" } : {}) };
    const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
    const form = new FormData();
    for (const [k, v] of Object.entries(params)) form.append(k, String(v));
    form.append("api_key", KEY); form.append("signature", crypto.createHash("sha1").update(toSign + SECRET).digest("hex"));
    form.append("file", new Blob([fs.readFileSync(file)]), "f");
    for (let a = 0; a < 3; a++) {
      const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/${kind}/upload`, { method: "POST", body: form }).catch(() => null);
      const j = await r?.json().catch(() => ({}));
      if (r?.ok) return `${j.width}x${j.height}`;
      if (!r || r.status >= 500 || r.status === 420 || r.status === 429) { await sleep(4000 * (a + 1)); continue; }
      return `failed: ${r.status} ${j?.error?.message ?? ""}`.slice(0, 160);
    }
    return "failed: server";
  }
  const grab = async (src) => {
    const r = await fetch(src, { headers: UA }).catch(() => null);
    if (!r?.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
    const file = `/tmp/sd/${hash}${(src.match(/\.(jpe?g|png|webp|mp4)$/i)?.[0] ?? ".jpg").toLowerCase()}`;
    fs.writeFileSync(file, buf);
    return { hash, file, bytes: buf.length };
  };
  const slug = (s) => s.split("/").pop().replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // What to copy: [source, public id or null to key by content, group]
  const want = [];
  for (const v of raw.voyages) if (v.hero) want.push([v.hero, null, "voyage"]);
  for (const p of new Set(raw.voyages.flatMap((v) => v.suites.flatMap((s) => s.photos)))) want.push([p, `${ROOT}/suites/${slug(p)}`, "suite"]);
  for (const n of [2, 3, 4, 5, 6]) want.push([`https://static.seadream.com/images/yachts/deck-plans/DeckPlans_website_Deck${n}.jpg`, `${ROOT}/deck-${n}`, "deck"]);
  const pages = read("pages.json", {});
  const seen = new Set(want.map((w) => w[0]));
  for (const p of Object.values(pages)) for (const i of p.images ?? []) if (!seen.has(i) && !/\/voyages\/|\/ports\/|logo|icon|favicon|deck-plans|\/suites\//i.test(i)) { seen.add(i); want.push([i, `${ROOT}/site/${slug(i)}`, "site"]); }

  const sheets = { voyage: [], suite: [], deck: [], site: [] };
  const queue = want.filter(([src]) => !done[src] || /^failed|^no cred/.test(done[src].size ?? ""));
  for (const [src, id, group] of want) if (done[src] && !queue.find((q) => q[0] === src)) sheets[group].push([done[src].id, null]);
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const [src, id, group] = queue.shift();
      const g = await grab(src);
      if (!g) { done[src] = { id: null, size: "failed: not fetched" }; continue; }
      const pid = id ?? `${ROOT}/voyages/${g.hash}`;
      const prior = Object.values(done).find((d) => d.id === pid && /^\d+x\d+/.test(d.size ?? ""));
      // Site pictures wait for a pick from the contact sheet; everything else is copied now.
      done[src] = { id: pid, size: prior ? prior.size : group === "site" ? "sheet only" : await upload(g.file, pid), group };
      sheets[group].push([pid, g.file]);
    }
  }));
  for (const f of ["owners-suite-1080p", "admiral-suite-1080p", "commodore-suite-1080p", "yacht-club-stateroom-small"]) {
    const src = `https://static.seadream.com/assets/yachts/videos/${f}.mp4`;
    if (/^\d+x\d+/.test(done[src]?.size ?? "")) continue;
    const g = await grab(src);
    done[src] = g ? { id: `${ROOT}/films/${f.replace(/-1080p|-small/, "")}`, size: await upload(g.file, `${ROOT}/films/${f.replace(/-1080p|-small/, "")}`, "video"), group: "film", bytes: g.bytes } : { id: null, size: "failed: not fetched" };
  }
  write("photos.json", done);

  // 4. Contact sheets: thirty to a sheet, each tile numbered; index.json maps number to public id.
  const index = {};
  for (const [group, list] of Object.entries(sheets)) {
    const uniq = [...new Map(list.filter(([, f]) => f).map((x) => [x[0], x])).values()].sort((a, b) => a[0].localeCompare(b[0]));
    for (let i = 0; i < uniq.length; i += 30) {
      const part = uniq.slice(i, i + 30), name = `${group}-${String(i / 30 + 1).padStart(2, "0")}`;
      const args = [];
      part.forEach(([pid, file], k) => { index[`${name}#${i + k + 1}`] = pid; args.push("-label", String(i + k + 1), file); });
      try { execFileSync("montage", [...args, "-thumbnail", "300x200^", "-gravity", "center", "-extent", "300x200", "-tile", "6x", "-geometry", "+3+3", "-pointsize", "16", "-quality", "72", `${DIR}/sheets/${name}.jpg`], { stdio: "inherit" }); } catch (e) { console.log("sheet failed", name, e.message); }
    }
  }
  write("sheets/index.json", index);
  const sizes = Object.values(done).map((d) => d.size ?? "");
  console.log(sizes.filter((s) => /^\d+x\d+/.test(s)).length, "in Cloudinary;", sizes.filter((s) => s === "sheet only").length, "on sheets;", sizes.filter((s) => /^failed|^no cred/.test(s)).length, "failed");
}
