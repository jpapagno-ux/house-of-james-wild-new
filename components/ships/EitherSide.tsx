import Link from "next/link";
import { RecordCard } from "@/components/hub/Hub";
import { SectionHead } from "@/components/record/Sections";
import { stayBySlug } from "@/lib/content/stays";
import { isBuilt } from "@/lib/routes";
import { statusLine, type HouseStatus } from "@/lib/ledger/status";
import { eitherSideFor, type EitherSide as Data } from "@/lib/content/ships/either-side";
import { Glyph, IconLegend, type GlyphKey } from "./VoyageGlyphs";

// "Either side of the voyage" (James, 9 Nov 2026, approved with "yes to the house stays vs the cruise ship one"):
// Arrive, Sail, Stay on as one line of three steps, the house's own stays for each, the nights worth adding, and the
// operator's own package set beside the house's way. Data: lib/content/ships/either-side.ts. Stays come from the
// library and drop out when not released; a band with no stays left renders nothing.

type Card = { key: string; name: string; id: string; line: string; image: { url: string; alt: string }; href: string; eyebrow?: string };

function card(slug: string): Card | null {
  const s = stayBySlug(slug);
  if (!s?.hero) return null;
  const mark = statusLine(s.status as HouseStatus, s.statusDate, s.slug);
  return { key: s.slug, name: s.name, id: s.ledgerId ?? "", line: s.tagline ?? "", image: { url: s.hero, alt: s.name }, href: `/stays/${s.slug}`, eyebrow: mark ?? s.country ?? undefined };
}
const cards = (slugs: string[]) => slugs.map(card).filter((c): c is Card => !!c);
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;

function Step({ n, k, title, nights, line }: { n: number; k: GlyphKey; title: string; nights: string; line: string }) {
  return (
    <li className="relative pl-14 md:pl-0 md:pt-16">
      <span aria-hidden="true" className="absolute left-0 top-0 md:left-0 w-11 h-11 rounded-full border ledger-border bg-[var(--tone-day,#fff)] flex items-center justify-center jw-glyph"><Glyph k={k} size={22} /></span>
      <p className="ledger-eyebrow">{String(n).padStart(2, "0")} · {nights}</p>
      <h3 className="mt-1 ledger-display text-[23px] leading-snug">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed ledger-muted">{line}</p>
    </li>
  );
}

function Group({ k, eyebrow, items }: { k: GlyphKey; eyebrow: string; items: Card[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-10">
      <p className="flex items-center gap-2 ledger-eyebrow"><Glyph k={k} size={18} className="jw-glyph" />{eyebrow}</p>
      <ul className={`mt-4 grid gap-5 sm:grid-cols-2 ${items.length > 2 ? "lg:grid-cols-4" : ""}`}>
        {items.map(({ key, ...c }) => <li key={key}><RecordCard {...c} volume="stays" /></li>)}
      </ul>
    </div>
  );
}

export function EitherSideBand({ data, ship, voyage }: { data: Data; ship: string; voyage: string }) {
  const arrive = cards(data.arrive.stays);
  const stayOn = cards(data.stayOn.stays);
  if (!arrive.length && !stayOn.length) return null;
  const plan = `/plan?trip=${encodeURIComponent(`${data.planTrip}: ${ship}`)}`;
  const op = data.operator;
  const opHotels = op ? op.hotels.map((h) => stayBySlug(h)).filter((s): s is NonNullable<typeof s> => !!s) : [];
  return (
    <section id="either-side" aria-labelledby="either-side-h" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10">
      <SectionHead eyebrow="Either side of the voyage" title={`What Should You Add Before and After ${ship}?`} icon="sun"
        intro={`The ship is the middle of the journey. Arrive in ${data.gateway} a night early, sail ${voyage}, then stay on in the islands: the house's stays for each step, every one from places James has stayed in, vetted or verified.`} />

      <ol className="relative mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
        <span aria-hidden="true" className="hidden md:block absolute left-[22px] right-[calc(33%-22px)] top-[22px] border-t border-dashed ledger-rule" />
        <span aria-hidden="true" className="md:hidden absolute left-[21px] top-11 bottom-4 border-l border-dashed ledger-rule" />
        <Step n={1} k="arrive" title={data.arrive.title} nights={data.arrive.nights} line={data.arrive.line} />
        <Step n={2} k="sail" title={`Sail ${voyage}`} nights="The voyage" line={`Aboard ${ship}, as the day by day above. Dates and fares are in Dates & rates.`} />
        <Step n={3} k="stay-on" title={data.stayOn.title} nights={data.stayOn.nights} line={data.stayOn.line} />
      </ol>

      <Group k="arrive" eyebrow={`01 · Arrive · ${data.gateway}`} items={arrive} />
      <Group k="stay-on" eyebrow="03 · Stay on" items={stayOn} />

      {data.addNights.length > 0 && (
        <div className="mt-12">
          <p className="flex items-center gap-2 ledger-eyebrow"><Glyph k="add-night" size={18} className="jw-glyph" />Add a night</p>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {data.addNights.map((a) => {
              const s = a.stay ? stayBySlug(a.stay) : null;
              const live = s && isBuilt(`/stays/${s.slug}`);
              return (
                <li key={a.label} className="border ledger-border p-5 flex flex-col bg-white/60">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-2"><span className="house-chip whitespace-nowrap !py-0.5 !text-[10.5px]"><Glyph k="add-night" size={14} />Add a night</span>{a.founder && <span className="inline-flex items-center gap-1 text-[11.5px] tracking-[0.06em] ledger-crimson"><Glyph k="founder" size={15} />{a.founder}</span>}</p>
                  <h3 className="mt-3 ledger-display text-[20px] leading-snug">{a.label}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed ledger-muted flex-1">{a.line}</p>
                  {live && <Link href={`/stays/${s!.slug}`} className="mt-3 self-start inline-flex items-center min-h-[44px] ledger-btn-ghost">{s!.name}</Link>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="border ledger-border p-6 md:p-7 flex flex-col">
          <p className="flex items-center gap-2 ledger-eyebrow ledger-crimson"><Glyph k="founder" size={18} />The house&rsquo;s way</p>
          <h3 className="mt-2 ledger-display text-[24px] leading-snug">Your stays, chosen by James</h3>
          <p className="mt-2 text-[15px] leading-relaxed ledger-muted flex-1">{data.houseWay}</p>
          <Link href={plan} className="mt-5 self-start ledger-btn ledger-btn--house inline-flex items-center min-h-[44px]">Plan with James</Link>
        </div>
        {op && (
          <div className="border ledger-border p-6 md:p-7 flex flex-col">
            <p className="flex items-center gap-2 ledger-eyebrow"><Glyph k="package" size={18} className="jw-glyph" />{op.by}&rsquo;s package</p>
            <h3 className="mt-2 ledger-display text-[24px] leading-snug">{op.name}</h3>
            <p className="mt-1 text-[14px]"><span className="ledger-display text-[22px]">From {usd(op.from)}</span> <span className="ledger-muted">{op.basis}, {op.nights} nights aboard {op.ship} and ashore</span></p>
            <p className="mt-2 text-[15px] leading-relaxed ledger-muted flex-1">{op.line}{opHotels.length ? <> Its hotels: {opHotels.map((h, i) => <span key={h.slug}>{i ? " and " : ""}{isBuilt(`/stays/${h.slug}`) ? <Link href={`/stays/${h.slug}`} className="underline underline-offset-4 hover:text-crimson">{h.name}</Link> : h.name}</span>)}, or similar.</> : null}</p>
            <Link href={`/plan?trip=${encodeURIComponent(`${op.by} ${op.name}`)}`} className="mt-5 self-start inline-flex items-center min-h-[44px] ledger-btn-ghost">Ask James to book it</Link>
          </div>
        )}
      </div>

      <IconLegend keys={["arrive", "sail", "stay-on", "add-night", "package", "founder"]} title="The icons in this section" open={false} className="mt-10" />
    </section>
  );
}

export default function EitherSide({ slug, waters, ship, voyage }: { slug: string; waters: string; ship: string; voyage: string }) {
  const data = eitherSideFor(slug, waters);
  return data ? <EitherSideBand data={data} ship={ship} voyage={voyage} /> : null;
}
