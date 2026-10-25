import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JwcoSeal } from "@/components/ledger/Marks";
import { initials, type Advisor } from "@/lib/content/advisors";

// AdvisorCard: the house's advisor card, used on /about/team and (later) on
// destination, stay and voyage pages through the advisor feed. Portrait,
// number, name, role, one line, and two ways in: the profile and the
// planning form, which arrives pre-addressed to this advisor.
export default function AdvisorCard({ a, n }: { a: Advisor; n: number }) {
  const founder = a.slug === "james-papagno";
  const planHref = `/plan?advisor=${a.slug}`;
  return (
    <article className="group h-full bg-paper border ledger-border flex flex-col" aria-labelledby={`adv-${a.slug}`}>
      <div className="relative aspect-[4/5] bg-paper-card overflow-hidden border-b ledger-rule">
        {a.portrait ? (
          <Image src={a.portrait.url} alt={a.portrait.alt} fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-coast-mist">
            <span className="w-24 h-24 rounded-full border border-coast-deep/40 flex items-center justify-center ledger-display text-[2.2rem] text-coast-deep" aria-hidden="true">{initials(a.name)}</span>
            <span className="ledger-eyebrow !text-coast-deep">Portrait to come</span>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-paper/95 px-2 py-1 font-mono text-[11px] tracking-[0.12em]">No. {String(n).padStart(2, "0")}</span>
        {founder && <span className="absolute top-2 right-2 bg-paper/95 rounded-full p-1"><JwcoSeal size={58} /></span>}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="ledger-eyebrow ledger-crimson">{a.role}</p>
        <h3 id={`adv-${a.slug}`} className="ledger-display text-[1.6rem] leading-tight mt-1">{a.name}</h3>
        <p className="mt-2 text-[15.5px] leading-snug ledger-muted">{a.intro ?? `${a.firstName}'s profile is being written. In the meantime, the planning form will reach ${a.firstName} directly.`}</p>
        {a.specialties.length > 0 && <ul className="mt-3 flex flex-wrap gap-1.5">{a.specialties.slice(0, 3).map((s) => <li key={s} className="text-[12px] border ledger-border px-2 py-0.5">{s}</li>)}</ul>}
        <div className="mt-auto pt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          {a.profileHref && <Link href={a.profileHref} className="inline-flex items-center gap-1.5 text-[15px] hover:ledger-crimson hover:gap-2.5 transition-all">{founder ? "Meet James" : "Read profile"} <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></Link>}
          <Link href={planHref} className="ledger-btn-ghost">Plan with {a.firstName}</Link>
        </div>
      </div>
    </article>
  );
}
