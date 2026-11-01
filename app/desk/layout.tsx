import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import { PARTNER_DESK } from "@/lib/platform/flags";

// /desk/*: the house's side of the Partner Desk (James Wild & Co editors only).
export const metadata: Metadata = {
  title: { default: "House desk", template: "%s · House desk · James Wild & Co" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default function HouseDeskLayout({ children }: { children: React.ReactNode }) {
  if (!PARTNER_DESK) notFound();
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-8 md:pt-12 pb-20"><div className="max-w-ledger mx-auto px-5 md:px-10">{children}</div></main>
    </>
  );
}
