// Writes the Offer Ledger as flat JSON rows for the Offer Tracker dashboard.
// Usage: node scripts/offer-ledger.cjs out.json
const path = require("path"); const root = process.cwd();
const jiti = require(path.join(root, "node_modules/jiti"))(root + "/x.js", { alias: { "@": root }, interopDefault: true });
const { OFFER_LEDGER } = jiti("./lib/content/offers/offers.ts");
const SITE = "https://house-of-james-wild-new.vercel.app";
const today = new Date().toISOString().slice(0, 10);
const page = (o) => o.scope === "stay" ? (["bolontiku-hotel", "jicaro-island-lodge"].includes(o.ref) ? `${SITE}/collections/${o.collection}#offer-${o.ref}` : `${SITE}/stays/${o.ref}`) : "";
const rows = OFFER_LEDGER.map((o) => ({
  offer_id: o.id, year: o.year,
  status: o.status === "Live" && o.travel.to < today ? "Ended" : o.status,
  type: o.scope, name: o.name, collection: o.collection || "", country: o.country, program: o.program, headline: o.headline,
  travel_from: o.travel.from, travel_to: o.travel.to, travel: o.travel.text, conditions: o.conditions || "",
  days_left: o.status === "Live" ? Math.max(0, Math.round((new Date(o.travel.to) - new Date(today)) / 864e5)) : null,
  source: o.source, checked: o.checked, on_site: page(o),
}));
require("fs").writeFileSync(process.argv[2], JSON.stringify(rows, null, 1)); console.log(rows.length);
