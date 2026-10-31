import Image from "next/image";
import Link from "next/link";
import { type Coming, statusLine, sourceHost } from "@/lib/content/whats-coming";

// A card for a lodge that isn't open yet: the brand's own facts, the date,
// and the house's position (pencilled until James has been). No photo when
// the brand hasn't given one; never a borrowed one.
export default function ComingCard({ c, compact = false }: { c: Coming; compact?: boolean }) {
  const plan = `/plan?from=whats-coming&trip=${encodeURIComponent(`${c.name} — hold a place`)}${c.countrySlug ? `&destination=${c.countrySlug}` : ""}`;
  const host = sourceHost(c.source);
  return (
    <article className="bg-paper border ledger-border h-full flex flex-col" aria-labelledby={`coming-${c.slug}`}>
      <div className="relative aspect-[16/10] bg-paper-card overflow-hidden">
        {c.hero ? <Image src={c.hero} alt={c.name} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" /> : (
          <div className="absolute inset-0 flex items-end p-5"><p className="ledger-display italic text-[1.1rem] text-ink/50">Photographs when the brand releases them.</p></div>
        )}
        <span className="absolute top-3 left-3 bg-paper/95 px-2.5 py-1 ledger-eyebrow !text-[10px] ledger-crimson">{statusLine(c)}</span>
        <span className="absolute top-3 right-3 bg-paper/95 px-2 py-1 font-mono text-[10.5px] tracking-[0.12em] text-ink/60">Pencilled</span>
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <p className="ledger-eyebrow">{[c.country, c.volume && c.volume[0].toUpperCase() + c.volume.slice(1)].filter(Boolean).join(" · ")}{c.ledgerId ? <span className="ledger-crimson"> · {c.ledgerId}</span> : null}</p>
        <h3 id={`coming-${c.slug}`} className="ledger-display text-[1.5rem] md:text-[1.7rem] leading-tight mt-1">{c.href ? <Link href={c.href} className="hover:ledger-crimson">{c.name}</Link> : c.name}</h3>
        {c.note && <p className="mt-3 text-[15.5px] leading-relaxed">{c.note}</p>}
        {!compact && (c.bestMonths || c.airport) && (
          <dl className="mt-4 grid grid-cols-2 gap-3 text-[14px]">
            {c.bestMonths && <div><dt className="ledger-eyebrow !text-[9.5px]">Best months</dt><dd className="mt-0.5">{c.bestMonths}</dd></div>}
            {c.airport && <div><dt className="ledger-eyebrow !text-[9.5px]">Fly into</dt><dd className="mt-0.5">{c.airport}</dd></div>}
          </dl>
        )}
        <div className="mt-auto pt-5 flex flex-wrap items-center gap-3">
          <Link href={plan} className="ledger-btn ledger-btn--solid">Ask James to hold a place</Link>
          {c.href && <Link href={c.href} className="ledger-btn">The page</Link>}
          {c.source && host && <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-[13px] ledger-muted underline underline-offset-4 ml-auto">From {host}</a>}
        </div>
      </div>
    </article>
  );
}
