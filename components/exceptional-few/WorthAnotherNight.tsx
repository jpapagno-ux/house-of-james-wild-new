import { TimeMark } from "@/components/ledger/VolumeKit";
import Signature from "@/components/record/Signature";
import type { VolumeKey } from "@/lib/volumes";

// Worth Another Night™ on an Exceptional Few record: short founder-voice copy
// on whether staying longer changes the stay, beside the volume's time mark.
// Editorial, not transactional: a live offer (OfferPanel) prints separately,
// only when the offer ledger has one; this module stands without it.
export default function WorthAnotherNight({ copy, volume = "stays", id = "another-night" }: { copy: string; volume?: VolumeKey; id?: string }) {
  if (!copy) return null;
  return (
    <section id={id} className="mt-16 md:mt-24 border-t ef-rule pt-8 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby={`${id}-heading`}>
      <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start">
        <div className="hidden md:block"><TimeMark volume={volume} size={140} /></div>
        <div className="max-w-3xl">
          <p className="ledger-eyebrow ef-eyebrow">Worth Another Night&trade;</p>
          <h2 id={`${id}-heading`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">Does Staying Longer Change It?</h2>
          <p className="mt-5 ledger-display text-[1.25rem] md:text-[1.45rem] leading-snug">{copy}</p>
          <div className="mt-5 flex items-center justify-between gap-6 border-t ledger-border pt-4">
            <span className="text-[12px] tracking-[0.14em] uppercase ledger-muted">From the house</span>
            <Signature className="w-24 md:w-28" />
          </div>
        </div>
      </div>
    </section>
  );
}
