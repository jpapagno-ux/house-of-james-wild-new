import SafeLink from "@/components/ledger/SafeLink";
import EFCollectionCard from "@/components/exceptional-few/EFCollectionCard";
import { EFStamp } from "@/components/exceptional-few/EFBadge";
import { EF_CARDS, EF_PATH } from "@/lib/content/exceptional-few-cards";

const WORD = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

// Homepage, Act IV: The Exceptional Few. The first four in collection order, the stamp, and the way in.
// A swipe row on phones, four across on desktop.
export default function ExceptionalFewBand() {
  if (!EF_CARDS.length) return null;
  const n = EF_CARDS.length;
  const shown = EF_CARDS.slice(0, 4);
  return (
    <section id="exceptional-few" className="mt-16 md:mt-24 border-t ledger-rule pt-8 scroll-mt-28" aria-labelledby="ef-band-h">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-2xl">
          <p className="ledger-eyebrow text-house">The Exceptional Few&trade; · Across every volume</p>
          <h2 id="ef-band-h" className="ledger-display text-[1.9rem] md:text-[2.6rem] leading-tight mt-2">{WORD[n] ?? n} Places With No Second Version</h2>
          <p className="mt-3 text-[17px] leading-relaxed ledger-muted">Stays and ships James has chosen, numbered and stamped, each still filed in its own volume. If you only travel once this year, start here.</p>
        </div>
        <div className="hidden md:block shrink-0" aria-hidden="true"><EFStamp no={EF_CARDS[0].no} size={210} rotate={-6} /></div>
      </div>
      <ul className="mt-12 flex md:grid md:grid-cols-4 gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 pb-2 pt-4">
        {shown.map((c) => <li key={c.id} className="snap-start shrink-0 w-[78vw] sm:w-[46vw] md:w-auto"><EFCollectionCard c={c} pairs={false} /></li>)}
      </ul>
      <p className="mt-8"><SafeLink href={EF_PATH} className="ledger-btn">See all {n} of The Exceptional Few</SafeLink></p>
    </section>
  );
}
