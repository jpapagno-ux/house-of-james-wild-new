import Link from "next/link";
import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { loadInbox } from "@/lib/platform/enquiry-inbox-data";
import { Notice, PageHead } from "@/components/platform/ui";
import { InboxList, advisorNameMap } from "@/components/advisor/EnquiryViews";

export const metadata = { title: "Enquiries" };

// /desk/enquiries: every enquiry, with the advisor it is addressed to. The house can reassign one.
export default async function HouseEnquiries() {
  if (!ADVISOR_DESK) notFound();
  await requireHouse("/desk/enquiries");
  const res = await loadInbox(null);
  return (
    <>
      <p className="mb-4 text-[13px]"><Link href="/desk" className="ledger-btn-ghost uppercase">The desk</Link></p>
      <PageHead eyebrow="House desk · Enquiries" title="Enquiries" lead="Every enquiry from the Plan form and Iggi, the advisor it is addressed to and where it stands. An enquiry still New after two days is flagged and listed first." />
      {res.ok ? <InboxList enquiries={res.enquiries} root="/desk/enquiries" advisorNames={advisorNameMap(res.advisors)} /> : <div className="mt-8"><Notice tone="attention" title={res.reason === "not-configured" ? "Airtable is not connected on this build" : "Enquiries could not be loaded"}>{res.reason === "not-configured" ? "AIRTABLE_ENQUIRIES_TOKEN and AIRTABLE_ENQUIRIES_BASE_ID are not set in Vercel, so no enquiry is being recorded either." : "Airtable did not answer. Check that the token can read the Enquiries table."}</Notice></div>}
    </>
  );
}
