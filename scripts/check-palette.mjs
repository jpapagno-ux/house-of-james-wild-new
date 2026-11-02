// The House Standard (James approved, 2 Nov 2026, warm neutrals and Heritage volumes confirmed the same day): five
// warm tones, one accent, one gradient; volumes told apart by a 5px tab, map pins and an occasional volume mist. lib/palette.ts holds the house tones, lib/volumes.ts the only volume colours. This check runs
// before every build and fails it if anything drifts:
//  • the Heritage volumes (lib/volumes.ts): volume words (deep) reach AA on Paper and on the volume mist;
//  • no volume hex outside lib/volumes.ts (CSS, Tailwind, components, pages, maps): volumes flow from tokens, so a
//    new volume set is one edit (volumeCss() is injected by app/layout.tsx; Tailwind vol.* / leather.* read its vars);
//  • app/globals.css carries the house tones, the crimson action, the graphite general accent, Stone Mist bands with a
//    Paper alternate, and the one gradient, all equal to lib/palette.ts;
//  • text tones reach WCAG AA where they are used; buttons are squared (2px) and wear no colour but the house's;
//  • pathway chips are graphite outlines on paper (the pathway colour only as a dot);
//  • the retired Deep Sea action, Tidewater bands, Field Olive and parchment grounds do not come back.
// Protected and checked separately: the river waters (.theme-waters-*), The Exceptional Few's palettes, map pins.
// Run: node scripts/check-palette.mjs
import fs from "node:fs";
import path from "node:path";
const root = new URL("..", import.meta.url).pathname;
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const errs = [], warns = [];

// ---------- colour maths ----------
const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (h) => { const [r, g, b] = rgbOf(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const hsl = (h) => { const [r, g, b] = rgbOf(h); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2; const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)); let hue = d === 0 ? 0 : mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return { h: (hue * 60 + 360) % 360, s, l, d }; };
const earthy = (h) => { const { h: hue, s, l, d } = hsl(h); return d >= 0.02 && hue >= 15 && hue <= 100 && s > 0.1 && (l < 0.9 || s > 0.35); };
const chromatic = (h) => hsl(h).d >= 0.1; // anything that is not a warm or cool near-neutral
const ch = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(" ");

// ---------- volumes: one source ----------
const vol = read("lib/volumes.ts");
const vols = {};
for (const m of vol.matchAll(/key: "(\w+)",[^]*?leather: "(#[0-9A-Fa-f]{6})"[^]*?pad: "(#[0-9A-Fa-f]{6})"[^]*?deep: "(#[0-9A-Fa-f]{6})"/g)) vols[m[1]] = { leather: m[2].toUpperCase(), pad: m[3].toUpperCase(), deep: m[4].toUpperCase() };
if (Object.keys(vols).length !== 6) errs.push(`lib/volumes.ts: expected 6 volumes with leather, pad and deep, found ${Object.keys(vols).length}`);
if (!/export function volumeCss\(/.test(vol)) errs.push("lib/volumes.ts: volumeCss() must generate the volume CSS");
if (!/volumeCss\(\)/.test(read("app/layout.tsx"))) errs.push("app/layout.tsx: must inject volumeCss() from lib/volumes.ts");
const volHex = new Map();
for (const [k, v] of Object.entries(vols)) for (const [n, h] of Object.entries(v)) volHex.set(h, `${k} ${n}`);
// Volume words use the deep value: it must reach AA on Paper and on the volume's own mist.
for (const m of vol.matchAll(/key: "(\w+)",[^]*?deep: "(#[0-9A-Fa-f]{6})"[^]*?tint: "(#[0-9A-Fa-f]{6})"/g)) {
  if (ratio(m[2], "#FFFFFF") < 4.5) errs.push(`lib/volumes.ts: ${m[1]} deep ${m[2]} is below AA on Paper`);
  if (ratio(m[2], m[3]) < 4.5) errs.push(`lib/volumes.ts: ${m[1]} deep ${m[2]} is below AA on its mist ${m[3]}`);
}
const houseHex = new Set(["HOUSE", "FOOTER"].flatMap((n) => [...(read("lib/palette.ts").match(new RegExp(`export const ${n} = \\{([^}]*)\\}`))?.[1] ?? "").matchAll(/#[0-9A-F]{6}/g)].map((m) => m[0])));
const PROTECTED_DIRS = ["app/whats-coming", "components/coming", "lib/content/whats-coming"]; // another build in flight: warn only
const walk = (d) => fs.existsSync(path.join(root, d)) ? fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
const scan = [...walk("app"), ...walk("components"), ...walk("lib"), "tailwind.config.ts", ...walk("public/maps")].filter((f) => /\.(tsx?|css|m?js)$/.test(f) && !f.endsWith("lib/volumes.ts") && !f.includes("lib/content/library") && !f.endsWith(".json"));
for (const f of scan) {
  const src = read(f);
  for (const m of src.matchAll(/#[0-9A-Fa-f]{6}\b/g)) {
    const which = volHex.get(m[0].toUpperCase());
    if (!which || houseHex.has(m[0].toUpperCase())) continue; // Stays Limestone shares warm tones with the house and the footer
    // a protected theme (The Exceptional Few, river waters) or a pathway dot may share a hex by coincidence
    const line = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index));
    if (/theme-ef|theme-waters|--ef-|WATERS_PALETTE|accent: "#/.test(line)) continue;
    const msg = `${f}: ${m[0]} is the ${which} volume colour; read it from lib/volumes.ts (volumeInk / volumeLeather / volumeText or the --vol-* variables)`;
    (PROTECTED_DIRS.some((d) => f.startsWith(d)) ? warns : errs).push(msg);
  }
}
const tw = read("tailwind.config.ts");
for (const k of Object.keys(vols)) {
  if (!tw.includes(`${k}: "var(--vol-${k}-ink)"`)) errs.push(`tailwind.config.ts: vol.${k} must read var(--vol-${k}-ink)`);
  if (!tw.includes(`${k}: "var(--vol-${k}-leather)"`)) errs.push(`tailwind.config.ts: leather.${k} must read var(--vol-${k}-leather)`);
}
if (/tone: "#/.test(read("lib/site.ts"))) errs.push("lib/site.ts: a volume tone is a hex; use volumeInk(\"<volume>\") from lib/volumes.ts");
if (/color: "#/.test(read("lib/ledger/categories.ts"))) errs.push("lib/ledger/categories.ts: a map category colour is a hex; use volumeInk(\"<volume>\")");
if (!/export const HORIZON[^]*VOLUME_STYLES\.voyages\.pad/.test(vol)) errs.push("lib/volumes.ts: HORIZON must derive its ink from the Voyages pad");
if (/#[0-9A-Fa-f]{6}/.test(read("components/ledger/HorizonMark.tsx").replace(/#000|#fff/gi, ""))) errs.push("components/ledger/HorizonMark.tsx: a colour is a hex; read HORIZON from lib/volumes.ts");

// ---------- the house tones ----------
const pal = read("lib/palette.ts");
const block = (name) => Object.fromEntries([...(pal.match(new RegExp(`export const ${name} = \\{([^}]*)\\}`))?.[1] ?? "").matchAll(/(\w+): "(#[0-9A-F]{6})"/g)].map((x) => [x[1], x[2]]));
const H = block("HOUSE"), C = block("CRIMSON");
for (const k of ["paper", "mist", "stone", "stoneText", "graphite", "ink", "keyline", "hairline"]) if (!H[k]) errs.push(`lib/palette.ts: HOUSE.${k} missing`);
if (C.fill !== "#8B2525") errs.push("lib/palette.ts: CRIMSON.fill must be House Crimson #8B2525");
const css = read("app/globals.css");
const cssVar = { paper: "--jw-paper", mist: "--jw-mist", stone: "--jw-stone", stoneText: "--jw-stone-text", graphite: "--jw-graphite", ink: "--jw-ink", keyline: "--jw-keyline", hairline: "--jw-hairline" };
for (const [k, v] of Object.entries(cssVar)) if (H[k] && !css.includes(`${v}: ${H[k]};`)) errs.push(`app/globals.css: ${v} must be ${H[k]} (lib/palette.ts HOUSE.${k})`);
if (!css.includes(`--jw-crimson: ${C.fill}; --jw-crimson-deep: ${C.deep};`)) errs.push("app/globals.css: --jw-crimson / --jw-crimson-deep out of step with lib/palette.ts CRIMSON");
if (!/export const ACTION = \{ fill: CRIMSON\.fill, hover: CRIMSON\.deep \}/.test(pal)) errs.push("lib/palette.ts: ACTION must be House Crimson (the main action, Plan with James)");
if (!css.includes(`:root { --jw-action: ${C.fill}; --jw-action-deep: ${C.deep}; }`)) errs.push("app/globals.css: :root --jw-action must be House Crimson");
if (H.graphite && !css.includes(`:root { --jw-accent: ${ch(H.graphite)}; --jw-accent-deep: ${H.ink && ch(H.ink)};`)) errs.push("app/globals.css: the general accent (--jw-accent) must be Graphite, deepening to Ink: crimson is kept for its few touches");
if (H.mist && !css.includes(`--jw-ground: ${H.paper}; --jw-rule-fine: ${H.hairline}; --jw-rule: ${H.keyline}; --jw-band-rgb: ${ch(H.mist)}; --jw-band-alt-rgb: ${ch(H.paper)};`)) errs.push("app/globals.css: grounds must be Paper, hairline and keyline rules, Stone Mist bands with a Paper alternate (lib/palette.ts HOUSE)");
const grad = pal.match(/stops: \[([^\]]*)\]/)?.[1].match(/#[0-9A-F]{6}/g) ?? [];
if (grad.join() !== "#1A1816,#2E2B28,#3A1C1F,#5A1F23") errs.push("lib/palette.ts: GRADIENT must be Ink to Garnet (#1A1816, #2E2B28, #3A1C1F, #5A1F23)");
if (!css.includes(`--jw-gradient: linear-gradient(90deg, ${grad.join(", ")})`)) errs.push("app/globals.css: --jw-gradient out of step with lib/palette.ts GRADIENT");
// AA where used
const need = [["stoneText", "paper"], ["stoneText", "mist"], ["graphite", "paper"], ["graphite", "mist"], ["paper", "graphite"], ["paper", "ink"]];
for (const [a, b] of need) if (H[a] && H[b] && ratio(H[a], H[b]) < 4.5) errs.push(`lib/palette.ts: ${a} on ${b} is ${ratio(H[a], H[b]).toFixed(2)}:1, below AA`);
if (ratio(C.fill, H.paper) < 4.5 || ratio(C.fill, H.mist) < 4.5) errs.push("lib/palette.ts: crimson words fall below AA on Paper or Stone Mist");
for (const k of ["paper", "mist", "stone", "stoneText", "graphite", "ink", "keyline", "hairline"]) if (H[k] && chromatic(H[k])) errs.push(`lib/palette.ts: HOUSE.${k} ${H[k]} is not a neutral`);
// the eyebrow and muted text are Warm Stone text
if (!/\.ledger-muted \{ color: #6B635A; \}/.test(css)) errs.push("app/globals.css: .ledger-muted must be Warm Stone text #6B635A (AA)");

// ---------- buttons, chips and pills ----------
const cssNoComments = css.replace(/\/\*[^]*?\*\//g, "");
const btnRules = [...cssNoComments.matchAll(/^[^\n{]*\.ledger-btn[^{]*\{[^}]*\}/gm)].map((m) => m[0]).filter((r) => !/theme-ef/.test(r));
const base = btnRules.find((r) => /^\s*\.ledger-btn, \.ledger-btn-ghost \{/.test(r));
// The button family (James, 2 Nov 2026): the editorial line (base), the Ledger column (main action), the seal (once).
if (!base || !/border-radius: (?:0|2px);/.test(base)) errs.push("app/globals.css: .ledger-btn must be square (border-radius 0 or 2px), never a pill");
if (base && !/Cormorant Garamond[^;]*; font-style: italic;/.test(base)) errs.push("app/globals.css: the editorial line (.ledger-btn) must be Cormorant Garamond italic");
if (!/\.ledger-btn::before, \.ledger-btn-ghost::before \{[^}]*width: 28%; background: #8B2525;/.test(cssNoComments)) errs.push("app/globals.css: the editorial line needs its 1px crimson rule (28% to 100%)");
const col = cssNoComments.match(/\.ledger-btn\.ledger-btn--house, \.ledger-btn\.ledger-btn--solid, a\.ledger-btn\[href\^="\/plan"\], \.ledger-btn\.ledger-btn--primary \{([^}]*)\}/);
if (!col || !/height: 56px;/.test(col[1]) || !/border: 1px solid #1A1816/.test(col[1]) || !/Manrope[^;]*; font-style: normal; font-weight: 600; font-size: 12px;[^}]*letter-spacing: 0\.24em; text-transform: uppercase;/.test(col[1])) errs.push("app/globals.css: the Ledger column (main action: .ledger-btn--house / --solid / to /plan) must be 56px, 1px Ink border, Manrope 12px 600 uppercase 0.24em");
if (!/a\.ledger-btn\[href\^="\/plan"\]::after[^{]*\{[^}]*width: 56px;[^}]*background: var\(--jw-action\)/.test(cssNoComments)) errs.push("app/globals.css: the Ledger column needs its 56px crimson cell (var(--jw-action)) with the white arrow");
if (!/a\.ledger-btn\[href\^="\/plan"\]:is\(:hover, :focus-visible\)::after[^{]*\{ width: 84px; \}/.test(cssNoComments)) errs.push("app/globals.css: the Ledger column cell must widen to 84px on hover and focus");
if (!/\.jw-seal-cta__seal \{[^}]*radial-gradient\([^)]*#A83636[^)]*#8B2525[^)]*#5E1717/.test(cssNoComments)) errs.push("app/globals.css: the seal (.jw-seal-cta) must be the crimson wax seal");
for (const r of btnRules) for (const h of r.match(/#[0-9A-Fa-f]{6}/g) ?? []) if (chromatic(h) && !["#8B2525", "#D7A7AA", "#A83636", "#5E1717"].includes(h.toUpperCase())) errs.push(`app/globals.css: a button rule carries a colour outside the House Standard ${h}: ${r.trim().slice(0, 70)}…`);
if (/\.ledger-btn[^{]*\{[^}]*border-radius: (?:9999|999|50%|1\.?\d*rem)/.test(css)) errs.push("app/globals.css: a button is a pill; squared (2px) only");
if (!/\.house-chip \{[^}]*border-radius: 2px;/.test(css)) errs.push("app/globals.css: .house-chip must be squared (2px)");
if (!/:is\(a, button, input, select, textarea, label, summary\)\.rounded-full/.test(css)) errs.push("app/globals.css: the no-pills rule (rounded-full on interactive elements squared to 2px) is missing");

// ---------- pathways: graphite chips, colour only as a dot ----------
const fills = new Set([...pal.matchAll(/fill: "(#[0-9A-F]{6})", tint: "#FFFFFF"/g)].map((m) => m[1]));
if (fills.size !== 8) errs.push(`lib/palette.ts: expected 8 pathway dot colours (DEEP_SEA) on Paper tints, found ${fills.size}`);
const pw = read("lib/pathways.ts");
for (const m of pw.matchAll(/id: "(PATH-\d\d)"[^]*?accent: "(#\w{6})", text: "(#\w{6})", tint: "(#\w{6})"/g)) {
  const [, id, a, t, ti] = m;
  if (!fills.has(a.toUpperCase())) errs.push(`lib/pathways.ts: ${id} dot ${a} is not one of the eight pathway dot colours (lib/palette.ts DEEP_SEA)`);
  if (t.toUpperCase() !== H.graphite) errs.push(`lib/pathways.ts: ${id} text must be Graphite ${H.graphite} (chips are graphite outlines)`);
  if (ti.toUpperCase() !== H.paper) errs.push(`lib/pathways.ts: ${id} tint must be Paper ${H.paper} (no pathway fills)`);
}
for (const m of css.matchAll(/--jw-path-\d\d(-text|-tint): (#\w{6});/g)) if (m[2].toUpperCase() !== (m[1] === "-text" ? H.graphite : H.paper)) errs.push(`app/globals.css: ${m[0]} must be ${m[1] === "-text" ? "Graphite" : "Paper"}`);

// ---------- stamps (marks, unchanged) ----------
const aq = pal.match(/STAMP_AQUA = \{ onLight: "(#\w{6})", onDark: "(#\w{6})" \}/);
if (!aq || !vol.includes(`const SUN_AQUA = "${aq[1]}", SUN_AQUA_DARK = "${aq[2]}"`)) errs.push("lib/volumes.ts: the On the Horizon sun must equal STAMP_AQUA in lib/palette.ts");
if (/const BRASS|#B08657/i.test(vol)) errs.push("lib/volumes.ts: the brass sun is retired (James, 2 Nov 2026)");

// ---------- river waters (protected): contrast, no earth tones, CSS in step ----------
for (const m of pal.matchAll(/(amazon|nile|river): \{ name: "[^"]+", action: "(#\w{6})", hover: "(#\w{6})", accent: "(#\w{6})", accentDeep: "(#\w{6})", light: "(#\w{6})", card: "(#\w{6})" \}/g)) {
  const [, k, action, hover, accent, , , card] = m;
  for (const [n, h] of [["action", action], ["hover", hover], ["accent", accent]]) {
    if (ratio("#FFFFFF", h) < 4.5) errs.push(`lib/palette.ts: white on ${k} ${n} ${h} is below AA`);
    if (earthy(h)) errs.push(`lib/palette.ts: ${k} ${n} ${h} is a brown, gold or olive`);
  }
  if (!new RegExp(`\\.theme-waters-${k}[^{]*\\{[^}]*--jw-accent-hex: ${accent};[^}]*--jw-card: ${card}; --jw-action: ${action}; --jw-action-deep: ${hover};`).test(css)) errs.push(`app/globals.css: .theme-waters-${k} is out of step with lib/palette.ts WATERS_PALETTE.${k}`);
}

// ---------- retired: they do not come back ----------
const retired = { "#1A4A80;\\s*--jw-action-deep": "the Deep Sea action", "--jw-sea-": "the Deep Sea tokens", "232 243 238": "the Tidewater sea-green band", "#E8F3EE": "the Tidewater sea-green band", "#4D4C27": "Field Olive", "#46452A": "Field Olive", "#F6F4F0": "the parchment panel", "#EFEAE0": "the sand ground", "#F1F8F6": "the Tidewater header wash" };
for (const f of ["app/globals.css", "tailwind.config.ts", ...walk("components").filter((f) => /\.tsx?$/.test(f) && !PROTECTED_DIRS.some((d) => f.startsWith(d)))]) {
  const src = read(f);
  for (const [re, what] of Object.entries(retired)) if (new RegExp(re, "i").test(src)) errs.push(`${f}: ${what} is retired under the House Standard (James, 2 Nov 2026)`);
}
for (const f of ["components/ships/DatesRates.tsx", "components/journey/TripPage.tsx"]) if (/bg-\[#F1E2B8\]/.test(read(f))) errs.push(`${f}: the gold "few left" pill is retired`);

if (warns.length) console.warn("\nHouse Standard palette warnings (another build in flight):\n  " + warns.join("\n  ") + "\n");
if (errs.length) {
  console.error("\nHouse Standard palette check failed (docs/brand-colours.md). lib/palette.ts holds the house tones, lib/volumes.ts the only volume colours.\n  " + errs.join("\n  ") + "\n");
  process.exit(1);
}
console.log("The House Standard: five tones, one accent, one gradient, in step. Volume colours from lib/volumes.ts only. The button family in place, AA.");
