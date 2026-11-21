import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdvisor } from "@/lib/platform/advisor";
import { advisorRecordId, loadEnquiry } from "@/lib/platform/enquiry-inbox-data";
import { canSee } from "@/lib/platform/enquiry-inbox";
import { PageHead, Section, StatusPill } from "@/components/platform/ui";
import { EnquiryFacts } from "@/components/advisor/EnquiryViews";
import { StatusForm } from "@/components/advisor/EnquiryForms";
import FolioThread from "@/components/folio/FolioThread";
import { threadForFolioNumber } from "@/lib/folio/thread-for-desk";

export const metadata = { title: "Enquiry" };

// /advisor/inbox/:id: one enquiry, only if it is addressed to this advisor.
export default async function AdvisorEnquiry({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await requireAdvisor(`/advisor/inbox/${id}`);
  if (a.advisor.status !== "active") notFound();
  const [e, mine] = await Promise.all([loadEnquiry(id), advisorRecordId(a.advisor.slug)]);
  if (!e || !canSee(e, mine)) notFound();
  // Iggi Stage 2 (21 Nov 2026): the chat the traveler saved to the Folio this enquiry names, read by its advisor.
  const saved = await threadForFolioNumber(a.sb, e.folio);
  return (
    <>
      <p className="mb-4 text-[13px]"><Link href="/advisor/inbox" className="ledger-btn-ghost uppercase">Inbox</Link></p>
      <PageHead eyebrow={`Advisor Desk · ${e.enquiryId || "Enquiry"}`} title={e.traveller || "Unnamed traveller"} lead={[e.where, e.when].filter(Boolean).join(" · ") || undefined}
        actions={<><StatusPill label={e.status} tone={e.status === "New" ? "attention" : e.status === "Booked" ? "good" : "neutral"} />{e.unanswered && <StatusPill label={`Waiting ${e.daysWaiting} days`} tone="attention" />}</>} />
      <Section title="The enquiry" id="enquiry"><EnquiryFacts e={e} /></Section>
      {saved && <Section title={`Saved chat · ${e.folio}`} id="chat" aside={saved.title}><FolioThread thread={saved.thread} reader="desk" advisorName={a.advisor.display_name.split(" ")[0] || null} /></Section>}
      <Section title="Where it stands" id="status"><StatusForm url={`/api/v1/advisor/enquiries/${e.recordId}`} status={e.status} closedReason={e.closedReason} note={e.advisorNote} /></Section>
    </>
  );
}
