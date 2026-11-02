import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { PlanClose } from "@/components/about/Parts";
import { SectionHead } from "@/components/record/Sections";
import { GalleryMosaic } from "@/components/record/Frame";
import ShipCard from "@/components/ships/ShipCard";
import { shipCard, type ShipCardData } from "@/lib/content/ships/cards";
import { registryShip } from "@/lib/content/ships/registry";
import { partnerPath, type Partner } from "@/lib/content/partners";
import { volumeInk } from "@/lib/volumes";
import { absoluteUrl } from "@/lib/seo";
import { graph } from "@/lib/schema";

// The reusable partner page (/partners/<slug>, James, 2 Nov 2026): who they are, how they work,
// the fleet (ship pages), the itineraries (their pages on this site), what sets them apart in
// their own words, why the house works with them (neutral, factual), FAQs, and Organization +
// FAQPage schema. Everything comes from the partner record (lib/content/partners), so the next
// partner is data alone. No commission, net rates or contact names; no invented quotes.

const SEC = "mt-14 md:mt-20 border-t ledger-rule pt-8 md:pt-10";

export default function PartnerPage({ p }: { p: Partner }) {
  const path = partnerPath(p.slug);
  const ink = volumeInk("voyages");
  const fleet = (p.fleet ?? []).map((s) => registryShip(s)).filter((r): r is NonNullable<typeof r> => !!r).map(shipCard).filter((c): c is ShipCardData => !!c);
  const trail = [{ name: "Home", path: "/" }, { name: "Partners", path: "/partners" }, { name: p.name, path }];
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={trail} touch /></div>
          <header className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-end">
            <div>
              <p className="ledger-eyebrow ledger-crimson">Partner · {p.kind}</p>
              <h1 className="ledger-h1 mt-3">{p.name}</h1>
              <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed">{p.line}</p>
            </div>
            <figure>
              <div className="relative aspect-[16/10] bg-paper-card overflow-hidden"><Image src={p.hero.url} alt={p.hero.alt} fill priority sizes="(min-width: 1024px) 52vw, 92vw" className="object-cover" /></div>
              <figcaption className="mt-1.5 text-[12px] ledger-muted">Photograph: {p.hero.credit ?? p.credit}</figcaption>
            </figure>
          </header>
          <AnswerBlock>{p.answer}</AnswerBlock>

          <section className={SEC} aria-labelledby="who-h">
            <SectionHead eyebrow="Who they are" title={`Who Are ${p.name}?`} icon="mountain-sun" />
            <div className="mt-6 grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12">
              <dl className="border-t ledger-rule">
                {p.who.facts.map(([k, v]) => <div key={k} className="grid sm:grid-cols-[9rem_minmax(0,1fr)] gap-x-4 gap-y-0.5 py-3 border-b ledger-rule"><dt className="ledger-eyebrow">{k}</dt><dd className="text-[15.5px] leading-relaxed">{v}</dd></div>)}
              </dl>
              {p.who.history && (
                <div>
                  <p className="ledger-eyebrow">Their timeline, as they tell it</p>
                  <ol className="mt-3 border-l ledger-rule pl-4 space-y-2.5">
                    {p.who.history.map(([y, x]) => <li key={y + x} className="text-[14.5px] leading-snug"><span className="font-mono text-[12.5px] ledger-crimson mr-2">{y}</span>{x}</li>)}
                  </ol>
                </div>
              )}
            </div>
          </section>

          <section className={SEC} aria-labelledby="how-h">
            <SectionHead eyebrow="How they work" title={`How Does ${p.name} Work?`} icon="wave" />
            <div className="mt-6 grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start">
              <div className="space-y-4 text-[16.5px] leading-relaxed max-w-2xl">{p.how.paragraphs.map((x) => <p key={x.slice(0, 32)}>{x}</p>)}</div>
              {p.how.facts && <dl className="ledger-paper border ledger-border p-5">{p.how.facts.map(([k, v]) => <div key={k} className="py-2.5 border-b ledger-rule last:border-0"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-0.5 text-[15px] leading-snug">{v}</dd></div>)}</dl>}
            </div>
          </section>

          {fleet.length > 0 && (
            <section className={SEC} aria-labelledby="fleet-h">
              <SectionHead eyebrow="The fleet" title={`Which Ships Does ${p.name} Sail?`} icon="wave" />
              <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{fleet.map((c) => <li key={c.slug}><ShipCard c={c} /></li>)}</ul>
              <p className="mt-3 text-[12px] ledger-muted">Photographs: {p.credit}.{p.fleetNote ? ` ${p.fleetNote}` : ""}</p>
            </section>
          )}

          {p.itineraries && p.itineraries.items.length > 0 && (
            <section className={SEC} aria-labelledby="itin-h">
              <SectionHead eyebrow="Their voyages on the Ledger" title={p.itineraries.title} icon="sun" />
              <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {p.itineraries.items.map((x) => (
                  <li key={x.href}>
                    <Link href={x.href} className="group h-full flex gap-3 border ledger-border p-3 hover:border-crimson/60 bg-paper" style={{ borderLeftColor: ink, borderLeftWidth: 3 }}>
                      {x.image && <span className="relative w-24 shrink-0 aspect-square bg-paper-card overflow-hidden"><Image src={x.image.url} alt={x.image.alt} fill sizes="96px" className="object-cover" /></span>}
                      <span className="min-w-0 flex flex-col">
                        <span className="ledger-eyebrow" style={{ color: ink }}>{x.eyebrow}</span>
                        <span className="ledger-display text-[18px] leading-snug mt-0.5">{x.name}</span>
                        <span className="mt-auto pt-1.5 text-[13.5px] ledger-muted">{[...(x.facts ?? []).map(([k, v]) => `${v} ${k.toLowerCase()}`), x.price].filter(Boolean).join(" · ")}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {p.itineraries.href && <p className="mt-4"><Link href={p.itineraries.href} className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline" style={{ color: ink }}>{p.itineraries.hrefLabel ?? "See them all"}<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link></p>}
            </section>
          )}

          <section className={SEC} aria-labelledby="apart-h">
            <SectionHead eyebrow="In their words" title={`What Sets ${p.name} Apart, by Their Account?`} icon="tree-ring" />
            <ul className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {p.apart.map((x) => (
                <li key={x.claim} className="border-l-2 border-crimson pl-4 py-1">
                  <blockquote className="ledger-display text-[19px] leading-snug">&ldquo;{x.claim}&rdquo;</blockquote>
                  <p className="mt-1.5 text-[12.5px] ledger-muted">{p.name}, {x.attribution}</p>
                </li>
              ))}
            </ul>
            {p.sustainability && p.sustainability.length > 0 && (
              <div className="mt-8">
                <p className="ledger-eyebrow">On sustainability, {p.name} says</p>
                <ul className="mt-3 grid gap-2 md:grid-cols-2 text-[15px]">{p.sustainability.map((x) => <li key={x} className="flex gap-2"><span className="ledger-crimson" aria-hidden="true">✦</span>{x}</li>)}</ul>
              </div>
            )}
          </section>

          <section className={SEC} aria-labelledby="why-h">
            <SectionHead eyebrow="Why the house works with them" title={`Why Does James Wild & Co Work With ${p.name}?`} icon="sun" />
            <ul className="mt-6 space-y-3 max-w-3xl text-[16.5px] leading-relaxed">{p.why.map((x) => <li key={x} className="flex gap-3"><span className="ledger-crimson" aria-hidden="true">✦</span>{x}</li>)}</ul>
            {p.related && <p className="mt-6 flex flex-wrap gap-x-6">{p.related.map((r) => <Link key={r.href} href={r.href} className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline" style={{ color: ink }}>{r.label}<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>)}</p>}
          </section>

          {p.gallery.length > 0 && <div className="mt-14"><GalleryMosaic images={p.gallery} title={p.name} /><p className="mt-2 text-[12px] ledger-muted">Photographs: {p.credit}</p></div>}

          <FaqBlock faqs={p.faqs.map(([q, a]) => ({ q, a }))} title={`What Else Should You Know About ${p.name}?`} />
          <PlanClose />
        </div>
      </main>
      <JsonLd data={graph({
        "@type": "Organization", "@id": absoluteUrl(`${path}#organization`), name: p.name, description: p.answer, url: absoluteUrl(path), image: p.hero.url,
        ...(p.organization.foundingDate ? { foundingDate: p.organization.foundingDate } : {}),
        ...(p.organization.locality || p.organization.country ? { address: { "@type": "PostalAddress", addressLocality: p.organization.locality, addressCountry: p.organization.country } } : {}),
        ...(p.organization.memberOf?.length ? { memberOf: p.organization.memberOf.map((m) => ({ "@type": "Organization", name: m })) } : {}),
      })} />
    </>
  );
}
