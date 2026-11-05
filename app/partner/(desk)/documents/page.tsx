import { requireDesk } from "@/lib/platform/membership";
import { documents, portfolio, type DocumentRow } from "@/lib/platform/queries";
import { CONTRACT_KEEPER_ROLES, DOC_KIND_LABEL, DOC_KIND_LINE, daysToExpiry, ALLOWED_MIME, type DocKind } from "@/lib/platform/documents";
import { PageHead, Section, Empty, StatusPill, Notice } from "@/components/platform/ui";
import { UploadDocument, ArchiveDocument } from "@/components/platform/DocumentForms";
import { today } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Documents · Partner Desk", robots: { index: false, follow: false } };

const fmtDate = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmtSize = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default async function Documents({ searchParams }: { searchParams: Promise<{ archived?: string }> }) {
  const desk = await requireDesk("/partner/documents");
  const showArchived = (await searchParams).archived === "1";
  const [docs, entities] = await Promise.all([documents(desk, { archived: showArchived }), portfolio(desk)]);
  const day = today();
  const name = new Map(entities.map((e) => [e.id, e.name]));
  const keeper = desk.memberships.some((m) => m.status === "active" && m.organization.type === "internal" && CONTRACT_KEEPER_ROLES.includes(m.role));
  // What this person may see (the database already filtered the list; this decides which sections to show).
  const seesContract = desk.canAdmin || keeper;
  const kinds: DocKind[] = keeper ? ["contract", "commercial", "supporting"] : ["commercial", "supporting"];
  const propertyRequired = !desk.canAdmin && !desk.houseEditor;
  const groups: DocKind[] = seesContract ? ["contract", "commercial", "supporting"] : ["commercial", "supporting"];

  const row = (d: DocumentRow) => {
    const left = daysToExpiry(d.expires_on, day);
    return (
      <li key={d.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <p className="font-medium">{d.title}</p>
          <p className="text-[13px] ledger-muted">
            {d.property_id ? name.get(d.property_id) ?? "A property" : "Whole company"} · {ALLOWED_MIME[d.mime_type] ?? "File"} · {fmtSize(d.size_bytes)} · filed {fmtDate(d.created_at.slice(0, 10))}
            {d.effective_from && <> · from {fmtDate(d.effective_from)}</>}
          </p>
          {d.note && <p className="text-[13.5px] ledger-muted mt-1 whitespace-pre-line">{d.note}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {left !== null && <StatusPill label={left < 0 ? "Expired" : left <= 60 ? `Expires in ${left} days` : `Until ${fmtDate(d.expires_on!)}`} tone={left < 0 ? "attention" : left <= 60 ? "attention" : "neutral"} />}
          <a href={`/api/v1/partner/documents/${d.id}/file`} className="ledger-btn-ghost">Download</a>
          {(d.kind === "contract" ? keeper : desk.canAdmin || desk.houseEditor || !!d.property_id) ? <ArchiveDocument id={d.id} archived={showArchived} /> : null}
        </div>
      </li>
    );
  };

  return (
    <>
      <PageHead eyebrow="Documents" title={showArchived ? "Archived documents" : "Documents and contracts"}
        lead={showArchived ? "Documents taken out of use. Restore one to bring it back." : "Your signed agreement with the house, rate sheets and the papers that support your listings. Files stay private: each download is a link that works for one minute."} />
      <div className="mt-8">
        {!showArchived && <UploadDocument kinds={kinds} properties={entities.map((e) => ({ id: e.id, name: e.name }))} propertyRequired={propertyRequired} />}
      </div>
      {!seesContract && !showArchived && (
        <div className="mt-6"><Notice>Your contract with James Wild & Co is kept with your partner admins.</Notice></div>
      )}
      {groups.map((k) => {
        const list = docs.filter((d) => d.kind === k);
        return (
          <Section key={k} title={DOC_KIND_LABEL[k] === "Contract" ? "Contract" : `${DOC_KIND_LABEL[k]} documents`} aside={<span className="ledger-muted">{list.length}</span>}>
            <p className="text-[14px] ledger-muted mb-2">{DOC_KIND_LINE[k]}</p>
            {list.length ? <ul className="divide-y divide-ink/10 border-y ledger-border">{list.map(row)}</ul>
              : <Empty title={k === "contract" ? "No contract on file yet" : "Nothing filed yet"}>{k === "contract" ? (keeper ? "Upload the signed agreement above." : "The house will file your signed agreement here.") : "Upload one above."}</Empty>}
          </Section>
        );
      })}
      <p className="mt-10 text-[14px]">
        <a href={showArchived ? "/partner/documents" : "/partner/documents?archived=1"} className="ledger-btn-ghost">{showArchived ? "Back to documents" : "Archived documents"}</a>
      </p>
    </>
  );
}
