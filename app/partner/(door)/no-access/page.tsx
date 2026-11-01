import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/booking-live/supabase/server";

export const metadata = { title: "No desk access" };

export default async function NoAccess() {
  const { user } = await currentUser();
  if (!user) redirect("/partner/login");
  return (
    <section className="max-w-xl">
      <p className="ledger-eyebrow ledger-crimson">Partner Desk</p>
      <h1 className="ledger-display text-[2.2rem] leading-[1.08] md:text-[2.8rem] mt-3">This account isn&rsquo;t on a partner team yet</h1>
      <p className="mt-4 text-[16px] leading-relaxed">You&rsquo;re signed in as <strong>{user.email}</strong>, but no partner organization has given this address access. Ask your organization&rsquo;s desk admin, or your James Wild &amp; Co contact, to invite you.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <form action="/auth/sign-out?to=partner" method="post"><button type="submit" className="ledger-btn">Sign out</button></form>
        <Link href="/partner/apply" className="ledger-btn-ghost uppercase self-center">Apply to become a partner</Link>
      </div>
    </section>
  );
}
