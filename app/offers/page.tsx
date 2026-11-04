import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import FaqBlock from "@/components/ledger/FaqBlock";
import { HubShell, HubSection } from "@/components/hub/Hub";
import { OfferCard } from "@/components/ledger/OfferPanel";
import { TimeMark } from "@/components/ledger/VolumeKit";
import HorizonMark from "@/components/ledger/HorizonMark";
import { MEANING, hubOffers, offerSchema, sections, type HubOffer } from "@/lib/content/offers/hub";
import { mergeOffers } from "@/lib/content/ships/categories";
import { VOLUME_STYLES, volumeInk } from "@/lib/volumes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /offers: On the Horizon, the site-wide name for offers (James, 2 Nov 2026; voyages plan Part 5).
// One hub, a section per volume. Stays and Safaris keep Worth Another Night and Time Rewarded with
// their volume's time mark; voyage offers are typed (Final Call on the split-flap board, Book Early,
// Solo, Celebrations, Family, Whole Ship, On the Horizon). Every offer stays live until the day it
// expires (lib/dates.ts offerLastDay); a Final Call never past its departure.
const PATH = "/offers";
const TITLE = "On the Horizon: Travel Offers and Savings";

export const metadata = buildMetadata({
  title: TITLE,
  description: "Every live offer the house has filed, in one place: free nights and longer-stay rewards at lodges and camps, and voyage savings by type, each with its real terms.",
  path: PATH,
});

const words = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function Row({ o }: { o: HubOffer }) {
  const ink = volumeInk(o.volumeKey);
  const name = o.href ? <Link href={o.href} className="hover:underline underline-offset-4">{o.name}</Link> : o.name;
  return (
    <li className="py-3 grid gap-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-4 md:items-baseline">
      <p className="min-w-0"><span className="ledger-display text-[18px] leading-snug">{name}</span>{o.place && <span className="block text-[12.5px] ledger-muted">{o.place}</span>}</p>
      <p className="text-[15px]" style={{ color: ink }}>{o.headline}</p>
      <p className="text-[13.5px] ledger-muted">{/^(travel|book)\b/i.test(o.travel.text) ? o.travel.text : `Travel ${o.travel.text}`}</p>
    </li>
  );
}

export default function OffersHub() {
  const offers = hubOffers();
  const secs = sections(offers);
  const count = (v: string) => secs.find((s) => s.volume === v)?.count ?? 0;
  const answer = `On the Horizon is where the house files every offer it can stand behind: ${secs.map((s) => `${words(s.count, "offer", "offers")} in ${s.label}`).join(", ")}. Each sits beside its real terms, links to the page it belongs to, and stays here until the day it expires; a Final Call never runs past its departure. James applies whichever fits your dates when you book.`;
  const faqs = [
    { q: "What is On the Horizon?", a: "The house's name for offers, across every volume: free nights and longer-stay rewards at lodges and camps, and voyage savings by type. Every offer is a partner's own, filed with its terms." },
    { q: "How long does an offer stay here?", a: "Until the day it expires. A Final Call stays until its own end date and never past the departure, and always shows the departure date, never a countdown." },
    { q: "What is a Final Call?", a: MEANING["Final Call"] },
    { q: "Can offers be combined?", a: "Usually not; each offer's terms say so. James checks every offer live and applies whichever fits your dates." },
  ];
  const schemaOffers = offers.map((o) => offerSchema(o, absoluteUrl));
  return (
    <div>
      <SiteHeader />
      <HubShell name="On the Horizon" path={PATH} eyebrow="The House · Offers" title={TITLE}
        intro="Every live offer the house has filed, volume by volume, each beside its real terms."
        answer={answer}
        filling="Offers fill from the Offer Ledger and the nightly library sync; each leaves this page the day after it expires.">
        <div className="mt-2 mb-8 flex items-center gap-5 md:gap-8">
          <span className="md:hidden shrink-0"><HorizonMark size={120} rotate={-6} tone="clean" id="hub" /></span>
          <span className="hidden md:block shrink-0"><HorizonMark size={190} rotate={-6} tone="clean" id="hubl" /></span>
          <p className="text-[15px] md:text-[17px] leading-relaxed max-w-xl">The house&rsquo;s stamp for its offers: a sun rising on the horizon, pressed beside every saving it has filed and checked. Stays keep their own time marks, Worth Another Night and Time Rewarded, inside it.</p>
        </div>
        <nav aria-label="Offers by volume" className="mt-2">
          <ul className="flex flex-wrap gap-2">{secs.map((s) => <li key={s.volume}><a href={`#${s.volume}`} className="inline-flex items-center gap-2 min-h-[44px] px-3.5 border ledger-border bg-white text-[14.5px] hover:border-crimson"><span className="w-2 h-2 rounded-full" style={{ background: volumeInk(s.volume) }} aria-hidden="true" />{s.label}<span className="text-[12px] ledger-muted">{s.count}</span></a></li>)}</ul>
        </nav>
        {secs.map((s) => (
          <section key={s.volume} id={s.volume} className="mt-12 md:mt-16 border-t-[3px] pt-8" style={{ borderTopColor: volumeInk(s.volume) }} aria-labelledby={`${s.volume}-h`}>
            <p className="ledger-eyebrow" style={{ color: volumeInk(s.volume) }}>Volume {VOLUME_STYLES[s.volume].roman} · {words(s.count, "offer", "offers")}</p>
            <h2 id={`${s.volume}-h`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">{s.volume === "voyages" ? "Voyage Offers, by Type" : `${s.label} Offers`}</h2>
            {s.groups.map((g) => (
              <div key={g.key} className="mt-8">
                <div className="flex items-center gap-4">
                  {s.volume !== "voyages" && <TimeMark volume={s.volume} size={64} />}
                  <div>
                    <h3 className="ledger-display text-[22px] md:text-[26px] leading-tight">{g.title}</h3>
                    {MEANING[g.key] && <p className="text-[14px] ledger-muted">{MEANING[g.key]}</p>}
                  </div>
                </div>
                {s.volume === "voyages" ? (
                  <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{mergeOffers(g.offers).map((o) => <OfferCard key={o.id} offer={o} volume="voyages" />)}</div>
                ) : (
                  <ul className="mt-3 divide-y ledger-rule border-y ledger-rule">{g.offers.map((o) => <Row key={o.id} o={o} />)}</ul>
                )}
              </div>
            ))}
            {s.volume === "voyages" && <p className="mt-6"><Link href="/voyages" className="inline-flex items-center gap-1.5 min-h-[44px] text-[15px] hover:underline underline-offset-4">Find your voyage<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link></p>}
          </section>
        ))}
        {count("voyages") === 0 && <p className="mt-10 text-[15px] ledger-muted">No voyage offers are filed right now.</p>}
        <HubSection eyebrow="How offers work" title="Where Do These Offers Come From?" id="how-h">
          <p className="max-w-3xl text-[16px] leading-relaxed">Every offer is set by the partner who runs the lodge, camp or ship, filed in the house&rsquo;s Offer Ledger with its terms and the date they were last checked. Booking always goes through James or an advisor, who confirms the offer live before anything is booked.</p>
        </HubSection>
        <FaqBlock faqs={faqs} title="What Should You Know About the Offers?" />
      </HubShell>
      <JsonLd data={graph({
        "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: TITLE, description: answer,
        mainEntity: { "@type": "ItemList", name: "On the Horizon offers", numberOfItems: schemaOffers.length, itemListElement: schemaOffers.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })) },
      })} />
    </div>
  );
}
