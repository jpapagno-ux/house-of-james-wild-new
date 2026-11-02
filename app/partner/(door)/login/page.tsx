import { redirect } from "next/navigation";
import PartnerSignIn from "@/components/platform/PartnerSignIn";
import { currentUser } from "@/lib/booking-live/supabase/server";
import { safePartnerNext } from "@/lib/platform/validate";

export const metadata = { title: "Sign in" };

const NOTICE: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Sign in with your password, or send a fresh link.",
  device: "Open the link on the same device and browser you asked from, or sign in with your password.",
};

export default async function PartnerLogin({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; signed_out?: string }> }) {
  const sp = await searchParams;
  const next = safePartnerNext(sp.next);
  const { user } = await currentUser();
  if (user) redirect(next);
  return (
    <section className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16 items-start">
      <div className="max-w-xl">
        <p className="ledger-eyebrow ledger-crimson">James Wild &amp; Co · Partner Desk</p>
        <h1 className="ledger-display text-[2.4rem] leading-[1.05] md:text-[3.2rem] mt-3">Where partners keep the house&rsquo;s record true</h1>
        <p className="mt-5 text-[17px] leading-relaxed">Keep your contacts current, answer the house&rsquo;s requests, and send us what has changed: a new suite, next year&rsquo;s rates, the light at dusk. You contribute; James Wild &amp; Co reviews and publishes.</p>
        <p className="mt-4 text-[15px] ledger-muted">{sp.signed_out ? "You are signed out." : "Nothing you send changes the website until the house has approved it."}</p>
      </div>
      <div className="md:pt-4">
        <PartnerSignIn next={next} notice={sp.error ? NOTICE[sp.error] ?? NOTICE.link : null} />
      </div>
    </section>
  );
}
