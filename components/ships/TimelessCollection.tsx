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
import { PassportStamp } from "@/components/ledger/VolumeKit";
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

// The founder's line under the entrance. DRAFTED for James in his voice (he asked for a try, 14 Nov 2026); it leans only
// on a fact he has stated (sailing since 1989). It shows on the preview marked as a draft and stays off the real page
// until he approves it: set FOUNDER_NOTE_APPROVED to true only on his word.
export const FOUNDER_NOTE = "I've been sailing since 1989. Pick the ship for her harbours, then the suite for the mornings.";
export const FOUNDER_NOTE_APPROVED = false;
const BRASS = "#E0B978", NIGHT = "#0c1a24", CREAM = "#F1E9DA";
// Cloudinary delivers the entrance frames no wider than a phone or laptop needs, so the first paint is not a 8,000px original.
const lean = (url: string) => url.includes("/image/upload/") && !url.includes("c_limit") ? url.replace("/image/upload/", "/image/upload/c_limit,w_2000/") : url;

export default function TimelessCollection({ rows, path = TV_PATH, on = new Date().toISOString().slice(0, 10), draftNote = false }: { rows: TimelessVoyage[]; path?: string; on?: string; /** Preview only: show the founder's line while it is still a draft. */ draftNote?: boolean }) {
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
  const intro = "Welcome aboard. Timeless Voyages is for travelers who want the sea the way the great hotel houses do it: a suite of your own, a new harbour most mornings, and service that feels like a hotel you already love. We choose the ships one at a time and stay with you from the first question to the last night ashore.";
  // The welcome copy (James, 14 Nov 2026: "more welcoming... what we offer, why travelers should choose us, the benefits").
  // Drafted for his review. Every line is something the house already does or James has stated; no perks, credits or
  // prices are promised here, and nothing is put in his mouth as a quote.
  const FOR_WHOM: [string, string][] = [
    ["If a hotel suite is your measure", "These are ships built by hotel houses. Expect a real bedroom, a terrace, and service that runs on your clock."],
    ["If you travel as a family or with friends", "Suites that connect and studios for children, where the ship has them, chosen so everyone is on the same corridor."],
    ["If this is your first voyage", "Sailings of three to five nights, port to port, so you can try life at sea without giving it a fortnight."],
    ["If you have sailed everywhere", "New ships in their first seasons, listed under Maiden Voyages as each one is announced."],
  ];
  const WHY_US: [string, string][] = [
    ["One person, start to finish", "You deal with James and his team, not a call centre. Tell us who is travelling and when, and we come back with the sailing and the suite we would choose."],
    ["The whole picture before you commit", "Every suite with its size and who it sleeps, every published sailing, what the fare covers and what it does not, the deposit and the cancellation terms. Nothing is left for the small print."],
    ["Fares shown as the operator publishes them", "Per suite or per person, stated plainly on every ship page, and confirmed for your dates before anything is held."],
    ["The right suite, not just a suite", "Forward or aft, which deck, which suites join for a family: the details that decide how the voyage feels."],
    ["Before and beyond the ship", "The nights ashore either side, from the house's own Stays, and the days in port, planned as one journey with one itinerary."],
    ["Experience at sea", "James has been sailing since 1989 and travelling for 44 years. The collection is chosen by someone who goes."],
  ];
  const HOW: [string, string][] = [
    ["Tell us", "Who is travelling, roughly when, and what you want the days to feel like."],
    ["We propose", "The ship, the sailing and the suite we would choose, with the fare and the operator's terms in writing."],
    ["We hold and look after it", "Your suite is held with the operator, and we plan the nights ashore, the transfers and the days in port around it."],
  ];
  const answer = all.length
    ? `Timeless Voyages is James Wild & Co's collection of ${all.length} ${all.length === 1 ? "ship" : "ships"}: ${named(all)}. Each ship page lists every suite or cabin, every published sailing and the fare as her operator publishes it. ${realMaiden.length ? `${list(realMaiden.map(nameOf))} ${realMaiden.length === 1 ? "is" : "are"} listed under Maiden Voyages, with the first season still ahead.` : "Ships whose first season is still ahead are listed under Maiden Voyages as they are filed."}`
    : "Timeless Voyages is James Wild & Co's collection of ships chosen one at a time. The first ships are being filed.";
  const faqs = [
    { q: "What is Timeless Voyages?", a: "A collection inside the Voyages volume of James Wild & Co. Ships are added one at a time, and each is filed from her operator's own site and media: suites, sailings, fares and what is included." },
    ...(all.length ? [{ q: "Which ships are in Timeless Voyages?", a: `${named(all)}.` }] : []),
    { q: "What is a Signature Edition?", a: "A ship in the collection with a fuller page: her signature suites, her numbers at a glance, and house stays for before and after the voyage." },
    { q: "What is a Maiden Voyage?", a: "A ship whose first season is still ahead. She is listed with her launch date and joins the main collection once she is sailing." },
    { q: "How are fares shown?", a: "As each operator publishes them, per person on most ships and per suite on some. The basis is stated on every ship page and nothing is converted." },
    { q: "Why reserve a voyage through James Wild & Co?", a: "You deal with one person from the first question to the last night ashore. James and his team choose the sailing and the suite with you, set out the fare and the operator's terms in writing before anything is held, and plan the nights and days either side of the ship as one journey." },
    { q: "Who are these voyages for?", a: "Travelers who want hotel-level suites and service at sea: couples, families who need connecting suites, first-time cruisers who want a short sailing, and seasoned travelers looking for new ships and smaller harbours." },
    { q: "How do I reserve a suite?", a: "Ask from any ship page. James confirms the suite, the fare and the operator's terms for your sailing before anything is held." },
  ];
  // The entrance: each ship's own hero, one full-bleed frame after another as the reader scrolls (the Exceptional Few
  // arrival, reused), with the collection's name arriving over the last. Then the reel: a slow sideways scroll of the
  // ships' own pictures. Every picture, alt text and credit is the ship's filed one.
  const records = sailing.map((x) => ({ x, rec: shipBySlug(x.t.vesselSlug)?.data })).filter((y): y is { x: (typeof sailing)[number]; rec: NonNullable<ReturnType<typeof shipBySlug>>["data"] } => !!y.rec);
  const frames = records.slice(0, 3).map(({ rec }) => ({ src: lean(rec.hero.url), alt: rec.hero.alt, caption: rec.name, credit: rec.hero.credit }));
  const reel = records.flatMap(({ x, rec }) => [...rec.gallery.slice(0, 3), ...rec.cabins.map((c) => c.image).filter((i): i is NonNullable<typeof i> => !!i).slice(-2)].map((im) => ({ im, name: rec.name, href: x.card?.href ?? `/voyages/ships/${rec.slug}` })));
  const entrance = frames.length > 0 ? (
    <>
      <ScrollHero eager frames={frames} designation="Volume IV · Voyages · A collection" title="Timeless Voyages" place={`${all.length} ${all.length === 1 ? "ship" : "ships"}, chosen one at a time`} line="Each filed from her operator's own material: her suites, her sailings, her published fares."
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
      <section aria-label="The Timeless Voyages seal" className="py-12 md:py-16" style={{ background: "#132836", color: CREAM }}>
        <div className="max-w-ledger mx-auto px-5 md:px-10 grid gap-8 md:grid-cols-[auto_1fr] md:gap-14 items-center">
          <div className="justify-self-center md:justify-self-start" role="img" aria-label="The Timeless Voyages seal">
            <PassportStamp volume="voyages" top="Timeless Voyages" date="MMXXVI" place="James Wild & Co" size={236} rotate={-6} ink={BRASS} />
          </div>
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase" style={{ color: BRASS }}>A numbered collection · Inside Voyages</p>
            <p className="ledger-display mt-3 text-[1.7rem] leading-[1.15] md:text-[2.5rem] max-w-2xl">{"Ships with a hotel's manners and a yacht's harbours, chosen one at a time."}</p>
            {(FOUNDER_NOTE_APPROVED || draftNote) && (
              <figure className="mt-7 max-w-xl border-l pl-5" style={{ borderColor: BRASS }}>
                <blockquote className="ledger-display italic text-[1.25rem] md:text-[1.45rem] leading-snug">{FOUNDER_NOTE}</blockquote>
                <figcaption className="mt-2 text-[12px] tracking-[0.18em] uppercase opacity-75">JW{!FOUNDER_NOTE_APPROVED && " · draft line for James to approve; not on the live page"}</figcaption>
              </figure>
            )}
          </div>
        </div>
      </section>
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
      {xs.map((x) => <li key={x.t.vesselSlug}>
        {x.t.collectionNumber > 0 && x.t.collectionNumber < 900 && <p className="ledger-display text-[1.6rem] leading-none mb-3" style={{ color: BRASS }}><span className="text-[0.6em] tracking-[0.2em] uppercase align-middle mr-2 opacity-80">No.</span>{String(x.t.collectionNumber).padStart(3, "0")}</p>}
        {x.card ? <ShipCard c={x.card} timeless={exceptionalFewForVessel(x.t.vesselSlug) ? undefined : x.t} /> : <Plain t={x.t} />}</li>)}
    </ul>
  );
  return (
    <div className="theme-sea theme-sea-page jw-tv-night">
      {/* The evening room (James, 14 Nov 2026): navy ground and cream type for everything under the house header. */}
      <style>{`
        .jw-tv-night main { background: ${NIGHT}; color: ${CREAM}; --jw-card: #13293a; --jw-ground: ${NIGHT}; --jw-paper: ${NIGHT}; --jw-ink: ${CREAM}; --jw-hairline: rgba(241,233,218,.16); --jw-rule: rgba(241,233,218,.26); --jw-rule-fine: rgba(241,233,218,.16); --jw-keyline: rgba(241,233,218,.26); --jw-band-rgb: 19 41 58; --jw-band-alt-rgb: 12 26 36; }
        .jw-tv-night main :is(h1, h2, h3, .ledger-display, .text-ink, .text-graphite, summary, dt, dd, li, p, a) { color: inherit; }
        .jw-tv-night main .ledger-muted { color: rgba(241,233,218,.74); }
        .jw-tv-night main .ledger-eyebrow { color: rgba(241,233,218,.66); }
        .jw-tv-night main :is(.ledger-crimson, .text-crimson, .text-house) { color: ${BRASS}; }
        .jw-tv-night main :is(.border-crimson, [class*="border-crimson/"]) { border-color: ${BRASS}; }
        .jw-tv-night main .ledger-paper { background: #13293a; border-color: rgba(241,233,218,.16); box-shadow: none; color: ${CREAM}; }
        .jw-tv-night main .ledger-btn--solid { background: ${BRASS}; border-color: ${BRASS}; color: ${NIGHT}; }
        .jw-tv-night main :is(.ledger-btn-ghost, .ledger-btn:not(.ledger-btn--solid)) { color: ${CREAM}; border-color: rgba(241,233,218,.5); }
      `}</style>
      <SiteHeader />
      <HubShell name="Timeless Voyages" path={path} trail={trail} eyebrow={volumeEyebrow("voyages", "Voyages", "Timeless Voyages")} title="Timeless Voyages" intro={intro} answer={answer} entrance={entrance}
        filling="Ships join the collection one at a time, as each operator's own material is filed; nothing is listed before it is.">
        <HubSection eyebrow="Who it is for" title="Is a Timeless Voyage Right for You?" id="timeless-for-h">
          <ul className="grid gap-x-10 gap-y-7 sm:grid-cols-2 max-w-5xl">
            {FOR_WHOM.map(([k, v]) => <li key={k} className="border-l-2 border-crimson/50 pl-4"><p className="ledger-display text-[1.3rem] leading-snug">{k}</p><p className="mt-1.5 text-[15.5px] leading-relaxed ledger-muted">{v}</p></li>)}
          </ul>
        </HubSection>
        <HubSection eyebrow="Why James Wild & Co" title="What Do You Get When You Sail with Us?" id="timeless-why-h">
          <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map(([k, v], i) => <li key={k}><p className="ledger-eyebrow ledger-crimson">{String(i + 1).padStart(2, "0")}</p><p className="ledger-display text-[1.35rem] leading-snug mt-1">{k}</p><p className="mt-2 text-[15.5px] leading-relaxed ledger-muted">{v}</p></li>)}
          </ol>
        </HubSection>
        <HubSection eyebrow={`${sailing.length} ${sailing.length === 1 ? "ship" : "ships"} sailing`} title="Which Ships Are in the Collection?" id="timeless-ships-h">
          {sailing.length > 0 ? <Grid xs={sailing} /> : <p className="text-[15px] ledger-muted max-w-2xl">The first ships are being filed.</p>}
        </HubSection>
        <HubSection eyebrow="First seasons ahead" title="Maiden Voyages" id="maiden-voyages-h">
          {maiden.length > 0 ? <Grid xs={maiden} /> : <p className="border-l-2 border-crimson pl-4 text-[15px] max-w-2xl">No maiden voyage is filed yet. A ship appears here once her operator has published her first season, and moves to the collection above once she is sailing.</p>}
        </HubSection>
        <HubSection eyebrow="How it works" title="How Do You Reserve a Timeless Voyage?" id="timeless-how-h">
          <ol className="grid gap-8 md:grid-cols-3 max-w-5xl">
            {HOW.map(([k, v], i) => <li key={k} className="border-t ledger-rule pt-4"><p className="ledger-display text-[2rem] leading-none ledger-crimson">{i + 1}</p><p className="ledger-display text-[1.3rem] mt-2">{k}</p><p className="mt-1.5 text-[15.5px] leading-relaxed ledger-muted">{v}</p></li>)}
          </ol>
          <p className="mt-8"><Link href="/plan?trip=Timeless%20Voyages" className="ledger-btn ledger-btn--solid">Start with James</Link></p>
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
