import Image from "next/image";
import SafeLink from "@/components/ledger/SafeLink";
import type { EFCard } from "@/lib/content/exceptional-few-cards";
import { EFStamp } from "@/components/exceptional-few/EFBadge";

// One place in The Exceptional Few: the number first (the collection is read in order), the photograph,
// name, where, the one line, and what to pair it with. House chrome only: paper, keyline, crimson number.
export default function EFCollectionCard({ c, pairs = true, priority = false }: { c: EFCard; pairs?: boolean; priority?: boolean }) {
  return (
    <article className="group flex flex-col border ledger-rule bg-white h-full">
      <SafeLink href={c.href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          {c.image && <Image src={c.image.url} alt={c.image.alt} fill priority={priority} sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 92vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
          <EFStamp no={c.no} size={132} rotate={-7} seed={c.no * 7 + 3} onPhoto className="absolute right-3 bottom-4 pointer-events-none" />
          
        </div>
      </SafeLink>
      <div className="relative p-5 flex flex-col flex-1">
        <p className="ledger-eyebrow">{c.kind === "Ship" ? "Voyages · Ship" : "Stays"} · {c.place}</p>
        <h3 className="ledger-display text-[1.45rem] leading-tight mt-2"><SafeLink href={c.href} className="hover:underline underline-offset-4">{c.name}</SafeLink></h3>
        {c.why && (
          <blockquote className="mt-3 border-l-2 border-[#8B2525] pl-3">
            <p className="ledger-eyebrow text-house">{c.whyByJames ? "Why James sends people here" : "Why it made the cut"}</p>
            <p className={`mt-1 leading-relaxed ${c.whyByJames ? "font-display italic text-[18px] leading-snug" : "text-[15px]"}`}>{c.whyByJames ? `\u201C${c.why}\u201D` : c.why}</p>
            {c.whyByJames && <p className="mt-1 font-display italic text-[15px] text-[#6B635A]">JW</p>}
          </blockquote>
        )}
        {c.line && <p className="mt-3 text-[15px] leading-relaxed ledger-muted">{c.line}</p>}
        {c.pathways.length > 0 && <ul className="mt-4 flex flex-wrap gap-2" aria-label="Wild Pathways">{c.pathways.slice(0, 3).map((p) => <li key={p.id} className="house-chip !text-[10px] !px-2 !py-1">{p.name}</li>)}</ul>}
        {pairs && c.pairs.length > 0 && (
          <div className="mt-5 pt-4 border-t ledger-rule">
            <p className="ledger-eyebrow">Pair it with</p>
            <ul className="mt-2 space-y-1">{c.pairs.map((p) => <li key={p.href}><SafeLink href={p.href} className="ledger-btn-ghost !text-[15px]">{p.name}</SafeLink></li>)}</ul>
          </div>
        )}
        <div className="mt-auto pt-5"><SafeLink href={c.href} className="ledger-btn-ghost">Enter {c.kind === "Ship" ? "the ship" : "the stay"}</SafeLink></div>
      </div>
    </article>
  );
}
