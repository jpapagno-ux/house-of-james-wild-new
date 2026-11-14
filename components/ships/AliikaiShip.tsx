import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Ship, Users } from "lucide-react";
import { SessionsFor } from "@/components/workshops/SessionCard";
import IggiPanel from "@/components/iggi/IggiPanel";
import Signature from "@/components/record/Signature";
import FounderProof from "@/components/record/FounderProof";
import { FounderStamp, SectionHead } from "@/components/record/Sections";
import { sessionsFor } from "@/lib/content/workshops";
import { IGGI_ON } from "@/lib/iggi/flag";
import { ALIIKAI_SHIP } from "@/lib/content/ships/aliikai";
import { undash } from "@/lib/content/ships/types";
import { FILMS } from "@/lib/content/films";
import { absoluteUrl } from "@/lib/seo";
import { usd } from "@/lib/pricing";
import type { ShipExtra } from "./RecordShip";

// Aliikai's own sections, slotted into the shared ship template (RecordShip): her
// Komodo film as the hero, the founder stamp, the first-time route, life aboard, the
// voyages she sails through the year, the whole-yacht charter and James's voyage.
// Content is the page James approved on 27 Oct 2026; headings are questions and
// every line passes through undash() (voyages audit, 1 Nov 2026).
const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10";
const t = undash;

export function aliikaiExtra(): ShipExtra {
  const s = ALIIKAI_SHIP;
  const url = absoluteUrl(s.path);
  return {
    heroFilm: FILMS.aliikai,
    eyebrow: `Wild & Co Voyages · The vessel · ${s.ledgerId}`,
    stamp: <FounderStamp kind="Field verified" year={2024} volume="voyages" size={140} />,
    jsonld: [{
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${url}#voyages`,
      name: "Aliikai voyages",
      itemListElement: s.groups.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "TouristTrip",
          name: t(`${g.name} aboard Aliikai`),
          ...(s.pages[g.name] ? { url: absoluteUrl(s.pages[g.name].href) } : {}),
          description: t(`${g.nights} aboard the phinisi Aliikai, ${s.where[g.name]?.waters ?? "Indonesia"}. ${g.sailings.length} published sailing${g.sailings.length > 1 ? "s" : ""}.`),
          offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: Math.min(...g.sailings.map((x) => x.price)), highPrice: Math.max(...g.sailings.map((x) => x.price)), offerCount: g.sailings.length },
          provider: { "@type": "TravelAgency", name: "James Wild & Co", url: absoluteUrl("/") },
        },
      })),
    }],
    top: <FounderProof proof={s.proof} className="mt-10 max-w-3xl" />,
    lead: (
      // Why her Raja Ampat route works for a first visit
      <section id="first-time" className={SEC}>
        <SectionHead eyebrow={s.firstTime.eyebrow} title="Is Aliikai Right for a First Raja Ampat?" icon="lifebuoy" intro={t(s.firstTime.intro)} />
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {s.firstTime.points.map(([h, b], i) => (
            <li key={h} className="border ledger-border p-5 h-full">
              <p className="font-mono text-[11px] tracking-[0.14em] ledger-crimson">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="ledger-display text-[20px] mt-1">{t(h)}</h3>
              <p className="mt-2 text-[15px] leading-relaxed ledger-muted">{t(b)}</p>
            </li>
          ))}
        </ol>
        <Link href="/voyages/raja-ampat/aliikai-10-day-raja-ampat-north" className="mt-6 ledger-btn ledger-btn--solid">See the 10 Day Raja Ampat North</Link>
      </section>
    ),
    body: <>
      {/* Life aboard: the ship's story and her spaces */}
      <section id="aboard" className={SEC}>
        <SectionHead eyebrow={s.story.eyebrow} title="What Is Life Like Aboard Aliikai?" icon="hull" intro={t(s.story.intro)} />
        <div className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
          <p className="text-[16px] leading-relaxed ledger-muted">{t(s.story.body)}</p>
          <div className="space-y-2">
            {s.spaces.map((sp, i) => (
              <details key={sp.name} className="group border ledger-border open:border-crimson/50 open:bg-paper-card" open={i === 0}>
                <summary className="cursor-pointer list-none flex items-center gap-3 px-4 min-h-[56px] py-3 hover:bg-paper-card [&::-webkit-details-marker]:hidden">
                  <span className="flex-1 min-w-0"><span className="block ledger-display text-[18px]">{t(sp.name)}</span><span className="block text-[13px] ledger-muted">{t(sp.line)}</span></span>
                  <ChevronDown className="w-5 h-5 shrink-0 ledger-crimson transition-transform group-open:rotate-180" strokeWidth={1.5} aria-hidden="true" />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-[15px] leading-relaxed">{t(sp.body)}</p>
                  <div className={`mt-3 grid gap-2 ${sp.photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>{sp.photos.slice(0, 2).map((ph) => <div key={ph.url} className="relative aspect-[4/3]"><Image src={ph.url} alt={ph.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /></div>)}</div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Every voyage she sails */}
      <section id="voyages" className={SEC}>
        <SectionHead eyebrow="The voyages" title="Where Does Aliikai Sail Through the Year?" icon="signal-flag" intro="Komodo in the dry season, the Spice Islands in October and Raja Ampat when its seas are calmest. Open a voyage for its day by day." />
        <p className="mt-3 text-[15px]">Choosing between them? Read the <Link href="/destinations/asia/indonesia/raja-ampat" className="underline underline-offset-4 hover:ledger-crimson">Raja Ampat guide</Link>, the <Link href="/destinations/asia/indonesia/komodo" className="underline underline-offset-4 hover:ledger-crimson">Komodo guide</Link> or <Link href="/destinations/asia/indonesia" className="underline underline-offset-4 hover:ledger-crimson">Indonesia by sea</Link>.</p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {s.groups.map((g) => {
            const p = s.pages[g.name];
            const w = s.where[g.name];
            const from = Math.min(...g.sailings.map((x) => x.price));
            const inner = (
              <>
                <p className="ledger-eyebrow ledger-crimson">{t(`${w?.waters} · ${g.nights}`)}</p>
                <p className="ledger-display text-[21px] mt-1">{t(g.name.replace("↔", "to"))}</p>
                <p className="text-[14px] ledger-muted mt-1">{t(`${w?.months} · from ${w?.from}`)}</p>
                <p className="mt-4 pt-3 border-t ledger-border flex items-baseline justify-between gap-3"><span><span className="ledger-eyebrow">From </span><span className="ledger-display ledger-crimson text-[18px]">{usd(from)}</span></span><span className="text-[13px] text-right">{p ? <>{p.name} →</> : "Day by day to come"}</span></p>
              </>
            );
            return <li key={g.name}>{p ? <Link href={p.href} className="block h-full border ledger-border p-5 hover:border-crimson/60 transition-colors">{inner}</Link> : <div className="h-full border ledger-border p-5">{inner}</div>}</li>;
          })}
        </ul>
      </section>
    </>,
    after: <>
      {/* Private charter */}
      <section id="charter" className={SEC}>
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-8 items-center ledger-paper border ledger-border p-6 md:p-8">
          <div>
            <p className="ledger-eyebrow ledger-crimson flex items-center gap-2"><Users className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Private charter</p>
            <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2">Can You Charter the Whole Yacht?</h2>
            <p className="mt-3 text-[16px] leading-relaxed">{t(s.charter.text)}</p>
            <Link href="/plan?trip=Aliikai%20private%20charter" className="mt-6 ledger-btn ledger-btn--solid">Ask about a charter</Link>
          </div>
          <p className="md:text-right"><span className="ledger-eyebrow block">The whole yacht</span><span className="ledger-display text-5xl ledger-crimson">{usd(s.charter.rate)}</span><span className="block text-[13px] ledger-muted">per night · up to 15 guests · + 11% tax</span></p>
        </div>
      </section>

      {/* Sailed by James */}
      <section id="founder" className={`${SEC} grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start`}>
        <div>
          <div className="flex items-center gap-2"><Ship className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /><p className="ledger-eyebrow">Vetted & sailed by the founder</p></div>
          <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2">Has James Sailed Aboard Aliikai?</h2>
          <p className="mt-4 text-[17px] leading-relaxed">{t(s.founder.p1)}</p>
          <p className="mt-3 text-[17px] leading-relaxed">{t(s.founder.p2)}</p>
          <p className="mt-5 italic ledger-display text-[20px] leading-snug">&ldquo;{t(s.quote)}&rdquo;</p>
          <Signature className="w-32 mt-3" />
        </div>
        <div className="relative aspect-[4/5] border ledger-border"><Image src={s.gallery[1]?.url ?? s.gallery[0].url} alt={s.gallery[1]?.alt ?? s.gallery[0].alt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" /></div>
      </section>

      <SessionsFor sessions={sessionsFor(s.path)} name={s.name} />
      {IGGI_ON && <IggiPanel ctx={{ entityType: "voyage", entitySlug: s.slug, ledgerId: s.ledgerId, sourcePage: s.path, volume: "voyages" }} heading={`Ask Iggi about ${s.name}`} />}
    </>,
  };
}
