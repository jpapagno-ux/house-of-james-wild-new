import TimelessStamp from "@/components/ships/TimelessStamp";
import { timelessVoyageFor, type TimelessVoyage } from "@/lib/content/timeless-voyages";
import Image from "next/image";
import Link from "next/link";
import { volumeInk } from "@/lib/volumes";
import { PathwayChips } from "@/components/pathways/Pathway";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { VOYAGE_PATHWAYS_ON } from "@/lib/content/ships/flags";
import type { ShipCardData } from "@/lib/content/ships/cards";
import { EFStamp } from "@/components/exceptional-few/EFBadge";
import { efForHref } from "@/lib/content/exceptional-few";

// The one ship card (voyages audit, 1 Nov 2026: one card style on every Voyages page).
// Kind and operator, name, tagline, nights, guests and the fare from; pathway chips when the
// Voyages pathways are on. A vessel without her ship page yet opens her filed Ledger record
// and says so.
export default function ShipCard({ c, sister = false, timeless }: { c: ShipCardData; sister?: boolean; /** A Timeless Voyages row to stamp the card with (the collection page and its preview). */ timeless?: TimelessVoyage }) {
  const ink = volumeInk("voyages");
  return (
    <article className="group h-full flex flex-col ledger-paper border ledger-border hover:border-crimson/60 relative" style={{ borderTopColor: ink, borderTopWidth: 3 }}>
      <div className="relative aspect-[4/3] bg-paper-card overflow-hidden">
        {c.image && <Image src={c.image.url} alt={c.image.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />}
        {(() => { const ef = efForHref(c.href); return ef ? <EFStamp no={ef.collectionNumber} size={104} rotate={-7} onPhoto className="absolute right-2 bottom-2 pointer-events-none" /> : null; })()}
        {(() => { const tv = !efForHref(c.href) ? (timeless ?? timelessVoyageFor(c.slug)) : null; return tv?.stamp ? <TimelessStamp tv={tv} shipName={c.name} size={92} rotate={-6} ink="#F4EFE6" backing className="absolute right-2 bottom-2 pointer-events-none" /> : null; })()}
        {!c.page && <span className="absolute top-3 left-3 bg-paper/95 font-mono text-[11px] px-2 py-0.5">Ship page to follow</span>}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="ledger-eyebrow" style={{ color: ink }}>{c.eyebrow}</p>
        <h3 className="ledger-display text-[22px] mt-1 leading-snug"><Link href={c.href} className="after:absolute after:inset-0 after:content-['']">{c.name}</Link></h3>
        {c.line && <p className="mt-1 text-[14px] ledger-muted leading-snug line-clamp-3">{c.line}</p>}
        {VOYAGE_PATHWAYS_ON && c.pathway && <div className="mt-3 relative z-10"><PathwayChips primary={c.pathway.primary} secondary={c.pathway.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}
        {(c.facts.length > 0 || c.price) && (
          <dl className="mt-auto pt-4 grid grid-cols-3 gap-2 text-[13.5px] border-t ledger-rule">
            {c.facts.map(([k, v]) => <div key={k} className="pt-3 min-w-0"><dt className="ledger-eyebrow">{k}</dt><dd>{v}</dd></div>)}
            {c.price && <div className="pt-3 text-right col-start-3"><dt className="ledger-eyebrow">{sister && c.price.label === "From" ? "Sister from" : c.price.label}</dt><dd className="ledger-display ledger-crimson text-[17px] whitespace-nowrap">{c.price.amount}</dd></div>}
          </dl>
        )}
      </div>
    </article>
  );
}

/** A grid of ship cards with the photo credits beneath. */
export function ShipGrid({ cards }: { cards: ShipCardData[] }) {
  const credits = [...new Set(cards.map((c) => c.credit).filter(Boolean))];
  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cards.map((c) => <li key={c.slug}><ShipCard c={c} /></li>)}</ul>
      <p className="mt-3 text-[12px] ledger-muted">{credits.length ? `Photographs: ${credits.join(", ")}. ` : ""}&ldquo;From&rdquo; is the lowest published fare per person, two sharing, for the cruise or voyage.{cards.some((c) => c.price?.label === "Suite from") ? " \u201cSuite from\u201d is the lowest published fare for the whole suite, for the voyage." : ""}{cards.some((c) => c.price?.label === "Yacht / night") ? " \u201cYacht / night\u201d is the operator's published rate for the whole yacht, a night, plus tax." : ""}</p>
    </>
  );
}
