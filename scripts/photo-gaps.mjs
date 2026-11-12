// Photo gaps: for every stay on the site, the "Why it's not just another pretty place" and "How to fill the days"
// rows that have no photograph showing what they say. Writes scripts/data/photo-gaps.json; run with
// node --experimental-strip-types scripts/photo-gaps.mjs
import fs from "node:fs";
import { momentsFor, rowsFrom } from "../lib/content/stay-moments.ts";
// altFor, copied from lib/content/stays.ts (that module pulls in the whole site)
const ALT_DROP = /^(jpe?g|png|avif|webp|low|high|resolution|width|height|px|copy|final|edit|img|image|dsc|gettyimages|carousel|hero|general|guest|area|\d+|[a-f0-9]{6,})$/i;
const PHOTO_ALTS = JSON.parse(fs.readFileSync("lib/content/photo-alts.json", "utf8")).alts;
function altFor(url, name, country, i = 0) {
  const where = `${name}${country ? `, ${country}` : ""}`;
  const seen = PHOTO_ALTS[url.split("?")[0].match(/(jwco\/.+?)(?:\.[a-z0-9]{3,4})?$/i)?.[1] ?? ""];
  if (seen) return `${seen} at ${where}`;
  let file = url.split("?")[0].split("/").pop() ?? "";
  try { file = decodeURIComponent(file); } catch { /* keep raw */ }
  file = file.replace(/\.[a-z0-9]{3,4}$/i, "").replace(/^([a-z0-9]{9}_){1,2}[a-f0-9]{24}_/i, "").replace(/_20/g, " ");
  const own = new Set(`${name} ${country ?? ""}`.toLowerCase().replace(/[’']s\b/g, "").split(/[^a-z0-9]+/).filter(Boolean));
  const words = file.split(/[\s_\-.=%]+/).filter((w) => w && !ALT_DROP.test(w) && !own.has(w.toLowerCase().replace(/[’']s$/, "")));
  if (!words.length || (words.length === 1 && words[0].length < 4)) return i ? `${where}: photograph ${i + 1}` : where;
  const what = words.join(" ").toLowerCase().replace(/\s+/g, " ").trim();
  return `${what.charAt(0).toUpperCase()}${what.slice(1)} at ${where}`;
}
const raw = JSON.parse(fs.readFileSync("lib/content/stays.json", "utf8"));
const stays = Array.isArray(raw) ? raw : raw.stays ?? raw.records ?? Object.values(raw);
const out = []; let rows = 0, shown = 0;
for (const s of stays) {
  const images = [s.hero, ...(s.gallery ?? [])].filter(Boolean).map((u, i) => ({ url: u, alt: altFor(u, s.name, s.country, i) }));
  const apart = momentsFor(s.slug, rowsFrom(s.features.items, s.features.paras), images.slice(1));
  const days = momentsFor(s.slug, rowsFrom(s.experiences.items, s.experiences.paras), images.slice(1), 3, apart);
  const miss = [...apart.map((x) => ["apart", x]), ...days.map((x) => ["days", x])].filter(([, x]) => !x.image).map(([k, x]) => `${k}: ${x.title}`);
  rows += apart.length + days.length; shown += apart.length + days.length - miss.length;
  if (miss.length) out.push({ slug: s.slug, name: s.name, country: s.country, missing: miss });
}
fs.writeFileSync("scripts/data/photo-gaps.json", JSON.stringify({ generated: new Date().toISOString().slice(0, 10), rows, withPhoto: shown, stays: out }, null, 1));
console.log(`${stays.length} stays, ${rows} rows, ${shown} with a matching photograph, ${out.length} stays with gaps`);
