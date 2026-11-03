import Link from "next/link";
import type { ReactNode } from "react";
import DriftFrame from "@/components/exceptional-few/DriftFrame";
import EFSignals from "@/components/exceptional-few/EFSignals";
import WhoItSuits from "@/components/exceptional-few/WhoItSuits";
import { PathwayChips } from "@/components/pathways/Pathway";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { SIGNAL_LABEL, collectionNo, efEntityId, efPathways, efThemeClass, type ExceptionalFew } from "@/lib/content/exceptional-few";
import { assetFor } from "@/lib/content/media-assets";
import type { ShipPathway } from "@/lib/content/ships/types";

// The Exceptional Few™ on a ship page (James, 2 Nov 2026): the approved Mock C direction built
// for Amangiri (night, then day, then night), adapted for the sea. A full-bleed drifting hero
// with the collection number; the line and its signals; the three "why it made the cut" frames
// over the vessel's best photographs; the practical middle (cabins, routes, rates) lifted into
// the day band by ShipTemplate; and a night close. Facts only: no founder marks, no James' note.
// Assets come from media-assets.json under "ship:<slug>", approved rights only.
export type ShipEF = { theme: string; hero: ReactNode; opening: ReactNode; suits: ReactNode; close: ReactNode; jsonld: object };

const CUT_ROLES = ["editorial_landscape", "room", "experience"] as const;

export function shipEntrance({ ef, name, line, path, planHref, pathway, proof, priceLine, closeFacts, absolute }: {
  ef: ExceptionalFew; name: string; line: string; path: string; planHref: string; pathway?: ShipPathway; proof?: string | null;
  priceLine?: string | null; closeFacts: string[]; absolute: (p: string) => string;
}): ShipEF | null {
  const id = efEntityId(ef);
  const hero = assetFor(id, "hero");
  if (!hero) return null; // no approved hero, no entrance: the ordinary ship page renders
  const cuts = CUT_ROLES.map((r) => assetFor(id, r));
  const night = assetFor(id, "night");
  const pw = efPathways(ef, pathway ? { ...pathway, status: "approved" } : null);
  const no = collectionNo(ef.collectionNumber);
  const n = ef.whyItMadeTheCut.length;
  return {
    theme: `${efThemeClass(ef)} theme-ef-dark`,
    hero: (
      <DriftFrame a={hero} ratio="21:9" priority motion="zoom">
        <p data-hero-copy className="ledger-eyebrow !text-white/85">The Exceptional Few&trade; &middot; {no}</p>
        <h1 className="ledger-display text-[2.9rem] md:text-[6.4rem] leading-[0.95] mt-3">{name}</h1>
        <p className="ledger-display italic text-xl md:text-3xl text-white/90 mt-3">{line}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          {/* The house's main action, the Ledger column, white on the night photograph (hero arrows fix, 3 Nov 2026) */}
          <Link href={planHref} className="ledger-btn ledger-btn--house ledger-btn--light">Plan with James</Link>
          {priceLine && <span className="text-[11.5px] tracking-[0.18em] uppercase text-white/75">{priceLine}</span>}
        </div>
      </DriftFrame>
    ),
    opening: (
      <>
        <section className="py-16 md:py-28 text-center" aria-label="The line">
          {ef.heroLine && <p className="ledger-display text-[1.9rem] md:text-[3.4rem] leading-[1.12] max-w-4xl mx-auto">{ef.heroLine}</p>}
          <div className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-3">{ef.signals.map((x) => <span key={x.key} className="ledger-eyebrow !text-[11px] !tracking-[0.26em]" style={{ color: "var(--ef-sand)" }}>{SIGNAL_LABEL[x.key]}</span>)}</div>
          {pw && <div className="mt-6 flex justify-center"><PathwayChips primary={pw.primary} secondary={pw.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}
          {proof && <p className="mt-6 ledger-eyebrow">{proof}</p>}
        </section>
        {ef.whyItMadeTheCut.map((t, i) => {
          const a = cuts[i];
          return a ? (
            <DriftFrame key={i} a={a} ratio={i === 1 ? "16:10" : "3:2"} id={i === 0 ? "why" : undefined} motion={i === 1 ? "pan" : i === 2 ? "slow" : "zoom"} height="min-h-[78svh] md:min-h-[92svh]" className={i === 0 ? "" : "mt-1"}>
              {i === 0 ? <h2 className="ledger-eyebrow !text-white/80">Why it made the cut</h2> : <p className="ledger-eyebrow !text-white/80">{`${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`}</p>}
              <p className="mt-4 ledger-display text-[1.45rem] md:text-[2.4rem] leading-[1.18] max-w-3xl">{t}</p>
            </DriftFrame>
          ) : <p key={i} id={i === 0 ? "why" : undefined} className="mt-8 ledger-display text-[1.3rem] md:text-[1.7rem] leading-[1.3] max-w-3xl">{t}</p>;
        })}
        <div className="py-14 md:py-20"><EFSignals ef={ef} id="glance" /></div>
      </>
    ),
    suits: <WhoItSuits name={name} bestFor={ef.whoItSuits} lessIdealFor={ef.whoItMayNotSuit} />,
    close: night ? (
      <DriftFrame a={night} ratio="3:2" id="close" motion="slow" height="min-h-[82svh] md:min-h-[92svh]">
        <p className="ledger-eyebrow !text-white/80">The Exceptional Few&trade; &middot; {no}</p>
        <h2 className="mt-4 ledger-display text-[2.2rem] md:text-[3.6rem] leading-[1.05]">{name}</h2>
        <p className="mt-4 max-w-xl text-[15px] md:text-[17px] text-white/85 leading-relaxed">{closeFacts.join(" · ")}</p>
        <div className="mt-7"><Link href={planHref} className="ledger-btn !border-white !text-white hover:!bg-white hover:!text-ink">Plan with James</Link></div>
      </DriftFrame>
    ) : null,
    jsonld: { "@context": "https://schema.org", "@type": "DefinedTerm", "@id": absolute(`${path}#exceptional-few`), name: `The Exceptional Few™ ${no}`, description: "A James Wild & Co editorial designation for places and vessels that are difficult to replicate because of place, privacy, design, access, humanity or rarity. Not a rating.", inDefinedTermSet: { "@type": "DefinedTermSet", name: "The Exceptional Few by James Wild & Co", url: absolute("/stays") }, termCode: ef.id, about: { "@type": "Product", name, url: absolute(path) } },
  };
}
