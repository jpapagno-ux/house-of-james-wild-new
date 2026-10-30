import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PATHWAY_LIST, type Pathway, type PathwayId } from "@/lib/pathways";

// Wild Pathways kit: the chip, the card and the marker. Each element scopes
// its own colour through .pathway-0n (globals.css), so a pathway never
// re-tints the page or the volume accent around it. The name is always
// printed: colour is a second signal, never the only one.

const scope = (p: Pathway) => `pathway-${p.id.slice(-2)}`;

/** Small labelled chip: primary pathway solid, secondary pathways on their tint. */
export function PathwayChip({ pathway: p, primary = false, href }: { pathway: Pathway; primary?: boolean; href?: string }) {
  const cls = `${scope(p)} inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] tracking-[0.14em] uppercase font-medium ${primary ? "bg-pathway border-pathway text-white" : "bg-pathway-tint border-pathway/30 text-pathway-text"}`;
  const body = (
    <>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />
      <span>{p.name}</span>
      {primary && <span className="sr-only"> (primary pathway)</span>}
    </>
  );
  return href ? <Link href={href} className={`${cls} hover:opacity-90`}>{body}</Link> : <span className={cls}>{body}</span>;
}

/** A row of chips for a record: the primary first, then the rest. */
export function PathwayChips({ primary, secondary, hrefFor }: { primary: Pathway; secondary: Pathway[]; hrefFor?: (p: Pathway) => string }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Pathways">
      <li><PathwayChip pathway={primary} primary href={hrefFor?.(primary)} /></li>
      {secondary.map((p) => <li key={p.id}><PathwayChip pathway={p} href={hrefFor?.(p)} /></li>)}
    </ul>
  );
}

/** Pathway card for the Stays landing: a photograph, the name, the setting and the house line. */
export function PathwayCard({ pathway: p, image, href, count, large = false }: { pathway: Pathway; image?: { url: string; alt: string } | null; href: string; count?: number; large?: boolean }) {
  return (
    <Link href={href} className={`${scope(p)} group block h-full bg-paper border ledger-border hover:border-pathway transition-colors`}>
      <div className={`relative ${large ? "aspect-[16/9] lg:aspect-[2/1]" : "aspect-[4/3]"} bg-pathway-tint overflow-hidden`}>
        {image ? <Image src={image.url} alt={image.alt} fill sizes={large ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"} className="object-cover group-hover:scale-[1.03] transition-transform duration-700" /> : null}
        <span className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-pathway ring-2 ring-white/90" aria-hidden="true" />
      </div>
      <div className="p-4 md:p-5">
        <p className="ledger-eyebrow text-pathway-text">{p.setting}</p>
        <h3 className={`ledger-display leading-tight mt-1 ${large ? "text-[1.9rem]" : "text-[1.45rem]"}`}>{p.name}</h3>
        <p className="mt-1.5 text-[14.5px] ledger-muted leading-snug">{p.line}</p>
        <p className="mt-3 flex items-center justify-between text-[12px] ledger-muted">
          <span className="font-mono tracking-[0.08em]">{p.id}{typeof count === "number" ? ` · ${count} ${count === 1 ? "entry" : "entries"}` : ""}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} aria-hidden="true" />
        </p>
      </div>
    </Link>
  );
}

/** The quiet index of all eight, for the bottom of the landing: every pathway reachable even when only six are pictured. */
export function PathwayIndex({ hrefFor, pictured = [] }: { hrefFor: (p: Pathway) => string; pictured?: PathwayId[] }) {
  return (
    <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 border-t ledger-rule" aria-label="All eight pathways">
      {PATHWAY_LIST.map((p) => (
        <li key={p.id} className={`${scope(p)} border-b ledger-rule`}>
          <Link href={hrefFor(p)} className="flex items-center gap-3 py-3 hover:text-pathway-text">
            <span className="h-2.5 w-2.5 rounded-full bg-pathway shrink-0" aria-hidden="true" />
            <span className="ledger-display text-[1.1rem] leading-tight">{p.name}</span>
            <span className="ml-auto font-mono text-[11px] ledger-muted">{p.id}{pictured.includes(p.id) ? "" : " · more"}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
