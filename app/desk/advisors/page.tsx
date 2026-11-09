import Link from "next/link";
import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { EMPTY_STATE } from "@/lib/platform/advisor-file-data";
import { fileSteps, readyToActivate, type FileState } from "@/lib/platform/advisor-file";
import { StatusPill } from "@/components/platform/ui";
import { AddAdvisor } from "@/components/advisor/HouseForms";

export const metadata = { title: "Advisors" };

const STATUS: Record<string, [string, "good" | "progress" | "attention" | "neutral"]> = {
  invited: ["Onboarding", "progress"], active: ["Active", "good"], paused: ["Paused", "attention"], left: ["Left", "neutral"],
};

// /desk/advisors: every advisor and where their file stands. House admins and portfolio managers.
export default async function HouseAdvisors() {
  if (!ADVISOR_DESK) notFound();
  const desk = await requireHouse("/desk/advisors");
  const { data: advisors } = await desk.sb.from("advisors").select("id, adv_number, display_name, status, user_id, house_advisor").order("adv_number");
  const states = await Promise.all((advisors ?? []).map(async (a) => {
    const { data, error } = await desk.sb.rpc("advisor_file_state", { p_advisor: a.id });
    return error ? null : ((data as FileState) ?? EMPTY_STATE);
  }));
  if (states.length && states.every((s) => s === null)) notFound(); // not a keeper of advisors
  // An active advisor's later DNA changes wait here too.
  const { data: open } = await desk.sb.from("advisor_dna_proposals").select("advisor_id").eq("status", "submitted");
  const dnaOpen = new Set((open ?? []).map((x) => x.advisor_id as string));
  const { data: invs } = await desk.sb.from("advisor_invitations").select("advisor_id, expires_at").is("accepted_at", null).is("revoked_at", null).gt("expires_at", new Date().toISOString());
  const invited = new Set((invs ?? []).map((x) => x.advisor_id as string));
  return (
    <div>
      <p className="ledger-eyebrow ledger-crimson">House desk</p>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] leading-[1.1]">Advisors</h1>
      <p className="mt-3 max-w-2xl text-[15.5px] ledger-muted">Each advisor&rsquo;s file: details, plan, agreement, documents and Advisor DNA. Review the documents and the DNA, set the plan, then activate.</p>
      <div className="mt-5"><AddAdvisor /></div>
      <ul className="mt-8 border-y ledger-border">
        {(advisors ?? []).map((a, i) => {
          const s = states[i] ?? EMPTY_STATE;
          const done = fileSteps(s).filter((x) => x.done).length;
          const [label, tone] = STATUS[a.status] ?? [a.status, "neutral"];
          const waiting = (s.tax_form && !s.tax_form_accepted) || (s.eo_insurance && !s.eo_insurance_accepted);
          const dnaWaiting = s.dna && !s.dna_approved || dnaOpen.has(a.id);
          return (
            <li key={a.id} className="border-b ledger-border last:border-b-0">
              <Link href={`/desk/advisors/${a.id}`} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4 group">
                <span className="ledger-id text-[13px]">{a.adv_number}</span>
                <span className="ledger-display text-[1.3rem] group-hover:underline">{a.display_name}</span>
                <StatusPill label={label} tone={tone} />
                {a.house_advisor && <span className="text-[12.5px] ledger-muted">House advisor</span>}
                <span className="ml-auto text-[13.5px] ledger-muted">
                  {a.status === "invited" ? (!a.user_id ? (invited.has(a.id) ? "Invitation open" : "Not invited yet") : readyToActivate(s) ? "Ready to activate" : waiting ? "Documents to review" : dnaWaiting ? "DNA to review" : `${done} of 5 parts`) : dnaWaiting ? "DNA to review" : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
