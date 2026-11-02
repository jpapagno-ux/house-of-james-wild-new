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
// On the Horizon (James, 2 Nov 2026): its colours are derived from the Voyages tokens in lib/volumes.ts
// (HORIZON); the stamp itself must not carry a hex of its own.
if (!/export const HORIZON[^]*VOLUME_STYLES\.voyages\.pad/.test(vol)) errs.push("lib/volumes.ts: HORIZON must derive its ink from the Voyages pad");
if (/#[0-9A-Fa-f]{6}/.test(read("components/ledger/HorizonMark.tsx").replace(/#000|#fff/gi, ""))) errs.push("components/ledger/HorizonMark.tsx: a colour is a hex; read HORIZON from lib/volumes.ts");

// Deep Sea palette (James, 2 Nov 2026): buttons, Wild Pathways chips and offer stamps in blues, aquas and
// turquoise greens; no browns, golds, tans or olives. lib/palette.ts is the source.
const pal = read("lib/palette.ts");
const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (h) => { const [r, g, b] = rgbOf(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
// Earth tones: orange through yellow-green hues (15°–100°) with any real saturation, or a warm grey-brown.
const earthy = (h) => {
  const [r, g, b] = rgbOf(h); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  if (d < 0.02) return false; // neutral grey
  const sat = d / (1 - Math.abs(2 * l - 1));
  let hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hue = (hue * 60 + 360) % 360;
  return hue >= 15 && hue <= 100 && sat > 0.1 && (l < 0.9 || sat > 0.35); // paper whites (#F4F1ED) pass, brown tints (#F7EFE6) do not
};
const sea = {};
for (const m of pal.matchAll(/(\w+): \{ name: "[^"]+", fill: "(#[0-9A-F]{6})", tint: "(#[0-9A-F]{6})" \}/g)) sea[m[1]] = { fill: m[2], tint: m[3] };
if (Object.keys(sea).length !== 8) errs.push(`lib/palette.ts: expected 8 Deep Sea swatches, found ${Object.keys(sea).length}`);
const fills = new Set(Object.values(sea).map((x) => x.fill)), tints = new Set(Object.values(sea).map((x) => x.tint));
const cssKey = { navy: "navy", ocean: "ocean", cerulean: "cerulean", slate: "slate", teal: "teal", aqua: "aqua", turquoise: "turquoise", seaGlass: "glass" };
for (const [k, v] of Object.entries(sea)) {
  if (ratio("#FFFFFF", v.fill) < 4.5) errs.push(`lib/palette.ts: white on ${k} ${v.fill} is ${ratio("#FFFFFF", v.fill).toFixed(2)}:1, below AA`);
  if (ratio(v.fill, v.tint) < 4.5) errs.push(`lib/palette.ts: ${k} on its tint is below AA`);
  if (!css.includes(`--jw-sea-${cssKey[k]}: ${v.fill};`)) errs.push(`app/globals.css: --jw-sea-${cssKey[k]} must be ${v.fill}`);
}
const act = pal.match(/export const ACTION = \{ fill: DEEP_SEA\.(\w+)\.fill, hover: DEEP_SEA\.(\w+)\.fill \}/);
if (!act) errs.push("lib/palette.ts: ACTION must read two DEEP_SEA fills");
else if (!css.includes(`--jw-action: ${sea[act[1]]?.fill}; --jw-action-deep: ${sea[act[2]]?.fill};`)) errs.push(`app/globals.css: :root --jw-action / --jw-action-deep must be ${sea[act[1]]?.fill} / ${sea[act[2]]?.fill} (lib/palette.ts ACTION)`);
// River waters sets: same contrast rule, no earth tones, and the CSS in step.
for (const m of pal.matchAll(/(amazon|nile|river): \{ name: "[^"]+", action: "(#\w{6})", hover: "(#\w{6})", accent: "(#\w{6})", accentDeep: "(#\w{6})", light: "(#\w{6})", card: "(#\w{6})" \}/g)) {
  const [, k, action, hover, accent, , , card] = m;
  for (const [n, h] of [["action", action], ["hover", hover], ["accent", accent]]) {
    if (ratio("#FFFFFF", h) < 4.5) errs.push(`lib/palette.ts: white on ${k} ${n} ${h} is below AA`);
    if (earthy(h)) errs.push(`lib/palette.ts: ${k} ${n} ${h} is a brown, gold or olive`);
  }
  if (!new RegExp(`\\.theme-waters-${k}[^{]*\\{[^}]*--jw-accent-hex: ${accent};[^}]*--jw-card: ${card}; --jw-action: ${action}; --jw-action-deep: ${hover};`).test(css)) errs.push(`app/globals.css: .theme-waters-${k} is out of step with lib/palette.ts WATERS_PALETTE.${k}`);
}
// Buttons read the action token, never a hex or the page accent.
// (The Exceptional Few's own scoped overrides keep their per-property palette and are skipped.)
for (const line of css.split("\n").filter((l) => !l.includes(".theme-ef"))) for (const m of line.matchAll(/\.ledger-btn[\w-]*(?::hover)? \{[^}]*\}/g)) {
  for (const h of m[0].match(/#[0-9A-Fa-f]{6}/g) ?? []) if (earthy(h)) errs.push(`app/globals.css: a button rule carries an earth tone ${h}: ${m[0].slice(0, 60)}…`);
  if (/--jw-accent/.test(m[0])) errs.push(`app/globals.css: a button rule reads the page accent; use --jw-action: ${m[0].slice(0, 60)}…`);
}
// Pathway chips: every accent is a Deep Sea fill, every tint a Deep Sea tint, none an earth tone.
const pw = read("lib/pathways.ts");
for (const m of pw.matchAll(/id: "(PATH-\d\d)"[^]*?accent: "(#\w{6})", text: "(#\w{6})", tint: "(#\w{6})"/g)) {
  const [, id, a, t, ti] = m;
  if (!fills.has(a.toUpperCase())) errs.push(`lib/pathways.ts: ${id} accent ${a} is not a Deep Sea fill (lib/palette.ts)`);
  if (!tints.has(ti.toUpperCase())) errs.push(`lib/pathways.ts: ${id} tint ${ti} is not a Deep Sea tint`);
  for (const h of [a, t, ti]) if (earthy(h)) errs.push(`lib/pathways.ts: ${id} ${h} is a brown, gold, tan or olive`);
}
for (const m of css.matchAll(/--jw-path-\d\d(?:-text|-tint)?: (#\w{6});/g)) if (earthy(m[1])) errs.push(`app/globals.css: pathway token ${m[0]} is an earth tone`);
// Stamps: the On the Horizon sun is the stamp aqua; the Time Rewarded offer stamp is a Deep Sea fill.
const aq = pal.match(/STAMP_AQUA = \{ onLight: "(#\w{6})", onDark: "(#\w{6})" \}/);
if (!aq || !vol.includes(`const SUN_AQUA = "${aq[1]}", SUN_AQUA_DARK = "${aq[2]}"`)) errs.push("lib/volumes.ts: the On the Horizon sun must equal STAMP_AQUA in lib/palette.ts");
if (/const BRASS|#B08657/i.test(vol)) errs.push("lib/volumes.ts: the brass sun is retired (James, 2 Nov 2026)");
const offer = read("components/ledger/Marks.tsx").match(/const TEAL = "(#\w{6})"/);
if (!offer || !fills.has(offer[1].toUpperCase())) errs.push("components/ledger/Marks.tsx: the Time Rewarded offer stamp must be inked in a Deep Sea fill (TEAL)");
for (const f of ["components/pathways/Pathway.tsx", "components/ledger/HorizonMark.tsx"]) for (const m of read(f).matchAll(/#[0-9A-Fa-f]{6}\b/g)) if (earthy(m[0])) errs.push(`${f}: ${m[0]} is an earth tone`);
// Tidewater grounds (James, 2 Nov 2026): CSS in step with lib/palette.ts TIDEWATER; ink and muted ink AA on the
// ground and every band; no sand, tan, cream or parchment.
const blend = (fg, bg, a) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(fg.slice(i, i + 2), 16) * a + parseInt(bg.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, "0")).join("");
const tide = Object.fromEntries([...pal.slice(pal.indexOf("export const TIDEWATER")).matchAll(/(\w+): "(#[0-9A-F]{6})"/g)].map((x) => [x[1], x[2]]));
const ch = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(" ");
for (const [k, v] of [["ground", `--jw-ground: ${tide.ground};`], ["ruleFine", `--jw-rule-fine: ${tide.ruleFine};`], ["rule", `--jw-rule: ${tide.rule};`], ["seaGreen", `--jw-band-rgb: ${tide.seaGreen && ch(tide.seaGreen)};`], ["aqua", `${tide.aqua && ch(tide.aqua)}`], ["amazon", `--jw-band-rgb: ${tide.amazon && ch(tide.amazon)};`], ["nile", `--jw-band-rgb: ${tide.nile && ch(tide.nile)};`]])
  if (!tide[k] || !css.includes(v)) errs.push(`app/globals.css: Tidewater ${k} is out of step with lib/palette.ts TIDEWATER`);
for (const k of ["ground", "card", "seaGreen", "aqua", "amazon", "nile"]) {
  const bg = tide[k]; if (!bg) continue;
  if (ratio(blend("#2D2A26", bg, 0.68), bg) < 4.5) errs.push(`lib/palette.ts: muted ink on Tidewater ${k} ${bg} is below AA`);
  if (earthy(bg)) errs.push(`lib/palette.ts: Tidewater ${k} ${bg} is a sand or tan`);
}
for (const f of ["components/ships/DatesRates.tsx", "components/journey/TripPage.tsx"]) if (/bg-\[#F1E2B8\]/.test(read(f))) errs.push(`${f}: the gold "few left" pill is retired; use the aqua tint #D6EEF0`);
if (/card: "#F6F4F0"|sand: \{ DEFAULT: "#EFEAE0"/.test(read("tailwind.config.ts"))) errs.push("tailwind.config.ts: paper.card and sand must read the Tidewater band, not parchment");
if (errs.length) {
  console.error("\nVolume palette check failed. lib/volumes.ts is the only source of volume colours (docs/brand-colours.md).\n  " + errs.join("\n  ") + "\n");
  process.exit(1);
}
console.log("Volume palette: one source, in step. Deep Sea palette: buttons, chips and offer stamps in blues and aquas, AA.");
