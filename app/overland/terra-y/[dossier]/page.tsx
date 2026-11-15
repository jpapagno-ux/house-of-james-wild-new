import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import Pic from "@/components/opening/Pic";
import { Additions, Credit, DayLog, DossierCard, Manifest, TyHead, TyHero, VipStamp } from "@/components/terra-y/Dossier";
import { TyRouteOverview, TyRouteScroll } from "@/components/terra-y/TyRoute";
import { TY_DOSSIERS, TY_FILES, TY_PATH, TY_ROUTES, stopForDay, ty, tyDossier, tyPath, tyUsd } from "@/lib/content/terra-y";
import { today } from "@/lib/dates";
import { PATHWAYS } from "@/lib/pathways";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbs, graph, touristTrip } from "@/lib/schema";

// /overland/terra-y/<dossier>: one Terra Y expedition dossier (James, 15 Nov 2026). Review build, noindex.
export const dynamicParams = false;
export function generateStaticParams() { return TY_DOSSIERS.map((d) => ({ dossier: d.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ dossier: string }> }) {
  const d = tyDossier((await params).dossier);
  if (!d) return {};
  return buildMetadata({
    title: `${d.title}: ${d.operator} ${d.file === "ice" ? "Antarctica" : "DC-3 Expedition"}, ${d.length}, from ${tyUsd(d.from)} | Terra Y`,
    description: d.answer.slice(0, 155).replace(/\s\S*$/, "") + ".",
    path: tyPath(d.slug),
    image: { url: ty(d.hero.id, 1600), alt: d.hero.alt },
    noindex: true,
  });
}

export default async function TerraYDossier({ params }: { params: Promise<{ dossier: string }> }) {
  const d = tyDossier((await params).dossier);
  if (!d) notFound();
  const f = TY_FILES[d.file];
  const plan = `/plan?from=terra-y&trip=${encodeURIComponent(`${d.no} ${d.title}`)}`;
  const trail = [{ name: "Home", path: "/" }, { name: "Overland", path: "/overland" }, { name: "Terra Y", path: TY_PATH }, { name: d.title, path: tyPath(d.slug) }];
  const others = TY_DOSSIERS.filter((x) => x.file === d.file && x.slug !== d.slug).slice(0, 3);
  const far = PATHWAYS["PATH-09"];
  const route = TY_ROUTES[d.slug] ?? [];
  let stopNo = 0;
  const labels = route.map((s) => (s.days.length ? (d.file === "ice" ? (s.days[0] === "00" ? "Before" : `Day ${s.days[0]}`) : `Stop ${++stopNo}`) : "En route"));
  return (
    <div className="theme-terra-y">
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <TyHero eyebrow={`Terra Y · ${f.code} ${f.name} · Dossier ${d.no}`} title={d.title} line={d.line} image={d.hero} film={d.film}
          stats={[["Length", d.length], ["From", `${tyUsd(d.from)} pp`], ["Season", d.season], [d.file === "ice" ? "Camps" : "Group", d.file === "ice" ? d.base : d.group]]}>
          <Link href={plan} className="ty-btn">Hold a place <span aria-hidden>→</span></Link>
          <a href="#log" className="ty-btn-line" style={{ color: "var(--ty-frost)" }}>The route, day by day</a>
        </TyHero>

        {route.length > 1 && (
          <section className="ty-night border-t" style={{ borderColor: "var(--ty-chart)" }}>
            <div className="max-w-ledger mx-auto px-5 md:px-10 py-12 md:py-16">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <TyHead light={false} code="The chart · The whole route" title={d.file === "ice" ? "Cape Town to the Ice and Back" : "The Route, Landing by Landing"} />
                <p className="ty-mono text-[10px] max-w-xs" style={{ color: "var(--ty-glacier)" }}>{route.some((s) => s.mode === "sea") ? "Flown legs arc across the globe; the boat leg keeps to open water round the islands." : "Every leg is flown: arcs across the globe, as the aircraft goes."}</p>
              </div>
              <TyRouteOverview stops={route} labels={labels} title={d.title} />
            </div>
          </section>
        )}

        <section className="ty-chart">
          <div className="max-w-ledger mx-auto px-5 md:px-10 py-6 flex flex-wrap items-center justify-between gap-3">
            <Breadcrumbs trail={trail} />
            <Link href={`/pathways/${far.key}`} className="house-chip inline-flex items-center gap-2 px-3 py-1.5 text-[12.5px] border bg-white">
              <span className="h-[6px] w-[6px] rounded-full" style={{ background: far.accent }} aria-hidden /> {far.name}
            </Link>
          </div>
          <div className="max-w-ledger mx-auto px-5 md:px-10 pb-16 grid lg:grid-cols-[1.35fr_1fr] gap-10 items-start">
            <div>
              <TyHead code={`Briefing · ${d.operator}`} title="The Short Answer" />
              <p className="mt-5 text-[17.5px] leading-relaxed" style={{ color: "var(--ty-night)" }}>{d.answer}</p>
              {d.brief.map((p, i) => <p key={i} className="mt-4 text-[16px] leading-relaxed text-graphite">{p}</p>)}
            </div>
            <aside className={`bg-white p-6 ${d.file === "ice" ? "ty-edge-ice" : "ty-edge-dc3"}`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="ty-mono text-[10px]" style={{ color: "var(--ty-chart)" }}>Dossier</p>
                  <p className="ledger-display text-[2.2rem] leading-none mt-1" style={{ color: "var(--ty-night)" }}>{d.no}</p>
                </div>
                <VipStamp light />
              </div>
              <dl className="mt-5 border-t" style={{ borderColor: "var(--ty-ice)" }}>
                {d.facts.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5 border-b" style={{ borderColor: "var(--ty-mist)" }}>
                    <dt className="ty-mono text-[10px]" style={{ color: "var(--ty-chart)" }}>{k}</dt>
                    <dd className="text-[14.5px]" style={{ color: "var(--ty-night)" }}>{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4"><Credit file={d.file} /></p>
            </aside>
          </div>
        </section>

        <section id="log" className="ty-chart border-t-4" style={{ borderColor: d.file === "ice" ? "var(--ty-glacier)" : "var(--ty-signal)" }}>
          <div className="max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-20">
            <TyHead code="Ship's log · The route" title={d.file === "ice" ? "Day by Day on the Ice" : "Landing by Landing"} intro={d.file === "dc3" ? `${d.length}, ${d.base}.` : undefined} />
            {route.length > 1 ? (
              <TyRouteScroll stops={route} labels={labels}>
                <DayLog days={d.days} note={d.dayNote} file={d.file} compact stopOf={(x) => stopForDay(d.slug, x)} />
              </TyRouteScroll>
            ) : <DayLog days={d.days} note={d.dayNote} file={d.file} />}
          </div>
        </section>

        <section id="rates" className="ty-night">
          <div className="max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-20">
            <TyHead light={false} code="Manifest · Dates & rates" title="Every Departure, Every Published Rate" intro="As the brand publishes them, per person. Past departures drop off on their own." />
            <Manifest rates={d.rates} note={d.ratesNote} today={today()} />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={plan} className="ty-btn">Hold a place on {d.no} <span aria-hidden>→</span></Link>
            </div>
          </div>
        </section>

        <section id="vip" className="ty-chart">
          <div className="max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <TyHead code="VIP · Terra Y by James Wild & Co" title="What the House Adds" intro="The brand runs the journey. We plan everything around it, and hold it in one Folio." />
              <VipStamp light />
            </div>
            <Additions items={d.additions} />
          </div>
        </section>

        {d.file === "ice" && (
          <section className="ty-chart border-t" style={{ borderColor: "var(--ty-ice)" }}>
            <div className="max-w-ledger mx-auto px-5 md:px-10 py-12 grid md:grid-cols-[1fr_1.2fr] gap-8 items-center">
              <figure className="relative aspect-[3/2] overflow-hidden ty-fade"><Pic src={ty("south-pole-penguins/colony", 1400)} alt="Thousands of Emperor penguins on the ice, as far as the eye can see" sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" /></figure>
              <div>
                <p className="ty-mono text-[10.5px]" style={{ color: "var(--ty-chart)" }}>The stay record</p>
                <p className="ledger-display text-[1.8rem] mt-1" style={{ color: "var(--ty-night)" }}>White Desert in the Ledger</p>
                <p className="mt-2 text-[15.5px] text-graphite">The camps, the flight from Cape Town and how a booking runs, on White Desert&rsquo;s Ledger page.</p>
                <Link href="/stays/white-desert" className="ledger-btn mt-4 inline-flex">Open the White Desert record</Link>
              </div>
            </div>
          </section>
        )}

        <section className="ty-chart">
          <div className="max-w-ledger mx-auto px-5 md:px-10 py-14">
            <FaqBlock faqs={d.faqs} title={`${d.title}, Answered`} />
            {others.length > 0 && (
              <div className="mt-16">
                <TyHead code={`More from ${f.code} · ${f.name}`} title="Other Dossiers in This File" />
                <div className="mt-8 grid gap-6 md:grid-cols-3">{others.map((o) => <DossierCard key={o.slug} d={o} />)}</div>
              </div>
            )}
            <p className="mt-12"><Link href={TY_PATH} className="ledger-btn">Back to the Terra Y index</Link></p>
          </div>
        </section>
      </main>
      <JsonLd data={graph(breadcrumbs(trail), touristTrip({ path: tyPath(d.slug), name: `${d.title} (${d.operator})`, description: d.answer }))} />
    </div>
  );
}
