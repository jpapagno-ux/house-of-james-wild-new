"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FLAGS } from "@/lib/booking-live/flags";

// Tabs across the top of /account. Trips (requests, holds, bookings) arrived
// with Phase 3a; Payments arrive with Phase 3b.
const TABS = [
  { href: "/account", label: "My Folio" },
  { href: "/account/trips", label: "Trips" },
  { href: "/account/favorites", label: "Saved stays" },
  { href: "/account/folios", label: "Journeys" },
  { href: "/account/settings", label: "Account & privacy" },
];

export default function AccountNav() {
  const path = usePathname();
  if (path?.startsWith("/account/sign-in") || path?.startsWith("/account/invite")) return null;
  return (
    <nav aria-label="My Folio" className="border-b ledger-rule">
      <ul className="flex gap-6 overflow-x-auto">
        {TABS.map((t) => {
          const active = t.href === "/account" ? path === "/account" : path?.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? "page" : undefined}
                className={`ledger-eyebrow inline-block py-3 border-b-2 ${active ? "ledger-crimson ledger-crimson-border" : "border-transparent hover:opacity-60"}`}>
                {t.label}
              </Link>
            </li>
          );
        })}
        {FLAGS.accounts && (
          <li className="ml-auto">
            <form action="/auth/sign-out" method="post"><button type="submit" className="ledger-eyebrow py-3 hover:opacity-60">Sign out</button></form>
          </li>
        )}
      </ul>
    </nav>
  );
}
