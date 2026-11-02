import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import { LocationBlock } from "@/components/record/Frame";
import { RecordNav, RoomsLedger } from "@/components/record/Sections";
import ImageAccordion from "@/components/record/ImageAccordion";
import Signature from "@/components/record/Signature";
import TalkToUs, { ContactBar, ContactPill } from "@/components/record/TalkToUs";
import PlanBand from "@/components/destination/PlanBand";
import { PathwayChips } from "@/components/pathways/Pathway";
import { Roundel } from "@/components/ledger/VolumeKit";
import ScrollHero from "@/components/exceptional-few/ScrollHero";
import Spread, { OpenRow } from "@/components/exceptional-few/Spread";
import EFSignals from "@/components/exceptional-few/EFSignals";
import EFStory from "@/components/exceptional-few/EFStory";
import WhoItSuits from "@/components/exceptional-few/WhoItSuits";
import WorthAnotherNight from "@/components/exceptional-few/WorthAnotherNight";
import ContinueTheJourney from "@/components/exceptional-few/ContinueTheJourney";
import LIB_CHARTS from "@/lib/charts/countries.json";
import type { ChartData } from "@/components/destination/LedgerChart";
import { collectionNo, efPathways, efThemeClass } from "@/lib/content/exceptional-few";
import { mediaUrl } from "@/lib/content/media-assets";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { roundelText, VOLUME_STYLES } from "@/lib/volumes";
import { buildMetadata } from "@/lib/seo";
import { amangiri, CANONICAL, COORDS, NAME, rightsOwner } from "@/lib/content/preview/amangiri";

// MOCK A · "The Arrival": the three-frame scrolling hero (place → architecture → the
// name) and the magazine spread for Why It Made the Cut. Everything after the spread
// is the approved Stay architecture. Noindex. One of two directions for James to pick.
export const metadata = buildMetadata({ title: "Amangiri · Mock A, The Arrival (preview)", description: "Exceptional Few direction A: scrolling arrival hero and magazine spread.", path: "/preview/stay/amangiri-a", noindex: true });

export default function AmangiriMockA() {
  const d = amangiri();
  const { ef, hero, arch, place, aerial, story, night } = d;
  if (!ef || !hero) return null;
  const pw = efPathways(ef);
  const chart = (LIB_CHARTS as unknown as Record<string, ChartData>).utah;
  const frames = [place, arch, hero].filter(Boolean).map((a) => ({ src: mediaUrl(a!, { ratio: a === arch ? "16:10" : "3:2", width: 2560 }), alt: a!.alt, caption: a!.caption, credit: a!.credit }));
  const nav: [string, string][] = [["Why it made the cut", "why"], ["The place", "place"], ["The stay", "rooms"], ["The story", "story"], ["What you'll do", "experiences"], ["Who it suits", "who"], ["Another night", "another-night"], ["Questions", "questions"], ["Continue", "continue"]];
  return (
    <div className={efThemeClass(ef)}>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <ScrollHero frames={frames} designation={`The Exceptional Few™ — ${collectionNo(ef.collectionNumber)}`} title={NAME} place="Canyon Point, Utah" line={ef.heroLine} credit={rightsOwner(hero)}
          actions={<><Link href={d.planHref} className="ledger-btn !border-white !text-white hover:!bg-white hover:!text-ink">Plan this journey</Link><Link href={CANONICAL} className="text-[11px] tracking-[0.18em] uppercase text-white/80 hover:text-white">Save</Link></>} />
        <RecordNav items={nav} cta="Plan this journey" ctaHref={d.planHref} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6 flex items-center justify-between gap-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Stays", path: "/stays" }, { name: NAME, path: CANONICAL }]} /><p className="hidden md:block ledger-eyebrow">Mock A · The Arrival · not indexed</p></div>
          <Spread ef={ef} frames={[aerial, story.interior, story.human]} />
          <OpenRow>
            <div>
              <p className="ledger-eyebrow ef-eyebrow">James&rsquo; note</p>
              {ef.jamesNote && <><p className="mt-3 ledger-display italic text-[1.5rem] leading-snug">&ldquo;{ef.jamesNote.text}&rdquo;</p><div className="mt-4 flex items-end justify-between gap-4"><span className="text-[11px] tracking-[0.12em] uppercase ledger-muted">{ef.jamesNote.where} · {ef.jamesNote.when}</span><Signature className="w-20" /></div></>}
            </div>
            <div>
              <p className="ledger-eyebrow">Wild Pathways</p>
              {pw && <div className="mt-4"><PathwayChips primary={pw.primary} secondary={pw.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}
              <p className="mt-4 text-[13px] leading-relaxed ledger-muted">The house&rsquo;s themes, not a rating.</p>
            </div>
            <div><EFSignals ef={ef} compact id="glance" /></div>
          </OpenRow>
          <section id="place" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[212px]" aria-label="The place">
            {chart && <LocationBlock chart={chart} name={NAME} pin={COORDS} heading="Southern Utah" rows={[["Airport", "Page Municipal (PGA), about 25 minutes by road"], ["Also", "St George or Flagstaff about 2.5 h; Phoenix or Las Vegas about 4.5 h"]]} note="Transfer times as stated by the property." mark={<Roundel volume="stays" text={roundelText(NAME, COORDS, VOLUME_STYLES.stays.roman)} size={120} />} />}
          </section>
          <RoomsLedger id="rooms" eyebrow="The stay" title="Where You'll Sleep" rooms={d.rooms} unit="suite" />
          <EFStory name={NAME} frames={{ arrival: aerial, interior: story.interior, human: story.human, night }} />
          <ImageAccordion id="experiences" eyebrow="What you'll do" title="What the Place Allows" icon="mountain-sun" items={d.days} start={0} />
          <WhoItSuits name={NAME} bestFor={ef.whoItSuits} lessIdealFor={ef.whoItMayNotSuit} />
          {ef.worthAnotherNight && <WorthAnotherNight copy={ef.worthAnotherNight} />}
          <div id="questions" className="scroll-mt-32"><FaqBlock faqs={d.faqs} title={`${NAME}, Answered Straight`} schema={false} /></div>
          <ContinueTheJourney pathways={pw ? [pw.primary, ...pw.secondary] : []} hrefFor={(p) => pathwayHref(p.key)} journeys={[]} compassHref="/compass" hostHref={null} />
          <TalkToUs name={NAME} planHref={d.planHref} />
          <PlanBand place={NAME} compassHref="/compass" where={{ regionSlug: "usa-canada", volume: "stays" }} />
          <p className="mt-10 text-[12.5px] ledger-muted">Mock A · Photography courtesy of Aman, preview rights only. Compare <Link href="/preview/stay/amangiri-b" className="underline underline-offset-2">Mock B, Dusk</Link>.</p>
        </div>
      </main>
      <ContactBar name={NAME} planHref={d.planHref} />
      <ContactPill name={NAME} planHref={d.planHref} />
    </div>
  );
}
