import { PassportStamp } from "@/components/ledger/VolumeKit";
import type { TimelessVoyage } from "@/lib/content/timeless-voyages";

// The Timeless Voyages stamps (James, 13 Nov 2026), in the house passport-stamp family: the row's `stamp` pressed on
// the hero and on collection cards. "Maiden Voyage" is new here: the same frame, the launch year in the middle and
// "First season" beneath. `backing` lays a soft dark ground under the stamp so it reads on any photograph.
const fmt = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function stampWords(tv: TimelessVoyage, shipName: string): { top: string; date: string; place: string } | null {
  switch (tv.stamp) {
    case "Signature Edition": return { top: "Timeless Voyages", date: "Signature", place: "Edition" };
    case "Maiden Voyage": return { top: "Maiden Voyage", date: tv.launchDate?.slice(0, 4) ?? "Soon", place: "First season" };
    case "Timeless Voyages": return { top: "Timeless Voyages", date: tv.collectionNumber ? `No. ${String(tv.collectionNumber).padStart(3, "0")}` : "Voyages", place: shipName };
    case "Founder sailed": return { top: "Founder sailed", date: "Aboard", place: shipName };
    case "Founder favorite": return { top: "Founder favorite", date: "Voyages", place: shipName };
    default: return null;
  }
}

const Backing = ({ on, children, className = "" }: { on: boolean; children: React.ReactNode; className?: string }) =>
  on ? <span className={`inline-flex rounded-2xl p-2 ${className}`} style={{ background: "rgba(0,0,0,.36)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}>{children}</span> : <span className={`inline-flex ${className}`}>{children}</span>;

export default function TimelessStamp({ tv, shipName, size = 120, rotate = -4, ink, backing = false, className }: { tv: TimelessVoyage; shipName: string; size?: number; rotate?: number; ink?: string; backing?: boolean; className?: string }) {
  const w = stampWords(tv, shipName);
  if (!w) return null;
  return <Backing on={backing} className={className}><span role="img" aria-label={`${tv.stamp}: ${shipName}`} className="inline-flex"><PassportStamp volume="voyages" top={w.top} date={w.date} place={w.place} size={size} rotate={rotate} ink={ink} /></span></Backing>;
}

type Saving = NonNullable<TimelessVoyage["savings"]>;

/** The operator's saving as a stamp for the hero: "Savings", the code where there is one, and the book-by date. */
export function SavingStamp({ saving, size = 120, ink, backing = false }: { saving: Saving; size?: number; ink?: string; backing?: boolean }) {
  return <a href="#timeless-saving" aria-label="The operator's saving on this ship"><Backing on={backing}><PassportStamp volume="voyages" top="Savings" date={saving.code && saving.code.length <= 9 ? saving.code : "Offer"} place={saving.bookBy ? `Book by ${fmt(saving.bookBy)}` : "As published"} size={size} rotate={3} ink={ink} /></Backing></a>;
}

/** The saving in words, exactly as the operator publishes it, with its code and dates. Never a commission or trade term. */
export function SavingNote({ saving, operator }: { saving: Saving; operator: string }) {
  return (
    <aside id="timeless-saving" aria-label={`${operator} saving`} className="mt-10 max-w-3xl border-l-2 border-crimson/50 pl-5 scroll-mt-40">
      <p className="ledger-eyebrow ledger-crimson">Saving, as {operator} publishes it</p>
      <p className="mt-2 text-[16.5px] leading-relaxed">{saving.text}</p>
      <p className="mt-2 text-[13.5px] ledger-muted">
        {[saving.code && `Code ${saving.code}`, saving.bookBy && `Book by ${fmt(saving.bookBy)}`, saving.sailBy && `Sail by ${fmt(saving.sailBy)}`].filter(Boolean).join(" · ")}
      </p>
    </aside>
  );
}
