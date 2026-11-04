import Link from "next/link";
import { INSTRUMENTS, HOW_PATH } from "@/lib/content/instruments";

// "Not sure where to start?" — the three-word strip (James, 3 Nov 2026). The same three words
// everywhere so the vocabulary sticks: Read the Compass · Open the Atlas · Ask Iggi. `atlasHref`
// points at this page's own Atlas when it has one; otherwise the voyages atlas. `iggiHref` points
// at the page's Iggi panel (#iggi) when mounted.
export default function InstrumentsStrip({ atlasHref, iggiHref = "#iggi", className = "" }: { atlasHref?: string; iggiHref?: string; className?: string }) {
  const hrefFor = (k: string, fallback: string) => (k === "atlas" && atlasHref ? atlasHref : k === "iggi" ? iggiHref : fallback);
  return (
    <nav aria-label="Where to start" className={`border-t border-b ledger-border py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] ${className}`}>
      <span className="ledger-eyebrow !text-[10.5px]">Not sure where to start?</span>
      {INSTRUMENTS.map((i) => (
        <Link key={i.key} href={hrefFor(i.key, i.href)} className="ledger-display text-[16px] hover:text-house underline underline-offset-4 decoration-[0.5px]">{i.strip}</Link>
      ))}
      <Link href={HOW_PATH} className="ml-auto ledger-eyebrow !text-[10.5px] hover:text-house">How the house works</Link>
    </nav>
  );
}
