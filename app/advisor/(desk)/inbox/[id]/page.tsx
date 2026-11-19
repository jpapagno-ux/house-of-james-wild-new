import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdvisor } from "@/lib/platform/advisor";
import { advisorRecordId, loadEnquiry } from "@/lib/platform/enquiry-inbox-data";
import { canSee } from "@/lib/platform/enquiry-inbox";
import { PageHead, Section, StatusPill } from "@/components/platform/ui";
import { EnquiryFacts } from "@/components/advisor/EnquiryViews";
import { StatusForm } from "@/components/advisor/EnquiryForms";

export const metadata = { title: "Enquiry" };

// /advisor/inbox/:id: one enquiry, only if it is addressed to this advisor.
export default async function AdvisorEnquiry({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await requireAdvisor(`/advisor/inbox/${id}`);
  if (a.advisor.status !== "active") notFound();
  const [e, mine] = await Promise.all([loadEnquiry(id), advisorRecordId(a.advisor.slug)]);
  if (!e || !canSee(e, mine)) notFound();
  return (
    <>
      <p className="mb-4 text-[13px]"><Link href="/advisor/inbox" className="ledger-btn-ghost uppercase">Inbox</Link></p>
      <PageHead eyebrow={`Advisor Desk · ${e.enquiryId || "Enquiry"}`} title={e.traveller || "Unnamed traveller"} lead={[e.where, e.when].filter(Boolean).join(" · ") || undefined}
        actions={<><StatusPill label={e.status} tone={e.status === "New" ? "attention" : e.status === "Booked" ? "good" : "neutral"} />{e.unanswered && <StatusPill label={`Waiting ${e.daysWaiting} days`} tone="attention" />}</>} />
      <Section title="The enquiry" id="enquiry"><EnquiryFacts e={e} /></Section>
      <Section title="Where it stands" id="status"><StatusForm url={`/api/v1/advisor/enquiries/${e.recordId}`} status={e.status} closedReason={e.closedReason} note={e.advisorNote} /></Section>
    </>
  );
}
