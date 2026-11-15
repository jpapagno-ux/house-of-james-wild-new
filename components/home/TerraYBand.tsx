import Link from "next/link";
import Pic from "@/components/opening/Pic";
import { VipStamp } from "@/components/terra-y/Dossier";
import { TY_DOSSIERS, TY_PATH, ty, tyPath, tyUsd } from "@/lib/content/terra-y";

// Homepage: Terra Y and The Far Edge (James, 15 Nov 2026: "link the section to the home page"). One night panel in
// the Polar Chart theme, three dossiers (the Pole, the DC-3 north, the day on the ice), the way into both.
const PICKS = ["south-pole-penguins", "scotland-to-greenland", "antarctica-in-a-day"];

export default function TerraYBand() {
  const picks = PICKS.map((s) => TY_DOSSIERS.find((d) => d.slug === s)!).filter(Boolean);
  return (
    <section id="terra-y" aria-labelledby="ty-band-h" className="theme-terra-y mt-16 md:mt-24 scroll-mt-28">
      <div className="ty-night relative overflow-hidden px-5 py-10 md:px-12 md:py-14">
        <div aria-hidden className="absolute -right-[12%] -top-[20%] w-[70%] max-w-[900px] opacity-[0.16] pointer-events-none" style={{ aspectRatio: "1000 / 847", background: "url(/terra-y-antarctica.svg) center / contain no-repeat" }} />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="ty-mono text-[11px]" style={{ color: "var(--ty-ice)" }}>Terra Y · The Far Edge · VIP expedition dossiers</p>
            <h2 id="ty-band-h" className="ledger-display text-[2rem] md:text-[2.8rem] leading-tight mt-2" style={{ color: "var(--ty-frost)" }}>To the Edge of the Map</h2>
            <p className="mt-3 text-[17px] leading-relaxed" style={{ color: "var(--ty-mist)" }}>A private jet onto the Antarctic ice and on to 90° South, and a 1942 DC-3 across three continents. Nine dossiers James chose, every date and published rate, planned end to end by the house.</p>
          </div>
          <div className="hidden md:block shrink-0"><VipStamp /></div>
        </div>
        <ul className="relative mt-10 flex md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 pb-2">
          {picks.map((d) => (
            <li key={d.slug} className="snap-start shrink-0 w-[78vw] sm:w-[46vw] md:w-auto">
              <Link href={tyPath(d.slug)} className={`group block h-full bg-white ${d.file === "ice" ? "ty-edge-ice" : "ty-edge-dc3"}`}>
                <div className="relative aspect-[4/3] overflow-hidden"><Pic src={ty(d.hero.id, 1200)} alt={d.hero.alt} sizes="(max-width: 768px) 78vw, 33vw" className="object-cover ty-fade-b group-hover:scale-[1.03] transition-transform duration-700" /><span className="absolute left-3 top-3 ty-mono text-[10px] px-2 py-1" style={{ background: "var(--ty-night)", color: "var(--ty-frost)" }}>{d.no}</span></div>
                <div className="p-5 pt-2">
                  <p className="ty-mono text-[10px]" style={{ color: "var(--ty-chart)" }}>{d.operator} · {d.length}</p>
                  <h3 className="ledger-display text-[1.45rem] leading-tight mt-1" style={{ color: "var(--ty-night)" }}>{d.title}</h3>
                  <p className="mt-2 ledger-display text-[1.05rem]" style={{ color: "var(--ty-night)" }}>from {tyUsd(d.from)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <Link href={TY_PATH} className="ty-btn">All nine Terra Y dossiers <span aria-hidden>→</span></Link>
          <Link href="/pathways/the-far-edge" className="ty-btn-line" style={{ color: "var(--ty-frost)" }}>The Far Edge</Link>
        </div>
      </div>
    </section>
  );
}
