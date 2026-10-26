import { BedDouble, Users } from "lucide-react";
import Carousel from "@/components/booking/Carousel";
import type { ReserveRoom } from "@/lib/content/reserves";

// Suites inside a camp: photo strip, how many, who sleeps where, the
// registry "from" rate (per person, per night unless the suite is taken
// whole), and a quote link carrying the suite's name.
export default function SuiteCards({ camp, reserve, rooms }: { camp: string; reserve: string; rooms: ReserveRoom[] }) {
  return (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((r) => {
        const whole = /exclusive use/i.test(r.name);
        return (
          <li key={r.name} className="border ledger-border bg-paper flex flex-col">
            {r.photos.length > 0 ? <Carousel photos={r.photos} name={`${camp}, ${r.name}`} /> : <div className="aspect-[4/3] bg-paper-card" />}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="ledger-display text-xl">{r.name}</h3>
              <p className="mt-1.5 text-[13px] ledger-muted flex flex-wrap gap-x-4 gap-y-1">
                {r.quantity ? <span>{r.quantity} {r.quantity === 1 ? "unit" : "on the camp"}</span> : null}
                {r.capacity ? <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />Sleeps {r.capacity}</span> : null}
                {r.beds ? <span className="inline-flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />{r.beds}</span> : null}
              </p>
              <div className="mt-auto pt-4 flex items-end justify-between gap-3">
                {r.from ? <p><span className="ledger-eyebrow">From </span><span className="ledger-display text-2xl ledger-crimson">US${r.from.toLocaleString("en-US")}</span><span className="block text-[12px] ledger-muted">{whole ? "per night as filed · basis confirmed with your quote" : "per person, per night"}</span></p> : <p className="text-[13px] ledger-muted">Rate with your quote</p>}
                <a href={`/plan?trip=${encodeURIComponent(`${reserve} · ${camp} · ${r.name}`)}`} className="ledger-btn shrink-0">Plan this suite</a>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
