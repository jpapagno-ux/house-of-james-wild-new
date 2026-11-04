import Link from "next/link";
import { currentPublished, undash, type ShipRecord } from "@/lib/content/ships/types";

// The published fare card (James, 2 Nov 2026): fares as the operator publishes them, by year and
// length, once per rate window, in the same rows as the dates grid's fares. Used where the operator
// publishes fares but no dated departures we can read (Royal Galapagos, Galaxy Cruises, Vianatura), so
// each row says "Ask us for dates", never a made-up date. A year drops out once it has passed
// (lib/dates.ts); the whole-yacht price sits beside the per person fares where it is published.

const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;

export default function PublishedFares({ s, planFor, title }: { s: Pick<ShipRecord, "name" | "published" | "publishedNote" | "fareBasis" | "operator">; planFor: (what: string) => string; title?: string }) {
  const years = currentPublished(s);
  if (!years.length) return null;
  return (
    <div className="mt-8">
      {title && <h3 className="ledger-display text-[22px] md:text-[24px] mb-2">{title}</h3>}
      {years.map((y) => (
        <section key={y.year} className="mt-6 first:mt-0" aria-label={`${y.year} fares`}>
          <p className="ledger-eyebrow ledger-crimson">{y.year} fares, as published</p>
          <ul className="mt-2 border-t ledger-rule">
            {y.rows.map((r) => {
              const prices = Object.entries(r.prices);
              return (
                <li key={r.length} className="border-b ledger-rule py-3.5 grid grid-cols-1 md:grid-cols-[13rem_minmax(0,1fr)_auto] gap-x-6 gap-y-1.5 items-baseline">
                  <p className="min-w-0"><span className="ledger-display text-[19px]">{undash(r.length)}</span>{r.note && <span className="block text-[12.5px] ledger-muted">{r.note}</span>}</p>
                  <div className="min-w-0 text-[15px]">
                    <p className="flex flex-wrap gap-x-1">{prices.map(([k, v], i) => <span key={k} className="whitespace-nowrap">{k === "Per person" ? "" : `${k} `}<strong className="font-medium ledger-crimson">{usd(v)}</strong>{i < prices.length - 1 && <span className="ledger-muted"> ·</span>}</span>)}</p>
                    {r.charter ? <p className="text-[13.5px] ledger-muted mt-0.5">Whole yacht <span className="whitespace-nowrap">{usd(r.charter)}</span></p> : null}
                  </div>
                  <Link href={planFor(`${undash(r.length)}, ${y.year}`)} className="ledger-btn-ghost inline-flex items-center min-h-[44px] justify-self-start md:justify-self-end whitespace-nowrap">Ask us for dates</Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="mt-4 text-[12.5px] ledger-muted max-w-3xl">
        Fares {s.fareBasis ?? "per person, as published"} by {s.operator}, cruise only{years.some((y) => y.rows.some((r) => r.charter)) ? "; the whole-yacht price is for the yacht" : ""}. {s.publishedNote ? `${undash(s.publishedNote)} ` : ""}{s.operator} keeps its dated departures in a live booking tool, so James confirms dates, cabins and the fare for yours when you ask.
      </p>
    </div>
  );
}
