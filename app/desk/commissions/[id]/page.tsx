import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { isUuid } from "@/lib/platform/validate";
import { commissionLines } from "@/lib/platform/advisor-file-data";
import { LINE_STATUS, NEXT, pct } from "@/lib/platform/commission-ledger";
import { money } from "@/lib/platform/advisor-requests";
import { niceDate } from "@/lib/platform/labels";
import { LineStep } from "@/components/advisor/RequestForms";
import { DataList, Section, StatusPill, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Commission line" };

export default async function CommissionLinePage({ params }: { params: Promise<{ id: string }> }) {
  if (!ADVISOR_DESK) notFound();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const desk = await requireHouse(`/desk/commissions/${id}`);
  const [l] = await commissionLines(desk.sb, { id });
  if (!l) notFound();
  const { data: adv } = l.advisor_id ? await desk.sb.from("advisors").select("id, display_name, adv_number").eq("id", l.advisor_id).maybeSingle() : { data: null };
  const next = NEXT[l.status];
  return (
    <div>
      <p className="ledger-eyebrow ledger-crimson"><TextLink href="/desk/commissions">Commission ledger</TextLink> · {l.ref}</p>
      <h1 className="ledger-display text-[2rem] md:text-[2.4rem] leading-[1.1]">{l.stay_name}</h1>
      <div className="mt-3"><StatusPill label={LINE_STATUS[l.status].label} tone={LINE_STATUS[l.status].tone} /></div>
      <Section title="The booking">
        <DataList rows={[
          ["Client", l.client_name ?? "Not recorded"],
          ["Stay", `${niceDate(l.arrival)} to ${niceDate(l.departure)}`],
          ["Advisor", adv ? <TextLink key="a" href={`/desk/advisors/${adv.id}`}>{`${adv.display_name} (${adv.adv_number})`}</TextLink> : "House"],
          ["Source", l.source === "advisor_request" ? "Advisor quote request" : l.source === "site_booking" ? "Booking on the site" : "Booked with a supplier"],
          ...(l.advisor_request_id ? [["Request", <TextLink key="r" href={`/desk/advisor-requests/${l.advisor_request_id}`}>Open the request</TextLink>] as [string, React.ReactNode]] : []),
          ["Recorded", niceDate(l.booked_on)],
        ]} />
      </Section>
      <Section title="The money, fixed when recorded">
        <DataList rows={[
          ["Sold", money(l.sell_minor, l.currency)],
          ["Commissionable", money(l.base_minor, l.currency)],
          ["Partner's rate", `${pct(l.rate_bp)}${l.rate_source === "override" ? " (set by the house)" : " (terms on file)"}`],
          ["Commission", money(l.gross_minor, l.currency)],
          ["Advisor's share", `${money(l.advisor_minor, l.currency)} (${pct(l.advisor_share_bp)}${l.tier ? `, ${l.tier.replace("tier_", "Tier ")}` : ""})`],
          ["House's share", money(l.house_minor, l.currency)],
          ...(l.note ? [["Note", l.note] as [string, React.ReactNode]] : []),
        ]} />
      </Section>
      <Section title="Steps">
        <DataList rows={[
          ["Invoiced to partner", l.invoiced_on ? `${niceDate(l.invoiced_on)}${l.invoice_reference ? `, ${l.invoice_reference}` : ""}` : "Not yet"],
          ["Received", l.received_on ? `${niceDate(l.received_on)}${l.received_reference ? `, ${l.received_reference}` : ""}` : "Not yet"],
          ["Paid to advisor", l.paid_on ? `${niceDate(l.paid_on)}${l.paid_reference ? `, ${l.paid_reference}` : ""}` : "Not yet"],
        ]} />
        {l.status !== "advisor_paid" && l.status !== "cancelled" && <div className="mt-5 max-w-3xl"><LineStep id={l.id} to={next?.to ?? ""} action={next?.action ?? ""} refLabel={next?.ref ?? "Reference"} /></div>}
      </Section>
    </div>
  );
}
