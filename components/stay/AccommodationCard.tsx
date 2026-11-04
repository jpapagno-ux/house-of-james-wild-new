"use client";
import Image from "next/image";
import type { AccommodationPricingState, AccommodationUnit } from "@/lib/stay-page/contract";
import AccommodationPricingStatus from "./AccommodationPricingStatus";
import { cardFactLine } from "./AccommodationFacts";

// The collapsed card: only what helps a traveler choose whether to look
// closer. Photo, name, unit type, a short line, verified facts, one or two
// distinguishing features, the pricing status, View details. No amenity
// walls, no terms. Empty fields collapse.

const TYPE: Record<string, string> = { room: "Room", suite: "Suite", cottage: "Cottage · taken whole", house: "House · taken whole", villa: "Villa · taken whole", residence: "Residence · taken whole", tent: "Tent", camp: "Camp" };

export default function AccommodationCard({ unit, state, onOpen }: { unit: AccommodationUnit; state: AccommodationPricingState; onOpen: () => void }) {
  const facts = cardFactLine(unit);
  const features = unit.features.slice(0, 2);
  const type = unit.unitType ? TYPE[unit.unitType] ?? unit.unitType : null;
  return (
    <li className="group flex flex-col border ledger-border bg-paper">
      <button type="button" onClick={onOpen} className="relative aspect-[4/3] bg-paper-card overflow-hidden text-left" aria-label={`View details for ${unit.name}`}>
        {unit.media.hero
          ? <Image src={unit.media.hero.url} alt={unit.media.hero.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          : <span className="absolute inset-0 flex items-center justify-center ledger-eyebrow ledger-muted">Photograph to follow</span>}
      </button>
      <div className="p-5 flex flex-col flex-1 gap-2">
        {type && <p className="ledger-eyebrow ledger-muted">{type}</p>}
        <h3 className="ledger-display text-[1.45rem] leading-tight">{unit.name}</h3>
        {unit.shortDescription && <p className="text-[15px] leading-relaxed">{unit.shortDescription}</p>}
        {facts && <p className="text-[13.5px] ledger-muted">{facts}</p>}
        {features.length > 0 && <p className="text-[13.5px]">{features.join(" · ")}</p>}
        <div className="mt-auto pt-4 border-t ledger-border">
          <AccommodationPricingStatus state={state} compact />
          <button type="button" onClick={onOpen} className="mt-4 ledger-btn-ghost">View details</button>
        </div>
      </div>
    </li>
  );
}
