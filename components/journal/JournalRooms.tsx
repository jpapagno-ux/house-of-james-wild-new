import type { ReactNode } from "react";
import SectionHead from "./SectionHead";
import Ticket from "./Ticket";

// JWC-STYLE-01, Stage 4. Rooms as taped tickets, then the rate ledger. Every figure is passed in already formatted
// from the site's rate data (lib/journal-style/stay.ts); a room with no rate prints no price.
export type RoomRow = { name: string; sleeps: number | null; /** null: no rate on file, the ticket prints "Rate on enquiry" */ list: string | null; now: string | null; facts?: string[]; lede?: string | null; features?: string[]; flag?: string; photo?: { url: string; alt: string } | null; /** the ticket's action (the room pick); a plain link to the reserve section when absent */ action?: ReactNode };
type Props = {
  no: string;
  lede?: string | null;
  rooms: RoomRow[];
  /** "per room, per night · before 13% tax" */
  basis: string;
  /** The promotion's name as the rate card prints it (heads the discounted column); null when none. */
  promo?: string | null;
  /** The provenance line under the ledger: dates read for and the day read. */
  footnote: string;
  reserveHref: string;
  aside?: ReactNode;
  /** The dates bar, above the tickets. */
  bar?: ReactNode;
  /** A link into the photograph viewer, under the tickets. */
  photos?: ReactNode;
};

export default function JournalRooms({ no, lede, rooms, basis, promo, footnote, reserveHref, aside, bar, photos }: Props) {
  const priced = rooms.filter((r) => r.list !== null);
  return (
    <section id="rooms" aria-label={priced.length ? "Rooms and rates" : "Rooms"} className="bg-white">
      <SectionHead no={no} label={priced.length ? "Rooms and rates" : "Rooms"} title={priced.length ? "Where You'll Sleep, and What It Costs" : "Where You'll Sleep"} lede={lede} />
      {bar}
      <div className="mt-10 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <Ticket key={r.name} title={r.name} flag={r.flag} lines={r.facts?.length ? [r.facts.join(" · ")] : r.sleeps ? [`Sleeps ${r.sleeps}`] : []}
            extra={(r.lede || r.features?.length) ? <>
              {r.lede && <p className="mt-3 text-[13.5px] leading-relaxed text-graphite">{r.lede}</p>}
              {r.features && r.features.length > 0 && (
                <details className="mt-3 group" open={r.features.length <= 5}>
                  <summary className="cursor-pointer list-none font-mono text-[10px] tracking-[0.2em] uppercase text-house">What this room includes <span aria-hidden className="group-open:hidden">+</span></summary>
                  <ul className="mt-2 space-y-1 text-[13px] leading-snug text-graphite">{r.features.map((f) => <li key={f} className="flex gap-2"><span aria-hidden className="text-house">·</span><span>{f}</span></li>)}</ul>
                </details>
              )}
            </> : undefined}
            photo={r.photo ? { src: r.photo.url, alt: r.photo.alt } : undefined}
            rate={r.list === null ? <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-stone-text">Rate on enquiry</p> : <>
              <p className="font-mono text-[9.5px] tracking-[0.22em] uppercase text-stone-text">From</p>
              <p className="mt-1 flex items-baseline gap-2.5">
                {r.now && <s className="font-mono text-[12px] text-stone-text">{r.list}</s>}
                <span className="font-display text-[26px] leading-none text-house">{r.now ?? r.list}</span>
              </p>
              <p className="mt-1.5 text-[12px] text-stone-text">{basis}</p>
            </>}
            action={r.action ?? <a href={reserveHref} className="house-chip house-chip--primary !px-4 !py-2.5 font-semibold !text-[10.5px] tracking-[0.2em] uppercase">Check dates</a>} />
        ))}
        {aside && <div className="self-center">{aside}</div>}
      </div>
      {photos && <p className="mt-6">{photos}</p>}

      {priced.length > 0 && <div className="mt-14">
        <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-stone-text">The rate ledger · {basis.split(" · ")[0]}</p>
        <div className="mt-3 overflow-x-auto border border-[color:var(--jw-hairline)] border-l-2 border-l-[color:var(--jw-crimson)]">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[color:var(--jw-crimson)] font-mono text-[9.5px] tracking-[0.22em] uppercase text-stone-text">
                <th scope="col" className="px-4 py-3 font-normal w-16">Entry</th>
                <th scope="col" className="px-4 py-3 font-normal">Room</th>
                <th scope="col" className="px-4 py-3 font-normal">Sleeps</th>
                <th scope="col" className="px-4 py-3 font-normal text-right">Rack rate</th>
                {promo && <th scope="col" className="px-4 py-3 font-normal text-right">{promo}</th>}
              </tr>
            </thead>
            <tbody>
              {priced.map((r, i) => (
                <tr key={r.name} className="border-t border-[color:var(--jw-hairline)]">
                  <td className="px-4 py-3.5 font-mono text-[11px] text-house">{String(i + 1).padStart(2, "0")}</td>
                  <th scope="row" className="px-4 py-3.5 font-display font-medium text-[19px] text-graphite">{r.name}</th>
                  <td className="px-4 py-3.5 font-mono text-[12px] text-graphite">{r.sleeps ?? ""}</td>
                  <td className="px-4 py-3.5 font-mono text-[12px] text-graphite text-right">{r.list}</td>
                  {promo && <td className="px-4 py-3.5 font-mono text-[12px] text-house text-right">{r.now ?? ""}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12.5px] text-stone-text">{footnote}</p>
      </div>}
    </section>
  );
}
