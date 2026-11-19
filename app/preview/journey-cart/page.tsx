import SiteHeader from "@/components/ledger/SiteHeader";
import JourneyCheckout from "@/components/checkout/JourneyCheckout";
import { pilotCatalogue } from "@/lib/checkout/pilot";
import { ADVISORS, DEFAULT_ADVISOR } from "@/lib/content/advisors";
import { buildMetadata } from "@/lib/seo";

// Journey Cart preview (Booking & Checkout Studio, Session 03, 15 Nov 2026).
// Five steps and a confirmation, simulated payment. ?view=advisor opens with house and advisor detail showing.
// ?example=1 loads the full example journey; ?example=lion-sands shows Lion Sands Ivory Lodge alone, on its rate card.
// Open on the live site since 19 Nov 2026 (James: "merge live", to review the checkout without a team sign-in):
// never indexed, never linked from the site, and still a simulation. No payment exists here to switch on.
export const dynamic = "force-dynamic";
export const metadata = buildMetadata({ title: "Journey Cart (preview)", description: "Preview of the James Wild & Co Journey Cart and checkout. Simulation only.", path: "/preview/journey-cart", noindex: true });

export default async function JourneyCartPreview({ searchParams }: { searchParams: Promise<{ advisor?: string; view?: string; example?: string }> }) {
  const { advisor, view, example } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const advisors = ADVISORS.filter((a) => !a.sample).map((a) => ({ slug: a.slug, name: a.name, role: a.role, ledgerId: a.ledgerId }));
  const assigned = advisors.find((a) => a.slug === advisor)?.slug ?? DEFAULT_ADVISOR;
  const all = pilotCatalogue(today);
  const catalogue = example === "lion-sands" ? { ...all, products: all.products.filter((p) => p.key === "lion-sands-ivory-lodge") } : all;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 pb-28 md:pb-20">
        <JourneyCheckout catalogue={catalogue} advisors={advisors} assignedAdvisor={assigned} advisorFromLink={Boolean(advisor && assigned === advisor)} detailDefault={view === "advisor"} exampleDefault={example === "1" || example === "lion-sands"} />
      </main>
    </>
  );
}
