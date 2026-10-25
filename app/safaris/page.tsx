import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import SafeLink from "@/components/ledger/SafeLink";
import { HubShell, HubSection, RecordCard } from "@/components/hub/Hub";
import { JourneyCard } from "@/components/destination/Journeys";
import { HOME } from "@/lib/content/home";
import { journeysFor } from "@/lib/content/preview/journeys";
import { recordHref } from "@/lib/ledger/urls";
import { REGIONS, VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /safaris: Volume 02 hub shell. Reserves and camps, Africa's countries,
// the Botswana routes, and the hand-off to Wild & Co Safaris.
const PATH = "/safaris";
const V = VOLUMES.find((v) => v.href === PATH)!;
const SAFARI = ["lion-sands", "monwana-thornybush", "tengile-mala-mala-kirkmans-kamp", "tswalu-reserve"];
export const metadata = buildMetadata({ title: "Vetted African Safaris: Reserves and Camps | James Wild & Co", description: "Safari reserves and camps from the Sabi Sand to the Okavango, vetted by James since 2011, with Botswana routes and partner guides through Wild & Co Safaris.", path: PATH, noindex: true });

export default function SafarisHub() {
  const camps = HOME.shelf.entries.filter((s) => SAFARI.includes(s.slug));
  const africa = REGIONS.find((r) => r.slug === "africa")!;
  const routes = journeysFor("botswana");
  return (
    <>
      <SiteHeader />
      <HubShell name="Safaris" path={PATH} eyebrow="Volume 02 · Safaris" title="Africa's Reserves and Camps, Vetted Since 2011" intro={V.intro} browse={V.browse}
        answer="James Wild & Co's Safaris volume files African reserves and the camps inside them, from South Africa's Sabi Sand and Thornybush to Botswana's Okavango and Kalahari. James has designed safaris since 2011. Safaris are planned with James or an advisor and booked through Wild & Co Safaris, the house's safari platform, with partner guides on the ground."
        filling="Each reserve page lists its camps as their own Ledger entries; the reserve and camp pages fill from the Ledger export.">
        <HubSection eyebrow="From the Ledger" title="Reserves and Camps" id="camps-h">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{camps.map((s) => <li key={s.id}><RecordCard name={s.name} id={s.id} line={s.line} image={s.image} href={recordHref(s.kind ?? "stay", s.slug)} /></li>)}</ul>
        </HubSection>
        <HubSection eyebrow="Safari routes" title="Botswana, Drawn by the House" id="routes-h" more={{ label: "All Overland routes", href: "/overland" }}>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{routes.map((j) => <li key={j.ledgerId}><JourneyCard j={j} /></li>)}</ul>
        </HubSection>
        <HubSection eyebrow="By country" title="Where the House Goes on Safari" id="countries-h">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3">{africa.countries.map((c) => <li key={c.href}><SafeLink href={c.href} className="ledger-display text-[1.2rem] hover:ledger-crimson" fallback={<span className="ledger-display text-[1.2rem]">{c.label}</span>}>{c.label}</SafeLink></li>)}</ul>
          <p className="mt-8 text-[16px]">Planning a safari now? <a href="https://wildcosafaris.com" className="underline underline-offset-4 decoration-crimson/50 hover:ledger-crimson">Wild &amp; Co Safaris</a> is the house&rsquo;s safari booking platform. <Link href="/about/team" className="underline underline-offset-4 decoration-crimson/50 hover:ledger-crimson">Meet the partner guides</Link>.</p>
        </HubSection>
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Safaris" })} />
    </>
  );
}
