import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import SiteHeader from "@/components/ledger/SiteHeader";
import LiveRatesBand from "@/components/record/LiveRatesBand";
import { GlanceBar, LocationBlock, RecordActionBar } from "@/components/record/Frame";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import { zaOthers } from "@/lib/content/preview/za-ledger";
import { CardRail, FounderStamp, Overview, PreviewNote, RecordHero, RecordNav, RoomsLedger, WhyChose, type Room } from "@/components/record/Sections";
import { buildMetadata } from "@/lib/seo";

// Preview of the STAY template with LIVE PRICING, on Leeu Estates
// (STY-2026-000148, Franschhoek). Record text, rooms and registry "from"
// prices are the library's Stay and Room records. The live band is a real
// snapshot of the Wild Earth Stays booking engine (Tag Albie), property
// leeu-estates-resorts, fetched 24 Oct 2026 for 17–20 Nov 2026, 2 guests.

export const metadata = buildMetadata({ title: "Leeu Estates, Franschhoek: Live Rates (preview)", description: "Preview of a stay page with live booking-engine pricing.", path: "/preview/stay/leeu-estates", noindex: true });

const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474";
const ZAR = { currency: "ZAR" as const };

const ROOMS: Room[] = [
  { name: "Classic Room", image: `${CDN}/6a8a306975e3ac54f420f9f2_6a234d2df3a0f3e6b205a170_60264abb94eb7-01%25402x.jpeg`, price: 16500, ...ZAR },
  { name: "Deluxe Room", image: `${CDN}/6a8a306a7ef954f18e860975_6a234d8bb36287e49f9d2f93_60264b095a605-01%25402x.jpeg`, price: 18500, ...ZAR },
  { name: "Studio Room", image: `${CDN}/6a8a2b699caa72f1f26b085f_6a863106-6a234e07915b1554b8aaba19_6343ec2f4ab03-01.jpeg`, sleeps: "1–2", beds: "1 queen bed", price: 23000, ...ZAR, live: true },
  { name: "Executive Suite", image: `${CDN}/6a8a306bffa80d7c6245b1f2_6a234ea74b5f9b67c1f6e568_60264c186db9b-01%25402x.jpeg`, price: 29500, ...ZAR },
  { name: "Executive Suite with Terrace", image: `${CDN}/6a8a306d7ef954f18e860b13_6a234efb1244f64fc6d34818_63737bf653d99-02.jpeg`, price: 35000, ...ZAR },
  { name: "Manor House Suite", image: `${CDN}/6a8a3071aefdfff15877cc94_6a23505d419faca227cd0bdf_63739572dc39d-01%2520(8).jpeg`, price: 42000, ...ZAR },
];
const WHOLE = { basis: "whole cottage or house, per night", ...ZAR };
const HOUSES: Room[] = [
  { name: "Terroir Cottage", image: `${CDN}/6a8a3078a7b9defbda1512d9_6a234fb9fea507fcd5a18c13_Leeu%2520Estates%2520-%2520Terroir%2520Cottage%2520(9)%25402x.jpeg`, price: 39000, ...WHOLE },
  { name: "The Oaks", image: `${CDN}/6a8a307b75e3ac54f42101ee_6a2350b9afc2c21897f6e450_60be20f54a24b-01%25402x.jpeg`, price: 45000, ...WHOLE },
  { name: "Fynbosch Cottage", image: `${CDN}/6a8a306f45c069bead8c279c_6a23515de7cacc184c573628_602a88ecaa322-04%25402x.jpeg`, price: 51000, ...WHOLE },
  { name: "Vineyard Cottage", image: `${CDN}/6a8a307ce1fc7cdb75a158db_6a2351c599cf14202bb313e2_60225997c5c65-01%25402x.jpeg`, price: 53500, ...WHOLE },
  { name: "Cellar Cottage", image: `${CDN}/6a8a3068ffa80d7c6245b039_6a23522cf01fd4077e015fb9_6026631591db3-01%25402x.jpeg`, price: 53500, ...WHOLE },
  { name: "Max House", image: `${CDN}/6a8a3072fd4a464888c77fe6_6a2352b5a3ba6f86cd276895_63440151584f6-01%2520(3).jpeg`, price: 62500, ...WHOLE },
  { name: "Protea House", image: `${CDN}/6a8a3075cde8ad4e63d9cad0_6a23534aedffd313268a6846_6229c3d7be399-04.jpeg`, price: 70000, ...WHOLE },
];


export default function LeeuEstatesPreview() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <RecordHero
          image={{ url: `${B44}/9cf531c35_a37c8b73b_69d153067a3dcbb4cc167d9d_6d3a1ea3.webp`, alt: "Leeu Estates: the manor house and gardens beneath the Franschhoek mountains" }}
          eyebrow="Wild & Co Stays · Franschhoek Valley · Western Cape · STY-2026-000148"
          title="Leeu Estates"
          tagline="Where vineyard luxury, culinary excellence, and meaningful escape meet beneath the mountains of the Cape Winelands."
          stamp={<FounderStamp kind="Founder inspected" year={2026} size={140} />}
          glance={<GlanceBar glance={{ price: { amount: "US$1,589", basis: "live · per night, 17–20 Nov · Studio Room" }, facts: [["Best months", "October to April"], ["The estate", "Rooms, suites & whole houses"], ["Fly into", "Cape Town (CPT) · 55 min"]], cta: { label: "Check live rates", href: "#live-rates" } }} />}
        />
        <RecordNav items={[["Why we chose it", "why"], ["Live rates", "live-rates"], ["Rooms", "rooms"], ["Cottages & houses", "houses"], ["Location", "location"], ["The collection", "collection"]]} cta="Check live rates" />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Stays", path: "/stays" }, { name: "South Africa", path: "/destinations/africa/south-africa" }, { name: "Leeu Estates", path: "/stays/leeu-estates" }]} /></div>
          <Overview
            quote="Come for the wine. Stay for the stillness. Leave transformed by the landscape."
            answer="Leeu Estates is a vineyard estate in the Franschhoek Valley, about 55 minutes from Cape Town airport, with rooms and suites in the manor and whole cottages and houses for families. James inspected it in May 2026. Best October to April. Live rates come straight from the booking engine for your dates."
            facts={[["Ledger ID", "STY-2026-000148"], ["Type", "Vineyard estate · rooms, suites, cottages, houses"], ["Founder", "Inspected & approved · May 2026"], ["Rates", "Live from the booking engine"]]}
          />
          <WhyChose
            title="Escape into the Heart of the Winelands"
            status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">Founder inspected · 2026</span> · James visited every Leeu Estates property in May 2026</p>}
            blocks={[
              { title: "Luxury without excess", body: "The estate blends award-winning gastronomy, curated wine experiences, contemporary art, wellness and the landscape into one seamless stay." },
              { title: "Best for", body: "Honeymoon and couples · wellness · solo travellers · conservation and eco mindfulness · family and generational · food and wine." },
              { title: "Rooms to whole houses", body: "Classic rooms through executive suites in the manor, and cottages and houses taken whole for the family." },
            ]}
          />
          <LiveRatesBand property="leeu-estates-resorts" name="Leeu Estates" />
          <RoomsLedger id="rooms" title="Rooms & Suites in the Manor" intro="Every room category on file with its registry “from” price. The live mark shows the room the engine priced for the search above." rooms={ROOMS} footnote="Registry “from” prices are in South African rand (ZAR) per room, per night. The live band above quotes the engine in US dollars for your exact dates." />
          <RoomsLedger id="houses" eyebrow="Taken whole · Gatherings" title="Cottages & Houses for the Family" rooms={HOUSES} icon="tree-ring" footnote="Whole-property rates in ZAR per night. Bedrooms and sleeping plans are confirmed with your quote." />
          <LocationBlock chart={CHART_SOUTH_AFRICA} name="Leeu Estates" pin={{ lat: -33.9156, lng: 19.1127 }} others={zaOthers("Leeu Estates")} heading="Franschhoek, Cape Winelands"
            rows={[["Area", "Franschhoek Valley, Western Cape, South Africa"], ["Coordinates", "33° 54′ 56″ S, 19° 06′ 46″ E"], ["Airport", "Cape Town International (CPT)"], ["Getting there", "About 55 minutes by road from Cape Town airport."]]} note="Faint pins are the other stays in the Ledger in South Africa." />
          <CardRail id="collection" eyebrow="More from the Leeu Collection" title="The Rest of the Collection" cards={[
            { name: "Leeu House", href: "/stays/leeu-house", image: `${B44}/ae294f982_cc67a2d17_6a230a0a714287d73d103c0e_5fdc91f8cde8e-Header.jpg`, meta: "Franschhoek village", line: "A handful of rooms with the village at the door." },
            { name: "Le Quartier Français", href: "/stays/le-quartier-francais", meta: "Franschhoek", line: "The original Leeu house in the village." },
          ]} />
          <PreviewNote>
            <p>The live band reads the booking engine (Tag Albie) through /api/rates for the dates and party the guest picks, cached 15 minutes. It opens 45 days out for 3 nights, 2 adults.</p>
            <p>Library fixes: room prices are mixed (ZAR on most, one Studio Room record in USD at 1,387, a duplicate). The founder status (inspected, May 2026) needs setting on the record so the stamp is drawn from the Ledger. Le Quartier Français has no image on file in this preview.</p>
          </PreviewNote>
        </div>
      </main>
      <RecordActionBar price="US$1,589" basis="/ night, live" cta="Live rates" />
    </>
  );
}
