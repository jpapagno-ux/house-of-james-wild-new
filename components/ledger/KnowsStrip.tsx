"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLAN_CTA, SITE } from "@/lib/site";

// Board 14, "James knows a place" on every page (James approved, 3 Nov 2026). A slim closing line above the footer;
// the homepage keeps its full invitation with the seal, and the planning and account pages need no second ask.
const SKIP = [/^\/$/, /^\/plan/, /^\/account/, /^\/booking/, /^\/folio/, /^\/partner/, /^\/desk/, /^\/auth/];

export default function KnowsStrip() {
  const path = usePathname() ?? "/";
  if (SKIP.some((r) => r.test(path))) return null;
  return (
    <section className="jw-knows bg-mist border-t ledger-border mt-20" aria-labelledby="knows-strip-h">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-10 md:py-12 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <div className="flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-house">Talk to the house</p>
          <h2 id="knows-strip-h" className="ledger-display text-[2rem] md:text-[2.6rem] leading-tight mt-2" style={{ color: "#1A1816" }}>James knows a place.</h2>
          <p className="mt-2 text-[15px] max-w-xl" style={{ color: "#6B635A" }}>Tell him where you are drawn and when. He answers from the Ledger.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href={PLAN_CTA.href} className="ledger-btn ledger-btn--house">{PLAN_CTA.label}</Link>
          <a href={`tel:${SITE.phone.tel}`} className="ledger-btn min-h-[44px]">{SITE.phone.display}</a>
        </div>
      </div>
    </section>
  );
}
