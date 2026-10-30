import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import CompassRose from "@/components/ledger/CompassRose";
import LedgerChart, { projectOn } from "@/components/destination/LedgerChart";
import Doors from "@/components/destination/Doors";
import Journeys from "@/components/destination/Journeys";
import WhenToGo from "@/components/destination/WhenToGo";
import PlanBand from "@/components/destination/PlanBand";
import { GlanceBar } from "@/components/record/Frame";
import { PreviewNote, RecordHero } from "@/components/record/Sections";
import { CHART_CENTRAL_AMERICA } from "@/lib/charts/central-america";
import { CENTRAL_AMERICA as R } from "@/lib/content/preview/central-america";
import { journeysFor } from "@/lib/content/preview/journeys";
import { REGIONS } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";

// Preview of the REGION landing page template on Central America.
// Order: hero + glance → region bar (all ten regions) → breadcrumbs → the
// region's Ledger chart → in short → country doors → the Compass →
// journeys & voyages across the region → when to go & getting there → plan.

export const metadata = buildMetadata({ title: "Central America: Costa Rica, Belize & Panama, Vetted Stays and Routes (preview)", description: "Central America in the James Wild & Co Ledger: Costa Rica, Belize and Panama, with mapped stays, Overland routes and the best months.", path: "/preview/central-america", noindex: true });

const journeys = ["costa-rica", "belize", "panama"].flatMap((c) => journeysFor(c));
const stayCount = R.doors.reduce((n, d) => n + d.stays, 0);
const COLORS: Record<string, string> = { "Costa Rica": "#8B2525", Belize: "#22656E", Panama: "#94512F" };

export default function CentralAmericaPreview() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <RecordHero image={R.hero} eyebrow="Destinations · Region" title={R.name} tagline={R.tagline}
          glance={<GlanceBar glance={{ facts: [["Countries", `${R.doors.length} in the Ledger`], ["Stays", `${stayCount} filed`], ["Overland routes", `${journeys.length} drawn`]], cta: { label: "Take the Compass", href: "/compass?drawn=rainforest#compass" } }} />} />

        {/* Region bar: all ten regions, this one marked */}
        <nav aria-label="Regions" className="border-b ledger-rule bg-paper/95 backdrop-blur sticky top-[72px] lg:top-[105px] z-30">
          <div className="max-w-ledger mx-auto px-5 md:px-10 h-12 flex items-center gap-6">
            <div className="flex-1 min-w-0 flex items-center gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
              {REGIONS.map((r) => r.slug === R.slug
                ? <span key={r.slug} aria-current="page" className="ledger-display text-[15px] border-b border-crimson pb-0.5">{r.label}</span>
                : <Link key={r.slug} href={r.href} className="ledger-display text-[15px] ledger-muted hover:text-ink">{r.label}</Link>)}
            </div>
            <span className="hidden lg:flex items-center gap-5 shrink-0">{[["Map", "map"], ["Countries", "countries"], ["Journeys", "journeys"], ["When", "when"], ["Plan", "plan"]].map(([l, id]) => <a key={id} href={`#${id}`} className="ledger-eyebrow hover:ledger-crimson">{l}</a>)}</span>
          </div>
        </nav>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Destinations", path: "/destinations" }, { name: R.name, path: `/destinations/${R.slug}` }]} /></div>

          {/* The region's Ledger chart */}
          <section id="map" className="pt-8 scroll-mt-32 lg:scroll-mt-40 grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start" aria-labelledby="map-heading">
            <div className="relative border ledger-rule overflow-hidden ledger-chart is-drawn">
              <LedgerChart chart={CHART_CENTRAL_AMERICA} title="Ledger chart of Central America with its stays" />
              <svg viewBox={`0 0 ${CHART_CENTRAL_AMERICA.width} ${CHART_CENTRAL_AMERICA.height}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
                {R.pins.map((p) => { const q = projectOn(CHART_CENTRAL_AMERICA, p.lat, p.lng); return <circle key={p.name} cx={q.x} cy={q.y} r="6.5" fill={COLORS[p.country]} stroke="#F4F1ED" strokeWidth="2" />; })}
              </svg>
            </div>
            <div>
              <p className="ledger-eyebrow ledger-crimson">The Ledger in {R.name}</p>
              <h2 id="map-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Where We&rsquo;d Send You</h2>
              <ul className="mt-5 border-t ledger-rule">
                {R.doors.map((d) => (
                  <li key={d.name} className="border-b ledger-rule">
                    <Link href={d.href} className="py-3 flex items-center justify-between gap-4 hover:ledger-crimson">
                      <span className="flex items-center gap-3"><span className="w-3 h-3 rounded-full" style={{ background: COLORS[d.name] }} aria-hidden="true" /><span className="ledger-display text-xl">{d.name}</span></span>
                      <span className="text-[13px] ledger-muted">{d.stays} stays{d.routes ? ` · ${d.routes} routes` : ""} <ArrowRight className="inline w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[13px] ledger-muted">Pins are the stays with coordinates on file; each country page maps all of its own.</p>
            </div>
          </section>

          <div className="mt-12"><AnswerBlock>{R.answer}</AnswerBlock></div>

          <Doors eyebrow={`${R.doors.length} countries in the Ledger`} title={`The Countries of ${R.name}`} intro="Open a country for its own map, stays by area, routes, the months to go and the Compass where it's ready." doors={R.doors} />

          {/* The Compass, at region level */}
          <section className="mt-16 md:mt-24 text-paper -mx-5 md:mx-0 px-5 md:px-12 py-10 relative overflow-hidden bg-ink bg-[radial-gradient(90%_80%_at_100%_0%,rgba(34,101,110,0.55),transparent_62%)] grid md:grid-cols-[1fr_auto] gap-8 items-center" aria-label="The Compass">
            <div>
              <p className="ledger-eyebrow !text-white/70">Not sure which country?</p>
              <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2">Let the Compass Choose, <span className="italic">Then Talk to a Person.</span></h2>
              <p className="mt-3 text-[16px] text-white/75 max-w-2xl">A few questions about who&rsquo;s travelling, the kind of place and the month, and it reads the Ledger across all three countries.</p>
              <Link href="/compass?drawn=rainforest#compass" className="mt-5 inline-block bg-crimson hover:bg-crimson-deep transition-colors px-6 py-3 text-[12px] uppercase tracking-[0.18em]">Take the Compass</Link>
            </div>
            <CompassRose bearing={250} className="hidden md:block w-[160px] h-[160px]" />
          </section>

          <Journeys country={R.name} journeys={journeys} chart={CHART_CENTRAL_AMERICA} />

          <WhenToGo place={R.name} rows={R.months} airports={R.airports} transfers={R.transfers} />

          <PlanBand place={R.name} compassHref="/compass?drawn=rainforest#compass" />

          <PreviewNote>{R.notes.map((n) => <p key={n.slice(0, 20)}>{n}</p>)}</PreviewNote>
        </div>
      </main>
    </>
  );
}
