import { Check, Minus, ChevronDown } from "lucide-react";
import Cite from "@/components/ledger/Cite";
import Pic from "@/components/opening/Pic";
import { SectionHead } from "@/components/record/Sections";
import { isPast } from "@/lib/dates";
import { money, type StayRooms } from "@/lib/content/stay-rooms";

// Rooms & rates (James, 10 Nov 2026: "give us a look of each of the room types and a compact, tight way to look at the
// rooms. Maybe accordion style. Also, what's included ... and excluded. Some footnotes. Quotes from James.").
// One row per room type: the name, its facts and its "from" rate on one line; open it for the brand's photograph, what
// the room has and the rate by season. Native <details>, so every row is in the page for search and answer engines.
// Colour comes from the stay's tones (--tone-path), so a safari reads in its earth and a city stay in its pathway.

const IMG = "https://res.cloudinary.com/jhlnq5h5/image/upload/";

export default function RoomTypes({ name, data, quote, eyebrow = "Rooms & rates", title = "Where You'll Sleep" }: {
  name: string; data: StayRooms;
  /** a line of James's own, filed in the Ledger (lib/content/verdicts.ts), never written for him */
  quote?: string | null;
  eyebrow?: string; title?: string;
}) {
  const live = data.seasons.filter((x) => !isPast(x.to));
  const liveKeys = new Set(live.map((x) => x.key));
  const season = (k: string) => data.seasons.find((x) => x.key === k)!;
  const rooms = data.rooms.map((r) => ({ ...r, rates: r.rates.filter((x) => liveKeys.has(x.season)) }));
  if (!rooms.length) return null;
  const path = "var(--tone-path, #2E2B28)";
  return (
    <section id="rooms" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-label={`Rooms and rates at ${name}`}>
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <SectionHead eyebrow={eyebrow} title={title} icon="tree-ring" intro={data.intro} />
        {quote && (
          <figure className="md:max-w-[300px] md:text-right">
            <blockquote className="ledger-display italic text-[1.35rem] leading-snug">&ldquo;{quote.replace(/\s*JW\.?$/, "")}&rdquo;</blockquote>
            <figcaption className="mt-1 text-[11px] tracking-[0.2em] uppercase ledger-muted">James Wild, the Ledger</figcaption>
          </figure>
        )}
      </div>

      <p className="mt-8 flex flex-wrap items-baseline justify-between gap-2 text-[12px] tracking-[0.14em] uppercase ledger-muted">
        <span>{rooms.length} {rooms.length === 1 ? "room type" : "room types"}</span>
        <span>{rooms.some((r) => r.rates.length) ? `Published rates, ${data.basis}` : "Rates on enquiry: James quotes your dates"}</span>
      </p>
      <ul className="mt-3 border-t ledger-rule">
        {rooms.map((r, i) => {
          const from = r.rates.length ? Math.min(...r.rates.map((x) => x.rate)) : null;
          return (
            <li key={r.name} className="border-b ledger-rule">
              <details className="group" open={i === 0}>
                <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center gap-3 md:gap-5 py-3.5 md:py-4 min-h-[64px]">
                  <span aria-hidden="true" className="self-stretch w-[3px] transition-colors" style={{ background: path, opacity: 0.25 }} />
                  {r.image ? (
                    <span className="relative hidden sm:block w-[88px] h-[58px] shrink-0 overflow-hidden bg-mist">
                      <Pic src={IMG + r.image.id} alt="" ratio="3:2" sizes="88px" className="object-cover" />
                    </span>
                  ) : null}
                  <span className="flex-1 min-w-0">
                    <span className="block ledger-display text-[1.2rem] md:text-[1.4rem] leading-snug">{r.name}{r.count && r.count > 1 ? <span className="ml-2 align-middle text-[11px] tracking-[0.12em] ledger-muted font-sans">× {r.count}</span> : null}</span>
                    <span className="block mt-0.5 text-[13.5px] leading-snug ledger-muted line-clamp-2">{r.facts.join(" · ")}</span>
                  </span>
                  {from === null && (
                    <span className="text-right shrink-0 text-[10px] tracking-[0.18em] uppercase ledger-muted">Rate on<br />enquiry</span>
                  )}
                  {from !== null && (
                    <span className="text-right shrink-0">
                      <span className="block text-[10px] tracking-[0.18em] uppercase ledger-muted">From</span>
                      <span className="block ledger-display text-[1.15rem] md:text-[1.3rem] tabular-nums" style={{ color: path }}>{money(data.currency, from)}</span>
                    </span>
                  )}
                  <ChevronDown aria-hidden="true" className="w-5 h-5 shrink-0 transition-transform duration-300 group-open:rotate-180" strokeWidth={1.4} />
                </summary>
                <div className="pb-6 md:pb-8 md:pl-[20px] grid gap-5 md:gap-8 md:grid-cols-[1.35fr_1fr]">
                  {r.image ? (
                    <figure className="relative aspect-[3/2] overflow-hidden bg-mist">
                      <Pic src={IMG + r.image.id} alt={r.image.alt} ratio="3:2" sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
                    </figure>
                  ) : null}
                  <div className={r.image ? "" : "md:col-span-2 max-w-2xl"}>
                    <ul className="grid gap-2">
                      {r.features.map((f) => <li key={f} className="flex gap-2.5 text-[15px] leading-relaxed"><Check aria-hidden="true" className="w-4 h-4 mt-1 shrink-0" style={{ color: path }} strokeWidth={1.6} />{f}</li>)}
                    </ul>
                    {r.rates.length > 0 && (
                      <table className="mt-5 w-full text-[14px]">
                        <caption className="sr-only">{`${r.name} rates by season`}</caption>
                        <thead><tr className="text-left text-[10px] tracking-[0.18em] uppercase ledger-muted"><th className="font-normal pb-1.5">Season</th><th className="font-normal pb-1.5 text-right">{r.basis ?? data.basis}</th></tr></thead>
                        <tbody>
                          {r.rates.slice(0, 4).map((x) => (
                            <tr key={x.season} className="border-t ledger-border align-top">
                              <td className="py-2 pr-3"><span className="block">{season(x.season).label}</span><span className="block text-[12.5px] ledger-muted">{season(x.season).dates}</span></td>
                              <td className="py-2 text-right tabular-nums"><span className="block ledger-display text-[1.05rem]">{money(data.currency, x.rate)}</span>{x.extra && <span className="block text-[12px] ledger-muted">{x.extra}</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {r.rates.length > 4 && (
                      <details className="mt-1 group/more">
                        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden py-2 text-[12px] tracking-[0.16em] uppercase underline underline-offset-4" style={{ color: path }}>Later seasons ({r.rates.length - 4})</summary>
                        <table className="w-full text-[14px]"><tbody>
                          {r.rates.slice(4).map((x) => (
                            <tr key={x.season} className="border-t ledger-border align-top">
                              <td className="py-2 pr-3"><span className="block">{season(x.season).label}</span><span className="block text-[12.5px] ledger-muted">{season(x.season).dates}</span></td>
                              <td className="py-2 text-right tabular-nums"><span className="block ledger-display text-[1.05rem]">{money(data.currency, x.rate)}</span>{x.extra && <span className="block text-[12px] ledger-muted">{x.extra}</span>}</td>
                            </tr>
                          ))}
                        </tbody></table>
                      </details>
                    )}
                    {r.note && <p className="mt-3 text-[13.5px] ledger-muted">{r.note}</p>}
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="border ledger-border p-5 md:p-6 bg-white/60">
          <p className="ledger-eyebrow">Included</p>
          <ul className="mt-3 grid gap-2">{data.included.map((x) => <li key={x} className="flex gap-2.5 text-[15px]"><Check aria-hidden="true" className="w-4 h-4 mt-1 shrink-0" style={{ color: path }} strokeWidth={1.6} />{x}</li>)}</ul>
        </div>
        <div className="border ledger-border p-5 md:p-6 bg-white/60">
          <p className="ledger-eyebrow">Not included</p>
          <ul className="mt-3 grid gap-2">{data.excluded.map((x) => <li key={x} className="flex gap-2.5 text-[15px]"><Minus aria-hidden="true" className="w-4 h-4 mt-1 shrink-0 ledger-muted" strokeWidth={1.6} />{x}</li>)}</ul>
        </div>
      </div>

      <ol className="mt-6 grid gap-1.5 text-[12.5px] leading-relaxed ledger-muted list-none">
        {data.notes.map((n, i) => <li key={n} className="flex gap-2"><span className="tabular-nums shrink-0" style={{ color: path }}>{i + 1}.</span><span>{n}</span></li>)}
        <li className="flex gap-2"><span className="shrink-0" aria-hidden="true">·</span><span>Source: <Cite href={data.source.url}>{data.source.label}</Cite>. {data.credit}.</span></li>
      </ol>
    </section>
  );
}
