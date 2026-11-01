import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import FaqBlock from "@/components/ledger/FaqBlock";
import { LocationBlock } from "@/components/record/Frame";
import { RoomsLedger } from "@/components/record/Sections";
import Signature from "@/components/record/Signature";
import { ContactBar, ContactPill } from "@/components/record/TalkToUs";
import { PathwayChips } from "@/components/pathways/Pathway";
import { Roundel } from "@/components/ledger/VolumeKit";
import DriftFrame from "@/components/exceptional-few/DriftFrame";
import PanFrame from "@/components/exceptional-few/PanFrame";
import EFSignals from "@/components/exceptional-few/EFSignals";
import { EFFrame } from "@/components/exceptional-few/EFStory";
import ContinueTheJourney from "@/components/exceptional-few/ContinueTheJourney";
import LIB_CHARTS from "@/lib/charts/countries.json";
import type { ChartData } from "@/components/destination/LedgerChart";
import { collectionNo, efPathways, SIGNAL_LABEL } from "@/lib/content/exceptional-few";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { mediaUrl } from "@/lib/content/media-assets";
import { roundelText, VOLUME_STYLES } from "@/lib/volumes";
import { buildMetadata } from "@/lib/seo";
import { amangiri, CANONICAL, COORDS, NAME } from "@/lib/content/preview/amangiri";

// MOCK C · "Dusk, bold": a coloured surface instead of white (dusk plum, or ink with
// ?surface=ink), one strong frame per screen with a slow timed drift, and the words cut to
// a line or two per screen. The tightened copy below is the proposal for the Airtable row
// if this direction is chosen; the long copy stays in Airtable until then. Noindex.
export const metadata = buildMetadata({ title: "Amangiri · Mock C, Dusk Bold (preview)", description: "Exceptional Few direction C: coloured surface, one frame per screen, slow drift.", path: "/preview/stay/amangiri-c", noindex: true });

// Tight copy: what the page says when it says less.
const TIGHT = {
  line: "The building disappears. The landscape stays.",
  cut: [
    { k: "The place", t: "Nine hundred acres of the Colorado Plateau. Thirty-four suites, ten tents, one villa. The mesa owns the view." },
    { k: "The access", t: "Slot canyons and a via ferrata on the property. Page's airstrip twenty-five minutes away. The parks a day in any direction." },
    { k: "The verdict", t: "Not the most comfortable desert hotel in America. The one that lets the desert win." },
  ],
  another: "Four nights. The third is when you stop moving.",
};

export default async function AmangiriMockC({ searchParams }: { searchParams: Promise<{ surface?: string }> }) {
  const { surface } = await searchParams;
  const d = amangiri();
  const { ef, hero, arch, place, aerial, story, night } = d;
  if (!ef || !hero) return null;
  const pw = efPathways(ef);
  const chart = (LIB_CHARTS as unknown as Record<string, ChartData>).utah;
  const ink = surface === "ink";
  const other = ink ? "/preview/stay/amangiri-c" : "/preview/stay/amangiri-c?surface=ink";
  const cutFrames = [place, arch, story.interior];

  return (
    <div className={`theme-ef theme-ef-amangiri theme-ef-dark ${ink ? "surface-ink" : ""}`}>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        {/* 01 Hero: one frame, slow zoom, the name arrives after the image settles */}
        <DriftFrame a={hero} ratio="21:9" priority motion="zoom">
          <p className="ledger-eyebrow !text-white/85">The Exceptional Few&trade; — {collectionNo(ef.collectionNumber)}</p>
          <h1 className="ledger-h1 mt-3 !text-[2.9rem] md:!text-[6.4rem]">{NAME}</h1>
          <p className="ledger-display italic text-xl md:text-3xl text-white/90 mt-2">Canyon Point, Utah</p>
          <div className="mt-8 flex flex-wrap items-center gap-5"><Link href={d.planHref} className="ledger-btn !border-white !text-white hover:!bg-white hover:!text-ink">Plan this journey</Link><Link href={CANONICAL} className="text-[11px] tracking-[0.18em] uppercase text-white/80 hover:text-white">Save</Link></div>
        </DriftFrame>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          {/* 02 The line, alone */}
          <section className="py-20 md:py-32 text-center" aria-label="The line">
            <p className="ledger-display text-[2rem] md:text-[3.6rem] leading-[1.1] max-w-4xl mx-auto">{TIGHT.line}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {ef.signals.map((s) => <span key={s.key} className="ledger-eyebrow !text-[11px] !tracking-[0.26em]" style={{ color: "var(--ef-sand)" }}>{SIGNAL_LABEL[s.key]}</span>)}
            </div>
          </section>
        </div>

        {/* 03 Why It Made the Cut: three screens, one frame and one line each */}
        {TIGHT.cut.map((c, i) => {
          const a = cutFrames[i];
          return a ? (
            <DriftFrame key={c.k} a={a} ratio={i === 1 ? "16:10" : "3:2"} id={i === 0 ? "why" : undefined} motion={i === 1 ? "pan" : i === 2 ? "slow" : "zoom"} height="min-h-[78svh] md:min-h-[92svh]">
              {i === 0 ? <h2 className="ledger-eyebrow !text-white/80">Why it made the cut</h2> : <p className="ledger-eyebrow !text-white/80">{ c.k}</p>}
              <p className="mt-4 ledger-display text-[1.7rem] md:text-[2.9rem] leading-[1.12] max-w-3xl">{c.t}</p>
              {i === 0 && <p className="mt-6 text-[11px] tracking-[0.22em] uppercase text-white/60">01 / 03</p>}
            </DriftFrame>
          ) : null;
        })}

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          {/* 04 James' note · Pathways · signals, one open row */}
          <section aria-label="James' note, pathways and at a glance" className="py-16 md:py-24 grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 items-start">
            <div>
              <h2 className="ledger-eyebrow" style={{ color: "var(--ef-sand)" }}>James&rsquo; note</h2>
              {ef.jamesNote && <><p className="mt-4 ledger-display italic text-[1.6rem] md:text-[2.2rem] leading-[1.25]">&ldquo;{ef.jamesNote.text}&rdquo;</p><div className="mt-5 flex items-end justify-between gap-4 max-w-xl"><span className="text-[11px] tracking-[0.12em] uppercase ledger-muted">{ef.jamesNote.where} · {ef.jamesNote.when}</span><span className="invert opacity-90"><Signature className="w-24" /></span></div></>}
            </div>
            <div className="space-y-8">
              <div><p className="ledger-eyebrow">Wild Pathways</p>{pw && <div className="mt-3"><PathwayChips primary={pw.primary} secondary={pw.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}</div>
              <EFSignals ef={ef} id="glance" />
            </div>
          </section>
        </div>

        {/* 05 Geography: the pan with coordinates, then the JW map */}
        <div id="place" className="scroll-mt-32">{(aerial ?? place) && <PanFrame src={mediaUrl((aerial ?? place)!, { width: 2560 })} alt={(aerial ?? place)!.alt} name={NAME} coords={COORDS} line="Canyon Point, in the far south of Utah, a few miles from the Arizona line. The nearest town is Page; the nearest water is Lake Powell." credit={(aerial ?? place)!.credit} />}</div>
        <div className="ef-day mx-[calc(50%-50vw)] px-[calc(50vw-50%)] pb-16 md:pb-24"><div className="max-w-ledger mx-auto px-5 md:px-10">
          {chart && <LocationBlock chart={chart} name={NAME} pin={COORDS} heading="Southern Utah" rows={[["Airport", "Page Municipal (PGA) · about 25 min"], ["Also", "St George / Flagstaff 2.5 h · Phoenix / Las Vegas 4.5 h"]]} mark={<Roundel volume="stays" text={roundelText(NAME, COORDS, VOLUME_STYLES.stays.roman)} size={120} />} />}

          {/* 06 The stay */}
          <RoomsLedger id="rooms" eyebrow="The stay" title="Where You'll Sleep" rooms={d.rooms.map((r) => ({ ...r, note: r.note?.split(".")[0] + "." }))} unit="suite" />

          {/* 07 Two frames, no grid */}
          <section id="story" className="mt-16 md:mt-24 grid md:grid-cols-12 gap-5 items-end scroll-mt-32" aria-label="Two frames">
            {story.human && <div className="md:col-span-5"><EFFrame a={story.human} ratio="4:5" sizes="(min-width: 768px) 40vw, 100vw" /></div>}
            {d.experiences[0] && <div className="md:col-span-7"><EFFrame a={d.experiences[0]} ratio="3:2" sizes="(min-width: 768px) 58vw, 100vw" /></div>}
          </section>

          {/* 08 What you'll do: four lines, no accordion */}
          <section id="experiences" className="mt-16 md:mt-24 border-t ef-rule pt-8 scroll-mt-32" aria-labelledby="exp-h">
            <p className="ledger-eyebrow">What the place allows</p>
            <h2 id="exp-h" className="ledger-display text-[1.9rem] md:text-[3rem] mt-2">Pick Two. Leave the Afternoons Alone.</h2>
            <ul className="mt-8 grid md:grid-cols-2 gap-x-12">{d.days.map((x) => <li key={x.title} className="py-4 border-b ef-rule"><span className="ledger-display text-[1.3rem]">{x.title}</span><span className="block text-[14px] ledger-muted mt-1">{x.note.split(".")[0]}.</span></li>)}</ul>
          </section>

          {/* 09 Who it suits: two short columns */}
          <section id="who" className="mt-16 md:mt-24 grid md:grid-cols-2 gap-10 scroll-mt-32" aria-label="Who it suits">
            <div><h2 className="ledger-eyebrow" style={{ color: "var(--ef-sand)" }}>Who it suits · best for</h2><ul className="mt-4 space-y-2 ledger-display text-[1.3rem]">{ef.whoItSuits.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><h3 className="ledger-eyebrow">Less ideal for</h3><ul className="mt-4 space-y-2 ledger-display text-[1.3rem] ledger-muted">{ef.whoItMayNotSuit.map((x) => <li key={x}>{x}</li>)}</ul><p className="mt-5 text-[14px] ledger-muted">Not sure? <Link href="/compass" className="underline underline-offset-4">Ask the Human Compass</Link>.</p></div>
          </section>
        </div></div>

        {/* 10 Night: Worth Another Night over the dusk frame */}
        {night && (
          <DriftFrame a={night} ratio="3:2" id="another-night" motion="slow" height="min-h-[82svh] md:min-h-[92svh]" className="mt-0">
            <h2 className="ledger-eyebrow !text-white/80">Worth Another Night&trade;</h2>
            <p className="mt-4 ledger-display text-[2rem] md:text-[3.6rem] leading-[1.08] max-w-3xl">{TIGHT.another}</p>
            {ef.worthAnotherNight && <p className="mt-5 max-w-xl text-[15px] md:text-[17px] text-white/85 leading-relaxed">{ef.worthAnotherNight.split(". ").slice(1, 3).join(". ")}.</p>}
          </DriftFrame>
        )}

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div id="questions" className="scroll-mt-32"><FaqBlock faqs={d.faqs.slice(0, 3)} title={`${NAME}, Answered Straight`} schema={false} /></div>
          <ContinueTheJourney pathways={pw ? [pw.primary, ...pw.secondary] : []} hrefFor={(p) => pathwayHref(p.key)} journeys={[]} compassHref="/compass" hostHref={null} />
          <section className="mt-16 md:mt-24 py-16 text-center border-t ef-rule" aria-label="Plan">
            <p className="ledger-eyebrow">Plan with James</p>
            <p className="mt-3 ledger-display text-[2rem] md:text-[3rem] leading-tight">Four nights at Canyon Point, designed around you.</p>
            <div className="mt-8"><Link href={d.planHref} className="ledger-btn ledger-btn--solid">Plan this journey</Link></div>
          </section>
          <p className="py-8 text-[12.5px] ledger-muted">Mock C (chosen direction, fine-tuned) · {ink ? "Ink surface" : "Dusk plum surface"} · night → day → night · <Link href={other} className="underline underline-offset-2">switch to {ink ? "dusk plum" : "ink"}</Link> · Photography courtesy of Aman, preview rights only · <Link href="/preview/stay/amangiri-a" className="underline underline-offset-2">Mock A</Link> · <Link href="/preview/stay/amangiri-b" className="underline underline-offset-2">Mock B</Link></p>
        </div>
      </main>
      <ContactBar name={NAME} planHref={d.planHref} />
      <ContactPill name={NAME} planHref={d.planHref} />
    </div>
  );
}
