import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { isUuid } from "@/lib/platform/validate";
import { documents, dnaProposals, publishedDna, signatures } from "@/lib/platform/advisor-file-data";
import { DNA_PARTIES, DNA_VOLUMES, dnaChanges, fromLibrary, type DnaInput } from "@/lib/platform/advisor-dna";
import { ADVISORS } from "@/lib/content/advisors";
import { COUNTRIES } from "@/lib/content/countries";
import { PATHWAYS, type PathwayId } from "@/lib/pathways";
import staysData from "@/lib/content/stays.json";
import { ADV_DOC_LABEL, ENTITY_TYPES, TIER_NAME, feeText, fileSteps, readyToActivate, type AdvDocKind, type FileState, type Plan } from "@/lib/platform/advisor-file";
import { niceDate } from "@/lib/platform/labels";
import { Activate, DecideDna, DecideDocument, SetPlan } from "@/components/advisor/HouseForms";
import { DataList, Section, StatusPill, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Advisor file" };

const DOC: Record<string, [string, "good" | "progress" | "attention" | "neutral"]> = {
  submitted: ["To review", "progress"], accepted: ["Accepted", "good"], returned: ["Returned", "attention"], archived: ["Withdrawn", "neutral"],
};

export default async function HouseAdvisor({ params }: { params: Promise<{ id: string }> }) {
  if (!ADVISOR_DESK) notFound();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const desk = await requireHouse(`/desk/advisors/${id}`);
  const { data: a } = await desk.sb.from("advisors").select("id, adv_number, slug, display_name, status, user_id, house_advisor, program_fee_minor, fee_currency, fee_period, payment_terms, activated_at").eq("id", id).maybeSingle();
  if (!a) notFound();
  const [{ data: st, error: stErr }, { data: plan }, { data: det }, docs, sigs, pubDna, dnaProps] = await Promise.all([
    desk.sb.rpc("advisor_file_state", { p_advisor: id }),
    desk.sb.rpc("advisor_plan_for", { p_advisor: id }),
    desk.sb.from("advisor_details").select("*").eq("advisor_id", id).maybeSingle(),
    documents(desk.sb, id),
    signatures(desk.sb, id),
    publishedDna(desk.sb, id),
    dnaProposals(desk.sb, id),
  ]);
  if (stErr) notFound();
  const s = st as FileState, p = plan as Plan | null;
  const ready = readyToActivate(s);
  const sig = sigs[0];
  const waitingDna = dnaProps.find((x) => x.status === "submitted") ?? null;
  const libraryDna = ADVISORS.find((x) => x.slug === a.slug && !x.sample)?.dna;
  const shownDna: DnaInput | null = waitingDna?.payload ?? (pubDna ? { ...pubDna } : null);
  const baseline: DnaInput | null = pubDna ? { ...pubDna } : libraryDna ? fromLibrary(libraryDna) : null;
  const entity = ENTITY_TYPES.find(([k]) => k === det?.entity_type)?.[1];
  return (
    <div>
      <p className="ledger-eyebrow ledger-crimson"><TextLink href="/desk/advisors">Advisors</TextLink> · {a.adv_number}</p>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] leading-[1.1]">{a.display_name}</h1>
      <p className="mt-2 text-[15px] ledger-muted">
        {a.status === "active" ? `Active since ${niceDate(a.activated_at)}` : a.status === "invited" ? (a.user_id ? "Onboarding" : "Invited, not signed in yet") : a.status}
        {a.house_advisor ? " · House advisor" : ""}
      </p>

      <ol className="mt-6 flex flex-wrap gap-2">
        {fileSteps(s).map((x) => <li key={x.key}><StatusPill label={`${x.title.replace("The Independent Marketing Agreement", "Agreement")}: ${x.waiting ? "to review" : x.done ? "done" : "to do"}`} tone={x.waiting ? "progress" : x.done ? "good" : "attention"} /></li>)}
      </ol>

      <Section title="Details">
        {det ? <DataList rows={[
          ["Legal name", det.legal_name], ["Business", [det.business_name, entity].filter(Boolean).join(", ") || "None"],
          ["Mailing address", <span key="a" className="whitespace-pre-line">{det.mailing_address}</span>], ["Notices to", det.notice_email],
          ["Mobile", det.mobile ?? "Not given"], ["Lives in", [det.residence_state, det.residence_country].filter(Boolean).join(", ")],
          ["Seller of travel registration", det.sot_registration ?? "Not given"], ["Memberships", det.memberships ?? "None"],
          ["E&O insurance", [det.eo_insurer, det.eo_policy_number, det.eo_expires_on ? `expires ${niceDate(det.eo_expires_on)}` : null].filter(Boolean).join(", ") || "Not given"],
          ["Years selling travel", det.years_selling ?? "Not given"], ["Languages", (det.languages ?? []).join(", ") || "Not given"],
          ["Specialties", det.specialties ?? "Not given"],
        ]} /> : <p className="text-[15px] ledger-muted">Not filed yet.</p>}
      </Section>

      <Section title="Documents">
        {docs.length ? (
          <ul className="divide-y ledger-border border-y ledger-border">
            {docs.map((d) => {
              const [label, tone] = DOC[d.status] ?? [d.status, "neutral"];
              return (
                <li key={d.id} className="py-4 grid gap-2">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <a href={`/api/v1/advisor/documents/${d.id}/file`} className="text-[15px] font-medium hover:underline">{d.title}</a>
                    <span className="text-[13px] ledger-muted">{ADV_DOC_LABEL[d.kind as AdvDocKind] ?? d.kind}</span>
                    <StatusPill label={label} tone={tone} />
                    {d.expires_on && <span className="text-[13px] ledger-muted">Expires {niceDate(d.expires_on)}</span>}
                    <span className="ml-auto text-[12.5px] ledger-muted">Filed {niceDate(d.created_at)}</span>
                  </div>
                  {d.note && <p className="text-[14px]">The advisor: {d.note}</p>}
                  {d.house_note && <p className="text-[14px] ledger-muted">The house: {d.house_note}</p>}
                  {d.status === "submitted" && <DecideDocument id={d.id} />}
                </li>
              );
            })}
          </ul>
        ) : <p className="text-[15px] ledger-muted">Nothing filed yet.</p>}
      </Section>

      <Section title="Advisor DNA">
        {shownDna ? (
          <>
            {waitingDna ? <p className="text-[15px] mb-3"><StatusPill label="To review" tone="progress" /> <span className="ml-2">Sent {niceDate(waitingDna.created_at)}.{baseline ? (pubDna ? " Changes from what is published:" : " Changes from the Library's copy the site shows today:") : ""}</span></p>
              : <p className="text-[15px] mb-3"><StatusPill label="Approved" tone="good" /> <span className="ml-2">{niceDate(pubDna?.approved_at)}{a.status === "active" ? ", on the website" : ", shows once the advisor is active"}.</span></p>}
            {waitingDna && baseline && (() => {
              const ch = dnaChanges(baseline, waitingDna.payload);
              return ch.length ? (
                <ul className="mb-4 grid gap-1 text-[14px]">
                  {ch.map((c) => <li key={c.field}><span className="font-medium">{c.field}:</span>{c.added.length ? ` added ${c.added.map((x) => label(x)).join(", ")}` : ""}{c.removed.length ? `${c.added.length ? ";" : ""} removed ${c.removed.map((x) => label(x)).join(", ")}` : ""}{c.now !== undefined ? ` now ${c.now}` : ""}</li>)}
                </ul>
              ) : <p className="mb-4 text-[14px] ledger-muted">No changes: the advisor confirms it as it stands.</p>;
            })()}
            <DataList rows={[
              ["Pathways", shownDna.pathways.map((p) => PATHWAYS[p as PathwayId]?.name ?? p).join(", ")],
              ["Volumes", shownDna.volumes.map((v) => DNA_VOLUMES.find(([k]) => k === v)?.[1] ?? v).join(", ")],
              ["Plans for", shownDna.party_types.map((v) => DNA_PARTIES.find(([k]) => k === v)?.[1] ?? v).join(", ") || "Not given"],
              ["Countries", shownDna.countries.map(label).join(", ")],
              ["Marks", shownDna.marks.map((m) => `${label(m.ledgerId)}: ${m.mark}${m.when ? `, ${m.when}` : ""}`).join("; ") || "None"],
              ["Languages", shownDna.languages.join(", ") || "Not given"], ["Specialties", shownDna.specialties.join(", ") || "Not given"],
              ["Their line", shownDna.match_note ?? "None"], ["Taking clients", shownDna.availability],
            ]} />
            {waitingDna && <div className="mt-4"><DecideDna id={waitingDna.id} /></div>}
          </>
        ) : <p className="text-[15px] ledger-muted">Not sent yet.</p>}
        {dnaProps.find((x) => x.status === "returned" && !waitingDna) && <p className="mt-2 text-[14px] ledger-muted">Last returned: {dnaProps.find((x) => x.status === "returned")?.house_note}</p>}
      </Section>

      <Section title="Agreement">
        {sig ? <p className="text-[15px]">Signed by <span className="font-medium">{sig.typed_name}</span>, version {sig.version}, {niceDate(sig.signed_at)}. <span className="font-mono text-[11.5px] ledger-muted break-all">SHA-256 {sig.body_sha256}</span></p>
          : <p className="text-[15px] ledger-muted">Not signed yet.</p>}
        {s.agreement_placeholder && <p className="mt-2 text-[14px] ledger-crimson">The current agreement is the draft awaiting the attorney: only house advisors can be activated on it.</p>}
      </Section>

      <Section title="Plan">
        {p && <p className="text-[15px] mb-4">{TIER_NAME[p.tier] ?? p.tier}{p.tier_assigned ? "" : " (starting tier, not yet set)"}, {p.share_bp / 100}% of the commission received. {feeText(p)}.{p.payment_terms ? ` ${p.payment_terms}` : ""} {s.plan ? "Acknowledged by the advisor." : "Not yet acknowledged."}</p>}
        <SetPlan id={a.id} fee={a.program_fee_minor} period={a.fee_period ?? "none"} terms={a.payment_terms} signedIn={Boolean(a.user_id)} />
      </Section>

      {a.status === "invited" && (
        <Section title="Activate">
          <p className="text-[15px] mb-4">{ready ? "Every part is on file, both required documents are accepted and the Advisor DNA is approved." : "Activation opens once the details, plan and agreement are done, the tax form and insurance are accepted and the Advisor DNA is approved."}</p>
          <Activate id={a.id} ready={ready} />
        </Section>
      )}
    </div>
  );
}

// Names for the review: countries and Ledger stays by their site name.
const COUNTRY_NAME = new Map(COUNTRIES.map((c) => [c.slug, c.name]));
const STAY_NAME = new Map((staysData as { stays: { ledgerId: string | null; name: string }[] }).stays.filter((x) => x.ledgerId).map((x) => [x.ledgerId as string, x.name]));
function label(x: string): string {
  const [id, ...rest] = x.split(" ");
  if (STAY_NAME.has(id)) return [STAY_NAME.get(id), ...rest].join(" ");
  return COUNTRY_NAME.get(x) ?? PATHWAYS[x as PathwayId]?.name ?? x;
}
