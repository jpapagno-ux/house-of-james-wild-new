"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, Phone, PenLine, Search, Navigation } from "lucide-react";
import { SITE } from "@/lib/site";
import { openSearch } from "@/lib/search-bus";
import { planFor } from "@/lib/content/page-leads";
import { openSignIn } from "@/lib/signin-bus";

// MobileActionBar (James, 18 Nov 2026: "best UX"): on phones, the five things a traveller reaches for, always under
// the thumb. Search opens the house search; Bearing finds the advisor who shares your answers; Sign in opens the three
// doors (Traveler, Advisor, Partner; 19 Nov 2026, replacing Folio, which is behind the Traveler door); Call rings the house; Plan names the page's advisor (Anthony on Indonesia pages, James elsewhere).
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
        <li><button type="button" onClick={() => openSignIn()} className={item}><KeyRound className={icon} strokeWidth={1.25} aria-hidden="true" />Sign in</button></li>
        <li><a href={`tel:${SITE.phone.tel}`} className={item}><Phone className={icon} strokeWidth={1.25} aria-hidden="true" />Call</a></li>
        <li><Link href={plan.href} aria-label={plan.label} className={`${item} !text-[#8B2525]`}><PenLine className={icon} strokeWidth={1.25} aria-hidden="true" />Plan</Link></li>
      </ul>
    </nav>
  );
}
