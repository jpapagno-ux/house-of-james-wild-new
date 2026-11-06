import Link from "next/link";
import { requireAdvisorFile } from "@/lib/platform/advisor";
import { myFileState } from "@/lib/platform/advisor-file-data";
import { fileComplete, fileSteps } from "@/lib/platform/advisor-file";
import { PageHead, Panel, StatusPill } from "@/components/platform/ui";

export const metadata = { title: "My file" };

export default async function AdvisorFile() {
  const a = await requireAdvisorFile("/advisor/file");
  const s = await myFileState(a.sb);
  const steps = fileSteps(s);
  const complete = fileComplete(s);
  const active = a.advisor.status === "active";
  const first = a.advisor.display_name.split(" ")[0];
  return (
    <>
      <PageHead eyebrow={`Advisor Desk · ${a.advisor.adv_number}`} title={active ? "My file" : `Welcome, ${first}`}
        lead={active ? "Your details, plan, agreement and documents, kept on file with the house." : "Four things, in any order. When your file is complete and the house has reviewed your documents, your desk opens: your clients, quotes and bookings."} />
      {!active && complete && (
        <div className="mt-6 border-l-2 border-[#11705A] bg-white px-5 py-4">
          <p className="text-[15px]"><span className="font-medium">Your file is complete.</span> The house is reviewing your documents and will activate your desk. You will receive an email when it is open.</p>
        </div>
      )}
      <ol className="mt-8 grid gap-3">
        {steps.map((st, i) => (
          <li key={st.key}>
            <Link href={st.href} className="flex items-start gap-4 bg-white border ledger-border p-4 md:p-5 hover:bg-[#F7F5F2]">
              <span aria-hidden="true" className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center border text-[14px] font-semibold ${st.done ? "border-[#11705A]/50 text-[#11705A]" : "ledger-border ledger-muted"}`}>{st.done ? "✓" : i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="ledger-display text-[1.3rem] leading-tight">{st.title}</span>
                  <StatusPill label={st.waiting ? "With the house" : st.done ? "Done" : "To do"} tone={st.waiting ? "progress" : st.done ? "good" : "attention"} />
                </span>
                <span className="block mt-1 text-[14px] ledger-muted">{st.line}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <Panel className="mt-8">
        <p className="text-[14px] leading-relaxed ledger-muted">Everything here is private to you and the house&rsquo;s administrators. Never type a tax or bank account number into the desk: those travel only on your uploaded tax form and the house&rsquo;s secure payment setup.</p>
      </Panel>
    </>
  );
}
