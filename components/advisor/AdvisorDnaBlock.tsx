import Link from "next/link";
import { type Advisor } from "@/lib/content/advisors";
import { PATHWAYS, type PathwayId } from "@/lib/pathways";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { COUNTRIES } from "@/lib/content/countries";
import { STAYS, VESSEL_RECORDS } from "@/lib/content/stays";
import { recordHref } from "@/lib/ledger/urls";
import { GREEN_INK } from "@/lib/content/advisor-desk";

// "What {first} carries" — the advisor's DNA as the Library holds it (Stage 4b, 2 Nov 2026).
// Everything here is what the advisor stated and confirmed on their own DNA page:
// Pathways, the places they know, who they plan for, languages, availability, their
// one line, and their own marks on Ledger records (green ink). Nothing is written for them.

const PARTY: Record<string, string> = { family: "Families", couple: "Couples", friends: "Friends travelling together", solo: "Solo travellers", group: "Larger groups" };
const AVAIL: Record<string, string> = { open: "Taking new journeys", waitlist: "Waitlist", closed: "Not taking new journeys at the moment" };
const countryLabel = (slug: string) => COUNTRIES.find((c) => c.slug === slug);
const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function AdvisorDnaBlock({ a, idBase = "dna" }: { a: Advisor; idBase?: string }) {
  const d = a.dna;
  if (!d) return null;
  const stayOf = new Map([...STAYS, ...VESSEL_RECORDS].filter((s) => s.ledgerId).map((s) => [s.ledgerId as string, s]));
  return (
    <section className="mt-12 border-t ledger-rule pt-8 md:pt-10" aria-labelledby={`${idBase}-heading`}>
      <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>Advisor DNA · {a.ledgerId}</p>
      <h2 id={`${idBase}-heading`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">What {a.firstName} Carries</h2>
      {d.matchNote && <p className="mt-5 ledger-display italic text-[1.35rem] md:text-[1.6rem] leading-snug max-w-3xl">&ldquo;{d.matchNote}&rdquo;</p>}
      <p className="mt-2 text-[13px] ledger-muted">{d.confirmed ? `In ${a.firstName}'s own words, confirmed ${d.confirmed.slice(0, 10)}.` : `As the house reads ${a.firstName}; not yet confirmed by ${a.firstName}.`}</p>

      <div className="mt-8 grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-7">
          {d.pathways.length > 0 && (
            <div>
              <p className="ledger-eyebrow">The journeys {a.firstName} plans</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {d.pathways.map((p) => { const pw = PATHWAYS[p as PathwayId]; return pw ? <li key={p}><Link href={pathwayHref(pw.key)} className="border ledger-border px-2.5 py-1 text-[14px] hover:ledger-crimson">{pw.name}<span className="ledger-muted"> · {pw.setting}</span></Link></li> : null; })}
              </ul>
            </div>
          )}
          {d.countries.length > 0 && (
            <div>
              <p className="ledger-eyebrow">Places {a.firstName} knows</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {d.countries.map((c) => { const k = countryLabel(c); return <li key={c}>{k ? <Link href={`/destinations/${k.region}/${k.slug}`} className="border ledger-border px-2.5 py-1 text-[14px] hover:ledger-crimson">{k.name}</Link> : <span className="border border-dashed ledger-border px-2.5 py-1 text-[14px] ledger-muted">{titleCase(c)}</span>}</li>; })}
              </ul>
            </div>
          )}
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px]">
            {d.partyTypes.length > 0 && <><dt className="ledger-eyebrow !text-[9.5px] pt-1">Plans best for</dt><dd>{d.partyTypes.map((p) => PARTY[p] ?? p).join(", ")}</dd></>}
            {d.languages.length > 0 && <><dt className="ledger-eyebrow !text-[9.5px] pt-1">Languages</dt><dd>{d.languages.join(", ")}</dd></>}
            <dt className="ledger-eyebrow !text-[9.5px] pt-1">Right now</dt><dd>{AVAIL[d.availability] ?? d.availability}</dd>
          </dl>
        </div>
        <div>
          <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>{a.firstName}&rsquo;s own marks</p>
          {d.marks.length === 0 ? (
            <p className="mt-3 text-[15px] ledger-muted leading-relaxed">No first-hand marks on record yet. When {a.firstName} marks a stay, camp or boat as stayed, walked or sailed, it appears here beside James&rsquo;s mark.</p>
          ) : (
            <ul className="mt-3 divide-y ledger-rule border-t ledger-rule">
              {d.marks.map((m) => { const s = stayOf.get(m.ledgerId); return (
                <li key={m.ledgerId} className="py-3 grid gap-0.5">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="ledger-id text-[11px]">{m.ledgerId}</span>
                    <span className="ledger-display text-[17px]">{s ? <Link href={recordHref("stay", s.slug)} className="hover:ledger-crimson">{s.name}</Link> : m.ledgerId}</span>
                    {s?.country && <span className="text-[13px] ledger-muted">{s.country}</span>}
                  </div>
                  <div className="text-[14px]" style={{ color: GREEN_INK }}>{m.mark}{m.when ? `, ${m.when}` : ""}</div>
                  {m.note && <p className="text-[14px] ledger-muted italic">&ldquo;{m.note}&rdquo;</p>}
                </li>
              ); })}
            </ul>
          )}
          <p className="mt-4 text-[12.5px] ledger-muted">Green ink is the advisor&rsquo;s own mark; oxblood is James&rsquo;s. Every line here is stated by {a.firstName} in the house Ledger and dated.</p>
        </div>
      </div>
    </section>
  );
}
