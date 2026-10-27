import Link from "next/link";
import { FOUNDER_YEARS, SITE } from "@/lib/site";

// The founder's testimony, in one place for every record page: the specific
// proof for this page (he went, when, with whom) and the standing credential.
// A visible, plain-text fact for readers and for AI answers alike.
export default function FounderProof({ proof, className = "" }: { proof: string; className?: string }) {
  return (
    <aside className={`border-l-2 border-crimson pl-5 py-1 ${className}`} aria-label="The founder's testimony">
      <p className="ledger-eyebrow ledger-crimson">Vetted in person · the founder&rsquo;s testimony</p>
      <p className="ledger-display text-[18px] md:text-[20px] leading-snug mt-1.5">{proof}</p>
      <p className="mt-2 text-[14.5px] ledger-muted leading-relaxed">
        James Wild has been on the road for {FOUNDER_YEARS} years, exploring since {SITE.exploringSince} and designing journeys since {SITE.designingSince}. Every entry in the Ledger is a place he has been, or one he tells you plainly he hasn&rsquo;t. <Link href="/about/founder" className="underline underline-offset-4 hover:ledger-crimson">Meet James</Link>
      </p>
    </aside>
  );
}
