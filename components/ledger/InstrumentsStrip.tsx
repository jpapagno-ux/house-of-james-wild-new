import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { INSTRUMENTS, HOW_PATH } from "@/lib/content/instruments";

// "Not sure where to start?" (James, 3 Nov 2026): the same three words everywhere so the vocabulary sticks: Read the
// Compass · Open the Atlas · Ask Iggi. Set as three clear, squared buttons (James, 10 Nov 2026: "clean up this section
// with easy to see, easy to understand buttons ... into the color pathway tone ... organized for both desktop and
// mobile"): number, name and when to use it, full width on a phone, three across on a wide screen. The rule takes the
// page's pathway colour (--tone-path) where it has one, Graphite elsewhere. `atlasHref` points at this page's own map
// when it has one; `iggiHref` at the page's Iggi panel.
const WHEN: Record<string, string> = { compass: "Not sure where to go", atlas: "See where it sits", iggi: "Ask a question" };

export default function InstrumentsStrip({ atlasHref, iggiHref = "#iggi", className = "" }: { atlasHref?: string; iggiHref?: string; className?: string }) {
  const hrefFor = (k: string, fallback: string) => (k === "atlas" && atlasHref ? atlasHref : k === "iggi" ? iggiHref : fallback);
  return (
    <nav aria-label="Where to start" className={`border-t ledger-rule pt-6 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="ledger-eyebrow">Not sure where to start?</p>
        <Link href={HOW_PATH} className="text-[12px] tracking-[0.16em] uppercase ledger-muted hover:text-house underline-offset-4 hover:underline">How the house works</Link>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {INSTRUMENTS.map((i) => (
          <li key={i.key}>
            <Link href={hrefFor(i.key, i.href)} className="group flex items-stretch h-full min-h-[64px] border ledger-border bg-white hover:border-[var(--tone-path,#2E2B28)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              <span aria-hidden="true" className="w-[4px] shrink-0" style={{ background: "var(--tone-path, #2E2B28)" }} />
              <span className="flex-1 px-4 py-3">
                <span className="block font-mono text-[10.5px] tracking-[0.16em] ledger-muted">{i.no} · {WHEN[i.key]}</span>
                <span className="block ledger-display text-[1.2rem] leading-snug mt-0.5">{i.strip}</span>
              </span>
              <span className="self-center pr-4"><ArrowRight aria-hidden="true" className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: "var(--tone-path, #2E2B28)" }} strokeWidth={1.5} /></span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
