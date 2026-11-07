import { notFound } from "next/navigation";
import { requireAdvisor } from "@/lib/platform/advisor";
import { isUuid } from "@/lib/platform/validate";
import { advisorRequest } from "@/lib/platform/advisor-file-data";
import { OPEN, REQUEST_STATUS, money, nightsBetween, party, shareText } from "@/lib/platform/advisor-requests";
import { niceDate } from "@/lib/platform/labels";
import EstimateBlock from "@/components/advisor/EstimateBlock";
import { CopyShare, WithdrawRequest } from "@/components/advisor/RequestForms";
import { DataList, PageHead, Section, StatusPill, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Quote request" };

export default async function AdvisorRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const a = await requireAdvisor(`/advisor/requests/${id}`);
  const r = await advisorRequest(a.sb, id);
  if (!r) notFound();
  const s = REQUEST_STATUS[r.status];
  const n = nightsBetween(r.arrival, r.departure);
  return (
    <>
      <PageHead eyebrow={`Quote request · ${r.ref}`} title={r.stay_name} lead={`${r.client_name} · ${niceDate(r.arrival)} to ${niceDate(r.departure)}, ${n} ${n === 1 ? "night" : "nights"} · ${party(r.adults, r.child_ages)}`}
        actions={<span className="flex flex-wrap gap-4"><TextLink href="/advisor/requests">All requests</TextLink><TextLink href={`/advisor/ledger/${r.stay_slug}`}>The stay</TextLink></span>} />
      <div className="mt-5 flex flex-wrap items-center gap-3"><StatusPill label={s.label} tone={s.tone} /><span className="text-[14.5px]">{s.line}</span></div>

      {(r.status === "held" || r.status === "confirmed") && r.price_minor && r.currency && (
        <Section title="The house's quote">
          <DataList rows={[
            ["Price", <span key="p" className="text-[18px] font-medium tabular-nums">{money(r.price_minor, r.currency)}</span>],
            ...(r.hold_until ? [["Held until", niceDate(r.hold_until)] as [string, React.ReactNode]] : []),
            ...(r.valid_until ? [["Price valid until", niceDate(r.valid_until)] as [string, React.ReactNode]] : []),
            ...(r.house_note ? [["From the house", r.house_note] as [string, React.ReactNode]] : []),
          ]} />
          <div className="mt-5"><p className="ledger-eyebrow mb-2">For your client</p><CopyShare text={shareText(r, a.advisor.display_name, niceDate)} /></div>
        </Section>
      )}
      {r.status === "declined" && r.house_note && <p className="mt-6 border-l-2 border-[#8B2525] bg-white px-5 py-3 text-[15px]"><span className="font-medium">From the house:</span> {r.house_note}</p>}

      <Section title="What you asked">
        <DataList rows={[
          ["Client", `${r.client_name}${r.client_email ? `, ${r.client_email}` : ""}`],
          ["Dates", `${niceDate(r.arrival)} to ${niceDate(r.departure)}`],
          ["Party", party(r.adults, r.child_ages)],
          ["Room in mind", r.room_pref ?? "Not given"],
          ["Notes", r.notes ?? "None"],
          ["Sent", niceDate(r.created_at)],
        ]} />
      </Section>
      <Section title="The desk's estimate when you sent it"><EstimateBlock e={r.estimate} /></Section>
      {OPEN.includes(r.status) && <div className="mt-8"><WithdrawRequest id={r.id} /></div>}
    </>
  );
}
