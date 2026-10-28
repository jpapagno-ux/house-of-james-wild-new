import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import TravelNotesForm from "@/components/TravelNotesForm";
import { buildMetadata } from "@/lib/seo";

// /travel-notes: the sign-up for the house letter. Copy reuses the lines James
// approved on the home page and destination pages; noindex until he signs off.
const PATH = "/travel-notes";
export const metadata = buildMetadata({
  title: "Travel Notes: New Stays and Ships, First",
  description: "A short letter when a new stay or ship enters the James Wild & Co Ledger, with the stay-longer offers before they go public. One letter a month.",
  path: PATH,
  noindex: false /* approved by James, 28 Oct 2026 */,
});

export default function TravelNotesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Travel Notes", path: PATH }]} /></div>
          <header className="max-w-2xl">
            <p className="ledger-eyebrow ledger-crimson">Travel Notes</p>
            <h1 className="ledger-display text-[2.3rem] leading-[1.1] md:text-[3.3rem] mt-3">New Stays, First</h1>
            <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed">A short letter when a new stay or ship enters the Ledger, with the stay-longer offers before they go public. One letter a month.</p>
          </header>
          <div className="mt-8 max-w-xl"><TravelNotesForm source="travel-notes" /></div>
          <p className="mt-10 text-[15px] ledger-muted">Want to plan something now? <Link href="/plan" className="underline underline-offset-4">Plan it with James</Link>.</p>
        </div>
      </main>
    </>
  );
}
