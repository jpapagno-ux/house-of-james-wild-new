import Link from "next/link";
import { BedDouble, Compass, Phone, PenLine } from "lucide-react";
import { SITE } from "@/lib/site";

// MobileActionBar — replaces the old sticky bar on phones: the four things a
// visitor most often wants, always one tap away. Hidden from lg up.
export default function MobileActionBar() {
  const item = "flex flex-col items-center justify-center gap-1 ledger-eyebrow !text-[9.5px] !text-ink";
  return (
    <nav aria-label="Quick actions" className="lg:hidden [body:has(#record-bar)_&]:hidden fixed bottom-0 inset-x-0 z-30 bg-paper/95 backdrop-blur border-t ledger-border pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4 h-14">
        <li><Link href="/stays" className={item}><BedDouble className="w-5 h-5" strokeWidth={1.25} />Stays</Link></li>
        <li><Link href="/destinations" className={item}><Compass className="w-5 h-5" strokeWidth={1.25} />Destinations</Link></li>
        <li><a href={`tel:${SITE.phone.tel}`} className={item}><Phone className="w-5 h-5" strokeWidth={1.25} />Call</a></li>
        <li><Link href="/plan" className={`${item} !text-crimson`}><PenLine className="w-5 h-5" strokeWidth={1.25} />Plan</Link></li>
      </ul>
    </nav>
  );
}
