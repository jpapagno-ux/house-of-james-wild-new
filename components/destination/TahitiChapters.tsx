import Link from "next/link";
import { ARCHIPELAGOS, SEASONS, WATER_C, FOUNDER_NOTE } from "@/lib/content/french-polynesia";
import { volumeInk } from "@/lib/volumes";

// Tahiti and her islands (James, 15 to 16 Nov 2026): the founder's note, the five archipelagos as chapters with
// their island pages, and the seasons calendar. Server-rendered; facts from Tahiti Tourisme and Air Tahiti via
// lib/content/french-polynesia.ts.
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function TahitiChapters() {
  const sea = volumeInk("voyages");
  return (
    <>
      <section className="mt-12 md:mt-16 grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-start border-l-2 pl-5 md:pl-8" style={{ borderColor: "var(--jw-action)" }} aria-label="Founder's note">
        <p className="ledger-eyebrow ledger-crimson md:pt-2">{FOUNDER_NOTE.eyebrow}</p>
        <div className="max-w-3xl space-y-3">
          {FOUNDER_NOTE.lines.map((l) => <p key={l} className="ledger-display italic text-[1.2rem] md:text-[1.4rem] leading-snug">{l}</p>)}
        </div>
      </section>

      <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="fp-arch-heading">
        <p className="ledger-eyebrow">Tahiti and her islands · five archipelagos</p>
        <h2 id="fp-arch-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Five Archipelagos, Read as Chapters</h2>
        <p className="mt-3 text-[16px] max-w-3xl ledger-muted">Five groups of islands, hundreds of miles apart, each with its own lagoons, seasons and way of life. Start with the one that fits the trip.</p>
        <ol className="mt-8 divide-y ledger-divide border-y ledger-border">
          {ARCHIPELAGOS.map((a, n) => (
            <li key={a.key} id={`archipelago-${a.key}`} className="grid md:grid-cols-[5rem_1.1fr_1fr] gap-x-8 gap-y-3 py-7 scroll-mt-28">
              <p className="font-mono text-[12px] tracking-[0.25em] uppercase ledger-muted">Chapter {String(n + 1).padStart(2, "0")}</p>
              <div>
                <h3 className="ledger-display text-[1.6rem] md:text-[2rem] leading-tight">{a.name}</h3>
                <p className="mt-2 text-[16px] leading-relaxed">{a.line}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {a.islands.map((i) => i.href
                    ? <li key={i.name}><Link href={i.href} className="house-chip">{i.name}</Link></li>
                    : <li key={i.name} className="text-[14px] ledger-muted italic">{i.name}</li>)}
                </ul>
              </div>
              <ul className="text-[14.5px] leading-relaxed space-y-2 md:border-l md:ledger-border md:pl-6">
                {a.facts.map((f) => <li key={f} className="flex gap-2"><span aria-hidden="true" style={{ color: sea }}>·</span><span>{f}</span></li>)}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="fp-seasons-heading">
        <p className="ledger-eyebrow">When to go · Tahiti Tourisme&rsquo;s own calendar</p>
        <h2 id="fp-seasons-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">The Seasons of Tahiti and Her Islands</h2>
        <p className="mt-3 text-[16px] max-w-3xl ledger-muted">Air between 20°C and 30°C all year; the lagoon never colder than 27°C. Dry from May to October, green and warm from November to April. Darker squares are the best months.</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[14px]">
            <caption className="sr-only">Seasons by month across French Polynesia</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left font-normal ledger-eyebrow pb-2 pr-4 w-[30%]">&nbsp;</th>
                {MONTHS.map((m, i) => <th key={i} scope="col" className="font-mono text-[11px] font-normal ledger-muted pb-2"><abbr title={MONTH_NAMES[i]} className="no-underline">{m}</abbr></th>)}
              </tr>
            </thead>
            <tbody>
              {SEASONS.map((r) => (
                <tr key={r.label} className="border-t ledger-border">
                  <th scope="row" className="text-left font-normal py-3 pr-4 align-top">
                    <span className="ledger-display text-[1.05rem]">{r.label}</span>
                    <span className="block text-[12.5px] ledger-muted leading-snug mt-0.5">{r.note}</span>
                  </th>
                  {r.months.map((v, i) => (
                    <td key={i} className="p-[3px] align-middle">
                      <span title={`${MONTH_NAMES[i]}: ${v === "best" ? "best" : v === "good" ? "good" : "out of season"}`}
                        className="block h-7 w-full" style={{ background: v === "best" ? sea : v === "good" ? `${sea}40` : "transparent", border: v === "off" ? "1px solid #DCD7D0" : "none" }} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t ledger-border">
                <th scope="row" className="text-left font-normal py-3 pr-4"><span className="ledger-display text-[1.05rem]">Lagoon water</span><span className="block text-[12.5px] ledger-muted">Society Islands, °C</span></th>
                {WATER_C.map((t, i) => <td key={i} className="text-center font-mono text-[12px] ledger-muted">{t}°</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
