import { notFound } from "next/navigation";
import OperatorVoyagePage from "@/components/ships/OperatorVoyagePage";
import { SEADREAM_ALL, seadreamPath, seadreamVoyage } from "@/lib/content/ships/seadream";
import { buildMetadata } from "@/lib/seo";
import { dayLabel } from "@/lib/content/ships/types";

// /voyages/ships/<yacht>/<voyage>: one page per published voyage (SeaDream Yacht Club first; James, 16 Nov 2026).
// Each carries its own day by day, chart and fares by stateroom and suite; the yacht page lists them by year and month.
export const dynamicParams = false;
export function generateStaticParams() { return SEADREAM_ALL.map((v) => ({ ship: v.ship, voyage: v.slug })); }
type P = { params: Promise<{ ship: string; voyage: string }> };

export async function generateMetadata({ params }: P) {
  const { ship, voyage } = await params;
  const v = seadreamVoyage(ship, voyage);
  if (!v) return {};
  const fare = v.from$ ? ` Fares from US$${v.from$.toLocaleString("en-US")} per person.` : "";
  return {
    ...buildMetadata({
      title: `${v.title}: ${v.shipName}, ${dayLabel(v.date)}, ${v.nights} Nights`,
      description: `${v.title} aboard ${v.shipName}: ${v.nights} nights, ${v.direction}, sailing ${dayLabel(v.date)}. Calls at ${v.calls.slice(0, 6).join(", ")}. Day by day, chart and every stateroom and suite fare.${fare}`.slice(0, 300),
      path: seadreamPath(v), ...(v.hero ? { image: { url: v.hero.url, alt: v.hero.alt } } : {}),
    }),
    keywords: [`${v.title} SeaDream`, `${v.shipName} ${v.regionName.replace(/^The /, "")} ${v.date.slice(0, 4)}`, `SeaDream ${v.calls[0] ?? ""} voyage`, "SeaDream Yacht Club voyages", ...(v.bahamas ? ["SeaDream Bahamas yacht voyage"] : [])],
  };
}

export default async function Page({ params }: P) {
  const { ship, voyage } = await params;
  const v = seadreamVoyage(ship, voyage);
  if (!v) notFound();
  return <OperatorVoyagePage v={v} />;
}
