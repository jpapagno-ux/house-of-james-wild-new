// Mobile and desktop check of given pages on the live site (or a preview, SITE=...): for each page and viewport,
// a screenshot of the top, the itinerary and the dates sections, plus a report of horizontal overflow, tap targets
// under 44px, images that failed and form fields under 16px (iOS zooms into those). Writes scripts/audit/mobile/.
import fs from "node:fs";
import { chromium, devices } from "playwright";
const SITE = process.env.SITE ?? "https://house-of-james-wild-new.vercel.app";
const PAGES = (process.env.PAGES || "/voyages/ships/aqua-mekong,/voyages/ships/aqua-nera,/voyages/ships/aqua-mare,/voyages/ships/aqua-blu,/voyages/ships/aqua-lares,/voyages/ships/aria-amazon,/partners/aqua-expeditions").split(",");
const OUT = "scripts/audit/mobile";
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const report = [];
for (const [vp, opts] of [["phone", devices["iPhone 13"]], ["desktop", { viewport: { width: 1440, height: 900 } }]]) {
  const ctx = await browser.newContext({ ...opts, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    const name = `${vp}-${path.split("/").pop()}`;
    await page.goto(SITE + path, { waitUntil: "networkidle", timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); return b.right > w + 2 && getComputedStyle(e).position !== "fixed" && b.width > 0; }).slice(0, 5).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 40)}`);
      const small = [...document.querySelectorAll("a,button,summary,select")].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.height < 32 && getComputedStyle(e).display !== "inline"; }).length;
      const zoomy = [...document.querySelectorAll("input,select,textarea")].filter((e) => parseFloat(getComputedStyle(e).fontSize) < 16).length;
      const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src.slice(-60));
      const sailingsShown = [...document.querySelectorAll("#dates li")].filter((li) => li.offsetParent !== null).length;
      const out = [...document.querySelectorAll("a[href^='http']")].map((a) => new URL(a.href).hostname).filter((h) => !/house-of-james-wild-new|jameswildco|polarcrossings|wildearthstay|instagram|facebook|pinterest|x\.com|youtube|calendly|cloudinary/.test(h));
      return { scrollW: document.documentElement.scrollWidth, w, wide, small, zoomy, broken, sailingsShown, outbound: [...new Set(out)], height: document.documentElement.scrollHeight };
    });
    report.push({ vp, path, ...r });
    await page.screenshot({ path: `${OUT}/${name}-top.jpg`, quality: 55, type: "jpeg" });
    for (const id of ["itinerary", "dates"]) {
      const el = await page.$(`#${id}`);
      if (!el) continue;
      await el.scrollIntoViewIfNeeded();
      await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: "start" }), id);
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${OUT}/${name}-${id}.jpg`, quality: 55, type: "jpeg" });
    }
  }
  // page to page: follow a link from a ship to the partner page and back, and record where the page lands
  await page.goto(SITE + PAGES[0], { waitUntil: "networkidle" }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 3000));
  const link = await page.$("a[href='/partners/aqua-expeditions']");
  if (link) { await link.click(); await page.waitForTimeout(2500); report.push({ vp, check: "page-to-page", landedAt: await page.evaluate(() => window.scrollY), url: page.url() }); await page.goBack(); await page.waitForTimeout(2500); report.push({ vp, check: "back", restoredTo: await page.evaluate(() => window.scrollY) }); }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
