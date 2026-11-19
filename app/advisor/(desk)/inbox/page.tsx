import { notFound } from "next/navigation";
import { requireAdvisor } from "@/lib/platform/advisor";
import { loadInbox } from "@/lib/platform/enquiry-inbox-data";
import { Notice, PageHead } from "@/components/platform/ui";
import { InboxList } from "@/components/advisor/EnquiryViews";

export const metadata = { title: "Inbox" };

// /advisor/inbox: the enquiries addressed to this advisor (James, 18 Nov 2026). Active advisors only.
export default async function AdvisorInbox() {
  const a = await requireAdvisor("/advisor/inbox");
  if (a.advisor.status !== "active") notFound();
  const res = await loadInbox(a.advisor.slug);
  return (
    <>
      <PageHead eyebrow="Advisor Desk · Inbox" title="Inbox" lead="Enquiries from the Plan form and Iggi that are addressed to you. Set the status as you go, so the house can see where each one stands. An enquiry still New after two days is flagged." />
      {res.ok ? <InboxList enquiries={res.enquiries} root="/advisor/inbox" /> : <div className="mt-8"><Notice tone="attention" title="The inbox could not be loaded">Please try again shortly, or ask the house.</Notice></div>}
    </>
  );
}
