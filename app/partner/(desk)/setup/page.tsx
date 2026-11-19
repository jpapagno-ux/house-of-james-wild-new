import Link from "next/link";
import { requireDesk } from "@/lib/platform/membership";
import { loadSetup } from "@/lib/platform/setup-load";
import { PageHead } from "@/components/platform/ui";
import { SetupStepActions, FinishSetup } from "@/components/platform/SetupForms";

export const metadata = { title: "Set-up" };

// /partner/setup (James, 19 Nov 2026): the guided set-up after an invitation. One step per part of the desk.
export default async function Setup() {
  const desk = await requireDesk("/partner/setup");
  const { states, progress, finished, admin } = await loadSetup(desk);
  const next = states.find((s) => s.state === "todo");
  return (
    <div>
      <PageHead eyebrow="Set-up" title={`Setting up ${desk.org!.name}`}
        lead={<>Everything the desk holds, one step at a time. Each step opens the page where it is filled in; save as you go and come back here. Nothing you send changes the website until James Wild &amp; Co approves it.</>} />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="h-2 w-56 bg-[#F4F2EF] border ledger-border" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done} aria-label="Set-up progress">
          <div className="h-full bg-[#2E2B28]" style={{ width: `${Math.round((progress.done / Math.max(1, progress.total)) * 100)}%` }} />
        </div>
        <p className="text-[14px]">{progress.done} of {progress.total} steps</p>
        {next && <Link href={next.href} className="ledger-btn ledger-btn--solid">Next: {next.title}</Link>}
      </div>
      <ol className="mt-8 border-t ledger-rule">
        {states.map((s, i) => (
          <li key={s.key} className="border-b ledger-border py-5 grid gap-3 md:grid-cols-[3rem_1fr_auto] md:items-start">
            <span aria-hidden="true" className={`w-9 h-9 grid place-items-center border text-[13px] font-mono ${s.state === "done" ? "bg-[#2E2B28] text-white border-[#2E2B28]" : s.state === "skipped" ? "border-dashed ledger-border ledger-muted" : "ledger-border"}`}>{s.state === "done" ? "✓" : String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <p className="ledger-display text-[1.3rem] leading-tight">{s.title}{s.optional && <span className="ml-2 align-middle ledger-eyebrow !text-[10px]">Optional</span>}</p>
              <p className="mt-1 text-[15px] leading-relaxed ledger-muted max-w-2xl">{s.line}</p>
              <p className="mt-1 text-[13px]"><span className="sr-only">Status: </span>{s.state === "done" ? "Done · " : s.state === "skipped" ? "Skipped · " : ""}{s.detail}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href={s.href} className={s.state === "done" ? "ledger-btn" : "ledger-btn ledger-btn--solid"}>{s.state === "done" ? "Review" : "Open"}</Link>
              {admin && s.state !== "done" && s.key !== "entries" && <SetupStepActions org={desk.org!.id} step={s.key} skipped={s.state === "skipped"} />}
            </div>
          </li>
        ))}
      </ol>
      {admin && <div className="mt-8"><FinishSetup org={desk.org!.id} finished={finished} ready={progress.done === progress.total} /></div>}
    </div>
  );
}
