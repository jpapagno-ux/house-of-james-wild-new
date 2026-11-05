import { redirect } from "next/navigation";
import { loadAdvisor } from "@/lib/platform/advisor";

export const metadata = { title: "Welcome" };

// An invited advisor, signed in with the authenticator code, before the house activates them.
// Step 3 (onboarding) fills this page with their file: the agreement, the compensation plan,
// their documents and their profile.
export default async function AdvisorWelcome() {
  const a = await loadAdvisor();
  if (!a) redirect("/advisor/login?next=%2Fadvisor");
  if (a.mfa !== "ok") redirect("/partner/security?next=%2Fadvisor");
  if (a.advisor.status === "active") redirect("/advisor");
  if (a.advisor.status !== "invited") redirect("/advisor/no-access");
  return (
    <section className="max-w-xl">
      <p className="ledger-eyebrow ledger-crimson">James Wild &amp; Co · Advisor Desk</p>
      <h1 className="ledger-display text-[2.4rem] leading-[1.05] md:text-[3rem] mt-3">Welcome, {a.advisor.display_name.split(" ")[0]}</h1>
      <p className="mt-5 text-[17px] leading-relaxed">Your advisor file is being prepared: the independent advisor agreement, your compensation plan and the documents the house keeps on file. Once it is complete and the house has activated your desk, your clients, quotes and bookings open here.</p>
      <p className="mt-4 text-[15px] ledger-muted">Advisor number <span className="font-mono ledger-crimson">{a.advisor.adv_number}</span></p>
      <form action="/auth/sign-out?to=advisor" method="post" className="mt-8"><button type="submit" className="ledger-btn-ghost uppercase">Sign out</button></form>
    </section>
  );
}
