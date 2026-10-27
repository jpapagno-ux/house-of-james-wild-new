import Image from "next/image";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import SessionCard from "@/components/workshops/SessionCard";
import { WORKSHOP_COPY as W, WORKSHOPS_PATH as PATH, recordings, upcoming, type Session } from "@/lib/content/workshops";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /workshops: House Sessions. Hero › in short › the two routes (House
// Sessions for everyone, the Advisor Desk for the trade) › the season ahead
// (or an honest "dates post here first") › recordings › how it works ›
// planning calls › FAQ. Each session links to the stay, ship or route it's
// about. Event schema only for sessions that have a date.

const HERO = { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_3200/q_auto:best/f_jpg/wildco/south-africa/monwana-thornybush/monwana-fire-pit", alt: "Guests gathered around the fire pit at Monwana under the night sky" };

export const metadata = buildMetadata({ title: W.seoTitle, description: W.description, path: PATH, image: HERO, noindex: true });

function eventSchema(s: Session) {
  return {
    "@type": "EducationEvent",
    "@id": absoluteUrl(`${PATH}#${s.slug}`),
    name: s.title,
    description: s.description,
    startDate: s.start,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    isAccessibleForFree: true,
    location: { "@type": "VirtualLocation", url: s.registerUrl ?? absoluteUrl(PATH) },
    image: [s.image.url],
    organizer: { "@id": ids.house },
    performer: s.hosts.map((name) => ({ "@type": "Person", name })),
    about: s.about.map((a) => ({ "@type": "Thing", name: a.name, url: absoluteUrl(a.href) })),
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD", availability: "https://schema.org/InStock", url: s.registerUrl ?? absoluteUrl(PATH) },
  };
}

function Route({ r, cta }: { r: typeof W.public; cta: React.ReactNode }) {
  return (
    <section className="ledger-paper border ledger-border p-6 md:p-10 flex flex-col">
      <p className="ledger-eyebrow ledger-crimson">{r.eyebrow}</p>
      <h2 className="ledger-display text-[1.7rem] md:text-[2.1rem] mt-2 leading-tight">{r.title}</h2>
      <div className="mt-5 space-y-3 text-[16.5px] leading-relaxed">{r.body.map((p) => <p key={p}>{p}</p>)}</div>
      <p className="mt-5 text-[14px] italic ledger-muted">{r.who}</p>
      <ul className="mt-5 flex flex-wrap gap-2">{r.chips.map((c) => <li key={c} className="px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase border ledger-border ledger-muted">{c}</li>)}</ul>
      <div className="mt-8 md:mt-auto md:pt-8 flex flex-wrap gap-3">{cta}</div>
    </section>
  );
}

export default function WorkshopsPage() {
  const next = upcoming();
  const past = recordings();
  const dated = next.filter((s) => s.start);
  return (
    <>
      <SiteHeader overlay />
      <main id="main" className="pb-20">
        <header className="relative w-full h-[62svh] md:h-[72svh] min-h-[440px] max-h-[820px] overflow-hidden bg-ink text-white">
          <Image src={HERO.url} alt={HERO.alt} fill priority sizes="100vw" quality={90} className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0"><div className="max-w-ledger mx-auto px-5 md:px-10 pb-10 md:pb-14">
            <p className="ledger-eyebrow !text-white/80">{W.eyebrow}</p>
            <h1 className="ledger-display text-[2.6rem] md:text-[4.4rem] leading-none mt-3">{W.title}</h1>
            <p className="mt-4 text-[18px] md:text-[21px] text-white/90 max-w-2xl">{W.tagline}</p>
          </div></div>
        </header>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "House Sessions", path: PATH }]} /></div>
          <AnswerBlock>{W.answer}</AnswerBlock>

          <div className="mt-10 grid md:grid-cols-2 gap-6 items-stretch">
            <Route r={W.public} cta={<a href="#season" className="ledger-btn ledger-btn--solid">See the season ahead</a>} />
            <Route r={W.trade} cta={<><Link href="/for-advisors" className="ledger-btn">Enter the Advisor Desk</Link><Link href="/for-advisors" className="ledger-btn-ghost">Request advisor access</Link></>} />
          </div>

          <section id="season" aria-labelledby="season-h" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-28">
            <p className="ledger-eyebrow ledger-crimson">House Workshops · Everyone welcome</p>
            <h2 id="season-h" className="ledger-display text-[1.9rem] md:text-[2.6rem] mt-2">The Season Ahead</h2>
            <p className="mt-3 text-[16.5px] ledger-muted max-w-2xl">Live destination conversations with James, our hosts and our partners. Reserve a seat, ask your questions and get to know the place before you go.</p>
            {next.length ? (
              <div className="mt-8 grid md:grid-cols-3 gap-5">{next.map((s) => <div key={s.slug} id={s.slug} className="scroll-mt-28"><SessionCard s={s} /></div>)}</div>
            ) : (
              <div className="mt-8 grid md:grid-cols-[auto_1fr_auto] gap-6 items-center border ledger-border p-6 md:p-8">
                <span className="w-14 h-14 rounded-full border ledger-rule flex items-center justify-center ledger-crimson" aria-hidden="true"><CalendarClock className="w-6 h-6" strokeWidth={1.25} /></span>
                <div>
                  <p className="ledger-display text-[1.4rem] leading-snug">The next season is being scheduled.</p>
                  <p className="mt-1 text-[15.5px] ledger-muted max-w-2xl">Dates, times and hosts post here first. Each session links to the stay, ship or route it covers, and the recording follows.</p>
                </div>
                <form action="/travel-notes" className="flex gap-2 w-full md:w-auto">
                  <label htmlFor="ws-email" className="sr-only">Email address for new session dates</label>
                  <input id="ws-email" name="email" type="email" placeholder="Your email" className="flex-1 min-w-0 md:w-56 bg-paper border ledger-border px-3 py-2 text-[16px] outline-none focus:border-crimson" />
                  <button type="submit" className="ledger-btn">Tell me</button>
                </form>
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section aria-labelledby="rec-h" className="mt-16 border-t ledger-rule pt-8">
              <p className="ledger-eyebrow">Recordings</p>
              <h2 id="rec-h" className="ledger-display text-[1.7rem] md:text-[2.2rem] mt-2">Watch at Your Own Pace</h2>
              <div className="mt-8 grid md:grid-cols-3 gap-5">{past.map((s) => <SessionCard key={s.slug} s={s} />)}</div>
            </section>
          )}

          <section aria-labelledby="how-h" className="mt-16 md:mt-24 border-t ledger-rule pt-8">
            <p className="ledger-eyebrow ledger-crimson">How it works</p>
            <h2 id="how-h" className="ledger-display text-[1.7rem] md:text-[2.2rem] mt-2">What to Expect</h2>
            <dl className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {W.how.map(([t, b]) => <div key={t} className="border-t-2 border-crimson pt-4"><dt className="ledger-display text-[1.2rem]">{t}</dt><dd className="mt-2 text-[15px] leading-relaxed ledger-muted">{b}</dd></div>)}
            </dl>
          </section>

          <section aria-labelledby="wild-h" className="mt-16 border-t ledger-rule pt-8 grid md:grid-cols-[1fr_auto] gap-6 items-end">
            <div>
              <p className="ledger-eyebrow ledger-crimson">Planning calls</p>
              <h2 id="wild-h" className="ledger-display text-[1.6rem] md:text-[2rem] mt-2">The Wild Connection</h2>
              <p className="mt-3 text-[16px] leading-relaxed ledger-muted max-w-2xl">A session is for everyone. A planning call is just for you. Personally arranged conversations with the house keep their own name, and your advisor sets them up.</p>
            </div>
            <Link href="/plan" className="ledger-btn">Plan with James</Link>
          </section>

          <FaqBlock faqs={W.faqs} title="House Sessions, Answered" />
        </div>
      </main>
      <JsonLd data={graph(
        { "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: W.seoTitle, description: W.description, publisher: { "@id": ids.house }, ...(dated.length ? { mainEntity: { "@type": "ItemList", itemListElement: dated.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@id": absoluteUrl(`${PATH}#${s.slug}`) } })) } } : {}) },
        ...dated.map(eventSchema),
      )} />
    </>
  );
}
