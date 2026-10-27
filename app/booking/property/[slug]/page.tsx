import Link from "next/link";
import { notFound } from "next/navigation";
import QuoteBuilder from "@/components/booking-live/QuoteBuilder";
import { currentUser } from "@/lib/booking-live/supabase/server";
import { stayBySlug } from "@/lib/content/stays";

export const metadata = { title: "Check Availability" };

export default async function BookingPropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{2,120}$/.test(slug)) notFound();
  const stay = stayBySlug(slug);
  if (!stay) notFound();
  const { user } = await currentUser();
  const name = stay.name.replace(/\s+/g, " ").trim();
  return (
    <section className="grid gap-6">
      <p className="ledger-eyebrow"><Link href={`/stays/${slug}`} className="hover:opacity-60">{name}</Link> · Check Availability</p>
      <h1 className="ledger-display text-[2.1rem] md:text-[2.8rem] leading-[1.1]">Your dates at {name}</h1>
      <p className="text-[16.5px] max-w-2xl">Choose dates and who&rsquo;s travelling. You&rsquo;ll see each room priced night by night from the house&rsquo;s contracted rates, with every tax and the deposit before you ask for anything.</p>
      <QuoteBuilder slug={slug} name={name} signedIn={Boolean(user)} />
    </section>
  );
}
