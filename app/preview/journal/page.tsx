import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import { buildMetadata } from "@/lib/seo";
import { stayBySlug } from "@/lib/content/stays";
import { heroSlides } from "@/lib/content/hero-sets";
import { JOURNAL_STYLE_ON, JOURNAL_SWITCH_ALLOWED, journalStyle } from "@/lib/journal-style/flag";
import { AccordionRow, LedgerList, SectionHead, Stamp, StickyBar, TapedPhoto, Ticket } from "@/components/journal/journal-style";

// Preview only, never linked and never indexed: JWC-STYLE-01 Stage 0. Each primitive of the Modern Journal pilot,
// shown once on Paper. Words, IDs and photographs are read from the filed Aguas Claras record through the existing
// loaders; no rate or price is printed here (rates arrive from live data in the stages that use them).

export const metadata = buildMetadata({ title: "JWC-STYLE-01 primitives (preview)", description: "The Modern Journal pilot: the seven primitives every stage builds from.", path: "/preview/journal", noindex: true });

const SAMPLE = "aguas-claras";

function Block({ name, note, children }: { name: string; note: string; children: React.ReactNode }) {
  return (
    <section className="mt-16 pt-6 border-t border-[color:var(--jw-keyline)]">
      <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-graphite">{name}</p>
      <p className="mt-1 text-[13.5px] text-stone-text max-w-2xl">{note}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default async function JournalPrimitivesPreview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const on = journalStyle(await searchParams);
  const stay = stayBySlug(SAMPLE);
  const name = stay?.name ?? "Sample stay";
  const slides = stay ? heroSlides(`stay:${SAMPLE}`, name, stay.country) : [];
  const photo = slides[0] ?? (stay?.hero ? { url: stay.hero, alt: name } : null);
  const second = slides[1] ?? photo;
  const room = stay?.rooms.items[0] ?? null;
  const reasons = (stay?.why ?? []).filter((w) => w.title).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-8 pb-24 bg-white">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <p className="ledger-eyebrow">Preview · JWC-STYLE-01 · Stage 0</p>
          <h1 className="ledger-display text-4xl md:text-5xl mt-2">The Modern Journal primitives</h1>
          <p className="mt-3 max-w-3xl ledger-muted text-[16px] leading-relaxed">Seven building blocks, each shown once, on white. No page on the site uses them yet. Sample words and photographs are read from the filed {name} record.</p>

          <dl className="mt-6 inline-grid grid-cols-[auto_auto] gap-x-6 gap-y-1.5 border border-[color:var(--jw-hairline)] px-5 py-4 font-mono text-[11.5px] text-graphite">
            <dt className="text-stone-text">NEXT_PUBLIC_JOURNAL_STYLE</dt><dd>{JOURNAL_STYLE_ON ? "on" : "off"}</dd>
            <dt className="text-stone-text">?journal= switch on this build</dt><dd>{JOURNAL_SWITCH_ALLOWED ? "honoured (preview)" : "ignored (production)"}</dd>
            <dt className="text-stone-text">Journal style on this request</dt><dd className={on ? "text-house" : ""}>{on ? "on" : "off"}</dd>
          </dl>
          <p className="mt-3 text-[13.5px] text-stone-text">
            Try the switch: <Link href="/preview/journal?journal=1" className="underline underline-offset-4 text-graphite">?journal=1</Link> · <Link href="/preview/journal?journal=0" className="underline underline-offset-4 text-graphite">?journal=0</Link> · <Link href="/preview/journal" className="underline underline-offset-4 text-graphite">no switch</Link>
          </p>

          <Block name="1 · SectionHead" note="The numbered heading that opens every section: number, hairline, a mono label, the title and one line beneath.">
            <SectionHead no="01" label="Rooms and rates" title="Where You'll Sleep, and What It Costs" lede="One line under the title says what the section holds." />
          </Block>

          <Block name="2 · TapedPhoto" note="A photograph on a white mount, one strip of tape, a degree off square, with a mono caption.">
            {photo ? (
              <div className="max-w-md pt-3"><TapedPhoto src={photo.url} alt={photo.alt} caption={name} /></div>
            ) : <p className="text-stone-text text-[14px]">No photograph is filed for the sample record.</p>}
          </Block>

          <Block name="3 · Stamp" note="A round ink stamp. House Crimson on white, Graphite for a quiet mark, white over a photograph.">
            <div className="flex flex-wrap items-center gap-10">
              <Stamp top="James Wild & Co" main="Vetted" bottom="By the house" />
              <Stamp tone="graphite" top="The Ledger" main="Entry" sub={stay?.ledgerId ? stay.ledgerId.slice(-4) : "0000"} bottom="As filed" rotate={4} />
              <span className="inline-flex bg-ink-deep p-5"><Stamp tone="paper" top="James Wild & Co" main="Stay" bottom="Volume I" rotate={-3} /></span>
            </div>
          </Block>

          <Block name="4 · LedgerList" note="Label and value pairs. A strip of cells under one rule, or one pair per line.">
            <LedgerList layout="strip" items={[
              { label: "Ledger ID", value: stay?.ledgerId ?? "Not filed", id: true },
              { label: "Best months", value: stay?.bestMonths ?? "Not filed" },
              { label: "Country", value: stay?.country ?? "Not filed" },
              { label: "Category", value: stay?.category ?? "Not filed" },
            ]} />
            <div className="mt-8 max-w-md">
              <LedgerList heading="As filed" numbered items={[
                { label: "Stay", value: name },
                { label: "Country", value: stay?.country ?? "Not filed" },
                { label: "Ledger ID", value: stay?.ledgerId ?? "Not filed", id: true },
              ]} />
            </div>
          </Block>

          <Block name="5 · Ticket" note="A room or a cabin as a ticket. The stub is empty of price here on purpose: rates are passed in from live data from Stage 4.">
            <div className="max-w-sm pt-3">
              <Ticket
                eyebrow={name}
                title={room ?? "Room name, as filed"}
                lines={["The rate prints here from the live rate data."]}
                photo={second ? { src: second.url, alt: second.alt } : undefined}
                rate={<p className="font-mono text-[10px] tracking-[0.2em] uppercase text-stone-text">Rate from live data</p>}
                action={<Link href="/plan" className="ledger-btn ledger-btn--house ledger-btn--compact">Check dates</Link>}
              />
            </div>
          </Block>

          <Block name="6 · AccordionRow" note="A row that opens. The first is open; the detail stays in the page for search and answer engines.">
            <div className="max-w-2xl border-b border-[color:var(--jw-hairline)]">
              {reasons.length ? reasons.map((w, i) => (
                <AccordionRow key={w.title} title={w.title} defaultOpen={i === 0}>{w.body}</AccordionRow>
              )) : (
                <AccordionRow title="A row that opens" defaultOpen>The detail folds beneath the title.</AccordionRow>
              )}
            </div>
          </Block>

          <Block name="7 · StickyBar" note="The bar at the foot of the window, set in the page here so it can be seen. No rate line until live data feeds it.">
            <StickyBar
              mode="inline"
              title={name}
              note={stay?.ledgerId ?? undefined}
              links={<><Link href="/folio" className="ledger-btn-ghost">Save</Link><Link href="/plan" className="ledger-btn-ghost">Speak with an advisor</Link></>}
              action={<Link href="/plan" className="ledger-btn ledger-btn--house ledger-btn--compact">Check your dates</Link>}
            />
          </Block>
        </div>
      </main>
    </>
  );
}
