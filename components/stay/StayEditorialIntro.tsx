import type { ReactNode } from "react";
import type { StayEditorial } from "@/lib/stay-page/contract";
import type { Offer } from "@/lib/content/offers/offers";
import FounderFieldNote from "./FounderFieldNote";
import WorthAnotherNight from "./WorthAnotherNight";

// "Why here / James' take" + property overview, from the contract. Each part
// renders only from a populated field:
//   verdict      → James' take (one line, the house verdict)
//   founderNote  → FounderFieldNote
//   offers       → WorthAnotherNight
//   overview     → the concise property description and its top features
//   wouldWouldnt → "James would / wouldn't" (reserved: renders only when supplied)
// With every field empty the section collapses to nothing.
export default function StayEditorialIntro({ editorial, offers = [], showVerdict = true, wouldWouldnt, children }: { editorial: StayEditorial; offers?: Offer[]; showVerdict?: boolean; wouldWouldnt?: { would: string[]; wouldnt: string[] }; children?: ReactNode }) {
  const verdict = showVerdict ? editorial.verdict : null;
  const hasWould = wouldWouldnt && (wouldWouldnt.would.length || wouldWouldnt.wouldnt.length);
  const hasOverview = editorial.overview.length > 0 || editorial.propertyFeatures.length > 0;
  if (!verdict && !editorial.founderNote && !offers.length && !hasWould && !hasOverview && !children) return null;
  return (
    <>
      {(verdict || hasWould) && (
        <section id="james-take" className="mt-12 md:mt-16 scroll-mt-32 lg:scroll-mt-[212px] max-w-3xl" aria-labelledby="take-heading">
          <p className="ledger-eyebrow ledger-crimson">James&rsquo; take</p>
          {verdict && <h2 id="take-heading" className="ledger-display text-[1.75rem] md:text-[2.25rem] leading-[1.15] mt-2">{verdict.line}</h2>}
          {verdict && (verdict.where || verdict.when) && <p className="mt-2 text-[13px] ledger-muted">{[verdict.where, verdict.when].filter(Boolean).join(" · ")}</p>}
          {hasWould && (
            <div className="mt-6 grid sm:grid-cols-2 gap-6">
              {wouldWouldnt!.would.length > 0 && <div><p className="ledger-eyebrow">James would</p><ul className="mt-2 grid gap-1.5 text-[15px]">{wouldWouldnt!.would.map((x) => <li key={x}>{x}</li>)}</ul></div>}
              {wouldWouldnt!.wouldnt.length > 0 && <div><p className="ledger-eyebrow">James wouldn&rsquo;t</p><ul className="mt-2 grid gap-1.5 text-[15px] ledger-muted">{wouldWouldnt!.wouldnt.map((x) => <li key={x}>{x}</li>)}</ul></div>}
            </div>
          )}
        </section>
      )}
      <FounderFieldNote note={editorial.founderNote} where={editorial.place} when={editorial.status.date?.slice(0, 4)} />
      <WorthAnotherNight offers={offers} name={editorial.name} />
      {hasOverview && (
        <section id="overview-short" className="mt-12 md:mt-16 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby="ov-heading">
          <p className="ledger-eyebrow ledger-crimson">The estate</p>
          <h2 id="ov-heading" className="ledger-display text-[1.6rem] md:text-3xl mt-2">{editorial.name}, in Short</h2>
          <div className="mt-4 grid md:grid-cols-[1.4fr_1fr] gap-8">
            <div className="grid gap-4 text-[16.5px] leading-relaxed max-w-2xl">{editorial.overview.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}</div>
            {editorial.propertyFeatures.length > 0 && <ul className="grid gap-2 text-[15px] self-start">{editorial.propertyFeatures.map((f) => <li key={f} className="border-b ledger-border pb-2">{f}</li>)}</ul>}
          </div>
        </section>
      )}
      {children}
    </>
  );
}
