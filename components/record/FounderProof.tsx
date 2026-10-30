import { EmbossSeal } from "@/components/ledger/VolumeKit";
import Link from "next/link";
import { FOUNDER_YEARS, SITE } from "@/lib/site";

// The founder's testimony, in one place for every record page: the specific
// proof for this page (he went, when, with whom) and the standing credential.
// A visible, plain-text fact for readers and for AI answers alike.
export default function FounderProof({ proof, className = "", seal, note }: { proof: string; className?: string; seal?: string | null; note?: string | null }) {
  return (
    <aside className={`border-l-2 border-crimson pl-5 py-1 ${seal ? "sm:flex sm:items-center sm:gap-8 sm:!max-w-4xl" : ""} ${className}`} aria-label="The founder's testimony">
      <div className="min-w-0">
      <p className="ledger-eyebrow ledger-crimson">Vetted in person · the founder&rsquo;s testimony</p>
      <p className="ledger-display text-[18px] md:text-[20px] leading-snug mt-1.5">{proof}</p>
      {note && <p className="mt-1.5 text-[15px] leading-relaxed">{note}</p>}
      <p className="mt-2 text-[14.5px] ledger-muted leading-relaxed">
        James Wild has been on the road for {FOUNDER_YEARS} years, exploring since {SITE.exploringSince} and designing journeys since {SITE.designingSince}. Every entry in the Ledger is a place he has been, or one he tells you plainly he hasn&rsquo;t. <Link href="/about/founder" className="underline underline-offset-4 hover:ledger-crimson">Meet James</Link>
      </p>
      </div>
      {/* Founder mark pressed into the page: only from the record's Ledger status. */}
      {seal && <EmbossSeal label={seal} size={118} className="mt-4 sm:mt-0 shrink-0" />}
    </aside>
  );
}
