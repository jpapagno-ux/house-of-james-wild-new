import Link from "next/link";
import { NO_DATES } from "@/lib/dates";

// Shown in place of Dates & rates when every published departure of a ship or
// voyage has passed (lib/dates.ts): the page stays up and points to James.
// `unpublished`: the operator publishes no dates or fares at all, so the panel simply says "Ask us".
export default function NoDates({ name, planHref, unpublished, operator }: { name: string; planHref: string; unpublished?: boolean; operator?: string }) {
  return (
    <div className="mt-7 border ledger-border p-5 md:p-6 bg-paper-card">
      <p className="ledger-eyebrow ledger-crimson">{unpublished ? "Dates and fares: ask us" : NO_DATES.title}</p>
      <p className="mt-2 text-[16px] leading-relaxed max-w-2xl">{unpublished ? `${operator ?? "The operator"} publishes no dates or fares for ${name}. Ask James and he will quote your dates.` : NO_DATES.line.replace("The published dates", `${name}'s published dates`)}</p>
      <Link href={planHref} className="ledger-btn ledger-btn--solid !py-2.5 mt-4 inline-flex">{unpublished ? "Ask us for a quote" : "Ask James for new dates"}</Link>
    </div>
  );
}
