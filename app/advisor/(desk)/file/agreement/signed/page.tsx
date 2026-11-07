import { notFound } from "next/navigation";
import { requireAdvisorFile } from "@/lib/platform/advisor";
import { signatures } from "@/lib/platform/advisor-file-data";
import { agreementBlocks } from "@/lib/platform/advisor-file";
import PrintButton from "@/components/advisor/PrintButton";

export const metadata = { title: "Signed agreement" };

// The advisor's signed copy: the exact text of the version they signed, with the signature record.
// Print or save as PDF from the browser.
export default async function SignedAgreement() {
  const a = await requireAdvisorFile("/advisor/file/agreement/signed");
  const sig = (await signatures(a.sb, a.advisor.id))[0];
  if (!sig) notFound();
  const { data: ag } = await a.sb.from("advisor_agreements").select("title, version, body").eq("id", sig.agreement_id).maybeSingle();
  if (!ag) notFound();
  const when = new Date(sig.signed_at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short", timeZone: "America/New_York" });
  return (
    <article className="bg-white border ledger-border px-6 py-8 md:px-12 md:py-12 max-w-3xl print:border-0 print:p-0">
      <div className="flex items-start justify-between gap-4 print:hidden"><p className="ledger-eyebrow">Signed copy</p><PrintButton /></div>
      <h1 className="ledger-display text-[2rem] mt-4">{ag.title}</h1>
      <p className="text-[13px] ledger-muted">Version {ag.version}</p>
      {agreementBlocks(ag.body).map((b, i) => b.kind === "heading"
        ? <h2 key={i} className="ledger-display text-[1.3rem] mt-7">{b.text}</h2>
        : <p key={i} className="mt-3 text-[14.5px] leading-relaxed">{b.text}</p>)}
      <section className="mt-10 border-t ledger-rule pt-6 grid gap-1 text-[14px]">
        <p className="ledger-eyebrow">Electronic signature</p>
        <p className="ledger-display text-[1.6rem] mt-1">{sig.typed_name}</p>
        <p>Advisor {a.advisor.display_name}, {a.advisor.adv_number}</p>
        <p>Signed {when} (New York time), in the James Wild &amp; Co Advisor Desk, signed in with an authenticator code.</p>
        <p className="font-mono text-[11.5px] ledger-muted break-all">Text fingerprint (SHA-256): {sig.body_sha256}</p>
        <p className="mt-2">For James Wild &amp; Co LLC, 13300 Southwest 98th Place, Miami, Florida 33176.</p>
      </section>
    </article>
  );
}
