import Link from "next/link";
import { monthsLabel, seasonLabel, type MonthDeparture } from "@/lib/content/ships/months";
import { undash } from "@/lib/content/ships/types";

// Departures known only by month (lib/content/ships/months.ts): one row per season and voyage with
// the months, how many sailings, and the "from" fares as the operator shows them. Used where the
// operator keeps exact dates in a live booking tool (Antarctica21). When exact sailings are filed
// they show in the shared dates grid instead, and the months they cover leave this list.

const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const STATUS: Record<NonNullable<MonthDeparture["status"]>, { label: string; cls: string }> = {
  "sold-out": { label: "Sold out", cls: "bg-ink/10 text-ink/60" },
  "not-open": { label: "Not yet open for booking", cls: "border ledger-border text-ink/70" },
};

export default function MonthDepartures({ groups, priceName, planHref, note, showItinerary = false }: {
  groups: MonthDeparture[];
  /** The label for a price key (a ship's name, or "From"). */
  priceName: (key: string) => string;
  planHref: (g: MonthDeparture) => string;
  note?: string;
  showItinerary?: boolean;
}) {
  if (!groups.length) return null;
  return (
    <div className="mt-8">
      <ul className="border-t ledger-rule">
        {groups.map((g, i) => {
          const when = monthsLabel(g);
          const st = g.status ? STATUS[g.status] : null;
          const prices = Object.entries(g.prices);
          return (
            <li key={`${g.itinerary ?? ""}-${g.season}-${i}`} className="border-b ledger-rule py-4 grid gap-x-6 gap-y-2 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] items-baseline">
              <div className="min-w-0">
                {showItinerary && g.itinerary && (g.href ? <Link href={g.href} className="ledger-display text-[19px] leading-snug underline-offset-4 hover:underline">{g.itinerary}</Link> : <p className="ledger-display text-[19px] leading-snug">{g.itinerary}</p>)}
                <p className={showItinerary ? "text-[14px]" : "ledger-display text-[19px]"}>{seasonLabel(g.season)}</p>
                <p className="text-[13px] ledger-muted">
                  {[when ?? "Months to be announced", g.count != null ? `${g.count} ${g.count === 1 ? "sailing" : "sailings"}` : null, g.direction ?? null, g.nights ? `${g.nights} nights` : null].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="min-w-0 text-[15px]">
                {prices.length > 0 && <p className="flex flex-wrap gap-x-1">{prices.map(([k, v], j) => <span key={k} className="whitespace-nowrap">{priceName(k)} from <strong className="font-medium ledger-crimson">{usd(v)}</strong>{j < prices.length - 1 && <span className="ledger-muted"> ·</span>}</span>)}</p>}
                {g.priceText && <p>{undash(g.priceText).replace(/\bpp\b/, "per person")}</p>}
                {!prices.length && !g.priceText && <p className="ledger-muted">Fares: ask us</p>}
                {st && <span className={`mt-1.5 inline-block text-[12px] px-2 py-0.5 ${st.cls}`}>{st.label}</span>}
              </div>
              <a href={planHref(g)} className="ledger-btn-ghost inline-flex items-center min-h-[44px] justify-self-start md:justify-self-end whitespace-nowrap">{g.status === "sold-out" ? "Join the waitlist" : "Ask about dates"}</a>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[12.5px] ledger-muted max-w-3xl">{note} Exact dates and cabin availability are confirmed live when you ask.</p>
    </div>
  );
}
