import { redirect } from "next/navigation";
import PartnerSignIn from "@/components/platform/PartnerSignIn";
import { currentUser } from "@/lib/booking-live/supabase/server";
import { safeAdvisorNext } from "@/lib/platform/validate";

export const metadata = { title: "Sign in" };

const NOTICE: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Sign in with your password, or send a fresh link.",
  device: "Open the link on the same device and browser you asked from, or sign in with your password.",
};

// The same sign-in as the Partner Desk (Supabase Auth checks the password); after it, the
// authenticator code, then the desk.
export default async function AdvisorLogin({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; signed_out?: string }> }) {
  const sp = await searchParams;
  const next = safeAdvisorNext(sp.next);
  const { user } = await currentUser();
  if (user) redirect(next);
  return (
    <section className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16 items-start">
      <div className="max-w-xl">
        <p className="ledger-eyebrow ledger-crimson">James Wild &amp; Co · Advisor Desk</p>
        <h1 className="ledger-display text-[2.4rem] leading-[1.05] md:text-[3.2rem] mt-3">Your clients, quotes and bookings, in one place</h1>
        <p className="mt-5 text-[17px] leading-relaxed">Every stay, voyage and safari the house has vetted, priced at the house&rsquo;s own rates, and every trip you are planning for the people who trust you with it.</p>
        <p className="mt-4 text-[15px] ledger-muted">{sp.signed_out ? "You are signed out." : "Advisor access is by invitation. You will need your authenticator app after your password."}</p>
      </div>
      <div className="md:pt-4">
        <PartnerSignIn door="advisor" next={next} notice={sp.error ? NOTICE[sp.error] ?? NOTICE.link : null} />
      </div>
    </section>
  );
}
