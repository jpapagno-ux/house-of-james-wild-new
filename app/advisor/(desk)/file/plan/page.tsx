import { requireAdvisorFile } from "@/lib/platform/advisor";
import { myPlan } from "@/lib/platform/advisor-file-data";
import { TIER_NAME, example, feeText } from "@/lib/platform/advisor-file";
import { money } from "@/lib/platform/advisor-clients";
import { niceDate } from "@/lib/platform/labels";
import { AcknowledgePlan } from "@/components/advisor/FileForms";
import { DataList, PageHead, Panel, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Your compensation plan" };

export default async function AdvisorPlan() {
  const a = await requireAdvisorFile("/advisor/file/plan");
  const plan = await myPlan(a.sb);
  const { data: acks } = await a.sb.from("advisor_plan_acks").select("tier, share_bp, acknowledged_at").eq("advisor_id", a.advisor.id).order("acknowledged_at", { ascending: false }).limit(1);
  const last = acks?.[0];
  if (!plan) return null;
  const ex = example(plan.share_bp);
  const pct = plan.share_bp / 100;
  return (
    <>
      <PageHead eyebrow="My file · Step 2" title="Your compensation plan" lead="Schedule A of the agreement: how you earn on the travel you sell." actions={<TextLink href="/advisor/file">My file</TextLink>} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel>
          <p className="ledger-eyebrow">{TIER_NAME[plan.tier] ?? plan.tier}</p>
          <p className="ledger-display text-[2.6rem] leading-none mt-2 tabular-nums">{pct}%</p>
          <p className="mt-3 text-[15px] leading-relaxed">You earn {pct}% of the commission the house receives on every booking you sell. The house keeps the rest.</p>
          {!plan.tier_assigned && <p className="mt-3 text-[13.5px] ledger-muted">This is the starting tier. The house confirms your tier when it activates your desk; any change applies only to bookings made after you are told of it.</p>}
          <div className="mt-5"><DataList rows={[
            ["Commissionable amount", "The commission the supplier pays the house, after offers, excluding taxes and fees"],
            ["When you earn it", "When the client has travelled and the house has received the supplier's commission"],
            ["Statement", "In the desk, with every booking, the commission received and your share"],
            ["Payment", plan.payment_terms ?? "Set by the house when your desk is activated"],
            ["Program fee", feeText(plan)],
          ]} /></div>
        </Panel>
        <Panel>
          <p className="ledger-eyebrow">Worked example</p>
          <p className="mt-3 text-[15px] leading-relaxed">A stay with a commissionable amount of {money(ex.commissionable, "USD")} at a supplier commission of {ex.supplierRateBp / 100}% earns the house {money(ex.gross, "USD")}.</p>
          <p className="mt-3 text-[15px] leading-relaxed">At {pct}%, you earn <span className="font-semibold">{money(ex.advisor, "USD")}</span>; the house keeps {money(ex.house, "USD")}.</p>
          <p className="mt-3 text-[12.5px] ledger-muted">An illustration only. Supplier commissions differ by partner.</p>
        </Panel>
      </div>
      <div className="mt-8 grid gap-3 max-w-2xl">
        {last && <p className="text-[14px] ledger-muted">You acknowledged this plan on {niceDate(last.acknowledged_at)} ({TIER_NAME[last.tier] ?? last.tier}, {last.share_bp / 100}%).</p>}
        <AcknowledgePlan done={Boolean(last)} />
      </div>
    </>
  );
}
