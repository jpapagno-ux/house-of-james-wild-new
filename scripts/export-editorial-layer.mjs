// Exports the Airtable editorial layer to the two JSON files the site reads:
//   Exceptional Few  → lib/content/exceptional-few.json
//   Media Assets     → lib/content/media-assets.json
//   Timeless Voyages → lib/content/timeless-voyages.json (published rows only; added 13 Nov 2026)
// The Stay record itself stays in the Base44 Ledger (scripts/export-stays.py); these
// rows only point at it by Ledger ID. Run: AIRTABLE_TOKEN=pat... node scripts/export-editorial-layer.mjs
// Needs a read-only personal access token scoped to base appI1mRPBsoA1ZOla.
import fs from "node:fs";

const BASE = process.env.AIRTABLE_EDITORIAL_BASE_ID ?? "appI1mRPBsoA1ZOla";
const TOKEN = process.env.AIRTABLE_TOKEN;
if (!TOKEN) { console.error("AIRTABLE_TOKEN is not set"); process.exit(1); }
const today = new Date().toISOString().slice(0, 10);

async function table(name) {
  const out = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(name)}`);
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) throw new Error(`Airtable ${name}: HTTP ${res.status}`);
    const json = await res.json();
    out.push(...json.records.map((r) => r.fields));
    offset = json.offset;
  } while (offset);
  return out;
}
const lines = (s) => (s ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
const paras = (s) => (s ?? "").split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
const list = (s) => (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);
const key = (label) => label.toLowerCase();

const ef = (await table("Exceptional Few")).map((f) => {
  const lineByKey = Object.fromEntries(lines(f.signal_lines).map((l) => { const i = l.indexOf(":"); return [key(l.slice(0, i).trim()), l.slice(i + 1).trim()]; }));
  return {
    // entity_type "vessel" (2 Nov 2026): the row is keyed on vessel_slug, a ships registry slug, not a Ledger ID.
    id: f.exceptional_few_id, entityType: f.entity_type === "vessel" ? "vessel" : "stay",
    stayId: f.stay_id ?? null, staySlug: f.stay_slug ?? null, stayName: f.stay_name ?? null,
    ...(f.entity_type === "vessel" ? { vesselSlug: f.vessel_slug ?? null, vesselName: f.vessel_name ?? null } : {}),
    designationStatus: f.designation_status ?? "proposed", collectionNumber: f.collection_number ?? 0,
    heroLine: f.hero_line ?? null, whyItMadeTheCut: paras(f.why_it_made_the_cut),
    jamesNote: f.james_note ? { text: f.james_note.trim(), where: f.james_note_where ?? "", when: f.james_note_when ?? "" } : null,
    signals: (f.signals ?? []).map((s) => ({ key: key(s), line: lineByKey[key(s)] ?? "" })),
    pathwaysOverride: list(f.pathways_override), worthAnotherNight: f.worth_another_night?.trim() ?? null,
    whoItSuits: lines(f.who_it_suits), whoItMayNotSuit: lines(f.who_it_may_not_suit), continueRefs: list(f.continue_journey_refs),
    selectionDate: f.selection_date ?? null, reviewDate: f.review_date ?? null, publicationStatus: f.publication_status ?? "draft", paletteKey: f.palette_key ?? "default",
  };
}).sort((a, b) => a.collectionNumber - b.collectionNumber);

// Tripwire (Stage 3, H): every stay_id must be a real Ledger ID that exists in the Stay export.
const LEDGER_ID = /^STY-\d{4}-\d{6}$/;
const staySlugs = new Set((JSON.parse(fs.readFileSync("lib/content/stays.json", "utf8")).stays).map((s) => s.ledgerId));
// A vessel row instead needs a vessel_slug that is a ship in lib/content/ships/registry.ts.
const registry = fs.readFileSync("lib/content/ships/registry.ts", "utf8");
const isShip = (slug) => !!slug && registry.includes(`slug: "${slug}"`);
const bad = ef.filter((e) => (e.entityType === "vessel" ? !isShip(e.vesselSlug) : !LEDGER_ID.test(e.stayId ?? "") || !staySlugs.has(e.stayId)));
if (bad.length) {
  const strict = !process.argv.includes("--allow-placeholders");
  console[strict ? "error" : "warn"](`Exceptional Few rows whose stay_id is not a filed Ledger ID (or whose vessel_slug is not a registry ship): ${bad.map((e) => `${e.id} (${e.stayId ?? e.vesselSlug})`).join(", ")}`);
  if (strict) { console.error("Refusing to export. Pass --allow-placeholders for a noindex preview build."); process.exit(1); }
}

const media = (await table("Media Assets")).map((f) => ({
  mediaId: f.media_id, entityId: f.entity_id, entityType: f.entity_type, publicId: f.cloudinary_public_id, role: f.asset_role,
  caption: f.caption ?? undefined, alt: f.alt_text ?? "", credit: f.credit_text ?? "", creditUrl: f.credit_url ?? undefined, photographer: f.photographer ?? undefined,
  rights: f.usage_rights ?? "to_verify", licence: f.licence_source ?? undefined, orientation: f.orientation ?? "landscape", crop: f.preferred_crop ?? undefined, focalPoint: f.focal_point ?? null,
  sort: f.sort_order ?? 0, active: !!f.active, width: f.width ?? undefined, height: f.height ?? undefined,
}));

fs.writeFileSync("lib/content/exceptional-few.json", JSON.stringify({ exportedOn: today, source: `Airtable ${BASE} · Exceptional Few · scripts/export-editorial-layer.mjs`, records: ef }, null, 2) + "\n");
fs.writeFileSync("lib/content/media-assets.json", JSON.stringify({ exportedOn: today, source: `Airtable ${BASE} · Media Assets · scripts/export-editorial-layer.mjs · pixels in Cloudinary jhlnq5h5`, assets: media }, null, 2) + "\n");
// Timeless Voyages (13 Nov 2026): the premium ships collection, keyed on vessel_slug like a vessel EF row. Only
// published rows with approved image rights reach the site; a published row must point at a registry ship.
const refs = (s) => list(s);
const tv = (await table("Timeless Voyages")).filter((f) => f.publication_status === "published" && f.image_rights === "approved").map((f) => ({
  id: f.timeless_voyages_id, vesselSlug: f.vessel_slug ?? null, vesselName: f.vessel_name ?? null, operator: f.operator ?? null,
  collectionNumber: f.collection_number ?? 0, ledgerId: f.ledger_id ?? null, sailingStatus: f.sailing_status ?? "sailing", launchDate: f.launch_date ?? null,
  signatureEdition: !!f.signature_edition, heroLine: f.hero_line ?? null, whyItBelongs: paras(f.why_it_belongs),
  before: refs(f.before_refs), beyond: refs(f.beyond_refs), stamp: f.stamp ?? null,
  // A saving, in the operator's own words and code; hidden once its book-by date passes (lib/dates.ts).
  savings: f.savings_language ? { code: f.savings_code ?? null, text: f.savings_language.trim(), bookBy: f.savings_book_by ?? null, sailBy: f.savings_sail_by ?? null } : null,
})).sort((a, b) => a.collectionNumber - b.collectionNumber);
const badTv = tv.filter((t) => !isShip(t.vesselSlug));
if (badTv.length) { console.error(`Timeless Voyages rows whose vessel_slug is not a registry ship: ${badTv.map((t) => t.id).join(", ")}`); process.exit(1); }
fs.writeFileSync("lib/content/timeless-voyages.json", JSON.stringify({ exportedOn: today, source: `Airtable ${BASE} · Timeless Voyages · scripts/export-editorial-layer.mjs`, records: tv }, null, 2) + "\n");

console.log(`Exceptional Few: ${ef.length} rows · Media Assets: ${media.length} rows · Timeless Voyages: ${tv.length} published`);
