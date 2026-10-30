import type { Offer } from "@/lib/content/offers/offers";
import { VOLUME_STYLES, type VolumeKey } from "@/lib/volumes";
import { FinalCallBoard, TimeMark } from "@/components/ledger/VolumeKit";

// An offer from the Offer Ledger, drawn in its volume's time mark:
//   Worth Another Night / Time Rewarded → the volume's clock (hourglass, candle clock, ship's clock, sundial)
//   Final Call (late departures)        → the split-flap board, Voyages and Overland only
// The real terms always sit beside the mark. No countdowns.

const LATE: VolumeKey[] = ["voyages", "overland"];

export function OfferCard({ offer, volume: pageVolume }: { offer: Offer; volume: VolumeKey }) {
  const volume = offer.volume ?? pageVolume;
  const v = VOLUME_STYLES[volume];
  const late = offer.program === "Final Call" && LATE.includes(volume);
  return (
    <div className="border bg-white p-5 md:p-6 flex flex-col gap-4" style={{ borderColor: v.leather }}>
      <div className="flex items-center justify-center min-h-[150px]">
        {late ? <FinalCallBoard volume={volume as "voyages" | "overland"} saving={offer.headline.length <= 12 ? offer.headline : "SAVE NOW"} cell={24} /> : <TimeMark volume={volume} size={140} />}
      </div>
      <div>
        <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: v.leather }}>{offer.program}{late && v.finalCall ? ` · ${v.finalCall}` : ""}</p>
        <p className="ledger-display text-[1.6rem] leading-tight mt-1">{offer.headline}</p>
        <p className="mt-2 text-[15px] leading-relaxed">{offer.name} · {late ? offer.travel.text : `travel ${offer.travel.text}`}.{offer.conditions ? ` ${offer.conditions}` : ""}</p>
        <p className="mt-2 font-mono text-[10.5px] ledger-muted">{offer.id} · terms checked {offer.checked}</p>
      </div>
    </div>
  );
}

export default function OfferPanel({ offers, volume, title = "Offers" }: { offers: Offer[]; volume: VolumeKey; title?: string }) {
  if (!offers.length) return null;
  return (
    <section id="offers" className="mt-14 border-t ledger-rule pt-8 scroll-mt-32 lg:scroll-mt-[212px]">
      <p className="ledger-eyebrow ledger-crimson">{title}</p>
      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {offers.map((o) => <OfferCard key={o.id} offer={o} volume={volume} />)}
      </div>
      <p className="mt-4 text-[13px] ledger-muted">Offers are set by each partner and confirmed when you book. We apply whichever fits your dates.</p>
    </section>
  );
}
