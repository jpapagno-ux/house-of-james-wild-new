// Every outbound link on the live site (James, 13 Nov 2026: no links to operators', hotels', tour companies',
// booking sites' or OTAs' pages, anywhere). Crawls the sitemap and writes scripts/audit/external-links.json:
// host -> [{ page, href, text }]. Run by the External links audit workflow.
import fs from "node:fs";
const SITE = process.env.SITE ?? "https://house-of-james-wild-new.vercel.app";
const xml = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
const pages = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, SITE));
const out = {};
let i = 0;
async function one(page) {
  const html = await fetch(page).then((r) => r.text()).catch(() => "");
  for (const m of html.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = m[1].replace(/&amp;/g, "&");
    const host = new URL(href).hostname.replace(/^www\./, "");
    if (/(^|\.)(house-of-james-wild-new\.vercel\.app|jameswildco\.com)$/.test(host)) continue;
    (out[host] ??= []).push({ page: page.replace(SITE, ""), href, text: m[2].replace(/<[^>]+>/g, "").trim().slice(0, 80) });
  }
}
const q = [...pages];
await Promise.all(Array.from({ length: 8 }, async () => { while (q.length) { await one(q.shift()); if (++i % 200 === 0) console.log(i); } }));
fs.writeFileSync("scripts/audit/external-links.json", JSON.stringify(out, null, 1));
console.log(pages.length, "pages;", Object.keys(out).length, "hosts");
for (const [h, l] of Object.entries(out).sort((a, b) => b[1].length - a[1].length)) console.log(l.length, h);
