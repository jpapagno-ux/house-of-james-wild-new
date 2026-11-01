import Link from "next/link";
import { NO_DATES } from "@/lib/dates";

// Shown in place of Dates & rates when every published departure of a ship or
// voyage has passed (lib/dates.ts): the page stays up and points to James.
export default function NoDates({ name, planHref }: { name: string; planHref: string }) {
  return (
    <div className="mt-7 border ledger-border p-5 md:p-6 bg-paper-card">
      <p className="ledger-eyebrow ledger-crimson">{NO_DATES.title}</p>
      <p className="mt-2 text-[16px] leading-relaxed max-w-2xl">{NO_DATES.line.replace("The published dates", `${name}'s published dates`)}</p>
      <Link href={planHref} className="ledger-btn ledger-btn--solid !py-2.5 mt-4 inline-flex">Ask James for new dates</Link>
    </div>
  );
}
