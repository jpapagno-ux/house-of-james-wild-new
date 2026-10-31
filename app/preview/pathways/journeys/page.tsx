import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { PreviewNote } from "@/components/record/Sections";
import { RecordCard } from "@/components/hub/Hub";
import { PathwayChips } from "@/components/pathways/Pathway";
import { pathwayTrips, validateTripMap } from "@/lib/content/pathways/trips";
import { pathwayPreviewHref } from "@/lib/content/pathways/preview";
import { VOLUME_STYLES } from "@/lib/volumes";
import { buildMetadata } from "@/lib/seo";

// PREVIEW · Wild Pathways 2B: the voyages and overland routes drafted onto
// the pathways, with Iggi's one-line reason for each, for James to approve.
// Drafts render here only; the live pathway pages list a journey once its
// status is "approved" in trip-map.json. Noindex.

export const metadata = buildMetadata({ title: "Journeys on the pathways (preview)", description: "Voyages and overland routes drafted onto the Wild Pathways, awaiting approval.", path: "/preview/pathways/journeys", noindex: true });

export default function JourneysPathwaysPreview() {
  const trips = pathwayTrips({ includeDrafts: true });
  const problems = validateTripMap();
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Previews", path: "/preview/pathways" }, { name: "Journeys", path: "/preview/pathways/journeys" }]} />
          <header className="mt-6 max-w-3xl">
            <p className="ledger-eyebrow ledger-crimson">Wild Pathways · 2B · voyages and routes</p>
            <h1 className="ledger-display text-[2.6rem] md:text-[3.4rem] leading-[1.02] mt-3">Eleven journeys, drafted onto the pathways.</h1>
            <p className="mt-5 text-[17px] leading-relaxed ledger-muted">Each voyage and overland route keeps its own page and Ledger ID; a pathway page lists it beside the stays once you approve it. Iggi drafted the classification from each route&rsquo;s own copy; the reason is under each card.</p>
          </header>
          <PreviewNote>{problems.length ? `Map problems: ${problems.join("; ")}` : "Map validates. Nothing here is live until status is approved in trip-map.json."}</PreviewNote>
          <h2 className="ledger-display text-[2rem] mt-10">The drafts</h2>
          <ul className="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((t) => (
              <li key={t.slug} className="flex flex-col gap-3">
                <RecordCard name={t.name} id={t.ledgerId ?? t.slug} line={t.line} image={{ url: t.hero?.url ?? "", alt: t.hero?.alt ?? t.name }} href={t.href} eyebrow={`${t.kind === "voyage" ? "Voyage" : "Overland"}${t.country ? ` · ${t.country}` : ""}`} />
                <PathwayChips primary={t.primary} secondary={t.secondary} hrefFor={(x) => pathwayPreviewHref(x.key)} />
                <p className="text-[13px] ledger-muted"><span className="ledger-eyebrow">{t.status} · {t.classifiedBy} · {t.volumes.map((v) => VOLUME_STYLES[v].label).join(", ")}</span><br />{t.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
