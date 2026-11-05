import { redirect } from "next/navigation";
import HouseCode from "@/components/platform/HouseCode";
import { loadDesk } from "@/lib/platform/membership";
import { safePartnerNext } from "@/lib/platform/validate";

export const metadata = { title: "Authenticator code" };

// D-11: house accounts (James Wild & Co staff) need a six-digit code from an authenticator app as well as
// the password. Partners never see this page. The database enforces it too: house rights need aal2.
export default async function HouseSecurity({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const next = safePartnerNext(sp.next);
  const desk = await loadDesk();
  if (!desk) redirect(`/partner/login?next=${encodeURIComponent(next)}`);
  if (desk.mfa === "none" || desk.mfa === "ok") redirect(next);
  return (
    <section className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16 items-start">
      <div className="max-w-xl">
        <p className="ledger-eyebrow ledger-crimson">James Wild &amp; Co · House sign-in</p>
        <h1 className="ledger-display text-[2.4rem] leading-[1.05] md:text-[3.2rem] mt-3">
          {desk.mfa === "enroll" ? "One more lock on the house door" : "Your authenticator code"}
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed">
          {desk.mfa === "enroll"
            ? "House accounts can approve partner changes and publish to the site, so they need a second step: a six-digit code from an authenticator app on your phone. Set it up once; after that you enter the code each time you sign in."
            : "Open the authenticator app on your phone and enter the six-digit code shown for James Wild & Co."}
        </p>
        <p className="mt-4 text-[15px] ledger-muted">Signed in as {desk.user.email}.</p>
      </div>
      <div className="md:pt-4">
        <HouseCode mode={desk.mfa} next={next} />
      </div>
    </section>
  );
}
