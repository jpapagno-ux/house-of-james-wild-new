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
type Fly = { from: string; fromName: string; to: string; countries: string[]; title: string; line: string; notes: string[]; focus?: { name: string; line: string; zoomLabel: string; night?: string } };
const FLYOVERS: Record<string, Fly> = {
  "atacama-uyuni": {
    from: "south-america", fromName: "South America", to: "atacama-uyuni", countries: ["chile", "bolivia"],
    title: "The Atacama and the Uyuni Salt Flat",
    line: "From the whole continent to one corner of it: the Atacama in Chile and, across the Andes in Bolivia, the Altiplano lagoons and the Salar de Uyuni, the largest salt flat on Earth. The classic crossing runs from San Pedro de Atacama past Laguna Colorada to Uyuni, high, dry and dark enough for some of the best night skies anywhere.",
    focus: { name: "Salar de Uyuni", line: "The largest salt flat on Earth", zoomLabel: "Zoom to the salt flat", night: "High, dry and dark: one of the great night skies" },
    notes: ["Red ring: the Salar de Uyuni. Dotted line: the classic San Pedro–Uyuni crossing, indicative.", "White: salt flats. Dashed: the Eduardo Avaroa Andean Fauna National Reserve, indicative outline."],
  },
};

const charts = REGION_LIB as unknown as Record<string, ChartData>;
export type FlyoverProps = { from: ChartData; to: ChartData; fromName: string; title: string; line: string; pins: FlyPin[]; unesco: FlyUnesco[]; notes: string[]; focus?: Fly["focus"] };

export function flyover(key: string): FlyoverProps | null {
  const f = FLYOVERS[key];
  const from = f && charts[f.from], to = f && charts[f.to];
  if (!f || !from || !to) return null;
  const B = to.bounds;
  const pins = STAY_PAGES.filter((s) => s.coords && f.countries.includes(s.countrySlug ?? "") && s.coords.lat < B.n && s.coords.lat > B.s && s.coords.lng > B.w && s.coords.lng < B.e)
    .map((s) => ({ name: s.name, href: `/stays/${s.slug}`, lat: s.coords!.lat, lng: s.coords!.lng }));
  const ids = new Set((to.overlays?.unesco ?? []).map((u) => u.id));
  const unesco = UNESCO.filter((u) => ids.has(u.id)).map((u) => ({ id: u.id, name: u.name, year: u.year, url: unescoUrl(u.id) }));
  return { from, to, fromName: f.fromName, title: f.title, line: f.line, pins, unesco, notes: f.notes, focus: f.focus };
}
