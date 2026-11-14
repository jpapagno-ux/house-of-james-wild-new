import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import FaqBlock from "@/components/ledger/FaqBlock";
import { HubShell, HubSection } from "@/components/hub/Hub";
import Image from "next/image";
import Link from "next/link";
import ScrollHero from "@/components/exceptional-few/ScrollHero";
import { shipBySlug } from "@/lib/content/ships";
import ShipCard from "./ShipCard";
import TimelessStamp from "./TimelessStamp";
import { shipCard } from "@/lib/content/ships/cards";
import { registryShip } from "@/lib/content/ships/registry";
import { exceptionalFewForVessel } from "@/lib/content/exceptional-few";
import type { TimelessVoyage } from "@/lib/content/timeless-voyages";
import { TV_PATH } from "@/lib/content/timeless-voyages-flag";
import { volumeEyebrow } from "@/lib/volumes";
import { absoluteUrl } from "@/lib/seo";
import { graph } from "@/lib/schema";

// The Timeless Voyages collection page (James, 13 Nov 2026): the question answered first, the ships of the collection
// as cards with their stamps, and Maiden Voyages for ships whose first season is still ahead. Every ship comes from a
// Timeless Voyages row (Airtable, through the export) and her own filed record; nothing is listed that is not filed.
// Structured data: CollectionPage with an ItemList, the BreadcrumbList from the trail, and FAQPage from the FAQs.
const fmt = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const list = (xs: string[]) => xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

export default function TimelessCollection({ rows, path = TV_PATH, on = new Date().toISOString().slice(0, 10) }: { rows: TimelessVoyage[]; path?: string; on?: string }) {
  // A design-sample row (the preview's ?maiden=1) shows as a card only: never in the answer, the FAQs or the schema.
  const real = <T extends { t: TimelessVoyage }>(xs: T[]) => xs.filter((x) => !x.t.id.startsWith("sample"));
  const sorted = [...rows].sort((a, b) => (a.collectionNumber || 999) - (b.collectionNumber || 999));
  const isMaiden = (t: TimelessVoyage) => t.sailingStatus === "launching" && (!t.launchDate || t.launchDate > on);
  const withCard = (t: TimelessVoyage) => { const r = registryShip(t.vesselSlug); return { t, card: r ? shipCard(r) : null }; };
  const sailing = sorted.filter((t) => !isMaiden(t)).map(withCard);
  const maiden = sorted.filter(isMaiden).map(withCard);
  const all = real([...sailing, ...maiden]);
  const realMaiden = real(maiden);
  const nameOf = (x: { t: TimelessVoyage; card: ReturnType<typeof shipCard> }) => x.card?.name ?? x.t.vesselName ?? x.t.vesselSlug;
  const named = (xs: typeof all) => list(xs.map((x) => `${nameOf(x)}${x.t.operator ? ` (${x.t.operator})` : ""}`));
  const trail = [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: "Timeless Voyages", path }];
  const intro = "A small collection inside Voyages: ships chosen one at a time, each filed from her operator's own material with her suites, her sailings and her published fares.";
  const answer = all.length
    ? `Timeless Voyages is James Wild & Co's collection of ${all.length} ${all.length === 1 ? "ship" : "ships"}: ${named(all)}. Each ship page lists every suite or cabin, every published sailing and the fare as her operator publishes it. ${realMaiden.length ? `${list(realMaiden.map(nameOf))} ${realMaiden.length === 1 ? "is" : "are"} listed under Maiden Voyages, with the first season still ahead.` : "Ships whose first season is still ahead are listed under Maiden Voyages as they are filed."}`
    : "Timeless Voyages is James Wild & Co's collection of ships chosen one at a time. The first ships are being filed.";
  const faqs = [
    { q: "What is Timeless Voyages?", a: "A collection inside the Voyages volume of James Wild & Co. Ships are added one at a time, and each is filed from her operator's own site and media: suites, sailings, fares and what is included." },
    ...(all.length ? [{ q: "Which ships are in Timeless Voyages?", a: `${named(all)}.` }] : []),
    { q: "What is a Signature Edition?", a: "A ship in the collection with a fuller page: her signature suites, her numbers at a glance, and house stays for before and after the voyage." },
    { q: "What is a Maiden Voyage?", a: "A ship whose first season is still ahead. She is listed with her launch date and joins the main collection once she is sailing." },
    { q: "How are fares shown?", a: "As each operator publishes them, per person on most ships and per suite on some. The basis is stated on every ship page and nothing is converted." },
    { q: "How do I reserve a suite?", a: "Ask from any ship page. James confirms the suite, the fare and the operator's terms for your sailing before anything is held." },
  ];
  // The entrance: each ship's own hero, one full-bleed frame after another as the reader scrolls (the Exceptional Few
  // arrival, reused), with the collection's name arriving over the last. Then the reel: a slow sideways scroll of the
  // ships' own pictures. Every picture, alt text and credit is the ship's filed one.
  const records = sailing.map((x) => ({ x, rec: shipBySlug(x.t.vesselSlug)?.data })).filter((y): y is { x: (typeof sailing)[number]; rec: NonNullable<ReturnType<typeof shipBySlug>>["data"] } => !!y.rec);
  const frames = records.slice(0, 4).map(({ rec }) => ({ src: rec.hero.url, alt: rec.hero.alt, caption: rec.name, credit: rec.hero.credit }));
  const reel = records.flatMap(({ x, rec }) => [...rec.gallery.slice(0, 3), ...rec.cabins.map((c) => c.image).filter((i): i is NonNullable<typeof i> => !!i).slice(-2)].map((im) => ({ im, name: rec.name, href: x.card?.href ?? `/voyages/ships/${rec.slug}` })));
  const entrance = frames.length > 0 ? (
    <>
      <ScrollHero frames={frames} designation="Volume IV · Voyages · A collection" title="Timeless Voyages" place={`${all.length} ${all.length === 1 ? "ship" : "ships"}, chosen one at a time`} line="Each filed from her operator's own material: her suites, her sailings, her published fares."
        actions={<><a href="#timeless-ships-h" className="ledger-btn-ghost !text-white !border-white/70">See the ships</a><a href="#maiden-voyages-h" className="ledger-btn-ghost !text-white !border-white/70">Maiden Voyages</a></>} />
      {reel.length > 2 && (
        <section aria-label="The ships of Timeless Voyages, in pictures" className="jw-tv-reel relative py-8 md:py-12" style={{ background: "linear-gradient(180deg, #0c1a24, #132836)" }}>
          <style>{`
            .jw-tv-reel ul { scrollbar-width: none; -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
            .jw-tv-reel ul::-webkit-scrollbar { display: none; }
            .jw-tv-reel img { transition: transform 1.6s cubic-bezier(.2,.7,.2,1); }
            .jw-tv-reel a:hover img, .jw-tv-reel a:focus-visible img { transform: scale(1.05); }
            @media (prefers-reduced-motion: reduce) { .jw-tv-reel img { transition: none; } .jw-tv-reel a:hover img { transform: none; } }
          `}</style>
          <p className="max-w-ledger mx-auto px-5 md:px-10 text-[11px] tracking-[0.28em] uppercase text-white/70">Aboard · scroll sideways</p>
          <ul className="mt-5 flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory px-5 md:px-10 pb-2" tabIndex={0}>
            {reel.map(({ im, name, href }, i) => (
              <li key={`${im.url}-${i}`} className={`snap-center shrink-0 ${i % 3 === 0 ? "w-[82vw] md:w-[46rem]" : "w-[62vw] md:w-[30rem]"}`}>
                <Link href={href} className="group block text-white">
                  <span className="relative block overflow-hidden rounded-sm aspect-[4/3] md:aspect-[3/2]">
                    <Image src={im.url} alt={im.alt} fill sizes="(min-width: 768px) 46rem, 82vw" className="object-cover" />
                    <span className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(8,18,26,.78))" }} />
                    <span className="absolute left-4 bottom-3 ledger-display text-[1.25rem] md:text-[1.5rem]">{name}</span>
                  </span>
                  <span className="mt-2 block text-[10.5px] tracking-[0.08em] text-white/60">{im.credit}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  ) : undefined;
  const Plain = ({ t }: { t: TimelessVoyage }) => (
    <article className="h-full ledger-paper border ledger-border p-5 flex flex-col gap-3">
      <TimelessStamp tv={t} shipName={t.vesselName ?? t.vesselSlug} size={96} ink="currentColor" />
      <h3 className="ledger-display text-2xl">{t.vesselName ?? t.vesselSlug}</h3>
      {t.operator && <p className="ledger-eyebrow">{t.operator}</p>}
      {t.heroLine && <p className="text-[15px] leading-relaxed ledger-muted">{t.heroLine}</p>}
      <p className="mt-auto text-[13px] ledger-muted">{t.launchDate ? `First sailing ${fmt(t.launchDate)}. ` : ""}Ship page to follow.</p>
    </article>
  );
  const Grid = ({ xs }: { xs: typeof all }) => (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {xs.map((x) => <li key={x.t.vesselSlug}>{x.card ? <ShipCard c={x.card} timeless={exceptionalFewForVessel(x.t.vesselSlug) ? undefined : x.t} /> : <Plain t={x.t} />}</li>)}
    </ul>
  );
  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader />
      <HubShell name="Timeless Voyages" path={path} trail={trail} eyebrow={volumeEyebrow("voyages", "Voyages", "Timeless Voyages")} title="Timeless Voyages" intro={intro} answer={answer} entrance={entrance}
        filling="Ships join the collection one at a time, as each operator's own material is filed; nothing is listed before it is.">
        <HubSection eyebrow={`${sailing.length} ${sailing.length === 1 ? "ship" : "ships"} sailing`} title="Which Ships Are in the Collection?" id="timeless-ships-h">
          {sailing.length > 0 ? <Grid xs={sailing} /> : <p className="text-[15px] ledger-muted max-w-2xl">The first ships are being filed.</p>}
        </HubSection>
        <HubSection eyebrow="First seasons ahead" title="Maiden Voyages" id="maiden-voyages-h">
          {maiden.length > 0 ? <Grid xs={maiden} /> : <p className="border-l-2 border-crimson pl-4 text-[15px] max-w-2xl">No maiden voyage is filed yet. A ship appears here once her operator has published her first season, and moves to the collection above once she is sailing.</p>}
        </HubSection>
        <FaqBlock faqs={faqs} title="What Else Should You Know About Timeless Voyages?" />
      </HubShell>
      <JsonLd data={graph(
        { "@type": "CollectionPage", "@id": absoluteUrl(`${path}#page`), url: absoluteUrl(path), name: "Timeless Voyages", description: intro,
          mainEntity: { "@type": "ItemList", name: "The ships of Timeless Voyages", numberOfItems: all.length, itemListElement: all.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: nameOf(x), ...(x.card ? { url: absoluteUrl(x.card.href) } : {}) })) } },
      )} />
    </div>
  );
}
