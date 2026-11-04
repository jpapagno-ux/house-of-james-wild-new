import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import FaqBlock from "@/components/ledger/FaqBlock";
import { RoomsLedger } from "@/components/record/Sections";
import Signature from "@/components/record/Signature";
import { ContactBar, ContactPill } from "@/components/record/TalkToUs";
import { PathwayChips } from "@/components/pathways/Pathway";
import DriftFrame from "@/components/exceptional-few/DriftFrame";
import EFSignals from "@/components/exceptional-few/EFSignals";
import NoteText from "@/components/exceptional-few/NoteText";
import { EFFrame } from "@/components/exceptional-few/EFStory";
import ContinueTheJourney from "@/components/exceptional-few/ContinueTheJourney";
import WorthAnotherNight from "@/components/exceptional-few/WorthAnotherNight";
import { collectionNo, efPathways, efThemeClass, SIGNAL_LABEL } from "@/lib/content/exceptional-few";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { buildMetadata } from "@/lib/seo";
import { NAME, parrotCay } from "@/lib/content/preview/parrot-cay";

// The Exceptional Few No. 002 · COMO Parrot Cay. The approved direction (night → day → night)
// on the island palette: the lagoon after dark, then white sand for the practical middle.
// Draft copy for James to review. Noindex.
export const metadata = buildMetadata({ title: "COMO Parrot Cay · The Exceptional Few (preview)", description: "Exceptional Few No. 002 on the island palette, draft for review.", path: "/preview/stay/parrot-cay", noindex: true });

export default function ParrotCayPreview() {
  const d = parrotCay();
  const { ef, hero, arch, place, arrival, story, night } = d;
  if (!ef || !hero) return null;
  const pw = efPathways(ef);
  const cutFrames = [place, arch, story.interior];

  return (
    <div className={`${efThemeClass(ef)} theme-ef-dark`}>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <DriftFrame a={hero} ratio="21:9" priority motion="zoom">
          <p className="ledger-eyebrow !text-white/85">The Exceptional Few&trade; &middot; {collectionNo(ef.collectionNumber)}</p>
          <h1 className="ledger-h1 mt-3 !text-[2.6rem] md:!text-[6rem]">{NAME}</h1>
          <p className="ledger-display italic text-xl md:text-3xl text-white/90 mt-2">Turks and Caicos</p>
          <div className="mt-8 flex flex-wrap items-center gap-5"><Link href={d.planHref} className="ledger-btn !border-white !text-white hover:!bg-white hover:!text-ink">Plan this journey</Link><span className="text-[11.5px] tracking-[0.18em] uppercase text-white/75">Ledger ID STY-2026-000575</span></div>
        </DriftFrame>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <section className="py-20 md:py-32 text-center" aria-label="The line">
            <p className="ledger-display text-[2rem] md:text-[3.6rem] leading-[1.1] max-w-4xl mx-auto">{ef.heroLine}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {ef.signals.map((s) => <span key={s.key} className="ledger-eyebrow !text-[11px] !tracking-[0.26em]" style={{ color: "var(--ef-sand)" }}>{SIGNAL_LABEL[s.key]}</span>)}
            </div>
            {pw && <div className="mt-6 flex justify-center"><PathwayChips primary={pw.primary} secondary={pw.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}
          </section>
        </div>

        {ef.whyItMadeTheCut.map((t, i) => {
          const a = cutFrames[i]; const n = `${String(i + 1).padStart(2, "0")} / ${String(ef.whyItMadeTheCut.length).padStart(2, "0")}`;
          return a ? (
            <DriftFrame key={i} a={a} ratio={i === 1 ? "16:10" : "3:2"} id={i === 0 ? "why" : undefined} motion={i === 1 ? "pan" : i === 2 ? "slow" : "zoom"} height="min-h-[78svh] md:min-h-[92svh]">
              {i === 0 ? <h2 className="ledger-eyebrow !text-white/80">Why it made the cut</h2> : <p className="ledger-eyebrow !text-white/80">{n}</p>}
              <p className="mt-4 ledger-display text-[1.6rem] md:text-[2.7rem] leading-[1.14] max-w-3xl">{t}</p>
              {i === 0 && <p className="mt-6 text-[11px] tracking-[0.22em] uppercase text-white/60">{n}</p>}
            </DriftFrame>
          ) : null;
        })}

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <section aria-label="James' note and at a glance" className="py-16 md:py-24 grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 items-start">
            <div>
              <h2 className="ledger-eyebrow" style={{ color: "var(--ef-sand)" }}>James&rsquo; note</h2>
              {ef.jamesNote && <><NoteText text={ef.jamesNote.text} href={d.planHref} className="mt-4 ledger-display italic text-[1.6rem] md:text-[2.2rem] leading-[1.25]" /><div className="mt-5 flex items-end justify-between gap-4 max-w-xl"><span className="text-[11px] tracking-[0.12em] uppercase ledger-muted">{ef.jamesNote.where} · {ef.jamesNote.when}</span><span className="invert opacity-90"><Signature className="w-24" /></span></div></>}
            </div>
            <EFSignals ef={ef} id="glance" />
          </section>
        </div>

        {/* Geography as arrival: no map pin is published by COMO yet, so the screen is the boat, not a map */}
        {arrival && (
          <DriftFrame a={arrival} ratio="3:2" id="place" motion="pan" height="min-h-[70svh] md:min-h-[86svh]">
            <h2 className="ledger-eyebrow !text-white/80">Arrival</h2>
            <p className="mt-4 ledger-display text-[1.6rem] md:text-[2.7rem] leading-[1.14] max-w-3xl">Fifteen minutes by road from Providenciales, then thirty-five by boat.</p>
            <p className="mt-4 max-w-xl text-[15px] md:text-[17px] text-white/85 leading-relaxed">About fifty minutes door to dock, as COMO states. The island has no other way in.</p>
          </DriftFrame>
        )}

        <div className="ef-day mx-[calc(50%-50vw)] px-[calc(50vw-50%)] pb-16 md:pb-24"><div className="max-w-ledger mx-auto px-5 md:px-10">
          <RoomsLedger id="rooms" eyebrow="The stay" title="Where You'll Sleep" rooms={d.rooms} unit="house" />

          <section id="story" className="mt-16 md:mt-24 grid md:grid-cols-12 gap-5 items-end scroll-mt-32" aria-label="Two frames">
            {story.human && <div className="md:col-span-5"><EFFrame a={story.human} ratio="4:5" sizes="(min-width: 768px) 40vw, 100vw" /></div>}
            {d.experiences[0] && <div className="md:col-span-7"><EFFrame a={d.experiences[0]} ratio="3:2" sizes="(min-width: 768px) 58vw, 100vw" /></div>}
          </section>

          <section id="experiences" className="mt-16 md:mt-24 border-t ef-rule pt-8 scroll-mt-32" aria-labelledby="exp-h">
            <p className="ledger-eyebrow">What the island allows</p>
            <h2 id="exp-h" className="ledger-display text-[1.9rem] md:text-[3rem] mt-2">Do Less. Notice More.</h2>
            <ul className="mt-8 grid md:grid-cols-2 gap-x-12">{d.days.map((x) => <li key={x.title} className="py-4 border-b ef-rule"><span className="ledger-display text-[1.3rem]">{x.title}</span><span className="block text-[14px] ledger-muted mt-1">{x.note}</span></li>)}</ul>
          </section>

          <section id="who" className="mt-16 md:mt-24 grid md:grid-cols-2 gap-10 scroll-mt-32" aria-label="Who it suits">
            <div><h2 className="ledger-eyebrow" style={{ color: "var(--ef-sand)" }}>Who it suits · best for</h2><ul className="mt-4 space-y-2 ledger-display text-[1.3rem]">{ef.whoItSuits.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><h3 className="ledger-eyebrow">Less ideal for</h3><ul className="mt-4 space-y-2 ledger-display text-[1.3rem] ledger-muted">{ef.whoItMayNotSuit.map((x) => <li key={x}>{x}</li>)}</ul><p className="mt-5 text-[14px] ledger-muted">Not sure? <Link href="/compass" className="underline underline-offset-4">Ask the Human Compass</Link>.</p></div>
          </section>
        </div></div>

        {ef.worthAnotherNight && (night ? (
          <DriftFrame a={night} ratio="3:2" id="another-night" motion="slow" height="min-h-[82svh] md:min-h-[92svh]">
            <h2 className="ledger-eyebrow !text-white/80">Worth Another Night&trade;</h2>
            <p className="mt-4 ledger-display text-[2rem] md:text-[3.6rem] leading-[1.08] max-w-3xl">{ef.worthAnotherNight}</p>
          </DriftFrame>
        ) : <div className="max-w-ledger mx-auto px-5 md:px-10"><WorthAnotherNight copy={ef.worthAnotherNight} /></div>)}

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div id="questions" className="scroll-mt-32"><FaqBlock faqs={d.faqs} title={`${NAME}, Answered Straight`} schema={false} /></div>
          <ContinueTheJourney pathways={pw ? [pw.primary, ...pw.secondary] : []} hrefFor={(p) => pathwayHref(p.key)} journeys={[]} compassHref="/compass" hostHref={null} />
          <section className="mt-16 md:mt-24 py-16 text-center border-t ef-rule" aria-label="Plan">
            <p className="ledger-eyebrow">Plan with James</p>
            <p className="mt-3 ledger-display text-[2rem] md:text-[3rem] leading-tight">Five nights on Parrot Cay, designed around you.</p>
            <div className="mt-8"><Link href={d.planHref} className="ledger-btn ledger-btn--solid">Plan this journey</Link></div>
          </section>
          <p className="py-8 text-[12.5px] ledger-muted">Preview · The Exceptional Few No. 002, draft for James · island palette · Photography courtesy of COMO Hotels, preview rights only · <Link href="/stays/amangiri" className="underline underline-offset-2">No. 001, Amangiri</Link></p>
        </div>
      </main>
      <ContactBar name={NAME} planHref={d.planHref} />
      <ContactPill name={NAME} planHref={d.planHref} />
    </div>
  );
}
