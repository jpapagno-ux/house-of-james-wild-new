import { byMonth, cabinColour, isPackage, undash, whenLabel, type ShipDeparture } from "@/lib/content/ships/types";

// Dates & rates, built from the departures. Two kinds, never mixed:
//  • cruise fares: a sailing, or (A&K) a season band whose one fare covers any
//    sailing that starts in it;
//  • journey fares (priceBasis "package"): the whole A&K land and cruise journey
//    that boards her on that day. Labelled as such, never shown as a cruise fare.
// A table on wide screens (one price column per cabin type), cards on phones.

const usd = (n: number | null | undefined) => (typeof n === "number" && n > 0 ? `US$${n.toLocaleString("en-US")}` : "·");
const FULL = /full|sold/i;
function pill(d: ShipDeparture) {
  const left = d.cabinsLeft ? Object.values(d.cabinsLeft).reduce((a, b) => a + (b || 0), 0) : null;
  const s = d.status ?? "";
  if (FULL.test(s) || left === 0) return { label: "Full", full: true, cls: "bg-ink/10 text-ink/60 line-through decoration-ink/30" };
  if (/call/i.test(d.note ?? "")) return { label: "Ask us", full: false, cls: "border ledger-border text-ink/70" };
  if (/few|left|limited/i.test(s) || (left != null && left <= 3)) return { label: left != null ? `${left} cabin${left === 1 ? "" : "s"} left` : "Few left", full: false, cls: "bg-[#F1E2B8] text-[#5E3F22]" };
  if (/open|available/i.test(s) || left != null) return { label: "Open", full: false, cls: "bg-[#DCE8DF] text-[#25543B]" };
  return { label: "Ask us", full: false, cls: "border ledger-border text-ink/70" };
}

export default function DatesRates({ ship, types, cabins, departures, note, title, children }: { ship: string; types: string[]; cabins: string[]; departures: ShipDeparture[]; note?: string; title?: string; children?: React.ReactNode }) {
  const dot = (t: string) => <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle" style={{ background: cabinColour(cabins, t) }} aria-hidden="true" />;
  if (!departures.length) return null;
  const months = byMonth(departures);
  const journeys = departures.every(isPackage);
  const bands = departures.some((d) => d.dateTo);
  const cols = types.filter((t) => departures.some((d) => typeof d.prices[t] === "number"));
  const what = (d: ShipDeparture) => (journeys ? d.package?.name ?? d.itinerary : d.itinerary);
  const plan = (d: ShipDeparture) => `/plan?trip=${encodeURIComponent(`${what(d)}, ${ship}`)}&date=${encodeURIComponent(d.dateTo ? `${d.date} to ${d.dateTo}` : d.date)}${pill(d).full ? "&waitlist=1" : ""}`;
  // Columns that would only repeat themselves step aside: one shared itinerary goes in the title line,
  // and the Space column shows only when the operator publishes availability.
  const oneItin = !journeys && new Set(departures.map((d) => `${d.itinerary}|${d.direction}`)).size === 1;
  const space = departures.some((d) => d.status || d.cabinsLeft || /call/i.test(d.note ?? ""));
  const head = journeys ? "Boards" : bands ? "Season" : "Date";
  const sub = (d: ShipDeparture) => (journeys ? `${d.package?.days ? `${d.package.days}-day journey · ` : ""}${d.direction} aboard` : d.season ? undash(d.season) : null);
  return (
    <div className="mt-8">
      {title && <h3 className="ledger-display text-[22px] md:text-[24px]">{title}</h3>}
      {oneItin && <p className="mt-1 text-[14px] ledger-muted">Every fare: {departures[0].itinerary}{/either/i.test(departures[0].direction) ? ", either direction" : ""}.</p>}
      {/* wide screens */}
      <div className="hidden md:block mt-4 overflow-x-auto border ledger-border">
        <table className="w-full text-[14px] border-collapse">
          <caption className="sr-only">{ship}: {journeys ? "A&K journeys that board her, fares per person for the whole journey" : "fares per person by cabin type"}</caption>
          <thead>
            <tr className="bg-paper-card text-left align-bottom">
              <th scope="col" className="ledger-eyebrow px-3 py-3 font-normal">{head}</th>
              {!oneItin && <th scope="col" className="ledger-eyebrow px-3 py-3 font-normal">{journeys ? "A&K journey" : "Itinerary"}</th>}
              {cols.map((t) => <th key={t} scope="col" className="ledger-eyebrow px-3 py-3 font-normal text-right">{dot(t)}{t}</th>)}
              {space && <th scope="col" className="ledger-eyebrow px-3 py-3 font-normal">Space</th>}
              <th scope="col" className="px-3 py-3"><span className="sr-only">Plan</span></th>
            </tr>
          </thead>
          {months.map(([m, rows]) => (
            <tbody key={m}>
              <tr><th colSpan={cols.length + 2 + (oneItin ? 0 : 1) + (space ? 1 : 0)} scope="colgroup" className="text-left ledger-display text-[18px] font-normal px-3 pt-5 pb-2 border-t ledger-rule">{m}</th></tr>
              {rows.map((d) => {
                const p = pill(d);
                return (
                  <tr key={`${d.date}-${what(d)}`} className="border-t ledger-border align-top">
                    <td className="px-3 py-3 whitespace-nowrap">{whenLabel(d)}{!journeys && sub(d) && <span className="block text-[12px] ledger-muted whitespace-normal">{sub(d)}</span>}</td>
                    {!oneItin && <td className="px-3 py-3 min-w-[11rem]">{journeys ? what(d) : d.direction}<span className="block text-[12px] ledger-muted">{journeys ? sub(d) : d.itinerary}</span></td>}
                    {cols.map((t) => <td key={t} className="px-3 py-3 text-right whitespace-nowrap">{usd(d.prices[t])}</td>)}
                    {space && <td className="px-3 py-3"><span className={`text-[11.5px] px-2 py-0.5 whitespace-nowrap ${p.cls}`}>{p.label}</span></td>}
                    <td className="px-3 py-3 text-right"><a href={plan(d)} className="ledger-btn-ghost whitespace-nowrap">{p.full ? "Waitlist" : journeys ? "Ask about it" : "Hold a cabin"}</a></td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>

      {/* phones: a card per row */}
      <div className="md:hidden mt-4 space-y-6">
        {months.map(([m, rows]) => (
          <div key={m}>
            <h4 className="ledger-display text-[19px] border-b ledger-rule pb-1">{m}</h4>
            <ul className="mt-3 space-y-3">
              {rows.map((d) => {
                const p = pill(d);
                return (
                  <li key={`${d.date}-${what(d)}`} className="border ledger-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0"><span className="ledger-display text-[18px] block">{journeys ? `Boards ${whenLabel(d)}` : whenLabel(d)}</span><span className="text-[13.5px] ledger-muted">{journeys ? what(d) : [sub(d), oneItin ? null : d.direction].filter(Boolean).join(" · ")}</span></p>
                      {space && <span className={`text-[11px] px-2 py-0.5 whitespace-nowrap shrink-0 ${p.cls}`}>{p.label}</span>}
                    </div>
                    <dl className="mt-3 border-t ledger-rule text-[14px]">
                      {cols.filter((t) => typeof d.prices[t] === "number").map((t) => <div key={t} className="flex justify-between gap-3 py-1.5 border-b ledger-rule last:border-0"><dt className="ledger-muted">{dot(t)}{t}</dt><dd className="whitespace-nowrap">{usd(d.prices[t])}</dd></div>)}
                    </dl>
                    <a href={plan(d)} className="mt-2 inline-flex items-center min-h-[44px] ledger-btn-ghost">{p.full ? "Waitlist" : journeys ? "Ask about it" : "Hold a cabin"}</a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12.5px] ledger-muted max-w-3xl">
        {journeys ? "Fares are per person, two sharing, for the whole A&K land and cruise journey, not the cruise alone; the date is the day you board. " : bands ? "One fare covers any sailing that starts in the season. " : ""}
        {note} Availability is confirmed live when you ask.
      </p>
      {children}
    </div>
  );
}
