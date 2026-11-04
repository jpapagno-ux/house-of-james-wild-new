import type { Metadata } from "next";
import SiteHeader from "@/components/ledger/SiteHeader";

// /desk/*: the house's side of the site. Two doors, each gated by its own
// layout or page: /desk/review (Partner Desk, James Wild & Co editors,
// requireHouse) and /desk/bookings (Booking Live, advisors and admins).
// Never indexed.
export const metadata: Metadata = {
  title: { default: "House desk", template: "%s · House desk · James Wild & Co" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default function HouseDeskLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-8 md:pt-12 pb-20"><div className="max-w-ledger mx-auto px-5 md:px-10">{children}</div></main>
    </>
  );
}
