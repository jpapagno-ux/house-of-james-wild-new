import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PARTNER_DESK } from "@/lib/platform/flags";

// /partner/*: the James Wild & Co Partner Desk. Private: never indexed, never cached,
// never in the sitemap. 404 everywhere while NEXT_PUBLIC_PARTNER_DESK is off.
export const metadata: Metadata = {
  title: { default: "Partner Desk", template: "%s · Partner Desk · James Wild & Co" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default function PartnerRoot({ children }: { children: React.ReactNode }) {
  if (!PARTNER_DESK) notFound();
  return children;
}
