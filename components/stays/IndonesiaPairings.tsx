import Link from "next/link";
import { RecordCard } from "@/components/hub/Hub";
import { stayBySlug, vesselBySlug } from "@/lib/content/stays";
import { vessel } from "@/lib/content/vessels";
import { shipBySlug, shipPath } from "@/lib/content/ships";
import { pairingFor, vesselsFor, SEASONS, SISTER, type Pairing } from "@/lib/content/indonesia-pairings";

// The Indonesia cross-sell blocks (B7): "Stay before you sail" on the yacht pages, "Continue by sea"
// on the Bali, Sumba and Rote stays. Only released stays and vessels with a page render; a block
// with nothing to show renders nothing. Stays ink green, voyages navy (lib/volumes.ts via RecordCard).

type Card = { key: string; name: string; id: string; line: string; image: { url: string; alt: string }; href: string; eyebrow?: string; volume: "stays" | "voyages" };

function stayCard(slug: string): Card | null {
  const s = stayBySlug(slug);
  if (!s?.hero) return null;
  return { key: s.slug, name: s.name, id: s.ledgerId ?? "", line: s.tagline ?? "", image: { url: s.hero, alt: s.name }, href: `/stays/${s.slug}`, eyebrow: s.country ?? undefined, volume: "stays" };
}

function vesselCard(p: Pairing): Card | null {
  const seasons = p.seasons.map((k) => `${SEASONS[k].label} ${SEASONS[k].short}`).join(" · ");
  const ship = shipBySlug(p.vessel);
  if (ship) return { key: ship.slug, name: ship.data.name, id: (ship.reg as { ledgerId?: string }).ledgerId ?? "", line: p.region, image: { url: ship.data.hero.url, alt: ship.data.hero.alt }, href: shipPath(ship.slug), eyebrow: seasons || "Voyage", volume: "voyages" };
  const v = vesselBySlug(p.vessel);
  if (!v?.hero) return null;
  return { key: v.slug, name: vessel(v.slug)?.name ?? v.name, id: v.ledgerId ?? "", line: p.region, image: { url: v.hero, alt: v.name }, href: `/stays/${v.slug}`, eyebrow: seasons || "Voyage", volume: "voyages" };
}

function Block({ id, eyebrow, title, intro, cards }: { id: string; eyebrow: string; title: string; intro: string; cards: Card[] }) {
  if (!cards.length) return null;
  return (
    <section id={id} className="mt-16 md:mt-24" aria-labelledby={`${id}-h`}>
      <p className="ledger-eyebrow ledger-crimson">{eyebrow}</p>
      <h2 id={`${id}-h`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">{title}</h2>
      <p className="mt-3 text-[16px] leading-relaxed ledger-muted max-w-3xl">{intro}</p>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ key, ...c }) => <li key={key}><RecordCard {...c} /></li>)}
      </ul>
      <Link href="/plan?place=Indonesia" className="ledger-btn ledger-btn--house mt-8">Plan with James</Link>
    </section>
  );
}

/** On a yacht page: the Bali (or Aman) stays before she sails, and Sumba after a Komodo leg. */
export function StayBeforeYouSail({ vessel, name }: { vessel: string; name: string }) {
  const p = pairingFor(vessel);
  if (!p) return null;
  const before = p.before.map(stayCard).filter((c): c is Card => !!c);
  const after = p.after.map(stayCard).filter((c): c is Card => !!c);
  const seasons = p.seasons.map((k) => `${SEASONS[k].label}: ${SEASONS[k].months}`).join(". ");
  return (
    <>
      <Block id="stay-before" eyebrow="Indonesia, before you sail" title="Stay Before You Sail" intro={`${p.note}${seasons ? ` Best seasons, per Indonesia's tourism board. ${seasons}.` : ""}${p.embark ? ` ${name} embarks at ${p.embark}.` : ""}`} cards={before} />
      <Block id="stay-after" eyebrow="Indonesia, after the voyage" title="Then Stay a While" intro="Sumba's surf coast, an easy leg after a Komodo voyage." cards={after} />
    </>
  );
}

/** On a Bali, Sumba or Rote stay: the Indonesian yachts that pair with it, with their seasons. */
export function ContinueBySea({ stay }: { stay: string }) {
  const sister = SISTER[stay];
  const sisterCard = sister ? stayCard(sister.slug) : null;
  const vessels = vesselsFor(stay).map(vesselCard).filter((c): c is Card => !!c);
  const cards = [...(sisterCard ? [{ ...sisterCard, line: sister!.line }] : []), ...vessels];
  return <Block id="continue-by-sea" eyebrow="Indonesia, by sea" title="Continue by Sea" intro="The house's Indonesian yachts, each with its best season per Indonesia's tourism board. Komodo voyages leave from Labuan Bajo, about 1.5 hours from Bali by air; Raja Ampat voyages from Sorong." cards={cards} />;
}
