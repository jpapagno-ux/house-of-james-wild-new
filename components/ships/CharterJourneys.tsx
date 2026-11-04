import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Anchor } from "lucide-react";
import { SectionHead } from "@/components/record/Sections";
import { JOURNEYS, JOURNEY_FLEETS, founderFavourites, journeyPath, type CharterJourney } from "@/lib/content/ships/journeys";
import { registryShip } from "@/lib/content/ships/registry";
import { volumeInk } from "@/lib/volumes";
import { undash } from "@/lib/content/ships/types";

// "Charter the whole yacht" (James, 2 Nov 2026): the two signature charter journeys, Komodo and Flores and
// Raja Ampat and Misool, as cards on the Rascal Voyages and Silolona Sojourns ship pages, their partner
// pages and the Indonesia hub. Each card says how long, from where, the best season and the lowest
// published whole-yacht rate among the yachts that sail it. A Founder Favourite voyage shows only once a
// partner has sent one (lib/content/ships/journeys.ts).
const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10";
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;

/** The lowest published nightly rate for the whole yacht among the given ships (or every journey ship). */
export function journeyFrom(ships: string[]): number | null {
  const r = ships.map((s) => registryShip(s)?.charter?.from).filter((n): n is number => typeof n === "number");
  return r.length ? Math.min(...r) : null;
}

export function JourneyCard({ j, ships, partner }: { j: CharterJourney; ships: string[]; partner?: string }) {
  const ink = volumeInk("voyages");
  const from = journeyFrom(ships);
  const fav = founderFavourites(j.slug, partner)[0];
  return (
    <article className="group relative h-full flex flex-col ledger-paper border ledger-border hover:border-crimson/60" style={{ borderTopColor: ink, borderTopWidth: 3 }}>
      <div className="relative aspect-[16/10] bg-paper-card overflow-hidden">
        <Image src={j.hero.url} alt={j.hero.alt} fill sizes="(min-width: 1024px) 560px, 92vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />
        {fav && <span className="absolute top-3 left-3 bg-paper/95 font-mono text-[11px] px-2 py-0.5">Founder Favourite voyage</span>}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="ledger-eyebrow" style={{ color: ink }}>Charter the whole yacht · {j.nights} nights from {j.embark.split(",")[0]}</p>
        <h3 className="ledger-display text-[24px] mt-1 leading-snug"><Link href={journeyPath(j.slug)} className="after:absolute after:inset-0 after:content-['']">{j.name}</Link></h3>
        <p className="mt-2 text-[15px] ledger-muted leading-relaxed">{undash(j.line)}</p>
        {fav && <p className="mt-3 border-l-2 border-crimson pl-3 text-[14px]"><span className="ledger-eyebrow block">{fav.title}</span>{undash(fav.line)}</p>}
        <dl className="mt-auto pt-4 grid grid-cols-2 gap-3 text-[13.5px] border-t ledger-rule">
          <div className="pt-3 min-w-0"><dt className="ledger-eyebrow">Best season</dt><dd>{j.season.best}</dd></div>
          <div className="pt-3 text-right"><dt className="ledger-eyebrow">{from ? "Yacht from, a night" : "Rates"}</dt><dd className="ledger-display ledger-crimson text-[17px] whitespace-nowrap">{from ? usd(from) : "Ask us"}</dd></div>
        </dl>
      </div>
    </article>
  );
}

/** The strip on a ship page, partner page or hub. `ships` narrows the fleet (a partner's yachts); `ship` names the yacht whose page it is. */
export default function CharterJourneys({ ships, ship, partner, id = "charter-journeys", eyebrow = "Charter the whole yacht", title, intro }: {
  ships?: string[]; ship?: string; partner?: string; id?: string; eyebrow?: string; title?: string; intro?: string;
}) {
  const pool = ships ?? JOURNEY_FLEETS.flatMap((f) => f.ships);
  const fleetNames = JOURNEY_FLEETS.map((f) => f.operator).join(" and ");
  return (
    <section id={id} className={SEC} aria-labelledby={`${id}-h`}>
      <SectionHead eyebrow={eyebrow} title={title ?? (ship ? `Where Could You Take ${ship} for a Week?` : "Which Week Should You Charter in Indonesia?")} icon="wave"
        intro={intro ?? `Two signature charter journeys that ${fleetNames} both sail: a typical week in each, built from the operators' own itineraries, with the best season from Indonesia's tourism board. Every yacht sets the final order with you.`} />
      <ul className="mt-7 grid gap-5 md:grid-cols-2">
        {JOURNEYS.map((j) => <li key={j.slug}><JourneyCard j={j} ships={pool} partner={partner} /></li>)}
      </ul>
      <p className="mt-3 text-[12px] ledger-muted flex flex-wrap gap-x-4 gap-y-1">
        <span>Photographs: {[...new Set(JOURNEYS.map((j) => j.hero.credit))].join(", ")}.</span>
        <span>Rates are the operator&rsquo;s published nightly rate for the whole yacht, plus tax; Silolona Sojourns quotes on request.</span>
      </p>
      <p className="mt-4"><Link href="/plan?trip=Indonesia%20private%20yacht%20charter" className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline" style={{ color: volumeInk("voyages") }}><Anchor className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />Plan a charter with James<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link></p>
    </section>
  );
}
