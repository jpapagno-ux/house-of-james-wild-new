import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import ApplyForm from "@/components/advisors/ApplyForm";
import { JwcoSeal } from "@/components/ledger/Marks";
import { FOR_ADVISORS } from "@/lib/content/house";
import { buildMetadata } from "@/lib/seo";

// /for-advisors/apply — apply to carry the Ledger (Stage 5, 31 Oct 2026).
// The application an advisor fills in, not the traveller's enquiry form.
const PATH = "/for-advisors/apply";
export const metadata = buildMetadata({
  title: "Apply to Carry the Ledger: Join James Wild & Co as an Advisor",
  description: "Tell the house who you are, the places you know first-hand and the volumes you would carry. James reads every application himself.",
  path: PATH,
  noindex: false,
});

export default function ApplyPage() {
  const a = FOR_ADVISORS;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "For advisors", path: "/for-advisors" }, { name: "Apply", path: PATH }]} /></div>
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-14 items-start">
            <header className="lg:sticky lg:top-28">
              <p className="ledger-eyebrow ledger-crimson">For advisors · Apply</p>
              <h1 className="ledger-display text-[2.1rem] leading-[1.12] md:text-[2.8rem] mt-3">Carry the Ledger.</h1>
              <p className="mt-4 text-[17px] ledger-muted leading-relaxed">Three short sections: who you are, what you know first-hand, and a line in your own words. Ten minutes, no essay.</p>
              <div className="mt-6 flex items-start gap-4 ledger-paper p-5"><JwcoSeal size={56} /><p className="ledger-hand text-[1.5rem] leading-tight">&ldquo;{a.quote}&rdquo;</p></div>
              <dl className="mt-6 border-t ledger-border">{a.meta.map(([k, v]) => <div key={k} className="grid grid-cols-[8rem_1fr] gap-3 py-2.5 border-b ledger-border"><dt className="ledger-eyebrow pt-0.5">{k}</dt><dd className="text-[15px]">{v}</dd></div>)}</dl>
              <p className="mt-5 text-[14px] ledger-muted">Terms, training and what you get: <Link href="/for-advisors#terms" className="underline underline-offset-4">the full page</Link>.</p>
            </header>
            <ApplyForm />
          </div>
        </div>
      </main>
    </>
  );
}
