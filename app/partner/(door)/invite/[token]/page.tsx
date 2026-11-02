import AcceptInvite from "@/components/platform/AcceptInvite";
import { currentUser } from "@/lib/booking-live/supabase/server";

export const metadata = { title: "Your invitation" };

// The invitation link. The token is checked only when accepted (by the database), so
// this page reveals nothing about the invitation to whoever holds the link.
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const valid = /^[A-Za-z0-9_-]{20,100}$/.test(token);
  const { user } = await currentUser();
  return (
    <section className="max-w-xl">
      <p className="ledger-eyebrow ledger-crimson">Partner Desk · Invitation</p>
      <h1 className="ledger-display text-[2.2rem] leading-[1.08] md:text-[2.8rem] mt-3">You&rsquo;re invited to the James Wild &amp; Co Partner Desk</h1>
      <p className="mt-4 text-[16px] leading-relaxed">Keep your property&rsquo;s record with the house current: contacts, answers to the house&rsquo;s requests, and updates for review. Nothing you send changes the website until James Wild &amp; Co approves it.</p>
      <div className="mt-8">{valid ? <AcceptInvite token={token} signedInAs={user?.email ?? null} /> : <p role="alert" className="ledger-crimson">This invitation link is incomplete. Open it again from the email.</p>}</div>
    </section>
  );
}
