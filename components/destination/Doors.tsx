import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass as CompassIcon } from "lucide-react";
import { GUARD_ON, isBuilt } from "@/lib/routes";

// Country doors: one card per country in a region. Used as the main grid on
// a region page and as "Also in [region]" at the foot of each country page.
export type Door = {
  name: string;
  href: string;
  image?: string | null;
  line: string;
  stays: number;
  routes?: number;
  voyages?: number;
  bestMonths?: string;
  compass?: boolean;
  note?: string; // e.g. "Stays being filed"
  imageAlt?: string;
};

// Link guard: a door opens only when its country page is built (always in previews).
function Wrap({ href, children }: { href: string; children: React.ReactNode }) {
  const cls = "group h-full bg-paper border ledger-border flex flex-col";
  return !GUARD_ON || isBuilt(href) ? <Link href={href} className={`${cls} hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)] transition duration-300`}>{children}</Link> : <article className={cls}>{children}</article>;
}

export function DoorCard({ d }: { d: Door }) {
  const counts = [`${d.stays} ${d.stays === 1 ? "stay" : "stays"}`, d.routes ? `${d.routes} ${d.routes === 1 ? "route" : "routes"}` : "", d.voyages ? `${d.voyages} ${d.voyages === 1 ? "voyage" : "voyages"}` : ""].filter(Boolean).join(" · ");
  return (
    <Wrap href={d.href}>
      <div className="relative aspect-[16/10] overflow-hidden border-b ledger-rule bg-paper-card">
        {d.image && <Image src={d.image} alt={d.imageAlt ?? d.name} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <h3 className="absolute bottom-3 left-4 ledger-display text-3xl text-white">{d.name}</h3>
        {d.compass && <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-ink/85 text-paper px-2 py-1 text-[10px] uppercase tracking-[0.16em]"><CompassIcon className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />Compass ready</span>}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="ledger-eyebrow ledger-crimson">{counts}</p>
        <p className="mt-2 text-[15px] leading-relaxed ledger-muted">{d.line}</p>
        {d.bestMonths && <p className="mt-3 text-[13px]"><span className="ledger-eyebrow">Best </span>{d.bestMonths}</p>}
        {d.note && <p className="mt-2 text-[12.5px] ledger-muted italic">{d.note}</p>}
        {!GUARD_ON || isBuilt(d.href) ? <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-[15px] group-hover:gap-2.5 transition-all">Open {d.name} <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span> : <span className="mt-auto pt-4 ledger-eyebrow">Country page coming soon</span>}
      </div>
    </Wrap>
  );
}

export default function Doors({ id = "countries", eyebrow, title, intro, doors }: { id?: string; eyebrow: string; title: string; intro?: string; doors: Door[] }) {
  if (!doors.length) return null;
  return (
    <section id={id} className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-40" aria-labelledby={`${id}-heading`}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="ledger-eyebrow ledger-crimson">{eyebrow}</p>
          <h2 id={`${id}-heading`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">{title}</h2>
        </div>
        {intro && <p className="text-[16px] ledger-muted max-w-md">{intro}</p>}
      </div>
      <ul className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-2 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doors.map((d) => <li key={d.href} className="snap-start shrink-0 w-[84%] sm:w-auto"><DoorCard d={d} /></li>)}
      </ul>
    </section>
  );
}
