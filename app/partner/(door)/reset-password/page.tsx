import { redirect } from "next/navigation";
import PasswordForms from "@/components/platform/PasswordForms";
import { currentUser } from "@/lib/booking-live/supabase/server";

export const metadata = { title: "Choose a new password" };

// Reached from the reset email (via /auth/callback, which signs the person in).
export default async function ResetPassword() {
  const { user } = await currentUser();
  if (!user) redirect("/partner/forgot-password");
  return (
    <section className="max-w-xl">
      <p className="ledger-eyebrow ledger-crimson">Partner Desk</p>
      <h1 className="ledger-display text-[2.2rem] leading-[1.08] md:text-[2.8rem] mt-3">Choose a new password</h1>
      <p className="mt-4 text-[16px] ledger-muted">For {user.email}.</p>
      <div className="mt-8"><PasswordForms mode="set" /></div>
    </section>
  );
}
