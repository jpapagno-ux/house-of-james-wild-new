import Link from "next/link";
import { HOUSE_CRIMSON } from "@/components/record/Sections";

// The glance bar for a ship: the fare from, then route, nights, guests and ages,
// and Plan with James (House Crimson). Four facts on wide screens, two by two on phones.
export default function ShipGlance({ label = "From", price, basis, facts, cta }: { label?: string; price: string | null; basis: string; facts: [string, string][]; cta: { label: string; href: string } }) {
  return (
    <div className="relative bg-paper text-ink border ledger-border shadow-[0_10px_40px_rgba(0,0,0,0.25)] grid grid-cols-2 lg:grid-cols-[auto_1fr_auto] items-stretch">
      <div className="col-span-2 lg:col-span-1 px-5 lg:px-7 py-3.5 lg:py-4 border-b lg:border-b-0 lg:border-r ledger-rule flex lg:block items-baseline gap-3">
        <p className="ledger-eyebrow whitespace-nowrap">{label}</p>
        <p className="ledger-display text-[1.7rem] lg:text-3xl ledger-crimson leading-none lg:mt-1">{price ?? "On request"}</p>
        <p className="text-[12px] ledger-muted lg:mt-1 lg:max-w-[15rem] leading-snug">{basis}</p>
      </div>
      <dl className="col-span-2 lg:col-span-1 grid grid-cols-2 lg:grid-cols-4 ledger-rule">
        {facts.slice(0, 4).map(([k, v], i) => (
          <div key={k} className={`px-5 py-3 lg:py-4 ledger-rule ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
            <dt className="ledger-eyebrow">{k}</dt>
            <dd className="text-[14.5px] mt-0.5 leading-snug">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="hidden lg:flex items-center px-5 py-4 border-l ledger-rule">
        <Link href={cta.href} className="ledger-btn ledger-btn--solid whitespace-nowrap" style={{ background: HOUSE_CRIMSON, borderColor: HOUSE_CRIMSON }}>{cta.label}</Link>
      </div>
    </div>
  );
}
