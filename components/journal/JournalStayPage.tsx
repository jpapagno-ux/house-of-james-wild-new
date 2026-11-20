import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import JsonLd from "@/components/ledger/JsonLd";
import SaveToFolio from "@/components/booking-live/SaveToFolio";
import LiveHostPanel from "@/components/record/LiveHostPanel";
import CallingCard from "@/components/record/CallingCard";
import WhyFilm from "@/components/record/WhyFilm";
import RoomTypes from "@/components/stay/RoomTypes";
import { KIND as HOST_KIND } from "@/components/record/HostPanel";
import Signature from "@/components/record/Signature";
import IggiPanel from "@/components/iggi/IggiPanel";
import { whoPlansSchema } from "@/components/advisor/WhoPlans";
import type { ChartData } from "@/components/destination/LedgerChart";
import { CHART_COSTA_RICA } from "@/lib/charts/costa-rica";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import LIB_CHARTS from "@/lib/charts/countries.json";
import { FLAGS } from "@/lib/booking-live/flags";
import { IGGI_ON } from "@/lib/iggi/flag";
import { CHOSEN } from "@/lib/content/voice/chosen";
import { regionBySlug } from "@/lib/content/regions";
import { staysIn } from "@/lib/content/stays";
import { isBuilt } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";
import { graph, imageObject, lodging } from "@/lib/schema";
import { entryNo } from "@/lib/volumes";
import { day, journalStay, money, pct, span } from "@/lib/journal-style/stay";
import { JournalDetail, JournalExperiences, JournalHero, JournalJumpRow, JournalMap, JournalOffers, JournalOverview, JournalQuestions, JournalReserve, JournalRooms, Postcard, StickyBar } from "./journal-style";
import type { OfferRow } from "./JournalOffers";

// JWC-STYLE-01, Stages 1 to 9: the Modern Journal stay page, for the pilot's sample stays only (lib/journal-style/
// pages.json). It is reached through the flag or the ?journal=1 preview switch (next.config.ts rewrites); the live
// /stays/<slug> page and everything it uses are untouched. Reads the record through the existing loaders; the map,
// Iggi, the host panel, the save control and the enquiry link are the house's own components, used as they are.
const CHARTS: Record<string, ChartData> = { "costa-rica": CHART_COSTA_RICA, "south-africa": CHART_SOUTH_AFRICA };
const no = (n: number) => String(n).padStart(2, "0");

export default function JournalStayPage({ slug }: { slug: string }) {
  const v = journalStay(slug);
  if (!v) notFound();
  const { s, path, rates, offers, planHref } = v;
  const region = s.regionSlug ? regionBySlug(s.regionSlug) : undefined;
  const countryPath = region && s.countrySlug ? `/destinations/${region.slug}/${s.countrySlug}` : null;
  const trail = [{ name: "Home", path: "/" }, { name: "Stays", path: "/stays" }, ...(region && isBuilt(`/destinations/${region.slug}`) ? [{ name: region.name, path: `/destinations/${region.slug}` }] : []), ...(countryPath && isBuilt(countryPath) ? [{ name: s.country as string, path: countryPath }] : []), { name: s.name, path }];
  const chart = s.countrySlug ? CHARTS[s.countrySlug] ?? (LIB_CHARTS as unknown as Record<string, ChartData>)[s.countrySlug] : undefined;
  const hasMap = !!(s.coords && chart);

  // Savings (Stage 5): only what is live. The Ledger's own offers first, then the promotion printed on the rate card.
  const offerRows: OfferRow[] = [
    ...offers.map((o) => ({ key: o.id, eyebrow: o.program, headline: o.headline, dates: o.travel.text, terms: o.conditions ?? null, ref: `${o.id} · checked ${day(o.checked, true)}`, stamp: "Live" })),
    ...(rates?.promo ? [{ key: "rate-card", eyebrow: "On the rate card", headline: rates.promo, dates: rates.window ? `Read for ${span(rates.window.from, rates.window.to)}.` : null, terms: "Shown on every room ticket as a struck rate, as filed on the rate card.", ref: `Rate card · read ${day(rates.checked, true)}`, stamp: "Rate" }] : []),
  ];
  const heroOffer = offers[0] ? { headline: offers[0].headline, until: day(offers[0].travel.to, true), untilShort: day(offers[0].travel.to, true).replace(/ \d{4}$/, "") } : null;
  const basis = rates ? `per room, per night · before ${pct(rates.tax)} tax` : "";
  const fromLine = rates?.from ? <>{rates.promo && rates.from.now < rates.from.list && <><s>{money(rates.from.list)}</s>{" "}</>}From {money(rates.from.now)} per room, per night{rates.promo ? ` · ${rates.promo}` : ""}</> : s.ledgerId ?? undefined;

  // The reservation slip (Stage 8): a worked sample from the filed card, the first room, for the dates the card was read for.
  const r0 = rates?.rooms[0];
  const nights = rates?.window?.nights ?? 0;
  const slip = rates && r0 && rates.window && nights > 0 ? (() => {
    const gross = r0.list * nights, net = r0.now * nights, tax = Math.round(net * rates.tax * 100) / 100;
    return {
      fields: [["Arrive", day(rates.window.from)], ["Depart", day(rates.window.to)], ["Guests", "2 adults"], ["Room", r0.name]] as [string, string][],
      lines: [
        { label: `${nights} nights at ${money(r0.list)}`, value: money(gross) },
        ...(net < gross && rates.promo ? [{ label: `Saving · ${rates.promo}`, value: `−${money(gross - net)}`, saving: true }] : []),
        { label: `${s.country ?? "Local"} sales tax, ${pct(rates.tax)}`, value: money(tax) },
        { label: "Deposit due", value: "in your quote" },
      ],
      totalLabel: "Sample total, with tax", total: money(Math.round((net + tax) * 100) / 100),
      note: `Sample figures from the public rate card, read ${day(rates.checked, true)} and re-checked when you ask. ${s.name} is not on the house's live booking engine, so this button sends a request, not a payment.`,
    };
  })() : null;

  const steps = [
    { title: "Choose dates and guests", line: "Tell the house when, and who is travelling." },
    { title: "Choose your room", line: "Every room that fits your party, with its rate." },
    { title: "Read the quote", line: "Every tax and the deposit, before you commit to anything." },
    { title: "Request to reserve", line: `The house confirms with ${s.name} and writes back.` },
    ...(v.hostReady ? [{ title: "Or meet the host first", line: `One live call with the host and an advisor${v.host.host?.seats ? `, up to ${v.host.host.seats} of you` : ""}.` }] : []),
  ];
  const features = [
    ...(s.features.paras[0] ? [{ title: "Features", body: s.features.paras[0] }] : []),
    ...(s.facts.signature_experiences ? [{ title: "Signature experiences", body: s.facts.signature_experiences }] : []),
    ...(s.facts.who_its_for ? [{ title: "Who it is for", body: s.facts.who_its_for }] : []),
    ...(s.onlyHere.length ? [{ title: "Only here", body: s.onlyHere.join(" ") }] : []),
  ];
  const reasons = s.why.filter((w) => w.title).map((w) => ({ title: w.title as string, body: w.body }));

  // Sections are numbered in the order they print, so a dropped section never leaves a gap.
  let n = 0;
  const N = { rooms: rates ? no(++n) : "", exp: no(++n), detail: features.length || reasons.length ? no(++n) : "", offers: offerRows.length ? no(++n) : "", reserve: no(++n), map: hasMap ? no(++n) : "", questions: s.faqs.length ? no(++n) : "" };
  const jump: [string, string][] = [...(reasons.length ? [["Why we vetted it", "why"] as [string, string]] : []), ...(v.video ? [["Film", "film"] as [string, string]] : []), ...(rates || v.roomData ? [["Rooms", "rooms"] as [string, string]] : []), ["Experiences", "experiences"], ...(offerRows.length ? [["Offers", "offers"] as [string, string]] : []), ["Reserve", "reserve"], ...(v.hostReady ? [["Meet the host", "host"] as [string, string]] : []), ...(hasMap ? [["Map", "location"] as [string, string]] : []), ...(s.faqs.length ? [["Questions", "questions"] as [string, string]] : [])];
  const sign = CHOSEN["signoff-4"];

  return (
    <div className="journal-style bg-white">
      {/* the fixed bar sits over the foot of the window: give the footer room beneath it */}
      <style>{`footer.site-footer{padding-bottom:5.5rem}`}</style>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip bg-white">
        <JournalHero eyebrow={`Volume I · Stays${s.country ? ` · ${s.country}` : ""}`} name={s.name} place={s.country} tagline={s.tagline} frames={v.frames.map((f) => ({ url: f.url, alt: f.alt }))}
          film={v.heroFilm} watch={v.video ? { label: "Watch the film", href: "#film" } : null} offer={heroOffer} ledgerId={s.ledgerId} entry={entryNo(s.ledgerId) ?? null} credit={v.credit} cta={{ label: "Check your dates", href: "#reserve" }} save={<SaveToFolio slug={s.slug} name={s.name} inline />} whyHref="#why" />
        <JournalJumpRow items={jump} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>
          <div className="pt-12 md:pt-16 pb-20 md:pb-28 space-y-20 md:space-y-28">
            <JournalOverview quote={s.quote} lead={s.tagline} answer={v.answer} paragraphs={s.rooms.paras} photo={v.filed[1] ?? v.filed[0] ?? null} caption={s.name} ledgerId={s.ledgerId} reasons={v.whyShort}
              strip={[{ label: "Ledger ID", value: s.ledgerId ?? "Being filed", id: true }, ...(s.bestMonths ? [{ label: "Best months", value: s.bestMonths }] : []), ...(s.country ? [{ label: "Country", value: s.country }] : []), ...(s.airportDirections && s.airportDirections.length <= 90 ? [{ label: "Getting there", value: s.airportDirections }] : s.airport ? [{ label: "Airport", value: s.airport }] : [])]} />

            {/* the stay's longer film, with sound: the house's own player, unchanged, straight after the overview */}
            {v.video && <div className="[&>section]:!mt-0"><WhyFilm title={`${s.name}, on film`} blocks={[]} suited={[]} name={s.name} video={v.video} poster={v.slides[1]?.url ?? v.frames[0]?.url} planHref={planHref} hideEmptyFilm /></div>}

            {/* a stay whose rooms and rates are filed in the house's room record keeps the house's own rooms block, unchanged */}
            {v.roomData && <div className="[&>section]:!mt-0 [&>section]:!border-t-0 [&>section]:!pt-0"><RoomTypes name={s.name} data={v.roomData} quote={null} /></div>}

            {rates && <JournalRooms no={N.rooms} lede={v.roomsLede} basis={basis} promo={rates.promo} reserveHref="#reserve"
              rooms={rates.rooms.map((r) => ({ name: r.name, sleeps: r.sleeps, list: money(r.list), now: r.now < r.list ? money(r.now) : null, photo: r.photo }))}
              footnote={`Public rates for two adults${rates.window ? `, ${span(rates.window.from, rates.window.to)}` : ""}, before ${pct(rates.tax)} tax. Read ${day(rates.checked, true)} and re-checked when you ask.`}
              aside={offers[0] ? <p className="font-hand text-[24px] leading-snug text-graphite">{offers[0].headline}.{rates.promo ? " The two cannot be combined." : ""}</p> : undefined} />}

            <JournalExperiences no={N.exp} slug={s.slug} items={v.experiences} paragraphs={s.experiences.paras} />

            <JournalDetail no={N.detail} features={features} reasons={reasons} />

            <JournalOffers no={N.offers} name={s.name} offers={offerRows} applyHref="#reserve" />

            <JournalReserve no={N.reserve} steps={steps} slip={slip} reserve={{ label: "Request to reserve", href: planHref }} save={<SaveToFolio slug={s.slug} name={s.name} inline />}
              folio={FLAGS.save ? (
                <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-5 border-t border-[color:var(--jw-keyline)] pt-8">
                  <div><p className="font-mono text-[10px] tracking-[0.24em] uppercase text-stone-text">Not booking today</p><p className="font-display font-medium text-[26px] text-graphite mt-1">Keep {s.name} in your Folio</p></div>
                  <SaveToFolio slug={s.slug} name={s.name} />
                </div>
              ) : undefined} />

            {v.hostReady && <LiveHostPanel pageKey={`stay:${s.slug}`} initial={v.host} stayName={s.name} kind={s.category === "lodge" ? "lodge" : "stay"} className="" />}

            {hasMap && <JournalMap no={N.map} name={s.name} chart={chart as ChartData} pin={s.coords as { lat: number; lng: number }}
              others={(s.countrySlug ? staysIn(s.countrySlug) : []).filter((x) => x.coords && x.slug !== s.slug).map((x) => x.coords as { lat: number; lng: number })}
              rows={[...(s.airport ? [{ label: "Airport", value: s.airport }] : []), ...(s.airportDirections ? [{ label: "Transfer", value: s.airportDirections }] : []), ...(s.bestMonths ? [{ label: "Best months", value: s.bestMonths }] : [])]}
              note={s.bestMonthsNote} routes={v.routes.filter((r) => isBuilt(r.href))} />}

            {/* Iggi: the house's own panel, placed here as a field note; nothing about it is changed (and it stays off until its flag is on) */}
            {IGGI_ON && <IggiPanel ctx={{ entityType: "stay", entitySlug: s.slug, countrySlug: s.countrySlug ?? null, ledgerId: s.ledgerId ?? null, sourcePage: path, volume: s.volumes?.[0] ?? "stays" }} heading={`Ask Iggi about ${s.name}`} />}

            <JournalQuestions no={N.questions} name={s.name} faqs={s.faqs} schema={s.faqs.length > 0 && s.reviewed} />

            {sign && <Postcard line={sign} signature={<Signature className="w-28" />} place={s.country} ledgerId={s.ledgerId} postmark={s.country} />}

            <section aria-label="Plan with the house" className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-[color:var(--jw-keyline)] pt-10">
              <div><p className="font-mono text-[10px] tracking-[0.24em] uppercase text-stone-text">Every enquiry goes to the house</p><p className="font-display italic text-[30px] md:text-[34px] text-graphite mt-1">Let us plan your {s.country ? `${s.country} ` : ""}stay</p></div>
              <Link href={planHref} className="ledger-btn ledger-btn--house self-start md:self-center">Plan with James</Link>
            </section>
          </div>
        </div>
        {v.hostReady && <CallingCard who={HOST_KIND[s.category === "lodge" ? "lodge" : "stay"].who} seats={v.host.host?.seats} />}
      </main>

      <StickyBar id="record-bar" title={s.name} note={fromLine} label={`Reserve ${s.name}`}
        links={<><SaveToFolio slug={s.slug} name={s.name} inline /><Link href={planHref} className="ledger-btn-ghost">Speak with an advisor</Link></>}
        action={<a href="#reserve" className="ledger-btn ledger-btn--house ledger-btn--compact">Check your dates</a>} />

      <JsonLd data={graph({
        ...lodging({ path, name: s.name, description: v.answer, image: (v.slides.length ? v.slides : v.filed).slice(0, 5).map((i) => { const u = i.url.startsWith("/") ? absoluteUrl(i.url) : i.url; return v.credit ? imageObject(u, i.alt, v.credit) : u; }), subtype: s.category === "resort" ? "Resort" : s.category === "hotel" ? "Hotel" : "LodgingBusiness", country: s.country ?? undefined, geo: s.coords ?? undefined, ledgerId: s.ledgerId ?? undefined }),
        ...whoPlansSchema({ ledgerId: s.ledgerId, countrySlug: s.countrySlug ?? null, regionSlug: s.regionSlug ?? null }),
        ...(offers.length ? { makesOffer: offers.map((o) => ({ "@type": "Offer", name: `${o.headline}: ${o.name}`, description: o.conditions ?? o.headline, validFrom: o.travel.from, validThrough: o.travel.to, url: absoluteUrl(`${path}#offers`), offeredBy: { "@type": "TravelAgency", name: "James Wild & Co", url: absoluteUrl("/") } })) } : {}),
        ...(v.suited.length ? { audience: v.suited.map((t) => ({ "@type": "PeopleAudience", audienceType: t })), keywords: [s.name, s.country, ...v.suited].filter(Boolean).join(", ") } : {}),
      })} />
    </div>
  );
}
