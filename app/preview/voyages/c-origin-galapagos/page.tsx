import ShipPageBody from "@/components/ships/ShipPageBody";
import HouseOpening from "@/components/opening/HouseOpening";
import { shipBySlug } from "@/lib/content/ships";
import { ORIGIN_C } from "@/lib/content/preview/opening-c";
import { buildMetadata } from "@/lib/seo";
import type { ShipRecord } from "@/lib/content/ships/types";

// Preview C, the house opening, on Ecoventura's Origin (James, 8 Nov 2026). ?grain=1 adds the paper grain. Noindex.
export const metadata = buildMetadata({ title: "Origin, Galapagos · Opening C (preview)", description: "The house opening on a Galapagos expedition yacht.", path: "/preview/voyages/c-origin-galapagos", noindex: true });

const fmt = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function Page({ searchParams }: { searchParams: Promise<{ grain?: string }> }) {
  const grain = (await searchParams).grain === "1";
  const rec = shipBySlug("ecoventura-origin-yacht")?.data as ShipRecord | undefined;
  const today = new Date().toISOString().slice(0, 10);
  const d = rec?.departures?.find((x) => x.date >= today && !/full|sold/i.test(x.status ?? ""));
  const from = d ? Math.min(...Object.values(d.prices).filter((n): n is number => typeof n === "number" && n > 0)) : NaN;
  const next = d ? { date: fmt(d.date), ship: d.itinerary.split(":")[0], from: Number.isFinite(from) ? `US$${from.toLocaleString("en-US")}` : undefined, href: `${ORIGIN_C.planHref}&date=${d.date}` } : null;
  const c = ORIGIN_C;
  return <ShipPageBody slug="ecoventura-origin-yacht" surface={c.palette.day} opening={<HouseOpening {...c} grain={grain} next={next} />} />;
}
