// Audit: the first-screen photographs of every stay page (James, 10 Nov 2026: "no hero shots that show in-room photos").
import { STAY_PAGES, altFor } from "@/lib/content/stays";
import { heroSlides } from "@/lib/content/hero-sets";
import { pickPhotos } from "@/lib/content/opening/build";
import { pathwayStays } from "@/lib/content/pathways";
import { writeFileSync } from "node:fs";
const pws = new Set(pathwayStays().map((r) => r.slug));
const rows = STAY_PAGES.map((s) => {
  const slides = heroSlides(`stay:${s.slug}`, s.name, s.country);
  const images = [s.hero, ...s.gallery].filter(Boolean).map((u, i) => ({ url: u as string, alt: altFor(u as string, s.name, s.country, i) }));
  const all = [...slides, ...images].filter((x, k, l) => l.findIndex((y) => y.url === x.url) === k);
  const primary = typeof s.pathway === "object" && s.pathway ? (s.pathway as { primary?: string }).primary : null;
  const opening = all.length >= 5 && (pws.has(s.slug) || !!primary);
  const ph = all.length ? pickPhotos(all[0], all.slice(1), s.name) : null;
  const first = opening && ph ? [...ph.frames.map((f) => f.url), ph.close.url] : [slides[0]?.url ?? images[0]?.url].filter(Boolean);
  return { slug: s.slug, name: s.name, country: s.country, gatherings: !!s.volumes?.includes("gatherings"), opening, count: all.length, first, pool: all.map((x) => x.url) };
});
writeFileSync(process.argv[2], JSON.stringify(rows));
console.log(rows.length, rows.filter((r) => r.opening).length);
