import REGION_LIB from "@/lib/charts/regions.json";
import type { ChartData } from "@/components/destination/LedgerChart";
import type { FlyPin, FlyUnesco } from "@/components/destination/ChartFlyover";
import { STAY_PAGES } from "./stays";
import { UNESCO, unescoUrl } from "./unesco";

// Flyovers: a continent chart flying into a close chart (components/destination/ChartFlyover.tsx).
// Each is a few lines: where it starts, where it lands, the words beside it. The close chart's layers
// (salt flats, reserves, route, marks, UNESCO ids) are set in scripts/build-region-charts.cjs.
// First: South America → the Atacama and Uyuni (James, 1 Nov 2026). Next candidates: Santiago → Rapa Nui,
// Ecuador → the Galápagos, Peru → the Sacred Valley, Chile → Torres del Paine.
type Fly = { from: string; fromName: string; to: string; countries: string[]; title: string; line: string; notes: string[]; focus?: { name: string; line: string; zoomLabel: string; night?: string }; nightLine?: string; also?: string[] };
const FLYOVERS: Record<string, Fly> = {
  "atacama-uyuni": {
    from: "south-america", fromName: "South America", to: "atacama-uyuni", countries: ["chile", "bolivia"],
    title: "The Atacama and the Uyuni Salt Flat",
    line: "From the whole continent to one corner of it: the Atacama in Chile and, across the Andes in Bolivia, the Altiplano lagoons and the Salar de Uyuni, the largest salt flat on Earth. The classic crossing runs from San Pedro de Atacama past Laguna Colorada to Uyuni, high, dry and dark enough for some of the best night skies anywhere.",
    also: ["explora-at-uyuni-flats"], // in the filmstrip before its map pin is confirmed
    focus: { name: "Salar de Uyuni", line: "The largest salt flat on Earth", zoomLabel: "Zoom to the salt flat", night: "High, dry and dark: one of the great night skies" },
    notes: ["Red ring: the Salar de Uyuni. Dotted line: the classic San Pedro–Uyuni crossing, indicative.", "White: salt flats. Dashed: the Eduardo Avaroa Andean Fauna National Reserve, indicative outline."],
  },
  // Rapa Nui (1 Nov 2026): the continent, then 3,700 km out across the Pacific to the island, where Rapa Nui
  // National Park (UNESCO, 1995) is marked; the night sky over the Pacific.
  "rapa-nui": {
    from: "south-america", fromName: "South America", to: "rapa-nui", countries: ["chile"],
    title: "Rapa Nui, 3,700 km Out",
    line: "From the whole continent, out across the Pacific: Rapa Nui is a triangle of three volcanoes some 3,700 km west of mainland Chile, five and a half hours by air from Santiago. Hanga Roa and the airport sit on the south-west shore; the quarry, the platforms, the crater at Orongo and the walks are a short drive across the island.",
    notes: ["Rapa Nui National Park covers much of the island; positions approximate."],
    nightLine: "Thousands of kilometres from any city: the southern sky over the Pacific",
  },
  // Portugal (1 Nov 2026): Europe, then the country from the Douro to the Alentejo, with the Douro wine region
  // and Dark Sky Alqueva outlined and Portugal's UNESCO sites in the frame. Shown on both place guides.
  portugal: {
    from: "europe", fromName: "Europe", to: "portugal-close", countries: ["portugal"],
    title: "Portugal, from the Douro to the Alentejo",
    line: "From the whole of Europe to its western edge: the Douro, terraced vineyards along the river east of Porto, and the Alentejo, the wide plains of olives, cork oaks and white villages east of Lisbon, where Dark Sky Alqueva was the first place in the world certified as a Starlight Tourism Destination.",
    notes: ["Dashed: the Douro wine region and Dark Sky Alqueva, indicative outlines; positions approximate."],
    nightLine: "Dark Sky Alqueva: the first Starlight Tourism Destination in the world",
  },
};

const charts = REGION_LIB as unknown as Record<string, ChartData>;
export type FlyFrame = { src: string; alt: string; href: string; name: string; night: boolean };
export type FlyoverProps = { from: ChartData; to: ChartData; fromName: string; title: string; line: string; pins: FlyPin[]; unpinned: { name: string; href: string }[]; unesco: FlyUnesco[]; notes: string[]; focus?: Fly["focus"]; nightLine?: string; frames: FlyFrame[] };

export function flyover(key: string): FlyoverProps | null {
  const f = FLYOVERS[key];
  const from = f && charts[f.from], to = f && charts[f.to];
  if (!f || !from || !to) return null;
  const B = to.bounds;
  const pins = STAY_PAGES.filter((s) => s.coords && f.countries.includes(s.countrySlug ?? "") && s.coords.lat < B.n && s.coords.lat > B.s && s.coords.lng > B.w && s.coords.lng < B.e)
    .map((s) => ({ name: s.name, href: `/stays/${s.slug}`, lat: s.coords!.lat, lng: s.coords!.lng }));
  // The filmstrip under the chart: each pinned stay's own photographs (its gallery first, a few each),
  // with its after-dark frames marked for the night sky. Links go to the stay.
  const frames: FlyFrame[] = STAY_PAGES.filter((s) => pins.some((p) => p.href === `/stays/${s.slug}`) || f.also?.includes(s.slug)).flatMap((s) =>
    [...s.gallery, ...(s.hero ? [s.hero] : [])]
      .filter((u, i, a) => u && a.indexOf(u) === i && !u.endsWith(".")) // a truncated file name never renders
      .slice(0, 4)
      .map((src) => ({ src, alt: `${s.name}, ${f.title.replace(/^The /, "the ")}`, href: `/stays/${s.slug}`, name: s.name, night: /night|dusk|star|firepit/i.test(src) })));
  // Stays on the chart without a confirmed pin yet (Explora Uyuni): listed and linked, not drawn.
  const unpinned = STAY_PAGES.filter((s) => f.also?.includes(s.slug) && !pins.some((p) => p.href === `/stays/${s.slug}`)).map((s) => ({ name: s.name, href: `/stays/${s.slug}` }));
  const ids = new Set((to.overlays?.unesco ?? []).map((u) => u.id));
  const unesco = UNESCO.filter((u) => ids.has(u.id)).map((u) => ({ id: u.id, name: u.name, year: u.year, url: unescoUrl(u.id) }));
  return { from, to, fromName: f.fromName, title: f.title, line: f.line, pins, unesco, notes: f.notes, focus: f.focus, nightLine: f.nightLine, frames, unpinned };
}
