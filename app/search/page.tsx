import SiteHeader from "@/components/ledger/SiteHeader";
import SearchLanding from "@/components/ledger/SearchLanding";
import { buildMetadata } from "@/lib/seo";

// /search?q=… : the house search at its own address, so a result list can be shared or bookmarked, and search engines
// can offer a search box for the site (the WebSite SearchAction in lib/schema). It opens the same panel as the header.
export function generateMetadata() {
  return buildMetadata({ title: "Search the House: Lodges, Stays, Ships and Places", description: "Find any lodge, safari camp, stay, ship, voyage, destination or advisor in the James Wild & Co Ledger.", path: "/search", noindex: true });
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main id="main" className="max-w-ledger mx-auto px-5 md:px-10 py-16 min-h-[60vh]">
        <SearchLanding q={q} />
      </main>
    </>
  );
}
