import Link from "next/link";
import { Headshot } from "@/components/advisor/Desk";
import { defaultAdvisor } from "@/lib/content/advisors";
import { GREEN_INK } from "@/lib/content/advisor-desk";

// James's advisor card on the ocean-led voyage pages (the Galápagos and Indonesia hubs, Aliikai and the
// Galápagos ship pages), with his surf and dive line from lib/content/founder-ocean.ts (James, 2 Nov 2026).
// The line is passed in by the page, so a ship he has not sailed never reads "sailed aboard".
export default function FounderOcean({ line, place, className = "" }: { line: string; place: string; className?: string }) {
  const a = defaultAdvisor();
  return (
    <aside className={`mt-12 md:mt-16 border ledger-border bg-paper p-4 md:p-5 max-w-3xl ${className}`} aria-label={`Who plans ${place}`}>
      <p className="ledger-eyebrow" style={{ color: GREEN_INK }}>Who plans {place}</p>
      <div className="mt-3 flex gap-3 items-start">
        <Link href={a.profileHref ?? "/about/founder"} className="shrink-0"><Headshot a={a} size={52} /></Link>
        <div className="min-w-0">
          <p className="leading-tight"><Link href={a.profileHref ?? "/about/founder"} className="ledger-display text-[17px] hover:ledger-crimson">{a.name}</Link> <span className="font-mono text-[10.5px] ledger-crimson">{a.ledgerId}</span></p>
          <p className="text-[12.5px] ledger-muted mt-0.5">{a.role}</p>
          <p className="mt-1.5 text-[14px] leading-snug" style={{ color: GREEN_INK }}>{line}</p>
        </div>
      </div>
      <Link href={`/plan?advisor=${a.slug}&q=${encodeURIComponent(place)}`} className="mt-4 ledger-btn ledger-btn--solid !py-2 !px-4 text-[13px]">Plan {place} with James</Link>
    </aside>
  );
}
