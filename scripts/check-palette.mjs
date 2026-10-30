// One volume palette, house-wide (James, 30 Oct 2026: "stay in the one direction for color so
// there are no more confusions on new additions"). lib/volumes.ts is the only place a volume colour
// is written. This check runs before every build and fails it if anything drifts:
//  • the CSS .vol-* inks (app/globals.css) and Tailwind's vol.* colours must equal the volume pads;
//  • the nav's volume tones (lib/site.ts) and map categories (lib/ledger/categories.ts) must read
//    from lib/volumes.ts, not carry their own hex.
// Run: node scripts/check-palette.mjs
import fs from "node:fs";
const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
const vol = read("lib/volumes.ts");
const pads = {};
for (const m of vol.matchAll(/key: "(\w+)",[^]*?pad: "(#[0-9A-Fa-f]{6})"/g)) pads[m[1]] = m[2].toUpperCase();
const errs = [];
if (Object.keys(pads).length !== 6) errs.push(`lib/volumes.ts: expected 6 volume pads, found ${Object.keys(pads).length}`);
const css = read("app/globals.css");
for (const [k, v] of Object.entries(pads)) {
  const m = css.match(new RegExp(`\\.vol-${k} \\{ --vol: (#[0-9A-Fa-f]{6}); \\}`));
  if (!m) errs.push(`app/globals.css: .vol-${k} missing`); else if (m[1].toUpperCase() !== v) errs.push(`app/globals.css: .vol-${k} is ${m[1]}, the palette says ${v}`);
}
const tw = read("tailwind.config.ts").match(/vol: \{([^}]*)\}/);
for (const [k, v] of Object.entries(pads)) {
  const m = tw && tw[1].match(new RegExp(`${k}: "(#[0-9A-Fa-f]{6})"`));
  if (!m) errs.push(`tailwind.config.ts: vol.${k} missing`); else if (m[1].toUpperCase() !== v) errs.push(`tailwind.config.ts: vol.${k} is ${m[1]}, the palette says ${v}`);
}
if (/tone: "#/.test(read("lib/site.ts"))) errs.push("lib/site.ts: a volume tone is a hex; use volumeInk(\"<volume>\") from lib/volumes.ts");
if (/color: "#/.test(read("lib/ledger/categories.ts"))) errs.push("lib/ledger/categories.ts: a map category colour is a hex; use volumeInk(\"<volume>\")");
if (errs.length) {
  console.error("\nVolume palette check failed. lib/volumes.ts is the only source of volume colours (docs/brand-colours.md).\n  " + errs.join("\n  ") + "\n");
  process.exit(1);
}
console.log("Volume palette: one source, in step.");
