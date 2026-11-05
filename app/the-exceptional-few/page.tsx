import SafeLink from "@/components/ledger/SafeLink";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { PlanClose } from "@/components/about/Parts";
import EFCollectionCard from "@/components/exceptional-few/EFCollectionCard";
import { EFStamp } from "@/components/exceptional-few/EFBadge";
import { EF_CARDS, EF_PATH } from "@/lib/content/exceptional-few-cards";
import { SIGNAL_LABEL, type SignalKey } from "@/lib/content/exceptional-few";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /the-exceptional-few: the home of the numbered collection (James approved, 4 Nov 2026). Not a volume: each
// place stays filed in its own volume (Amangiri in Stays, Hermes in Voyages) and wears the stamp wherever it
// appears. Numbers stand as they were given; gaps are left as they are. Everything is read from
// lib/content/exceptional-few-cards.ts.

const stays = EF_CARDS.filter((c) => c.kind === "Stay");
const ships = EF_CARDS.filter((c) => c.kind === "Ship");
const countries = [...new Set(EF_CARDS.map((c) => c.country).filter(Boolean))] as string[];

const ANSWER = `The Exceptional Few is James Wild & Co's numbered collection of the stays and ships that are genuinely singular: places with no real equivalent anywhere else. There are ${EF_CARDS.length} today, ${stays.length} stays and ${ships.length} ships across ${countries.length} countries. Each one stays filed in its own volume and carries a hand-numbered stamp, signed J.W., wherever it appears on the site.`;

const SIGNALS: Record<SignalKey, string> = {
  place: "Somewhere you could not move it from. The setting is the reason, not the backdrop.",
  privacy: "Few rooms, wide space, no crowd. You share it with very few people, or no one.",
  design: "Architecture and interiors that belong to the place and could not be dropped anywhere else.",
  access: "What it opens up: the reef, the canyon, the island, the vineyard, reached the right way.",
  humanity: "The people: hosts, guides and crew who make it feel personal rather than processed.",
  rarity: "There is no second one. Not a brand's flagship among many, but the only one of its kind.",
};

// Ways to travel two of them together: a country with more than one, then James's own pairings.
const together = [
  ...countries.map((country) => ({ title: country.replace(/\s*\(.*\)$/, ""), items: EF_CARDS.filter((c) => c.country === country) })).filter((g) => g.items.length > 1),
];

const FAQS = [
  { q: "What is The Exceptional Few?", a: ANSWER },
  { q: "How does a place join The Exceptional Few?", a: "It is already in the Ledger, vetted by James or a named partner, and it is judged against six signals: place, privacy, design, access, humanity and rarity. The signals are written in words, never as a score. A place is designated, numbered in the order it was chosen, and reviewed again over time." },
  { q: "Is The Exceptional Few a separate volume?", a: "No. A place keeps its home in its own volume: Amangiri stays in Stays and Hermes stays in Voyages. The collection runs across every volume, the way a star sits beside a restaurant in its city guide." },
  { q: `Which places are in The Exceptional Few?`, a: EF_CARDS.map((c) => `${c.label} ${c.name} (${c.place})`).join("; ") + "." },
  { q: "Why are some numbers missing?", a: "Numbers stand as they were given when each place was chosen. The collection shows only the places that are designated and published today." },
  { q: "Can I book one of them through James Wild & Co?", a: "Yes. Every place in the collection is booked through James Wild & Co, with the same planning as any other Ledger stay or voyage. Use Plan with James, or open the place and choose Plan this stay." },
];

export const metadata = buildMetadata({
  title: "The Exceptional Few: James Wild & Co's Numbered Collection of Singular Stays and Ships",
  description: `${EF_CARDS.length} hand-numbered stays and ships with no real equivalent anywhere, from ${EF_CARDS.slice(0, 3).map((c) => c.name).join(", ")} to ${EF_CARDS[EF_CARDS.length - 1]?.name}. Chosen and signed by James Wild & Co.`,
  path: EF_PATH,
});

function Grid({ items, id }: { items: typeof EF_CARDS; id: string }) {
  return <ul id={id} className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">{items.map((c, i) => <li key={c.id} id={c.label.replace(/\W+/g, "-").toLowerCase()} className="scroll-mt-28"><EFCollectionCard c={c} priority={i < 2} /></li>)}</ul>;
}

export default function ExceptionalFewPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "The Exceptional Few", path: EF_PATH }]} /></div>
          <header className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-14 items-center">
            <div>
              <p className="ledger-eyebrow text-house">A numbered collection · Across every volume</p>
              <h1 className="ledger-display text-[2.3rem] leading-[1.08] md:text-[3.4rem] mt-3">The Exceptional Few<span className="align-super text-[0.4em]">&trade;</span></h1>
              <p className="mt-4 text-[18px] md:text-[19px] ledger-muted max-w-xl leading-relaxed">Places with no second version. Each one is chosen, numbered and stamped by James, and stays filed in its own volume.</p>
              <dl className="mt-7 grid grid-cols-3 gap-4 border-t ledger-rule pt-4 max-w-md">
                {([[EF_CARDS.length, "In the collection"], [stays.length, "Stays"], [ships.length, "Ships"]] as const).map(([n, k]) => <div key={k}><dt className="sr-only">{k}</dt><dd><span className="ledger-display text-[1.9rem] leading-none">{n}</span><span className="block ledger-eyebrow mt-1">{k}</span></dd></div>)}
              </dl>
            </div>
            <div className="flex justify-center lg:justify-end py-6" aria-hidden="true"><EFStamp no={EF_CARDS[0]?.no ?? 1} size={300} rotate={-6} /></div>
          </header>

          <AnswerBlock>{ANSWER}</AnswerBlock>

          <nav aria-label="Browse the collection" className="mt-8 flex flex-wrap gap-2">
            <a href="#the-stays" className="house-chip">Stays · {stays.length}</a>
            <a href="#the-ships" className="house-chip">Ships · {ships.length}</a>
            <a href="#signals" className="house-chip">What earns a place</a>
            {together.length > 0 && <a href="#together" className="house-chip">Two in one trip</a>}
          </nav>

          <section className="mt-14 border-t ledger-rule pt-8" aria-labelledby="the-stays">
            <p className="ledger-eyebrow text-house">Volume I · Stays</p>
            <h2 id="the-stays" className="ledger-display text-[1.9rem] md:text-[2.4rem] mt-2 scroll-mt-28">The Stays</h2>
            <Grid items={stays} id="stays-grid" />
          </section>

          <section className="mt-16 border-t ledger-rule pt-8" aria-labelledby="the-ships">
            <p className="ledger-eyebrow text-house">Volume IV · Voyages</p>
            <h2 id="the-ships" className="ledger-display text-[1.9rem] md:text-[2.4rem] mt-2 scroll-mt-28">The Ships</h2>
            <Grid items={ships} id="ships-grid" />
          </section>

          <section id="signals" className="mt-16 border-t ledger-rule pt-8 scroll-mt-28" aria-labelledby="signals-h">
            <p className="ledger-eyebrow text-house">How a place is chosen</p>
            <h2 id="signals-h" className="ledger-display text-[1.9rem] md:text-[2.4rem] mt-2">Six Signals, Written in Words</h2>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed ledger-muted">No stars and no score out of a hundred. A place is already in the Ledger, vetted by James or a named partner, and earns its number on these six.</p>
            <dl className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#DCD7D0] border border-[#DCD7D0]">
              {(Object.keys(SIGNALS) as SignalKey[]).map((k) => <div key={k} className="bg-white p-5"><dt className="ledger-display text-[1.35rem]">{SIGNAL_LABEL[k]}</dt><dd className="mt-2 text-[15.5px] leading-relaxed ledger-muted">{SIGNALS[k]}</dd></div>)}
            </dl>
          </section>

          {together.length > 0 && (
            <section id="together" className="mt-16 border-t ledger-rule pt-8 scroll-mt-28" aria-labelledby="together-h">
              <p className="ledger-eyebrow text-house">Worth the journey</p>
              <h2 id="together-h" className="ledger-display text-[1.9rem] md:text-[2.4rem] mt-2">Two of the Few in One Trip</h2>
              <ul className="mt-8 grid md:grid-cols-2 gap-6">
                {together.map((g) => (
                  <li key={g.title} className="border ledger-rule bg-mist p-6">
                    <p className="ledger-eyebrow">{g.title}</p>
                    <p className="ledger-display text-[1.5rem] leading-snug mt-2">{g.items.map((c) => c.name).join(", then ")}</p>
                    <ul className="mt-3 space-y-1">{g.items.map((c) => <li key={c.id}><SafeLink href={c.href} className="ledger-btn-ghost !text-[15px]">{c.label} · {c.name}</SafeLink></li>)}</ul>
                    <p className="mt-4"><SafeLink href={`/plan?trip=${encodeURIComponent(g.items.map((c) => c.name).join(" + "))}`} className="ledger-btn-ghost">Plan the pair with James</SafeLink></p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <FaqBlock faqs={FAQS} title="The Exceptional Few, Answered" schema={false} /> {/* FAQPage markup waits for house approval of these answers (D15) */}
          <PlanClose title="Ask James which of the Few fits your year." line="Tell him who is travelling and when, and he will tell you which number to start with." />
        </div>
      </main>
      <JsonLd data={graph(
        { "@type": "CollectionPage", "@id": absoluteUrl(`${EF_PATH}#page`), url: absoluteUrl(EF_PATH), name: "The Exceptional Few", description: ANSWER, publisher: { "@id": ids.house }, author: { "@id": ids.founder }, mainEntity: { "@id": absoluteUrl(`${EF_PATH}#list`) } },
        { "@type": "ItemList", "@id": absoluteUrl(`${EF_PATH}#list`), name: "The Exceptional Few", numberOfItems: EF_CARDS.length, itemListOrder: "https://schema.org/ItemListOrderAscending", itemListElement: EF_CARDS.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: `${c.label} ${c.name}`, url: absoluteUrl(c.href) })) },
      )} />
    </>
  );
}
