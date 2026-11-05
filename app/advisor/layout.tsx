import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ADVISOR_DESK } from "@/lib/platform/flags";

// /advisor/*: the James Wild & Co Advisor Desk. Private: never indexed, never cached, never in the
// sitemap. 404 everywhere while NEXT_PUBLIC_ADVISOR_DESK is off.
export const metadata: Metadata = {
  title: { default: "Advisor Desk", template: "%s · Advisor Desk · James Wild & Co" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default function AdvisorRoot({ children }: { children: React.ReactNode }) {
  if (!ADVISOR_DESK) notFound();
  return children;
}
