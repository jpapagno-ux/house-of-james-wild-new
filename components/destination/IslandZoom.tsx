import Link from "next/link";
import { ZoomIn } from "lucide-react";
import LedgerChart, { type ChartData } from "./LedgerChart";
import REGION_LIB from "@/lib/charts/regions.json";

// A closer chart for island groups too small to read at the region's scale (James, 30 Oct 2026:
// "a zoom into Galápagos, as these smaller islands may need that effect"). The same engraved
// Ledger chart, 1:10m coastlines, with the islands and airports named.
const ZOOMS: Record<string, { chart: string; title: string; line: string; href?: string; cta?: string }> = {
  galapagos: {
    chart: "galapagos",
    title: "The Galápagos, Closer",
    line: "Some 1,000 km off Ecuador's coast. Flights land on Baltra and San Cristóbal; the small ships sail between the islands from there, and the outer islands of Darwin and Wolf are for liveaboard divers.",
  },
};

export default function IslandZoom({ zoom, href, cta, className = "" }: { zoom: keyof typeof ZOOMS; href?: string; cta?: string; className?: string }) {
  const z = ZOOMS[zoom];
  const chart = (REGION_LIB as unknown as Record<string, ChartData>)[z.chart];
  if (!chart) return null;
  return (
    <section className={`mt-10 grid md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] gap-6 md:gap-10 items-center ${className}`} aria-labelledby={`zoom-${zoom}`}>
      <div className="order-2 md:order-1">
        <p className="ledger-eyebrow ledger-crimson inline-flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />The chart, zoomed in</p>
        <h3 id={`zoom-${zoom}`} className="ledger-display text-[1.6rem] md:text-[2rem] mt-2 leading-tight">{z.title}</h3>
        <p className="mt-3 text-[16px] leading-relaxed ledger-muted max-w-xl">{z.line}</p>
        {href && <Link href={href} className="ledger-btn mt-5 inline-flex">{cta ?? "Open the guide"}</Link>}
      </div>
      <figure className="order-1 md:order-2 border-[3px] border-double border-[#2A3D5C] bg-paper shadow-[0_10px_30px_rgba(30,41,57,0.18)]">
        <LedgerChart chart={chart} title={`Ledger chart of ${z.title.replace(/,.*$/, "")}, zoomed in`} />
        <figcaption className="px-3 py-2 border-t ledger-border font-mono text-[10px] tracking-[0.12em] uppercase ledger-muted flex justify-between"><span>Inset · 1:10m</span><span>Positions approximate</span></figcaption>
      </figure>
    </section>
  );
}
