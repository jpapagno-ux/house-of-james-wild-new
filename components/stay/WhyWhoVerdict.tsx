import Link from "next/link";
import { Check, Minus } from "lucide-react";

// Why it's here, who it's for, the verdict (James, 10 Nov 2026: "focus on showing on the stays why we vetted it, why
// it's here, and who it's best suited for ... under the entrance ... tighten this up and really make sure that viewers
// understand who it's best suited for and not, and get more into if there's a verdict or not"). One band straight under
// the house entrance: three columns on a wide screen, stacked on a phone. Every line comes from the record or from
// James's own filed words; where James has no verdict yet the band says so plainly.

export type WhyItem = { title?: string | null; body: string };

export default function WhyWhoVerdict({ name, why, vetted, whoFor, suited, thinkTwice, verdict, planHref }: {
  name: string; why: WhyItem[]; vetted: string; whoFor?: string | null; suited: string[]; thinkTwice: string[];
  verdict: { line: string; by: string } | null; planHref: string;
}) {
  const path = "var(--tone-path, #2E2B28)";
  const Head = ({ n, label, title }: { n: string; label: string; title: string }) => (
    <>
      <span aria-hidden="true" className="block w-9 h-[2px]" style={{ background: path }} />
      <p className="mt-3 ledger-eyebrow" style={{ color: path }}>{n} · {label}</p>
      <h3 className="mt-1 ledger-display text-[1.45rem] md:text-[1.6rem] leading-tight">{title}</h3>
    </>
  );
  return (
    <section id="why" aria-label={`Why ${name} is in the Ledger, who it suits, and the verdict`} className="mt-12 md:mt-16 grid gap-10 md:gap-8 lg:gap-12 md:grid-cols-3">
      <div>
        <Head n="01" label="Why it's here" title="Why We Vetted It" />
        <ul className="mt-4 grid gap-4">
          {why.slice(0, 3).map((w) => (
            <li key={w.body.slice(0, 40)}>
              {w.title && <p className="text-[12px] tracking-[0.14em] uppercase font-mono ledger-muted">{w.title}</p>}
              <p className="mt-1 text-[15.5px] leading-relaxed">{w.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[13px] ledger-muted border-t ledger-border pt-3">{vetted}</p>
      </div>

      <div>
        <Head n="02" label="Who it's for" title="Best Suited To" />
        {whoFor && <p className="mt-4 text-[15.5px] leading-relaxed">{whoFor}</p>}
        {suited.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {suited.map((x) => <li key={x} className="inline-flex items-center gap-1.5 border ledger-border bg-white px-2.5 py-1 text-[12.5px]"><Check aria-hidden="true" className="w-3.5 h-3.5" style={{ color: path }} strokeWidth={1.8} />{x}</li>)}
          </ul>
        )}
        {thinkTwice.length > 0 && (
          <div className="mt-6">
            <p className="ledger-eyebrow">Think twice if</p>
            <ul className="mt-2 grid gap-2">
              {thinkTwice.map((x) => <li key={x} className="flex gap-2 text-[14.5px] leading-snug"><Minus aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 ledger-muted" strokeWidth={1.6} />{x}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div>
        <Head n="03" label="The verdict" title={verdict ? "James's Verdict" : "No Verdict Yet"} />
        {verdict ? (
          <>
            <blockquote className="mt-4 ledger-display italic text-[1.3rem] md:text-[1.4rem] leading-snug">&ldquo;{verdict.line}&rdquo;</blockquote>
            <p className="mt-2 text-[12px] tracking-[0.16em] uppercase ledger-muted">{verdict.by}</p>
            <Link href="#verdict" className="mt-4 inline-flex items-center min-h-[44px] ledger-btn-ghost">Read the full verdict</Link>
          </>
        ) : (
          <>
            <p className="mt-4 text-[15.5px] leading-relaxed">James hasn&rsquo;t written a verdict on {name} yet. Ask James or an advisor for a first-hand take before you book; they will tell you plainly whether it fits.</p>
            <Link href={planHref} className="mt-4 inline-flex items-center min-h-[44px] ledger-btn-ghost">Ask James for his take</Link>
          </>
        )}
      </div>
    </section>
  );
}
