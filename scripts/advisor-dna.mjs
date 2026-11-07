// Prebuild: the Advisor DNA the house approved on the desk (public_advisor_dna(): public fields of active
// advisors; paused or left advisors as hidden), written to lib/content/advisors-desk-dna.json, which
// lib/content/advisors.ts lays over the Library's copy. If the database cannot be reached, the file on
// disk stays as it is and the build goes on: the site never loses its advisors over a network blip.
import { readFileSync, writeFileSync } from "node:fs";

const OUT = new URL("../lib/content/advisors-desk-dna.json", import.meta.url);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const keep = (why) => { console.log(`advisor DNA: kept the file on disk (${why})`); process.exit(0); };
if (!url || !key) keep("no Supabase settings");
if (process.env.ADVISOR_DNA_FROM_DESK === "off") keep("ADVISOR_DNA_FROM_DESK=off");

try {
  const r = await fetch(`${url}/rest/v1/rpc/public_advisor_dna`, { method: "POST", headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" }, body: "{}", signal: AbortSignal.timeout(8000) });
  if (r.status === 404) keep("the database has no public_advisor_dna yet");
  if (!r.ok) keep(`HTTP ${r.status}`);
  const rows = await r.json();
  if (!Array.isArray(rows)) keep("unexpected answer");
  const ok = rows.filter((x) => x && typeof x.slug === "string" && /^[a-z0-9-]+$/.test(x.slug) && typeof x.ledgerId === "string");
  const prev = JSON.parse(readFileSync(OUT, "utf8"));
  writeFileSync(OUT, JSON.stringify({ _note: prev._note, advisors: ok }, null, 1) + "\n");
  console.log(`advisor DNA: ${ok.filter((x) => !x.hidden).length} from the desk, ${ok.filter((x) => x.hidden).length} hidden`);
} catch (e) {
  keep(e instanceof Error ? e.message : String(e));
}
