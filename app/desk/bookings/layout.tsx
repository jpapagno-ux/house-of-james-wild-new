import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FLAGS } from "@/lib/booking-live/flags";
import { currentUser } from "@/lib/booking-live/supabase/server";
import { houseOps } from "@/lib/booking-live/ops";

// /desk/bookings: House bookings, the house's side of Booking Live (requests, holds, bookings,
// payments). House operations only (jw_admin, jw_portfolio_manager or admin in the internal
// organization) with the authenticator code; never indexed. Advisors work from the Advisor Desk.
export const metadata: Metadata = { title: { default: "House bookings", template: "%s · House bookings" }, robots: { index: false, follow: false, nocache: true } };
export const dynamic = "force-dynamic";

export default async function BookingDeskLayout({ children }: { children: React.ReactNode }) {
  if (!FLAGS.quotes) notFound();
  const { sb, user } = await currentUser();
  if (!user) redirect(`/partner/login?next=${encodeURIComponent("/desk/bookings")}`);
  const ops = await houseOps(sb, user.id);
  if (ops === "needs_code") redirect(`/partner/security?next=${encodeURIComponent("/desk/bookings")}`);
  if (ops !== "ok") notFound();
  return (
    <>{children}</>
  );
}
