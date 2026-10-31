// Cloudinary housekeeping for the whole house (James, 31 Oct 2026: "Go").
// One library serves every site, so rights and filing are recorded on the asset itself:
//   1. fields   — create the structured metadata fields if they are missing:
//                 rights_status, credit, licence_source, allowed_sites, ledger_id.
//   2. folders  — file each loose asset into the folder its public_id already names
//                 (and fix folders with spaces/capitals, e.g. "Indonesia/Dunia Vessel Imagery").
//                 Public IDs and URLs never change, so no page on any site breaks.
//   3. metadata — fill rights_status, credit and licence_source from what each asset already
//                 carries (context: publish, credit, licence; Getty/Shutterstock names; AI prompts).
//                 Only facts already on the asset are written; anything unknown is left blank.
// Nothing is deleted. Default is a dry run that writes a plan; pass --apply to make the changes.
//
// Credentials: CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud> (a GitHub secret, entered by James).
// Usage:  node scripts/cloudinary/housekeeping.mjs [--apply] [--steps fields,folders,metadata]
//         [--from assets.jsonl]  (plan offline from an audit export instead of the live library)
//         [--limit N]             (stop after N updates; the Admin API allows a few hundred an hour)
import fs from "node:fs";
import crypto from "node:crypto";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i < 0 ? d : args[i + 1]; };
const APPLY = args.includes("--apply");
const STEPS = (opt("--steps", "fields,folders,metadata")).split(",");
const LIMIT = Number(opt("--limit", "100000"));
const FROM = opt("--from", null);
const OUT = opt("--out", "cloudinary-housekeeping");

const url = process.env.CLOUDINARY_URL ? new URL(process.env.CLOUDINARY_URL) : null;
const KEY = url ? decodeURIComponent(url.username) : "", SECRET = url ? decodeURIComponent(url.password) : "", CLOUD = url ? url.hostname : "jhlnq5h5";
if (!FROM && !url) { console.error("Set CLOUDINARY_URL, or pass --from <assets.jsonl> for an offline plan."); process.exit(1); }
if (APPLY && !url) { console.error("--apply needs CLOUDINARY_URL."); process.exit(1); }
const ADMIN = `https://api.cloudinary.com/v1_1/${CLOUD}`;
const auth = "Basic " + Buffer.from(`${KEY}:${SECRET}`).toString("base64");

async function admin(method, path, body) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(ADMIN + path, { method, headers: { Authorization: auth, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const left = Number(r.headers.get("x-featureratelimit-remaining") ?? "999");
    if (r.status === 420 || r.status === 429) { throw Object.assign(new Error("Admin API hourly limit reached; run again later to continue (it is safe to re-run)."), { rate: true }); }
    if (r.status >= 500) { await new Promise((s) => setTimeout(s, 1500 * (attempt + 1))); continue; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${JSON.stringify(j).slice(0, 300)}`);
    return { j, left };
  }
  throw new Error(`${method} ${path}: server error`);
}
// Signed Upload API call (not counted against the Admin API's hourly limit).
async function upload(path, params) {
  const p = { ...params, timestamp: Math.floor(Date.now() / 1000) };
  const toSign = Object.keys(p).sort().map((k) => `${k}=${Array.isArray(p[k]) ? p[k].join(",") : p[k]}`).join("&");
  const signature = crypto.createHash("sha1").update(toSign + SECRET).digest("hex");
  const form = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) Array.isArray(v) ? v.forEach((x) => form.append(`${k}[]`, x)) : form.append(k, String(v));
  form.append("api_key", KEY); form.append("signature", signature);
  const r = await fetch(ADMIN + path, { method: "POST", body: form });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`POST ${path}: ${r.status} ${JSON.stringify(j).slice(0, 300)}`);
  return j;
}

// ---- the assets ----
async function allAssets() {
  if (FROM) return fs.readFileSync(FROM, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const out = [];
  for (const rt of ["image", "video", "raw"]) {
    let cursor;
    do {
      const { j } = await admin("POST", "/resources/search", { expression: `resource_type:${rt}`, max_results: 500, next_cursor: cursor, with_field: ["context", "tags", "metadata"] });
      out.push(...(j.resources ?? []));
      cursor = j.next_cursor;
    } while (cursor);
  }
  return out;
}

// ---- 1. fields ----
const FIELDS = [
  { type: "enum", external_id: "rights_status", label: "Rights status", datasource: { values: [["approved", "Approved"], ["hold", "On hold"], ["to_verify", "To verify"]].map(([external_id, value]) => ({ external_id, value })) } },
  { type: "string", external_id: "credit", label: "Credit" },
  { type: "enum", external_id: "licence_source", label: "Licence source", datasource: { values: [["owner", "Owner (James Papagno)"], ["partner", "Partner"], ["getty", "Getty Images"], ["shutterstock", "Shutterstock"], ["ai_generated", "AI generated"], ["unknown", "Unknown"]].map(([external_id, value]) => ({ external_id, value })) } },
  { type: "set", external_id: "allowed_sites", label: "Allowed sites", datasource: { values: [["jameswildco", "James Wild & Co"], ["polarcrossings", "Polar Crossings"], ["gatherings", "Wild & Co Gatherings"], ["expeditionlending", "Expedition Lending"], ["arcterra", "ARC | TERRA XY"], ["islandjim", "Island Jim Charters"]].map(([external_id, value]) => ({ external_id, value })) } },
  { type: "string", external_id: "ledger_id", label: "Ledger ID" },
];

// ---- 2. folders ----
const dir = (pid) => (pid.includes("/") ? pid.slice(0, pid.lastIndexOf("/")) : "");
function folderPlan(a) {
  const want = dir(a.public_id), have = a.asset_folder ?? "";
  if (!want) return null; // a root name (GettyImages-…, AntarcticaSunset): left where it is
  if (!have) return { from: "(none)", to: want };
  // a folder whose name has spaces or capitals while the public_id names a clean path ("Indonesia/Dunia Vessel Imagery/…")
  if (have !== want && /[A-Z ]/.test(have)) return { from: have, to: want };
  return null;
}

// ---- 3. metadata ----
function metaPlan(a) {
  const c = a.context?.custom ?? a.context ?? {};
  const txt = [a.public_id, c.credit, c.licence, c.rights, c.source].filter(Boolean).join(" ");
  const m = {};
  const pub = String(c.publish ?? "");
  if (/^approved$/i.test(pub)) m.rights_status = "approved";
  else if (/^hold/i.test(pub)) m.rights_status = "hold";
  else if (/to verify|\(verify\)|confirm /i.test(`${c.licence ?? ""} ${c.credit ?? ""}`)) m.rights_status = "to_verify";
  if (c.credit && !/^to verify$/i.test(c.credit)) m.credit = String(c.credit).slice(0, 250);
  if (/getty/i.test(txt)) m.licence_source = "getty";
  else if (/shutterstock/i.test(txt)) m.licence_source = "shutterstock";
  else if (c.model_id || c.prompt) m.licence_source = "ai_generated";
  else if (/james papagno|james wild & co\.? personal archive|owner'?s photograph/i.test(`${c.credit ?? ""} ${c.licence ?? ""}`)) m.licence_source = "owner";
  else if (/courtesy|partner imagery|partner image|^©|^photo:/i.test(`${c.licence ?? ""} ${c.credit ?? ""}`.trim()) || (c.credit && !/to verify/i.test(c.credit))) m.licence_source = "partner";
  // James's answers, 31 Oct 2026:
  // • Getty: the licence covers every site, no credit needed.
  if (m.licence_source === "getty") { m.rights_status = "approved"; m.allowed_sites = ["jameswildco", "polarcrossings", "gatherings", "expeditionlending", "arcterra"]; delete m.credit; }
  // • Galápagos partner images ("confirm guide/PDF use"): cleared, we are partners; credit the partner.
  const gp = /^Partner imagery – (.+?) \(confirm guide\/PDF use\)/.exec(String(c.licence ?? ""));
  if (gp) { m.rights_status = "approved"; m.credit = `Photograph courtesy of ${gp[1]}`; m.licence_source = "partner"; m.allowed_sites = ["jameswildco", "expeditionlending"]; }
  // • Shutterstock comps: dropped, never published.
  if (m.licence_source === "shutterstock" || /^dropped$/i.test(pub)) m.rights_status = "hold";
  // • AI images: decorative art (ink, sketches, borders, art) is fine unlabelled; anything that could
  //   pass for a real place, stay or person waits to be labelled "Illustration" or replaced.
  if (m.licence_source === "ai_generated") m.rights_status = /design-effects|sketch|\/art\b|\/art\/|\/ink\b|islands\/art/i.test(a.public_id + " " + (a.asset_folder ?? "")) ? "approved" : "to_verify";
  const have = a.metadata ?? {};
  for (const k of Object.keys(m)) if (JSON.stringify(have[k]) === JSON.stringify(m[k])) delete m[k];
  return Object.keys(m).length ? m : null;
}

// ---- run ----
const report = { mode: APPLY ? "apply" : "dry-run", steps: STEPS, fields: [], folders: [], metadata: {}, errors: [] };
let budget = LIMIT;
try {
  if (STEPS.includes("fields")) {
    const existing = url ? ((await admin("GET", "/metadata_fields")).j.metadata_fields ?? []).map((f) => f.external_id) : [];
    for (const f of FIELDS) {
      if (existing.includes(f.external_id)) { report.fields.push(`${f.external_id}: exists`); continue; }
      if (APPLY) await admin("POST", "/metadata_fields", f);
      report.fields.push(`${f.external_id}: ${APPLY ? "created" : "to create"}`);
    }
  }
  const assets = await allAssets();
  report.assets = assets.length;
  if (STEPS.includes("folders")) {
    for (const a of assets) {
      const p = folderPlan(a); if (!p) continue;
      report.folders.push({ public_id: a.public_id, ...p });
      // Upload API "explicit" (signed) sets the folder without the Admin API's hourly limit.
      if (APPLY && budget-- > 0) await upload(`/${a.resource_type}/explicit`, { public_id: a.public_id, type: a.type ?? "upload", asset_folder: p.to });
    }
  }
  if (STEPS.includes("metadata")) {
    // group assets with identical values: one signed call per group of up to 100 (Upload API, no hourly limit)
    const groups = new Map();
    for (const a of assets) {
      const m = metaPlan(a); if (!m) continue;
      const k = `${a.resource_type}|${Object.entries(m).sort().map(([x, y]) => `${x}=${Array.isArray(y) ? JSON.stringify(y).replace(/([=|])/g, "\\$1") : String(y).replace(/([=|\\"])/g, "\\$1")}`).join("|")}`;
      (groups.get(k) ?? groups.set(k, []).get(k)).push(a.public_id);
    }
    let n = 0;
    for (const [k, ids] of groups) {
      const [rt, meta] = [k.slice(0, k.indexOf("|")), k.slice(k.indexOf("|") + 1)];
      for (const v of meta.split(/(?<!\\)\|/)) { const f = v.split("=")[0] + "=" + v.split("=")[1]?.slice(0, 40); report.metadata[f] = (report.metadata[f] ?? 0) + ids.length; }
      n += ids.length;
      if (APPLY) for (let i = 0; i < ids.length; i += 100) await upload(`/${rt}/metadata`, { metadata: meta, public_ids: ids.slice(i, i + 100) });
    }
    report.metadataAssets = n;
  }
} catch (e) { report.errors.push(String(e.message ?? e)); }

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
const sum = `Cloudinary housekeeping (${report.mode})\nassets: ${report.assets ?? "?"}\nfields: ${report.fields.join("; ")}\nfolders to file: ${report.folders.length}${APPLY ? ` (applied up to ${Math.min(report.folders.length, LIMIT)})` : ""}\nmetadata on ${report.metadataAssets ?? 0} assets:\n` +
  Object.entries(report.metadata).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => `  ${v}\t${k}`).join("\n") + (report.errors.length ? `\nERRORS:\n  ${report.errors.join("\n  ")}` : "") + "\n";
fs.writeFileSync(`${OUT}/summary.txt`, sum);
console.log(sum);
if (report.errors.length && !report.errors.every((e) => /hourly limit/.test(e))) process.exit(1);
