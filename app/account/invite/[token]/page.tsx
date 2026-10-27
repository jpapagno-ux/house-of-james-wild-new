import { notFound } from "next/navigation";
import { requireTraveler } from "@/lib/booking-live/account";
import { FLAGS } from "@/lib/booking-live/flags";
import { AcceptInvite } from "@/components/booking-live/Actions";

export const metadata = { title: "Join a journey" };

// /account/invite/:token — sign in (with the invited email) then join.
// The token is checked in the database; this page never reveals the Folio
// until the invitation is accepted.
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!FLAGS.share || !/^[A-Za-z0-9_-]{20,100}$/.test(token)) notFound();
  const { user } = await requireTraveler(`/account/invite/${token}`);
  return (
    <section className="max-w-xl">
      <p className="ledger-eyebrow ledger-crimson">An invitation</p>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] mt-2 leading-[1.1]">You&rsquo;ve been invited to a journey</h1>
      <p className="mt-3 text-[16px]">You&rsquo;re signed in as <strong>{user.email}</strong>. The invitation works only for the email it was sent to.</p>
      <div className="mt-6"><AcceptInvite token={token} /></div>
    </section>
  );
}
