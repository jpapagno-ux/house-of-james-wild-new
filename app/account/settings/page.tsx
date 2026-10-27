import { requireTraveler } from "@/lib/booking-live/account";
import { ProfileForm } from "@/components/booking-live/Actions";
import { SITE } from "@/lib/site";

export const metadata = { title: "Account & privacy" };

export default async function SettingsPage() {
  const { sb, user } = await requireTraveler("/account/settings");
  const { data: p } = await sb.from("profiles").select("first_name, last_name, email, phone, preferred_currency, timezone").eq("id", user.id).single();
  return (
    <section className="grid gap-8">
      <div>
        <h1 className="ledger-display text-[2rem] md:text-[2.4rem]">Account &amp; privacy</h1>
        <p className="mt-2 text-[15px] ledger-muted">Signed in as <strong>{p?.email ?? user.email}</strong>. Your email is your sign-in, so it changes only through the house.</p>
      </div>
      <ProfileForm initial={{ firstName: p?.first_name ?? "", lastName: p?.last_name ?? "", phone: p?.phone ?? "", preferredCurrency: p?.preferred_currency ?? "USD", timezone: p?.timezone ?? "America/New_York" }} />
      <div className="max-w-2xl border-t ledger-rule pt-6 text-[15px]">
        <h2 className="ledger-eyebrow">Your data</h2>
        <p className="mt-2">We keep only what your Folio needs: your name, email, optional phone, the stays you save and the journeys you build. We never sell it. To receive a copy of everything we hold, or to close your account and erase it, write to <a className="ledger-crimson underline" href={`mailto:${SITE.email ?? "contact@jameswildco.com"}?subject=My%20Folio%20data%20request`}>the house</a>.</p>
      </div>
    </section>
  );
}
