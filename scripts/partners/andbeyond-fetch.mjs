// andBeyond: read the public lodge pages on andbeyond.com (the lodge page and its Accommodation,
// Experiences and Gallery pages) and write what they show, in page order, to
// scripts/data/andbeyond/raw.json: headings, paragraphs and photographs (address and description).
// Source rule (James, 31 Oct 2026): a property's facts and photographs come only from its own brand site.
// The pages to read are listed in scripts/data/andbeyond/pages.json. Nothing here is printed as a link.
import { readFileSync, writeFileSync } from "node:fs";

const DIR = "scripts/data/andbeyond";
const pages = JSON.parse(readFileSync(`${DIR}/pages.json`, "utf8"));
const SUB = ["", "about/", "accommodation/", "experiences/", "gallery/"];

const get = async (url) => {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { accept: "text/html", "user-agent": "Mozilla/5.0 (James Wild & Co partner sync)" } }).catch(() => null);
    if (r?.ok) return r.text();
    if (r && r.status === 404) return null;
    await new Promise((s) => setTimeout(s, 2000 * (i + 1)));
  }
  return null;
};

const clean = (s) =>
  s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#8217;|&rsquo;/g, "'").replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#038;/g, "&").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i")) || [])[1] || "";
// One address per photograph: drop the size and format steps Cloudinary adds between /upload/ and the version.
const base = (u) => u.replace(/\/upload\/(?:[^/]+\/)*?(v\d+\/)/, "/upload/$1").split("?")[0];

const read = (html) => {
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0].replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, "");
  const out = [];
  const re = /<(h[1-5])\b[^>]*>([\s\S]*?)<\/\1>|<p\b[^>]*>([\s\S]*?)<\/p>|<img\b[^>]*>|<source\b[^>]*>|<a\b[^>]*href=["']([^"']+\.(?:mp4|pdf)[^"']*)["']/gi;
  let m;
  while ((m = re.exec(main))) {
    if (m[1]) { const t = clean(m[2]); if (t) out.push({ t: m[1].toLowerCase(), text: t }); continue; }
    if (m[3] !== undefined) { const t = clean(m[3]); if (t && t.length > 1) out.push({ t: "p", text: t }); continue; }
    if (m[4]) { out.push({ t: "file", src: m[4] }); continue; }
    const tag = m[0];
    const cands = [attr(tag, "data-src"), attr(tag, "data-lazy-src"), attr(tag, "src"), ...(attr(tag, "data-srcset") || attr(tag, "srcset")).split(",").map((x) => x.trim().split(" ")[0])]
      .filter((u) => /^https?:\/\/assets\.andbeyond\.com\//.test(u));
    if (!cands.length) continue;
    const src = base(cands[0]);
    const last = out[out.length - 1];
    if (last && last.t === "img" && last.src === src) { if (!last.alt) last.alt = clean(attr(tag, "alt")); continue; }
    out.push({ t: "img", src, alt: clean(attr(tag, "alt")) });
  }
  return out;
};

const raw = { fetched: new Date().toISOString().slice(0, 10), stays: {}, lodgeLinks: [] };
for (const [slug, url] of Object.entries(pages.stays)) {
  raw.stays[slug] = { source: url, pages: {} };
  for (const sub of SUB) {
    const html = await get(url + sub);
    if (!html) { console.log("missing", url + sub); continue; }
    raw.stays[slug].pages[sub || "home"] = read(html);
    console.log(slug, sub || "home", raw.stays[slug].pages[sub || "home"].length);
  }
}
if (pages.index) {
  const html = await get(pages.index);
  if (html) raw.lodgeLinks = [...new Set([...html.matchAll(/href=["'](https:\/\/www\.andbeyond\.com\/(?:lodge-editorial|our-lodges)\/[^"'#?]+)["']/g)].map((x) => x[1]))].sort();
  console.log("lodge links", raw.lodgeLinks.length);
}
writeFileSync(`${DIR}/raw.json`, JSON.stringify(raw, null, 1) + "\n");
