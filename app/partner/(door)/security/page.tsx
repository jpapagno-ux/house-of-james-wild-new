import { redirect } from "next/navigation";
import HouseCode from "@/components/platform/HouseCode";
import { loadDesk } from "@/lib/platform/membership";
import { loadAdvisor } from "@/lib/platform/advisor";
import { currentUser } from "@/lib/booking-live/supabase/server";
import { safePartnerNext } from "@/lib/platform/validate";

export const metadata = { title: "Authenticator code" };

// D-11 and the Advisor Desk: house accounts and advisors need a six-digit code from an authenticator app
// as well as the password; both see travellers' trips and payments. Partners never see this page. The
// database enforces it too: house rights and an advisor's own records both need aal2.
export default async function HouseSecurity({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const next = safePartnerNext(sp.next);
  const login = next.startsWith("/advisor") ? "/advisor/login" : "/partner/login";
  const { user } = await currentUser();
  if (!user) redirect(`${login}?next=${encodeURIComponent(next)}`);
  const desk = await loadDesk();
  const advisor = await loadAdvisor();
  const pending = (m: string | undefined) => m === "verify" || m === "enroll";
  const houseMode = pending(desk?.mfa) ? desk!.mfa : null;
  const advisorMode = advisor && advisor.advisor.status !== "paused" && advisor.advisor.status !== "left" && pending(advisor.mfa) ? advisor.mfa : null;
  const mode = (houseMode ?? advisorMode) as "verify" | "enroll" | null;
  if (!mode) redirect(next);
  const who = houseMode ? "House sign-in" : "Advisor sign-in";
  const why = houseMode
    ? "House accounts can approve partner changes and publish to the site, so they need a second step"
    : "Your desk holds your clients' trips and payments, so it needs a second step";
  return (
    <section className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16 items-start">
      <div className="max-w-xl">
        <p className="ledger-eyebrow ledger-crimson">James Wild &amp; Co · {who}</p>
        <h1 className="ledger-display text-[2.4rem] leading-[1.05] md:text-[3.2rem] mt-3">
          {mode === "enroll" ? (houseMode ? "One more lock on the house door" : "One more lock on your desk") : "Your authenticator code"}
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed">
          {mode === "enroll"
            ? `${why}: a six-digit code from an authenticator app on your phone. Set it up once; after that you enter the code each time you sign in.`
            : "Open the authenticator app on your phone and enter the six-digit code shown for James Wild & Co."}
        </p>
        <p className="mt-4 text-[15px] ledger-muted">Signed in as {user.email}.</p>
      </div>
      <div className="md:pt-4">
        <HouseCode mode={mode} next={next} />
      </div>
    </section>
  );
}
