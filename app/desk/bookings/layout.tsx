import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FLAGS } from "@/lib/booking-live/flags";
import { currentUser } from "@/lib/booking-live/supabase/server";
import { isAdvisor } from "@/lib/booking-live/ops";

// /desk/bookings: the house's side of Booking Live (requests, holds, bookings, payments).
// Advisors and admins only (organisation role, checked on the server); never
// indexed. The Base44 Advisor Desk can call the same routes later.
export const metadata: Metadata = { title: { default: "Advisor Desk", template: "%s · Advisor Desk" }, robots: { index: false, follow: false, nocache: true } };
export const dynamic = "force-dynamic";

export default async function BookingDeskLayout({ children }: { children: React.ReactNode }) {
  if (!FLAGS.quotes) notFound();
  const { sb, user } = await currentUser();
  if (!user) redirect(`/account/sign-in?next=${encodeURIComponent("/desk/bookings")}`);
  if (!(await isAdvisor(sb, user.id))) notFound();
  return (
    <>{children}</>
  );
}
