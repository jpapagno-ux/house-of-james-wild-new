import { Suspense } from "react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import Shelf from "@/components/folio/Shelf";
import { buildMetadata } from "@/lib/seo";

// /folio — My Folio, the shelf on this device (Stage 4, 31 Oct 2026). Each
// Folio Iggi opened carries its FOL number, the advisor it is open with and
// the Ledger records on it. Private to the browser; never indexed.
export const metadata = buildMetadata({ title: "My Folio", description: "The journeys Iggi has opened for you, each with its Folio number and the advisor it is open with.", path: "/folio", noindex: true });

export default function FolioPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "My Folio", path: "/folio" }]} /></div>
          <p className="ledger-eyebrow ledger-crimson">My Folio</p>
          <h1 className="ledger-h1 mt-2">Your journeys, by number.</h1>
          <p className="mt-3 text-[17px] ledger-muted max-w-2xl leading-relaxed">When Iggi shapes a journey you want to keep, it opens a Folio: a number the house recognises, the Ledger records on it, and the advisor it is open with. Quote the number and anyone at the house can pick it up.</p>
          <Suspense fallback={null}><Shelf /></Suspense>
        </div>
      </main>
    </>
  );
}
