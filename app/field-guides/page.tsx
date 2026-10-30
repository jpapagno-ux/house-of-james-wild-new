import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import GuideOffer from "@/components/guides/GuideOffer";
import JsonLd from "@/components/ledger/JsonLd";
import { FIELD_GUIDES } from "@/lib/content/field-guides";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /field-guides: every house field guide in one place, each free for an email address.
// The same cards sit on the country, guide, region and route pages each guide belongs to.
// Noindex until James signs off the copy.
const PATH = "/field-guides";
export const metadata = buildMetadata({
  title: "Free Travel Field Guides: Costa Rica, Galápagos, Indonesia and More",
  description: "James Wild & Co field guides to download or print, free: Costa Rica, Belize, the Galápagos, Indonesia, Raja Ampat and Komodo, Iceland and Greenland. Full guides and four-page quick guides.",
  path: PATH,
  noindex: true,
});

export default function FieldGuidesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Field guides", path: PATH }]} /></div>
          <header className="max-w-2xl">
            <p className="ledger-eyebrow ledger-crimson">The house field guides</p>
            <h1 className="ledger-display text-[2.3rem] leading-[1.1] md:text-[3.3rem] mt-3">Field Guides, Free to Keep</h1>
            <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed" data-aeo="answer">James Wild &amp; Co publishes {FIELD_GUIDES.length} free field guides: {FIELD_GUIDES.map((g) => g.place).join(", ")}. Each comes as a full guide and, for most places, a four-page quick guide, to download, print or keep on your phone. Add your email address and the guide opens.</p>
          </header>
          <ul className="mt-10 grid gap-6 lg:grid-cols-2">
            {FIELD_GUIDES.map((g) => <li key={g.key}><GuideOffer guide={g} source="field-guides" variant="compact" className="h-full" /></li>)}
          </ul>
          <p className="mt-10 text-[15px] ledger-muted">Want it planned rather than read? <Link href="/plan" className="underline underline-offset-4">Plan it with James</Link>.</p>
        </div>
      </main>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "James Wild & Co field guides", hasPart: FIELD_GUIDES.map((g) => ({ "@type": "DigitalDocument", name: `${g.edition ? `${g.edition}: ` : ""}${g.title}`, about: { "@type": "Place", name: g.place }, encodingFormat: "application/pdf", isAccessibleForFree: true, ...(g.full.pages ? { numberOfPages: g.full.pages } : {}), publisher: { "@type": "Organization", name: "James Wild & Co" } })) })} />
    </>
  );
}
