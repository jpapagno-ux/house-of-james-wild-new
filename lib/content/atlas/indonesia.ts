// The Indonesia country atlas: every pin read from data already in the repo, never geocoded or guessed.
//   Stays:   the Ledger export (lib/content/stays.json) through staysIn("indonesia"), each at its filed pin.
//   Voyages: each Indonesian yacht at the first filed stop of each of her published itineraries (her record in
//            lib/content/ships/indonesia/*.json, or the shared charter journeys for the charter-only yachts), Aliikai at
//            the first port of her voyage route files (public/maps/routes), and Mutiara Laut at her library pin.
//            Voyages that start at the same filed point share one pin, listed together on its card.
//   Parks, dive sites and volcanoes: lib/content/atlas/indonesia-sources.ts (sources listed there).
// Marks come only from the records: a stay's house_status (lib/ledger/status.ts statusLine) and a ship's own proofLine.
import { pageReady, staysIn, VESSEL_RECORDS } from "@/lib/content/stays";
import { statusLine, type HouseStatus } from "@/lib/ledger/status";
import { recordHref } from "@/lib/ledger/urls";
import { journeysFor } from "@/lib/content/preview/journeys";
import { routeStart } from "@/lib/content/route-files";
import { INDONESIA_SHIPS } from "@/lib/content/ships/indonesia";
import { ALIIKAI_RECORD } from "@/lib/content/ships/aliikai";
import { JOURNEYS, JOURNEY_FLEETS, journeyPath, journeyRouteId } from "@/lib/content/ships/journeys";
import { readRoute, shipRouteId } from "@/lib/content/ships/routes";
import { routeIdFor } from "@/lib/content/route-files";
import { terrainRoute } from "@/components/maps/terrain/routed";
import { cutFor, isAir, legsOf, smoothLine } from "@/components/maps/terrain/geo";
import { vesselHref } from "@/lib/content/vessels";
import { SHIP_REGISTRY } from "@/lib/content/ships/registry";
import { volumeMark } from "@/lib/volumes";
import { PARKS, VOLCANO_SNAPSHOT, VOLCANO_LEVELS, dmsToLatLng } from "./indonesia-sources";
import { ADVISORS, DEFAULT_ADVISOR, advisorsFor } from "@/lib/content/advisors";
import type { AtlasData, AtlasEntry, AtlasPoint, AtlasRoute } from "@/components/maps/terrain/atlas";

const clean = (s: string) => s.replace(/\s*[–—]\s*/g, ", ").replace(/\s+/g, " ").trim();
/** A ship's proofLine, cut to its marks ("Founder vetted · Founder favourite"), never its prose. */
const shipMark = (proof?: string | null) => {
  if (!proof) return null;
  const parts = proof.split(" · ").filter((p) => /^(Founder|Field verified|\d{4}$)/.test(p));
  return parts.length ? parts.join(" · ") : null;
};

export function indonesiaAtlas(): AtlasData & { missing: string[] } {
  const missing: string[] = [];
  const entries: AtlasEntry[] = [];
  const stayInk = volumeMark("stays"), sea = volumeMark("voyages");

  // ---------- stays ----------
  for (const s of staysIn("indonesia")) {
    if (!s.coords) { missing.push(`Stay: ${s.name} (${s.slug}, ${s.ledgerId ?? "no Ledger ID"}): no pin filed`); continue; }
    entries.push({
      id: `stay-${s.slug}`, kind: "stay", name: s.name, ledgerId: s.ledgerId ?? null, lat: s.coords.lat, lng: s.coords.lng, color: stayInk,
      href: pageReady(s) ? recordHref("stay", s.slug) : `/plan?q=${encodeURIComponent(s.name)}`,
      image: s.hero ? { url: s.hero, alt: `${s.name}, Indonesia` } : null,
      mark: statusLine(s.status as HouseStatus | null, s.statusDate, s.slug), sub: s.category ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : "Stay",
    });
  }

  // ---------- voyages ----------
  for (const { data } of INDONESIA_SHIPS) {
    const its = data.itineraries ?? [];
    const charter = JOURNEY_FLEETS.some((f) => f.ships.includes(data.slug));
    for (const it of its) {
      const d = it.days?.[0];
      if (!d || d.lat == null || d.lng == null) { missing.push(`Voyage: ${data.name}, ${it.name}: no stops filed`); continue; }
      entries.push({ id: `ship-${data.slug}-${entries.length}`, kind: "voyage", name: data.name, sub: clean(it.name), lat: d.lat, lng: d.lng, color: sea, href: recordHref("ship", data.slug), image: data.hero ?? null, mark: shipMark(data.proofLine), start: clean(d.place || d.title) });
    }
    // The charter-only yachts (no itineraries of their own) sail the two signature charter journeys.
    if (!its.length && charter) {
      for (const j of JOURNEYS) {
        const d = j.days[0];
        entries.push({ id: `ship-${data.slug}-${j.slug}`, kind: "voyage", name: data.name, sub: clean(j.name), lat: d.lat, lng: d.lng, color: sea, href: recordHref("ship", data.slug), image: data.hero ?? null, mark: shipMark(data.proofLine), start: clean(d.place), alsoHref: journeyPath(j.slug) });
      }
    }
  }
  // Aliikai: her voyage pages, each at its route file's first port.
  for (const j of journeysFor("indonesia").filter((x) => x.kind === "voyage")) {
    const st = routeStart(j.href);
    if (!st) { missing.push(`Voyage: Aliikai, ${j.title}: no route file`); continue; }
    entries.push({ id: `voyage-${j.ledgerId}`, kind: "voyage", name: "Aliikai", ledgerId: VESSEL_RECORDS.find((r) => r.slug === "aliikai-voyage")?.ledgerId ?? null, sub: j.title, lat: st.lat, lng: st.lng, color: sea, href: j.href, image: ALIIKAI_RECORD.hero ?? null, mark: shipMark(ALIIKAI_RECORD.proofLine), start: clean(st.name) });
  }
  // Filed vessels without a ship page or itinerary yet (Mutiara Laut): their library pin.
  for (const v of VESSEL_RECORDS.filter((r) => r.countrySlug === "indonesia")) {
    const covered = v.slug === "aliikai-voyage" || SHIP_REGISTRY.some((r) => r.staySlug === v.slug && r.page);
    if (covered) continue;
    if (!v.coords) { missing.push(`Voyage: ${v.name} (${v.slug}): no pin filed`); continue; }
    entries.push({ id: `vessel-${v.slug}`, kind: "voyage", name: clean(v.name), ledgerId: v.ledgerId ?? null, sub: "Filed in the Ledger", lat: v.coords.lat, lng: v.coords.lng, color: sea, href: vesselHref(v.slug), image: v.hero ? { url: v.hero, alt: `${clean(v.name)}, Indonesia` } : null, mark: statusLine(v.status as HouseStatus | null, v.statusDate, v.slug) });
  }

  // ---------- James's notes and the advisors who carry each record ----------
  // A note is James's own sentence from his Desk (lib/content/advisors.ts), signed with that entry's year, and only on
  // the entries for the place it was written about (Aliikai's Raja Ampat voyages, not her Komodo one). Nothing new is
  // written here; every other place stays empty for James to supply.
  const jamesDesk = ADVISORS.find((a) => a.slug === DEFAULT_ADVISOR)?.desk?.entries ?? [];
  const real = advisorsFor({ countrySlug: "indonesia", regionSlug: "asia" }).advisors.filter((a) => !a.sample);
  for (const e of entries) {
    if (!e.ledgerId) continue;
    const d = jamesDesk.find((x) => x.ledgerId === e.ledgerId);
    const area = d?.place.split(" · ")[0] ?? "";
    if (d?.note && d.james?.year && (e.kind === "stay" || [e.sub, e.start].some((t) => t?.includes(area)))) e.jamesNote = { text: d.note, year: d.james.year };
    const ask = real.filter((a) => (a.desk?.entries ?? []).some((x) => x.ledgerId === e.ledgerId));
    if (ask.length) e.ask = ask.map((a) => ({ first: a.firstName, href: `/plan?advisor=${a.slug}&destination=indonesia&trip=${encodeURIComponent(`${e.name}, ${e.sub}`)}` }));
  }

  // ---------- parks, dive sites, volcanoes ----------
  const parks: AtlasPoint[] = PARKS.map((p) => ({ id: p.id, name: p.name, group: p.site, line: p.line, url: p.url, ...dmsToLatLng(p.dms) }));
  const seen = new Set<string>();
  const dives: AtlasPoint[] = [];
  for (const j of JOURNEYS) for (const f of j.dive) {
    if (seen.has(f.name)) continue;
    seen.add(f.name);
    dives.push({ id: `dive-${f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name: f.name, group: j.region === "komodo" ? "Komodo National Park" : "Raja Ampat", line: `${f.note}. Named by Rascal Voyages; position approximate.`, url: journeyPath(j.slug), lat: f.lat, lng: f.lng });
  }
  const volcanoes: AtlasPoint[] = VOLCANO_SNAPSHOT.volcanoes.map((v) => ({ id: `volcano-${v.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name: v.name, group: VOLCANO_LEVELS[v.level], line: `${VOLCANO_LEVELS[v.level]}${v.since ? ` since ${v.since}` : ""}`, url: v.url, lat: v.lat, lng: v.lng, level: v.level }));

  // ---------- the voyage lines: the shared routed paths (#224), one per distinct route ----------
  const ids = [
    ...JOURNEYS.map((j) => journeyRouteId(j)),
    ...journeysFor("indonesia").filter((x) => x.kind === "voyage").map((j) => routeIdFor(j.href)),
    ...INDONESIA_SHIPS.flatMap(({ data }) => (data.itineraries ?? []).map((it) => shipRouteId(data, it))),
  ].filter((x): x is string => !!x);
  const routes: AtlasRoute[] = [];
  const drawn = new Set<string>();
  for (const id of [...new Set(ids)]) {
    const file = readRoute(id);
    if (!file) continue;
    const r = terrainRoute(String(file.title ?? id), file, []);
    if (r.stops.length < 2) continue;
    const legs = legsOf(r.stops).map((l, i) => (isAir(r.stops[i + 1]) ? l : smoothLine(l, cutFor(r.stops[i + 1]))));
    const sig = JSON.stringify(legs.map((l) => [l[0], l[l.length - 1], l.length]));
    if (drawn.has(sig)) continue; // Rascal and Rebel sail the same lines: drawn once
    drawn.add(sig);
    const lat = r.stops[0].lat;
    routes.push({ id, name: r.name, water: lat > -3 ? "raja-ampat" : lat < -7.5 && r.stops[0].lng > 118 && r.stops[0].lng < 121 ? "komodo" : "other", legs });
  }

  // ---------- the flight: Bali, Komodo by Labuan Bajo, Raja Ampat, each at a pin on this map ----------
  const at = (id: string) => [...entries, ...parks, ...dives].find((e) => e.id === id);
  const flight = [
    { label: "Bali", p: at("stay-como-shambhala-estate") ?? entries.find((e) => e.kind === "stay"), zoom: 9.2 },
    { label: "Labuan Bajo", p: entries.find((e) => e.kind === "voyage" && /Labuan Bajo/.test(e.start ?? "")), zoom: 9.6 },
    { label: "Komodo National Park", p: at("unesco-609"), zoom: 9.8, water: "komodo" as const },
    { label: "Raja Ampat", p: at("dive-cape-kri") ?? entries.find((e) => /Kali Biru|Sorong/.test(e.start ?? "")), zoom: 9.2, water: "raja-ampat" as const },
  ].filter((f) => f.p).map((f) => ({ label: f.label, lat: f.p!.lat, lng: f.p!.lng, zoom: f.zoom, ...("water" in f ? { water: f.water } : {}) }));

  return { routes, entries, parks, dives, volcanoes, flight, volcanoAsOf: VOLCANO_SNAPSHOT.asOf, volcanoSource: VOLCANO_SNAPSHOT.source, missing };
}
