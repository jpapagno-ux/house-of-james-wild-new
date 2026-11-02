import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import { GlanceBar, LocationBlock } from "@/components/record/Frame";
import { RecordHero, RecordNav, RoomsLedger } from "@/components/record/Sections";
import ImageAccordion from "@/components/record/ImageAccordion";
import Signature from "@/components/record/Signature";
import TalkToUs, { ContactBar, ContactPill } from "@/components/record/TalkToUs";
import PlanBand from "@/components/destination/PlanBand";
import { PathwayChips } from "@/components/pathways/Pathway";
import { Roundel } from "@/components/ledger/VolumeKit";
import PanFrame from "@/components/exceptional-few/PanFrame";
import NightClose from "@/components/exceptional-few/NightClose";
import Spread, { OpenRow } from "@/components/exceptional-few/Spread";
import EFSignals from "@/components/exceptional-few/EFSignals";
import { EFFrame } from "@/components/exceptional-few/EFStory";
import WhoItSuits from "@/components/exceptional-few/WhoItSuits";
import ContinueTheJourney from "@/components/exceptional-few/ContinueTheJourney";
import LIB_CHARTS from "@/lib/charts/countries.json";
import type { ChartData } from "@/components/destination/LedgerChart";
import { collectionNo, efPathways, efThemeClass } from "@/lib/content/exceptional-few";
import { mediaUrl } from "@/lib/content/media-assets";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { roundelText, VOLUME_STYLES } from "@/lib/volumes";
import { buildMetadata } from "@/lib/seo";
import { amangiri, CANONICAL, COORDS, NAME, rightsOwner } from "@/lib/content/preview/amangiri";

// MOCK B · "Dusk": the hero stays still but taller and quieter; the spread carries the
// words; geography arrives as a sideways pan with the coordinates; the page ends in the
// dark with Worth Another Night™ over the night frame. Noindex. The second of two directions.
export const metadata = buildMetadata({ title: "Amangiri · Mock B, Dusk (preview)", description: "Exceptional Few direction B: geography pan and the night close.", path: "/preview/stay/amangiri-b", noindex: true });

export default function AmangiriMockB() {
  const d = amangiri();
  const { ef, hero, arch, place, aerial, story, night } = d;
  if (!ef || !hero) return null;
  const pw = efPathways(ef);
  const chart = (LIB_CHARTS as unknown as Record<string, ChartData>).utah;
  const nav: [string, string][] = [["Why it made the cut", "why"], ["Geography", "place"], ["The stay", "rooms"], ["What you'll do", "experiences"], ["Who it suits", "who"], ["Another night", "another-night"], ["Questions", "questions"], ["Continue", "continue"]];
  return (
    <div className={efThemeClass(ef)}>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <RecordHero image={{ url: mediaUrl(hero, { ratio: "21:9", width: 2560 }), alt: hero.alt }} eyebrow={`The Exceptional Few™ — ${collectionNo(ef.collectionNumber)}`} title={NAME} tagline="Canyon Point, Utah" credit={rightsOwner(hero)} height="h-[94svh] min-h-[640px]"
          glance={<GlanceBar glance={{ facts: [["Setting", "Colorado Plateau · 900 acres"], ["Fly into", "Page (PGA) · 25 min"], ["Ledger ID", "STY-2026-000563"]], cta: { label: "Plan this journey", href: d.planHref } }} />} />
        <RecordNav items={nav} cta="Plan this journey" ctaHref={d.planHref} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6 flex items-center justify-between gap-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Stays", path: "/stays" }, { name: NAME, path: CANONICAL }]} /><p className="hidden md:block ledger-eyebrow">Mock B · Dusk · not indexed</p></div>
          {ef.heroLine && <p className="mt-12 md:mt-16 max-w-4xl ledger-display text-[1.7rem] md:text-[2.6rem] leading-[1.15]">{ef.heroLine}</p>}
          <Spread ef={ef} frames={[arch, story.interior, story.human]} />
          <OpenRow>
            <div>
              <p className="ledger-eyebrow ef-eyebrow">James&rsquo; note</p>
              {ef.jamesNote && <><p className="mt-3 ledger-display italic text-[1.5rem] leading-snug">&ldquo;{ef.jamesNote.text}&rdquo;</p><div className="mt-4 flex items-end justify-between gap-4"><span className="text-[11px] tracking-[0.12em] uppercase ledger-muted">{ef.jamesNote.where} · {ef.jamesNote.when}</span><Signature className="w-20" /></div></>}
            </div>
            <div>
              <p className="ledger-eyebrow">Wild Pathways</p>
              {pw && <div className="mt-4"><PathwayChips primary={pw.primary} secondary={pw.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}
            </div>
            <div><EFSignals ef={ef} compact id="glance" /></div>
          </OpenRow>
        </div>
        <div id="place" className="mt-16 md:mt-24 scroll-mt-32">
          {(aerial ?? place) && <PanFrame src={mediaUrl((aerial ?? place)!, { width: 2560 })} alt={(aerial ?? place)!.alt} name={NAME} coords={COORDS} line="Canyon Point, in the far south of Utah, a few miles from the Arizona line. The nearest town is Page; the nearest water is Lake Powell." credit={(aerial ?? place)!.credit} />}
        </div>
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          {chart && <LocationBlock chart={chart} name={NAME} pin={COORDS} heading="Southern Utah" rows={[["Airport", "Page Municipal (PGA), about 25 minutes by road"], ["Also", "St George or Flagstaff about 2.5 h; Phoenix or Las Vegas about 4.5 h"]]} note="Transfer times as stated by the property." mark={<Roundel volume="stays" text={roundelText(NAME, COORDS, VOLUME_STYLES.stays.roman)} size={120} />} />}
          <RoomsLedger id="rooms" eyebrow="The stay" title="Where You'll Sleep" rooms={d.rooms} unit="suite" />
          {place && <div className="mt-16 md:mt-24"><EFFrame a={place} ratio="21:9" sizes="100vw" /></div>}
          <ImageAccordion id="experiences" eyebrow="What you'll do" title="What the Place Allows" icon="mountain-sun" items={d.days} start={0} />
          <WhoItSuits name={NAME} bestFor={ef.whoItSuits} lessIdealFor={ef.whoItMayNotSuit} />
          {night && ef.worthAnotherNight && <NightClose a={night} name={NAME} copy={ef.worthAnotherNight} />}
          <div id="questions" className="scroll-mt-32"><FaqBlock faqs={d.faqs} title={`${NAME}, Answered Straight`} schema={false} /></div>
          <ContinueTheJourney pathways={pw ? [pw.primary, ...pw.secondary] : []} hrefFor={(p) => pathwayHref(p.key)} journeys={[]} compassHref="/compass" hostHref={null} />
          <TalkToUs name={NAME} planHref={d.planHref} />
          <PlanBand place={NAME} compassHref="/compass" where={{ regionSlug: "usa-canada", volume: "stays" }} />
          <p className="mt-10 text-[12.5px] ledger-muted">Mock B · Photography courtesy of Aman, preview rights only. Compare <Link href="/preview/stay/amangiri-a" className="underline underline-offset-2">Mock A, The Arrival</Link>.</p>
        </div>
      </main>
      <ContactBar name={NAME} planHref={d.planHref} />
      <ContactPill name={NAME} planHref={d.planHref} />
    </div>
  );
}
