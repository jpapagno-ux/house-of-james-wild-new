import { EmbossSeal } from "@/components/ledger/VolumeKit";
import Link from "next/link";
import Signature from "./Signature";
import { FOUNDER_YEARS, SITE } from "@/lib/site";

// The founder's testimony, in one place for every record page: the specific
// proof for this page (he went, when, with whom) and the standing credential.
// A visible, plain-text fact for readers and for AI answers alike.
export default function FounderProof({ proof, className = "", seal, note, eyebrow = "Vetted in person · the founder\u2019s testimony", signed = false, year }: { proof: string; className?: string; seal?: string | null; note?: string | null; /** Override only where he has not been (a destination filed from research), so the line never claims a visit. */ eyebrow?: string;
  /** the signed note (James, 12 Nov 2026: "Founder testimony as a signed note ... on the same tint, with fewer words") */
  signed?: boolean; year?: number | null }) {
  if (signed) {
    const ink = "var(--ef-earth, var(--tone-path, #2E2B28))";
    return (
      <aside className={`relative mt-10 md:mt-14 px-6 md:px-10 py-8 md:py-10 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center ${className}`} aria-label="The founder's testimony"
        style={{ background: `color-mix(in srgb, ${ink} 7%, #FFFFFF)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${ink} 18%, transparent)` }}>
        <div className="min-w-0">
          <p className="text-[10.5px] tracking-[0.14em] uppercase font-medium" style={{ color: `color-mix(in srgb, ${ink} 80%, #6B635A)` }}>{eyebrow}</p>
          <p className="ledger-display text-[1.45rem] md:text-[1.85rem] leading-[1.25] mt-3">{proof}</p>
          {note && <p className="mt-3 ledger-display italic text-[1.1rem] leading-relaxed">{note}</p>}
          <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2">
            <Signature className="w-28 md:w-32" />
            <p className="text-[12.5px] ledger-muted pb-1">James Wild{year ? ` · ${year}` : ""} · {FOUNDER_YEARS} years on the road, exploring since {SITE.exploringSince}. <Link href="/about/founder" className="underline underline-offset-4 hover:ledger-crimson">Meet James</Link></p>
          </div>
        </div>
        {seal && <EmbossSeal label={seal} size={132} className="shrink-0 justify-self-start sm:justify-self-end" />}
      </aside>
    );
  }
  return (
    <aside className={`border-l-2 border-crimson pl-5 py-1 ${seal ? "sm:flex sm:items-center sm:gap-8 sm:!max-w-4xl" : ""} ${className}`} aria-label="The founder's testimony">
      <div className="min-w-0">
      <p className="ledger-eyebrow ledger-crimson">{eyebrow}</p>
      <p className="ledger-display text-[18px] md:text-[20px] leading-snug mt-1.5">{proof}</p>
      {note && <p className="mt-1.5 text-[15px] leading-relaxed">{note}</p>}
      <p className="mt-2 text-[14.5px] ledger-muted leading-relaxed">
        James Wild: {FOUNDER_YEARS} years on the road, exploring since {SITE.exploringSince}. Every entry in the Ledger is a place he has been, or one he tells you plainly he hasn&rsquo;t. <Link href="/about/founder" className="underline underline-offset-4 hover:ledger-crimson">Meet James</Link>
      </p>
      </div>
      {/* Founder mark pressed into the page: only from the record's Ledger status. */}
      {seal && <EmbossSeal label={seal} size={118} className="mt-4 sm:mt-0 shrink-0" />}
    </aside>
  );
}
