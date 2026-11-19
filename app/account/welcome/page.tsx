import Link from "next/link";
import { requireTraveler } from "@/lib/booking-live/account";
import { FLAGS } from "@/lib/booking-live/flags";

export const metadata = { title: "Welcome to your Folio" };

// /account/welcome: the traveler's entrance (James, 18 Nov 2026). What a Folio is and the four things a
// traveler does with it, in the order they happen. Steps that depend on a flag that is still off say so,
// so the page never promises a button the traveler cannot find.
export default async function WelcomePage() {
  const { sb, user } = await requireTraveler("/account/welcome");
  const { data: profile } = await sb.from("profiles").select("first_name").eq("id", user.id).maybeSingle();
  const steps: { n: string; title: string; body: string; href: string; cta: string; note?: string }[] = [
    { n: "01", title: "Save what calls to you", body: "On any stay, ship, voyage, safari or overland route in the Ledger, choose Save to My Folio. It lands on your Saved shelf, sorted by kind.", href: "/stays", cta: "Browse the Ledger", note: FLAGS.save ? undefined : "Saving opens shortly." },
    { n: "02", title: "Gather a journey", body: "Start a journey, give it a name and rough dates, and add the places you saved. A journey is a plan on your shelf, never a booking.", href: "/account/folios", cta: "Your journeys" },
    { n: "03", title: "Share it", body: "Invite the people you travel with to a journey. They can view it, or help shape it if you let them.", href: "/account/folios", cta: "Share a journey", note: FLAGS.share ? undefined : "Sharing opens shortly." },
    { n: "04", title: "Ask the house", body: "When you are ready, a person at the house checks availability and confirms the price with you. Nothing is charged until the house has confirmed, and every request, hold, booking and payment is then listed under Trips.", href: "/plan", cta: "Plan with James" },
  ];
  return (
    <section>
      <p className="ledger-eyebrow text-house">My Folio</p>
      <h1 className="ledger-display text-[2.2rem] md:text-[3rem] leading-[1.08] mt-2">{profile?.first_name ? `Welcome, ${profile.first_name}` : "Welcome to your Folio"}</h1>
      <p className="mt-4 text-[17px] max-w-2xl ledger-muted leading-relaxed">Your Folio is your shelf at the house: the places worth returning to, the journeys you are shaping, and the trips the house has confirmed for you. Every place on it was vetted in person before it was offered to you.</p>
      <ol className="mt-10 grid gap-6 md:grid-cols-2">
        {steps.map((s) => (
          <li key={s.n} className="border ledger-rule p-6 flex flex-col">
            <p className="font-mono text-[11px] tracking-[0.14em] ledger-muted">{s.n}</p>
            <h2 className="ledger-display text-[1.5rem] leading-tight mt-1">{s.title}</h2>
            <p className="mt-2 text-[15.5px] leading-relaxed flex-1">{s.body}</p>
            {s.note && <p className="mt-3 text-[13px] ledger-muted italic">{s.note}</p>}
            <p className="mt-4"><Link href={s.href} className="ledger-btn-ghost uppercase">{s.cta}</Link></p>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-[15px] ledger-muted max-w-2xl">Prices, availability and bookings always stay with a person at the house. <Link href="/account" className="underline underline-offset-4 hover:text-house">Go to your Folio</Link></p>
    </section>
  );
}
