import { OfferCard } from "@/components/ledger/OfferPanel";
import type { Offer } from "@/lib/content/offers/offers";
import type { VolumeKey } from "@/lib/volumes";

// Worth Another Night / Time Rewarded, front and centre on a Stay page when
// the Offer Ledger holds a live offer for it. Reads only the Offer Ledger;
// renders nothing otherwise (no invented promotions).
const SLOW = new Set<Offer["program"]>(["Worth Another Night", "Time Rewarded", "Book Early"]);

export default function WorthAnotherNight({ offers, volume = "stays", name }: { offers: Offer[]; volume?: VolumeKey; name: string }) {
  const slow = offers.filter((o) => SLOW.has(o.program));
  if (!slow.length) return null;
  return (
    <section id="worth-another-night" className="mt-12 md:mt-16 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby="wan-heading">
      <p className="ledger-eyebrow ledger-crimson">{slow[0].program}</p>
      <h2 id="wan-heading" className="ledger-display text-[1.6rem] md:text-3xl mt-2">Stay a Little Longer at {name}</h2>
      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{slow.map((o) => <OfferCard key={o.id} offer={o} volume={volume} />)}</div>
    </section>
  );
}
