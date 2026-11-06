import { requireAdvisorFile } from "@/lib/platform/advisor";
import { currentAgreement, myFileState, signatures } from "@/lib/platform/advisor-file-data";
import { agreementBlocks } from "@/lib/platform/advisor-file";
import { niceDate } from "@/lib/platform/labels";
import { SignAgreement } from "@/components/advisor/FileForms";
import { Empty, PageHead, TextLink } from "@/components/platform/ui";

export const metadata = { title: "The agreement" };

export default async function AdvisorAgreement() {
  const a = await requireAdvisorFile("/advisor/file/agreement");
  const [ag, state, sigs] = await Promise.all([currentAgreement(a.sb), myFileState(a.sb), signatures(a.sb, a.advisor.id)]);
  if (!ag) return (<><PageHead eyebrow="My file · Step 3" title="The agreement" /><div className="mt-8"><Empty title="The agreement is being prepared">The house will publish it here.</Empty></div></>);
  const signed = sigs.find((s) => s.agreement_id === ag.id);
  return (
    <>
      <PageHead eyebrow="My file · Step 3" title={ag.title} lead={`Version ${ag.version}. Read it in full; then sign below with your legal name.`} actions={<TextLink href="/advisor/file">My file</TextLink>} />
      {ag.is_placeholder && (
        <p className="mt-6 border-l-2 border-[#8B2525] bg-white px-5 py-3 text-[14.5px]">This is the draft awaiting the house&rsquo;s attorney. Signing it is a test for the house&rsquo;s own advisors; the final version replaces it before any other advisor is activated.</p>
      )}
      <article className="mt-8 bg-white border ledger-border px-5 py-6 md:px-10 md:py-10 max-w-3xl max-h-[70vh] overflow-y-auto" tabIndex={0} aria-label="Agreement text">
        {agreementBlocks(ag.body).map((b, i) => b.kind === "heading"
          ? <h2 key={i} className="ledger-display text-[1.35rem] mt-7 first:mt-0">{b.text}</h2>
          : <p key={i} className="mt-3 text-[15px] leading-relaxed">{b.text}</p>)}
      </article>
      <div className="mt-8 max-w-3xl">
        {signed ? (
          <div className="bg-white border border-[#11705A]/40 p-5 md:p-6">
            <p className="ledger-eyebrow text-[#11705A]">Signed</p>
            <p className="mt-2 ledger-display text-[1.6rem]">{signed.typed_name}</p>
            <p className="mt-1 text-[14px] ledger-muted">Version {signed.version}, {niceDate(signed.signed_at)}, signed in with your authenticator code.</p>
            <p className="mt-4"><TextLink href="/advisor/file/agreement/signed">Your signed copy</TextLink></p>
          </div>
        ) : !state.details ? (
          <Empty title="Your details come first">Add your full legal name in your details; you sign by typing it exactly. <TextLink href="/advisor/file/details">Your details</TextLink></Empty>
        ) : <SignAgreement agreementId={ag.id} version={ag.version} />}
      </div>
    </>
  );
}
