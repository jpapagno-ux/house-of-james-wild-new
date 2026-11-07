import Link from "next/link";

export const metadata = { title: "No advisor access" };

export default function AdvisorNoAccess() {
  return (
    <section className="max-w-xl">
      <p className="ledger-eyebrow ledger-crimson">James Wild &amp; Co · Advisor Desk</p>
      <h1 className="ledger-display text-[2.4rem] leading-[1.05] md:text-[3rem] mt-3">This account has no advisor desk</h1>
      <p className="mt-5 text-[17px] leading-relaxed">You are signed in, but this account is not set up as a James Wild &amp; Co advisor, or its access is paused. If you expected to see your desk, write to the house and we will look at it.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/for-advisors" className="ledger-btn">Become an advisor</Link>
        <form action="/auth/sign-out?to=advisor" method="post"><button type="submit" className="ledger-btn-ghost uppercase">Sign out</button></form>
      </div>
    </section>
  );
}
