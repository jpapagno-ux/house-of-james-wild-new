import type React from "react";
import { Feather, Hourglass, Lamp, Search, Signpost, Sparkles } from "lucide-react";
import Signature from "./Signature";
import Image from "next/image";
import { SKETCHES, signoffFor, type Verdict, type VerdictTag } from "@/lib/content/verdicts";

// The Verdict: a page from James's field book, under the stay's story and
// above the ways to get in touch. His words, the field-book marks from the
// Ledger & Linger cover, a sign-off line and the signature, written in ink.
const ICON: Record<VerdictTag, typeof Feather> = { "Worth your time?": Hourglass, "Look closer": Search, "After dark": Lamp, "Unexpected beauty": Sparkles, Curiosity: Feather, "The dead end": Signpost };

export default function VerdictCard({ name, v, k, stamp }: { name: string; v: Verdict; k: string; stamp?: React.ReactNode }) {
  const signoff = v.signoff ?? signoffFor(k);
  return (
    <section id="verdict" className="mt-14 md:mt-20 scroll-mt-32" aria-labelledby="verdict-heading">
      <div className="relative mx-auto max-w-xl bg-[#fdfcf8] text-[#2b2622] border border-[#e7e1d4] px-6 py-7 md:px-9 md:py-9 shadow-[0_1px_0_#efe9dc,0_14px_34px_-18px_rgba(60,45,25,0.35)]">
        {v.sketch && <Image src={SKETCHES[v.sketch].src} alt="" width={SKETCHES[v.sketch].w} height={SKETCHES[v.sketch].h} aria-hidden="true" className="pointer-events-none select-none absolute right-2 md:right-4 top-6 h-[78%] w-auto opacity-[0.16] mix-blend-multiply" />}
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#e9dfcb]/80 rotate-[-2deg] shadow-sm" aria-hidden="true" />
        <div className="relative flex items-baseline justify-between gap-4">
          <p className="ledger-eyebrow !text-[10px] !text-[#8b3a2e]">The verdict</p>
          <p className="ledger-eyebrow !text-[10px] !text-[#8a7f70]">{v.where} · {v.when}</p>
        </div>
        <h2 id="verdict-heading" className="sr-only">The Verdict on {name}</h2>
        <div className="relative mt-4 space-y-3 ledger-display italic text-[1.08rem] md:text-[1.2rem] leading-[1.6]">
          {v.text.map((t, i) => <p key={i}>{i === 0 ? <>&ldquo;{t}</> : t}{i === v.text.length - 1 ? <>&rdquo;</> : null}</p>)}
        </div>
        <div className="relative mt-6 pt-5 border-t border-dashed border-[#d9cfbd] flex items-end justify-between gap-4">
          <div className="min-w-0">
            <ul className="flex flex-wrap gap-x-3 gap-y-1.5" aria-label="Field-book marks">
              {v.tags.map((t) => { const I = ICON[t]; return <li key={t} className="inline-flex items-center gap-1.5 text-[10.5px] tracking-[0.16em] uppercase text-[#5c4a38]"><I className="w-3.5 h-3.5 text-[#8b3a2e]" strokeWidth={1.4} aria-hidden="true" />{t}</li>; })}
            </ul>
            <p className="mt-3 ledger-display italic text-[13.5px] text-[#6b5d4c]">{signoff}</p>
          </div>
          <div className="shrink-0 text-right">
            <Signature className="w-28 md:w-36" />
            <p className="ledger-eyebrow !text-[9px] !text-[#8a7f70] mt-1">James Wild</p>
          </div>
        </div>
        {/* The volume's ink stamp, pressed beside James's note (volume kit). */}
        {stamp && <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-10">{stamp}</div>}
      </div>
      {stamp && <div className="lg:hidden mt-6 flex justify-center">{stamp}</div>}
    </section>
  );
}

export function verdictSchema(v: Verdict, name: string, url: string, founderId: string) {
  return { "@type": "Review", itemReviewed: { "@type": "LodgingBusiness", name, url }, author: { "@id": founderId }, reviewBody: v.text.join(" "), ...(/\d{4}/.test(v.when) ? { datePublished: v.when.match(/\d{4}/)![0] } : {}), keywords: v.tags.join(", ") };
}
