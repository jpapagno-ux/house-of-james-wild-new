import Link from "next/link";
import { PageHead, Section } from "@/components/platform/ui";
import { requireDesk } from "@/lib/platform/membership";

export const metadata = { title: "Support" };

export default async function Support() {
  await requireDesk("/partner/support");
  return (
    <div>
      <PageHead eyebrow="Support" title="How the desk works" />
      <Section title="Partners contribute; the house publishes">
        <ul className="grid gap-3 text-[15.5px] leading-relaxed max-w-2xl list-disc pl-5">
          <li><strong className="font-medium">Contacts and company details</strong> change straight away. Keep reservations, sales and the on-ground contact current.</li>
          <li><strong className="font-medium">Everything else</strong> (names, descriptions, rooms, rates, offers, photography) goes to the house as an update. Nothing reaches the website until James Wild &amp; Co approves it.</li>
          <li><strong className="font-medium">Requests</strong> are how the house asks for what it needs. Answer with a note and links to your files.</li>
          <li><strong className="font-medium">The Ledger ID</strong> (for example STY-2026-000128) is the house&rsquo;s permanent reference for each entry. Quote it when you write.</li>
        </ul>
      </Section>
      <Section title="Need a hand?">
        <p className="text-[15.5px] max-w-2xl">Write to your James Wild &amp; Co contact, or send an update from any entry in <Link href="/partner/portfolio" className="underline underline-offset-2">My Portfolio</Link>; the house reads every one. Forgotten your password? <Link href="/partner/forgot-password" className="underline underline-offset-2">Reset it here</Link>.</p>
      </Section>
    </div>
  );
}
