import Image from "next/image";
import Link from "next/link";
import { volumeInk } from "@/lib/volumes";
import { factOf, nightsLabel, priceLine, routeOf, type ShipRecord } from "@/lib/content/ships/types";

// Ship cards for a waters hub: hero, name, nights, guests and the fare from.
export default function NileShipCards({ ships, credit = "A&K Sanctuary" }: { ships: ShipRecord[]; credit?: string }) {
  const ink = volumeInk("voyages");
  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ships.map((s) => {
          const f = priceLine(s);
          const g = factOf(s, /guest/i);
          return (
            <li key={s.slug}>
              <Link href={`/voyages/ships/${s.slug}`} className="group h-full flex flex-col ledger-paper border ledger-border hover:border-crimson/60" style={{ borderTopColor: ink, borderTopWidth: 3 }}>
                <div className="relative aspect-[4/3] bg-paper-card overflow-hidden"><Image src={s.hero.url} alt={s.hero.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" /></div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="ledger-eyebrow" style={{ color: ink }}>{s.type === "dahabiya" ? "Dahabiya" : "Riverboat"} · {s.brandLine}</p>
                  <h3 className="ledger-display text-[22px] mt-1 leading-snug">{s.name}</h3>
                  <p className="mt-1 text-[14px] ledger-muted leading-snug">{routeOf(s)}</p>
                  <dl className="mt-auto pt-4 grid grid-cols-3 gap-2 text-[13.5px] border-t ledger-rule">
                    <div className="pt-3"><dt className="ledger-eyebrow">Nights</dt><dd>{nightsLabel(s).replace(" nights", "")}</dd></div>
                    <div className="pt-3"><dt className="ledger-eyebrow">Guests</dt><dd>{g ?? "To confirm"}</dd></div>
                    <div className="pt-3 text-right"><dt className="ledger-eyebrow">{f.kind === "cruise" ? "From" : f.kind === "journey" ? "Journeys" : f.kind === "tba" ? "New dates" : "Rates"}</dt><dd className="ledger-display ledger-crimson text-[17px]">{f.kind === "request" ? "On request" : f.kind === "tba" ? "Ask James" : f.amount}</dd></div>
                  </dl>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[12px] ledger-muted">Photographs: {credit}. &ldquo;From&rdquo; is the lowest published cruise fare per person, two sharing; &ldquo;Journeys&rdquo; is the lowest fare for a whole A&amp;K land and cruise journey aboard her, not the cruise alone.</p>
    </>
  );
}
