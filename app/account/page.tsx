import Link from "next/link";
import { requireTraveler } from "@/lib/booking-live/account";

export const metadata = { title: "My Folio" };

// The traveler's dashboard: counts and the latest of each shelf.
export default async function AccountHome() {
  const { sb, user } = await requireTraveler("/account");
  const [{ data: profile }, { count: saved }, { data: folios }] = await Promise.all([
    sb.from("profiles").select("first_name").eq("id", user.id).single(),
    sb.from("favorites").select("id", { count: "exact", head: true }),
    sb.from("folios").select("id, title, status, owner_user_id").order("updated_at", { ascending: false }).limit(4),
  ]);
  const hello = profile?.first_name ? `Welcome back, ${profile.first_name}` : "Welcome to your Folio";
  return (
    <section>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] leading-[1.1]">{hello}</h1>
      <p className="mt-3 text-[17px] max-w-2xl ledger-muted">A Folio is your shelf, not a booking. Save what calls to you; when it&rsquo;s time, the house confirms availability and prices with you directly.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Link href="/account/favorites" className="border ledger-rule p-6 hover:bg-paper-card block">
          <p className="ledger-eyebrow">Saved stays</p>
          <p className="ledger-display text-[2.4rem] mt-2">{saved ?? 0}</p>
        </Link>
        <Link href="/account/folios" className="border ledger-rule p-6 hover:bg-paper-card block">
          <p className="ledger-eyebrow">Journeys</p>
          <p className="ledger-display text-[2.4rem] mt-2">{folios?.length ?? 0}{(folios?.length ?? 0) === 4 ? "+" : ""}</p>
        </Link>
        <Link href="/plan" className="border ledger-rule p-6 hover:bg-paper-card block">
          <p className="ledger-eyebrow">Design with James</p>
          <p className="mt-2 text-[16px]">Talk through a journey with the house.</p>
        </Link>
      </div>
      {folios && folios.length > 0 && (
        <div className="mt-10">
          <h2 className="ledger-eyebrow">Latest journeys</h2>
          <ul className="mt-3 divide-y ledger-rule border-y ledger-rule">
            {folios.map((f) => (
              <li key={f.id}><Link href={`/account/folios/${f.id}`} className="flex justify-between gap-4 py-3 hover:opacity-70">
                <span className="ledger-display text-[18px]">{f.title}</span>
                <span className="text-[13px] ledger-muted capitalize">{f.owner_user_id === user.id ? f.status : "shared with you"}</span>
              </Link></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
