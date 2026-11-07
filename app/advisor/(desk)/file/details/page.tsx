import { requireAdvisorFile } from "@/lib/platform/advisor";
import type { Details } from "@/lib/platform/advisor-file";
import { DetailsForm } from "@/components/advisor/FileForms";
import { PageHead, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Your details" };

export default async function AdvisorDetails() {
  const a = await requireAdvisorFile("/advisor/file/details");
  const { data } = await a.sb.from("advisor_details").select("*").eq("advisor_id", a.advisor.id).maybeSingle();
  return (
    <>
      <PageHead eyebrow="My file · Step 1" title="Your details" lead="Schedule B of the agreement. Keep it current: update it here within ten days of any change." actions={<TextLink href="/advisor/file">My file</TextLink>} />
      <div className="mt-8 max-w-3xl"><DetailsForm initial={(data as Partial<Details>) ?? null} email={a.user.email ?? ""} /></div>
    </>
  );
}
