// SeaDream Yacht Club: read the brand's own pages on seadream.com (partner agreement, James, 15 Nov 2026).
// Stage 1 (this file, for now): a probe. It saves a handful of pages as the site serves them into
// scripts/data/seadream/probe/, so the reader for every voyage (day by day, fares by stateroom category) can be
// written against the real markup. Run on a GitHub runner (the workflow seadream-fetch.yml): node scripts/partners/seadream-fetch.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const SITE = "https://seadream.com";
const UA = { "user-agent": "Mozilla/5.0 (James Wild & Co partner sync)", "accept-language": "en" };
const get = async (url) => {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: UA }).catch(() => null);
    if (r?.ok) return r.text();
    await new Promise((s) => setTimeout(s, 2000 * (i + 1)));
  }
  return `FETCH FAILED: ${url}`;
};
const PAGES = { voyages: "/voyages", "voyage-22713": "/voyages/22713", "voyage-12641": "/voyages/12641", "voyage-32901": "/voyages/32901", offers: "/voyages/special-offers", staterooms: "/yachts/staterooms-suites", terms: "/about/policies-terms-conditions", sitemap: "/sitemap.xml" };
mkdirSync("scripts/data/seadream/probe", { recursive: true });
for (const [name, path] of Object.entries(PAGES)) {
  const html = await get(SITE + path);
  writeFileSync(`scripts/data/seadream/probe/${name}.html`, html);
  console.log(name, html.length);
}
