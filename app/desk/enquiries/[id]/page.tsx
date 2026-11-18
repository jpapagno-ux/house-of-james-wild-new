import Link from "next/link";
import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { assignableAdvisors, loadEnquiry } from "@/lib/platform/enquiry-inbox-data";
import { slugName } from "@/lib/platform/enquiry-inbox";
import { PageHead, Section, StatusPill } from "@/components/platform/ui";
import { EnquiryFacts } from "@/components/advisor/EnquiryViews";
import { ReassignForm, StatusForm } from "@/components/advisor/EnquiryForms";

export const metadata = { title: "Enquiry" };

// /desk/enquiries/:id: one enquiry for the house, with its status and the advisor it is addressed to.
export default async function HouseEnquiry({ params }: { params: Promise<{ id: string }> }) {
  if (!ADVISOR_DESK) notFound();
  const { id } = await params;
  await requireHouse(`/desk/enquiries/${id}`);
  const [e, advisors] = await Promise.all([loadEnquiry(id), assignableAdvisors()]);
  if (!e) notFound();
  const current = advisors.find((a) => e.advisorIds.includes(a.recordId))?.slug ?? "";
  return (
    <>
      <p className="mb-4 text-[13px]"><Link href="/desk/enquiries" className="ledger-btn-ghost uppercase">Enquiries</Link></p>
      <PageHead eyebrow={`House desk · ${e.enquiryId || "Enquiry"}`} title={e.traveller || "Unnamed traveller"} lead={[e.where, e.when].filter(Boolean).join(" · ") || undefined}
        actions={<><StatusPill label={e.status} tone={e.status === "New" ? "attention" : e.status === "Booked" ? "good" : "neutral"} />{e.unanswered && <StatusPill label={`Waiting ${e.daysWaiting} days`} tone="attention" />}</>} />
      <Section title="The enquiry" id="enquiry"><EnquiryFacts e={e} /></Section>
      <Section title="Where it stands" id="status"><StatusForm url={`/api/v1/desk/enquiries/${e.recordId}`} status={e.status} closedReason={e.closedReason} note={e.advisorNote} /></Section>
      <Section title="Addressed to" id="advisor" aside={current ? slugName(current) : "No advisor"}><ReassignForm url={`/api/v1/desk/enquiries/${e.recordId}`} current={current} advisors={advisors.map((a) => ({ slug: a.slug, name: slugName(a.slug) }))} /></Section>
    </>
  );
}
