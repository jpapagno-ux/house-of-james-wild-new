import Link from "next/link";
import { Compass } from "lucide-react";

// Who It Suits: Human Compass thinking on a record. Two plain lists, best for
// and less ideal for, written by the house, never derived. Useful, not
// judgmental: the second list is a courtesy to the traveller, so it reads as
// advice and ends with the Compass, not a closed door.
export default function WhoItSuits({ name, bestFor, lessIdealFor, compassHref = "/compass", id = "who" }: { name: string; bestFor: string[]; lessIdealFor: string[]; compassHref?: string; id?: string }) {
  if (!bestFor.length && !lessIdealFor.length) return null;
  return (
    <section id={id} className="mt-16 md:mt-24 border-t ef-rule pt-8 scroll-mt-32 lg:scroll-mt-[212px] ef-module" aria-labelledby={`${id}-heading`}>
      <p className="ledger-eyebrow ef-eyebrow">Who it suits</p>
      <h2 id={`${id}-heading`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">Is {name} for You?</h2>
      <div className="mt-8 grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="ledger-card border ledger-border p-6 md:p-8">
          <h3 className="ledger-eyebrow">Best for</h3>
          <ul className="mt-4 space-y-2.5 text-[16px] leading-snug">
            {bestFor.map((x) => <li key={x} className="flex gap-3"><span aria-hidden="true" className="mt-[11px] h-px w-4 shrink-0 bg-ef-earth" />{x}</li>)}
          </ul>
        </div>
        <div className="border ledger-border p-6 md:p-8">
          <h3 className="ledger-eyebrow">Less ideal for</h3>
          <ul className="mt-4 space-y-2.5 text-[16px] leading-snug ledger-muted">
            {lessIdealFor.map((x) => <li key={x} className="flex gap-3"><span aria-hidden="true" className="mt-[11px] h-px w-4 shrink-0 bg-ef-sand" />{x}</li>)}
          </ul>
          <p className="mt-6 text-[14.5px] leading-relaxed">If that&rsquo;s you, the house will point you somewhere that is. <Link href={compassHref} className="inline-flex items-center gap-1.5 underline underline-offset-4 decoration-ef-sand hover:text-crimson"><Compass className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />Ask the Human Compass</Link></p>
        </div>
      </div>
    </section>
  );
}
