import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Plane, Users } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import HostPanel, { type Host } from "@/components/record/HostPanel";
import { FieldIcon } from "@/components/ledger/FieldIcon";
import { buildMetadata } from "@/lib/seo";

// Preview of the stay template's Meet Your Host panel (step 9), on Morukuru
// Farm House (STY-2026-950299, Madikwe). Record facts are from the Ledger;
// the host (Rinse) and topics are from the Base44 host sample. No headshot is
// on file yet, so the portrait shows initials; the Calendly link is the
// sample placeholder. The lower band shows the other two switch states.

export const metadata = buildMetadata({
  title: "Morukuru Farm House, Madikwe: Meet Your Host (preview)",
  description: "Preview of the Meet Your Host panel on a James Wild & Co stay page.",
  path: "/preview/stay-host",
  noindex: true,
});

const B44 = "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474";
const STAY = {
  name: "Morukuru Farm House",
  ledgerId: "STY-2026-950299",
  place: "Madikwe Game Reserve · South Africa",
  tagline: "Experience the wild in exclusive comfort at Morukuru Farm House",
  quote: "At Morukuru Farm House, we invite you to experience the African bush as your own, with the freedom to create unforgettable memories in a setting that feels like home.",
  hero: { src: `${B44}/293f3bdae_2f3e395df_68ae14d4259cf380a761ef79_lunch-outside-on-the.jpg`, alt: "Lunch laid outside on the deck at Morukuru Farm House, Madikwe" },
  room: { name: "Private Residence", beds: "5-bedroom residence, taken exclusively", src: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6840fb6086586e63fc64ae83_Morukuru%20Farm%20House%20-%20viewing%20deck%20(2).webp", alt: "The viewing deck at Morukuru Farm House" },
  bestMonths: "March to May",
  airports: "O.R. Tambo (JNB) · Lanseria (HLA)",
};

const HOST: Host = {
  name: "Rinse",
  role: "Stay Host · Morukuru Farm House",
  photo: null,
  bio: "Rinse knows the house and the reserve day to day, so questions about the rooms, the guiding, the dining and your days in Madikwe are answered first-hand.",
  calendlyUrl: "https://calendly.com/jameswildco/meet-your-host",
  metInPerson: null,
  topics: [
    "Taking the house exclusively: five bedrooms for up to ten guests, with your own guide, tracker, chef and butler.",
    "Days in Madikwe: Big Five drives in your own vehicle, at your pace, out early, late or not at all.",
    "Bush walks for every age, including shorter walks inside the grounds for children.",
    "Boma dinners, cooking with the chef, treatments on the deck and a night in the bush hide.",
    "Getting to Madikwe, a malaria-free reserve, and how the arrival shapes the journey.",
    "Rates, stay-longer offers and availability for your dates.",
  ],
};

const SECTIONS = ["Overview", "Rooms", "Experiences", "Meet your host", "Rates", "Map", "FAQ"];

export default function StayHostPreview() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <section className="relative h-[78svh] min-h-[560px] overflow-hidden bg-ink text-white" aria-label={STAY.name}>
          <Image src={STAY.hero.src} alt={STAY.hero.alt} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/75" />
          <div className="pointer-events-none absolute inset-3 md:inset-5 border border-white/25" aria-hidden="true" />
          <div className="relative h-full max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pb-14">
            <p className="ledger-eyebrow !text-white/85">{STAY.place} · {STAY.ledgerId}</p>
            <h1 className="ledger-display text-5xl md:text-7xl mt-3">{STAY.name}</h1>
            <p className="ledger-display italic text-xl md:text-2xl text-white/90 mt-2 max-w-2xl">{STAY.tagline}</p>
          </div>
          <div id="hero-end" className="absolute bottom-0" />
        </section>

        {/* Record sub-navigation */}
        <nav aria-label="On this page" className="border-b ledger-rule bg-paper sticky top-[72px] z-30">
          <div className="max-w-ledger mx-auto px-5 md:px-10 h-12 flex items-center gap-6 overflow-x-auto whitespace-nowrap">
            {SECTIONS.map((s) => (
              <a key={s} href={s === "Meet your host" ? "#host" : `#${s.toLowerCase()}`} className={`ledger-eyebrow hover:ledger-crimson ${s === "Meet your host" ? "ledger-crimson border-b border-crimson pb-0.5" : ""}`}>{s}</a>
            ))}
            <Link href="/plan" className="ml-auto ledger-btn !h-8 !px-4">Enquire</Link>
          </div>
        </nav>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <section id="overview" className="pt-12 grid md:grid-cols-[1.4fr_1fr] gap-10 items-start scroll-mt-32">
            <p className="ledger-display italic text-2xl md:text-3xl leading-snug">&ldquo;{STAY.quote}&rdquo;</p>
            <dl className="border-t ledger-rule text-[15px]">
              <div className="flex justify-between gap-4 py-2.5 border-b ledger-rule"><dt className="ledger-eyebrow pt-1 flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Best months</dt><dd>{STAY.bestMonths}</dd></div>
              <div className="flex justify-between gap-4 py-2.5 border-b ledger-rule"><dt className="ledger-eyebrow pt-1 flex items-center gap-2"><Plane className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Fly into</dt><dd className="text-right">{STAY.airports}</dd></div>
              <div className="flex justify-between gap-4 py-2.5 border-b ledger-rule"><dt className="ledger-eyebrow pt-1 flex items-center gap-2"><Users className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Sleeps</dt><dd>Up to 10, exclusively</dd></div>
            </dl>
          </section>

          <section id="rooms" className="mt-14 border-t ledger-rule pt-8 scroll-mt-32" aria-labelledby="rooms-heading">
            <div className="flex items-center gap-3">
              <FieldIcon name="tree-ring" height={28} className="ledger-crimson" />
              <h2 id="rooms-heading" className="ledger-display text-2xl md:text-3xl">Rooms &amp; suites</h2>
            </div>
            <div className="mt-6 grid sm:grid-cols-[1.2fr_1fr] gap-6 items-center ledger-paper border ledger-border">
              <div className="relative aspect-[16/10]"><Image src={STAY.room.src} alt={STAY.room.alt} fill sizes="(min-width: 640px) 600px, 100vw" className="object-cover" /></div>
              <div className="p-6">
                <p className="ledger-display text-2xl">{STAY.room.name}</p>
                <p className="mt-2 text-[15px] ledger-muted">{STAY.room.beds}</p>
                <p className="mt-4 ledger-eyebrow">Rates · live from the registry, at enquiry</p>
              </div>
            </div>
          </section>

          {/* Meet Your Host: the "available" state */}
          <div className="mt-16 md:mt-20 border-t ledger-rule pt-10">
            <HostPanel state="available" host={HOST} stayName={STAY.name} />
          </div>

          {/* Preview only: the other two switch states */}
          <section className="mt-20 border border-dashed border-crimson/50 p-5 md:p-8" aria-label="Preview of the other host states">
            <p className="ledger-eyebrow ledger-crimson">Preview only · the same panel when the switch is set differently</p>
            <div className="mt-6 grid lg:grid-cols-2 gap-6 items-start">
              <div>
                <p className="ledger-eyebrow mb-3">Switch: not linking yet (partner hasn&rsquo;t approved)</p>
                <HostPanel state="not_linking" stayName={STAY.name} />
              </div>
              <div>
                <p className="ledger-eyebrow mb-3">Switch: off (no host on file)</p>
                <div className="border ledger-border p-6 md:p-8 text-[15px] ledger-muted">
                  No host panel is shown. The page keeps its sticky <span className="text-ink">Enquire</span> button, the Plan with James invitation in the footer and the mobile action bar.
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
