import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import JourneyCheckout from "@/components/checkout/JourneyCheckout";
import { pilotCatalogue } from "@/lib/checkout/pilot";
import { ADVISORS, DEFAULT_ADVISOR } from "@/lib/content/advisors";
import { buildMetadata } from "@/lib/seo";

// Journey Cart preview (Booking & Checkout Studio, Session 03, 15 Nov 2026).
// Seven screens, three pilot products, simulated payment. Preview deployments only: never indexed,
// never linked from the site, and a 404 in Production.
export const dynamic = "force-dynamic";
export const metadata = buildMetadata({ title: "Journey Cart (preview)", description: "Preview of the James Wild & Co Journey Cart and checkout. Simulation only.", path: "/preview/journey-cart", noindex: true });

export default async function JourneyCartPreview({ searchParams }: { searchParams: Promise<{ advisor?: string }> }) {
  if (process.env.VERCEL_ENV === "production") notFound();
  const { advisor } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const advisors = ADVISORS.filter((a) => !a.sample).map((a) => ({ slug: a.slug, name: a.name, role: a.role, ledgerId: a.ledgerId }));
  const assigned = advisors.find((a) => a.slug === advisor)?.slug ?? DEFAULT_ADVISOR;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 pb-28 md:pb-20">
        <JourneyCheckout catalogue={pilotCatalogue(today)} advisors={advisors} assignedAdvisor={assigned} advisorFromLink={Boolean(advisor && assigned === advisor)} />
      </main>
    </>
  );
}
