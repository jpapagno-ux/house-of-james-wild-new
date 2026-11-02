import Link from "next/link";
import { HOUSE_CRIMSON } from "@/components/record/Sections";

// The glance bar for a ship: the fare from, then route, nights, guests and ages,
// and Plan with James (House Crimson). Four facts in a row on wide screens, two by
// two on phones. `compact` (a hero that shares its width with the vessel's film):
// the facts sit two by two and the button under the fare, so no label ever runs into
// the next or wraps a word per line (voyages audit, 1 Nov 2026).
export default function ShipGlance({ label = "From", price, basis, facts, cta, compact = false }: { label?: string; price: string | null; basis: string; facts: [string, string][]; cta: { label: string; href: string }; compact?: boolean }) {
  const button = <Link href={cta.href} className="ledger-btn ledger-btn--solid whitespace-nowrap" style={{ background: HOUSE_CRIMSON, borderColor: HOUSE_CRIMSON }}>{cta.label}</Link>;
  return (
    <div className={`relative bg-paper text-ink border ledger-border shadow-[0_10px_40px_rgba(0,0,0,0.25)] grid grid-cols-2 items-stretch ${compact ? "lg:grid-cols-[minmax(0,15rem)_1fr]" : "lg:grid-cols-[minmax(0,16rem)_1fr_auto]"}`}>
      <div className="col-span-2 lg:col-span-1 px-5 lg:px-6 py-3.5 lg:py-4 border-b lg:border-b-0 lg:border-r ledger-rule flex lg:block items-baseline gap-3 flex-wrap">
        <p className="ledger-eyebrow whitespace-nowrap">{label}</p>
        <p className="ledger-display text-[1.7rem] lg:text-3xl ledger-crimson leading-none lg:mt-1 whitespace-nowrap">{price ?? "On request"}</p>
        <p className="text-[12px] ledger-muted lg:mt-1 leading-snug">{basis}</p>
        {compact && <div className="hidden lg:block mt-3">{button}</div>}
      </div>
      <dl className={`col-span-2 lg:col-span-1 grid grid-cols-2 ledger-rule ${compact ? "" : "lg:grid-cols-4"}`}>
        {facts.slice(0, 4).map(([k, v], i) => (
          <div key={k} className={`min-w-0 px-5 py-3 lg:py-4 ledger-rule ${i % 2 ? "border-l" : ""} ${i > 1 ? `border-t ${compact ? "" : "lg:border-t-0"}` : ""} ${i === 2 && !compact ? "lg:border-l" : ""}`}>
            <dt className="ledger-eyebrow whitespace-nowrap">{k}</dt>
            <dd className="text-[14.5px] mt-0.5 leading-snug [text-wrap:balance]">{v}</dd>
          </div>
        ))}
      </dl>
      {!compact && <div className="hidden lg:flex items-center px-5 py-4 border-l ledger-rule">{button}</div>}
    </div>
  );
}
