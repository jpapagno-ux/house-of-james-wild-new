import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JwcoSeal } from "@/components/ledger/Marks";
import { Reveal } from "@/components/ledger/Motion";
import type { Rule } from "@/lib/content/about";

// Shared parts for the house pages (/about, /about/founder, /about/team). Server components except where Motion is used.

export function HouseHero({ eyebrow, title, subtitle, image, facts, quote }: { eyebrow: string; title: string; subtitle: string; image: { url: string; alt: string }; facts?: [string, string][]; quote?: string }) {
  return (
    <header className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-end">
      <div>
        <p className="ledger-eyebrow ledger-crimson">{eyebrow}</p>
        <h1 className="ledger-display text-[2.1rem] leading-[1.12] md:text-[3.1rem] mt-3">{title}</h1>
        <p className="mt-4 text-[18px] md:text-[19px] ledger-muted max-w-xl leading-relaxed">{subtitle}</p>
        {quote && (
          <blockquote className="mt-6 border-l-2 border-crimson pl-4 max-w-xl">
            <p className="ledger-display italic text-[19px] leading-snug">&ldquo;{quote}&rdquo;</p>
            <footer className="ledger-eyebrow mt-2">James Wild, Founder</footer>
          </blockquote>
        )}
        {facts && (
          <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-4 border-t ledger-rule pt-4">
            {facts.map(([k, v]) => (
              <div key={k}><dt className="ledger-eyebrow">{k}</dt><dd className="ledger-display text-[1.2rem] md:text-[1.35rem] mt-1 leading-tight">{v}</dd></div>
            ))}
          </dl>
        )}
      </div>
      <div className="relative">
        <div className="relative aspect-[4/3] lg:aspect-[5/4] overflow-hidden bg-paper-card">
          <Image src={image.url} alt={image.alt} fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
        </div>
        <span className="absolute -bottom-6 -left-4 md:-left-6 bg-paper rounded-full p-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.16)]"><JwcoSeal size={92} /></span>
      </div>
    </header>
  );
}

export function SectionHead({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <>
      <p className="ledger-eyebrow ledger-crimson">{eyebrow}</p>
      <h2 id={id} className="ledger-display text-[1.75rem] md:text-4xl mt-2 leading-tight">{title}</h2>
    </>
  );
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return <div className="space-y-4 text-[17px] md:text-[18px] leading-relaxed max-w-2xl">{paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>;
}

export function PullQuote({ text, by = "James Wild" }: { text: string; by?: string }) {
  return (
    <figure className="my-2 max-w-3xl">
      <blockquote className="ledger-display italic text-[1.6rem] md:text-[2.1rem] leading-snug ledger-crimson">&ldquo;{text}&rdquo;</blockquote>
      <figcaption className="ledger-eyebrow mt-3">{by}</figcaption>
    </figure>
  );
}

// The rules of the road as numbered cards. compact = the 4-rule excerpt.
export function RulesGrid({ rules, compact = false }: { rules: Rule[]; compact?: boolean }) {
  return (
    <ol className={`mt-8 grid gap-5 ${compact ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      {rules.map((r, i) => (
        <li key={r.n} className={`ledger-paper p-6 flex flex-col ${!compact && i === rules.length - 1 && rules.length % 3 === 1 ? "lg:col-span-3 lg:grid lg:grid-cols-[auto_1fr_1fr] lg:gap-8 lg:items-start" : ""}`}>
          <span className="font-mono text-[13px] ledger-crimson">{r.n}</span>
          <div>
            <h3 className="ledger-display text-[1.45rem] leading-snug mt-1">{r.title}</h3>
            <p className="ledger-hand text-[1.55rem] leading-tight mt-3 text-coast-deep">&ldquo;{r.james}&rdquo;</p>
          </div>
          {!compact && <p className="mt-4 lg:mt-1 text-[15px] ledger-muted leading-relaxed border-t ledger-border pt-3 lg:border-t-0 lg:pt-0"><span className="ledger-eyebrow block mb-1">How the house does it</span>{r.house}</p>}
        </li>
      ))}
    </ol>
  );
}

export function JamesNote({ text }: { text: string }) {
  return (
    <aside className="mt-16 md:mt-24 border-y ledger-rule py-10 md:py-12 grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center" aria-label="A note from James">
      <JwcoSeal size={110} />
      <div>
        <p className="ledger-eyebrow">A note from James</p>
        <p className="ledger-hand text-[2rem] md:text-[2.4rem] leading-tight mt-2">&ldquo;{text}&rdquo;</p>
        <p className="ledger-eyebrow mt-3">James Wild · Founder &amp; Chief Expedition Officer</p>
      </div>
    </aside>
  );
}

export function HouseLinks({ current }: { current: "about" | "founder" | "team" }) {
  const all = [
    { k: "about", href: "/about", label: "The house", line: "Why we're still going, forty-four years in." },
    { k: "founder", href: "/about/founder", label: "Meet James", line: "The founder, his field log and his credentials." },
    { k: "team", href: "/about/team", label: "The team", line: "The advisors who plan from the Ledger, and how to join them." },
  ].filter((x) => x.k !== current);
  return (
    <nav aria-label="More about the house" className="mt-14 grid sm:grid-cols-2 gap-4">
      {all.map((x) => (
        <Link key={x.k} href={x.href} className="group border ledger-border p-5 hover:border-crimson transition-colors">
          <p className="ledger-eyebrow ledger-crimson">{x.label}</p>
          <p className="mt-1 text-[16px]">{x.line}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] group-hover:gap-2.5 transition-all">Read <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span>
        </Link>
      ))}
    </nav>
  );
}

export function PlanClose({ title = "Somewhere new is closer than you think.", line = "Tell James where you're drawn, or let the Compass ask the questions first." }: { title?: string; line?: string }) {
  return (
    <section className="mt-16 bg-coast-deep text-paper p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-6 items-center" aria-label="Plan with James">
      <div>
        <p className="ledger-eyebrow !text-coast-light">Your move</p>
        <p className="ledger-display text-[1.8rem] md:text-[2.3rem] leading-tight mt-2">{title}</p>
        <p className="mt-3 text-[17px] text-paper/80 max-w-xl">{line}</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Link href="/plan" className="ledger-btn ledger-btn--solid">Plan with James</Link>
        <Link href="/compass" className="text-[15px] underline underline-offset-4 decoration-paper/40 hover:decoration-paper">Take the Compass</Link>
      </div>
    </section>
  );
}

export { Reveal };
