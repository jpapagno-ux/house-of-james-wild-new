import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import AccountNav from "@/components/booking-live/AccountNav";
import { FLAGS } from "@/lib/booking-live/flags";

// /account/*: the traveler's private shelf. Never indexed, never cached,
// never in the sitemap; robots.ts disallows it too. 404 while the flag is off.
export const metadata: Metadata = {
  title: { default: "My Folio", template: "%s · My Folio" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!FLAGS.accounts) notFound();
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <AccountNav />
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </>
  );
}
