"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Phone, PenLine, Search, Navigation } from "lucide-react";
import { SITE } from "@/lib/site";
import { FLAGS } from "@/lib/booking-live/flags";
import { openSearch } from "@/lib/search-bus";
import { planFor } from "@/lib/content/page-leads";

// MobileActionBar (James, 18 Nov 2026: "best UX"): on phones, the five things a traveller reaches for, always under
// the thumb. Search opens the house search; Bearing finds the advisor who shares your answers; Folio is your own
// journal; Call rings the house; Plan names the page's advisor (Anthony on Indonesia pages, James elsewhere).
// Hidden from lg up, under a record's own bar, and on the desks (advisor, house, partner), which have their own tabs.
const DESKS = ["/advisor", "/desk", "/partner"];

export default function MobileActionBar() {
  const path = usePathname() ?? "/";
  if (DESKS.some((d) => path === d || path.startsWith(`${d}/`))) return null;
  const plan = planFor(path);
  const item = "flex flex-col items-center justify-center gap-1 min-h-[56px] w-full ledger-eyebrow !text-[9.5px] !tracking-[0.12em] !text-ink";
  const icon = "w-5 h-5";
  return (
    <nav aria-label="Quick actions" className="lg:hidden [body:has(#record-bar)_&]:hidden fixed bottom-0 inset-x-0 z-30 bg-paper/95 backdrop-blur border-t ledger-border pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        <li><button type="button" onClick={() => openSearch()} className={item}><Search className={icon} strokeWidth={1.25} aria-hidden="true" />Search</button></li>
        <li><Link href="/advisors/match" className={item}><Navigation className={icon} strokeWidth={1.25} aria-hidden="true" />Bearing</Link></li>
        <li><Link href={FLAGS.accounts ? "/account" : "/folio"} className={item}><BookOpen className={icon} strokeWidth={1.25} aria-hidden="true" />Folio</Link></li>
        <li><a href={`tel:${SITE.phone.tel}`} className={item}><Phone className={icon} strokeWidth={1.25} aria-hidden="true" />Call</a></li>
        <li><Link href={plan.href} aria-label={plan.label} className={`${item} !text-[#8B2525]`}><PenLine className={icon} strokeWidth={1.25} aria-hidden="true" />Plan</Link></li>
      </ul>
    </nav>
  );
}
