import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import FaqBlock from "@/components/ledger/FaqBlock";
import { HubShell, HubSection } from "@/components/hub/Hub";
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
  const sorted = [...rows].sort((a, b) => (a.collectionNumber || 999) - (b.collectionNumber || 999));
  const isMaiden = (t: TimelessVoyage) => t.sailingStatus === "launching" && (!t.launchDate || t.launchDate > on);
  const withCard = (t: TimelessVoyage) => { const r = registryShip(t.vesselSlug); return { t, card: r ? shipCard(r) : null }; };
  const sailing = sorted.filter((t) => !isMaiden(t)).map(withCard);
  const maiden = sorted.filter(isMaiden).map(withCard);
  const all = [...sailing, ...maiden];
  const nameOf = (x: { t: TimelessVoyage; card: ReturnType<typeof shipCard> }) => x.card?.name ?? x.t.vesselName ?? x.t.vesselSlug;
  const named = (xs: typeof all) => list(xs.map((x) => `${nameOf(x)}${x.t.operator ? ` (${x.t.operator})` : ""}`));
  const trail = [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: "Timeless Voyages", path }];
  const intro = "A small collection inside Voyages: ships chosen one at a time, each filed from her operator's own material with her suites, her sailings and her published fares.";
  const answer = all.length
    ? `Timeless Voyages is James Wild & Co's collection of ${all.length} ${all.length === 1 ? "ship" : "ships"}: ${named(all)}. Each ship page lists every suite or cabin, every published sailing and the fare as her operator publishes it. ${maiden.length ? `${list(maiden.map(nameOf))} ${maiden.length === 1 ? "is" : "are"} listed under Maiden Voyages, with the first season still ahead.` : "Ships whose first season is still ahead are listed under Maiden Voyages as they are filed."}`
    : "Timeless Voyages is James Wild & Co's collection of ships chosen one at a time. The first ships are being filed.";
  const faqs = [
    { q: "What is Timeless Voyages?", a: "A collection inside the Voyages volume of James Wild & Co. Ships are added one at a time, and each is filed from her operator's own site and media: suites, sailings, fares and what is included." },
    ...(all.length ? [{ q: "Which ships are in Timeless Voyages?", a: `${named(all)}.` }] : []),
    { q: "What is a Signature Edition?", a: "A ship in the collection with a fuller page: her signature suites, her numbers at a glance, and house stays for before and after the voyage." },
    { q: "What is a Maiden Voyage?", a: "A ship whose first season is still ahead. She is listed with her launch date and joins the main collection once she is sailing." },
    { q: "How are fares shown?", a: "As each operator publishes them, per person on most ships and per suite on some. The basis is stated on every ship page and nothing is converted." },
    { q: "How do I reserve a suite?", a: "Ask from any ship page. James confirms the suite, the fare and the operator's terms for your sailing before anything is held." },
  ];
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
      <HubShell name="Timeless Voyages" path={path} trail={trail} eyebrow={volumeEyebrow("voyages", "Voyages", "Timeless Voyages")} title="Timeless Voyages" intro={intro} answer={answer}
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
