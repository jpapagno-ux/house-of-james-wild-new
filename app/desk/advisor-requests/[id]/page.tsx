import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { isUuid } from "@/lib/platform/validate";
import { advisorRequest, commissionLines } from "@/lib/platform/advisor-file-data";
import { pct } from "@/lib/platform/commission-ledger";
import { OPEN, REQUEST_STATUS, money, nightsBetween, party } from "@/lib/platform/advisor-requests";
import { niceDate } from "@/lib/platform/labels";
import EstimateBlock from "@/components/advisor/EstimateBlock";
import { DecideRequest, RecordCommission } from "@/components/advisor/RequestForms";
import { DataList, Section, StatusPill, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Advisor quote request" };

export default async function HouseAdvisorRequest({ params }: { params: Promise<{ id: string }> }) {
  if (!ADVISOR_DESK) notFound();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const desk = await requireHouse(`/desk/advisor-requests/${id}`);
  const r = await advisorRequest(desk.sb, id);
  if (!r) notFound();
  const { data: adv } = await desk.sb.from("advisors").select("display_name, adv_number, id").eq("id", r.advisor_id).maybeSingle();
  const s = REQUEST_STATUS[r.status];
  const [line] = r.status === "confirmed" ? await commissionLines(desk.sb, { requestId: r.id }) : [];
  const { data: rate } = r.status === "confirmed" && !line ? await desk.sb.rpc("commission_rate_for_stay", { p_slug: r.stay_slug }) : { data: null };
  const termRate = typeof rate === "number" ? rate : null;
  return (
    <div>
      <p className="ledger-eyebrow ledger-crimson"><TextLink href="/desk/advisor-requests">Advisor quote requests</TextLink> · {r.ref}</p>
      <h1 className="ledger-display text-[2rem] md:text-[2.4rem] leading-[1.1]">{r.stay_name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3"><StatusPill label={s.label} tone={s.tone} />{r.price_minor && r.currency ? <span className="tabular-nums text-[15px]">{money(r.price_minor, r.currency)}</span> : null}{r.hold_until && r.status === "held" ? <span className="text-[14px] ledger-muted">held to {niceDate(r.hold_until)}</span> : null}</div>
      <Section title="The request">
        <DataList rows={[
          ["Advisor", adv ? <TextLink key="a" href={`/desk/advisors/${adv.id}`}>{`${adv.display_name} (${adv.adv_number})`}</TextLink> : "Advisor"],
          ["Client", `${r.client_name}${r.client_email ? `, ${r.client_email}` : ""}`],
          ["Stay", <span key="s">{r.stay_name}{r.ledger_id ? ` · ${r.ledger_id}` : ""}</span>],
          ["Dates", `${niceDate(r.arrival)} to ${niceDate(r.departure)}, ${nightsBetween(r.arrival, r.departure)} nights`],
          ["Party", party(r.adults, r.child_ages)],
          ["Room in mind", r.room_pref ?? "Not given"],
          ["Notes", r.notes ?? "None"],
          ["Sent", niceDate(r.created_at)],
          ...(r.house_note ? [["Note to the advisor", r.house_note] as [string, React.ReactNode]] : []),
        ]} />
      </Section>
      <Section title="The desk's estimate"><EstimateBlock e={r.estimate} /></Section>
      {OPEN.includes(r.status) ? (
        <Section title="Move it on"><div className="max-w-3xl"><DecideRequest id={r.id} status={r.status} price={r.price_minor ? String(r.price_minor / 100) : ""} currency={r.currency ?? "USD"} /></div></Section>
      ) : <p className="mt-8 text-[15px] ledger-muted">This request is closed.</p>}
      {r.status === "confirmed" && (line ? (
        <Section title="Commission"><p className="text-[15px]">Recorded as <TextLink href={`/desk/commissions/${line.id}`}>{line.ref}</TextLink>: {pct(line.rate_bp)} of {money(line.base_minor, line.currency)}.</p></Section>
      ) : (
        <Section title="Record the commission"><div className="max-w-3xl"><RecordCommission id={r.id} price={r.price_minor ? String(r.price_minor / 100) : ""} currency={r.currency ?? "USD"} termRate={termRate !== null ? pct(termRate) : null} /></div></Section>
      ))}
    </div>
  );
}
