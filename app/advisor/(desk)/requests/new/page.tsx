import { notFound } from "next/navigation";
import { requireAdvisor } from "@/lib/platform/advisor";
import { STAYS } from "@/lib/content/stays";
import { loadBook } from "@/lib/platform/advisor-book";
import { buildClients } from "@/lib/platform/advisor-clients";
import { NewRequestForm } from "@/components/advisor/RequestForms";
import { PageHead, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Request a quote" };

export default async function NewAdvisorRequest({ searchParams }: { searchParams: Promise<{ stay?: string }> }) {
  const slug = (await searchParams).stay ?? "";
  // Keep the stay through sign-in and the code, so the advisor lands back on this form.
  const a = await requireAdvisor(`/advisor/requests/new${/^[a-z0-9-]{1,120}$/.test(slug) ? `?stay=${slug}` : ""}`);
  const stay = /^[a-z0-9-]{1,120}$/.test(slug) ? STAYS.find((s) => s.slug === slug) : undefined;
  if (!stay) notFound();
  const today = new Date().toISOString().slice(0, 10);
  const book = await loadBook(a.sb, a.advisor.id);
  const clients = buildClients(book.people, book.folios, book.quotes, book.bookings, today).map((c) => ({ name: c.name, email: c.email ?? null }));
  return (
    <>
      <PageHead eyebrow={`Quote requests · ${stay.ledgerId ?? ""}`} title="Request a quote" lead="The house prices it for these dates, checks space with the property and holds it for your client."
        actions={<TextLink href={`/advisor/ledger/${stay.slug}`}>Back to the stay</TextLink>} />
      <div className="mt-8 max-w-3xl"><NewRequestForm stay={stay.slug} stayName={stay.name} clients={clients} today={today} /></div>
    </>
  );
}
