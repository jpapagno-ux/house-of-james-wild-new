import { redirect } from "next/navigation";
import SignInForm from "@/components/booking-live/SignInForm";
import { currentUser } from "@/lib/booking-live/supabase/server";
import { safeNext } from "@/lib/booking-live/validate";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const { user } = await currentUser();
  if (user) redirect(next);
  return (
    <section className="max-w-2xl">
      <p className="ledger-eyebrow ledger-crimson">My Folio</p>
      <h1 className="ledger-display text-[2.2rem] leading-[1.1] md:text-[3rem] mt-3">Your shelf for the places worth returning to</h1>
      <p className="mt-4 text-[17px] max-w-xl">Save stays from the Ledger, gather them into journeys, and share a Folio with the people you travel with. When you&rsquo;re ready, James and the house take it from there.</p>
      <div className="mt-8"><SignInForm next={next} linkError={sp.error === "link"} /></div>
    </section>
  );
}
