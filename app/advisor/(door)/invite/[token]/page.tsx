import { notFound } from "next/navigation";
import AcceptInvite from "@/components/platform/AcceptInvite";
import { currentUser } from "@/lib/booking-live/supabase/server";
import { ADVISOR_DESK } from "@/lib/platform/flags";

export const metadata = { title: "Your invitation", robots: { index: false, follow: false } };

// The advisor's invitation link. The token is checked only when accepted (by the database), so this page
// reveals nothing about the invitation to whoever holds the link.
export default async function AdvisorInvitePage({ params }: { params: Promise<{ token: string }> }) {
  if (!ADVISOR_DESK) notFound();
  const { token } = await params;
  const valid = /^[A-Za-z0-9_-]{20,100}$/.test(token);
  const { user } = await currentUser();
  return (
    <section className="max-w-xl">
      <p className="ledger-eyebrow ledger-crimson">Advisor Desk · Invitation</p>
      <h1 className="ledger-display text-[2.2rem] leading-[1.08] md:text-[2.8rem] mt-3">You&rsquo;re invited to the James Wild &amp; Co Advisor Desk</h1>
      <p className="mt-4 text-[16px] leading-relaxed">Sign in with the address the invitation was sent to and accept. Next you set up an authenticator app on your phone, then you fill in your file: your details, plan, agreement, documents and your Advisor DNA. The house reviews it and opens your desk.</p>
      <div className="mt-8">{valid ? <AcceptInvite door="advisor" token={token} signedInAs={user?.email ?? null} /> : <p role="alert" className="ledger-crimson">This invitation link is incomplete. Open it again from the email.</p>}</div>
    </section>
  );
}
