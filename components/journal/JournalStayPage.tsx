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
import Inclusions from "@/components/booking/Inclusions";
import BookingPanel from "@/components/booking/BookingPanel";
import RateCardSection from "@/components/booking/RateCardSection";
import LiveRatesBand from "@/components/record/LiveRatesBand";
import { PRICED } from "@/lib/content/priced-stays";
import { cardFor } from "@/lib/content/rate-cards";
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
import { day, journalStay, money, pct, span, SECTION_LABEL, SECTION_ORDER, type SectionKey } from "@/lib/journal-style/stay";
import { JournalDetail, JournalExperiences, JournalHero, JournalJumpRow, JournalMap, JournalOffers, JournalOverview, JournalQuestions, JournalReserve, JournalRooms, Postcard, SectionHead, StickyBar, PhotoViewer, PhotoLink, PhotoStrip, DatesBar, PickRoom, RequestForm } from "./journal-style";
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
  const fromLine = rates?.from ? <>{rates.promo && rates.from.now < rates.from.list && <span className="hidden sm:inline"><s>{money(rates.from.list)}</s>{" "}</span>}From {money(rates.from.now)}<span className="hidden sm:inline"> per room, per night{rates.promo ? ` · ${rates.promo}` : ""}</span><span className="sm:hidden"> a night</span></> : s.ledgerId ?? undefined;

  // The reservation slip (Stage 8): a worked sample from the filed card, the first room, for the dates the card was read for.
  // Rule 12: a stay that can be booked today keeps that path, through the house's own booking components and links,
  // exactly as the stay page uses them. Nothing here changes booking or checkout; it only places what exists.
  const priced = s.engine ? PRICED[s.slug] : undefined;
  const hostHref = v.hostReady ? "#host" : undefined;
  const live = FLAGS.quotes ? (
    <div className="flex flex-wrap items-center gap-4"><Link href={`/booking/property/${s.slug}`} className="ledger-btn ledger-btn--house">Check availability</Link><p className="text-[13.5px] text-stone-text">Live rates and rooms for your dates.</p></div>
  ) : priced ? (
    <><Inclusions name={s.name} included={priced.included} excluded={priced.excluded} policies={priced.policies} /><BookingPanel hostHref={hostHref} property={s.engine as string} name={s.name} rooms={priced.rooms} included={priced.included} excluded={priced.excluded} policies={priced.policies} /></>
  ) : s.engine ? (
    <LiveRatesBand property={s.engine} name={s.name} />
  ) : cardFor(`stay:${s.slug}`) ? (
    <RateCardSection pageKey={`stay:${s.slug}`} name={s.name} photo={s.hero as string} hostHref={hostHref} />
  ) : null;
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
    { title: "Request these dates", line: `The house confirms with ${s.name} and writes back with a quote.` },
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
  const jump: [string, string][] = [...(reasons.length ? [["Why we vetted it", "why"] as [string, string]] : []), ...(v.video ? [["Film", "film"] as [string, string]] : []), ...(rates || v.roomData || s.rooms.paras.length || s.rooms.items.length ? [["Rooms", "rooms"] as [string, string]] : []), ["Experiences", "experiences"], ...(offerRows.length ? [["Offers", "offers"] as [string, string]] : []), ["Reserve", "reserve"], ...(v.hostReady ? [["Meet the host", "host"] as [string, string]] : []), ...(hasMap ? [["Map", "location"] as [string, string]] : []), ...(s.faqs.length ? [["Questions", "questions"] as [string, string]] : [])];
  const sign = CHOSEN["signoff-4"];
  const inSection = (k: SectionKey) => v.photos.filter((p) => p.section === k);
  const roomNames = rates ? rates.rooms.map((r) => r.name) : v.roomData?.rooms.map((r) => r.name) ?? [];
  const strip = (k: SectionKey, label: string) => { const list = inSection(k); return list.length ? <PhotoStrip tab={k} photos={list.map((p) => ({ url: p.url, alt: p.alt }))} total={list.length} label={label} /> : null; };

  return (
    <div className="journal-style bg-white">
      {/* the fixed bar sits over the foot of the window: give the footer room beneath it */}
      <style>{`footer.site-footer{padding-bottom:5.5rem}aside[aria-label="Meet them before you book"]{bottom:calc(88px + env(safe-area-inset-bottom))!important}`}</style>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip bg-white">
        <JournalHero eyebrow={`Volume I · Stays${s.country ? ` · ${s.country}` : ""}`} name={s.name} place={s.country} tagline={s.tagline} frames={v.frames.map((f) => ({ url: f.url, alt: f.alt }))}
          film={v.heroFilm} watch={v.video ? { label: "Watch the film", href: "#film" } : null} offer={heroOffer} ledgerId={s.ledgerId} entry={entryNo(s.ledgerId) ?? null} credit={v.credit} cta={{ label: "Check your dates", href: "#reserve" }} save={<SaveToFolio slug={s.slug} name={s.name} inline />} whyHref="#why" photoCount={v.photos.length} />
        <JournalJumpRow items={jump} extra={v.photos.length > 1 ? <PhotoLink>Photos ({v.photos.length})</PhotoLink> : undefined} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>
          <div className="pt-12 md:pt-16 pb-20 md:pb-28 space-y-20 md:space-y-28">
            <JournalOverview quote={s.quote} lead={s.tagline} answer={v.answer} paragraphs={s.rooms.paras} photo={v.filed[1] ?? v.filed[0] ?? null} caption={s.name} ledgerId={s.ledgerId} reasons={v.whyShort}
              strip={[{ label: "Ledger ID", value: s.ledgerId ?? "Being filed", id: true }, ...(s.bestMonths ? [{ label: "Best months", value: s.bestMonths }] : []), ...(s.country ? [{ label: "Country", value: s.country }] : []), ...(s.airportDirections && s.airportDirections.length <= 90 ? [{ label: "Getting there", value: s.airportDirections }] : s.airport ? [{ label: "Airport", value: s.airport }] : [])]} />

            {/* the stay's longer film, with sound: the house's own player, unchanged, straight after the overview */}
            {v.video && <div className="[&>section]:!mt-0"><WhyFilm title={`${s.name}, on film`} blocks={[]} suited={[]} name={s.name} video={v.video} poster={v.slides[1]?.url ?? v.frames[0]?.url} planHref={planHref} hideEmptyFilm /></div>}

            {/* a stay whose rooms and rates are filed in the house's room record keeps the house's own rooms block, unchanged */}
            {/* a record with room text but no room list or rate on file: the text, the dates bar, and the rate on enquiry */}
            {!rates && !v.roomData && (s.rooms.paras.length > 0 || s.rooms.items.length > 0) && (
              <section id="rooms" aria-label="Rooms" className="bg-white">
                <SectionHead label="Rooms" title="Where You'll Sleep" />
                {s.rooms.paras.length > 0 && <div className="mt-6 max-w-3xl space-y-4 text-[16px] leading-relaxed text-graphite">{s.rooms.paras.map((t) => <p key={t}>{t}</p>)}</div>}
                {s.rooms.items.length > 0 && <ul className="mt-6 max-w-3xl border-t border-[color:var(--jw-keyline)]">{s.rooms.items.map((t) => <li key={t} className="border-b border-[color:var(--jw-hairline)] py-3 font-display text-[19px] text-graphite">{t}</li>)}</ul>}
                <p className="mt-5 font-mono text-[10.5px] tracking-[0.22em] uppercase text-stone-text">Rate on enquiry · the house confirms it for your dates</p>
                <DatesBar slug={s.slug} reserveHref="#reserve" />
                {inSection("rooms").length > 0 && <p className="mt-6"><PhotoLink tab="rooms">See all {inSection("rooms").length} room photographs</PhotoLink></p>}
              </section>
            )}
            {v.roomData && <div className="[&>section]:!mt-0 [&>section]:!border-t-0 [&>section]:!pt-0"><RoomTypes name={s.name} data={v.roomData} quote={null} /><DatesBar slug={s.slug} reserveHref="#reserve" />{inSection("rooms").length > 0 && <p className="mt-6"><PhotoLink tab="rooms">See all {inSection("rooms").length} room photographs</PhotoLink></p>}</div>}

            {rates && <JournalRooms no={N.rooms} lede={v.roomsLede} basis={basis} promo={rates.promo} reserveHref="#reserve"
              bar={<DatesBar slug={s.slug} reserveHref="#reserve" />} photos={inSection("rooms").length > 0 ? <PhotoLink tab="rooms">See all {inSection("rooms").length} room photographs</PhotoLink> : undefined}
              rooms={rates.rooms.map((r) => ({ name: r.name, sleeps: r.sleeps, list: money(r.list), now: r.now < r.list ? money(r.now) : null, photo: r.photo, action: <PickRoom slug={s.slug} room={r.name} reserveHref="#reserve" /> }))}
              footnote={`Public rates for two adults${rates.window ? `, ${span(rates.window.from, rates.window.to)}` : ""}, before ${pct(rates.tax)} tax. Read ${day(rates.checked, true)} and re-checked when you ask.`}
              aside={offers[0] ? <p className="font-hand text-[24px] leading-snug text-graphite">{offers[0].headline}.{rates.promo ? " The two cannot be combined." : ""}</p> : undefined} />}

            <JournalExperiences no={N.exp} slug={s.slug} items={v.experiences} paragraphs={s.experiences.paras}>{strip("experiences", "experience photographs")}</JournalExperiences>

            <JournalDetail no={N.detail} features={features} reasons={reasons}>{strip("pool", "pool and beach photographs") ?? strip("exterior", "photographs of the grounds")}</JournalDetail>

            <JournalOffers no={N.offers} name={s.name} offers={offerRows} applyHref="#reserve" />

            <JournalReserve no={N.reserve} steps={steps} slip={slip} live={live} reserve={{ label: "Plan a trip around it", href: planHref }} form={<RequestForm slug={s.slug} name={s.name} path={path} rooms={roomNames} />} save={<SaveToFolio slug={s.slug} name={s.name} inline />}
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

      <PhotoViewer slug={s.slug} name={s.name} photos={v.photos} sections={SECTION_ORDER.map((k) => ({ key: k, label: SECTION_LABEL[k] }))} credit={v.credit} reserveHref="#reserve" />

      <StickyBar id="record-bar" title={s.name} note={fromLine} label={`Reserve ${s.name}`}
        links={<><SaveToFolio slug={s.slug} name={s.name} inline /><Link href={planHref} className="ledger-btn-ghost">Speak with an advisor</Link></>}
        action={<a href="#reserve" className="ledger-btn ledger-btn--house ledger-btn--compact">Check<span className="hidden sm:inline">&nbsp;your</span>&nbsp;dates</a>} />

      <JsonLd data={graph({
        ...lodging({ path, name: s.name, description: v.answer, image: v.photos.slice(0, 24).map((i) => { const u = i.url.startsWith("/") ? absoluteUrl(i.url) : i.url; return v.credit ? imageObject(u, i.alt, v.credit) : u; }), subtype: s.category === "resort" ? "Resort" : s.category === "hotel" ? "Hotel" : "LodgingBusiness", country: s.country ?? undefined, geo: s.coords ?? undefined, ledgerId: s.ledgerId ?? undefined }),
        ...whoPlansSchema({ ledgerId: s.ledgerId, countrySlug: s.countrySlug ?? null, regionSlug: s.regionSlug ?? null }),
        ...(offers.length ? { makesOffer: offers.map((o) => ({ "@type": "Offer", name: `${o.headline}: ${o.name}`, description: o.conditions ?? o.headline, validFrom: o.travel.from, validThrough: o.travel.to, url: absoluteUrl(`${path}#offers`), offeredBy: { "@type": "TravelAgency", name: "James Wild & Co", url: absoluteUrl("/") } })) } : {}),
        ...(v.suited.length ? { audience: v.suited.map((t) => ({ "@type": "PeopleAudience", audienceType: t })), keywords: [s.name, s.country, ...v.suited].filter(Boolean).join(", ") } : {}),
      })} />
    </div>
  );
}
