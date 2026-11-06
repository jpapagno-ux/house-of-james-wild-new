import { requireAdvisorFile } from "@/lib/platform/advisor";
import { documents } from "@/lib/platform/advisor-file-data";
import { ADV_DOC_KINDS, ADV_DOC_LABEL, type AdvDocKind } from "@/lib/platform/advisor-file";
import { niceDate } from "@/lib/platform/labels";
import { UploadAdvisorDocument, WithdrawDocument } from "@/components/advisor/FileForms";
import { PageHead, Section, StatusPill, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Your documents" };

const STATUS = { submitted: ["With the house", "progress"], accepted: ["Accepted", "good"], returned: ["Returned", "attention"] } as const;

export default async function AdvisorDocuments() {
  const a = await requireAdvisorFile("/advisor/file/documents");
  const docs = await documents(a.sb, a.advisor.id);
  const today = new Date().toISOString().slice(0, 10);
  const missing = ADV_DOC_KINDS.filter((k) => k.required && !docs.some((d) => d.kind === k.key && d.status !== "returned"));
  return (
    <>
      <PageHead eyebrow="My file · Step 4" title="Your documents" lead="Schedule C of the agreement. Kept private to you and the house's administrators." actions={<TextLink href="/advisor/file">My file</TextLink>} />
      {missing.length > 0 && <p className="mt-6 text-[15px]">Still needed: <span className="font-medium">{missing.map((m) => m.label).join(" and ")}</span>.</p>}
      <Section title="On file">
        {docs.length ? (
          <ul className="divide-y ledger-border border-y ledger-border">
            {docs.map((d) => {
              const [label, tone] = STATUS[d.status as keyof typeof STATUS] ?? ["Filed", "neutral"];
              const expired = d.expires_on && d.expires_on < today;
              return (
                <li key={d.id} className="py-3 grid gap-1">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <a href={`/api/v1/advisor/documents/${d.id}/file`} className="text-[15px] font-medium hover:underline">{d.title}</a>
                    <span className="text-[13px] ledger-muted">{ADV_DOC_LABEL[d.kind as AdvDocKind] ?? d.kind}</span>
                    <StatusPill label={expired ? "Expired" : label} tone={expired ? "attention" : tone} />
                    {d.expires_on && <span className="text-[13px] ledger-muted">Expires {niceDate(d.expires_on)}</span>}
                    <span className="ml-auto text-[12.5px] ledger-muted">Filed {niceDate(d.created_at)}</span>
                    {d.status === "submitted" && <WithdrawDocument id={d.id} />}
                  </div>
                  {d.status === "returned" && d.house_note && <p className="text-[14px] ledger-crimson">The house: {d.house_note}</p>}
                </li>
              );
            })}
          </ul>
        ) : <p className="text-[15px] ledger-muted">Nothing filed yet.</p>}
      </Section>
      <div className="mt-8 max-w-3xl"><UploadAdvisorDocument start={missing[0]?.key} /></div>
    </>
  );
}
