import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import { FLAGS } from "@/lib/booking-live/flags";

// /booking/*: Check Availability and saved requests. Noindex while Booking
// Live is in testing (the SEO plan opens a single /booking hub at launch).
// 404 while the quotes flag is off.
export const metadata: Metadata = {
  title: { default: "Check Availability", template: "%s · James Wild & Co" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  if (!FLAGS.quotes) notFound();
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">{children}</div>
      </main>
    </>
  );
}
