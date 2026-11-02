import Image from "next/image";
import Link from "next/link";
import { PathwayChip } from "@/components/pathways/Pathway";
import type { Pathway } from "@/lib/pathways";

// Continue the Journey: one restrained closing rail in place of a booking wall.
// Four doors, each optional: the Pathways this place sits on, the journeys that
// pass it, the other Exceptional Few, and the people (Human Compass, the host).
export type JourneyCard = { name: string; line: string; href: string; image?: { url: string; alt: string } | null; eyebrow?: string };

export default function ContinueTheJourney({ pathways, hrefFor, journeys = [], exceptional = [], compassHref = "/compass", hostHref, id = "continue" }: {
  pathways: Pathway[]; hrefFor: (p: Pathway) => string; journeys?: JourneyCard[]; exceptional?: JourneyCard[]; compassHref?: string; hostHref?: string | null; id?: string;
}) {
  return (
    <section id={id} className="mt-16 md:mt-24 border-t ef-rule pt-8 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby={`${id}-heading`}>
      <p className="ledger-eyebrow ef-eyebrow">Continue the journey</p>
      <h2 id={`${id}-heading`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">Where This Leads</h2>
      <div className="mt-8 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3 -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
        {pathways.length > 0 && (
          <div className="snap-start shrink-0 w-[78vw] md:w-auto border ledger-border p-6 flex flex-col">
            <p className="ledger-eyebrow">Wild Pathways</p>
            <p className="ledger-display text-[1.35rem] mt-2 leading-tight">The ways this place belongs to</p>
            <ul className="mt-4 flex flex-wrap gap-2">{pathways.map((p, i) => <li key={p.id}><PathwayChip pathway={p} primary={i === 0} href={hrefFor(p)} /></li>)}</ul>
          </div>
        )}
        {journeys.map((j) => <Card key={j.href} card={j} eyebrow={j.eyebrow ?? "On the road"} />)}
        {exceptional.map((j) => <Card key={j.href} card={j} eyebrow={j.eyebrow ?? "The Exceptional Few"} />)}
        <div className="snap-start shrink-0 w-[78vw] md:w-auto ef-wash border ledger-border p-6 flex flex-col">
          <p className="ledger-eyebrow ef-eyebrow">The people</p>
          <p className="ledger-display text-[1.35rem] mt-2 leading-tight">Not sure it&rsquo;s the one? Ask.</p>
          <p className="mt-2 text-[14.5px] leading-relaxed ledger-muted">The Human Compass reads what you&rsquo;re after and points at the right place, this one or another.</p>
          <div className="mt-auto pt-5 flex flex-wrap gap-3">
            <Link href={compassHref} className="ledger-btn">Human Compass</Link>
            {hostHref && <a href={hostHref} className="ledger-btn-ghost self-center">Meet the host</a>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ card, eyebrow }: { card: JourneyCard; eyebrow: string }) {
  return (
    <Link href={card.href} className="group snap-start shrink-0 w-[78vw] md:w-auto border ledger-border hover:border-crimson/60 flex flex-col">
      {card.image && <span className="relative block aspect-[16/10] border-b ledger-rule bg-paper-card"><Image src={card.image.url} alt={card.image.alt} fill sizes="(min-width: 1024px) 300px, 80vw" className="object-cover" /></span>}
      <span className="block p-6">
        <span className="ledger-eyebrow block">{eyebrow}</span>
        <span className="ledger-display text-[1.35rem] mt-2 block leading-tight group-hover:text-crimson">{card.name}</span>
        <span className="block text-[14px] ledger-muted mt-1">{card.line}</span>
      </span>
    </Link>
  );
}
