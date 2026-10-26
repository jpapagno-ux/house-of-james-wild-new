import { Feather, Hourglass, Lamp, Search, Signpost, Sparkles } from "lucide-react";
import Signature from "./Signature";
import { SIGNOFFS, type Verdict, type VerdictTag } from "@/lib/content/verdicts";

// The Verdict: a page from James's field book, under the stay's story and
// above the ways to get in touch. His words, the field-book marks from the
// Ledger & Linger cover, a sign-off line and the signature, written in ink.
const ICON: Record<VerdictTag, typeof Feather> = { "Worth your time?": Hourglass, "Look closer": Search, "After dark": Lamp, "Unexpected beauty": Sparkles, Curiosity: Feather, "The dead end": Signpost };

export default function VerdictCard({ name, v }: { name: string; v: Verdict }) {
  const signoff = v.signoff ?? SIGNOFFS[0];
  return (
    <section id="verdict" className="mt-16 md:mt-24 scroll-mt-32" aria-labelledby="verdict-heading">
      <div className="relative mx-auto max-w-4xl px-6 md:px-14 py-10 md:py-14 text-[#2b2622] shadow-[0_18px_50px_-20px_rgba(60,40,20,0.45)] rotate-[-0.4deg]"
        style={{ background: "radial-gradient(120% 90% at 20% 10%, #f7f0e1 0%, #efe4cf 55%, #e6d6b8 100%)", backgroundColor: "#f1e7d3" }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply" aria-hidden="true" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 31px, #8b6b43 31px 32px)" }} />
        <div className="pointer-events-none absolute inset-y-0 left-10 md:left-16 w-px bg-[#b6584a]/40" aria-hidden="true" />
        <div className="relative">
          <p className="ledger-eyebrow !text-[#8b3a2e]">From the field book of James Wild · {v.where} · {v.when}</p>
          <h2 id="verdict-heading" className="ledger-display text-[2rem] md:text-[2.8rem] mt-2 leading-tight">The Verdict on {name}</h2>
          <div className="mt-6 space-y-4 ledger-display italic text-[1.25rem] md:text-[1.55rem] leading-[1.55]">
            {v.text.map((t, i) => <p key={i}>{i === 0 ? <>&ldquo;{t}</> : t}{i === v.text.length - 1 ? <>&rdquo;</> : null}</p>)}
          </div>
          <ul className="mt-7 flex flex-wrap gap-2.5" aria-label="Field-book marks">
            {v.tags.map((t) => { const I = ICON[t]; return <li key={t} className="inline-flex items-center gap-2 border border-[#8b6b43]/50 px-3 py-1.5 text-[12px] tracking-[0.14em] uppercase"><I className="w-4 h-4 text-[#8b3a2e]" strokeWidth={1.4} aria-hidden="true" />{t}</li>; })}
          </ul>
          <div className="mt-9 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <p className="font-mono text-[13px] tracking-[0.12em] uppercase leading-relaxed max-w-md">{signoff}</p>
            <div className="text-right">
              <Signature />
              <p className="ledger-eyebrow !text-[#5c4a38] mt-1">James Wild · Chief Expedition Officer</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function verdictSchema(v: Verdict, name: string, url: string, founderId: string) {
  return { "@type": "Review", itemReviewed: { "@type": "LodgingBusiness", name, url }, author: { "@id": founderId }, reviewBody: v.text.join(" "), ...(/\d{4}/.test(v.when) ? { datePublished: v.when.match(/\d{4}/)![0] } : {}), keywords: v.tags.join(", ") };
}
